import { runSessionSnapshot } from "../../lib/session-engine";
import { storageSet, storageGet, getLatestSession, getActiveApiKey } from "../../lib/storage";
import { applyTabGroups } from "../../lib/tab-groups";
import { rolloverOverdueTasks, mergeAiTodos, msUntilMidnight } from "../../lib/tasks";
import { initSentry, captureError } from "../../lib/sentry";

initSentry("background");

const ALARM_SNAPSHOT = "tabmind:snapshot";
const ALARM_ROLLOVER = "tabmind:daily-rollover";
const IDLE_RESET_MIN = 5;

/** Push the freshest snapshot + task update to every open widget. */
async function broadcastToAll(type: string) {
  try {
    const tabs = await chrome.tabs.query({});
    for (const t of tabs) {
      if (!t.id) continue;
      chrome.tabs.sendMessage(t.id, { type }).catch(() => {});
    }
  } catch { /* no tabs — fine */ }
}

type PipelineResult = { snapshot: import("../../lib/types").SessionSnapshot | null; error?: string };

async function snapshotPipeline(): Promise<PipelineResult> {
  try {
    const { provider } = await getActiveApiKey();
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
      grok: "console.groq.com/keys",
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
        friendly = `Rate limit hit (429) on ${provider}. TabMind will retry in 3 minutes — or switch to Cerebras/Groq for higher free limits.`;
      }
    } else if (raw.includes("401") || raw.includes("403") || raw.includes("API_KEY_INVALID") || raw.includes("Invalid") || raw.includes("Unauthorized")) {
      friendly = `Invalid API key for ${provider}. Re-paste your key in Settings → ${link}`;
    } else if (raw.includes("404")) {
      friendly = `Model not found (404) on ${provider}. Try saving your key again.`;
    }

    return { snapshot: null, error: friendly };
  }
}

async function goalBreakdownPipeline(goalText: string): Promise<{ tasks: string[] }> {
  if (!goalText.trim()) return { tasks: [] };
  try {
    const { provider, key } = await getActiveApiKey();
    if (!key) return { tasks: [] };
    const prompt = `Break down this goal into exactly 5 concrete, actionable tasks (each doable in under 2 hours). Be specific. Return JSON only.\nGoal: "${goalText}"\nFormat: {"tasks": ["Task 1", "Task 2", "Task 3", "Task 4", "Task 5"]}`;
    let raw = "{}";
    if (provider === "grok") {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` }, body: JSON.stringify({ model: "llama-3.3-70b-versatile", temperature: 0.5, max_tokens: 400, response_format: { type: "json_object" }, messages: [{ role: "user", content: prompt }] }) });
      raw = (await r.json())?.choices?.[0]?.message?.content ?? "{}";
    } else if (provider === "claude") {
      const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 400, messages: [{ role: "user", content: prompt }] }) });
      raw = (await r.json())?.content?.[0]?.text ?? "{}";
    } else if (provider === "gemini") {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.5, maxOutputTokens: 400, responseMimeType: "application/json" } }) });
      raw = (await r.json())?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    } else if (provider === "openrouter") {
      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "HTTP-Referer": "https://github.com/thribhuvan003/tabmind", "X-Title": "TabMind" }, body: JSON.stringify({ model: "meta-llama/llama-3.3-70b-instruct:free", temperature: 0.5, max_tokens: 400, response_format: { type: "json_object" }, messages: [{ role: "user", content: prompt }] }) });
      raw = (await r.json())?.choices?.[0]?.message?.content ?? "{}";
    } else if (provider === "cerebras") {
      const r = await fetch("https://api.cerebras.ai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` }, body: JSON.stringify({ model: "llama-3.3-70b", temperature: 0.5, max_tokens: 400, response_format: { type: "json_object" }, messages: [{ role: "user", content: prompt }] }) });
      raw = (await r.json())?.choices?.[0]?.message?.content ?? "{}";
    } else {
      const r = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` }, body: JSON.stringify({ model: "gpt-4o-mini", temperature: 0.5, max_tokens: 400, response_format: { type: "json_object" }, messages: [{ role: "user", content: prompt }] }) });
      raw = (await r.json())?.choices?.[0]?.message?.content ?? "{}";
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
  if (!snap) chrome.alarms.create(ALARM_SNAPSHOT, { periodInMinutes: 3 });
  const roll = await chrome.alarms.get(ALARM_ROLLOVER);
  if (!roll) scheduleRolloverAlarm();
}

async function ensureSessionStart() {
  const started = await storageGet("tabmind:session:startedAt");
  if (!started) await storageSet("tabmind:session:startedAt", Date.now());
}

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(async () => {
    await storageSet("tabmind:session:startedAt", Date.now());
    chrome.alarms.create(ALARM_SNAPSHOT, { periodInMinutes: 3 });
    scheduleRolloverAlarm();
    try { chrome.idle?.setDetectionInterval?.(IDLE_RESET_MIN * 60); } catch { /* ignore */ }
  });

  chrome.runtime.onStartup.addListener(async () => {
    await storageSet("tabmind:session:startedAt", Date.now());
    await storageSet("tabmind:lastResumeAt", Date.now());
    chrome.alarms.create(ALARM_SNAPSHOT, { periodInMinutes: 3 });
    scheduleRolloverAlarm();
    // Check for rollover tasks on browser start (handles overnight).
    await doRollover();
    snapshotPipeline();
  });

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === ALARM_SNAPSHOT) {
      await ensureSessionStart();
      snapshotPipeline();
    } else if (alarm.name === ALARM_ROLLOVER) {
      await doRollover();
    }
  });

  // Idle reset: 5+ min idle → next "active" event starts a fresh session.
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

  // ⌘⇧K / Ctrl+Shift+K — toggle widget on active tab.
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
      try { chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") }); } catch { /* ignore */ }
      sendResponse({ ok: true });
      return true;
    }
  });
});
