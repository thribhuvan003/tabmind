// Live integration test - run with: npx tsx __tests__/live-groq.integration.ts
// Requires GROQ_KEY env var set.
import { grokAdapter } from "../lib/ai/grok";

const key = process.env.GROQ_KEY;
if (!key) {
  console.error("GROQ_KEY env var not set");
  process.exit(1);
}

const tabs = [
  { id: 1, title: "React Hydration Error - GitHub Issue #12345", url: "https://github.com/facebook/react/issues/12345", excerpt: "Error: Text content does not match server-rendered HTML. Hydration failed because the initial UI does not match what was rendered on the server." },
  { id: 2, title: "Next.js Hydration Documentation", url: "https://nextjs.org/docs/messages/react-hydration-error", excerpt: "React hydration error guide. Common causes: incorrect HTML nesting, browser-only APIs in render, dates/times mismatch between server and client." },
  { id: 3, title: "Stack Overflow - useEffect vs useLayoutEffect for SSR", url: "https://stackoverflow.com/q/54921749", excerpt: "When using SSR, useLayoutEffect warns. Use useEffect or useIsomorphicLayoutEffect for client-only side effects." },
];

(async () => {
  console.log("Calling Groq via grokAdapter...\n");
  const t0 = Date.now();
  try {
    const result = await grokAdapter.analyze(tabs as any, 18, key);
    const ms = Date.now() - t0;
    console.log(`OK in ${ms}ms\n`);
    console.log(JSON.stringify(result, null, 2));
  } catch (e: any) {
    console.error("FAIL:", e.message);
    process.exit(1);
  }
})();
