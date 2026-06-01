import { runSessionSnapshot } from "../../lib/session-engine";
import { completePrompt } from "../../lib/ai";
import { storageSet, storageGet, getLatestSession, getActiveApiKey, migrateNotesIfNeeded } from "../../lib/storage";
import { applyTabGroups } from "../../lib/tab-groups";
import { rolloverOverdueTasks, mergeAiTodos, msUntilMidnight } from "../../lib/tasks";
import { initSentry, captureError } from "../../lib/sentry";

initSentry("background");

const ALARM_SNAPSHOT = "tabmind:snapshot";
const ALARM_ROLLOVER = "tabmind:daily-rollover";
const SNAPSHOT_INTERVAL_MINUTES = 1.5;
const IDLE_RESET_MIN = 5;

/** Push the freshest snapshot + task update to every open widget. */
async function broadcastToAll(type: string) {
  try {
    const tabs = await chrome.tabs.query({});
    for (const t of tabs) {
      if (!t.id) continue;
      chrome.tabs.sendMessage(t.id, { type }).catch(() => {});
    }
  } catch { /* no tabs - fine */ }
}

type PipelineResult = { snapshot: import("../../lib/types").SessionSnapshot | null; error?: string };

/** Guard against overlapping snapshots: a slow AI call (>90s) must not let the
 *  next alarm start a second concurrent run (double cost, racing tab-group writes). */
let snapshotInFlight = false;

async function snapshotPipeline(): Promise<PipelineResult> {
  if (snapshotInFlight) return { snapshot: null, error: "A snapshot is already running." };
  snapshotInFlight = true;
  try {
    const snap = await runSessionSnapshot();
    if (!snap) return { snapshot: null, error: "No trackable tabs found or API key missing." };
    await applyTabGroups(snap.groups);
    if (snap.todos?.length) await mergeAiTodos(snap.todos);
    await broadcastToAll("TABMIND_SESSION_UPDATED");
    return { snapshot: snap };
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    captureError(err, { fn: "snapshotPipeline" });

    // Read provider for targeted error links
    const { provider } = await getActiveApiKey().catch(() => ({ provider: "grok" as const }));

    const keyLinks: Record<string, string> = {
      openrouter: "openrouter.ai/keys",
      cerebras: "cloud.cerebras.ai/platform/api-keys",
      grok: "console.x.ai or console.groq.com/keys",
      claude: "console.anthropic.com/settings/keys",
      gemini: "aistudio.google.com/apikey",
      openai: "platform.openai.com/api-keys",
    };
    const link = keyLinks[provider] ?? "openrouter.ai/keys";

    let friendly = raw;
    if (raw.includes("429") || raw.includes("RESOURCE_EXHAUSTED") || raw.includes("rate") || raw.includes("Rate")) {
      if (raw.includes("free_tier") || raw.includes("limit: 0")) {
        friendly = "API key quota is 0. Create a new project or upgrade your plan at " + link;
      } else {
        friendly = `Rate limit hit (429) on ${provider}. TabMind will retry in 90 seconds, or switch to Cerebras/OpenRouter if you need higher free limits.`;
      }
    } else if (raw.includes("401") || raw.includes("403") || raw.includes("API_KEY_INVALID") || raw.includes("Invalid") || raw.includes("Unauthorized")) {
      friendly = `Invalid API key for ${provider}. Re-paste your key in Settings -> ${link}`;
    } else if (raw.includes("404")) {
      friendly = `Model not found (404) on ${provider}. Try saving your key again.`;
    }

    return { snapshot: null, error: friendly };
  } finally {
    snapshotInFlight = false;
  }
}

async function goalBreakdownPipeline(goalText: string): Promise<{ tasks: string[] }> {
  if (!goalText.trim()) return { tasks: [] };
  try {
    const { provider, key } = await getActiveApiKey();
    if (!key) return { tasks: [] };
    const prompt = `Break down this goal into exactly 5 concrete, actionable tasks (each doable in under 2 hours). Be specific. Return JSON only.\nGoal: "${goalText}"\nFormat: {"tasks": ["Task 1", "Task 2", "Task 3", "Task 4", "Task 5"]}`;

    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 20_000);
    let raw: string;
    try {
      raw = await completePrompt(provider, key, prompt, ac.signal);
    } finally {
      clearTimeout(timer);
    }

    const parsed = JSON.parse(raw);
    const tasks = Array.isArray(parsed.tasks) ? parsed.tasks.filter((t: unknown) => typeof t === "string") : [];
    return { tasks: tasks.slice(0, 7) };
  } catch {
    return { tasks: [] };
  }
}

async function doRollover() {
  try {
    const count = await rolloverOverdueTasks();
    if (count > 0) await broadcastToAll("TABMIND_TASKS_UPDATED");
  } catch (err) {
    captureError(err, { fn: "doRollover" });
  }
}

function scheduleRolloverAlarm() {
  // Fire at next midnight, repeat every 24 h.
  const delayMs = msUntilMidnight();
  chrome.alarms.create(ALARM_ROLLOVER, {
    when: Date.now() + delayMs,
    periodInMinutes: 24 * 60,
  });
}

async function ensureAlarms() {
  const snap = await chrome.alarms.get(ALARM_SNAPSHOT);
  if (!snap) chrome.alarms.create(ALARM_SNAPSHOT, { periodInMinutes: SNAPSHOT_INTERVAL_MINUTES });
  const roll = await chrome.alarms.get(ALARM_ROLLOVER);
  if (!roll) scheduleRolloverAlarm();
}

async function ensureSessionStart() {
  const started = await storageGet("tabmind:session:startedAt");
  if (!started) await storageSet("tabmind:session:startedAt", Date.now());
}

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(async (details) => {
    await migrateNotesIfNeeded();
    await storageSet("tabmind:session:startedAt", Date.now());
    chrome.alarms.create(ALARM_SNAPSHOT, { periodInMinutes: SNAPSHOT_INTERVAL_MINUTES });
    scheduleRolloverAlarm();
    try { chrome.idle?.setDetectionInterval?.(IDLE_RESET_MIN * 60); } catch { /* ignore */ }

    // First run: start as the minimized orb (not the full panel on every page)
    // and open Settings so the user can add an API key.
    if (details?.reason === "install") {
      await storageSet("tabmind:widget:minimized", true);
      try { chrome.runtime.openOptionsPage(); } catch { /* ignore */ }
    }
  });

  chrome.runtime.onStartup.addListener(async () => {
    await storageSet("tabmind:session:startedAt", Date.now());
    await storageSet("tabmind:lastResumeAt", Date.now());
    chrome.alarms.create(ALARM_SNAPSHOT, { periodInMinutes: SNAPSHOT_INTERVAL_MINUTES });
    scheduleRolloverAlarm();
    // Check for rollover tasks on browser start (handles overnight).
    await doRollover();
    snapshotPipeline().catch(() => {});
  });

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === ALARM_SNAPSHOT) {
      await ensureSessionStart();
      snapshotPipeline();
    } else if (alarm.name === ALARM_ROLLOVER) {
      await doRollover();
    }
  });

  // Idle reset: 5+ min idle -> next "active" event starts a fresh session.
  try {
    chrome.idle?.onStateChanged?.addListener(async (state) => {
      if (state === "active") {
        const last = (await storageGet("tabmind:lastResumeAt")) ?? 0;
        if (Date.now() - last > IDLE_RESET_MIN * 60_000) {
          await storageSet("tabmind:session:startedAt", Date.now());
        }
        await storageSet("tabmind:lastResumeAt", Date.now());
      }
    });
  } catch { /* idle perm not granted */ }

  // Cmd+Shift+K / Ctrl+Shift+K - toggle widget on active tab.
  try {
    chrome.commands?.onCommand.addListener((command) => {
      if (command !== "tabmind-toggle") return;
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const id = tabs[0]?.id;
        if (id != null) chrome.tabs.sendMessage(id, { type: "TABMIND_TOGGLE_WIDGET" }).catch(() => {});
      });
    });
  } catch { /* commands API unavailable */ }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    // Health-check alarms on every message (service workers can restart without onInstalled)
    ensureAlarms().catch(() => {});
    if (msg?.type === "TABMIND_SNAPSHOT_NOW") {
      snapshotPipeline().then(sendResponse).catch(() => sendResponse(null));
      return true;
    }
    if (msg?.type === "TABMIND_GET_LATEST") {
      getLatestSession().then(sendResponse).catch(() => sendResponse(null));
      return true;
    }
    if (msg?.type === "TABMIND_OPEN_OPTIONS") {
      try { chrome.runtime.openOptionsPage(); } catch { /* ignore */ }
      sendResponse({ ok: true });
      return true;
    }
    if (msg?.type === "TABMIND_OPEN_WIDGET_ACTIVE") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const id = tabs[0]?.id;
        if (id != null) chrome.tabs.sendMessage(id, { type: "TABMIND_OPEN_WIDGET" }).catch(() => {});
        sendResponse({ ok: id != null });
      });
      return true;
    }
    if (msg?.type === "TABMIND_GOAL_BREAKDOWN") {
      goalBreakdownPipeline(msg.goalText ?? "").then(sendResponse).catch(() => sendResponse({ tasks: [] }));
      return true;
    }
    if (msg?.type === "TABMIND_OPEN_DASHBOARD") {
      (async () => {
        try {
          const dashUrl = chrome.runtime.getURL("dashboard.html");
          const existing = await chrome.tabs.query({ url: dashUrl });
          if (existing.length > 0 && existing[0].id != null) {
            chrome.tabs.update(existing[0].id, { active: true });
          } else {
            chrome.tabs.create({ url: dashUrl });
          }
        } catch { /* ignore */ }
        sendResponse({ ok: true });
      })();
      return true;
    }
  });
});
