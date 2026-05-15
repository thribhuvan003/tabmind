import { useEffect, useRef, useCallback, useState, Component, type ReactNode } from "react";
import "./widget.css";
import { useWidgetStore } from "../../stores/widget.store";
import type { TabGroup, UserTask, GlobalNote } from "../../lib/types";
import { ensureFont } from "./theme";
import { Mark } from "./Mark";
import {
  todayISO,
  tomorrowISO,
  nextMondayISO,
  getTodayTasks,
  getSomedayTasks,
  getUpcomingTasks,
} from "../../lib/tasks";
import { captureError } from "../../lib/sentry";

const W_WIDTH = 400;

/* ── error boundary ─────────────────────────────────────── */

interface EBState { crashed: boolean }
class ErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { crashed: false };
  componentDidCatch(err: Error) { captureError(err, { context: "Widget" }); }
  static getDerivedStateFromError() { return { crashed: true }; }
  render() {
    if (this.state.crashed) {
      return (
        <div style={{
          padding: "20px 18px", color: "#f87171", fontFamily: "system-ui",
          fontSize: 12, lineHeight: 1.6, textAlign: "center",
        }}>
          <div style={{ marginBottom: 8, fontSize: 20 }}>⚠</div>
          TabMind ran into an error. Refresh the page to reload.
        </div>
      );
    }
    return this.props.children;
  }
}

/** Public entry — always wrapped in ErrorBoundary */
export function Widget() {
  return <ErrorBoundary><WidgetInner /></ErrorBoundary>;
}

function WidgetInner() {
  const {
    minimized,
    position,
    session,
    note,
    loading,
    tasks,
    rolloverCount,
    hasApiKey,
    globalNotes,
    setPosition,
    setMinimized,
    loadSession,
    loadNote,
    saveNote,
    requestSnapshot,
    hydrate,
    loadTasks,
    addTask,
    completeTask,
    scheduleTask,
    deleteTask,
    addGlobalNote,
    deleteGlobalNote,
    pinGlobalNote,
  } = useWidgetStore();

  const posRef = useRef(position);
  posRef.current = position;

  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Orb-specific drag tracking
  const orbMoved = useRef(false);
  const orbDragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    ensureFont();
    hydrate();
    loadNote(window.location.href);

    const onMsg = (msg: { type?: string }) => {
      if (msg.type === "TABMIND_SESSION_UPDATED") loadSession();
      if (msg.type === "TABMIND_TASKS_UPDATED") loadTasks();
    };
    chrome.runtime.onMessage.addListener(onMsg);

    const onResize = () => setPosition(posRef.current);
    window.addEventListener("resize", onResize);

    return () => {
      chrome.runtime.onMessage.removeListener(onMsg);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Expanded widget drag handlers
  const onDragStart = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
    e.preventDefault();
    dragging.current = true;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - posRef.current.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    },
    [setPosition],
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
    setIsDragging(false);
  }, []);

  const minutes = session ? Math.max(1, Math.round(session.durationMs / 60_000)) : 0;
  const groups = session?.groups ?? [];
  const noteText = note?.text ?? "";

  // ── Minimized orb (draggable, click to expand) ──────────
  if (minimized) {
    const pendingCount = getTodayTasks(tasks).length;
    return (
      <div
        className="tm-orb"
        style={{ left: position.x, top: position.y }}
        role="button"
        aria-label="Expand TabMind"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setMinimized(false)}
        onPointerDown={(e) => {
          e.preventDefault();
          orbMoved.current = false;
          orbDragStart.current = { x: e.clientX, y: e.clientY };
          dragging.current = true;
          dragOffset.current = {
            x: e.clientX - posRef.current.x,
            y: e.clientY - posRef.current.y,
          };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          const dist = Math.hypot(
            e.clientX - orbDragStart.current.x,
            e.clientY - orbDragStart.current.y,
          );
          if (dist >= 4) orbMoved.current = true;
          setPosition({
            x: e.clientX - dragOffset.current.x,
            y: e.clientY - dragOffset.current.y,
          });
        }}
        onPointerUp={() => {
          dragging.current = false;
          if (!orbMoved.current) setMinimized(false);
          orbMoved.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
          orbMoved.current = false;
        }}
      >
        <Mark size={20} />
        {loading && <span className="tm-orb-pulse" />}
        {pendingCount > 0 && (
          <span className="tm-orb-badge" aria-label={`${pendingCount} pending tasks`}>
            {pendingCount > 9 ? "9+" : pendingCount}
          </span>
        )}
      </div>
    );
  }

  // ── Expanded widget ──────────────────────────────────────
  return (
    <div
      className="tm-widget"
      data-dragging={isDragging || undefined}
      style={{ position: "fixed", left: position.x, top: position.y, width: W_WIDTH, zIndex: 2147483647 }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="tm-glass">
        {/* drag handle */}
        <div className="tm-grip" onPointerDown={onDragStart}>
          <Header onMinimize={() => setMinimized(true)} onRefresh={requestSnapshot} loading={loading} />
        </div>

        <div className="tm-scroll">
          {/* no-key state */}
          {!hasApiKey && !session && <NoApiKeyBanner />}

          {/* session block */}
          <SessionBlock
            topic={session?.topic ?? null}
            narrative={session?.narrative ?? null}
            summary={session?.summary ?? null}
            minutes={minutes}
            hasApiKey={hasApiKey}
          />

          {/* per-page note */}
          <Section label="Note for this page" hint={noteText ? "saved" : undefined} collapsible defaultOpen>
            <NoteEditor value={noteText} onSave={saveNote} />
          </Section>

          {/* global quick notes */}
          <QuickNotes
            notes={globalNotes}
            onAdd={addGlobalNote}
            onDelete={deleteGlobalNote}
            onPin={pinGlobalNote}
          />

          {/* tasks — Tweek-style with rollover */}
          <TaskPanel
            tasks={tasks}
            rolloverCount={rolloverCount}
            onAdd={addTask}
            onComplete={completeTask}
            onSchedule={scheduleTask}
            onDelete={deleteTask}
          />

          {/* tab groups */}
          {groups.length > 0 && (
            <Section label={`Tab groups · ${groups.length}`} collapsible defaultOpen={false}>
              <GroupList groups={groups} />
            </Section>
          )}

          {/* footer */}
          <Footer continueHint={session?.continueHint ?? null} onAsk={requestSnapshot} />
        </div>
      </div>
    </div>
  );
}

/* ── no-api-key banner ──────────────────────────────────── */

function NoApiKeyBanner() {
  return (
    <div className="tm-no-key" data-no-drag>
      <div className="tm-no-key-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"
            stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="tm-no-key-title">Add an API key to get started</p>
      <p className="tm-no-key-body">
        TabMind needs a free Gemini key (or OpenAI) to analyze your tabs and surface insights.
      </p>
      <button
        className="tm-btn tm-btn-primary"
        style={{ marginTop: 14, width: "100%" }}
        onClick={() => chrome.runtime.sendMessage({ type: "TABMIND_OPEN_OPTIONS" }).catch(() => {})}
        type="button"
      >
        Open Settings ↗
      </button>
    </div>
  );
}

/* ── header ─────────────────────────────────────────────── */

function Header({
  onMinimize,
  onRefresh,
  loading,
}: {
  onMinimize: () => void;
  onRefresh: () => void;
  loading: boolean;
}) {
  return (
    <div className="tm-header">
      <div className="tm-brand">
        <Mark size={16} />
        <span className="tm-brand-name">TabMind</span>
        <span className="tm-pill">AI</span>
      </div>
      <div className="tm-controls" data-no-drag>
        <IconBtn onClick={onRefresh} title="Analyze now" spinning={loading}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M2 8a6 6 0 1 0 1.5-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M2 4v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </IconBtn>
        <IconBtn onClick={onMinimize} title="Minimize">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </IconBtn>
      </div>
    </div>
  );
}

/* ── session block ──────────────────────────────────────── */

function SessionBlock({
  topic,
  narrative,
  summary,
  minutes,
  hasApiKey,
}: {
  topic: string | null;
  narrative: string | null;
  summary: string | null;
  minutes: number;
  hasApiKey: boolean;
}) {
  const placeholder = hasApiKey
    ? "Listening to your tabs…"
    : "Ready when you add an API key.";

  return (
    <div className="tm-session">
      <div className="tm-meta">
        <span className="tm-eyebrow">Working on</span>
        {minutes > 0 && (
          <span className="tm-time">
            <span className="tm-pulse" /> {minutes}m
          </span>
        )}
      </div>
      <div className="tm-topic">{topic ?? placeholder}</div>
      {narrative ? (
        <p className="tm-narrative">{narrative}</p>
      ) : summary ? (
        <p className="tm-narrative">{summary}</p>
      ) : (
        <p className="tm-narrative tm-narrative-empty">
          {hasApiKey
            ? "Your next session narrative will appear here after the first analysis."
            : "Add a Gemini or OpenAI key in Settings to enable passive tab analysis."}
        </p>
      )}
    </div>
  );
}

/* ── note editor ────────────────────────────────────────── */

function NoteEditor({ value, onSave }: { value: string; onSave: (t: string) => void }) {
  const [text, setText] = useState(value);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const debRef = useRef<number | null>(null);

  useEffect(() => setText(value), [value]);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setText(v);
    if (debRef.current) window.clearTimeout(debRef.current);
    debRef.current = window.setTimeout(() => {
      onSave(v);
      setSavedAt(Date.now());
    }, 400) as unknown as number;
  };

  return (
    <div className="tm-note-wrap" data-no-drag>
      <textarea
        className="tm-note"
        placeholder="Pin a thought to this URL — saved automatically."
        value={text}
        onChange={onChange}
        rows={2}
      />
      {savedAt && <span key={savedAt} className="tm-saved">Saved</span>}
    </div>
  );
}

/* ── quick notes (Noto-inspired, session-level) ─────────── */

function QuickNotes({
  notes,
  onAdd,
  onDelete,
  onPin,
}: {
  notes: GlobalNote[];
  onAdd: (text: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onPin: (id: string, pinned: boolean) => Promise<void>;
}) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(true);

  const handleAdd = async () => {
    const text = draft.trim();
    if (!text) return;
    await onAdd(text);
    setDraft("");
  };

  const pinnedNotes = notes.filter((n) => n.pinned);
  const recentNotes = notes.filter((n) => !n.pinned).slice(0, 5);
  const visible = [...pinnedNotes, ...recentNotes];

  return (
    <div className="tm-section" data-no-drag>
      <div
        className="tm-section-head"
        style={{ cursor: "pointer", userSelect: "none" }}
        onClick={() => setOpen((v) => !v)}
        role="button"
        aria-expanded={open}
      >
        <span className="tm-eyebrow">Quick Notes</span>
        <svg
          className="tm-section-arrow"
          data-open={open || undefined}
          width="10" height="10" viewBox="0 0 10 10" fill="none"
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {open && (
        <>
          <div className="tm-qn-input-wrap">
            <input
              className="tm-qn-input"
              placeholder="Capture a thought… (Enter to save)"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
                if (e.key === "Escape") setDraft("");
              }}
            />
          </div>

          {visible.length > 0 && (
            <ul className="tm-qn-list">
              {visible.map((note) => (
                <li
                  key={note.id}
                  className="tm-qn-item"
                  data-pinned={note.pinned || undefined}
                >
                  <div className="tm-qn-body">
                    <div className="tm-qn-text">{note.text}</div>
                    <div className="tm-qn-time">{relativeTime(note.createdAt)}</div>
                  </div>
                  <div className="tm-qn-actions">
                    <button
                      className="tm-qn-btn"
                      data-active={note.pinned || undefined}
                      onClick={() => onPin(note.id, !note.pinned)}
                      title={note.pinned ? "Unpin" : "Pin"}
                      type="button"
                    >
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                        <path d="M9.5 2L14 6.5l-4 4-1.5-1.5-3 3-1.5-1.5 3-3L5.5 7l4-5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      className="tm-qn-btn tm-qn-btn--delete"
                      onClick={() => onDelete(note.id)}
                      title="Delete"
                      type="button"
                    >
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

/* ── task panel (Tweek-style) ───────────────────────────── */

const SCHEDULE_OPTIONS = [
  { label: "Today", getDueDate: todayISO },
  { label: "Tomorrow", getDueDate: tomorrowISO },
  { label: "Next week", getDueDate: nextMondayISO },
  { label: "Someday", getDueDate: () => "someday" },
] as const;

function TaskPanel({
  tasks,
  rolloverCount,
  onAdd,
  onComplete,
  onSchedule,
  onDelete,
}: {
  tasks: UserTask[];
  rolloverCount: number;
  onAdd: (text: string, dueDate?: string) => Promise<void>;
  onComplete: (id: string) => Promise<void>;
  onSchedule: (id: string, dueDate: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [newText, setNewText] = useState("");
  const [showSomeday, setShowSomeday] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [open, setOpen] = useState(true);

  const todayTasks = getTodayTasks(tasks);
  const somedayTasks = getSomedayTasks(tasks);
  const upcomingTasks = getUpcomingTasks(tasks);

  const handleAdd = async () => {
    const text = newText.trim();
    if (!text) return;
    await onAdd(text, todayISO());
    setNewText("");
  };

  const closeMenu = () => setOpenMenu(null);

  return (
    <div className="tm-section" data-no-drag>
      <div
        className="tm-section-head"
        style={{ cursor: "pointer", userSelect: "none" }}
        onClick={() => setOpen((v) => !v)}
        role="button"
        aria-expanded={open}
      >
        <div className="tm-eyebrow-row">
          <span className="tm-eyebrow">
            Tasks
            {todayTasks.length > 0 && <span className="tm-task-count">{todayTasks.length}</span>}
          </span>
          {rolloverCount > 0 && (
            <span className="tm-rollover-badge" title={`${rolloverCount} task(s) moved from a previous day`}>
              ↻ {rolloverCount} carried over
            </span>
          )}
        </div>
        <svg
          className="tm-section-arrow"
          data-open={open || undefined}
          width="10" height="10" viewBox="0 0 10 10" fill="none"
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {open && (
        <>
          {/* Today's tasks */}
          {todayTasks.length === 0 && somedayTasks.length === 0 && upcomingTasks.length === 0 ? (
            <p className="tm-task-empty">AI will surface tasks from your tabs — or add one below.</p>
          ) : (
            <ul className="tm-tasks">
              {todayTasks.map((task, i) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  index={i}
                  menuOpen={openMenu === task.id}
                  onToggleMenu={() => setOpenMenu(openMenu === task.id ? null : task.id)}
                  onComplete={() => { onComplete(task.id); closeMenu(); }}
                  onSchedule={(d) => { onSchedule(task.id, d); closeMenu(); }}
                  onDelete={() => { onDelete(task.id); closeMenu(); }}
                />
              ))}
            </ul>
          )}

          {/* Quick add */}
          <div className="tm-add-wrap">
            <input
              className="tm-add-input"
              placeholder="+ Add a task…"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") setNewText("");
              }}
            />
            {newText.trim() && (
              <button className="tm-add-send" onClick={handleAdd} title="Add task (Enter)" type="button">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v12M2 8l6-6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>

          {/* Upcoming */}
          {upcomingTasks.length > 0 && (
            <div className="tm-upcoming">
              {upcomingTasks.slice(0, 3).map((t) => (
                <div key={t.id} className="tm-upcoming-item">
                  <span className="tm-upcoming-date">{formatShortDate(t.dueDate)}</span>
                  <span className="tm-upcoming-text">{t.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Someday */}
          {somedayTasks.length > 0 && (
            <>
              <button
                className="tm-someday-toggle"
                onClick={() => setShowSomeday((v) => !v)}
                type="button"
              >
                <span>Someday</span>
                <span className="tm-someday-count">{somedayTasks.length}</span>
                <svg
                  className="tm-someday-arrow"
                  data-open={showSomeday || undefined}
                  width="10" height="10" viewBox="0 0 10 10" fill="none"
                >
                  <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {showSomeday && (
                <ul className="tm-tasks tm-tasks--someday">
                  {somedayTasks.map((task, i) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      index={i}
                      menuOpen={openMenu === task.id}
                      onToggleMenu={() => setOpenMenu(openMenu === task.id ? null : task.id)}
                      onComplete={() => { onComplete(task.id); closeMenu(); }}
                      onSchedule={(d) => { onSchedule(task.id, d); closeMenu(); }}
                      onDelete={() => { onDelete(task.id); closeMenu(); }}
                    />
                  ))}
                </ul>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function TaskRow({
  task,
  index,
  menuOpen,
  onToggleMenu,
  onComplete,
  onSchedule,
  onDelete,
}: {
  task: UserTask;
  index: number;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onComplete: () => void;
  onSchedule: (dueDate: string) => void;
  onDelete: () => void;
}) {
  return (
    <li
      className="tm-task"
      data-done={task.status === "done" || undefined}
      style={{ "--i": index } as React.CSSProperties}
    >
      <button
        className="tm-task-check"
        onClick={onComplete}
        aria-label={task.status === "done" ? "Mark incomplete" : "Mark complete"}
        type="button"
      >
        {task.status === "done" && (
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <span className="tm-task-text">{task.text}</span>

      {task.rolledOverFrom && (
        <span className="tm-task-rolled" title={`Carried over from ${task.rolledOverFrom}`}>↻</span>
      )}

      {task.isAiGenerated && task.status === "pending" && (
        <span className="tm-task-ai" title="Extracted by AI">✦</span>
      )}

      <div className="tm-task-menu-wrap">
        <button
          className="tm-task-menu-btn"
          onClick={onToggleMenu}
          aria-label="Schedule task"
          type="button"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="4" cy="8" r="1.3" fill="currentColor" />
            <circle cx="8" cy="8" r="1.3" fill="currentColor" />
            <circle cx="12" cy="8" r="1.3" fill="currentColor" />
          </svg>
        </button>

        {menuOpen && (
          <div className="tm-schedule-menu">
            {SCHEDULE_OPTIONS.map(({ label, getDueDate }) => (
              <button
                key={label}
                className="tm-schedule-item"
                onClick={() => onSchedule(getDueDate())}
                type="button"
              >
                <span className="tm-schedule-label">{label}</span>
                <span className="tm-schedule-date">{getShortLabel(getDueDate())}</span>
              </button>
            ))}
            <div className="tm-menu-sep" />
            <button
              className="tm-schedule-item tm-schedule-item--danger"
              onClick={onDelete}
              type="button"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

/* ── tab groups ─────────────────────────────────────────── */

function GroupList({ groups }: { groups: TabGroup[] }) {
  const palette = ["#a78bfa", "#60a5fa", "#34d399", "#fbbf24", "#f472b6", "#fb923c"];
  return (
    <ul className="tm-groups" data-no-drag>
      {groups.slice(0, 4).map((g, i) => (
        <li key={g.label} className="tm-group">
          <span className="tm-dot" style={{ background: palette[i % palette.length] }} />
          <span className="tm-group-label">{g.label}</span>
          <span className="tm-group-count">{g.tabIds.length}</span>
        </li>
      ))}
    </ul>
  );
}

/* ── footer ─────────────────────────────────────────────── */

function Footer({ continueHint, onAsk }: { continueHint: string | null; onAsk: () => void }) {
  return (
    <div className="tm-footer" data-no-drag>
      {continueHint && <p className="tm-continue">{continueHint}</p>}
      <div className="tm-actions">
        <button className="tm-btn tm-btn-primary" onClick={onAsk} type="button">Refresh insight</button>
        <button
          className="tm-btn tm-btn-ghost"
          onClick={() => chrome.runtime.sendMessage({ type: "TABMIND_OPEN_OPTIONS" }).catch(() => {})}
          type="button"
        >
          Settings ↗
        </button>
      </div>
    </div>
  );
}

/* ── shared section ─────────────────────────────────────── */

function Section({
  label,
  hint,
  children,
  collapsible = false,
  defaultOpen = true,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="tm-section">
      <div
        className="tm-section-head"
        onClick={collapsible ? () => setOpen((v) => !v) : undefined}
        style={collapsible ? { cursor: "pointer", userSelect: "none" } : undefined}
        role={collapsible ? "button" : undefined}
        aria-expanded={collapsible ? open : undefined}
      >
        <span className="tm-eyebrow">{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {hint && <span className="tm-hint">{hint}</span>}
          {collapsible && (
            <svg
              className="tm-section-arrow"
              data-open={open || undefined}
              width="10" height="10" viewBox="0 0 10 10" fill="none"
            >
              <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
      {(!collapsible || open) && children}
    </div>
  );
}

function IconBtn({
  onClick,
  title,
  children,
  spinning,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  spinning?: boolean;
}) {
  return (
    <button
      className="tm-icon-btn"
      onClick={onClick}
      title={title}
      aria-label={title}
      data-spinning={spinning || undefined}
      type="button"
    >
      {children}
    </button>
  );
}

/* ── helpers ─────────────────────────────────────────────── */

function relativeTime(ts: number): string {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatShortDate(iso: string): string {
  if (iso === "someday") return "Someday";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 1 && diff <= 6) return d.toLocaleDateString(undefined, { weekday: "short" });
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getShortLabel(dueDate: string): string {
  if (dueDate === "someday") return "";
  const d = new Date(dueDate + "T00:00:00");
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
