"use client";

export default function BrowserMockup() {
  return (
    <div
      className="float"
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 560,
        userSelect: "none",
      }}
    >
      {/* Glow behind browser */}
      <div
        style={{
          position: "absolute",
          inset: "-20px",
          background:
            "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(124,58,237,0.18) 0%, transparent 70%)",
          filter: "blur(24px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Browser shell */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: "#0f1020",
          borderRadius: 14,
          border: "1px solid #252840",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
          overflow: "hidden",
        }}
      >
        {/* Browser chrome */}
        <div
          style={{
            background: "#0a0b14",
            borderBottom: "1px solid #1a1d2e",
            padding: "10px 12px 0",
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />

            {/* URL bar */}
            <div
              style={{
                flex: 1,
                margin: "0 12px",
                height: 24,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid #1a1d2e",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" opacity="0.4">
                <rect x="1" y="3" width="10" height="8" rx="1.5" stroke="#94a3b8" strokeWidth="1.2" />
                <path d="M4 3V2.5a2 2 0 114 0V3" stroke="#94a3b8" strokeWidth="1.2" />
              </svg>
              <span style={{ fontSize: 10, color: "#4b5568", fontFamily: "monospace" }}>
                github.com/react-docs
              </span>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 2 }}>
            <Tab label="React Docs" icon="📄" active />
            <Tab label="WXT Framework" icon="🔧" />
            <Tab label="GitHub Issues" icon="🐛" />
          </div>
        </div>

        {/* Viewport */}
        <div
          style={{
            position: "relative",
            background: "#0c0d18",
            minHeight: 300,
            padding: 16,
            overflow: "hidden",
          }}
        >
          {/* Fake page content (blurred) */}
          <PageContent />

          {/* TabMind widget */}
          <div
            className="widget-in"
            style={{
              position: "absolute",
              bottom: 16,
              right: 16,
              width: 252,
              background: "linear-gradient(160deg, #0c0e1a 0%, #101326 100%)",
              border: "1px solid rgba(100,90,200,0.28)",
              borderRadius: 14,
              boxShadow:
                "0 12px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3), 0 0 0 1px rgba(124,58,237,0.08)",
              overflow: "hidden",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            <WidgetHeader />
            <Divider />
            <WidgetSession />
            <Divider faint />
            <WidgetTodos />
          </div>
        </div>
      </div>
    </div>
  );
}

function Tab({ label, icon, active }: { label: string; icon: string; active?: boolean }) {
  return (
    <div
      className={active ? undefined : "tab-anim"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "6px 12px",
        borderRadius: "6px 6px 0 0",
        background: active ? "#0f1020" : "transparent",
        border: active ? "1px solid #1a1d2e" : "1px solid transparent",
        borderBottom: active ? "1px solid #0f1020" : "none",
        fontSize: 11,
        color: active ? "#f0f2f8" : "#4b5568",
        cursor: "pointer",
        whiteSpace: "nowrap",
        maxWidth: 130,
        overflow: "hidden",
      }}
    >
      <span style={{ fontSize: 10 }}>{icon}</span>
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function PageContent() {
  return (
    <div style={{ opacity: 0.25 }}>
      {/* Fake nav */}
      <div
        style={{
          height: 36,
          background: "rgba(255,255,255,0.04)",
          borderRadius: 6,
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          gap: 12,
        }}
      >
        {[100, 70, 80].map((w, i) => (
          <div key={i} style={{ height: 8, width: w, background: "rgba(255,255,255,0.15)", borderRadius: 4 }} />
        ))}
      </div>
      {/* Fake heading */}
      <div style={{ height: 14, width: "55%", background: "rgba(255,255,255,0.2)", borderRadius: 4, marginBottom: 10 }} />
      <div style={{ height: 10, width: "80%", background: "rgba(255,255,255,0.1)", borderRadius: 4, marginBottom: 6 }} />
      <div style={{ height: 10, width: "70%", background: "rgba(255,255,255,0.1)", borderRadius: 4, marginBottom: 6 }} />
      <div style={{ height: 10, width: "60%", background: "rgba(255,255,255,0.1)", borderRadius: 4, marginBottom: 18 }} />
      {/* Fake code block */}
      <div
        style={{
          height: 72,
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 8,
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {[80, 65, 50].map((w, i) => (
          <div
            key={i}
            style={{
              height: 7,
              width: `${w}%`,
              background: "rgba(167,139,250,0.3)",
              borderRadius: 3,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function WidgetHeader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 14 }}>🧠</span>
        <span style={{ fontSize: 12, fontWeight: 650, letterSpacing: "-0.01em", color: "#f0f2f8" }}>
          TabMind
        </span>
        <span
          style={{
            fontSize: 8.5,
            fontWeight: 600,
            letterSpacing: "0.07em",
            color: "#a78bfa",
            background: "rgba(124,58,237,0.15)",
            border: "1px solid rgba(124,58,237,0.28)",
            padding: "1px 5px",
            borderRadius: 99,
            textTransform: "uppercase",
          }}
        >
          AI
        </span>
      </div>
      <div style={{ display: "flex", gap: 3 }}>
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: "rgba(255,255,255,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 10, height: 1, background: "rgba(255,255,255,0.3)", borderRadius: 1 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function WidgetSession() {
  return (
    <div style={{ padding: "8px 12px 10px" }}>
      <p
        style={{
          fontSize: 8.5,
          fontWeight: 700,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          color: "#6d5cba",
          marginBottom: 6,
        }}
      >
        Working on
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 8px 3px 6px",
            borderRadius: 99,
            border: "1px solid rgba(124,58,237,0.28)",
            background: "rgba(124,58,237,0.08)",
          }}
        >
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#a78bfa" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#e4d9ff" }}>React Development</span>
          <span
            style={{
              fontSize: 10,
              color: "#5a5070",
              borderLeft: "1px solid rgba(255,255,255,0.1)",
              paddingLeft: 5,
            }}
          >
            18m
          </span>
        </div>
      </div>
      <p
        style={{
          fontSize: 11,
          lineHeight: 1.55,
          color: "#7a7a9a",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        Reviewing component patterns and WXT extension API for content script setup.
      </p>
    </div>
  );
}

function WidgetTodos() {
  const todos = ["Check WXT migration docs", "Set up content script CSP"];
  return (
    <div style={{ padding: "8px 12px 12px" }}>
      <p
        style={{
          fontSize: 8.5,
          fontWeight: 700,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          color: "#6d5cba",
          marginBottom: 6,
        }}
      >
        Extracted ({todos.length})
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {todos.map((todo, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 6,
              padding: "5px 8px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderLeft: "2px solid rgba(124,58,237,0.6)",
              borderRadius: 6,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                border: "1px solid rgba(100,80,200,0.5)",
                borderRadius: 2,
                flexShrink: 0,
                marginTop: 1,
              }}
            />
            <span style={{ fontSize: 10.5, lineHeight: 1.5, color: "#7a8099" }}>{todo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Divider({ faint }: { faint?: boolean }) {
  return (
    <div
      style={{
        height: 1,
        margin: "0 12px",
        background: faint ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.07)",
      }}
    />
  );
}
