import { beforeEach, describe, expect, it, vi } from "vitest";
import { grokAdapter } from "../lib/ai/grok";

vi.mock("../lib/ai/prompt", () => ({
  buildSessionPrompt: vi.fn(() => "Analyze these tabs"),
}));

vi.mock("../lib/ai/parse", () => ({
  parseAiJson: vi.fn(() => ({
    topic: "React debugging",
    summary: "Debugging hydration",
    narrative: "Debugging hydration across docs and issues.",
    todos: [],
    groups: [],
    continueHint: "Open the React issue first.",
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.fetch = vi.fn(async () => ({
    ok: true,
    json: async () => ({
      choices: [{ message: { content: "{\"topic\":\"React debugging\"}" } }],
    }),
  })) as unknown as typeof fetch;
});

describe("grokAdapter", () => {
  it("uses the official xAI Chat Completions endpoint with bearer auth", async () => {
    await grokAdapter.analyze([], 15, "xai-test-key");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.x.ai/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer xai-test-key",
        }),
      })
    );
  });

  it("requests the current Grok chat model", async () => {
    await grokAdapter.analyze([], 15, "xai-test-key");

    const body = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body));
    expect(body.model).toBe("grok-2-latest");
    expect(body.response_format).toEqual({ type: "json_object" });
  });

  it("uses Groq for gsk_ keys", async () => {
    await grokAdapter.analyze([], 15, "gsk_test_key");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.groq.com/openai/v1/chat/completions",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer gsk_test_key",
        }),
      })
    );
    const body = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body));
    expect(body.model).toBe("llama-3.3-70b-versatile");
  });
});
