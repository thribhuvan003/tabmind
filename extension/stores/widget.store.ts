import { create } from "zustand";
import type { SessionSnapshot, UrlNote } from "../lib/types";
import {
  getLatestSession,
  getNote,
  setNote,
  normalizeUrl,
  storageGet,
  storageSet,
} from "../lib/storage";

interface WidgetState {
  minimized: boolean;
  position: { x: number; y: number };
  session: SessionSnapshot | null;
  note: UrlNote | null;
  currentUrl: string;
  loading: boolean;
  hydrated: boolean;
  setMinimized: (v: boolean) => void;
  setPosition: (pos: { x: number; y: number }) => void;
  loadSession: () => Promise<void>;
  loadNote: (url: string) => Promise<void>;
  saveNote: (text: string) => Promise<void>;
  requestSnapshot: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const DEFAULT_POS = () => ({
  x: typeof window !== "undefined" ? Math.max(0, window.innerWidth - 360) : 24,
  y: 96,
});

function clampToViewport(pos: { x: number; y: number }) {
  if (typeof window === "undefined") return pos;
  const w = 340;
  const h = 88;
  return {
    x: Math.max(8, Math.min(window.innerWidth - w - 8, pos.x)),
    y: Math.max(8, Math.min(window.innerHeight - h - 8, pos.y)),
  };
}

export const useWidgetStore = create<WidgetState>((set, get) => ({
  minimized: false,
  position: DEFAULT_POS(),
  session: null,
  note: null,
  currentUrl: typeof window !== "undefined" ? window.location.href : "",
  loading: false,
  hydrated: false,

  setMinimized: (v) => {
    set({ minimized: v });
    storageSet("tabmind:widget:minimized", v).catch(() => {});
  },

  setPosition: (pos) => {
    const clamped = clampToViewport(pos);
    set({ position: clamped });
    storageSet("tabmind:widget:position", clamped).catch(() => {});
  },

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
    set({ loading: true });
    try {
      const result: SessionSnapshot | null = await chrome.runtime.sendMessage({
        type: "TABMIND_SNAPSHOT_NOW",
      });
      if (result) set({ session: result });
    } catch {
      /* */
    } finally {
      set({ loading: false });
    }
  },

  hydrate: async () => {
    if (get().hydrated) return;
    const [pos, min, session] = await Promise.all([
      storageGet("tabmind:widget:position"),
      storageGet("tabmind:widget:minimized"),
      getLatestSession(),
    ]);
    set({
      position: pos ? clampToViewport(pos) : DEFAULT_POS(),
      minimized: Boolean(min),
      session,
      hydrated: true,
    });
  },
}));
