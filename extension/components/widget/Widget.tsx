import { useEffect, useRef, useCallback, useState, Component, type ReactNode } from "react";
import "./widget.css";
import { useWidgetStore } from "../../stores/widget.store";
import type { TabGroup, UserTask, GlobalNote, Goal, TaskCategory, NoteCategory } from "../../lib/types";
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

const W_WIDTH = 420;

type WidgetTab = "today" | "notes" | "goals" | "ai";

const CAT_META: Record<TaskCategory, { label: string; color: string }> = {
  work:     { label: "Work",     color: "#60a5fa" },
  personal: { label: "Personal", color: "#a78bfa" },
  health:   { label: "Health",   color: "#34d399" },
  learning: { label: "Learning", color: "#fbbf24" },
  creative: { label: "Creative", color: "#f472b6" },
};

const NOTE_CAT_META: Record<NoteCategory, { label: string; color: string }> = {
  work:     { label: "Work",     color: "#60a5fa" },
  personal: { label: "Personal", color: "#a78bfa" },
  ideas:    { label: "Ideas",    color: "#34d399" },
  learning: { label: "Learning", color: "#fbbf24" },
};

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
    goals,
    error,
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
    addGoal,
    deleteGoal,
    setGoalTasks,
    toggleGoalTask,
  } = useWidgetStore();

  const [activeTab, setActiveTab] = useState<WidgetTab>("today");

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
  const todayPending = getTodayTasks(tasks).filter(t => t.status === "pending").length;

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
          <Header
            onMinimize={() => setMinimized(true)}
            onRefresh={requestSnapshot}
            loading={loading}
          />
        </div>

        {/* tab navigation */}
        <TabNav activeTab={activeTab} onTab={setActiveTab} todayCount={todayPending} />

        <div className="tm-scroll">
          {/* no-key state */}
          {!hasApiKey && !session && activeTab === "ai" && <NoApiKeyBanner />}

          {/* error state */}
          {error && activeTab === "ai" && (
            <div className="tm-error-bar" data-no-drag>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          {activeTab === "today" && (
            <TodayTab
              tasks={tasks}
              rolloverCount={rolloverCount}
              onAdd={addTask}
              onComplete={completeTask}
              onSchedule={scheduleTask}
              onDelete={deleteTask}
            />
          )}

          {activeTab === "notes" && (
            <NotesTab
              noteText={noteText}
              onSavePageNote={saveNote}
              globalNotes={globalNotes}
              onAddGlobalNote={addGlobalNote}
              onDeleteGlobalNote={deleteGlobalNote}
              onPinGlobalNote={pinGlobalNote}
            />
          )}

          {activeTab === "goals" && (
            <GoalsTab
              goals={goals}
              onAddGoal={addGoal}
              onDeleteGoal={deleteGoal}
              onSetGoalTasks={setGoalTasks}
              onToggleGoalTask={toggleGoalTask}
              onAddTasksToToday={async (goalTasks) => {
                for (const t of goalTasks) {
                  await addTask(t, todayISO());
                }
                await loadTasks();
              }}
            />
          )}

          {activeTab === "ai" && (
            <div className="tm-insights-tab">
              {!hasApiKey && !session && <NoApiKeyBanner />}
              {/* session block */}
              <SessionBlock
                topic={session?.topic ?? null}
                narrative={session?.narrative ?? null}
                summary={session?.summary ?? null}
                minutes={minutes}
                hasApiKey={hasApiKey}
                loading={loading}
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
          )}
        </div>
      </div>
    </div>
  );
}

/* ── tab navigation ─────────────────────────────────────── */

function TabNav({
  activeTab,
  onTab,
  todayCount,
}: {
  activeTab: WidgetTab;
  onTab: (t: WidgetTab) => void;
  todayCount: number;
}) {
  return (
    <div className="tm-tab-nav" data-no-drag>
      {(["today", "notes", "goals", "ai"] as WidgetTab[]).map((tab) => (
        <button
          key={tab}
          className={`tm-tab-btn${activeTab === tab ? " active" : ""}`}
          onClick={() => onTab(tab)}
          type="button"
        >
          {tab === "today" ? "Today" : tab === "notes" ? "Notes" : tab === "goals" ? "Goals" : "AI"}
          {tab === "today" && todayCount > 0 && (
            <span className="tm-tab-badge">{todayCount > 9 ? "9+" : todayCount}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ── today tab ──────────────────────────────────────────── */

function TodayTab({
  tasks,
  rolloverCount,
  onAdd,
  onComplete,
  onSchedule,
  onDelete,
}: {
  tasks: UserTask[];
  rolloverCount: number;
  onAdd: (text: string, dueDate?: string, category?: TaskCategory, estimatedMinutes?: number) => Promise<void>;
  onComplete: (id: string) => Promise<void>;
  onSchedule: (id: string, dueDate: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [catFilter, setCatFilter] = useState<TaskCategory | "all">("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showSomeday, setShowSomeday] = useState(false);

  const todayTasks = getTodayTasks(tasks);
  const somedayTasks = getSomedayTasks(tasks);
  const upcomingTasks = getUpcomingTasks(tasks);

  const filteredToday = catFilter === "all"
    ? todayTasks
    : todayTasks.filter(t => t.category === catFilter);

  const closeMenu = () => setOpenMenu(null);

  return (
    <div data-no-drag>
      {/* week strip calendar */}
      <WeekStrip tasks={tasks} />

      {/* category filter */}
      <div className="tm-cat-row">
        <button
          className={`tm-cat-chip${catFilter === "all" ? " active" : ""}`}
          style={catFilter === "all" ? { background: "#636776" } : undefined}
          onClick={() => setCatFilter("all")}
          type="button"
        >
          All
        </button>
        {(Object.keys(CAT_META) as TaskCategory[]).map((cat) => (
          <button
            key={cat}
            className={`tm-cat-chip${catFilter === cat ? " active" : ""}`}
            style={catFilter === cat ? { background: CAT_META[cat].color } : undefined}
            onClick={() => setCatFilter(cat)}
            type="button"
          >
            {CAT_META[cat].label}
          </button>
        ))}
      </div>

      {/* rollover badge */}
      {rolloverCount > 0 && (
        <div style={{ padding: "0 16px 8px" }}>
          <span className="tm-rollover-badge">↻ {rolloverCount} carried over</span>
        </div>
      )}

      {/* task list */}
      <div style={{ padding: "0 16px 4px" }}>
        {filteredToday.length === 0 ? (
          <p className="tm-task-empty">
            {catFilter !== "all" ? `No ${CAT_META[catFilter].label} tasks today.` : "All caught up — or add a task below."}
          </p>
        ) : (
          <ul className="tm-tasks">
            {filteredToday.map((task, i) => (
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
      </div>

      {/* quick add */}
      <QuickAddTask onAdd={onAdd} />

      {/* upcoming strip */}
      {upcomingTasks.length > 0 && (
        <div style={{ padding: "0 16px 8px" }}>
          <div className="tm-upcoming">
            {upcomingTasks.slice(0, 3).map((t) => (
              <div key={t.id} className="tm-upcoming-item">
                <span className="tm-upcoming-date">{formatShortDate(t.dueDate)}</span>
                <span className="tm-upcoming-text">{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* someday */}
      {somedayTasks.length > 0 && (
        <div style={{ padding: "0 16px 12px" }}>
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
        </div>
      )}
    </div>
  );
}

/* ── week strip ─────────────────────────────────────────── */

function getWeekDays(): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sun
  // Start from Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function WeekStrip({ tasks }: { tasks: UserTask[] }) {
  const days = getWeekDays();
  const todayStr = todayISO();
  const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="tm-week-strip">
      {days.map((day, i) => {
        const iso = day.toISOString().slice(0, 10);
        const isToday = iso === todayStr;
        const dayTasks = tasks.filter(t => t.dueDate === iso);
        const pendingDots = dayTasks.filter(t => t.status === "pending").slice(0, 3);
        const doneDots = dayTasks.filter(t => t.status === "done").slice(0, 2);

        return (
          <div
            key={iso}
            className={`tm-week-day${isToday ? " tm-week-day--today" : ""}`}
          >
            <span className="tm-week-label">{DAY_LABELS[i]}</span>
            <span className="tm-week-num">{day.getDate()}</span>
            <div className="tm-week-dots">
              {pendingDots.map((_, di) => (
                <span key={`p-${di}`} className="tm-week-dot" />
              ))}
              {doneDots.map((_, di) => (
                <span key={`d-${di}`} className="tm-week-dot tm-week-dot--done" />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── quick add task ─────────────────────────────────────── */

function QuickAddTask({
  onAdd,
}: {
  onAdd: (text: string, dueDate?: string, category?: TaskCategory, estimatedMinutes?: number) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState<TaskCategory | null>(null);
  const [estMins, setEstMins] = useState<number | null>(null);

  const TIME_OPTIONS = [15, 30, 60, 90];

  const handleAdd = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    await onAdd(trimmed, todayISO(), category ?? undefined, estMins ?? undefined);
    setText("");
    setCategory(null);
    setEstMins(null);
  };

  return (
    <div className="tm-qadd-section" data-no-drag>
      <div className="tm-qadd-row">
        <input
          className="tm-qadd-input"
          placeholder="+ Add a task…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
            if (e.key === "Escape") { setText(""); setCategory(null); setEstMins(null); }
          }}
        />
        {text.trim() && (
          <button className="tm-add-send" onClick={handleAdd} title="Add task (Enter)" type="button">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8l6-6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
      <div className="tm-qadd-meta">
        {(Object.keys(CAT_META) as TaskCategory[]).map((cat) => (
          <button
            key={cat}
            className={`tm-qadd-chip${category === cat ? " active" : ""}`}
            style={category === cat ? { background: CAT_META[cat].color, borderColor: "transparent" } : undefined}
            onClick={() => setCategory(category === cat ? null : cat)}
            type="button"
          >
            {CAT_META[cat].label}
          </button>
        ))}
        <div className="tm-qadd-sep" />
        {TIME_OPTIONS.map((mins) => (
          <button
            key={mins}
            className={`tm-qadd-chip${estMins === mins ? " active" : ""}`}
            style={estMins === mins ? { background: "#636776", borderColor: "transparent", color: "#fff" } : undefined}
            onClick={() => setEstMins(estMins === mins ? null : mins)}
            type="button"
          >
            {mins < 60 ? `${mins}m` : `${mins / 60}h`}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── notes tab ──────────────────────────────────────────── */

function NotesTab({
  noteText,
  onSavePageNote,
  globalNotes,
  onAddGlobalNote,
  onDeleteGlobalNote,
  onPinGlobalNote,
}: {
  noteText: string;
  onSavePageNote: (text: string) => void;
  globalNotes: GlobalNote[];
  onAddGlobalNote: (text: string) => Promise<void>;
  onDeleteGlobalNote: (id: string) => Promise<void>;
  onPinGlobalNote: (id: string, pinned: boolean) => Promise<void>;
}) {
  const [noteCatFilter, setNoteCatFilter] = useState<NoteCategory | "all">("all");
  const [draft, setDraft] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState<NoteCategory | null>(null);

  const handleAdd = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    await onAddGlobalNote(trimmed);
    setDraft("");
    setNewNoteCategory(null);
  };

  const pinnedNotes = globalNotes.filter(n => n.pinned);
  const unpinnedNotes = globalNotes.filter(n => !n.pinned);
  const allVisible = [...pinnedNotes, ...unpinnedNotes];
  const filtered = noteCatFilter === "all"
    ? allVisible
    : allVisible.filter(n => n.category === noteCatFilter);

  return (
    <div className="tm-notes-tab" data-no-drag>
      {/* page note */}
      <div className="tm-page-note-section">
        <span className="tm-note-section-label">Note for this page</span>
        <NoteEditor value={noteText} onSave={onSavePageNote} />
      </div>

      {/* add note */}
      <div className="tm-note-add-row">
        <input
          className="tm-note-add-input"
          placeholder="Capture a thought…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
            if (e.key === "Escape") setDraft("");
          }}
        />
        {draft.trim() && (
          <button className="tm-add-send" onClick={handleAdd} type="button" title="Save note">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8l6-6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* category select for new note */}
      <div className="tm-note-cat-select">
        {(Object.keys(NOTE_CAT_META) as NoteCategory[]).map((cat) => (
          <button
            key={cat}
            className={`tm-qadd-chip${newNoteCategory === cat ? " active" : ""}`}
            style={newNoteCategory === cat ? { background: NOTE_CAT_META[cat].color, borderColor: "transparent", color: "#fff" } : undefined}
            onClick={() => setNewNoteCategory(newNoteCategory === cat ? null : cat)}
            type="button"
          >
            {NOTE_CAT_META[cat].label}
          </button>
        ))}
      </div>

      {/* category filter row */}
      <div className="tm-cat-row" style={{ paddingTop: 12 }}>
        <button
          className={`tm-cat-chip${noteCatFilter === "all" ? " active" : ""}`}
          style={noteCatFilter === "all" ? { background: "#636776" } : undefined}
          onClick={() => setNoteCatFilter("all")}
          type="button"
        >
          All
        </button>
        {(Object.keys(NOTE_CAT_META) as NoteCategory[]).map((cat) => (
          <button
            key={cat}
            className={`tm-cat-chip${noteCatFilter === cat ? " active" : ""}`}
            style={noteCatFilter === cat ? { background: NOTE_CAT_META[cat].color } : undefined}
            onClick={() => setNoteCatFilter(cat)}
            type="button"
          >
            {NOTE_CAT_META[cat].label}
          </button>
        ))}
      </div>

      {/* note cards */}
      <div className="tm-note-cards">
        {filtered.length === 0 && (
          <p style={{ fontSize: 12, color: "var(--c-text-muted)", fontStyle: "italic", textAlign: "center", padding: "16px 0" }}>
            No notes yet — add one above.
          </p>
        )}
        {filtered.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onDelete={() => onDeleteGlobalNote(note.id)}
            onPin={() => onPinGlobalNote(note.id, !note.pinned)}
          />
        ))}
      </div>
    </div>
  );
}

function NoteCard({
  note,
  onDelete,
  onPin,
}: {
  note: GlobalNote;
  onDelete: () => void;
  onPin: () => void;
}) {
  return (
    <div className="tm-note-card">
      <div className="tm-note-card-header">
        {note.category && (
          <span
            className="tm-note-cat-pill"
            style={{ background: NOTE_CAT_META[note.category].color }}
          >
            {NOTE_CAT_META[note.category].label}
          </span>
        )}
        {note.pinned && (
          <span style={{ fontSize: 9, color: "var(--c-accent)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Pinned
          </span>
        )}
        <span className="tm-note-card-time">{relativeTime(note.createdAt)}</span>
        <div className="tm-note-card-actions">
          <button
            className="tm-qn-btn"
            data-active={note.pinned || undefined}
            onClick={onPin}
            title={note.pinned ? "Unpin" : "Pin"}
            type="button"
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path d="M9.5 2L14 6.5l-4 4-1.5-1.5-3 3-1.5-1.5 3-3L5.5 7l4-5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            className="tm-qn-btn tm-qn-btn--delete"
            onClick={onDelete}
            title="Delete"
            type="button"
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      <div className="tm-note-card-text">{note.text}</div>
    </div>
  );
}

/* ── goals tab ──────────────────────────────────────────── */

function GoalsTab({
  goals,
  onAddGoal,
  onDeleteGoal,
  onSetGoalTasks,
  onToggleGoalTask,
  onAddTasksToToday,
}: {
  goals: Goal[];
  onAddGoal: (title: string) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
  onSetGoalTasks: (goalId: string, tasks: import("../../lib/types").GoalTask[]) => Promise<void>;
  onToggleGoalTask: (goalId: string, taskId: string) => Promise<void>;
  onAddTasksToToday: (tasks: string[]) => Promise<void>;
}) {
  const [goalInput, setGoalInput] = useState("");
  const [breaking, setBreaking] = useState(false);

  const handleBreakdown = async () => {
    const title = goalInput.trim();
    if (!title) return;
    setBreaking(true);
    try {
      // First save the goal
      await onAddGoal(title);
      // Then request AI breakdown — retry in case service worker is sleeping
      let res: { tasks?: string[] } | null = null;
      for (let i = 0; i < 3; i++) {
        try {
          res = await chrome.runtime.sendMessage({ type: "TABMIND_GOAL_BREAKDOWN", goalText: title });
          break;
        } catch { if (i < 2) await new Promise(r => setTimeout(r, 700)); }
      }
      const taskTexts: string[] = res?.tasks ?? [];
      if (taskTexts.length > 0) {
        // Get the newly added goal (it'll be first in the list)
        // We'll update via the setGoalTasks callback
        // But we need the goal id - we can find it from the goals list after add
        // Instead, we pass the tasks and let the store handle the goal lookup
        // Re-fetch goals via the store
        const updatedGoals = await chrome.storage.local.get("tabmind:goals");
        const goalsList: Goal[] = updatedGoals["tabmind:goals"] ?? [];
        const newGoal = goalsList[0]; // just added, should be first
        if (newGoal) {
          const goalTasks = taskTexts.map((text) => ({
            id: crypto.randomUUID(),
            text,
            done: false,
          }));
          await onSetGoalTasks(newGoal.id, goalTasks);
        }
      }
    } catch {
      // ignore
    } finally {
      setBreaking(false);
      setGoalInput("");
    }
  };

  return (
    <div className="tm-goals-tab" data-no-drag>
      <div className="tm-goal-input-wrap">
        <textarea
          className="tm-goal-input"
          placeholder="What's your goal? e.g. Launch my side project by end of month"
          value={goalInput}
          onChange={(e) => setGoalInput(e.target.value)}
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleBreakdown();
          }}
        />
        <button
          className="tm-goal-breakdown-btn"
          onClick={handleBreakdown}
          disabled={!goalInput.trim() || breaking}
          type="button"
        >
          {breaking ? "Breaking down…" : "Break it down ✦"}
        </button>
      </div>

      {goals.length === 0 && !breaking && (
        <p className="tm-goal-empty">No goals yet — enter one above to get an AI action plan.</p>
      )}

      <div className="tm-goal-cards">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onDelete={() => onDeleteGoal(goal.id)}
            onToggleTask={(taskId) => onToggleGoalTask(goal.id, taskId)}
            onAddToToday={() => {
              const pending = goal.tasks.filter(t => !t.done).map(t => t.text);
              onAddTasksToToday(pending);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function GoalCard({
  goal,
  onDelete,
  onToggleTask,
  onAddToToday,
}: {
  goal: Goal;
  onDelete: () => void;
  onToggleTask: (taskId: string) => void;
  onAddToToday: () => void;
}) {
  const doneCount = goal.tasks.filter(t => t.done).length;
  const total = goal.tasks.length;

  return (
    <div className="tm-goal-card">
      <div className="tm-goal-card-header">
        <span className="tm-goal-title">{goal.title}</span>
        <button className="tm-goal-del-btn" onClick={onDelete} title="Delete goal" type="button">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {goal.breaking ? (
        <div className="tm-goal-breaking">
          <span>Breaking down</span>
          <span className="tm-goal-breaking-dots">
            <span>·</span><span>·</span><span>·</span>
          </span>
        </div>
      ) : (
        <>
          <ul className="tm-goal-tasks">
            {goal.tasks.map((task) => (
              <li
                key={task.id}
                className="tm-goal-task"
                data-done={task.done || undefined}
              >
                <button
                  className="tm-goal-task-check"
                  onClick={() => onToggleTask(task.id)}
                  type="button"
                  aria-label={task.done ? "Mark incomplete" : "Mark complete"}
                >
                  {task.done && (
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className="tm-goal-task-text">{task.text}</span>
              </li>
            ))}
          </ul>

          {total > 0 && (
            <div className="tm-goal-card-footer">
              <span className="tm-goal-progress">{doneCount}/{total} done</span>
              <button
                className="tm-goal-add-btn"
                onClick={onAddToToday}
                type="button"
                title="Add pending tasks to Today"
              >
                Add to tasks →
              </button>
            </div>
          )}
        </>
      )}
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
        TabMind needs an API key to analyze your tabs. OpenRouter and Cerebras both have generous free tiers.
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
        <IconBtn
          onClick={() => chrome.runtime.sendMessage({ type: "TABMIND_OPEN_DASHBOARD" }).catch(() => {})}
          title="Open Dashboard"
          className="tm-icon-btn--dashboard"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
            <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
            <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
            <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
          </svg>
        </IconBtn>
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
  loading,
}: {
  topic: string | null;
  narrative: string | null;
  summary: string | null;
  minutes: number;
  hasApiKey: boolean;
  loading: boolean;
}) {
  const noSession = !topic && !narrative && !summary;
  const placeholder = loading ? "Analyzing your tabs…" : hasApiKey ? "Ready to analyze" : "Ready when you add an API key.";

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
      ) : noSession && hasApiKey ? (
        <p className="tm-narrative tm-narrative-empty">
          {loading
            ? "Reading your open tabs…"
            : "Hit ↻ above to analyze your tabs now — or wait 90 seconds for the auto-snapshot."}
        </p>
      ) : !hasApiKey ? null : (
        <p className="tm-narrative tm-narrative-empty">Analysis will appear here.</p>
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

/* ── task row ───────────────────────────────────────────── */

const SCHEDULE_OPTIONS = [
  { label: "Today", getDueDate: todayISO },
  { label: "Tomorrow", getDueDate: tomorrowISO },
  { label: "Next week", getDueDate: nextMondayISO },
  { label: "Someday", getDueDate: () => "someday" },
] as const;

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
  const catMeta = task.category ? CAT_META[task.category] : null;

  return (
    <li
      className="tm-task"
      data-done={task.status === "done" || undefined}
      style={{
        "--i": index,
        borderLeftColor: catMeta ? catMeta.color : undefined,
      } as React.CSSProperties}
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

      {catMeta && (
        <span className="tm-task-cat" style={{ background: catMeta.color }}>
          {catMeta.label}
        </span>
      )}

      {task.estimatedMinutes && (
        <span className="tm-task-time">
          {task.estimatedMinutes < 60 ? `${task.estimatedMinutes}m` : `${task.estimatedMinutes / 60}h`}
        </span>
      )}

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
  className,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  spinning?: boolean;
  className?: string;
}) {
  return (
    <button
      className={`tm-icon-btn${className ? ` ${className}` : ""}`}
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
