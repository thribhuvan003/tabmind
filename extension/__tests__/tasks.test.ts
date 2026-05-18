import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserTask } from "../lib/types";

const store = new Map<string, unknown>();

vi.mock("../lib/storage", () => ({
  storageGet: vi.fn(async (key: string) => store.get(key)),
  storageSet: vi.fn(async (key: string, value: unknown) => {
    store.set(key, value);
  }),
}));

const pending = (id: string, text: string, dueDate: string): UserTask => ({
  id,
  text,
  dueDate,
  status: "pending",
  isAiGenerated: false,
  createdAt: Date.now(),
});

beforeEach(() => {
  store.clear();
  vi.useRealTimers();
});

describe("task scheduling", () => {
  it("rolls overdue pending tasks into today once", async () => {
    vi.setSystemTime(new Date("2026-05-18T08:00:00Z"));
    const { rolloverOverdueTasks, getTasks } = await import("../lib/tasks");
    store.set("tabmind:tasks", [
      pending("old", "Ship extension QA", "2026-05-17"),
      pending("future", "Write launch notes", "2026-05-19"),
    ]);

    await expect(rolloverOverdueTasks()).resolves.toBe(1);
    await expect(rolloverOverdueTasks()).resolves.toBe(0);

    const tasks = await getTasks();
    expect(tasks.find((t) => t.id === "old")).toMatchObject({
      dueDate: "2026-05-18",
      rolledOverFrom: "2026-05-17",
    });
  });

  it("deduplicates AI todos by normalized text", async () => {
    const { mergeAiTodos, getTasks } = await import("../lib/tasks");
    store.set("tabmind:tasks", [pending("existing", "Fix hydration error", "2026-05-18")]);

    await mergeAiTodos([
      { text: "Fix hydration error", source: "https://example.com/a" },
      { text: "Check React docs", source: "https://example.com/b" },
    ]);

    const tasks = await getTasks();
    expect(tasks.map((t) => t.text)).toEqual(["Fix hydration error", "Check React docs"]);
  });

  it("keeps today, someday, and upcoming task views separate", async () => {
    vi.setSystemTime(new Date("2026-05-18T08:00:00Z"));
    const { getTodayTasks, getSomedayTasks, getUpcomingTasks } = await import("../lib/tasks");
    const tasks = [
      pending("today", "Finish QA", "2026-05-18"),
      pending("later", "Prepare listing", "2026-05-20"),
      pending("someday", "Research onboarding", "someday"),
    ];

    expect(getTodayTasks(tasks).map((t) => t.id)).toEqual(["today"]);
    expect(getUpcomingTasks(tasks).map((t) => t.id)).toEqual(["later"]);
    expect(getSomedayTasks(tasks).map((t) => t.id)).toEqual(["someday"]);
  });
});
