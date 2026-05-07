import ReactDOM from "react-dom/client";
import { Widget } from "../../components/widget/Widget";

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",
  async main(ctx) {
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
  },
});
