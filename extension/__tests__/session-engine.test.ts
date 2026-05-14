import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../lib/ai/index", () => ({
  analyzeSession: vi.fn().mockResolvedValue({
    topic: "React debugging",
    summary: "User is debugging React hydration",
    narrative: "You've been debugging a React hydration error for 15 minutes — 2 Stack Overflow tabs and a GitHub issue.",
    todos: [
      { text: "Fix hydration error", deadline: null, source: "https://stackoverflow.com/questions/1" },
      { text: "Check React 19 docs", deadline: null, source: "https://github.com/facebook/react/issues/421" },
    ],
    groups: [{ label: "React debugging", tabIds: [1, 2] }],
    continueHint: "Resume by opening the React hydration SO tab first.",
  }),
}));

vi.mock("../lib/storage", () => ({
  storageGet: vi.fn(),
  storageSet: vi.fn(),
  saveSession: vi.fn(),
  getActiveApiKey: vi.fn(),
  getBlocklist: vi.fn().mockResolvedValue([]),
  isBlocked: vi.fn().mockReturnValue(false),
  normalizeUrl: (raw: string) => {
    try {
      const u = new URL(raw);
      return `${u.hostname}${u.pathname}`.replace(/\/$/, "");
    } catch { return raw; }
  },
}));

const mockTabs = [
  { id: 1, url: "https://stackoverflow.com/questions/1", title: "React hydration SO" },
  { id: 2, url: "https://github.com/facebook/react/issues/421", title: "GH issue #421" },
  { id: 3, url: "chrome://newtab/", title: "New Tab" },
];

Object.defineProperty(globalThis, "chrome", {
  value: {
    tabs: {
      query: vi.fn().mockResolvedValue(mockTabs),
      sendMessage: vi.fn().mockResolvedValue(""),
    },
    storage: {
      local: { get: vi.fn(), set: vi.fn() },
      sync: { get: vi.fn(), set: vi.fn() },
    },
    runtime: { sendMessage: vi.fn() },
  },
  writable: true,
  configurable: true,
});

describe("captureTabExcerpts", () => {
  it("filters out chrome:// tabs", async () => {
    const { captureTabExcerpts } = await import("../lib/session-engine");
    const tabs = await captureTabExcerpts();
    expect(tabs.every((t) => !t.url.startsWith("chrome://"))).toBe(true);
    expect(tabs).toHaveLength(2);
  });

  it("preserves id, url, title for each real tab", async () => {
    const { captureTabExcerpts } = await import("../lib/session-engine");
    const tabs = await captureTabExcerpts();
    expect(tabs[0]).toMatchObject({ id: 1, url: "https://stackoverflow.com/questions/1" });
  });
});

describe("runSessionSnapshot", () => {
  beforeEach(() => { vi.resetModules(); vi.clearAllMocks(); });

  it("returns null when no API key is set", async () => {
    const { getActiveApiKey, getBlocklist } = await import("../lib/storage");
    vi.mocked(getActiveApiKey).mockResolvedValue({ provider: "gemini", key: "" });
    vi.mocked(getBlocklist).mockResolvedValue([]);
    const { runSessionSnapshot } = await import("../lib/session-engine");
    expect(await runSessionSnapshot()).toBeNull();
  });

  it("returns a snapshot with narrative and todos when key is present", async () => {
    const { getActiveApiKey, storageGet, saveSession, getBlocklist } = await import("../lib/storage");
    vi.mocked(getActiveApiKey).mockResolvedValue({ provider: "gemini", key: "test-key-123" });
    vi.mocked(storageGet).mockImplementation(async (key) => {
      if (key === "tabmind:session:startedAt") return Date.now() - 60_000;
      return undefined;
    });
    vi.mocked(saveSession).mockResolvedValue(undefined);
    vi.mocked(getBlocklist).mockResolvedValue([]);

    const { runSessionSnapshot } = await import("../lib/session-engine");
    const snap = await runSessionSnapshot();
    expect(snap).not.toBeNull();
    expect(snap?.topic).toBe("React debugging");
    expect(snap?.todos).toHaveLength(2);
    expect(snap?.durationMs).toBeGreaterThan(0);
    expect(typeof snap?.narrative).toBe("string");
  });

  it("saves snapshot to storage", async () => {
    const { getActiveApiKey, storageGet, saveSession, getBlocklist } = await import("../lib/storage");
    vi.mocked(getActiveApiKey).mockResolvedValue({ provider: "gemini", key: "test-key-123" });
    vi.mocked(storageGet).mockResolvedValue(undefined);
    vi.mocked(saveSession).mockResolvedValue(undefined);
    vi.mocked(getBlocklist).mockResolvedValue([]);

    const { runSessionSnapshot } = await import("../lib/session-engine");
    await runSessionSnapshot();
    expect(saveSession).toHaveBeenCalledOnce();
  });
});

describe("normalizeUrl", () => {
  it("strips trailing slash", async () => {
    const { normalizeUrl } = await import("../lib/storage");
    expect(normalizeUrl("https://example.com/page/")).toBe("example.com/page");
  });

  it("preserves path", async () => {
    const { normalizeUrl } = await import("../lib/storage");
    expect(normalizeUrl("https://stackoverflow.com/questions/123")).toBe(
      "stackoverflow.com/questions/123"
    );
  });
});
