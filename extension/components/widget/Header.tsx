import { useWidgetStore } from "../../stores/widget.store";

interface Props { onDragStart:(e:React.PointerEvent)=>void }

export function Header({ onDragStart }: Props) {
  const { minimized, setMinimized, requestSnapshot } = useWidgetStore();
  const isLoading = useWidgetStore(s => !s.session);

  return (
    <div
      style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 14px 11px",
        cursor:"grab",
      }}
      onPointerDown={onDragStart}
    >
      {/* Brand mark */}
      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
        <span
          className={isLoading ? "tm-brain-active" : ""}
          style={{ fontSize:18, lineHeight:1, display:"block" }}
          title={isLoading ? "Analyzing your session…" : "TabMind"}
        >🧠</span>
        <span style={{
          fontSize:13, fontWeight:650, letterSpacing:"-.01em",
          color:"oklch(95% .008 268)",
          fontFeatureSettings:'"ss01","cv01"',
        }}>
          TabMind
        </span>
        <span style={{
          fontSize:9.5, fontWeight:600, letterSpacing:".06em",
          color:"oklch(65% .18 275)", textTransform:"uppercase",
          background:"oklch(65% .18 275 / .14)",
          padding:"2px 6px", borderRadius:99,
          border:"1px solid oklch(65% .18 275/.28)",
          lineHeight:1.6,
        }}>AI</span>
      </div>

      {/* Controls */}
      <div style={{ display:"flex", alignItems:"center", gap:2 }} onPointerDown={e => e.stopPropagation()}>
        <HeaderBtn onClick={requestSnapshot} title="Analyze now" aria="Refresh session analysis">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M2 8a6 6 0 1 0 1.5-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
            <path d="M2 4v4h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </HeaderBtn>
        <HeaderBtn onClick={() => setMinimized(true)} title="Minimise" aria="Minimise TabMind">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </HeaderBtn>
      </div>
    </div>
  );
}

function HeaderBtn({ onClick, title, aria, children }: {
  onClick:()=>void; title:string; aria:string; children:React.ReactNode;
}) {
  return (
    <button
      className="tm-btn"
      onClick={onClick}
      title={title}
      aria-label={aria}
      style={{
        width:28, height:28, borderRadius:8, border:"none", background:"transparent",
        display:"flex", alignItems:"center", justifyContent:"center",
        color:"oklch(68% .01 268)", cursor:"pointer", outline:"none",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = "oklch(100% 0 0 / .08)";
        (e.currentTarget as HTMLElement).style.color = "oklch(92% .005 268)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
        (e.currentTarget as HTMLElement).style.color = "oklch(68% .01 268)";
      }}
      onFocus={e => { (e.currentTarget as HTMLElement).style.outline = "2px solid oklch(65% .18 275/.7)"; }}
      onBlur={e  => { (e.currentTarget as HTMLElement).style.outline = "none"; }}
    >
      {children}
    </button>
  );
}
