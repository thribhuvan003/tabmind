import type { ExtractedTodo, TabGroup } from "../types";

export interface AiInputTab {
  id: number;
  title: string;
  url: string;
  excerpt: string;
}

export interface AiResult {
  topic: string;
  summary: string;
  narrative: string;
  todos: ExtractedTodo[];
  groups: TabGroup[];
  continueHint: string;
}

export interface AiAdapter {
  analyze(tabs: AiInputTab[], sessionMinutes: number, apiKey: string, signal?: AbortSignal): Promise<AiResult>;
  /** Send a raw prompt, return the model's raw text response. Shared transport
   *  reused by both session analysis and one-off prompts (e.g. goal breakdown). */
  complete(prompt: string, apiKey: string, signal?: AbortSignal): Promise<string>;
}
