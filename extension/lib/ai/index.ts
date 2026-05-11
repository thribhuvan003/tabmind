import type { AiProvider } from "../types";
import type { AiAdapter, AiInputTab, AiResult } from "./types";
import { geminiAdapter } from "./gemini";
import { openaiAdapter } from "./openai";

export type { AiInputTab, AiResult };

const ADAPTERS: Record<AiProvider, AiAdapter> = {
  gemini: geminiAdapter,
  openai: openaiAdapter,
};

export async function analyzeSession(
  provider: AiProvider,
  apiKey: string,
  tabs: AiInputTab[],
  sessionMinutes: number
): Promise<AiResult> {
  return ADAPTERS[provider].analyze(tabs, sessionMinutes, apiKey);
}
