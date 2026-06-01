import type { AiProvider } from "../types";
import type { AiAdapter, AiInputTab, AiResult } from "./types";
import { grokAdapter } from "./grok";
import { geminiAdapter } from "./gemini";
import { openaiAdapter } from "./openai";
import { claudeAdapter } from "./claude";
import { openrouterAdapter } from "./openrouter";
import { cerebrasAdapter } from "./cerebras";

export type { AiInputTab, AiResult };

const ADAPTERS: Record<AiProvider, AiAdapter> = {
  grok: grokAdapter,
  gemini: geminiAdapter,
  openai: openaiAdapter,
  claude: claudeAdapter,
  openrouter: openrouterAdapter,
  cerebras: cerebrasAdapter,
};

export async function analyzeSession(
  provider: AiProvider,
  apiKey: string,
  tabs: AiInputTab[],
  sessionMinutes: number,
  signal?: AbortSignal
): Promise<AiResult> {
  return ADAPTERS[provider].analyze(tabs, sessionMinutes, apiKey, signal);
}

/** Run a one-off prompt against the active provider, returning the raw model text. */
export async function completePrompt(
  provider: AiProvider,
  apiKey: string,
  prompt: string,
  signal?: AbortSignal
): Promise<string> {
  return ADAPTERS[provider].complete(prompt, apiKey, signal);
}
