import type { AiResult } from "./types";
import type { ExtractedTodo, TabGroup } from "../types";

/** Robust JSON parser - strips fences, coerces shape, never throws. */
export function parseAiJson(raw: string): AiResult {
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  let parsed: Partial<AiResult> = {};
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // last-ditch: pull the first {...} block
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        parsed = JSON.parse(m[0]);
      } catch {
        /* swallow */
      }
    }
  }

  return {
    topic: typeof parsed.topic === "string" ? parsed.topic.slice(0, 40) : "Unknown",
    summary: typeof parsed.summary === "string" ? parsed.summary.slice(0, 200) : "",
    narrative: typeof parsed.narrative === "string" ? parsed.narrative.slice(0, 600) : "",
    todos: normalizeTodos(parsed.todos),
    groups: normalizeGroups(parsed.groups),
    continueHint:
      typeof parsed.continueHint === "string" ? parsed.continueHint.slice(0, 200) : "",
  };
}

function normalizeTodos(v: unknown): ExtractedTodo[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((t): ExtractedTodo | null => {
      if (typeof t === "string") return { text: t.slice(0, 120) };
      if (t && typeof t === "object") {
        const obj = t as Record<string, unknown>;
        const text = typeof obj.text === "string" ? obj.text.slice(0, 120) : "";
        if (!text) return null;
        const deadline =
          typeof obj.deadline === "string" && /^\d{4}-\d{2}-\d{2}/.test(obj.deadline)
            ? obj.deadline.slice(0, 10)
            : undefined;
        const source = typeof obj.source === "string" ? obj.source : undefined;
        return { text, deadline, source };
      }
      return null;
    })
    .filter((t): t is ExtractedTodo => t !== null)
    .slice(0, 8);
}

function normalizeGroups(v: unknown): TabGroup[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((g): TabGroup | null => {
      if (!g || typeof g !== "object") return null;
      const obj = g as Record<string, unknown>;
      const label = typeof obj.label === "string" ? obj.label.slice(0, 30) : "";
      const tabIds = Array.isArray(obj.tabIds)
        ? obj.tabIds.filter((n): n is number => typeof n === "number")
        : [];
      if (!label || tabIds.length === 0) return null;
      return { label, tabIds };
    })
    .filter((g): g is TabGroup => g !== null)
    .slice(0, 6);
}
