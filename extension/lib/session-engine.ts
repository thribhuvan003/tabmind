import {
  saveSession,
  storageGet,
  getActiveApiKey,
  getBlocklist,
  isBlocked,
} from "./storage";
import { analyzeSession } from "./ai";
import type { TabSnapshot, SessionSnapshot } from "./types";

const MAX_EXCERPT = 4000;
const EXCERPT_TIMEOUT_MS = 1500;

const SKIP_PROTOCOLS = ["chrome://", "chrome-extension://", "edge://", "about:", "file://"];

function isTrackableTab(t: chrome.tabs.Tab): t is chrome.tabs.Tab & { id: number; url: string } {
  if (!t.id || !t.url) return false;
  return !SKIP_PROTOCOLS.some((p) => t.url!.startsWith(p));
}

/** Ask a tab's content script for an excerpt; resolves to "" on any failure. */
async function fetchExcerpt(tabId: number): Promise<string> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v: string) => {
      if (done) return;
      done = true;
      resolve(v);
    };
    const timer = setTimeout(() => finish(""), EXCERPT_TIMEOUT_MS);
    try {
      chrome.tabs.sendMessage(tabId, { type: "TABMIND_GET_EXCERPT" }, (resp) => {
        clearTimeout(timer);
        if (chrome.runtime.lastError) return finish("");
        finish(typeof resp?.text === "string" ? resp.text.slice(0, MAX_EXCERPT) : "");
      });
    } catch {
      clearTimeout(timer);
      finish("");
    }
  });
}

export async function captureTabExcerpts(): Promise<TabSnapshot[]> {
  const rawTabs = await chrome.tabs.query({});
  const blocklist = await getBlocklist();
  const trackable = rawTabs.filter(isTrackableTab);

  const out = await Promise.all(
    trackable.map(async (t) => {
      const blocked = isBlocked(t.url, blocklist);
      const excerpt = blocked ? "" : await fetchExcerpt(t.id);
      return {
        id: t.id,
        url: t.url,
        title: t.title ?? "",
        excerpt,
        capturedAt: Date.now(),
      } satisfies TabSnapshot;
    })
  );

  return out;
}

export async function runSessionSnapshot(): Promise<SessionSnapshot | null> {
  const { provider, key } = await getActiveApiKey();
  if (!key) return null;

  const startedAt = (await storageGet("tabmind:session:startedAt")) ?? Date.now();
  const tabs = await captureTabExcerpts();
  if (tabs.length === 0) return null;

  const sessionMinutes = Math.max(1, Math.round((Date.now() - startedAt) / 60_000));

  const aiInput = tabs.map((t) => ({
    id: t.id,
    title: t.title,
    url: t.url,
    excerpt: t.excerpt,
  }));

  const result = await analyzeSession(provider, key, aiInput, sessionMinutes);

  // attach group labels back to tabs for UI display
  const idToGroup = new Map<number, string>();
  for (const g of result.groups) {
    for (const id of g.tabIds) idToGroup.set(id, g.label);
  }
  const tabsWithGroups = tabs.map((t) => ({ ...t, groupLabel: idToGroup.get(t.id) }));

  const snapshot: SessionSnapshot = {
    id: crypto.randomUUID(),
    tabs: tabsWithGroups,
    summary: result.summary,
    narrative: result.narrative,
    topic: result.topic,
    todos: result.todos,
    groups: result.groups,
    continueHint: result.continueHint,
    durationMs: Date.now() - startedAt,
    capturedAt: Date.now(),
  };

  await saveSession(snapshot);
  return snapshot;
}
