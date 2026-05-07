import { useWidgetStore } from "../../stores/widget.store";

export function ActionBar() {
  const requestSnapshot = useWidgetStore(s => s.requestSnapshot);

  return (
    <div style={{ padding:"12px 14px 14px", display:"flex", gap:8 }}>
      <PrimaryBtn onClick={requestSnapshot}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ marginRight:5 }}>
          <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" opacity=".5"/>
          <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Ask AI
      </PrimaryBtn>
      <GhostBtn onClick={() => chrome.runtime.openOptionsPage?.()}>
        Full Session ↗
      </GhostBtn>
    </div>
  );
}

function PrimaryBtn({ onClick, children }: { onClick:()=>void; children:React.ReactNode }) {
  return (
    <button
      className="tm-btn"
      onClick={onClick}
      style={{
        flex:1, height:34,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:12.5, fontWeight:650, letterSpacing:".01em",
        color:"oklch(97% .006 268)",
        background:"linear-gradient(135deg,oklch(52% .22 275),oklch(46% .24 285))",
        border:"1px solid oklch(60% .22 275/.4)",
        borderRadius:10, cursor:"pointer", outline:"none",
        boxShadow:"0 2px 12px oklch(45% .22 278/.35)",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow="0 4px 18px oklch(45% .22 278/.55)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow="0 2px 12px oklch(45% .22 278/.35)"; }}
      onFocus={e  => { (e.currentTarget as HTMLElement).style.outline="2px solid oklch(65% .18 275/.8)"; (e.currentTarget as HTMLElement).style.outlineOffset="2px"; }}
      onBlur={e   => { (e.currentTarget as HTMLElement).style.outline="none"; }}
    >{children}</button>
  );
}

function GhostBtn({ onClick, children }: { onClick:()=>void; children:React.ReactNode }) {
  return (
    <button
      className="tm-btn"
      onClick={onClick}
      style={{
        flex:1, height:34,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:12.5, fontWeight:550, letterSpacing:".01em",
        color:"oklch(65% .01 268)",
        background:"oklch(100% 0 0 / .045)",
        border:"1px solid oklch(100% 0 0 / .1)",
        borderRadius:10, cursor:"pointer", outline:"none",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background="oklch(100% 0 0 / .08)";
        (e.currentTarget as HTMLElement).style.color="oklch(82% .007 268)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background="oklch(100% 0 0 / .045)";
        (e.currentTarget as HTMLElement).style.color="oklch(65% .01 268)";
      }}
      onFocus={e  => { (e.currentTarget as HTMLElement).style.outline="2px solid oklch(65% .18 275/.7)"; (e.currentTarget as HTMLElement).style.outlineOffset="2px"; }}
      onBlur={e   => { (e.currentTarget as HTMLElement).style.outline="none"; }}
    >{children}</button>
  );
}
