import { useState, useEffect } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: #07080d;
    color: #f0f2f8;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 48px 24px;
  }

  #root { width: 100%; max-width: 620px; }

  .card {
    background: rgba(255,255,255,0.025);
    border: 1px solid #1a1d2e;
    border-radius: 16px;
    padding: 36px 40px;
    margin-bottom: 16px;
  }

  .label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #7c3aed;
    margin-bottom: 6px;
    display: block;
  }

  .input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0;
  }

  .input {
    width: 100%;
    padding: 11px 48px 11px 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid #252840;
    border-radius: 10px;
    font-size: 13.5px;
    color: #f0f2f8;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    outline: none;
    transition: border-color 180ms, box-shadow 180ms;
    letter-spacing: 0.04em;
  }

  .input:focus {
    border-color: rgba(124,58,237,0.5);
    box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
  }

  .input::placeholder { color: #4b5568; letter-spacing: 0.02em; }

  .eye-btn {
    position: absolute;
    right: 10px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    cursor: pointer;
    color: #4b5568;
    border-radius: 6px;
    transition: color 150ms, background 150ms;
  }

  .eye-btn:hover { color: #94a3b8; background: rgba(255,255,255,0.06); }

  .save-btn {
    margin-top: 20px;
    padding: 11px 28px;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: #fff;
    background: linear-gradient(135deg, #7c3aed, #5b21b6);
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.15);
    cursor: pointer;
    transition: all 180ms cubic-bezier(0.16,1,0.3,1);
    box-shadow: 0 4px 16px rgba(124,58,237,0.3);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .save-btn:hover {
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    box-shadow: 0 6px 24px rgba(124,58,237,0.45);
    transform: translateY(-1px);
  }

  .save-btn:active { transform: translateY(0); }
  .save-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .tag {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #a78bfa;
    background: rgba(124,58,237,0.14);
    border: 1px solid rgba(124,58,237,0.25);
    padding: 2px 8px;
    border-radius: 99px;
  }

  .status-ok {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    color: #4ade80;
    padding: 8px 12px;
    background: rgba(74,222,128,0.08);
    border: 1px solid rgba(74,222,128,0.2);
    border-radius: 8px;
    margin-top: 12px;
  }

  .hint {
    font-size: 12px;
    color: #4b5568;
    line-height: 1.6;
    margin-top: 10px;
  }

  .hint a { color: #7c3aed; text-decoration: none; }
  .hint a:hover { text-decoration: underline; }

  .info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #1a1d2e;
    font-size: 13px;
  }
  .info-row:last-child { border-bottom: none; padding-bottom: 0; }
  .info-key { color: #4b5568; }
  .info-val { color: #94a3b8; font-family: monospace; font-size: 12px; }
`;

export function Options() {
  const [apiKey, setApiKey] = useState("");
  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    chrome.storage.local.get("tabmind:gemini:apiKey", (result) => {
      const key = result["tabmind:gemini:apiKey"] as string | undefined;
      if (key) {
        setApiKey(key);
        setHasKey(true);
      }
    });
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    await chrome.storage.local.set({ "tabmind:gemini:apiKey": apiKey.trim() });
    setSaved(true);
    setHasKey(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClear = async () => {
    await chrome.storage.local.remove("tabmind:gemini:apiKey");
    setApiKey("");
    setHasKey(false);
  };

  return (
    <>
      <style>{STYLES}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 24 }}>🧠</span>
          <h1 style={{ fontSize: 22, fontWeight: 760, letterSpacing: "-0.03em", color: "#f0f2f8" }}>
            TabMind
          </h1>
          <span className="tag">Settings</span>
        </div>
        <p style={{ fontSize: 13.5, color: "#64748b", letterSpacing: "-0.005em" }}>
          Configure your AI session tracker
        </p>
      </div>

      {/* API Key card */}
      <div className="card">
        <h2 style={{ fontSize: 15, fontWeight: 650, letterSpacing: "-0.02em", color: "#e8eaf0", marginBottom: 20 }}>
          Gemini API Key
        </h2>

        <label className="label" htmlFor="api-key">
          API Key
        </label>

        <div className="input-wrap">
          <input
            id="api-key"
            className="input"
            type={visible ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            spellCheck={false}
            autoComplete="off"
          />
          <button
            className="eye-btn"
            onClick={() => setVisible((v) => !v)}
            title={visible ? "Hide key" : "Show key"}
            type="button"
          >
            {visible ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
              </svg>
            )}
          </button>
        </div>

        {saved && (
          <div className="status-ok">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Key saved — TabMind will use it on the next snapshot
          </div>
        )}

        <p className="hint">
          Get a free key at{" "}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">
            aistudio.google.com
          </a>
          . Your key is stored in{" "}
          <code style={{ fontFamily: "monospace", fontSize: 11, background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 4 }}>
            chrome.storage.local
          </code>{" "}
          — never sent anywhere except Google's API.
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={!apiKey.trim()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Save key
          </button>

          {hasKey && (
            <button
              onClick={handleClear}
              style={{
                padding: "11px 20px",
                fontSize: 13.5,
                fontWeight: 500,
                color: "#64748b",
                background: "transparent",
                border: "1px solid #252840",
                borderRadius: 10,
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#252840";
              }}
            >
              Clear key
            </button>
          )}
        </div>
      </div>

      {/* Session info card */}
      <div className="card">
        <h2 style={{ fontSize: 15, fontWeight: 650, letterSpacing: "-0.02em", color: "#e8eaf0", marginBottom: 20 }}>
          Session settings
        </h2>

        <div className="info-row">
          <span className="info-key">Snapshot interval</span>
          <span className="info-val">90 seconds</span>
        </div>
        <div className="info-row">
          <span className="info-key">History limit</span>
          <span className="info-val">30 sessions</span>
        </div>
        <div className="info-row">
          <span className="info-key">Storage</span>
          <span className="info-val">chrome.storage.local</span>
        </div>
        <div className="info-row">
          <span className="info-key">AI model</span>
          <span className="info-val">gemini-1.5-flash-latest</span>
        </div>
        <div className="info-row">
          <span className="info-key">Data sent to Gemini</span>
          <span className="info-val">tab titles + URLs only</span>
        </div>
      </div>

      {/* Links */}
      <div style={{ display: "flex", gap: 16, paddingTop: 8 }}>
        {[
          { label: "View source", href: "https://github.com/thribhuvan003/tabmind" },
          { label: "Report an issue", href: "https://github.com/thribhuvan003/tabmind/issues" },
          { label: "TabMind website", href: "https://tabmind.dev" },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12.5, color: "#4b5568", textDecoration: "none" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#94a3b8"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#4b5568"; }}
          >
            {label} →
          </a>
        ))}
      </div>
    </>
  );
}
