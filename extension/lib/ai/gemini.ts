import type { AiAdapter, AiInputTab, AiResult } from "./types";
import { buildSessionPrompt } from "./prompt";
import { parseAiJson } from "./parse";

// gemini-2.0-flash: free tier, fast, stable as of 2025+
const ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export const geminiAdapter: AiAdapter = {
  async analyze(tabs: AiInputTab[], sessionMinutes: number, apiKey: string): Promise<AiResult> {
    const prompt = buildSessionPrompt(tabs, sessionMinutes);
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
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text().catch(() => "")}`);
    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    return parseAiJson(raw);
  },
};
