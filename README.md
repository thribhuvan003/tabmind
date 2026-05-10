# TabMind

Chrome extension that watches your open tabs and figures out what you've been working on. Every 90 seconds it sends tab titles + URLs to Gemini, gets back a short summary, and saves it locally. That's the whole idea.

## How it works

A background service worker fires every 90 seconds, grabs all open tab titles/URLs, and runs them through `gemini-1.5-flash-latest`. The response is stored in `chrome.storage.local` — no backend, no account. On every page there's a floating widget you can drag around that shows the current session topic, summary, any todos Gemini pulled out, and a note field scoped to that URL.

## Setup

You'll need Node 18+ and a Gemini API key from [aistudio.google.com](https://aistudio.google.com/app/apikey) (free tier works fine).

```bash
cd extension
npm install
npm run build
```

Load the unpacked extension in Chrome: `chrome://extensions` → Developer mode → Load unpacked → `extension/.output/chrome-mv3`

Click the toolbar icon, open settings, paste your API key.

## Dev

```bash
# extension with hot reload
cd extension && npm run dev

# landing page
cd web && npm install && npm run dev
```

Tests:

```bash
cd extension && npm test
```

## Structure

```
extension/
  entrypoints/
    background/   service worker, alarm, snapshot runner
    content/      injects the widget
    popup/        toolbar popup
    options/      api key settings
  components/widget/
  lib/            gemini.ts, session-engine.ts, storage.ts, types.ts
  stores/         zustand widget state

web/              next.js landing page
```

## Notes

- Only tab titles and URLs go to Gemini — no page content
- Last 30 sessions kept in `chrome.storage.local`
- Snapshot interval is 90s (`periodInMinutes: 1.5` in the alarm)
- Widget position persists across page navigations via the store
- The floating widget uses a ref for drag position to avoid stale closures in pointer handlers

## License

MIT
