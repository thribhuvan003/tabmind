import { runSessionSnapshot } from "../../lib/session-engine";
import { storageSet } from "../../lib/storage";

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(async () => {
    await storageSet("tabmind:session:startedAt", Date.now());
    chrome.alarms.create("tabmind:snapshot", { periodInMinutes: 1.5 });
  });

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== "tabmind:snapshot") return;
    try {
      await runSessionSnapshot();
    } catch (err) {
      console.error("[TabMind] snapshot error:", err);
    }
  });

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === "TABMIND_SNAPSHOT_NOW") {
      runSessionSnapshot().then(sendResponse).catch(() => sendResponse(null));
      return true;
    }
  });
});
