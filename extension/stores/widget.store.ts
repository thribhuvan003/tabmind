import { create } from "zustand";
import type { SessionSnapshot, UrlNote, UserTask } from "../lib/types";
import {
  getLatestSession,
  getNote,
  setNote,
  normalizeUrl,
  storageGet,
  storageSet,
} from "../lib/storage";
import {
  getTasks,
  addTask as dbAddTask,
  updateTask,
  deleteTask as dbDeleteTask,
  completeTask as dbCompleteTask,
  getTodayTasks,
  getSomedayTasks,
  getRolloverCount,
  todayISO,
} from "../lib/tasks";

interface WidgetState {
  /* ui */
  minimized: boolean;
  position: { x: number; y: number };
  hydrated: boolean;
  loading: boolean;

  /* session */
  session: SessionSnapshot | null;

  /* notes */
  note: UrlNote | null;
  currentUrl: string;

  /* tasks */
  tasks: UserTask[];
  rolloverCount: number;

  /* actions */
  setMinimized: (v: boolean) => void;
  setPosition: (pos: { x: number; y: number }) => void;
  loadSession: () => Promise<void>;
  loadNote: (url: string) => Promise<void>;
  saveNote: (text: string) => Promise<void>;
  requestSnapshot: () => Promise<void>;
  hydrate: () => Promise<void>;
  loadTasks: () => Promise<void>;
  addTask: (text: string, dueDate?: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  scheduleTask: (id: string, dueDate: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

const DEFAULT_POS = () => ({
  x: typeof window !== "undefined" ? Math.max(0, window.innerWidth - 380) : 24,
  y: 96,
});

function clampToViewport(pos: { x: number; y: number }) {
  if (typeof window === "undefined") return pos;
  return {
    x: Math.max(8, Math.min(window.innerWidth - 368, pos.x)),
    y: Math.max(8, Math.min(window.innerHeight - 88, pos.y)),
  };
}

export const useWidgetStore = create<WidgetState>((set, get) => ({
  minimized: false,
  position: DEFAULT_POS(),
  hydrated: false,
  loading: false,
  session: null,
  note: null,
  currentUrl: typeof window !== "undefined" ? window.location.href : "",
  tasks: [],
  rolloverCount: 0,

  setMinimized: (v) => {
    set({ minimized: v });
    storageSet("tabmind:widget:minimized", v).catch(() => {});
  },

  setPosition: (pos) => {
    const clamped = clampToViewport(pos);
    set({ position: clamped });
    storageSet("tabmind:widget:position", clamped).catch(() => {});
  },

  loadSession: async () => {
    const session = await getLatestSession();
    set({ session });
  },

  loadNote: async (url) => {
    const key = normalizeUrl(url);
    const note = await getNote(key);
    set({ note, currentUrl: url });
  },

  saveNote: async (text) => {
    const key = normalizeUrl(get().currentUrl);
    await setNote(key, text);
    const note = await getNote(key);
    set({ note });
  },

  requestSnapshot: async () => {
    set({ loading: true });
    try {
      const result: SessionSnapshot | null = await chrome.runtime.sendMessage({
        type: "TABMIND_SNAPSHOT_NOW",
      });
      if (result) set({ session: result });
      // Re-load tasks after snapshot (AI may have merged new todos).
      await get().loadTasks();
    } catch { /* extension context may not be ready */ }
    finally { set({ loading: false }); }
  },

  hydrate: async () => {
    if (get().hydrated) return;
    const [pos, min, session, tasks] = await Promise.all([
      storageGet("tabmind:widget:position"),
      storageGet("tabmind:widget:minimized"),
      getLatestSession(),
      getTasks(),
    ]);
    set({
      position: pos ? clampToViewport(pos) : DEFAULT_POS(),
      minimized: Boolean(min),
      session,
      tasks,
      rolloverCount: getRolloverCount(tasks),
      hydrated: true,
    });
  },

  loadTasks: async () => {
    const tasks = await getTasks();
    set({ tasks, rolloverCount: getRolloverCount(tasks) });
  },

  addTask: async (text, dueDate) => {
    await dbAddTask({
      text,
      dueDate: dueDate ?? todayISO(),
      status: "pending",
      isAiGenerated: false,
    });
    await get().loadTasks();
  },

  completeTask: async (id) => {
    await dbCompleteTask(id);
    await get().loadTasks();
  },

  scheduleTask: async (id, dueDate) => {
    await updateTask(id, { dueDate, rolledOverFrom: undefined });
    await get().loadTasks();
  },

  deleteTask: async (id) => {
    await dbDeleteTask(id);
    await get().loadTasks();
  },
}));
