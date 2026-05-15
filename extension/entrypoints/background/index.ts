import { runSessionSnapshot } from "../../lib/session-engine";
import { storageSet, storageGet, getLatestSession } from "../../lib/storage";
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
    const snap = await runSessionSnapshot();
    if (!snap) return { snapshot: null, error: "No trackable tabs found or API key missing." };
    await applyTabGroups(snap.groups);
    if (snap.todos?.length) await mergeAiTodos(snap.todos);
    await broadcastToAll("TABMIND_SESSION_UPDATED");
    return { snapshot: snap };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    captureError(err, { fn: "snapshotPipeline" });
    return { snapshot: null, error: msg };
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
  if (!snap) chrome.alarms.create(ALARM_SNAPSHOT, { periodInMinutes: 1.5 });
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
    chrome.alarms.create(ALARM_SNAPSHOT, { periodInMinutes: 1.5 });
    scheduleRolloverAlarm();
    try { chrome.idle?.setDetectionInterval?.(IDLE_RESET_MIN * 60); } catch { /* ignore */ }
  });

  chrome.runtime.onStartup.addListener(async () => {
    await storageSet("tabmind:session:startedAt", Date.now());
    await storageSet("tabmind:lastResumeAt", Date.now());
    chrome.alarms.create(ALARM_SNAPSHOT, { periodInMinutes: 1.5 });
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
  });
});
