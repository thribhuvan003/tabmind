import type { AiAdapter, AiInputTab, AiResult } from "./types";
import { buildSessionPrompt } from "./prompt";
import { parseAiJson } from "./parse";

const ENDPOINT = "https://api.anthropic.com/v1/messages";

export const claudeAdapter: AiAdapter = {
  async complete(prompt: string, apiKey: string, signal?: AbortSignal): Promise<string> {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
      signal,
    });
    if (!res.ok) throw new Error(`Claude ${res.status}: ${await res.text().catch(() => "")}`);
    const data = await res.json();
    return data?.content?.[0]?.text ?? "{}";
  },
  async analyze(tabs: AiInputTab[], sessionMinutes: number, apiKey: string, signal?: AbortSignal): Promise<AiResult> {
    return parseAiJson(await this.complete(buildSessionPrompt(tabs, sessionMinutes), apiKey, signal));
  },
};
