import type { AiInputTab } from "./types";

/**
 * Single shared prompt used by every provider.
 * Asks for a Superhuman-style session narrative + deadline-aware todos + tab groups.
 */
export function buildSessionPrompt(tabs: AiInputTab[], sessionMinutes: number): string {
  const tabList = tabs
    .map(
      (t, i) =>
        `[${i + 1}] id=${t.id} | "${t.title}" | ${t.url}` +
        (t.excerpt ? `\n    excerpt: ${t.excerpt}` : "")
    )
    .join("\n");

  const today = new Date().toISOString().slice(0, 10);

  return `You are TabMind, a passive productivity intelligence. You read a user's open browser tabs every 90 seconds and surface what they're actually working on — like a quiet observer building a live map of their focus.

CONTEXT
- Today's date: ${today}
- Current session length: ${sessionMinutes} minute(s)
- Tabs open: ${tabs.length}

OPEN TABS
${tabList}

YOUR JOB
Return ONLY valid minified JSON matching this exact schema. No prose. No code fences.

{
  "topic": "2-4 word label for the user's primary focus",
  "summary": "single sentence, present tense, naming the concrete task",
  "narrative": "2-3 punchy sentences in Superhuman voice. ALWAYS lead with a concrete observation using this pattern: 'You've been [specific activity] for [N] minutes — [X] [Site A] tabs, [Y] [Site B] tabs, [Z] [Site C] tabs.' Then name what's been tried and what's still open. Never use hedges like 'seems like' or 'it looks like'. Never start with 'You are', 'The user', or 'I'.",
  "todos": [
    { "text": "concrete action item under 80 chars", "deadline": "YYYY-MM-DD or null", "source": "exact url it came from" }
  ],
  "groups": [
    { "label": "2-3 word group name", "tabIds": [<numeric tab ids from input>] }
  ],
  "continueHint": "One specific, actionable sentence naming the exact tab title or URL to return to first. No generic advice like 'pick up where you left off'."
}

RULES
- Group tabs by topic; every tab id appears in exactly one group; use numeric id values exactly as given.
- Extract deadlines from titles or excerpts (today, tomorrow, by Friday, Nov 15, etc) — resolve relative dates against today and emit ISO. Else null.
- Max 5 todos, max 4 groups. Be ruthless — only real action items, not generic advice.
- If tabs look unrelated (idle browsing), say so honestly in the narrative.
- Never invent facts not supported by the tabs.`;
}
