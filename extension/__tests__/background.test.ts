import { beforeEach, describe, expect, it, vi } from "vitest";

type Listener<T extends (...args: any[]) => any> = T[];

const listeners: {
  installed: Listener<() => void | Promise<void>>;
  startup: Listener<() => void | Promise<void>>;
  alarms: Listener<(alarm: { name: string }) => void | Promise<void>>;
  messages: Listener<(msg: any, sender: any, sendResponse: (value: any) => void) => boolean | void>;
  idle: Listener<(state: string) => void | Promise<void>>;
  commands: Listener<(command: string) => void>;
} = {
  installed: [],
  startup: [],
  alarms: [],
  messages: [],
  idle: [],
  commands: [],
};

vi.mock("../lib/session-engine", () => ({
  runSessionSnapshot: vi.fn().mockResolvedValue({
    id: "snap-1",
    tabs: [],
    summary: "React debugging",
    narrative: "Debugging hydration issues",
    topic: "React",
    todos: [],
    groups: [],
    continueHint: "Return to the React issue.",
    durationMs: 90_000,
    capturedAt: Date.now(),
  }),
}));

vi.mock("../lib/storage", () => ({
  storageSet: vi.fn().mockResolvedValue(undefined),
  storageGet: vi.fn().mockResolvedValue(undefined),
  getLatestSession: vi.fn().mockResolvedValue(null),
  getActiveApiKey: vi.fn().mockResolvedValue({ provider: "gemini", key: "test-key" }),
}));

vi.mock("../lib/tab-groups", () => ({
  applyTabGroups: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../lib/tasks", () => ({
  rolloverOverdueTasks: vi.fn().mockResolvedValue(0),
  mergeAiTodos: vi.fn().mockResolvedValue(undefined),
  msUntilMidnight: vi.fn().mockReturnValue(60_000),
}));

vi.mock("../lib/sentry", () => ({
  initSentry: vi.fn(),
  captureError: vi.fn(),
}));

function installChromeMock() {
  Object.defineProperty(globalThis, "defineBackground", {
    value: (fn: () => void) => {
      fn();
      return undefined;
    },
    configurable: true,
  });

  Object.defineProperty(globalThis, "chrome", {
    value: {
      runtime: {
        onInstalled: { addListener: vi.fn((fn) => listeners.installed.push(fn)) },
        onStartup: { addListener: vi.fn((fn) => listeners.startup.push(fn)) },
        onMessage: { addListener: vi.fn((fn) => listeners.messages.push(fn)) },
        openOptionsPage: vi.fn(),
        getURL: vi.fn((path: string) => `chrome-extension://tabmind/${path}`),
        lastError: null,
      },
      alarms: {
        create: vi.fn(),
        get: vi.fn().mockResolvedValue(null),
        onAlarm: { addListener: vi.fn((fn) => listeners.alarms.push(fn)) },
      },
      tabs: {
        query: vi.fn().mockResolvedValue([]),
        sendMessage: vi.fn().mockResolvedValue(undefined),
        create: vi.fn(),
      },
      idle: {
        setDetectionInterval: vi.fn(),
        onStateChanged: { addListener: vi.fn((fn) => listeners.idle.push(fn)) },
      },
      commands: {
        onCommand: { addListener: vi.fn((fn) => listeners.commands.push(fn)) },
      },
    },
    writable: true,
    configurable: true,
  });
}

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  Object.values(listeners).forEach((list) => list.splice(0));
  installChromeMock();
  await import("../entrypoints/background/index");
});

describe("background alarms", () => {
  it("creates the session snapshot alarm every 90 seconds on install", async () => {
    await listeners.installed[0]();

    expect(chrome.alarms.create).toHaveBeenCalledWith(
      "tabmind:snapshot",
      expect.objectContaining({ periodInMinutes: 1.5 })
    );
  });

  it("recreates the snapshot alarm at 90 seconds after browser startup", async () => {
    await listeners.startup[0]();

    expect(chrome.alarms.create).toHaveBeenCalledWith(
      "tabmind:snapshot",
      expect.objectContaining({ periodInMinutes: 1.5 })
    );
  });

  it("responds to an immediate snapshot request asynchronously", () => {
    const sendResponse = vi.fn();

    const keepAlive = listeners.messages[0](
      { type: "TABMIND_SNAPSHOT_NOW" },
      {},
      sendResponse
    );

    expect(keepAlive).toBe(true);
  });
});
