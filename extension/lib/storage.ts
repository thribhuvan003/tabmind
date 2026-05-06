import type { StorageSchema } from "./types";

type Key = keyof StorageSchema;

export async function storageGet<K extends Key>(key: K): Promise<StorageSchema[K] | undefined> {
  const result = await chrome.storage.local.get(key);
  return result[key] as StorageSchema[K] | undefined;
}

export async function storageSet<K extends Key>(key: K, value: StorageSchema[K]): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

export async function getNote(normalizedUrl: string) {
  const notes = (await storageGet("tabmind:notes")) ?? {};
  return notes[normalizedUrl] ?? null;
}

export async function setNote(normalizedUrl: string, text: string) {
  const notes = (await storageGet("tabmind:notes")) ?? {};
  notes[normalizedUrl] = { url: normalizedUrl, text, updatedAt: Date.now() };
  await storageSet("tabmind:notes", notes);
}

export async function getLatestSession() {
  return (await storageGet("tabmind:session:latest")) ?? null;
}

export async function saveSession(snapshot: StorageSchema["tabmind:session:latest"]) {
  if (!snapshot) return;
  await storageSet("tabmind:session:latest", snapshot);
  const history = (await storageGet("tabmind:session:history")) ?? [];
  history.unshift(snapshot);
  await storageSet("tabmind:session:history", history.slice(0, 30));
}

export function normalizeUrl(raw: string): string {
  try {
    const u = new URL(raw);
    return `${u.hostname}${u.pathname}`.replace(/\/$/, "");
  } catch {
    return raw;
  }
}
