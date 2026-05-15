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
  // Avoid script/style noise — innerText already strips those.
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
  // Wrap History API
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
        return; // sync response
      }
    });

    const ui = await createShadowRootUi(ctx, {
      name: "tabmind-widget",
      position: "overlay",
      anchor: "body",
      append: "last",
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

    // Popup → "open widget here" + ⌘⇧K toggle.
    chrome.runtime.onMessage.addListener((msg) => {
      try {
        if (msg?.type === "TABMIND_OPEN_WIDGET") {
          useWidgetStore.getState().setMinimized(false);
        } else if (msg?.type === "TABMIND_TOGGLE_WIDGET") {
          const s = useWidgetStore.getState();
          s.setMinimized(!s.minimized);
        }
      } catch {
        /* */
      }
    });
  },
});
