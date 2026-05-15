import{s as j,r as n,g as N,a as S,b as z,j as e,c as D,R as G}from"./storage-DF14hXSN.js";function T(){return new Date().toISOString().slice(0,10)}async function M(){return await j("tabmind:tasks")??[]}const W=`
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Geist", "Inter", system-ui, sans-serif;
    background: #07080d;
    color: #f3f4f7;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }
  :root {
    --c-glass: rgba(12, 12, 16, 0.76);
    --c-border: rgba(255,255,255,0.065);
    --c-border-hi: rgba(255,255,255,0.12);
    --c-text: #f0f1f5;
    --c-text-dim: #9ea2b0;
    --c-text-muted: #636776;
    --c-text-trace: #3d404a;
    --c-accent: #a78bfa;
    --c-accent-glow: rgba(167,139,250,0.18);
    --c-accent-line: rgba(167,139,250,0.3);
    --c-accent-deep: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
    --r-xl: 18px;
    --r-lg: 14px;
    --r-md: 10px;
    --r-sm: 7px;
    --r-pill: 999px;
    --font: "Geist", "Inter", system-ui, sans-serif;
    --mono: "Geist Mono", ui-monospace, monospace;
  }

  .db-layout {
    display: grid;
    grid-template-columns: 260px 1fr 300px;
    grid-template-rows: 64px 1fr;
    min-height: 100vh;
    gap: 0;
  }

  /* Header */
  .db-header {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    border-bottom: 1px solid var(--c-border);
    background: rgba(7,8,13,0.9);
    backdrop-filter: blur(20px);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .db-brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .db-brand-name {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--c-text);
  }
  .db-pill {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--c-accent);
    background: var(--c-accent-glow);
    border: 1px solid var(--c-accent-line);
    padding: 2px 8px;
    border-radius: var(--r-pill);
  }
  .db-header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .db-close-btn {
    padding: 8px 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--c-border);
    border-radius: var(--r-md);
    color: var(--c-text-dim);
    font-size: 13px;
    font-family: var(--font);
    cursor: pointer;
    transition: background 150ms, color 150ms;
  }
  .db-close-btn:hover {
    background: rgba(255,255,255,0.09);
    color: var(--c-text);
  }

  /* Sidebar */
  .db-sidebar {
    border-right: 1px solid var(--c-border);
    overflow-y: auto;
    padding: 20px 0;
    background: rgba(255,255,255,0.008);
  }
  .db-sidebar-title {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--c-text-muted);
    padding: 0 20px 12px;
  }
  .db-session-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 10px 20px;
    cursor: pointer;
    border-left: 2px solid transparent;
    transition: background 120ms, border-color 120ms;
  }
  .db-session-item:hover {
    background: rgba(255,255,255,0.03);
    border-left-color: var(--c-accent-line);
  }
  .db-session-item.active {
    background: rgba(167,139,250,0.07);
    border-left-color: var(--c-accent);
  }
  .db-session-topic {
    font-size: 12px;
    font-weight: 580;
    color: var(--c-text-dim);
    letter-spacing: -0.005em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .db-session-time {
    font-family: var(--mono);
    font-size: 9.5px;
    color: var(--c-text-trace);
    font-variant-numeric: tabular-nums;
  }

  /* Main */
  .db-main {
    overflow-y: auto;
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* Week calendar */
  .db-week-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .db-week-title {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: var(--c-text);
  }
  .db-week-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
    margin-bottom: 20px;
  }
  .db-week-col {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-height: 120px;
  }
  .db-week-col-head {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 4px;
    border-radius: var(--r-md);
    background: rgba(255,255,255,0.018);
    border: 1px solid var(--c-border);
    margin-bottom: 4px;
  }
  .db-week-col-head.today {
    background: var(--c-accent-glow);
    border-color: var(--c-accent-line);
  }
  .db-week-day-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--c-text-muted);
  }
  .db-week-col-head.today .db-week-day-label { color: var(--c-accent); }
  .db-week-day-num {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--c-text-dim);
    font-variant-numeric: tabular-nums;
  }
  .db-week-col-head.today .db-week-day-num { color: var(--c-text); }
  .db-week-task-pill {
    padding: 3px 7px;
    border-radius: var(--r-sm);
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--c-border);
    font-size: 10.5px;
    color: var(--c-text-muted);
    letter-spacing: -0.003em;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: default;
    transition: background 100ms;
  }
  .db-week-task-pill:hover { background: rgba(255,255,255,0.06); color: var(--c-text-dim); }
  .db-week-task-pill.done {
    text-decoration: line-through;
    opacity: 0.4;
  }

  /* Note folder grid */
  .db-notes-section-title {
    font-size: 13px;
    font-weight: 680;
    letter-spacing: -0.01em;
    color: var(--c-text);
    margin-bottom: 12px;
  }
  .db-note-folders {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .db-note-folder {
    padding: 16px;
    border-radius: var(--r-lg);
    border: 1px solid var(--c-border);
    background: rgba(255,255,255,0.018);
    cursor: pointer;
    transition: background 120ms, border-color 120ms, transform 120ms;
  }
  .db-note-folder:hover {
    background: rgba(255,255,255,0.032);
    border-color: var(--c-border-hi);
    transform: translateY(-1px);
  }
  .db-folder-color {
    width: 28px;
    height: 28px;
    border-radius: var(--r-sm);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .db-folder-name {
    font-size: 13px;
    font-weight: 640;
    color: var(--c-text);
    letter-spacing: -0.01em;
    margin-bottom: 3px;
  }
  .db-folder-count {
    font-size: 11px;
    color: var(--c-text-muted);
  }

  /* Right panel */
  .db-panel {
    border-left: 1px solid var(--c-border);
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    background: rgba(255,255,255,0.008);
  }
  .db-panel-section-title {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--c-text-muted);
    margin-bottom: 12px;
  }

  /* Session narrative panel */
  .db-narrative-topic {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: var(--c-text);
    margin-bottom: 8px;
    line-height: 1.25;
  }
  .db-narrative-text {
    font-size: 12.5px;
    line-height: 1.65;
    color: var(--c-text-dim);
    letter-spacing: -0.005em;
  }

  /* Goals panel */
  .db-goal-item {
    padding: 10px 12px;
    border-radius: var(--r-md);
    background: rgba(255,255,255,0.022);
    border: 1px solid var(--c-border);
    margin-bottom: 6px;
  }
  .db-goal-item-title {
    font-size: 12px;
    font-weight: 580;
    color: var(--c-text-dim);
    letter-spacing: -0.005em;
    margin-bottom: 5px;
  }
  .db-goal-progress-bar {
    height: 4px;
    background: rgba(255,255,255,0.06);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 3px;
  }
  .db-goal-progress-fill {
    height: 100%;
    background: var(--c-accent);
    border-radius: 2px;
    transition: width 400ms cubic-bezier(0.16,1,0.3,1);
  }
  .db-goal-progress-label {
    font-family: var(--mono);
    font-size: 9.5px;
    color: var(--c-text-trace);
    font-variant-numeric: tabular-nums;
  }

  /* Empty states */
  .db-empty {
    text-align: center;
    padding: 32px 16px;
    color: var(--c-text-muted);
    font-size: 12.5px;
    font-style: italic;
  }

  /* Card */
  .db-card {
    background: rgba(255,255,255,0.018);
    border: 1px solid var(--c-border);
    border-radius: var(--r-lg);
    padding: 20px;
  }
  .db-card-title {
    font-size: 13.5px;
    font-weight: 660;
    letter-spacing: -0.015em;
    color: var(--c-text);
    margin-bottom: 14px;
  }

  /* Scrollbar */
  * { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.07) transparent; }
  *::-webkit-scrollbar { width: 4px; }
  *::-webkit-scrollbar-track { background: transparent; }
  *::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 4px; }
`;function E(s){const d=Math.floor((Date.now()-s)/1e3);if(d<60)return"just now";const o=Math.floor(d/60);if(o<60)return`${o}m ago`;const b=Math.floor(o/60);return b<24?`${b}h ago`:new Date(s).toLocaleDateString(void 0,{month:"short",day:"numeric"})}function L(){const s=new Date,d=s.getDay(),o=new Date(s);return o.setDate(s.getDate()-(d+6)%7),Array.from({length:7},(b,x)=>{const m=new Date(o);return m.setDate(o.getDate()+x),m})}const C=[{key:"work",label:"Work",color:"#60a5fa"},{key:"personal",label:"Personal",color:"#a78bfa"},{key:"ideas",label:"Ideas",color:"#34d399"},{key:"learning",label:"Learning",color:"#fbbf24"}];function I(){const[s,d]=n.useState([]),[o,b]=n.useState([]),[x,m]=n.useState([]),[u,v]=n.useState([]),[i,g]=n.useState(null),[h,f]=n.useState(!0);n.useEffect(()=>{Promise.all([N(),S(),z(),M()]).then(([t,a,r,l])=>{d(t),b(a),m(r),v(l),t.length>0&&g(t[0]),f(!1)}).catch(()=>f(!1))},[]);const y=L(),k=T(),w=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:W}),e.jsxs("div",{className:"db-layout",children:[e.jsxs("header",{className:"db-header",children:[e.jsxs("div",{className:"db-brand",children:[e.jsxs("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"dbg",x1:"0",y1:"0",x2:"24",y2:"24",children:[e.jsx("stop",{offset:"0%",stopColor:"#a78bfa"}),e.jsx("stop",{offset:"100%",stopColor:"#6d28d9"})]})}),e.jsx("circle",{cx:"12",cy:"12",r:"9",stroke:"url(#dbg)",strokeWidth:"1.4",opacity:"0.55"}),e.jsx("ellipse",{cx:"12",cy:"12",rx:"9",ry:"3.6",stroke:"url(#dbg)",strokeWidth:"1.2",opacity:"0.4",transform:"rotate(-28 12 12)"}),e.jsx("circle",{cx:"12",cy:"12",r:"2.6",fill:"url(#dbg)"}),e.jsx("circle",{cx:"20",cy:"6.5",r:"1.5",fill:"#a78bfa"})]}),e.jsx("span",{className:"db-brand-name",children:"TabMind"}),e.jsx("span",{className:"db-pill",children:"Dashboard"})]}),e.jsx("div",{className:"db-header-right",children:e.jsx("button",{type:"button",className:"db-close-btn",onClick:()=>window.close(),children:"Close ×"})})]}),e.jsxs("aside",{className:"db-sidebar",children:[e.jsx("div",{className:"db-sidebar-title",children:"Session History"}),h&&e.jsx("div",{className:"db-empty",children:"Loading…"}),!h&&s.length===0&&e.jsx("div",{className:"db-empty",children:"No sessions yet."}),s.slice(0,10).map(t=>e.jsxs("div",{className:`db-session-item${(i==null?void 0:i.id)===t.id?" active":""}`,onClick:()=>g(t),children:[e.jsx("span",{className:"db-session-topic",children:t.topic||t.summary||"Unnamed session"}),e.jsx("span",{className:"db-session-time",children:E(t.capturedAt)})]},t.id))]}),e.jsxs("main",{className:"db-main",children:[e.jsxs("div",{className:"db-card",children:[e.jsxs("div",{className:"db-week-header",children:[e.jsx("span",{className:"db-card-title",children:"This Week"}),e.jsx("span",{style:{fontSize:12,color:"var(--c-text-muted)"},children:new Date().toLocaleDateString(void 0,{month:"long",year:"numeric"})})]}),e.jsx("div",{className:"db-week-grid",children:y.map((t,a)=>{const r=t.toISOString().slice(0,10),l=r===k,p=u.filter(c=>c.dueDate===r);return e.jsxs("div",{className:"db-week-col",children:[e.jsxs("div",{className:`db-week-col-head${l?" today":""}`,children:[e.jsx("span",{className:"db-week-day-label",children:w[a]}),e.jsx("span",{className:"db-week-day-num",children:t.getDate()})]}),p.slice(0,4).map(c=>e.jsx("div",{className:`db-week-task-pill${c.status==="done"?" done":""}`,title:c.text,children:c.text},c.id)),p.length>4&&e.jsxs("div",{className:"db-week-task-pill",style:{color:"var(--c-text-trace)",fontSize:10},children:["+",p.length-4," more"]})]},r)})})]}),e.jsxs("div",{className:"db-card",children:[e.jsx("div",{className:"db-card-title",children:"Note Collections"}),e.jsx("div",{className:"db-note-folders",children:C.map(t=>{const a=o.filter(r=>r.category===t.key);return e.jsxs("div",{className:"db-note-folder",children:[e.jsx("div",{className:"db-folder-color",style:{background:`${t.color}22`,border:`1px solid ${t.color}44`},children:e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z",stroke:t.color,strokeWidth:"1.6",strokeLinejoin:"round"})})}),e.jsx("div",{className:"db-folder-name",children:t.label}),e.jsxs("div",{className:"db-folder-count",children:[a.length," ",a.length===1?"note":"notes"]})]},t.key)})})]})]}),e.jsxs("aside",{className:"db-panel",children:[e.jsxs("div",{children:[e.jsx("div",{className:"db-panel-section-title",children:"Session"}),i?e.jsxs("div",{children:[e.jsx("div",{className:"db-narrative-topic",children:i.topic||"Session"}),e.jsx("p",{className:"db-narrative-text",children:i.narrative||i.summary||"No narrative available."}),i.todos.length>0&&e.jsxs("div",{style:{marginTop:12},children:[e.jsx("div",{style:{fontSize:10,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:"var(--c-text-muted)",marginBottom:6},children:"Extracted tasks"}),i.todos.slice(0,4).map((t,a)=>e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",gap:7,padding:"4px 0",fontSize:11.5,color:"var(--c-text-dim)",borderBottom:"1px solid var(--c-border)"},children:[e.jsx("span",{style:{color:"var(--c-accent)",marginTop:1,flexShrink:0},children:"✦"}),t.text]},a))]})]}):e.jsx("div",{className:"db-empty",children:"Select a session to see details."})]}),e.jsxs("div",{children:[e.jsx("div",{className:"db-panel-section-title",children:"Goals"}),x.length===0?e.jsx("div",{className:"db-empty",style:{padding:"16px 0"},children:"No goals yet. Add one in the widget Goals tab."}):x.slice(0,5).map(t=>{const a=t.tasks.filter(p=>p.done).length,r=t.tasks.length,l=r>0?Math.round(a/r*100):0;return e.jsxs("div",{className:"db-goal-item",children:[e.jsx("div",{className:"db-goal-item-title",children:t.title}),r>0&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"db-goal-progress-bar",children:e.jsx("div",{className:"db-goal-progress-fill",style:{width:`${l}%`}})}),e.jsxs("div",{className:"db-goal-progress-label",children:[a,"/",r," tasks · ",l,"%"]})]})]},t.id)})]})]})]})]})}D.createRoot(document.getElementById("root")).render(e.jsx(G.StrictMode,{children:e.jsx(I,{})}));
