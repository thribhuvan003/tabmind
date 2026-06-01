import type { AiAdapter, AiInputTab, AiResult } from "./types";
import { buildSessionPrompt } from "./prompt";
import { parseAiJson } from "./parse";

const ENDPOINT = "https://api.cerebras.ai/v1/chat/completions";
const MODEL = "llama-3.3-70b";

export const cerebrasAdapter: AiAdapter = {
  async complete(prompt: string, apiKey: string, signal?: AbortSignal): Promise<string> {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.25,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
      signal,
    });
    if (!res.ok) throw new Error(`Cerebras ${res.status}: ${await res.text().catch(() => "")}`);
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? "{}";
  },
  async analyze(tabs: AiInputTab[], sessionMinutes: number, apiKey: string, signal?: AbortSignal): Promise<AiResult> {
    return parseAiJson(await this.complete(buildSessionPrompt(tabs, sessionMinutes), apiKey, signal));
  },
};
