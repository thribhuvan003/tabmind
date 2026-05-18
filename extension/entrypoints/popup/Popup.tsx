import { useEffect, useState } from "react";
import { getLatestSession, getActiveApiKey } from "../../lib/storage";
import type { SessionSnapshot } from "../../lib/types";

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Geist", "Inter", system-ui, sans-serif;
    background: #0b0b0f;
    color: #f3f4f7;
    min-width: 320px; max-width: 348px;
    -webkit-font-smoothing: antialiased;
  }
  @keyframes rise {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .body { animation: rise 260ms cubic-bezier(0.16,1,0.3,1) both; }
  .eyebrow {
    font-size: 9.5px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: #a78bfa;
  }
  .todo {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 7px 10px;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
    border-left: 2px solid rgba(167,139,250,0.4);
    border-radius: 7px; font-size: 12px;
    color: rgba(243,244,247,0.8); line-height: 1.5;
  }
  .btn-primary {
    width: 100%; padding: 11px; font-size: 13px; font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    box-shadow: 0 3px 14px rgba(124,58,237,0.3);
    transition: box-shadow 200ms cubic-bezier(0.16,1,0.3,1);
  }
  .btn-primary:hover { box-shadow: 0 5px 22px rgba(124,58,237,0.45); }
  .btn-ghost {
    display: block; width: 100%; text-align: center; padding: 10px;
    font-size: 12.5px; font-weight: 500;
    color: rgba(167,139,250,0.85);
    background: rgba(167,139,250,0.08);
    border: 1px solid rgba(167,139,250,0.2);
    border-radius: 9px; cursor: pointer;
    transition: background 150ms ease;
  }
  .btn-ghost:hover { background: rgba(167,139,250,0.14); }
`;

export function Popup() {
  const [session, setSession] = useState<SessionSnapshot | null>(null);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    Promise.all([
      getLatestSession(),
      getActiveApiKey(),
    ]).then(([s, activeKey]) => {
      setSession(s);
      setHasKey(Boolean(activeKey.key));
    }).catch(() => {
      setSession(null);
      setHasKey(false);
    });
  }, []);

  const mins = session ? Math.max(1, Math.round(session.durationMs / 60_000)) : 0;
  const loading = hasKey === null;

  function openWidget() {
    chrome.runtime.sendMessage({ type: "TABMIND_OPEN_WIDGET_ACTIVE" }, () => {
      window.close();
    });
  }

  return (
    <>
      <style>{CSS}</style>

      {/* header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "13px 16px 11px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="pg" x1="0" y1="0" x2="24" y2="24">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#6d28d9" />
              </linearGradient>
            </defs>
            <circle cx="12" cy="12" r="9" stroke="url(#pg)" strokeWidth="1.4" opacity="0.55" />
            <ellipse cx="12" cy="12" rx="9" ry="3.6" stroke="url(#pg)" strokeWidth="1.2" opacity="0.4" transform="rotate(-28 12 12)" />
            <circle cx="12" cy="12" r="2.6" fill="url(#pg)" />
            <circle cx="20" cy="6.5" r="1.5" fill="#a78bfa" />
          </svg>
          <span style={{ fontSize: 13.5, fontWeight: 650, letterSpacing: "-0.02em" }}>TabMind</span>
          <span style={{
            fontSize: 9.5, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase",
            color: "#a78bfa", background: "rgba(167,139,250,0.14)",
            border: "1px solid rgba(167,139,250,0.28)", padding: "2px 6px", borderRadius: 99,
          }}>AI</span>
        </div>
        <button type="button"
          onClick={() => chrome.runtime.openOptionsPage()}
          title="Settings"
          style={{
            width: 28, height: 28, border: "none", background: "transparent",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 7, color: "rgba(255,255,255,0.3)",
            transition: "all 150ms ease",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.3)"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
          </svg>
        </button>
      </div>

      {/* body */}
      <div className="body" style={{ padding: "14px 16px 16px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[80, 100, 65].map((w, i) => (
              <div key={i} style={{ height: i === 0 ? 10 : 8, width: `${w}%`, background: "rgba(255,255,255,0.06)", borderRadius: 4 }} />
            ))}
          </div>

        ) : !hasKey ? (
          <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" stroke="#a78bfa" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p style={{ fontSize: 13, color: "rgba(243,244,247,0.8)", fontWeight: 550, marginBottom: 4 }}>Add your API key</p>
            <p style={{ fontSize: 11.5, color: "rgba(148,163,184,0.7)", lineHeight: 1.5, marginBottom: 16 }}>
              Free Gemini key from Google AI Studio - takes 30 seconds.
            </p>
            <button type="button" className="btn-ghost" onClick={() => chrome.runtime.openOptionsPage()}>
              Open settings
            </button>
          </div>

        ) : session ? (
          <>
            <div style={{ marginBottom: 12 }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Working on - {mins}m</div>
              <div style={{ fontSize: 15, fontWeight: 650, letterSpacing: "-0.02em", color: "#f3f4f7", marginBottom: 6 }}>
                {session.topic}
              </div>
              <p style={{ fontSize: 12.5, lineHeight: 1.6, color: "rgba(161,164,176,0.9)", letterSpacing: "-0.005em" }}>
                {session.narrative || session.summary}
              </p>
            </div>

            {session.todos?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Action items</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {session.todos.slice(0, 3).map((todo, i) => (
                    <div key={i} className="todo">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ marginTop: 3, flexShrink: 0 }}>
                        <rect x=".75" y=".75" width="10.5" height="10.5" rx="2.5" stroke="rgba(167,139,250,0.55)" strokeWidth="1.2" />
                      </svg>
                      <span style={{ flex: 1 }}>{typeof todo === "string" ? todo : todo.text}</span>
                      {typeof todo !== "string" && todo.deadline && (
                        <span style={{ fontSize: 10, color: "#fcd34d", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.22)", padding: "1px 6px", borderRadius: 99, fontVariantNumeric: "tabular-nums" }}>
                          {todo.deadline}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button type="button" className="btn-primary" onClick={openWidget}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
                <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Open widget on this page
            </button>
          </>

        ) : (
          <div style={{ padding: "6px 0 8px" }}>
            <p style={{ fontSize: 13, color: "rgba(148,163,184,0.6)", fontStyle: "italic", lineHeight: 1.55, marginBottom: 14 }}>
              Watching your tabs silently...<br />First snapshot in up to 90 seconds.
            </p>
            <button type="button" className="btn-primary" onClick={() => {
              chrome.runtime.sendMessage({ type: "TABMIND_SNAPSHOT_NOW" });
              window.close();
            }}>
              Analyze now
            </button>
          </div>
        )}
      </div>
    </>
  );
}
