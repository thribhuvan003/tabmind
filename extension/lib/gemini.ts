const GEMINI_MODEL = "gemini-1.5-flash-latest";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent";

export interface GeminiResult {
  summary: string;
  topic: string;
  todos: string[];
}

export async function analyzeSession(
  tabs: { title: string; url: string; excerpt: string }[],
  apiKey: string
): Promise<GeminiResult> {
  const tabList = tabs
    .map((t, i) => `${i + 1}. [${t.title}] ${t.url}\n${t.excerpt}`)
    .join("\n\n");

  const prompt = `You are a passive productivity assistant. The user has these browser tabs open:\n\n${tabList}\n\nRespond ONLY with valid JSON matching this schema:\n{"summary":"one sentence about what the user is working on","topic":"2-4 word label","todos":["extracted action item 1","extracted action item 2"]}`;

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini error ${res.status}`);

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned) as GeminiResult;
  } catch {
    return { summary: raw.slice(0, 120), topic: "Unknown", todos: [] };
  }
}
