// Multi-scenario live test. Run all scenarios in parallel against Groq.
import { grokAdapter } from "../lib/ai/grok";

const key = process.env.GROQ_KEY!;
if (!key) { console.error("GROQ_KEY missing"); process.exit(1); }

const scenarios: { name: string; minutes: number; tabs: any[] }[] = [
  {
    name: "1) Empty tabs (edge case)",
    minutes: 5,
    tabs: [],
  },
  {
    name: "2) Single passive reading tab",
    minutes: 12,
    tabs: [
      { id: 1, title: "Hacker News", url: "https://news.ycombinator.com", excerpt: "Top stories about AI, startups, and tech news today." },
    ],
  },
  {
    name: "3) Mixed work + distraction",
    minutes: 45,
    tabs: [
      { id: 1, title: "Stripe API - Subscriptions", url: "https://stripe.com/docs/billing/subscriptions/overview", excerpt: "Subscriptions allow you to charge a customer on a recurring basis. Create a subscription with stripe.subscriptions.create(). Webhook events: customer.subscription.created, .updated, .deleted." },
      { id: 2, title: "PR #842: Add billing webhooks", url: "https://github.com/myorg/app/pull/842", excerpt: "Adds /api/webhooks/stripe handler. TODO: verify signature with stripe.webhooks.constructEvent. Deadline: ship by Friday Nov 22." },
      { id: 3, title: "YouTube - Lo-fi beats", url: "https://youtube.com/watch?v=jfKfPfyJRdk", excerpt: "lofi hip hop radio - beats to relax/study to" },
      { id: 4, title: "Twitter / X", url: "https://twitter.com/home", excerpt: "Home timeline" },
    ],
  },
  {
    name: "4) Heavy debugging session",
    minutes: 90,
    tabs: [
      { id: 1, title: "TypeError: Cannot read properties of undefined (reading 'map')", url: "https://stackoverflow.com/q/45015180", excerpt: "Common when API returns undefined. Use optional chaining: data?.items?.map(...)." },
      { id: 2, title: "Sentry Issue TABMIND-42", url: "https://sentry.io/issues/4567", excerpt: "TypeError at Dashboard.tsx:127 in renderTabs. 14 occurrences in last hour. Affects Chrome 120+. First seen 2h ago." },
      { id: 3, title: "Dashboard.tsx - GitHub", url: "https://github.com/myorg/tabmind/blob/main/extension/entrypoints/dashboard/Dashboard.tsx", excerpt: "Line 127: tabs.map(t => <TabCard key={t.id} tab={t} />). Missing null check on tabs prop." },
    ],
  },
];

(async () => {
  const t0 = Date.now();
  const results = await Promise.allSettled(
    scenarios.map(async (s) => {
      const start = Date.now();
      const r = await grokAdapter.analyze(s.tabs, s.minutes, key);
      return { name: s.name, ms: Date.now() - start, topic: r.topic, summary: r.summary, todos: r.todos.length, groups: r.groups.length };
    })
  );
  const totalMs = Date.now() - t0;
  console.log(`\n=== ${scenarios.length} parallel calls in ${totalMs}ms ===\n`);
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      const v = r.value;
      console.log(`PASS ${v.name} [${v.ms}ms]`);
      console.log(`     topic="${v.topic}" todos=${v.todos} groups=${v.groups}`);
      console.log(`     summary: ${v.summary}\n`);
    } else {
      console.log(`FAIL ${scenarios[i].name}: ${r.reason?.message ?? r.reason}\n`);
    }
  });
  const passed = results.filter(r => r.status === "fulfilled").length;
  console.log(`Result: ${passed}/${scenarios.length} passed`);
  process.exit(passed === scenarios.length ? 0 : 1);
})();
