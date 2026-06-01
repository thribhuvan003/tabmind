import type { AiAdapter, AiInputTab, AiResult } from "./types";
import { buildSessionPrompt } from "./prompt";
import { parseAiJson } from "./parse";

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "meta-llama/llama-3.3-70b-instruct:free";

export const openrouterAdapter: AiAdapter = {
  async complete(prompt: string, apiKey: string, signal?: AbortSignal): Promise<string> {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://github.com/thribhuvan003/tabmind",
        "X-Title": "TabMind",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.25,
        max_tokens: 1024,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
      signal,
    });
    if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text().catch(() => "")}`);
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? "{}";
  },
  async analyze(tabs: AiInputTab[], sessionMinutes: number, apiKey: string, signal?: AbortSignal): Promise<AiResult> {
    return parseAiJson(await this.complete(buildSessionPrompt(tabs, sessionMinutes), apiKey, signal));
  },
};
