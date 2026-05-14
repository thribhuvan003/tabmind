import{r as s,s as m,g as T,j as e,a as i,b as h,D as v,c as B,R as P}from"./storage-10xQbvk4.js";const G=`
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Geist", "Inter", system-ui, sans-serif;
    background: #07080d; color: #f3f4f7;
    min-height: 100vh; -webkit-font-smoothing: antialiased;
    display: flex; align-items: flex-start; justify-content: center;
    padding: 48px 24px;
  }
  #root { width: 100%; max-width: 640px; }
  .card {
    background: rgba(255,255,255,0.022);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; padding: 32px 36px; margin-bottom: 16px;
  }
  .card-title { font-size: 14.5px; font-weight: 650; letter-spacing: -0.02em; color: #e8eaf0; margin-bottom: 20px; }
  .label {
    font-size: 10.5px; font-weight: 600; letter-spacing: 0.09em;
    text-transform: uppercase; color: #a78bfa; margin-bottom: 6px; display: block;
  }
  .input {
    width: 100%; padding: 11px 14px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
    border-radius: 10px; font-size: 13.5px; color: #f3f4f7;
    font-family: "Geist Mono", monospace; outline: none; letter-spacing: 0.03em;
    transition: border-color 200ms ease, box-shadow 200ms ease;
  }
  .input:focus { border-color: rgba(167,139,250,0.5); box-shadow: 0 0 0 3px rgba(167,139,250,0.1); }
  .input::placeholder { color: #42454f; }
  .btn-save {
    margin-top: 18px; padding: 11px 28px; font-size: 13.5px; font-weight: 600;
    letter-spacing: -0.01em; color: #fff;
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; cursor: pointer;
    box-shadow: 0 4px 16px rgba(124,58,237,0.3);
    transition: box-shadow 200ms ease, transform 120ms ease;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-save:hover { box-shadow: 0 6px 24px rgba(124,58,237,0.45); transform: translateY(-1px); }
  .btn-save:active { transform: translateY(0); }
  .btn-save:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  .btn-danger {
    padding: 11px 20px; font-size: 13px; font-weight: 500;
    color: #64748b; background: transparent;
    border: 1px solid rgba(255,255,255,0.09); border-radius: 10px; cursor: pointer;
    transition: all 150ms ease;
  }
  .btn-danger:hover { color: #ef4444; border-color: rgba(239,68,68,0.3); }
  .status-ok {
    display: flex; align-items: center; gap: 6px;
    font-size: 12.5px; color: #4ade80; padding: 8px 12px;
    background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.2);
    border-radius: 8px; margin-top: 12px;
  }
  .hint { font-size: 12px; color: #4b5568; line-height: 1.6; margin-top: 10px; }
  .hint a { color: #a78bfa; text-decoration: none; }
  .hint a:hover { text-decoration: underline; }
  .tab-bar { display: flex; gap: 4px; margin-bottom: 20px; }
  .tab {
    flex: 1; padding: 9px; font-size: 13px; font-weight: 500; text-align: center;
    border-radius: 9px; cursor: pointer; border: 1px solid transparent;
    transition: all 160ms ease; color: #6b6f7d; background: transparent;
  }
  .tab.active { color: #f3f4f7; background: rgba(167,139,250,0.12); border-color: rgba(167,139,250,0.25); }
  .row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 11px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
    font-size: 13px;
  }
  .row:last-child { border-bottom: none; padding-bottom: 0; }
  .row-key { color: #4b5568; }
  .row-val { color: #94a3b8; font-family: "Geist Mono", monospace; font-size: 12px; }
  .blocklist-tag {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 9px; border-radius: 99px; font-size: 11.5px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
    color: #a1a4b0; cursor: pointer; transition: background 120ms ease;
  }
  .blocklist-tag:hover { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.25); color: #fca5a5; }
  .tag { font-size: 9px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #a78bfa; background: rgba(167,139,250,0.14); border: 1px solid rgba(167,139,250,0.25); padding: 2px 8px; border-radius: 99px; }
`;function I(){const[n,j]=s.useState("api"),[r,f]=s.useState("gemini"),[l,g]=s.useState(""),[d,x]=s.useState(""),[w,u]=s.useState(!1),[c,p]=s.useState([]),[b,y]=s.useState("");s.useEffect(()=>{Promise.all([m("tabmind:gemini:apiKey"),m("tabmind:openai:apiKey"),m("tabmind:provider"),T()]).then(([t,a,o,K])=>{t&&g(t),a&&x(a),o&&f(o),p(K)})},[]);const S=async()=>{await Promise.all([i("tabmind:provider",r),i("tabmind:gemini:apiKey",l.trim()),i("tabmind:openai:apiKey",d.trim())]),u(!0),setTimeout(()=>u(!1),3e3)},N=async()=>{await Promise.all([i("tabmind:gemini:apiKey",""),i("tabmind:openai:apiKey","")]),g(""),x("")},k=async()=>{const t=b.trim().toLowerCase().replace(/^https?:\/\//,"").split("/")[0];if(!t||c.includes(t))return;const a=[...c,t];p(a),await h(a),y("")},C=async t=>{const a=c.filter(o=>o!==t);p(a),await h(a)},z=async()=>{p(v),await h(v)};return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:G}),e.jsxs("div",{style:{marginBottom:32},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:6},children:[e.jsxs("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"og",x1:"0",y1:"0",x2:"24",y2:"24",children:[e.jsx("stop",{offset:"0%",stopColor:"#a78bfa"}),e.jsx("stop",{offset:"100%",stopColor:"#6d28d9"})]})}),e.jsx("circle",{cx:"12",cy:"12",r:"9",stroke:"url(#og)",strokeWidth:"1.4",opacity:"0.55"}),e.jsx("ellipse",{cx:"12",cy:"12",rx:"9",ry:"3.6",stroke:"url(#og)",strokeWidth:"1.2",opacity:"0.4",transform:"rotate(-28 12 12)"}),e.jsx("circle",{cx:"12",cy:"12",r:"2.6",fill:"url(#og)"}),e.jsx("circle",{cx:"20",cy:"6.5",r:"1.5",fill:"#a78bfa"})]}),e.jsx("h1",{style:{fontSize:22,fontWeight:760,letterSpacing:"-0.03em"},children:"TabMind"}),e.jsx("span",{className:"tag",children:"Settings"})]}),e.jsx("p",{style:{fontSize:13.5,color:"#64748b",letterSpacing:"-0.005em"},children:"Configure your AI session tracker"})]}),e.jsx("div",{className:"tab-bar",children:["api","blocklist","about"].map(t=>e.jsx("button",{className:`tab${n===t?" active":""}`,onClick:()=>j(t),children:t==="api"?"AI Provider":t==="blocklist"?"Privacy":"About"},t))}),n==="api"&&e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-title",children:"API Provider"}),e.jsx("label",{className:"label",children:"Provider"}),e.jsx("div",{style:{display:"flex",gap:8,marginBottom:20},children:["gemini","openai"].map(t=>e.jsx("button",{onClick:()=>f(t),style:{flex:1,padding:"9px 12px",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:500,border:r===t?"1px solid rgba(167,139,250,0.4)":"1px solid rgba(255,255,255,0.09)",background:r===t?"rgba(167,139,250,0.12)":"rgba(255,255,255,0.03)",color:r===t?"#e4d9ff":"#6b6f7d",transition:"all 160ms ease"},children:t==="gemini"?"Gemini Flash (free)":"OpenAI GPT-4o-mini"},t))}),r==="gemini"&&e.jsxs(e.Fragment,{children:[e.jsx("label",{className:"label",htmlFor:"gemini-key",children:"Gemini API key"}),e.jsx("input",{id:"gemini-key",className:"input",type:"password",value:l,onChange:t=>g(t.target.value),placeholder:"AIzaSy…",autoComplete:"off"}),e.jsxs("p",{className:"hint",children:["Free key from ",e.jsx("a",{href:"https://aistudio.google.com/app/apikey",target:"_blank",rel:"noopener",children:"aistudio.google.com"}),". Stored in ",e.jsx("code",{style:{fontSize:11,background:"rgba(255,255,255,0.06)",padding:"1px 5px",borderRadius:4},children:"chrome.storage.sync"})," — syncs across your devices."]})]}),r==="openai"&&e.jsxs(e.Fragment,{children:[e.jsx("label",{className:"label",htmlFor:"openai-key",children:"OpenAI API key"}),e.jsx("input",{id:"openai-key",className:"input",type:"password",value:d,onChange:t=>x(t.target.value),placeholder:"sk-…",autoComplete:"off"}),e.jsxs("p",{className:"hint",children:["Key from ",e.jsx("a",{href:"https://platform.openai.com/api-keys",target:"_blank",rel:"noopener",children:"platform.openai.com"}),". Uses gpt-4o-mini — costs ~$0.001 per session analysis."]})]}),w&&e.jsxs("div",{className:"status-ok",children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M20 6L9 17l-5-5",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),"Saved — takes effect on the next snapshot."]}),e.jsxs("div",{style:{display:"flex",gap:10,marginTop:20},children:[e.jsxs("button",{className:"btn-save",onClick:S,disabled:r==="gemini"?!l.trim():!d.trim(),children:[e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z",stroke:"currentColor",strokeWidth:"1.8",strokeLinejoin:"round"}),e.jsx("path",{d:"M17 21v-8H7v8M7 3v5h8",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round"})]}),"Save"]}),(l||d)&&e.jsx("button",{className:"btn-danger",onClick:N,children:"Clear keys"})]})]}),n==="blocklist"&&e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-title",children:"Privacy — blocked domains"}),e.jsx("p",{style:{fontSize:12.5,color:"#4b5568",lineHeight:1.6,marginBottom:20},children:"TabMind will never extract page text from these domains. Tab titles and URLs are still used for session summaries."}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16},children:c.map(t=>e.jsxs("button",{className:"blocklist-tag",onClick:()=>C(t),title:"Click to remove",children:[t," ",e.jsx("span",{style:{opacity:.5,fontSize:10},children:"×"})]},t))}),e.jsxs("div",{style:{display:"flex",gap:8},children:[e.jsx("input",{className:"input",style:{fontFamily:"inherit",flex:1},placeholder:"example.com",value:b,onChange:t=>y(t.target.value),onKeyDown:t=>t.key==="Enter"&&k()}),e.jsx("button",{className:"btn-save",style:{marginTop:0,flexShrink:0},onClick:k,disabled:!b.trim(),children:"Add"})]}),e.jsx("button",{onClick:z,style:{marginTop:14,fontSize:12,color:"#4b5568",background:"none",border:"none",cursor:"pointer",padding:0},children:"Reset to defaults ↺"})]}),n==="about"&&e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-title",children:"Session settings"}),[["Snapshot interval","90 seconds"],["History kept","50 sessions"],["Session reset","5 min idle"],["Notes storage","chrome.storage.sync"],["Keys storage","chrome.storage.sync (encrypted by Chrome)"],["Snapshots storage","chrome.storage.local"],["Tab grouping","automatic, via chrome.tabGroups"],["Keyboard shortcut","⌘⇧K / Ctrl+Shift+K"]].map(([t,a])=>e.jsxs("div",{className:"row",children:[e.jsx("span",{className:"row-key",children:t}),e.jsx("span",{className:"row-val",children:a})]},t)),e.jsx("div",{style:{display:"flex",gap:16,marginTop:20},children:[{label:"Source code",href:"https://github.com/thribhuvan003/tabmind"},{label:"Report issue",href:"https://github.com/thribhuvan003/tabmind/issues"}].map(({label:t,href:a})=>e.jsxs("a",{href:a,target:"_blank",rel:"noopener noreferrer",style:{fontSize:12.5,color:"#4b5568",textDecoration:"none"},onMouseEnter:o=>{o.currentTarget.style.color="#94a3b8"},onMouseLeave:o=>{o.currentTarget.style.color="#4b5568"},children:[t," →"]},t))})]})]})}B.createRoot(document.getElementById("root")).render(e.jsx(P.StrictMode,{children:e.jsx(I,{})}));
