import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import "./widget.css";
import { useWidgetStore } from "../../stores/widget.store";
import type { TabGroup, UserTask } from "../../lib/types";
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

const W_WIDTH = 360;

export function Widget() {
  const {
    minimized,
    position,
    session,
    note,
    loading,
    tasks,
    rolloverCount,
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
  } = useWidgetStore();

  const posRef = useRef(position);
  posRef.current = position;
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

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
    [setPosition]
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
    setIsDragging(false);
  }, []);

  const minutes = session ? Math.max(1, Math.round(session.durationMs / 60_000)) : 0;
  const groups = session?.groups ?? [];
  const noteText = note?.text ?? "";

  if (minimized) {
    return (
      <div
        className="tm-orb"
        style={{ left: position.x, top: position.y }}
        onClick={() => setMinimized(false)}
        role="button"
        aria-label="Expand TabMind"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setMinimized(false)}
      >
        <Mark size={20} />
        {loading && <span className="tm-orb-pulse" />}
      </div>
    );
  }

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
          {/* session block */}
          <SessionBlock
            topic={session?.topic ?? null}
            narrative={session?.narrative ?? null}
            summary={session?.summary ?? null}
            minutes={minutes}
          />

          {/* per-page note */}
          <Section label="Note for this page" hint={noteText ? "saved" : undefined}>
            <NoteEditor value={noteText} onSave={saveNote} />
          </Section>

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
            <Section label={`Tab groups · ${groups.length}`}>
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
}: {
  topic: string | null;
  narrative: string | null;
  summary: string | null;
  minutes: number;
}) {
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
      <div className="tm-topic">{topic ?? "Listening to your tabs…"}</div>
      {narrative ? (
        <p className="tm-narrative">{narrative}</p>
      ) : summary ? (
        <p className="tm-narrative">{summary}</p>
      ) : (
        <p className="tm-narrative tm-narrative-empty">
          A new session begins as soon as your tabs do something interesting.
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
  const inputRef = useRef<HTMLInputElement>(null);

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
      <div className="tm-section-head">
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
      </div>

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
          ref={inputRef}
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
          <button className="tm-add-send" onClick={handleAdd} title="Add task (Enter)">
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

/* ── groups ─────────────────────────────────────────────── */

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
        <button className="tm-btn tm-btn-primary" onClick={onAsk}>Refresh insight</button>
        <button className="tm-btn tm-btn-ghost" onClick={() => chrome.runtime.openOptionsPage?.()}>
          Settings ↗
        </button>
      </div>
    </div>
  );
}

/* ── shared ─────────────────────────────────────────────── */

function Section({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="tm-section">
      <div className="tm-section-head">
        <span className="tm-eyebrow">{label}</span>
        {hint && <span className="tm-hint">{hint}</span>}
      </div>
      {children}
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
