import { useWidgetStore } from "../../stores/widget.store";

export function SessionBadge() {
  const { session, requestSnapshot } = useWidgetStore();

  const mins = session ? Math.round(session.durationMs / 60_000) : 0;

  return (
    <div style={{ padding:"10px 16px 12px" }}>
      {/* Label */}
      <p style={{
        fontSize:9.5, fontWeight:700, letterSpacing:".09em", textTransform:"uppercase",
        color:"oklch(58% .14 278)", marginBottom:7,
        fontFeatureSettings:'"ss01"',
      }}>
        Working on
      </p>

      {session ? (
        <>
          {/* Topic pill */}
          <div className="tm-badge" style={{
            display:"inline-flex", alignItems:"center", gap:6,
            padding:"4px 10px 4px 8px",
            borderRadius:99,
            border:"1px solid oklch(65% .18 275/.25)",
            marginBottom:7,
          }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"oklch(65% .22 275)", flexShrink:0 }} />
            <span style={{
              fontSize:12, fontWeight:600, letterSpacing:"-.01em",
              color:"oklch(90% .012 268)",
            }}>{session.topic}</span>
            <span style={{
              fontSize:11, fontVariantNumeric:"tabular-nums",
              color:"oklch(60% .01 268)",
              borderLeft:"1px solid oklch(100% 0 0 / .12)", paddingLeft:6,
            }}>{mins}m</span>
          </div>

          {/* Summary */}
          <p style={{
            fontSize:12, lineHeight:1.6, letterSpacing:".003em",
            color:"oklch(72% .008 268)",
            display:"-webkit-box", WebkitLineClamp:3,
            WebkitBoxOrient:"vertical", overflow:"hidden",
            textWrap:"pretty" as never,
          }}>{session.summary}</p>
        </>
      ) : (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <p style={{
            fontSize:12, color:"oklch(48% .008 268)", lineHeight:1.5,
            fontStyle:"italic",
          }}>
            Watching your tabs silently…
          </p>
          <button
            className="tm-btn"
            onClick={requestSnapshot}
            style={{
              fontSize:11, fontWeight:600, letterSpacing:".02em",
              color:"oklch(65% .18 275)",
              background:"oklch(65% .18 275/.14)",
              border:"1px solid oklch(65% .18 275/.28)",
              padding:"3px 9px", borderRadius:99, cursor:"pointer",
              outline:"none", whiteSpace:"nowrap",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="oklch(65% .18 275/.24)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="oklch(65% .18 275/.14)"; }}
            onFocus={e  => { (e.currentTarget as HTMLElement).style.outline="2px solid oklch(65% .18 275/.7)"; }}
            onBlur={e   => { (e.currentTarget as HTMLElement).style.outline="none"; }}
          >
            Analyze now
          </button>
        </div>
      )}
    </div>
  );
}
