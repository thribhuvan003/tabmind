import { create } from "zustand";
import type { SessionSnapshot, UrlNote, UserTask, GlobalNote, Goal, TaskCategory, NoteCategory } from "../lib/types";

/** Retry chrome.runtime.sendMessage up to 3 times - MV3 service workers go to sleep. */
async function sendMsg(msg: object, retries = 3): Promise<unknown> {
  let last: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await chrome.runtime.sendMessage(msg);
    } catch (e) {
      last = e;
      if (i < retries - 1) await new Promise(r => setTimeout(r, 700));
    }
  }
  throw last;
}
import {
  getLatestSession,
  getNote,
  setNote,
  normalizeUrl,
  storageGet,
  storageSet,
  getActiveApiKey,
  getGlobalNotes,
  addGlobalNote as dbAddGlobalNote,
  deleteGlobalNote as dbDeleteGlobalNote,
  pinGlobalNote as dbPinGlobalNote,
  getGoals,
  addGoal as dbAddGoal,
  updateGoal,
  deleteGoal as dbDeleteGoal,
} from "../lib/storage";
import {
  getTasks,
  addTask as dbAddTask,
  updateTask,
  deleteTask as dbDeleteTask,
  completeTask as dbCompleteTask,
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
  hasApiKey: boolean;
  /* notes */
  note: UrlNote | null;
  currentUrl: string;
  globalNotes: GlobalNote[];
  /* tasks */
  tasks: UserTask[];
  rolloverCount: number;
  error: string | null;
  /* goals */
  goals: Goal[];
  checkApiKey: () => Promise<void>;
  /* actions */
  setMinimized: (v: boolean) => void;
  setPosition: (pos: { x: number; y: number }) => void;
  persistPosition: () => void;
  loadSession: () => Promise<void>;
  loadNote: (url: string) => Promise<void>;
  saveNote: (text: string) => Promise<void>;
  requestSnapshot: () => Promise<void>;
  hydrate: () => Promise<void>;
  loadTasks: () => Promise<void>;
  addTask: (text: string, dueDate?: string, category?: TaskCategory, estimatedMinutes?: number) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  scheduleTask: (id: string, dueDate: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addGlobalNote: (text: string, category?: NoteCategory) => Promise<void>;
  deleteGlobalNote: (id: string) => Promise<void>;
  pinGlobalNote: (id: string, pinned: boolean) => Promise<void>;
  loadGoals: () => Promise<void>;
  addGoal: (title: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  setGoalTasks: (goalId: string, tasks: import("../lib/types").GoalTask[]) => Promise<void>;
  toggleGoalTask: (goalId: string, taskId: string) => Promise<void>;
}

const W_WIDTH = 420;
const DEFAULT_POS = () => ({
  x: typeof window !== "undefined" ? Math.max(8, window.innerWidth - W_WIDTH - 20) : 24,
  y: 96,
});

function clampToViewport(pos: { x: number; y: number }) {
  if (typeof window === "undefined") return pos;
  return {
    x: Math.max(8, Math.min(window.innerWidth - W_WIDTH - 8, pos.x)),
    y: Math.max(8, Math.min(window.innerHeight - 88, pos.y)),
  };
}

export const useWidgetStore = create<WidgetState>((set, get) => ({
  minimized: false,
  position: DEFAULT_POS(),
  hydrated: false,
  loading: false,
  session: null,
  hasApiKey: false,
  note: null,
  currentUrl: typeof window !== "undefined" ? window.location.href : "",
  globalNotes: [],
  tasks: [],
  rolloverCount: 0,
  error: null,
  goals: [],

  setMinimized: (v) => {
    set({ minimized: v });
    storageSet("tabmind:widget:minimized", v).catch(() => {});
  },

  setPosition: (pos) => {
    const clamped = clampToViewport(pos);
    set({ position: clamped });
  },

  persistPosition: () => {
    storageSet("tabmind:widget:position", get().position).catch(() => {});
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
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const res = await sendMsg({ type: "TABMIND_SNAPSHOT_NOW" }) as { snapshot: SessionSnapshot | null; error?: string } | null;
      if (res?.snapshot) {
        set({ session: res.snapshot, hasApiKey: true, error: null });
      } else {
        set({ error: res?.error ?? "No result returned." });
      }
      await get().loadTasks();
    } catch {
      set({ error: "Background worker couldn't be reached. Open chrome://extensions, click the reload icon on TabMind, then try again." });
    } finally {
      set({ loading: false });
    }
  },

  hydrate: async () => {
    if (get().hydrated) return;
    const [pos, min, session, tasks, { key }, globalNotes, goals] = await Promise.all([
      storageGet("tabmind:widget:position"),
      storageGet("tabmind:widget:minimized"),
      getLatestSession(),
      getTasks(),
      getActiveApiKey(),
      getGlobalNotes(),
      getGoals(),
    ]);
    set({
      position: pos ? clampToViewport(pos) : DEFAULT_POS(),
      minimized: Boolean(min),
      session,
      hasApiKey: !!key,
      tasks,
      rolloverCount: getRolloverCount(tasks),
      globalNotes,
      goals,
      hydrated: true,
    });
  },

  loadTasks: async () => {
    const tasks = await getTasks();
    set({ tasks, rolloverCount: getRolloverCount(tasks) });
  },

  checkApiKey: async () => {
    const { key } = await getActiveApiKey();
    set({ hasApiKey: !!key });
  },

  addTask: async (text, dueDate, category, estimatedMinutes) => {
    await dbAddTask({
      text,
      dueDate: dueDate ?? todayISO(),
      status: "pending",
      isAiGenerated: false,
      category,
      estimatedMinutes,
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

  addGlobalNote: async (text, category) => {
    await dbAddGlobalNote(text, category);
    const globalNotes = await getGlobalNotes();
    set({ globalNotes });
  },

  deleteGlobalNote: async (id) => {
    await dbDeleteGlobalNote(id);
    const globalNotes = await getGlobalNotes();
    set({ globalNotes });
  },

  pinGlobalNote: async (id, pinned) => {
    await dbPinGlobalNote(id, pinned);
    const globalNotes = await getGlobalNotes();
    set({ globalNotes });
  },

  loadGoals: async () => {
    const goals = await getGoals();
    set({ goals });
  },

  addGoal: async (title) => {
    await dbAddGoal(title);
    const goals = await getGoals();
    set({ goals });
  },

  deleteGoal: async (id) => {
    await dbDeleteGoal(id);
    const goals = await getGoals();
    set({ goals });
  },

  setGoalTasks: async (goalId, tasks) => {
    await updateGoal(goalId, { tasks });
    const goals = await getGoals();
    set({ goals });
  },

  toggleGoalTask: async (goalId, taskId) => {
    const goals = get().goals;
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const updatedTasks = goal.tasks.map((t) =>
      t.id === taskId ? { ...t, done: !t.done } : t
    );
    await updateGoal(goalId, { tasks: updatedTasks });
    const newGoals = await getGoals();
    set({ goals: newGoals });
  },
}));
