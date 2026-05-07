import { useEffect, useState } from "react";
import { getLatestSession, storageGet } from "../../lib/storage";
import type { SessionSnapshot } from "../../lib/types";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: linear-gradient(160deg, #0c0e1a 0%, #101326 100%);
    color: #f0f2f8;
    min-width: 320px;
    max-width: 340px;
    -webkit-font-smoothing: antialiased;
  }

  @keyframes slide-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .content { animation: slide-in 0.3s cubic-bezier(0.16,1,0.3,1) both; }

  .section-label {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: rgba(124,58,237,0.8);
    margin-bottom: 8px;
  }

  .todo-item {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    padding: 6px 9px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-left: 2px solid rgba(124,58,237,0.55);
    border-radius: 7px;
    font-size: 12px;
    color: rgba(240,242,248,0.75);
    line-height: 1.5;
  }

  .open-btn {
    width: 100%;
    padding: 11px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: #fff;
    background: linear-gradient(135deg, #7c3aed, #5b21b6);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    cursor: pointer;
    transition: all 160ms cubic-bezier(0.16,1,0.3,1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    box-shadow: 0 3px 14px rgba(124,58,237,0.3);
  }
  .open-btn:hover {
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    box-shadow: 0 5px 20px rgba(124,58,237,0.45);
  }

  .setup-link {
    display: block;
    width: 100%;
    text-align: center;
    padding: 10px;
    font-size: 12.5px;
    font-weight: 500;
    color: rgba(124,58,237,0.8);
    background: rgba(124,58,237,0.08);
    border: 1px solid rgba(124,58,237,0.2);
    border-radius: 9px;
    cursor: pointer;
    transition: all 150ms ease;
    text-decoration: none;
  }
  .setup-link:hover {
    background: rgba(124,58,237,0.14);
    color: #c4b5fd;
  }
`;

export function Popup() {
  const [session, setSession] = useState<SessionSnapshot | null>(null);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    Promise.all([
      getLatestSession(),
      storageGet("tabmind:gemini:apiKey"),
    ]).then(([s, key]) => {
      setSession(s);
      setHasKey(Boolean(key));
    });
  }, []);

  const mins = session ? Math.round(session.durationMs / 60_000) : 0;
  const loading = hasKey === null;

  return (
    <>
      <style>{S}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 18 }}>🧠</span>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em" }}>TabMind</span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "#a78bfa",
              background: "rgba(124,58,237,0.14)",
              border: "1px solid rgba(124,58,237,0.28)",
              padding: "2px 6px",
              borderRadius: 99,
            }}
          >
            AI
          </span>
        </div>
        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          title="Settings"
          style={{
            width: 28,
            height: 28,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 7,
            color: "rgba(255,255,255,0.3)",
            transition: "background 150ms, color 150ms",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.3)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.6"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="content" style={{ padding: "14px 16px 16px" }}>
        {loading ? (
          /* Skeleton */
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[80, 100, 65].map((w, i) => (
              <div
                key={i}
                style={{
                  height: i === 0 ? 10 : 8,
                  width: `${w}%`,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 4,
                }}
              />
            ))}
          </div>
        ) : !hasKey ? (
          /* No API key */
          <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(124,58,237,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" stroke="#a78bfa" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ fontSize: 13, color: "rgba(240,242,248,0.8)", fontWeight: 550, marginBottom: 4 }}>
              Add your Gemini API key
            </p>
            <p style={{ fontSize: 11.5, color: "rgba(148,163,184,0.7)", lineHeight: 1.5, marginBottom: 16 }}>
              A free key from Google AI Studio gets TabMind running in 30 seconds.
            </p>
            <button
              className="setup-link"
              onClick={() => chrome.runtime.openOptionsPage()}
            >
              Open settings →
            </button>
          </div>
        ) : session ? (
          /* Has session */
          <>
            {/* Topic pill */}
            <div style={{ marginBottom: 12 }}>
              <div className="section-label">Working on</div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 10px 4px 8px",
                  borderRadius: 99,
                  border: "1px solid rgba(124,58,237,0.28)",
                  background: "rgba(124,58,237,0.09)",
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#a78bfa",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    color: "#e4d9ff",
                  }}
                >
                  {session.topic}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(240,242,248,0.35)",
                    borderLeft: "1px solid rgba(255,255,255,0.1)",
                    paddingLeft: 6,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {mins}m
                </span>
              </div>
            </div>

            {/* Summary */}
            <p
              style={{
                fontSize: 12.5,
                lineHeight: 1.6,
                color: "rgba(148,163,184,0.9)",
                marginBottom: session.todos?.length ? 14 : 0,
                letterSpacing: "-0.005em",
              }}
            >
              {session.summary}
            </p>

            {/* Todos */}
            {session.todos?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div className="section-label">Extracted</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {session.todos.slice(0, 3).map((todo, i) => (
                    <div key={i} className="todo-item">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
                        <rect x=".75" y=".75" width="10.5" height="10.5" rx="2.5" stroke="rgba(124,58,237,0.55)" strokeWidth="1.2"/>
                      </svg>
                      {todo}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              className="open-btn"
              onClick={() =>
                chrome.tabs.query({ active: true, currentWindow: true }, () => {
                  chrome.tabs.sendMessage(
                    chrome.tabs.TAB_ID_NONE ?? 0,
                    { type: "TABMIND_OPEN_WIDGET" }
                  );
                  window.close();
                })
              }
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.4" opacity="0.5"/>
                <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Open widget on this page
            </button>
          </>
        ) : (
          /* Has key but no session yet */
          <div style={{ padding: "6px 0 8px" }}>
            <p
              style={{
                fontSize: 13,
                color: "rgba(148,163,184,0.6)",
                fontStyle: "italic",
                lineHeight: 1.55,
                marginBottom: 14,
              }}
            >
              Watching your tabs silently…
              <br />
              First snapshot in up to 90 seconds.
            </p>
            <button
              className="open-btn"
              onClick={() => {
                chrome.runtime.sendMessage({ type: "TABMIND_SNAPSHOT_NOW" });
                window.close();
              }}
            >
              Analyze now
            </button>
          </div>
        )}
      </div>
    </>
  );
}
