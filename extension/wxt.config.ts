import { defineConfig } from "wxt";

export default defineConfig({
  extensionApi: "chrome",
  framework: "react",
  manifest: {
    name: "TabMind - AI Session Tracker",
    version: "1.0.0",
    description:
      "A passive AI that watches your tabs and tells you what you're actually working on - sessions, deadlines, notes, and smart tab groups, all in a Superhuman-style glass widget.",
    permissions: ["tabs", "tabGroups", "storage", "scripting", "alarms", "idle"],
    host_permissions: ["<all_urls>"],
    icons: {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png",
    },
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
    commands: {
      "tabmind-toggle": {
        suggested_key: { default: "Ctrl+Shift+K", mac: "Command+Shift+K" },
        description: "Toggle TabMind widget on the active tab",
      },
    },
  },
});
