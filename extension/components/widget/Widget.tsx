import { useEffect, useRef, useCallback } from "react";
import "./widget.css";
import { useWidgetStore } from "../../stores/widget.store";
import { Header }         from "./Header";
import { SessionBadge }   from "./SessionBadge";
import { NoteInput }      from "./NoteInput";
import { TodoList }       from "./TodoList";
import { ActionBar }      from "./ActionBar";

/* surface colours defined once so every child can reference via CSS vars */
const SURFACE = {
  bg: "linear-gradient(160deg,oklch(13% .028 268) 0%,oklch(16% .034 275) 100%)",
  border: "1px solid oklch(32% .06 272 / .35)",
  shadow: "0 16px 48px oklch(5% .04 268/.55),0 4px 12px oklch(5% .04 268/.35)",
  radius: "18px",
};

export function Widget() {
  const { minimized, position, setPosition, setMinimized, loadSession, loadNote } =
    useWidgetStore();

  // ref so pointer handlers always read latest position without re-registering
  const posRef = useRef(position);
  posRef.current = position;
  const dragging   = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    loadSession();
    loadNote(window.location.href);
    const onMsg = (msg: { type?: string }) => {
      if (msg.type === "TABMIND_SESSION_UPDATED") loadSession();
    };
    chrome.runtime.onMessage.addListener(onMsg);
    return () => chrome.runtime.onMessage.removeListener(onMsg);
  }, []);

  const onDragStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    dragOffset.current = { x: e.clientX - posRef.current.x, y: e.clientY - posRef.current.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth  - 304, e.clientX - dragOffset.current.x)),
      y: Math.max(0, Math.min(window.innerHeight - 72,  e.clientY - dragOffset.current.y)),
    });
  }, [setPosition]);

  const onPointerUp = useCallback(() => { dragging.current = false; }, []);

  if (minimized) {
    return (
      <div
        className="tm-orb"
        style={{ position:"fixed", left:position.x, top:position.y, zIndex:2147483647, cursor:"pointer" }}
        onClick={() => setMinimized(false)}
        role="button"
        aria-label="Expand TabMind"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setMinimized(false)}
      >
        <div style={{
          width:44, height:44, borderRadius:"50%",
          background:"linear-gradient(135deg,oklch(52% .22 275),oklch(45% .24 285))",
          boxShadow:"0 4px 20px oklch(40% .24 278/.6)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:22,
          transition:"transform 140ms cubic-bezier(0.16,1,0.3,1),box-shadow 140ms",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1.12)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 28px oklch(40% .24 278/.8)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px oklch(40% .24 278/.6)";
        }}>
          🧠
        </div>
      </div>
    );
  }

  return (
    <div
      className="tm-widget"
      style={{ position:"fixed", left:position.x, top:position.y, zIndex:2147483647, width:304, userSelect:"none" }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div style={{
        background: SURFACE.bg,
        border:     SURFACE.border,
        boxShadow:  SURFACE.shadow,
        borderRadius: SURFACE.radius,
        overflow:"hidden",
        fontFamily:'"Inter var","Inter",system-ui,sans-serif',
        WebkitFontSmoothing:"antialiased",
      }}>
        <Header onDragStart={onDragStart} />
        <Divider />
        <SessionBadge />
        <Divider faint />
        <NoteInput />
        <TodoList />
        <ActionBar />
      </div>
    </div>
  );
}

function Divider({ faint }: { faint?: boolean }) {
  return <div style={{
    height:1,
    margin:"0 16px",
    background: faint
      ? "oklch(100% 0 0 / .05)"
      : "oklch(100% 0 0 / .09)",
  }} />;
}
