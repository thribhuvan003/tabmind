import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import "./widget.css";
import { useWidgetStore } from "../../stores/widget.store";
import type { ExtractedTodo, TabGroup } from "../../lib/types";
import { ensureFont } from "./theme";
import { Mark } from "./Mark";

const W_WIDTH = 360;

export function Widget() {
  const {
    minimized,
    position,
    session,
    note,
    loading,
    setPosition,
    setMinimized,
    loadSession,
    loadNote,
    saveNote,
    requestSnapshot,
    hydrate,
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
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    },
    [setPosition]
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
    setIsDragging(false);
  }, []);

  const minutes = session ? Math.max(1, Math.round(session.durationMs / 60_000)) : 0;
  const todos = session?.todos ?? [];
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
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && setMinimized(false)
        }
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
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        width: W_WIDTH,
        zIndex: 2147483647,
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="tm-glass">
        <div className="tm-grip" onPointerDown={onDragStart}>
          <Header
            onMinimize={() => setMinimized(true)}
            onRefresh={requestSnapshot}
            loading={loading}
          />
        </div>

        <SessionBlock
          topic={session?.topic ?? null}
          narrative={session?.narrative ?? null}
          summary={session?.summary ?? null}
          minutes={minutes}
        />

        <Section label="Note for this page" hint={noteText ? "saved" : undefined}>
          <NoteEditor value={noteText} onSave={saveNote} />
        </Section>

        {todos.length > 0 && (
          <Section label={`Action items · ${todos.length}`}>
            <TodoList items={todos} />
          </Section>
        )}

        {groups.length > 0 && (
          <Section label={`Tab groups · ${groups.length}`}>
            <GroupList groups={groups} />
          </Section>
        )}

        <Footer
          continueHint={session?.continueHint ?? null}
          onAsk={requestSnapshot}
        />
      </div>
    </div>
  );
}

/* ─── subcomponents ─────────────────────────────────────── */

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
            <path
              d="M2 8a6 6 0 1 0 1.5-4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M2 4v4h4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
  const empty = !topic;
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
      <div className="tm-topic">
        {empty ? "Listening to your tabs…" : topic}
      </div>
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

function NoteEditor({
  value,
  onSave,
}: {
  value: string;
  onSave: (t: string) => void;
}) {
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
      {savedAt && (
        <span key={savedAt} className="tm-saved">
          Saved
        </span>
      )}
    </div>
  );
}

function TodoList({ items }: { items: ExtractedTodo[] }) {
  return (
    <ul className="tm-todos" data-no-drag>
      {items.slice(0, 5).map((t, i) => (
        <li key={i} className="tm-todo">
          <span className="tm-check" />
          <span className="tm-todo-text">{t.text}</span>
          {t.deadline && <DeadlineChip iso={t.deadline} />}
        </li>
      ))}
    </ul>
  );
}

function DeadlineChip({ iso }: { iso: string }) {
  const label = useMemo(() => formatDeadline(iso), [iso]);
  const tone = useMemo(() => deadlineTone(iso), [iso]);
  return (
    <span className={`tm-deadline tm-deadline-${tone}`} title={iso}>
      {label}
    </span>
  );
}

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

function Footer({
  continueHint,
  onAsk,
}: {
  continueHint: string | null;
  onAsk: () => void;
}) {
  return (
    <div className="tm-footer" data-no-drag>
      {continueHint && <p className="tm-continue">{continueHint}</p>}
      <div className="tm-actions">
        <button className="tm-btn tm-btn-primary" onClick={onAsk}>
          Refresh insight
        </button>
        <button
          className="tm-btn tm-btn-ghost"
          onClick={() => chrome.runtime.openOptionsPage?.()}
        >
          Settings ↗
        </button>
      </div>
    </div>
  );
}

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

/* ─── helpers ─────────────────────────────────────────── */

function formatDeadline(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const days = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 1 && days <= 6) return d.toLocaleDateString(undefined, { weekday: "short" });
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function deadlineTone(iso: string): "due" | "soon" | "later" {
  const d = new Date(iso + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  if (days <= 0) return "due";
  if (days <= 3) return "soon";
  return "later";
}
