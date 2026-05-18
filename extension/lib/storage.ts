import type { StorageSchema, AiProvider, GlobalNote, Goal } from "./types";
import { DEFAULT_BLOCKLIST } from "./types";

type Key = keyof StorageSchema;

/** Routing table: which keys live in sync (cross-device) vs local (large/device-only). */
const AREA: Record<Key, "sync" | "local"> = {
  "tabmind:grok:apiKey": "sync",
  "tabmind:gemini:apiKey": "sync",
  "tabmind:openai:apiKey": "sync",
  "tabmind:claude:apiKey": "sync",
  "tabmind:openrouter:apiKey": "sync",
  "tabmind:cerebras:apiKey": "sync",
  "tabmind:provider": "sync",
  "tabmind:blocklist": "sync",
  "tabmind:notes": "local",
  "tabmind:session:latest": "local",
  "tabmind:session:history": "local",
  "tabmind:tasks": "local",
  "tabmind:tasks:rollover": "local",
  "tabmind:widget:position": "local",
  "tabmind:widget:minimized": "local",
  "tabmind:session:startedAt": "local",
  "tabmind:lastResumeAt": "local",
  "tabmind:notes:global": "local",
  "tabmind:goals": "local",
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

/* --- notes ---------------------------------------------- */

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

/* --- sessions ------------------------------------------- */

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

/* --- provider / keys ------------------------------------ */

export async function getProvider(): Promise<AiProvider> {
  return (await storageGet("tabmind:provider")) ?? "grok";
}

export async function getActiveApiKey(): Promise<{ provider: AiProvider; key: string }> {
  const provider = await getProvider();
  let key = "";
  if (provider === "grok") {
    key = (await storageGet("tabmind:grok:apiKey")) ?? "";
  } else if (provider === "openai") {
    key = (await storageGet("tabmind:openai:apiKey")) ?? "";
  } else if (provider === "claude") {
    key = (await storageGet("tabmind:claude:apiKey")) ?? "";
  } else if (provider === "openrouter") {
    key = (await storageGet("tabmind:openrouter:apiKey")) ?? "";
  } else if (provider === "cerebras") {
    key = (await storageGet("tabmind:cerebras:apiKey")) ?? "";
  } else {
    key = (await storageGet("tabmind:gemini:apiKey")) ?? "";
  }
  return { provider, key };
}

/* --- blocklist ------------------------------------------ */

export async function getBlocklist(): Promise<string[]> {
  const stored = await storageGet("tabmind:blocklist");
  return stored && stored.length ? stored : DEFAULT_BLOCKLIST;
}

export async function setBlocklist(list: string[]): Promise<void> {
  const cleaned = Array.from(new Set(list.map((s) => s.trim().toLowerCase()).filter(Boolean)));
  await storageSet("tabmind:blocklist", cleaned);
}

/* --- global notes ------------------------------------------- */

const GLOBAL_NOTES_CAP = 100;

export async function getGlobalNotes(): Promise<GlobalNote[]> {
  return (await storageGet("tabmind:notes:global")) ?? [];
}

export async function addGlobalNote(text: string, category?: GlobalNote["category"]): Promise<GlobalNote> {
  const note: GlobalNote = {
    id: crypto.randomUUID(),
    text: text.trim(),
    createdAt: Date.now(),
    pinned: false,
    ...(category ? { category } : {}),
  };
  const notes = await getGlobalNotes();
  const updated = [note, ...notes].slice(0, GLOBAL_NOTES_CAP);
  await storageSet("tabmind:notes:global", updated);
  return note;
}

export async function deleteGlobalNote(id: string): Promise<void> {
  const notes = await getGlobalNotes();
  await storageSet("tabmind:notes:global", notes.filter((n) => n.id !== id));
}

export async function pinGlobalNote(id: string, pinned: boolean): Promise<void> {
  const notes = await getGlobalNotes();
  await storageSet(
    "tabmind:notes:global",
    notes.map((n) => (n.id === id ? { ...n, pinned } : n)),
  );
}

export function isBlocked(url: string, blocklist: string[]): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return blocklist.some((b) => host === b || host.endsWith("." + b));
  } catch {
    return false;
  }
}

/* --- goals ----------------------------------------------- */

export async function getGoals(): Promise<Goal[]> {
  return (await storageGet("tabmind:goals")) ?? [];
}

export async function saveGoals(goals: Goal[]): Promise<void> {
  await storageSet("tabmind:goals", goals);
}

export async function addGoal(title: string): Promise<Goal> {
  const goal: Goal = { id: crypto.randomUUID(), title: title.trim(), createdAt: Date.now(), tasks: [] };
  const goals = await getGoals();
  await saveGoals([goal, ...goals.slice(0, 19)]);
  return goal;
}

export async function updateGoal(id: string, patch: Partial<Goal>): Promise<void> {
  const goals = await getGoals();
  await saveGoals(goals.map((g) => (g.id === id ? { ...g, ...patch } : g)));
}

export async function deleteGoal(id: string): Promise<void> {
  const goals = await getGoals();
  await saveGoals(goals.filter((g) => g.id !== id));
}

/* --- url helpers ---------------------------------------- */

/* --- one-time migration: move per-URL notes from sync to local --- */
export async function migrateNotesIfNeeded(): Promise<void> {
  try {
    const done = await chrome.storage.local.get("tabmind:migration:notes-v1");
    if (done["tabmind:migration:notes-v1"]) return;
    const syncData = await chrome.storage.sync.get("tabmind:notes");
    if (syncData["tabmind:notes"]) {
      await chrome.storage.local.set({ "tabmind:notes": syncData["tabmind:notes"] });
      await chrome.storage.sync.remove("tabmind:notes");
    }
    await chrome.storage.local.set({ "tabmind:migration:notes-v1": true });
  } catch { /* best-effort */ }
}

export function normalizeUrl(raw: string): string {
  try {
    const u = new URL(raw);
    return `${u.hostname}${u.pathname}`.replace(/\/$/, "");
  } catch {
    return raw;
  }
}
