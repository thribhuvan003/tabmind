import ReactDOM from "react-dom/client";
import { Widget } from "../../components/widget/Widget";
import { useWidgetStore } from "../../stores/widget.store";
import { initSentry } from "../../lib/sentry";

initSentry("content");

const MAX_EXCERPT = 4000;

/** Strip noisy elements from a cloned subtree and return clean text. */
function extractText(root: HTMLElement): string {
  const clone = root.cloneNode(true) as HTMLElement;
  // Remove chrome noise
  clone.querySelectorAll(
    "nav,header,footer,aside,script,style,noscript,svg,iframe," +
    "[role='navigation'],[role='banner'],[role='complementary']," +
    ".sidebar,.nav,.header,.footer,.cookie,.ad,.advertisement,.popup"
  ).forEach((el) => el.remove());
  return (clone.textContent ?? "").replace(/\s+/g, " ").trim();
}

/** Pull a clean text excerpt — reads the richest content available on the page. */
function getPageExcerpt(): string {
  // Priority selector list: most specific → most generic
  const candidates = [
    "[role='main']",
    "main",
    "article",
    ".markdown-body",     // GitHub README / PR / wiki
    ".js-discussion",     // GitHub issue comments
    ".answer",            // Stack Overflow top answer
    ".question-body",     // Stack Overflow question
    ".s-prose",           // Stack Overflow prose
    "[itemprop='articleBody']",
    "#readme",
    "#content",
    ".content",
    ".post-content",
    ".entry-content",
  ];
  for (const sel of candidates) {
    const el = document.querySelector(sel) as HTMLElement | null;
    if (el) {
      const text = extractText(el);
      if (text.length > 300) return text.slice(0, MAX_EXCERPT);
    }
  }
  return extractText(document.body).slice(0, MAX_EXCERPT);
}

/** Watch SPA route changes so per-URL notes reload on pushState/replaceState. */
function installUrlWatcher(onChange: (url: string) => void) {
  let lastUrl = location.href;
  const tick = () => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      onChange(lastUrl);
    }
  };
  const wrap = (k: "pushState" | "replaceState") => {
    const orig = history[k];
    history[k] = function (this: History, ...args: Parameters<typeof orig>) {
      const r = orig.apply(this, args as never);
      queueMicrotask(tick);
      return r;
    } as typeof orig;
  };
  wrap("pushState");
  wrap("replaceState");
  window.addEventListener("popstate", tick);
  window.addEventListener("hashchange", tick);
}

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_idle",
  cssInjectionMode: "ui",
  async main(ctx) {
    // Page-excerpt provider for the background snapshot pipeline.
    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (msg?.type === "TABMIND_GET_EXCERPT") {
        sendResponse({ text: getPageExcerpt() });
        return;
      }
    });

    const ui = await createShadowRootUi(ctx, {
      name: "tabmind-widget",
      position: "overlay",
      anchor: "body",
      append: "last",
      zIndex: 2147483647,
      onMount(container) {
        const root = ReactDOM.createRoot(container);
        root.render(<Widget />);
        return root;
      },
      onRemove(root) {
        root?.unmount();
      },
    });
    ui.mount();

    // SPA-aware note reload.
    installUrlWatcher((url) => {
      try {
        useWidgetStore.getState().loadNote(url);
      } catch {
        /* store not yet hydrated */
      }
    });

    // Re-detect API key when user saves it in Settings (storage change from options page).
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "sync" && (
        changes["tabmind:grok:apiKey"] ||
        changes["tabmind:claude:apiKey"] ||
        changes["tabmind:gemini:apiKey"] ||
        changes["tabmind:openai:apiKey"] ||
        changes["tabmind:openrouter:apiKey"] ||
        changes["tabmind:cerebras:apiKey"] ||
        changes["tabmind:provider"]
      )) {
        try { useWidgetStore.getState().checkApiKey(); } catch { /* */ }
      }
    });

    // Popup → "open widget here" + ⌘⇧K toggle + session updates.
    chrome.runtime.onMessage.addListener((msg) => {
      try {
        const s = useWidgetStore.getState();
        if (msg?.type === "TABMIND_OPEN_WIDGET") {
          s.setMinimized(false);
        } else if (msg?.type === "TABMIND_TOGGLE_WIDGET") {
          s.setMinimized(!s.minimized);
        } else if (msg?.type === "TABMIND_SESSION_UPDATED") {
          s.loadSession();
          s.loadTasks();
          s.checkApiKey();
        } else if (msg?.type === "TABMIND_TASKS_UPDATED") {
          s.loadTasks();
        }
      } catch {
        /* */
      }
    });
  },
});
