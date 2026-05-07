import { useWidgetStore } from "../../stores/widget.store";

export function TodoList() {
  const todos = useWidgetStore(s => s.session?.todos ?? []);
  if (!todos.length) return null;

  return (
    <div style={{ padding:"10px 16px 4px" }}>
      <p style={{
        fontSize:9.5, fontWeight:700, letterSpacing:".09em", textTransform:"uppercase",
        color:"oklch(58% .14 278)", marginBottom:8,
      }}>
        Extracted ({todos.length})
      </p>
      <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:4 }}>
        {todos.map((todo, i) => (
          <li
            key={i}
            className="tm-todo-item"
            style={{ "--i": i } as React.CSSProperties}
          >
            <div style={{
              display:"flex", alignItems:"flex-start", gap:8,
              background:"oklch(100% 0 0 / .035)",
              border:"1px solid oklch(100% 0 0 / .07)",
              borderLeft:"2px solid oklch(65% .2 278 / .7)",
              borderRadius:8,
              padding:"6px 10px",
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginTop:2, flexShrink:0 }}>
                <rect x=".75" y=".75" width="10.5" height="10.5" rx="2.5" stroke="oklch(58% .16 278)" strokeWidth="1.2"/>
              </svg>
              <span style={{
                fontSize:12, lineHeight:1.55, letterSpacing:".003em",
                color:"oklch(78% .007 268)",
              }}>{todo}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
