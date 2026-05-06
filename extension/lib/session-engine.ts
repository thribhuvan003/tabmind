import { saveSession, storageGet } from "./storage";
import { analyzeSession } from "./gemini";
import type { TabSnapshot, SessionSnapshot } from "./types";

const MAX_EXCERPT = 2000;

export async function captureTabExcerpts(): Promise<TabSnapshot[]> {
  const tabs = await chrome.tabs.query({});
  return tabs
    .filter((t) => t.id && t.url && !t.url.startsWith("chrome://"))
    .map((t) => ({
      id: t.id!,
      url: t.url!,
      title: t.title ?? "",
      excerpt: "",
      capturedAt: Date.now(),
    }));
}

export async function runSessionSnapshot(): Promise<SessionSnapshot | null> {
  const apiKey = (await storageGet("tabmind:gemini:apiKey")) ?? "";
  if (!apiKey) return null;

  const startedAt = (await storageGet("tabmind:session:startedAt")) ?? Date.now();
  const tabs = await captureTabExcerpts();
  if (tabs.length === 0) return null;

  const geminiInput = tabs.map((t) => ({
    title: t.title,
    url: t.url,
    excerpt: t.excerpt.slice(0, MAX_EXCERPT),
  }));

  const result = await analyzeSession(geminiInput, apiKey);

  const snapshot: SessionSnapshot = {
    id: crypto.randomUUID(),
    tabs,
    summary: result.summary,
    todos: result.todos,
    topic: result.topic,
    durationMs: Date.now() - startedAt,
    capturedAt: Date.now(),
  };

  await saveSession(snapshot);
  return snapshot;
}
