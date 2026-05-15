import{r as t,s as n,g as P,j as e,a as s,b as k,D as K,c as L,R as D}from"./storage-D50erzAd.js";const _=`
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
  .provider-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 24px; }
  .provider-btn {
    padding: 12px 8px; border-radius: 10px; cursor: pointer; border: 1px solid rgba(255,255,255,0.09);
    background: rgba(255,255,255,0.03); color: #6b6f7d; font-size: 12px; font-weight: 500;
    text-align: center; transition: all 160ms ease; line-height: 1.4;
  }
  .provider-btn.active {
    color: #e4d9ff; background: rgba(167,139,250,0.12);
    border-color: rgba(167,139,250,0.4);
    box-shadow: 0 0 0 3px rgba(167,139,250,0.08);
  }
  .provider-btn .provider-name { font-size: 13px; font-weight: 600; display: block; }
  .provider-btn .provider-sub { font-size: 10px; opacity: 0.6; display: block; margin-top: 2px; }
  .free-badge {
    display: inline-block; font-size: 9px; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; padding: 1px 6px; border-radius: 99px;
    background: rgba(74,222,128,0.12); color: #4ade80;
    border: 1px solid rgba(74,222,128,0.25); margin-top: 4px;
  }
`;function W(){const[l,z]=t.useState("api"),[o,v]=t.useState("grok"),[d,x]=t.useState(""),[c,h]=t.useState(""),[p,f]=t.useState(""),[g,u]=t.useState(""),[A,j]=t.useState(!1),[m,b]=t.useState([]),[y,w]=t.useState("");t.useEffect(()=>{Promise.all([n("tabmind:grok:apiKey"),n("tabmind:claude:apiKey"),n("tabmind:gemini:apiKey"),n("tabmind:openai:apiKey"),n("tabmind:provider"),P()]).then(([a,r,i,S,C,M])=>{a&&x(a),r&&h(r),i&&f(i),S&&u(S),C&&v(C),b(M)})},[]);const T=async()=>{await Promise.all([s("tabmind:provider",o),s("tabmind:grok:apiKey",d.trim()),s("tabmind:claude:apiKey",c.trim()),s("tabmind:gemini:apiKey",p.trim()),s("tabmind:openai:apiKey",g.trim())]),chrome.runtime.sendMessage({type:"TABMIND_SNAPSHOT_NOW"}).catch(()=>{}),j(!0),setTimeout(()=>j(!1),3e3)},G=()=>o==="grok"?!!d.trim():o==="claude"?!!c.trim():o==="openai"?!!g.trim():!!p.trim(),I=async()=>{await Promise.all([s("tabmind:grok:apiKey",""),s("tabmind:claude:apiKey",""),s("tabmind:gemini:apiKey",""),s("tabmind:openai:apiKey","")]),x(""),h(""),f(""),u("")},N=async()=>{const a=y.trim().toLowerCase().replace(/^https?:\/\//,"").split("/")[0];if(!a||m.includes(a))return;const r=[...m,a];b(r),await k(r),w("")},B=async a=>{const r=m.filter(i=>i!==a);b(r),await k(r)},F=async()=>{b(K),await k(K)};return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:_}),e.jsxs("div",{style:{marginBottom:32},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:6},children:[e.jsxs("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"og",x1:"0",y1:"0",x2:"24",y2:"24",children:[e.jsx("stop",{offset:"0%",stopColor:"#a78bfa"}),e.jsx("stop",{offset:"100%",stopColor:"#6d28d9"})]})}),e.jsx("circle",{cx:"12",cy:"12",r:"9",stroke:"url(#og)",strokeWidth:"1.4",opacity:"0.55"}),e.jsx("ellipse",{cx:"12",cy:"12",rx:"9",ry:"3.6",stroke:"url(#og)",strokeWidth:"1.2",opacity:"0.4",transform:"rotate(-28 12 12)"}),e.jsx("circle",{cx:"12",cy:"12",r:"2.6",fill:"url(#og)"}),e.jsx("circle",{cx:"20",cy:"6.5",r:"1.5",fill:"#a78bfa"})]}),e.jsx("h1",{style:{fontSize:22,fontWeight:760,letterSpacing:"-0.03em"},children:"TabMind"}),e.jsx("span",{className:"tag",children:"Settings"})]}),e.jsx("p",{style:{fontSize:13.5,color:"#64748b",letterSpacing:"-0.005em"},children:"Configure your AI session tracker"})]}),e.jsx("div",{className:"tab-bar",children:["api","blocklist","about"].map(a=>e.jsx("button",{className:`tab${l===a?" active":""}`,onClick:()=>z(a),children:a==="api"?"AI Provider":a==="blocklist"?"Privacy":"About"},a))}),l==="api"&&e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-title",children:"AI Provider"}),e.jsx("label",{className:"label",children:"Choose provider"}),e.jsx("div",{className:"provider-grid",children:[{id:"grok",name:"Grok",sub:"grok-3-mini",free:!0},{id:"claude",name:"Claude",sub:"Haiku 4.5",free:!0},{id:"gemini",name:"Gemini",sub:"2.0 Flash",free:!0},{id:"openai",name:"OpenAI",sub:"GPT-4o mini",free:!1}].map(a=>e.jsxs("button",{className:`provider-btn${o===a.id?" active":""}`,onClick:()=>v(a.id),children:[e.jsx("span",{className:"provider-name",children:a.name}),e.jsx("span",{className:"provider-sub",children:a.sub}),a.free&&e.jsx("span",{className:"free-badge",children:"free tier"})]},a.id))}),o==="grok"&&e.jsxs(e.Fragment,{children:[e.jsx("label",{className:"label",htmlFor:"grok-key",children:"xAI API key"}),e.jsx("input",{id:"grok-key",className:"input",type:"password",value:d,onChange:a=>x(a.target.value),placeholder:"gsk_…",autoComplete:"off"}),e.jsxs("p",{className:"hint",children:["Get a key from ",e.jsx("a",{href:"https://console.x.ai",target:"_blank",rel:"noopener",children:"console.x.ai"}),". Uses ",e.jsx("strong",{style:{color:"#c4b5fd"},children:"grok-3-mini"})," — fast, free tier available."]})]}),o==="claude"&&e.jsxs(e.Fragment,{children:[e.jsx("label",{className:"label",htmlFor:"claude-key",children:"Anthropic API key"}),e.jsx("input",{id:"claude-key",className:"input",type:"password",value:c,onChange:a=>h(a.target.value),placeholder:"sk-ant-…",autoComplete:"off"}),e.jsxs("p",{className:"hint",children:["Get a free key from ",e.jsx("a",{href:"https://console.anthropic.com/settings/keys",target:"_blank",rel:"noopener",children:"console.anthropic.com"}),". Uses ",e.jsx("strong",{style:{color:"#c4b5fd"},children:"claude-haiku-4-5"})," — fastest model, generous free tier."]})]}),o==="gemini"&&e.jsxs(e.Fragment,{children:[e.jsx("label",{className:"label",htmlFor:"gemini-key",children:"Gemini API key"}),e.jsx("input",{id:"gemini-key",className:"input",type:"password",value:p,onChange:a=>f(a.target.value),placeholder:"AIzaSy…",autoComplete:"off"}),e.jsxs("p",{className:"hint",children:["Free key from ",e.jsx("a",{href:"https://aistudio.google.com/apikey",target:"_blank",rel:"noopener",children:"aistudio.google.com"})," — create a ",e.jsx("strong",{style:{color:"#c4b5fd"},children:"new project"})," to get free tier access."]})]}),o==="openai"&&e.jsxs(e.Fragment,{children:[e.jsx("label",{className:"label",htmlFor:"openai-key",children:"OpenAI API key"}),e.jsx("input",{id:"openai-key",className:"input",type:"password",value:g,onChange:a=>u(a.target.value),placeholder:"sk-…",autoComplete:"off"}),e.jsxs("p",{className:"hint",children:["Key from ",e.jsx("a",{href:"https://platform.openai.com/api-keys",target:"_blank",rel:"noopener",children:"platform.openai.com"}),". Uses gpt-4o-mini — costs ~$0.001 per session analysis."]})]}),A&&e.jsxs("div",{className:"status-ok",children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M20 6L9 17l-5-5",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),"Saved — analyzing your tabs now…"]}),e.jsxs("div",{style:{display:"flex",gap:10,marginTop:20},children:[e.jsxs("button",{className:"btn-save",onClick:T,disabled:!G(),children:[e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z",stroke:"currentColor",strokeWidth:"1.8",strokeLinejoin:"round"}),e.jsx("path",{d:"M17 21v-8H7v8M7 3v5h8",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round"})]}),"Save & analyze now"]}),(d||c||p||g)&&e.jsx("button",{className:"btn-danger",onClick:I,children:"Clear keys"})]})]}),l==="blocklist"&&e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-title",children:"Privacy — blocked domains"}),e.jsx("p",{style:{fontSize:12.5,color:"#4b5568",lineHeight:1.6,marginBottom:20},children:"TabMind will never extract page text from these domains. Tab titles and URLs are still used for session summaries."}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16},children:m.map(a=>e.jsxs("button",{className:"blocklist-tag",onClick:()=>B(a),title:"Click to remove",children:[a," ",e.jsx("span",{style:{opacity:.5,fontSize:10},children:"×"})]},a))}),e.jsxs("div",{style:{display:"flex",gap:8},children:[e.jsx("input",{className:"input",style:{fontFamily:"inherit",flex:1},placeholder:"example.com",value:y,onChange:a=>w(a.target.value),onKeyDown:a=>a.key==="Enter"&&N()}),e.jsx("button",{className:"btn-save",style:{marginTop:0,flexShrink:0},onClick:N,disabled:!y.trim(),children:"Add"})]}),e.jsx("button",{onClick:F,style:{marginTop:14,fontSize:12,color:"#4b5568",background:"none",border:"none",cursor:"pointer",padding:0},children:"Reset to defaults ↺"})]}),l==="about"&&e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-title",children:"Session settings"}),[["Snapshot interval","90 seconds"],["History kept","50 sessions"],["Session reset","5 min idle"],["Notes storage","chrome.storage.sync"],["Keys storage","chrome.storage.sync (encrypted by Chrome)"],["Snapshots storage","chrome.storage.local"],["Tab grouping","automatic, via chrome.tabGroups"],["Keyboard shortcut","⌘⇧K / Ctrl+Shift+K"]].map(([a,r])=>e.jsxs("div",{className:"row",children:[e.jsx("span",{className:"row-key",children:a}),e.jsx("span",{className:"row-val",children:r})]},a)),e.jsx("div",{style:{display:"flex",gap:16,marginTop:20},children:[{label:"Source code",href:"https://github.com/thribhuvan003/tabmind"},{label:"Report issue",href:"https://github.com/thribhuvan003/tabmind/issues"}].map(({label:a,href:r})=>e.jsxs("a",{href:r,target:"_blank",rel:"noopener noreferrer",style:{fontSize:12.5,color:"#4b5568",textDecoration:"none"},onMouseEnter:i=>{i.currentTarget.style.color="#94a3b8"},onMouseLeave:i=>{i.currentTarget.style.color="#4b5568"},children:[a," →"]},a))})]})]})}L.createRoot(document.getElementById("root")).render(e.jsx(D.StrictMode,{children:e.jsx(W,{})}));
