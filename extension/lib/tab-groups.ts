import type { TabGroup } from "./types";

const PALETTE: chrome.tabGroups.ColorEnum[] = [
  "purple",
  "blue",
  "cyan",
  "green",
  "yellow",
  "pink",
  "orange",
  "red",
];

/**
 * Apply AI-suggested groups to the user's actual browser tab groups.
 * Best-effort: any API failure is swallowed so the session pipeline never breaks.
 */
export async function applyTabGroups(groups: TabGroup[]): Promise<void> {
  if (!chrome.tabs.group || !chrome.tabGroups?.update) return;

  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    if (g.tabIds.length < 2) continue; // single-tab groups are noise
    try {
      const groupId = await new Promise<number>((resolve, reject) => {
        chrome.tabs.group({ tabIds: g.tabIds }, (id) => {
          if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
          resolve(id);
        });
      });
      await new Promise<void>((resolve, reject) => {
        chrome.tabGroups.update(
          groupId,
          { title: g.label, color: PALETTE[i % PALETTE.length], collapsed: false },
          () => {
            if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
            resolve();
          }
        );
      });
    } catch {
      /* silent — grouping is enhancement, not core */
    }
  }
}
