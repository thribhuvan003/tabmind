import { beforeEach, describe, expect, it, vi } from "vitest";

const localStore = new Map<string, unknown>();
const syncStore = new Map<string, unknown>();

function area(store: Map<string, unknown>) {
  return {
    get: vi.fn(async (key: string) => ({ [key]: store.get(key) })),
    set: vi.fn(async (value: Record<string, unknown>) => {
      Object.entries(value).forEach(([k, v]) => store.set(k, v));
    }),
    remove: vi.fn(async (key: string) => {
      store.delete(key);
    }),
  };
}

let localArea = area(localStore);
let syncArea = area(syncStore);

beforeEach(() => {
  localStore.clear();
  syncStore.clear();
  localArea = area(localStore);
  syncArea = area(syncStore);
  Object.defineProperty(globalThis, "chrome", {
    value: { storage: { local: localArea, sync: syncArea } },
    writable: true,
    configurable: true,
  });
});

describe("storage routing", () => {
  it("stores URL notes in chrome.storage.sync", async () => {
    const { setNote, getNote } = await import("../lib/storage");

    await setNote("example.com/article", "Important source");

    expect(syncArea.set).toHaveBeenCalled();
    expect(localArea.set).not.toHaveBeenCalled();
    await expect(getNote("example.com/article")).resolves.toMatchObject({
      text: "Important source",
    });
  });

  it("stores session snapshots in chrome.storage.local and caps history", async () => {
    const { saveSession, getSessionHistory } = await import("../lib/storage");

    for (let i = 0; i < 55; i++) {
      await saveSession({
        id: `s-${i}`,
        tabs: [],
        summary: "Summary",
        narrative: "Narrative",
        topic: "Topic",
        todos: [],
        groups: [],
        continueHint: "Continue",
        durationMs: 1000,
        capturedAt: i,
      });
    }

    expect(localArea.set).toHaveBeenCalled();
    expect(syncArea.set).not.toHaveBeenCalled();
    const history = await getSessionHistory();
    expect(history).toHaveLength(50);
    expect(history[0].id).toBe("s-54");
  });

  it("normalizes URL keys by host and path", async () => {
    const { normalizeUrl } = await import("../lib/storage");

    expect(normalizeUrl("https://example.com/path/?utm_source=x")).toBe("example.com/path");
    expect(normalizeUrl("not-a-url")).toBe("not-a-url");
  });
});
