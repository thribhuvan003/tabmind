/**
 * Task management — Tweek-style scheduling with daily rollover.
 *
 * Scheduling model:
 *   dueDate = "YYYY-MM-DD"  → appears on that specific day
 *   dueDate = "someday"     → no date, lives in the Someday bucket
 *
 * Rollover: any pending task with dueDate < todayISO() automatically
 * gets its dueDate updated to today and receives a rolledOverFrom stamp.
 */

import { storageGet, storageSet } from "./storage";
import type { UserTask, ExtractedTodo } from "./types";

/* ── date utils ──────────────────────────────────────────── */

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function nextMondayISO(): string {
  const d = new Date();
  const day = d.getDay(); // 0 = Sun
  const daysUntil = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + daysUntil);
  return d.toISOString().slice(0, 10);
}

/** Milliseconds until next local midnight. */
export function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

/* ── crud ────────────────────────────────────────────────── */

export async function getTasks(): Promise<UserTask[]> {
  return (await storageGet("tabmind:tasks")) ?? [];
}

export async function saveTasks(tasks: UserTask[]): Promise<void> {
  await storageSet("tabmind:tasks", tasks);
}

export async function addTask(
  partial: Omit<UserTask, "id" | "createdAt">
): Promise<UserTask> {
  const task: UserTask = {
    ...partial,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  const tasks = await getTasks();
  tasks.push(task);
  await saveTasks(tasks);
  return task;
}

export async function updateTask(
  id: string,
  patch: Partial<UserTask>
): Promise<void> {
  const tasks = await getTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return;
  tasks[idx] = { ...tasks[idx], ...patch };
  await saveTasks(tasks);
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = await getTasks();
  await saveTasks(tasks.filter((t) => t.id !== id));
}

export async function completeTask(id: string): Promise<void> {
  await updateTask(id, { status: "done", completedAt: Date.now() });
}

/* ── rollover ────────────────────────────────────────────── */

/**
 * Move any pending tasks with dueDate < today to today.
 * Returns the number of tasks rolled over.
 * Idempotent — safe to call multiple times per day.
 */
export async function rolloverOverdueTasks(): Promise<number> {
  const today = todayISO();
  const lastRollover = (await storageGet("tabmind:tasks:rollover")) ?? "";

  // Already ran today — skip.
  if (lastRollover === today) return 0;

  const tasks = await getTasks();
  let count = 0;

  const updated = tasks.map((t) => {
    if (
      t.status === "pending" &&
      t.dueDate !== "someday" &&
      t.dueDate < today
    ) {
      count++;
      return { ...t, dueDate: today, rolledOverFrom: t.dueDate };
    }
    return t;
  });

  await saveTasks(updated);
  await storageSet("tabmind:tasks:rollover", today);
  return count;
}

/* ── ai merge ─────────────────────────────────────────────── */

/**
 * Add AI-extracted todos to the task list, deduplicating by text.
 * New tasks are scheduled for today by default.
 */
export async function mergeAiTodos(todos: ExtractedTodo[]): Promise<void> {
  if (!todos.length) return;

  const existing = await getTasks();
  const textSet = new Set(existing.map((t) => t.text.toLowerCase().trim()));
  const today = todayISO();
  const newTasks: UserTask[] = [];

  for (const todo of todos) {
    const key = todo.text.toLowerCase().trim();
    if (textSet.has(key)) continue;
    textSet.add(key);

    newTasks.push({
      id: crypto.randomUUID(),
      text: todo.text,
      dueDate: todo.deadline ?? today,
      status: "pending",
      source: todo.source,
      isAiGenerated: true,
      createdAt: Date.now(),
    });
  }

  if (newTasks.length) {
    await saveTasks([...existing, ...newTasks]);
  }
}

/* ── view helpers ─────────────────────────────────────────── */

export function getTodayTasks(tasks: UserTask[]): UserTask[] {
  const today = todayISO();
  return tasks.filter(
    (t) => t.status === "pending" && t.dueDate !== "someday" && t.dueDate <= today
  );
}

export function getSomedayTasks(tasks: UserTask[]): UserTask[] {
  return tasks.filter((t) => t.status === "pending" && t.dueDate === "someday");
}

export function getUpcomingTasks(tasks: UserTask[]): UserTask[] {
  const today = todayISO();
  return tasks
    .filter((t) => t.status === "pending" && t.dueDate !== "someday" && t.dueDate > today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function getRolloverCount(tasks: UserTask[]): number {
  return tasks.filter((t) => t.rolledOverFrom !== undefined && t.status === "pending").length;
}
