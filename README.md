# TabMind

> **AI-powered session tracker for Chrome** — understands what you're working on, extracts tasks, and keeps everything local.

TabMind runs silently in the background, reads your open tabs every 90 seconds, and uses your chosen AI provider to produce a plain-English summary of your work session, pull out action items, and group related tabs automatically. Everything is stored **on your machine only** — no servers, no accounts, no tracking.

---

## Features

- **Session awareness** — auto-detects your current focus: "Debugging a React hydration issue" not just a list of URLs
- **Floating widget** — draggable, minimizable panel injected on every page; shows topic, narrative, tasks, notes, and goals
- **Task manager** — add tasks manually or let AI extract them from your tabs; supports categories, time estimates, scheduling (Today / Tomorrow / Someday), and daily rollover
- **Per-URL notes** — jot anything against the current page; persists across navigations
- **Quick notes** — global note capture with Work / Personal / Ideas / Learning categories; visible in the Dashboard
- **Goals + AI breakdown** — type a goal, get 5 concrete sub-tasks back from the AI in seconds
- **Dashboard** — full-page view of session history, week calendar, note folders, and goal progress
- **Tab grouping** — automatically groups Chrome tabs by topic using `chrome.tabGroups`
- **6 AI providers** — OpenRouter, Cerebras, Grok/Groq, Claude, Gemini, OpenAI (all with free tiers available)
- **Privacy controls** — domain blocklist; blocked sites never send page text to AI
- **Keyboard shortcut** — `Ctrl+Shift+K` / `Cmd+Shift+K` to toggle the widget

---

## Quick Start

### 1 — Prerequisites

- **Node.js 18+** and **npm**
- A free API key from any of the supported providers (see [Providers](#providers) below)

### 2 — Build

```bash
git clone https://github.com/thribhuvan003/tabmind.git
cd tabmind/extension
npm install
npm run build
```

### 3 — Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/.output/chrome-mv3` folder

### 4 — Add your API key

1. Click the TabMind icon in your toolbar
2. Click **Open settings** (or visit `chrome://extensions` → TabMind → Options)
3. Paste your API key — the provider is detected automatically from the key prefix
4. Click **Save & analyze now**

The widget will appear on the current page within a few seconds.

---

## Providers

All providers work with the same paste-and-go flow. TabMind detects the provider from the key prefix automatically.

| Provider | Free Tier | Key prefix | Get a key |
|----------|-----------|------------|-----------|
| **OpenRouter** ⭐ | Yes — 300+ models | `sk-or-v1-` | [openrouter.ai/keys](https://openrouter.ai/keys) |
| **Cerebras** ⭐ | Yes — fastest inference | `csk-` | [cloud.cerebras.ai](https://cloud.cerebras.ai/platform/api-keys) |
| **Gemini** | Yes | `AIzaSy` | [aistudio.google.com](https://aistudio.google.com/apikey) |
| **Claude** | Yes | `sk-ant-` | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| **Grok / Groq** | Groq free tier | `xai-` or `gsk_` | [console.x.ai](https://console.x.ai) / [console.groq.com](https://console.groq.com/keys) |
| **OpenAI** | Paid | `sk-` | [platform.openai.com](https://platform.openai.com/api-keys) |

> **Recommended for first-time users:** OpenRouter or Cerebras — both have generous free tiers and require no credit card.

---

## How it works

```
Every 90 seconds
  └─ Background service worker wakes up
       └─ Queries all open tabs (title + URL + page excerpt)
            └─ Sends to your AI provider
                 └─ Gets back: topic · narrative · todos · tab groups
                      ├─ Saves snapshot to chrome.storage.local
                      ├─ Groups Chrome tabs by topic
                      ├─ Merges extracted todos into your task list
                      └─ Broadcasts update → widget refreshes on every open tab
```

**What is sent to AI:**
- Tab titles and URLs (always)
- A short text excerpt from the page body (unless the domain is on your blocklist)

**What stays local:**
- All snapshots, notes, tasks, goals — stored in `chrome.storage.local` / `chrome.storage.sync`
- Your API key — stored in `chrome.storage.sync` (encrypted by Chrome, never leaves your browser to TabMind servers)

---

## Widget

The floating widget appears on every page. You can:

| Action | How |
|--------|-----|
| **Move** | Drag the header bar |
| **Minimize** | Click `—` or press `Escape` |
| **Restore** | Click the purple orb |
| **Toggle** | `Ctrl+Shift+K` / `Cmd+Shift+K` |
| **Refresh** | Click `↻` in the header |

Tabs inside the widget:

- **Today** — task list with category filter, week calendar, and quick-add
- **Notes** — per-page note + global quick notes with category tagging
- **Goals** — set a goal, AI breaks it into 5 actionable tasks
- **AI** — current session topic, narrative, tab groups, and continue hint

---

## Development

```bash
# Extension with hot reload
cd extension
npm run dev

# Landing page (Next.js)
cd web
npm install && npm run dev
```

### Run tests

```bash
cd extension
npm test
```

20 unit tests covering storage routing, session engine, task scheduling, AI adapter, and background alarms.

---

## Project structure

```
tabmind/
├── extension/
│   ├── entrypoints/
│   │   ├── background/     # Service worker — alarms, snapshot pipeline, message router
│   │   ├── content/        # Injects widget into every page, extracts page text
│   │   ├── popup/          # Toolbar popup — session summary + quick actions
│   │   ├── options/        # Settings page — API keys, provider, blocklist
│   │   └── dashboard/      # Full-page dashboard — history, calendar, notes, goals
│   ├── components/
│   │   └── widget/         # Draggable floating widget (React + CSS)
│   ├── lib/
│   │   ├── ai/             # Provider adapters (grok, claude, gemini, openai, openrouter, cerebras)
│   │   ├── session-engine  # Tab capture + AI analysis pipeline
│   │   ├── storage.ts      # Chrome storage abstraction
│   │   ├── tasks.ts        # Task CRUD + rollover logic
│   │   └── types.ts        # Shared TypeScript types
│   ├── stores/
│   │   └── widget.store.ts # Zustand state for the widget
│   └── __tests__/          # Vitest unit tests
└── web/                    # Next.js landing page
```

---

## Privacy

- **No backend.** TabMind has no server. There is nothing to sign up for.
- **No analytics.** Zero tracking, zero telemetry by default.
- **Blocklist.** Banking, email, and calendar domains are blocked by default. Add any domain in Settings → Privacy.
- **Blocked domains:** page text is never extracted; only tab title and URL are used.
- **API keys** are stored in Chrome's encrypted sync storage and sent only to your chosen AI provider.

---

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+K` / `Cmd+Shift+K` | Toggle widget |
| `Escape` (when widget is open, focus outside inputs) | Minimize widget |
| `Enter` in task input | Add task |
| `Enter` in note input | Save note |
| `Ctrl+Enter` / `Cmd+Enter` in goal input | Break down goal |

---

## Tech stack

- **WXT** — Chrome extension framework (MV3)
- **React 18** + **Zustand** — widget UI and state
- **Vitest** — unit testing
- **TypeScript** — throughout
- **chrome.storage** — all persistence (local + sync)

---

## License

MIT — use it, fork it, build on it.
