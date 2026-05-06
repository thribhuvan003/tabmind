export interface TabSnapshot {
  id: number;
  url: string;
  title: string;
  excerpt: string;
  capturedAt: number;
}

export interface SessionSnapshot {
  id: string;
  tabs: TabSnapshot[];
  summary: string;
  todos: string[];
  topic: string;
  durationMs: number;
  capturedAt: number;
}

export interface UrlNote {
  url: string;
  text: string;
  updatedAt: number;
}

export interface StorageSchema {
  "tabmind:session:latest": SessionSnapshot | null;
  "tabmind:session:history": SessionSnapshot[];
  "tabmind:notes": Record<string, UrlNote>;
  "tabmind:widget:position": { x: number; y: number } | null;
  "tabmind:widget:minimized": boolean;
  "tabmind:gemini:apiKey": string;
  "tabmind:session:startedAt": number;
}
