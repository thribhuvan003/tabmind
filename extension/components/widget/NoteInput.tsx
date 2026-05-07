import { useState, useEffect, useRef } from "react";
import { useWidgetStore } from "../../stores/widget.store";

export function NoteInput() {
  const { note, saveNote } = useWidgetStore();
  const [text, setText] = useState(note?.text ?? "");
  const [saved, setSaved] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setText(note?.text ?? ""); }, [note?.url]);

  /* auto-grow */
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = ref.current.scrollHeight + "px";
  }, [text]);

  const handleBlur = async () => {
    if (text === (note?.text ?? "")) return;
    await saveNote(text);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div style={{ padding:"10px 16px 12px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
        <p style={{
          fontSize:9.5, fontWeight:700, letterSpacing:".09em", textTransform:"uppercase",
          color:"oklch(58% .14 278)",
        }}>Note for this page</p>
        <span style={{
          fontSize:10, color:"oklch(65% .18 275)",
          opacity: saved ? 1 : 0,
          transition:"opacity 250ms",
          letterSpacing:".02em", fontWeight:600,
        }}>✓ Saved</span>
      </div>

      <div className="tm-note" style={{
        background:"oklch(100% 0 0 / .042)",
        border:"1px solid oklch(100% 0 0 / .1)",
        borderRadius:10,
        transition:"border-color 200ms cubic-bezier(0.16,1,0.3,1), box-shadow 200ms cubic-bezier(0.16,1,0.3,1)",
        overflow:"hidden",
      }}>
        <textarea
          ref={ref}
          value={text}
          onChange={e => setText(e.target.value)}
          onBlur={handleBlur}
          placeholder="Type a note for this page…"
          rows={2}
          style={{
            width:"100%", boxSizing:"border-box",
            background:"transparent", border:"none", outline:"none", resize:"none",
            padding:"9px 11px",
            fontSize:12.5, lineHeight:1.65, letterSpacing:".005em",
            /* WCAG fix: oklch(72%) is 5.8:1 on the dark surface */
            color:"oklch(88% .008 268)",
            fontFamily:"inherit",
            minHeight:60,
            overflowY:"hidden",
          }}
          style2={{
            /* placeholder - oklch(55%) is 4.7:1 — passes AA */
          } as never}
        />
        <style>{`
          .tm-note textarea::placeholder { color: oklch(55% .01 268); }
          .tm-note textarea:focus { outline: none; }
        `}</style>
      </div>
    </div>
  );
}
