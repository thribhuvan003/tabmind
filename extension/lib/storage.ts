import type { StorageSchema, AiProvider } from "./types";
import { DEFAULT_BLOCKLIST } from "./types";

type Key = keyof StorageSchema;

/** Routing table: which keys live in sync (cross-device) vs local (large/device-only). */
const AREA: Record<Key, "sync" | "local"> = {
  "tabmind:gemini:apiKey": "sync",
  "tabmind:openai:apiKey": "sync",
  "tabmind:provider": "sync",
  "tabmind:blocklist": "sync",
  "tabmind:notes": "sync",
  "tabmind:session:latest": "local",
  "tabmind:session:history": "local",
  "tabmind:tasks": "local",
  "tabmind:tasks:rollover": "local",
  "tabmind:widget:position": "local",
  "tabmind:widget:minimized": "local",
  "tabmind:session:startedAt": "local",
  "tabmind:lastResumeAt": "local",
};

function area(key: Key): chrome.storage.StorageArea {
  return AREA[key] === "sync" ? chrome.storage.sync : chrome.storage.local;
}

export async function storageGet<K extends Key>(key: K): Promise<StorageSchema[K] | undefined> {
  const result = await area(key).get(key);
  return result[key] as StorageSchema[K] | undefined;
}

export async function storageSet<K extends Key>(key: K, value: StorageSchema[K]): Promise<void> {
  await area(key).set({ [key]: value });
}

export async function storageRemove<K extends Key>(key: K): Promise<void> {
  await area(key).remove(key);
}

/* ─── notes ────────────────────────────────────────────── */

export async function getNote(normalizedUrl: string) {
  const notes = (await storageGet("tabmind:notes")) ?? {};
  return notes[normalizedUrl] ?? null;
}

export async function setNote(normalizedUrl: string, text: string) {
  const notes = (await storageGet("tabmind:notes")) ?? {};
  if (!text.trim()) {
    delete notes[normalizedUrl];
  } else {
    notes[normalizedUrl] = { url: normalizedUrl, text, updatedAt: Date.now() };
  }
  await storageSet("tabmind:notes", notes);
}

/* ─── sessions ─────────────────────────────────────────── */

export async function getLatestSession() {
  return (await storageGet("tabmind:session:latest")) ?? null;
}

export async function getSessionHistory() {
  return (await storageGet("tabmind:session:history")) ?? [];
}

export async function saveSession(snapshot: StorageSchema["tabmind:session:latest"]) {
  if (!snapshot) return;
  await storageSet("tabmind:session:latest", snapshot);
  const history = (await storageGet("tabmind:session:history")) ?? [];
  history.unshift(snapshot);
  await storageSet("tabmind:session:history", history.slice(0, 50));
}

/* ─── provider / keys ──────────────────────────────────── */

export async function getProvider(): Promise<AiProvider> {
  return (await storageGet("tabmind:provider")) ?? "gemini";
}

export async function getActiveApiKey(): Promise<{ provider: AiProvider; key: string }> {
  const provider = await getProvider();
  const key =
    provider === "openai"
      ? (await storageGet("tabmind:openai:apiKey")) ?? ""
      : (await storageGet("tabmind:gemini:apiKey")) ?? "";
  return { provider, key };
}

/* ─── blocklist ────────────────────────────────────────── */

export async function getBlocklist(): Promise<string[]> {
  const stored = await storageGet("tabmind:blocklist");
  return stored && stored.length ? stored : DEFAULT_BLOCKLIST;
}

export async function setBlocklist(list: string[]): Promise<void> {
  const cleaned = Array.from(new Set(list.map((s) => s.trim().toLowerCase()).filter(Boolean)));
  await storageSet("tabmind:blocklist", cleaned);
}

export function isBlocked(url: string, blocklist: string[]): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return blocklist.some((b) => host === b || host.endsWith("." + b));
  } catch {
    return false;
  }
}

/* ─── url helpers ──────────────────────────────────────── */

export function normalizeUrl(raw: string): string {
  try {
    const u = new URL(raw);
    return `${u.hostname}${u.pathname}`.replace(/\/$/, "");
  } catch {
    return raw;
  }
}
