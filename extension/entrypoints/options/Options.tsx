import { useState, useEffect } from "react";
import { storageGet, storageSet, getBlocklist, setBlocklist } from "../../lib/storage";
import type { AiProvider } from "../../lib/types";
import { DEFAULT_BLOCKLIST } from "../../lib/types";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Geist", "Inter", system-ui, sans-serif;
    background: #07080d; color: #f3f4f7;
    min-height: 100vh; -webkit-font-smoothing: antialiased;
    display: flex; align-items: flex-start; justify-content: center;
    padding: 48px 24px;
  }
  #root { width: 100%; max-width: 640px; }
  .card {
    background: rgba(255,255,255,0.022);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; padding: 32px 36px; margin-bottom: 16px;
  }
  .card-title { font-size: 14.5px; font-weight: 650; letter-spacing: -0.02em; color: #e8eaf0; margin-bottom: 20px; }
  .label {
    font-size: 10.5px; font-weight: 600; letter-spacing: 0.09em;
    text-transform: uppercase; color: #a78bfa; margin-bottom: 6px; display: block;
  }
  .input {
    width: 100%; padding: 11px 14px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
    border-radius: 10px; font-size: 13.5px; color: #f3f4f7;
    font-family: "Geist Mono", monospace; outline: none; letter-spacing: 0.03em;
    transition: border-color 200ms ease, box-shadow 200ms ease;
  }
  .input:focus { border-color: rgba(167,139,250,0.5); box-shadow: 0 0 0 3px rgba(167,139,250,0.1); }
  .input::placeholder { color: #42454f; }
  .btn-save {
    margin-top: 18px; padding: 11px 28px; font-size: 13.5px; font-weight: 600;
    letter-spacing: -0.01em; color: #fff;
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; cursor: pointer;
    box-shadow: 0 4px 16px rgba(124,58,237,0.3);
    transition: box-shadow 200ms ease, transform 120ms ease;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-save:hover { box-shadow: 0 6px 24px rgba(124,58,237,0.45); transform: translateY(-1px); }
  .btn-save:active { transform: translateY(0); }
  .btn-save:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  .btn-danger {
    padding: 11px 20px; font-size: 13px; font-weight: 500;
    color: #64748b; background: transparent;
    border: 1px solid rgba(255,255,255,0.09); border-radius: 10px; cursor: pointer;
    transition: all 150ms ease;
  }
  .btn-danger:hover { color: #ef4444; border-color: rgba(239,68,68,0.3); }
  .status-ok {
    display: flex; align-items: center; gap: 6px;
    font-size: 12.5px; color: #4ade80; padding: 8px 12px;
    background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.2);
    border-radius: 8px; margin-top: 12px;
  }
  .hint { font-size: 12px; color: #4b5568; line-height: 1.6; margin-top: 10px; }
  .hint a { color: #a78bfa; text-decoration: none; }
  .hint a:hover { text-decoration: underline; }
  .tab-bar { display: flex; gap: 4px; margin-bottom: 20px; }
  .tab {
    flex: 1; padding: 9px; font-size: 13px; font-weight: 500; text-align: center;
    border-radius: 9px; cursor: pointer; border: 1px solid transparent;
    transition: all 160ms ease; color: #6b6f7d; background: transparent;
  }
  .tab.active { color: #f3f4f7; background: rgba(167,139,250,0.12); border-color: rgba(167,139,250,0.25); }
  .row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 11px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
    font-size: 13px;
  }
  .row:last-child { border-bottom: none; padding-bottom: 0; }
  .row-key { color: #4b5568; }
  .row-val { color: #94a3b8; font-family: "Geist Mono", monospace; font-size: 12px; }
  .blocklist-tag {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 9px; border-radius: 99px; font-size: 11.5px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
    color: #a1a4b0; cursor: pointer; transition: background 120ms ease;
  }
  .blocklist-tag:hover { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.25); color: #fca5a5; }
  .tag { font-size: 9px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #a78bfa; background: rgba(167,139,250,0.14); border: 1px solid rgba(167,139,250,0.25); padding: 2px 8px; border-radius: 99px; }
  .provider-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 24px; }
  .provider-btn {
    padding: 12px 8px; border-radius: 10px; cursor: pointer; border: 1px solid rgba(255,255,255,0.09);
    background: rgba(255,255,255,0.03); color: #6b6f7d; font-size: 12px; font-weight: 500;
    text-align: center; transition: all 160ms ease; line-height: 1.4;
  }
  .provider-btn.active {
    color: #e4d9ff; background: rgba(167,139,250,0.12);
    border-color: rgba(167,139,250,0.4);
    box-shadow: 0 0 0 3px rgba(167,139,250,0.08);
  }
  .provider-btn .provider-name { font-size: 13px; font-weight: 600; display: block; }
  .provider-btn .provider-sub { font-size: 10px; opacity: 0.6; display: block; margin-top: 2px; }
  .free-badge {
    display: inline-block; font-size: 9px; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; padding: 1px 6px; border-radius: 99px;
    background: rgba(74,222,128,0.12); color: #4ade80;
    border: 1px solid rgba(74,222,128,0.25); margin-top: 4px;
  }
`;

export function Options() {
  const [tab, setTab] = useState<"api" | "blocklist" | "about">("api");
  const [provider, setProvider] = useState<AiProvider>("grok");
  const [grokKey, setGrokKey] = useState("");
  const [claudeKey, setClaudeKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [blocklist, setBlocklistState] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState("");

  useEffect(() => {
    Promise.all([
      storageGet("tabmind:grok:apiKey"),
      storageGet("tabmind:claude:apiKey"),
      storageGet("tabmind:gemini:apiKey"),
      storageGet("tabmind:openai:apiKey"),
      storageGet("tabmind:provider"),
      getBlocklist(),
    ]).then(([xk, ck, gk, ok, prov, bl]) => {
      if (xk) setGrokKey(xk);
      if (ck) setClaudeKey(ck);
      if (gk) setGeminiKey(gk);
      if (ok) setOpenaiKey(ok);
      if (prov) setProvider(prov);
      setBlocklistState(bl);
    });
  }, []);

  const handleSave = async () => {
    await Promise.all([
      storageSet("tabmind:provider", provider),
      storageSet("tabmind:grok:apiKey", grokKey.trim()),
      storageSet("tabmind:claude:apiKey", claudeKey.trim()),
      storageSet("tabmind:gemini:apiKey", geminiKey.trim()),
      storageSet("tabmind:openai:apiKey", openaiKey.trim()),
    ]);
    chrome.runtime.sendMessage({ type: "TABMIND_SNAPSHOT_NOW" }).catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const activeKeyFilled = () => {
    if (provider === "grok") return !!grokKey.trim();
    if (provider === "claude") return !!claudeKey.trim();
    if (provider === "openai") return !!openaiKey.trim();
    return !!geminiKey.trim();
  };

  const handleClearKeys = async () => {
    await Promise.all([
      storageSet("tabmind:grok:apiKey", ""),
      storageSet("tabmind:claude:apiKey", ""),
      storageSet("tabmind:gemini:apiKey", ""),
      storageSet("tabmind:openai:apiKey", ""),
    ]);
    setGrokKey(""); setClaudeKey(""); setGeminiKey(""); setOpenaiKey("");
  };

  const addDomain = async () => {
    const d = newDomain.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
    if (!d || blocklist.includes(d)) return;
    const next = [...blocklist, d];
    setBlocklistState(next);
    await setBlocklist(next);
    setNewDomain("");
  };

  const removeDomain = async (d: string) => {
    const next = blocklist.filter((x) => x !== d);
    setBlocklistState(next);
    await setBlocklist(next);
  };

  const resetBlocklist = async () => {
    setBlocklistState(DEFAULT_BLOCKLIST);
    await setBlocklist(DEFAULT_BLOCKLIST);
  };

  return (
    <>
      <style>{CSS}</style>

      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="og" x1="0" y1="0" x2="24" y2="24">
                <stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#6d28d9" />
              </linearGradient>
            </defs>
            <circle cx="12" cy="12" r="9" stroke="url(#og)" strokeWidth="1.4" opacity="0.55" />
            <ellipse cx="12" cy="12" rx="9" ry="3.6" stroke="url(#og)" strokeWidth="1.2" opacity="0.4" transform="rotate(-28 12 12)" />
            <circle cx="12" cy="12" r="2.6" fill="url(#og)" />
            <circle cx="20" cy="6.5" r="1.5" fill="#a78bfa" />
          </svg>
          <h1 style={{ fontSize: 22, fontWeight: 760, letterSpacing: "-0.03em" }}>TabMind</h1>
          <span className="tag">Settings</span>
        </div>
        <p style={{ fontSize: 13.5, color: "#64748b", letterSpacing: "-0.005em" }}>
          Configure your AI session tracker
        </p>
      </div>

      <div className="tab-bar">
        {(["api", "blocklist", "about"] as const).map((t) => (
          <button key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
            {t === "api" ? "AI Provider" : t === "blocklist" ? "Privacy" : "About"}
          </button>
        ))}
      </div>

      {tab === "api" && (
        <div className="card">
          <div className="card-title">AI Provider</div>

          <label className="label">Choose provider</label>
          <div className="provider-grid">
            {([
              { id: "grok" as AiProvider, name: "Grok", sub: "grok-3-mini", free: true },
              { id: "claude" as AiProvider, name: "Claude", sub: "Haiku 4.5", free: true },
              { id: "gemini" as AiProvider, name: "Gemini", sub: "2.0 Flash", free: true },
              { id: "openai" as AiProvider, name: "OpenAI", sub: "GPT-4o mini", free: false },
            ]).map((p) => (
              <button
                key={p.id}
                className={`provider-btn${provider === p.id ? " active" : ""}`}
                onClick={() => setProvider(p.id)}
              >
                <span className="provider-name">{p.name}</span>
                <span className="provider-sub">{p.sub}</span>
                {p.free && <span className="free-badge">free tier</span>}
              </button>
            ))}
          </div>

          {provider === "grok" && (
            <>
              <label className="label" htmlFor="grok-key">xAI API key</label>
              <input id="grok-key" className="input" type="password" value={grokKey}
                onChange={(e) => setGrokKey(e.target.value)} placeholder="gsk_…" autoComplete="off" />
              <p className="hint">
                Get a key from <a href="https://console.x.ai" target="_blank" rel="noopener">console.x.ai</a>.
                Uses <strong style={{ color: "#c4b5fd" }}>grok-3-mini</strong> — fast, free tier available.
              </p>
            </>
          )}

          {provider === "claude" && (
            <>
              <label className="label" htmlFor="claude-key">Anthropic API key</label>
              <input id="claude-key" className="input" type="password" value={claudeKey}
                onChange={(e) => setClaudeKey(e.target.value)} placeholder="sk-ant-…" autoComplete="off" />
              <p className="hint">
                Get a free key from <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a>.
                Uses <strong style={{ color: "#c4b5fd" }}>claude-haiku-4-5</strong> — fastest model, generous free tier.
              </p>
            </>
          )}

          {provider === "gemini" && (
            <>
              <label className="label" htmlFor="gemini-key">Gemini API key</label>
              <input id="gemini-key" className="input" type="password" value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)} placeholder="AIzaSy…" autoComplete="off" />
              <p className="hint">
                Free key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com</a> — create a <strong style={{ color: "#c4b5fd" }}>new project</strong> to get free tier access.
              </p>
            </>
          )}

          {provider === "openai" && (
            <>
              <label className="label" htmlFor="openai-key">OpenAI API key</label>
              <input id="openai-key" className="input" type="password" value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)} placeholder="sk-…" autoComplete="off" />
              <p className="hint">
                Key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">platform.openai.com</a>.
                Uses gpt-4o-mini — costs ~$0.001 per session analysis.
              </p>
            </>
          )}

          {saved && (
            <div className="status-ok">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Saved — analyzing your tabs now…
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button className="btn-save" onClick={handleSave} disabled={!activeKeyFilled()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Save & analyze now
            </button>
            {(grokKey || claudeKey || geminiKey || openaiKey) && (
              <button className="btn-danger" onClick={handleClearKeys}>Clear keys</button>
            )}
          </div>
        </div>
      )}

      {tab === "blocklist" && (
        <div className="card">
          <div className="card-title">Privacy — blocked domains</div>
          <p style={{ fontSize: 12.5, color: "#4b5568", lineHeight: 1.6, marginBottom: 20 }}>
            TabMind will never extract page text from these domains.
            Tab titles and URLs are still used for session summaries.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {blocklist.map((d) => (
              <button key={d} className="blocklist-tag" onClick={() => removeDomain(d)} title="Click to remove">
                {d} <span style={{ opacity: 0.5, fontSize: 10 }}>×</span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input" style={{ fontFamily: "inherit", flex: 1 }}
              placeholder="example.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addDomain()}
            />
            <button className="btn-save" style={{ marginTop: 0, flexShrink: 0 }} onClick={addDomain}
              disabled={!newDomain.trim()}>Add</button>
          </div>
          <button
            onClick={resetBlocklist}
            style={{ marginTop: 14, fontSize: 12, color: "#4b5568", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >Reset to defaults ↺</button>
        </div>
      )}

      {tab === "about" && (
        <div className="card">
          <div className="card-title">Session settings</div>
          {[
            ["Snapshot interval", "90 seconds"],
            ["History kept", "50 sessions"],
            ["Session reset", "5 min idle"],
            ["Notes storage", "chrome.storage.sync"],
            ["Keys storage", "chrome.storage.sync (encrypted by Chrome)"],
            ["Snapshots storage", "chrome.storage.local"],
            ["Tab grouping", "automatic, via chrome.tabGroups"],
            ["Keyboard shortcut", "⌘⇧K / Ctrl+Shift+K"],
          ].map(([k, v]) => (
            <div key={k} className="row">
              <span className="row-key">{k}</span>
              <span className="row-val">{v}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
            {[
              { label: "Source code", href: "https://github.com/thribhuvan003/tabmind" },
              { label: "Report issue", href: "https://github.com/thribhuvan003/tabmind/issues" },
            ].map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12.5, color: "#4b5568", textDecoration: "none" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#94a3b8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#4b5568"; }}>
                {label} →
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
