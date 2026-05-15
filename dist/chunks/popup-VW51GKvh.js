import{r as s,d as h,s as a,j as e,c as b}from"./storage-10xQbvk4.js";const m=`
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Geist", "Inter", system-ui, sans-serif;
    background: #0b0b0f;
    color: #f3f4f7;
    min-width: 320px; max-width: 348px;
    -webkit-font-smoothing: antialiased;
  }
  @keyframes rise {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .body { animation: rise 260ms cubic-bezier(0.16,1,0.3,1) both; }
  .eyebrow {
    font-size: 9.5px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: #a78bfa;
  }
  .todo {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 7px 10px;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
    border-left: 2px solid rgba(167,139,250,0.4);
    border-radius: 7px; font-size: 12px;
    color: rgba(243,244,247,0.8); line-height: 1.5;
  }
  .btn-primary {
    width: 100%; padding: 11px; font-size: 13px; font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    box-shadow: 0 3px 14px rgba(124,58,237,0.3);
    transition: box-shadow 200ms cubic-bezier(0.16,1,0.3,1);
  }
  .btn-primary:hover { box-shadow: 0 5px 22px rgba(124,58,237,0.45); }
  .btn-ghost {
    display: block; width: 100%; text-align: center; padding: 10px;
    font-size: 12.5px; font-weight: 500;
    color: rgba(167,139,250,0.85);
    background: rgba(167,139,250,0.08);
    border: 1px solid rgba(167,139,250,0.2);
    border-radius: 9px; cursor: pointer;
    transition: background 150ms ease;
  }
  .btn-ghost:hover { background: rgba(167,139,250,0.14); }
`;function f(){var n;const[r,l]=s.useState(null),[o,d]=s.useState(null);s.useEffect(()=>{Promise.all([h(),a("tabmind:gemini:apiKey"),a("tabmind:openai:apiKey")]).then(([t,i,x])=>{l(t),d(!!(i||x))})},[]);const c=r?Math.max(1,Math.round(r.durationMs/6e4)):0,p=o===null;function g(){chrome.runtime.sendMessage({type:"TABMIND_OPEN_WIDGET_ACTIVE"},()=>{window.close()})}return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:m}),e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px 11px",borderBottom:"1px solid rgba(255,255,255,0.07)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"pg",x1:"0",y1:"0",x2:"24",y2:"24",children:[e.jsx("stop",{offset:"0%",stopColor:"#a78bfa"}),e.jsx("stop",{offset:"100%",stopColor:"#6d28d9"})]})}),e.jsx("circle",{cx:"12",cy:"12",r:"9",stroke:"url(#pg)",strokeWidth:"1.4",opacity:"0.55"}),e.jsx("ellipse",{cx:"12",cy:"12",rx:"9",ry:"3.6",stroke:"url(#pg)",strokeWidth:"1.2",opacity:"0.4",transform:"rotate(-28 12 12)"}),e.jsx("circle",{cx:"12",cy:"12",r:"2.6",fill:"url(#pg)"}),e.jsx("circle",{cx:"20",cy:"6.5",r:"1.5",fill:"#a78bfa"})]}),e.jsx("span",{style:{fontSize:13.5,fontWeight:650,letterSpacing:"-0.02em"},children:"TabMind"}),e.jsx("span",{style:{fontSize:9.5,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",color:"#a78bfa",background:"rgba(167,139,250,0.14)",border:"1px solid rgba(167,139,250,0.28)",padding:"2px 6px",borderRadius:99},children:"AI"})]}),e.jsx("button",{onClick:()=>chrome.runtime.openOptionsPage(),title:"Settings",style:{width:28,height:28,border:"none",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:7,color:"rgba(255,255,255,0.3)",transition:"all 150ms ease"},onMouseEnter:t=>{t.currentTarget.style.background="rgba(255,255,255,0.07)",t.currentTarget.style.color="rgba(255,255,255,0.7)"},onMouseLeave:t=>{t.currentTarget.style.background="transparent",t.currentTarget.style.color="rgba(255,255,255,0.3)"},children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3",stroke:"currentColor",strokeWidth:"1.8"}),e.jsx("path",{d:"M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",opacity:"0.6"})]})})]}),e.jsx("div",{className:"body",style:{padding:"14px 16px 16px"},children:p?e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:8},children:[80,100,65].map((t,i)=>e.jsx("div",{style:{height:i===0?10:8,width:`${t}%`,background:"rgba(255,255,255,0.06)",borderRadius:4}},i))}):o?r?e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{marginBottom:12},children:[e.jsxs("div",{className:"eyebrow",style:{marginBottom:6},children:["Working on · ",c,"m"]}),e.jsx("div",{style:{fontSize:15,fontWeight:650,letterSpacing:"-0.02em",color:"#f3f4f7",marginBottom:6},children:r.topic}),e.jsx("p",{style:{fontSize:12.5,lineHeight:1.6,color:"rgba(161,164,176,0.9)",letterSpacing:"-0.005em"},children:r.narrative||r.summary})]}),((n=r.todos)==null?void 0:n.length)>0&&e.jsxs("div",{style:{marginBottom:14},children:[e.jsx("div",{className:"eyebrow",style:{marginBottom:8},children:"Action items"}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:4},children:r.todos.slice(0,3).map((t,i)=>e.jsxs("div",{className:"todo",children:[e.jsx("svg",{width:"10",height:"10",viewBox:"0 0 12 12",fill:"none",style:{marginTop:3,flexShrink:0},children:e.jsx("rect",{x:".75",y:".75",width:"10.5",height:"10.5",rx:"2.5",stroke:"rgba(167,139,250,0.55)",strokeWidth:"1.2"})}),e.jsx("span",{style:{flex:1},children:typeof t=="string"?t:t.text}),typeof t!="string"&&t.deadline&&e.jsx("span",{style:{fontSize:10,color:"#fcd34d",background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.22)",padding:"1px 6px",borderRadius:99,fontVariantNumeric:"tabular-nums"},children:t.deadline})]},i))})]}),e.jsxs("button",{className:"btn-primary",onClick:g,children:[e.jsxs("svg",{width:"13",height:"13",viewBox:"0 0 16 16",fill:"none",children:[e.jsx("circle",{cx:"8",cy:"8",r:"5",stroke:"currentColor",strokeWidth:"1.4",opacity:"0.5"}),e.jsx("path",{d:"M8 5v3l2 1.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),"Open widget on this page"]})]}):e.jsxs("div",{style:{padding:"6px 0 8px"},children:[e.jsxs("p",{style:{fontSize:13,color:"rgba(148,163,184,0.6)",fontStyle:"italic",lineHeight:1.55,marginBottom:14},children:["Watching your tabs silently…",e.jsx("br",{}),"First snapshot in up to 90 seconds."]}),e.jsx("button",{className:"btn-primary",onClick:()=>{chrome.runtime.sendMessage({type:"TABMIND_SNAPSHOT_NOW"}),window.close()},children:"Analyze now"})]}):e.jsxs("div",{style:{textAlign:"center",padding:"8px 0 4px"},children:[e.jsx("div",{style:{width:40,height:40,borderRadius:12,background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.25)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"},children:e.jsx("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4",stroke:"#a78bfa",strokeWidth:"1.7",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("p",{style:{fontSize:13,color:"rgba(243,244,247,0.8)",fontWeight:550,marginBottom:4},children:"Add your API key"}),e.jsx("p",{style:{fontSize:11.5,color:"rgba(148,163,184,0.7)",lineHeight:1.5,marginBottom:16},children:"Free Gemini key from Google AI Studio — takes 30 seconds."}),e.jsx("button",{className:"btn-ghost",onClick:()=>chrome.runtime.openOptionsPage(),children:"Open settings →"})]})})]})}b.createRoot(document.getElementById("root")).render(e.jsx(f,{}));
