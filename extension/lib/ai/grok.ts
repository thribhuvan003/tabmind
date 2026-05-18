import type { AiAdapter, AiInputTab, AiResult } from "./types";
import { buildSessionPrompt } from "./prompt";
import { parseAiJson } from "./parse";

const XAI_ENDPOINT = "https://api.x.ai/v1/chat/completions";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export const grokAdapter: AiAdapter = {
  async analyze(tabs: AiInputTab[], sessionMinutes: number, apiKey: string): Promise<AiResult> {
    const prompt = buildSessionPrompt(tabs, sessionMinutes);
    const isXaiKey = apiKey.startsWith("xai-");
    const res = await fetch(isXaiKey ? XAI_ENDPOINT : GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: isXaiKey ? "grok-4.3" : "llama-3.3-70b-versatile",
        temperature: 0.25,
        max_tokens: 1024,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      const label = isXaiKey ? "xAI" : "Groq";
      throw new Error(`${label} ${res.status}: ${await res.text().catch(() => "")}`);
    }
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    return parseAiJson(raw);
  },
};
