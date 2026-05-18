import { useState, useEffect } from "react";
import {
  getSessionHistory,
  getGlobalNotes,
  getGoals,
} from "../../lib/storage";
import type { SessionSnapshot, GlobalNote, Goal, UserTask } from "../../lib/types";
import { todayISO, getTasks as getStoredTasks } from "../../lib/tasks";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Geist", "Inter", system-ui, sans-serif;
    background: #07080d;
    color: #f3f4f7;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }
  :root {
    --c-glass: rgba(12, 12, 16, 0.76);
    --c-border: rgba(255,255,255,0.065);
    --c-border-hi: rgba(255,255,255,0.12);
    --c-text: #f0f1f5;
    --c-text-dim: #9ea2b0;
    --c-text-muted: #636776;
    --c-text-trace: #3d404a;
    --c-accent: #a78bfa;
    --c-accent-glow: rgba(167,139,250,0.18);
    --c-accent-line: rgba(167,139,250,0.3);
    --c-accent-deep: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
    --r-xl: 18px;
    --r-lg: 14px;
    --r-md: 10px;
    --r-sm: 7px;
    --r-pill: 999px;
    --font: "Geist", "Inter", system-ui, sans-serif;
    --mono: "Geist Mono", ui-monospace, monospace;
  }

  .db-layout {
    display: grid;
    grid-template-columns: 260px 1fr 300px;
    grid-template-rows: 64px 1fr;
    min-height: 100vh;
    gap: 0;
  }

  /* Header */
  .db-header {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    border-bottom: 1px solid var(--c-border);
    background: rgba(7,8,13,0.9);
    backdrop-filter: blur(20px);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .db-brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .db-brand-name {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--c-text);
  }
  .db-pill {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--c-accent);
    background: var(--c-accent-glow);
    border: 1px solid var(--c-accent-line);
    padding: 2px 8px;
    border-radius: var(--r-pill);
  }
  .db-header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .db-close-btn {
    padding: 8px 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--c-border);
    border-radius: var(--r-md);
    color: var(--c-text-dim);
    font-size: 13px;
    font-family: var(--font);
    cursor: pointer;
    transition: background 150ms, color 150ms;
  }
  .db-close-btn:hover {
    background: rgba(255,255,255,0.09);
    color: var(--c-text);
  }

  /* Sidebar */
  .db-sidebar {
    border-right: 1px solid var(--c-border);
    overflow-y: auto;
    padding: 20px 0;
    background: rgba(255,255,255,0.008);
  }
  .db-sidebar-title {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--c-text-muted);
    padding: 0 20px 12px;
  }
  .db-session-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 10px 20px;
    cursor: pointer;
    border-left: 2px solid transparent;
    transition: background 120ms, border-color 120ms;
  }
  .db-session-item:hover {
    background: rgba(255,255,255,0.03);
    border-left-color: var(--c-accent-line);
  }
  .db-session-item.active {
    background: rgba(167,139,250,0.07);
    border-left-color: var(--c-accent);
  }
  .db-session-topic {
    font-size: 12px;
    font-weight: 580;
    color: var(--c-text-dim);
    letter-spacing: -0.005em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .db-session-time {
    font-family: var(--mono);
    font-size: 9.5px;
    color: var(--c-text-trace);
    font-variant-numeric: tabular-nums;
  }

  /* Main */
  .db-main {
    overflow-y: auto;
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* Week calendar */
  .db-week-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .db-week-title {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: var(--c-text);
  }
  .db-week-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
    margin-bottom: 20px;
  }
  .db-week-col {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-height: 120px;
  }
  .db-week-col-head {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 4px;
    border-radius: var(--r-md);
    background: rgba(255,255,255,0.018);
    border: 1px solid var(--c-border);
    margin-bottom: 4px;
  }
  .db-week-col-head.today {
    background: var(--c-accent-glow);
    border-color: var(--c-accent-line);
  }
  .db-week-day-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--c-text-muted);
  }
  .db-week-col-head.today .db-week-day-label { color: var(--c-accent); }
  .db-week-day-num {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--c-text-dim);
    font-variant-numeric: tabular-nums;
  }
  .db-week-col-head.today .db-week-day-num { color: var(--c-text); }
  .db-week-task-pill {
    padding: 3px 7px;
    border-radius: var(--r-sm);
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--c-border);
    font-size: 10.5px;
    color: var(--c-text-muted);
    letter-spacing: -0.003em;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: default;
    transition: background 100ms;
  }
  .db-week-task-pill:hover { background: rgba(255,255,255,0.06); color: var(--c-text-dim); }
  .db-week-task-pill.done {
    text-decoration: line-through;
    opacity: 0.4;
  }

  /* Note folder grid */
  .db-notes-section-title {
    font-size: 13px;
    font-weight: 680;
    letter-spacing: -0.01em;
    color: var(--c-text);
    margin-bottom: 12px;
  }
  .db-note-folders {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .db-note-folder {
    padding: 16px;
    border-radius: var(--r-lg);
    border: 1px solid var(--c-border);
    background: rgba(255,255,255,0.018);
    cursor: pointer;
    transition: background 120ms, border-color 120ms, transform 120ms;
  }
  .db-note-folder:hover {
    background: rgba(255,255,255,0.032);
    border-color: var(--c-border-hi);
    transform: translateY(-1px);
  }
  .db-folder-color {
    width: 28px;
    height: 28px;
    border-radius: var(--r-sm);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .db-folder-name {
    font-size: 13px;
    font-weight: 640;
    color: var(--c-text);
    letter-spacing: -0.01em;
    margin-bottom: 3px;
  }
  .db-folder-count {
    font-size: 11px;
    color: var(--c-text-muted);
  }

  /* Right panel */
  .db-panel {
    border-left: 1px solid var(--c-border);
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    background: rgba(255,255,255,0.008);
  }
  .db-panel-section-title {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--c-text-muted);
    margin-bottom: 12px;
  }

  /* Session narrative panel */
  .db-narrative-topic {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: var(--c-text);
    margin-bottom: 8px;
    line-height: 1.25;
  }
  .db-narrative-text {
    font-size: 12.5px;
    line-height: 1.65;
    color: var(--c-text-dim);
    letter-spacing: -0.005em;
  }

  /* Goals panel */
  .db-goal-item {
    padding: 10px 12px;
    border-radius: var(--r-md);
    background: rgba(255,255,255,0.022);
    border: 1px solid var(--c-border);
    margin-bottom: 6px;
  }
  .db-goal-item-title {
    font-size: 12px;
    font-weight: 580;
    color: var(--c-text-dim);
    letter-spacing: -0.005em;
    margin-bottom: 5px;
  }
  .db-goal-progress-bar {
    height: 4px;
    background: rgba(255,255,255,0.06);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 3px;
  }
  .db-goal-progress-fill {
    height: 100%;
    background: var(--c-accent);
    border-radius: 2px;
    transition: width 400ms cubic-bezier(0.16,1,0.3,1);
  }
  .db-goal-progress-label {
    font-family: var(--mono);
    font-size: 9.5px;
    color: var(--c-text-trace);
    font-variant-numeric: tabular-nums;
  }

  /* Empty states */
  .db-empty {
    text-align: center;
    padding: 32px 16px;
    color: var(--c-text-muted);
    font-size: 12.5px;
    font-style: italic;
  }

  /* Card */
  .db-card {
    background: rgba(255,255,255,0.018);
    border: 1px solid var(--c-border);
    border-radius: var(--r-lg);
    padding: 20px;
  }
  .db-card-title {
    font-size: 13.5px;
    font-weight: 660;
    letter-spacing: -0.015em;
    color: var(--c-text);
    margin-bottom: 14px;
  }

  /* Scrollbar */
  * { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.07) transparent; }
  *::-webkit-scrollbar { width: 4px; }
  *::-webkit-scrollbar-track { background: transparent; }
  *::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 4px; }
`;

function relativeTime(ts: number): string {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getWeekDays(): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const NOTE_FOLDERS = [
  { key: "work",     label: "Work",     color: "#60a5fa" },
  { key: "personal", label: "Personal", color: "#a78bfa" },
  { key: "ideas",    label: "Ideas",    color: "#34d399" },
  { key: "learning", label: "Learning", color: "#fbbf24" },
] as const;

export function Dashboard() {
  const [sessions, setSessions] = useState<SessionSnapshot[]>([]);
  const [notes, setNotes] = useState<GlobalNote[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [activeSession, setActiveSession] = useState<SessionSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSessionHistory(),
      getGlobalNotes(),
      getGoals(),
      getStoredTasks(),
    ]).then(([s, n, g, t]) => {
      setSessions(s);
      setNotes(n);
      setGoals(g);
      setTasks(t);
      if (s.length > 0) setActiveSession(s[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const weekDays = getWeekDays();
  const todayStr = todayISO();
  const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <>
      <style>{CSS}</style>
      <div className="db-layout">
        {/* Header */}
        <header className="db-header">
          <div className="db-brand">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="dbg" x1="0" y1="0" x2="24" y2="24">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#6d28d9" />
                </linearGradient>
              </defs>
              <circle cx="12" cy="12" r="9" stroke="url(#dbg)" strokeWidth="1.4" opacity="0.55" />
              <ellipse cx="12" cy="12" rx="9" ry="3.6" stroke="url(#dbg)" strokeWidth="1.2" opacity="0.4" transform="rotate(-28 12 12)" />
              <circle cx="12" cy="12" r="2.6" fill="url(#dbg)" />
              <circle cx="20" cy="6.5" r="1.5" fill="#a78bfa" />
            </svg>
            <span className="db-brand-name">TabMind</span>
            <span className="db-pill">Dashboard</span>
          </div>
          <div className="db-header-right">
            <button type="button" className="db-close-btn" onClick={() => window.close()}>
              Close x
            </button>
          </div>
        </header>

        {/* Sidebar - session history */}
        <aside className="db-sidebar">
          <div className="db-sidebar-title">Session History</div>
          {loading && <div className="db-empty">Loading...</div>}
          {!loading && sessions.length === 0 && (
            <div className="db-empty">No sessions yet.</div>
          )}
          {sessions.slice(0, 10).map((s) => (
            <div
              key={s.id}
              className={`db-session-item${activeSession?.id === s.id ? " active" : ""}`}
              onClick={() => setActiveSession(s)}
            >
              <span className="db-session-topic">
                {s.topic || s.summary || "Unnamed session"}
              </span>
              <span className="db-session-time">{relativeTime(s.capturedAt)}</span>
            </div>
          ))}
        </aside>

        {/* Main - week calendar + note folders */}
        <main className="db-main">
          {/* Week calendar */}
          <div className="db-card">
            <div className="db-week-header">
              <span className="db-card-title">This Week</span>
              <span style={{ fontSize: 12, color: "var(--c-text-muted)" }}>
                {new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </span>
            </div>
            <div className="db-week-grid">
              {weekDays.map((day, i) => {
                const iso = day.toISOString().slice(0, 10);
                const isToday = iso === todayStr;
                const dayTasks = tasks.filter(t => t.dueDate === iso);
                return (
                  <div key={iso} className="db-week-col">
                    <div className={`db-week-col-head${isToday ? " today" : ""}`}>
                      <span className="db-week-day-label">{DAY_LABELS[i]}</span>
                      <span className="db-week-day-num">{day.getDate()}</span>
                    </div>
                    {dayTasks.slice(0, 4).map((t) => (
                      <div
                        key={t.id}
                        className={`db-week-task-pill${t.status === "done" ? " done" : ""}`}
                        title={t.text}
                      >
                        {t.text}
                      </div>
                    ))}
                    {dayTasks.length > 4 && (
                      <div
                        className="db-week-task-pill"
                        style={{ color: "var(--c-text-trace)", fontSize: 10 }}
                      >
                        +{dayTasks.length - 4} more
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Note folders */}
          <div className="db-card">
            <div className="db-card-title">Note Collections</div>
            <div className="db-note-folders">
              {NOTE_FOLDERS.map((folder) => {
                const folderNotes = notes.filter(n => n.category === folder.key);
                return (
                  <div key={folder.key} className="db-note-folder">
                    <div
                      className="db-folder-color"
                      style={{ background: `${folder.color}22`, border: `1px solid ${folder.color}44` }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                          stroke={folder.color} strokeWidth="1.6" strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="db-folder-name">{folder.label}</div>
                    <div className="db-folder-count">
                      {folderNotes.length} {folderNotes.length === 1 ? "note" : "notes"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Right panel - active session + goals */}
        <aside className="db-panel">
          {/* Current session narrative */}
          <div>
            <div className="db-panel-section-title">Session</div>
            {activeSession ? (
              <div>
                <div className="db-narrative-topic">
                  {activeSession.topic || "Session"}
                </div>
                <p className="db-narrative-text">
                  {activeSession.narrative || activeSession.summary || "No narrative available."}
                </p>
                {activeSession.todos.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--c-text-muted)", marginBottom: 6 }}>
                      Extracted tasks
                    </div>
                    {activeSession.todos.slice(0, 4).map((todo, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "flex-start", gap: 7,
                        padding: "4px 0", fontSize: 11.5, color: "var(--c-text-dim)",
                        borderBottom: "1px solid var(--c-border)",
                      }}>
                        <span style={{ color: "var(--c-accent)", marginTop: 1, flexShrink: 0 }}>*</span>
                        {todo.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="db-empty">Select a session to see details.</div>
            )}
          </div>

          {/* Goals */}
          <div>
            <div className="db-panel-section-title">Goals</div>
            {goals.length === 0 ? (
              <div className="db-empty" style={{ padding: "16px 0" }}>
                No goals yet. Add one in the widget Goals tab.
              </div>
            ) : (
              goals.slice(0, 5).map((goal) => {
                const done = goal.tasks.filter(t => t.done).length;
                const total = goal.tasks.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={goal.id} className="db-goal-item">
                    <div className="db-goal-item-title">{goal.title}</div>
                    {total > 0 && (
                      <>
                        <div className="db-goal-progress-bar">
                          <div
                            className="db-goal-progress-fill"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="db-goal-progress-label">{done}/{total} tasks - {pct}%</div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
