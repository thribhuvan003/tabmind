import { create } from "zustand";
import type { SessionSnapshot, UrlNote } from "../lib/types";
import { getLatestSession, getNote, setNote, normalizeUrl } from "../lib/storage";

interface WidgetState {
  minimized: boolean;
  position: { x: number; y: number };
  session: SessionSnapshot | null;
  note: UrlNote | null;
  currentUrl: string;
  setMinimized: (v: boolean) => void;
  setPosition: (pos: { x: number; y: number }) => void;
  loadSession: () => Promise<void>;
  loadNote: (url: string) => Promise<void>;
  saveNote: (text: string) => Promise<void>;
  requestSnapshot: () => Promise<void>;
}

export const useWidgetStore = create<WidgetState>((set, get) => ({
  minimized: false,
  position: { x: window.innerWidth - 320, y: 88 },
  session: null,
  note: null,
  currentUrl: window.location.href,

  setMinimized: (v) => set({ minimized: v }),
  setPosition:  (pos) => set({ position: pos }),

  loadSession: async () => {
    const session = await getLatestSession();
    set({ session });
  },

  loadNote: async (url) => {
    const key = normalizeUrl(url);
    const note = await getNote(key);
    set({ note, currentUrl: url });
  },

  saveNote: async (text) => {
    const key = normalizeUrl(get().currentUrl);
    await setNote(key, text);
    const note = await getNote(key);
    set({ note });
  },

  requestSnapshot: async () => {
    try {
      const result: SessionSnapshot | null = await chrome.runtime.sendMessage({ type: "TABMIND_SNAPSHOT_NOW" });
      if (result) set({ session: result });
    } catch {
      /* extension context may not be ready — silent fail is correct here */
    }
  },
}));
