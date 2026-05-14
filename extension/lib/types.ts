export type AiProvider = "gemini" | "openai";

export interface TabSnapshot {
  id: number;
  url: string;
  title: string;
  excerpt: string;
  capturedAt: number;
  groupLabel?: string;
}

export interface ExtractedTodo {
  text: string;
  deadline?: string; // ISO date or null
  source?: string;   // tab url it came from
}

export interface TabGroup {
  label: string;
  tabIds: number[];
}

export interface SessionSnapshot {
  id: string;
  tabs: TabSnapshot[];
  summary: string;        // one-line topic summary
  narrative: string;      // multi-sentence Superhuman-style narrative
  topic: string;
  todos: ExtractedTodo[];
  groups: TabGroup[];
  continueHint: string;   // "Pick up where you left off" copy
  durationMs: number;
  capturedAt: number;
}

export interface UrlNote {
  url: string;
  text: string;
  updatedAt: number;
}

export type TaskStatus = "pending" | "done";

export interface UserTask {
  id: string;
  text: string;
  /** "YYYY-MM-DD" for a specific date, or "someday" */
  dueDate: string;
  status: TaskStatus;
  /** URL the task came from (if AI-extracted) */
  source?: string;
  isAiGenerated: boolean;
  createdAt: number;
  completedAt?: number;
  /** Previous dueDate if this task was rolled over from a past day */
  rolledOverFrom?: string;
}

export interface StorageSchema {
  "tabmind:session:latest": SessionSnapshot | null;
  "tabmind:session:history": SessionSnapshot[];
  "tabmind:notes": Record<string, UrlNote>;
  "tabmind:tasks": UserTask[];
  "tabmind:tasks:rollover": string;
  "tabmind:widget:position": { x: number; y: number } | null;
  "tabmind:widget:minimized": boolean;
  "tabmind:gemini:apiKey": string;
  "tabmind:openai:apiKey": string;
  "tabmind:provider": AiProvider;
  "tabmind:blocklist": string[];
  "tabmind:session:startedAt": number;
  "tabmind:lastResumeAt": number;
}

export const DEFAULT_BLOCKLIST = [
  "mail.google.com",
  "outlook.live.com",
  "outlook.office.com",
  "calendar.google.com",
  "bankofamerica.com",
  "chase.com",
  "wellsfargo.com",
  "paypal.com",
  "stripe.com",
  "myhealthrecord.com",
];
