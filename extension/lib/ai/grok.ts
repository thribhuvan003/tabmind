import type { AiAdapter, AiInputTab, AiResult } from "./types";
import { buildSessionPrompt } from "./prompt";
import { parseAiJson } from "./parse";

const XAI_ENDPOINT = "https://api.x.ai/v1/chat/completions";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export const grokAdapter: AiAdapter = {
  async complete(prompt: string, apiKey: string, signal?: AbortSignal): Promise<string> {
    const isXaiKey = apiKey.startsWith("xai-");
    const res = await fetch(isXaiKey ? XAI_ENDPOINT : GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: isXaiKey ? "grok-2-latest" : "llama-3.3-70b-versatile",
        temperature: 0.25,
        max_tokens: 1024,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
      signal,
    });
    if (!res.ok) {
      const label = isXaiKey ? "xAI" : "Groq";
      throw new Error(`${label} ${res.status}: ${await res.text().catch(() => "")}`);
    }
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? "{}";
  },
  async analyze(tabs: AiInputTab[], sessionMinutes: number, apiKey: string, signal?: AbortSignal): Promise<AiResult> {
    return parseAiJson(await this.complete(buildSessionPrompt(tabs, sessionMinutes), apiKey, signal));
  },
};
