import type { AiAdapter, AiInputTab, AiResult } from "./types";
import { buildSessionPrompt } from "./prompt";
import { parseAiJson } from "./parse";

const ENDPOINT = "https://api.cerebras.ai/v1/chat/completions";
const MODEL = "llama-3.3-70b";

export const cerebrasAdapter: AiAdapter = {
  async analyze(tabs: AiInputTab[], sessionMinutes: number, apiKey: string): Promise<AiResult> {
    const prompt = buildSessionPrompt(tabs, sessionMinutes);
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
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`Cerebras ${res.status}: ${await res.text().catch(() => "")}`);
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    return parseAiJson(raw);
  },
};
