import { describe, it, expect, vi, beforeEach } from "vitest";

// RED: these tests define the contract before implementation is wired up

vi.mock("../lib/gemini", () => ({
  analyzeSession: vi.fn().mockResolvedValue({
    summary: "User is debugging React hydration",
    topic: "React debugging",
    todos: ["Fix hydration error", "Check React 19 docs"],
  }),
}));

vi.mock("../lib/storage", () => ({
  storageGet: vi.fn(),
  saveSession: vi.fn(),
}));

const mockChromeTabs = [
  { id: 1, url: "https://stackoverflow.com/questions/1", title: "React hydration SO" },
  { id: 2, url: "https://github.com/facebook/react/issues/421", title: "GH issue #421" },
  { id: 3, url: "chrome://newtab/", title: "New Tab" },
];

Object.defineProperty(globalThis, "chrome", {
  value: {
    tabs: { query: vi.fn().mockResolvedValue(mockChromeTabs) },
    storage: { local: { get: vi.fn(), set: vi.fn() } },
  },
  writable: true,
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
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns null when no API key is set", async () => {
    const { storageGet } = await import("../lib/storage");
    vi.mocked(storageGet).mockResolvedValue(undefined);
    const { runSessionSnapshot } = await import("../lib/session-engine");
    const result = await runSessionSnapshot();
    expect(result).toBeNull();
  });

  it("returns a snapshot with summary and todos when API key is present", async () => {
    const { storageGet, saveSession } = await import("../lib/storage");
    vi.mocked(storageGet).mockImplementation(async (key) => {
      if (key === "tabmind:gemini:apiKey") return "test-key-123";
      if (key === "tabmind:session:startedAt") return Date.now() - 60_000;
      return undefined;
    });
    vi.mocked(saveSession).mockResolvedValue(undefined);

    const { runSessionSnapshot } = await import("../lib/session-engine");
    const snap = await runSessionSnapshot();
    expect(snap).not.toBeNull();
    expect(snap?.summary).toBe("User is debugging React hydration");
    expect(snap?.todos).toHaveLength(2);
    expect(snap?.durationMs).toBeGreaterThan(0);
  });

  it("saves snapshot to storage", async () => {
    const { storageGet, saveSession } = await import("../lib/storage");
    vi.mocked(storageGet).mockImplementation(async (key) => {
      if (key === "tabmind:gemini:apiKey") return "test-key-123";
      return undefined;
    });
    vi.mocked(saveSession).mockResolvedValue(undefined);

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
