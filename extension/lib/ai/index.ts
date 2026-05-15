import type { AiProvider } from "../types";
import type { AiAdapter, AiInputTab, AiResult } from "./types";
import { grokAdapter } from "./grok";
import { geminiAdapter } from "./gemini";
import { openaiAdapter } from "./openai";
import { claudeAdapter } from "./claude";

export type { AiInputTab, AiResult };

const ADAPTERS: Record<AiProvider, AiAdapter> = {
  grok: grokAdapter,
  gemini: geminiAdapter,
  openai: openaiAdapter,
  claude: claudeAdapter,
};

export async function analyzeSession(
  provider: AiProvider,
  apiKey: string,
  tabs: AiInputTab[],
  sessionMinutes: number
): Promise<AiResult> {
  return ADAPTERS[provider].analyze(tabs, sessionMinutes, apiKey);
}
