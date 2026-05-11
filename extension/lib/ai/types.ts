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
  analyze(tabs: AiInputTab[], sessionMinutes: number, apiKey: string): Promise<AiResult>;
}
