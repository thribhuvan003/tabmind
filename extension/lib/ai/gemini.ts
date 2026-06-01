import type { AiAdapter, AiInputTab, AiResult } from "./types";
import { buildSessionPrompt } from "./prompt";
import { parseAiJson } from "./parse";

// gemini-2.0-flash: free tier, fast, stable as of 2025+
const ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export const geminiAdapter: AiAdapter = {
  async complete(prompt: string, apiKey: string, signal?: AbortSignal): Promise<string> {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey, // header auth, never query string
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.25,
          maxOutputTokens: 1024,
          responseMimeType: "application/json",
        },
      }),
      signal,
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text().catch(() => "")}`);
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  },
  async analyze(tabs: AiInputTab[], sessionMinutes: number, apiKey: string, signal?: AbortSignal): Promise<AiResult> {
    return parseAiJson(await this.complete(buildSessionPrompt(tabs, sessionMinutes), apiKey, signal));
  },
};
