import { runSessionSnapshot } from "../../lib/session-engine";
import { storageSet, storageGet, getLatestSession } from "../../lib/storage";
import { applyTabGroups } from "../../lib/tab-groups";

const ALARM = "tabmind:snapshot";
const IDLE_RESET_MIN = 5; // minutes idle → start a new session

/** Push the freshest snapshot to every open widget so they refresh silently. */
async function broadcastSessionUpdate() {
  try {
    const tabs = await chrome.tabs.query({});
    for (const t of tabs) {
      if (!t.id) continue;
      chrome.tabs.sendMessage(t.id, { type: "TABMIND_SESSION_UPDATED" }).catch(() => {});
    }
  } catch {
    /* no tabs queried — fine */
  }
}

async function snapshotPipeline() {
  try {
    const snap = await runSessionSnapshot();
    if (!snap) return null;
    await applyTabGroups(snap.groups);
    await broadcastSessionUpdate();
    return snap;
  } catch (err) {
    console.error("[TabMind] snapshot error:", err);
    return null;
  }
}

async function ensureSessionStart() {
  const started = await storageGet("tabmind:session:startedAt");
  if (!started) await storageSet("tabmind:session:startedAt", Date.now());
}

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(async () => {
    await storageSet("tabmind:session:startedAt", Date.now());
    chrome.alarms.create(ALARM, { periodInMinutes: 1.5 });
    // Best-effort idle detection — extension may not have permission on all builds.
    try {
      chrome.idle?.setDetectionInterval?.(IDLE_RESET_MIN * 60);
    } catch {
      /* ignore */
    }
  });

  chrome.runtime.onStartup.addListener(async () => {
    // New browser launch = fresh session and a hello-back notification.
    await storageSet("tabmind:session:startedAt", Date.now());
    await storageSet("tabmind:lastResumeAt", Date.now());
    chrome.alarms.create(ALARM, { periodInMinutes: 1.5 });
    snapshotPipeline();
  });

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== ALARM) return;
    await ensureSessionStart();
    snapshotPipeline();
  });

  // Idle reset: 5+ min idle → next "active" event starts a new session.
  try {
    chrome.idle?.onStateChanged?.addListener(async (state) => {
      if (state === "active") {
        const last = (await storageGet("tabmind:lastResumeAt")) ?? 0;
        const idleMs = Date.now() - last;
        if (idleMs > IDLE_RESET_MIN * 60_000) {
          await storageSet("tabmind:session:startedAt", Date.now());
        }
        await storageSet("tabmind:lastResumeAt", Date.now());
      }
    });
  } catch {
    /* idle perm not granted — silent fallback */
  }

  // ⌘⇧K — toggle widget on the active tab.
  try {
    chrome.commands?.onCommand.addListener((command) => {
      if (command !== "tabmind-toggle") return;
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const id = tabs[0]?.id;
        if (id != null) chrome.tabs.sendMessage(id, { type: "TABMIND_TOGGLE_WIDGET" }).catch(() => {});
      });
    });
  } catch {
    /* commands API unavailable */
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === "TABMIND_SNAPSHOT_NOW") {
      snapshotPipeline().then(sendResponse).catch(() => sendResponse(null));
      return true;
    }
    if (msg?.type === "TABMIND_GET_LATEST") {
      getLatestSession().then(sendResponse).catch(() => sendResponse(null));
      return true;
    }
    if (msg?.type === "TABMIND_OPEN_WIDGET_ACTIVE") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const id = tabs[0]?.id;
        if (id != null) {
          chrome.tabs.sendMessage(id, { type: "TABMIND_OPEN_WIDGET" }).catch(() => {});
        }
        sendResponse({ ok: id != null });
      });
      return true;
    }
  });
});
