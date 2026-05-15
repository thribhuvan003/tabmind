import ReactDOM from "react-dom/client";
import { Widget } from "../../components/widget/Widget";
import { useWidgetStore } from "../../stores/widget.store";
import { initSentry } from "../../lib/sentry";

initSentry("content");

const MAX_EXCERPT = 2000;

/** Pull a clean text excerpt from the page, preferring main/article over chrome. */
function getPageExcerpt(): string {
  const root =
    document.querySelector("main") ||
    document.querySelector("article") ||
    document.body;
  if (!root) return "";
  const text = (root as HTMLElement).innerText || "";
  return text.replace(/\s+/g, " ").trim().slice(0, MAX_EXCERPT);
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
        changes["tabmind:gemini:apiKey"] ||
        changes["tabmind:openai:apiKey"] ||
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
