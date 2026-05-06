import { defineConfig } from "wxt";

export default defineConfig({
  extensionApi: "chrome",
  framework: "react",
  manifest: {
    name: "TabMind — AI Session Tracker",
    version: "1.0.0",
    description: "Passive AI that watches your tabs and surfaces insights proactively. Session summaries, per-page notes, and extracted todos — all stored locally.",
    permissions: ["tabs", "storage", "scripting", "alarms"],
    host_permissions: ["<all_urls>"],
    action: {
      default_popup: "popup/index.html",
      default_icon: {
        "16": "icons/icon16.png",
        "48": "icons/icon48.png",
        "128": "icons/icon128.png",
      },
    },
    options_ui: {
      page: "options/index.html",
      open_in_tab: true,
    },
  },
});
