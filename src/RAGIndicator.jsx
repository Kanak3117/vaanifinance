// ============================================================
//  VaaniFinance — RAGIndicator.jsx
//  Shows retrieved knowledge chunks prominently alongside
//  each chatbot answer. Drop this in wherever you render
//  chat messages — pass the `sources` array from askWithRAG().
//
//  Props:
//    sources     {Array}   from askWithRAG() — each item: { name, url, title, category }
//    chunks      {Array}   optional: raw retrieved chunks (with .score, .content excerpt)
//    intent      {string}  detected intent ("rates", "comparison", "howto", …)
//    isOffline   {boolean} true when Groq was unavailable, answer from KB directly
//    darkMode    {boolean}
//    lang        {string}  "hi" | "en" | "ta" | "bn" | "mr"
//    expanded    {boolean} default expand state
// ============================================================

import { useState } from "react";

const T = {
  hi: {
    title:      "RAG काम में",
    retrieved:  "हिस्से मिले",
    intent:     "Intent",
    source:     "स्रोत",
    offline:    "⚡ Offline KB",
    offlineSub: "Groq अनुपलब्ध — ब्लॉस्टम ज्ञान-आधार से सीधा जवाब",
    aiUsed:     "✅ AI + KB",
    aiSub:      "LLaMA-3.3 (70B) ने ज्ञान-आधार से जवाब दिया",
    expand:     "RAG देखें",
    collapse:   "छुपाएं",
    confidence: "Relevance",
    noChunks:   "सीधे AI से जवाब (ज्ञान-आधार प्रासंगिक नहीं था)",
  },
  en: {
    title:      "RAG in Action",
    retrieved:  "chunks retrieved",
    intent:     "Intent",
    source:     "Source",
    offline:    "⚡ Offline KB",
    offlineSub: "Groq unavailable — answered directly from Blostem KB",
    aiUsed:     "✅ AI + KB",
    aiSub:      "LLaMA-3.3 (70B) answered using retrieved KB context",
    expand:     "View RAG",
    collapse:   "Hide",
    confidence: "Relevance",
    noChunks:   "Direct AI answer (KB not relevant for this query)",
  },
};
["ta","bn","mr","hl"].forEach(c => { T[c] = T.en; });

// ── Intent → human label map ────────────────────────────────────────────────
const INTENT_LABEL = {
  rates:          { label: "Interest Rates",    color: "#1565c0", bg: "#e3f2fd" },
  comparison:     { label: "Comparison",        color: "#6a1b9a", bg: "#ede7f6" },
  partner_list:   { label: "Partner Banks",     color: "#1a6b3c", bg: "#e8f5e9" },
  howto:          { label: "How-To Guide",      color: "#e65100", bg: "#fff3e0" },
  safety:         { label: "Safety / DICGC",    color: "#c62828", bg: "#ffebee" },
  tax:            { label: "Tax Info",          color: "#00695c", bg: "#e0f2f1" },
  definition:     { label: "Definition",        color: "#455a64", bg: "#eceff1" },
  monthly_savings:{ label: "Monthly Savings",   color: "#2e7d32", bg: "#e8f5e9" },
  senior_citizen: { label: "Senior Citizen",    color: "#b71c1c", bg: "#fce4ec" },
  general:        { label: "General Query",     color: "#546e7a", bg: "#eceff1" },
};

// ── Category → badge style ──────────────────────────────────────────────────
function categoryBadge(cat) {
  if (!cat) return { label: "KB", color: "#888", bg: "#f0f0f0" };
  if (cat === "blostem_kb" || cat.startsWith("blostem")) return { label: "Blostem KB",  color: "#1a6b3c", bg: "#e8f5e9" };
  if (cat === "rbi_rules")                                return { label: "RBI",         color: "#1565c0", bg: "#e3f2fd" };
  if (cat === "partner_fd")                               return { label: "Partner FD",  color: "#e65100", bg: "#fff3e0" };
  if (cat === "partner_comparison")                       return { label: "Comparison",  color: "#6a1b9a", bg: "#ede7f6" };
  return { label: cat.replace(/_/g, " "), color: "#546e7a", bg: "#eceff1" };
}

// ── Relevance bar ────────────────────────────────────────────────────────────
function RelevanceBar({ score, darkMode }) {
  // score is relative; normalise to 0-100 (max expected ~30)
  const pct = Math.min(100, Math.round((score / 30) * 100));
  const color = pct > 66 ? "#1a6b3c" : pct > 33 ? "#e65100" : "#888";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 5, background: darkMode ? "#1c2e20" : "#e8f0eb", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontSize: 10, color, fontWeight: 700, minWidth: 28 }}>{pct}%</span>
    </div>
  );
}

// ── Single chunk card ────────────────────────────────────────────────────────
function ChunkCard({ source, index, darkMode, lang }) {
  const badge = categoryBadge(source.category);
  const bg    = darkMode ? "#0d1a10" : "#ffffff";
  const txt   = darkMode ? "#c8e6cc" : "#333";
  const sub   = darkMode ? "#5a8a6a" : "#777";

  return (
    <div style={{
      background: bg,
      borderRadius: 12,
      padding: "10px 12px",
      border: `1px solid ${darkMode ? "#1c2e20" : "#e0ede4"}`,
      boxShadow: `0 2px 8px rgba(0,0,0,${darkMode ? 0.25 : 0.05})`,
      animation: `chunkIn 0.4s ease ${index * 0.08}s both`,
    }}>
      {/* Index + source name */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 7 }}>
        <div style={{
          width: 20, height: 20,
          borderRadius: "50%",
          background: "#1a6b3c",
          color: "white",
          fontSize: 10, fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginTop: 1,
        }}>
          {index + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: txt, lineHeight: 1.4, wordBreak: "break-word" }}>
            {source.title || source.name}
          </div>
          <div style={{ fontSize: 10, color: sub, marginTop: 2 }}>{source.name}</div>
        </div>
      </div>

      {/* Category badge + relevance */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{
          fontSize: 10, fontWeight: 700,
          padding: "2px 8px", borderRadius: 99,
          background: badge.bg, color: badge.color,
          border: `1px solid ${badge.color}44`,
        }}>
          📚 {badge.label}
        </span>
        {source.url && source.url !== "#" && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 10, color: "#1a6b3c", textDecoration: "none", fontWeight: 600 }}
          >
            🔗 View Source
          </a>
        )}
      </div>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function RAGIndicator({
  sources    = [],
  intent     = "general",
  isOffline  = false,
  darkMode   = false,
  lang       = "hi",
  expanded: defaultExpanded = false,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const lc  = T[lang] ? lang : "en";
  const t   = T[lc];

  const intentInfo = INTENT_LABEL[intent] || INTENT_LABEL.general;
  const hasSources = sources && sources.length > 0;

  // If no sources at all — show minimal "direct AI" pill
  if (!hasSources) {
    return (
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: darkMode ? "#111e14" : "#f5f5f5",
        borderRadius: 99, padding: "3px 10px",
        border: `1px solid ${darkMode ? "#1c2e20" : "#ddd"}`,
        marginTop: 6,
      }}>
        <span style={{ fontSize: 10, color: darkMode ? "#7a9a7a" : "#888" }}>
          🤖 {t.noChunks}
        </span>
      </div>
    );
  }

  const cardBg  = darkMode ? "#080f0a" : "#f7faf8";
  const border  = darkMode ? "#1c2e20" : "#d8ede0";

  return (
    <div style={{
      marginTop: 8,
      background: cardBg,
      borderRadius: 14,
      border: `1.5px solid ${isOffline ? "#e65100" : "#1a6b3c"}`,
      overflow: "hidden",
      boxShadow: `0 2px 12px rgba(${isOffline ? "230,81,0" : "26,107,60"},${darkMode ? 0.2 : 0.1})`,
    }}>
      {/* ── Header row — always visible ── */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: "100%",
          display: "flex", alignItems: "center", gap: 8,
          padding: "9px 12px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        {/* Animated pulsing dot */}
        <div style={{
          width: 8, height: 8,
          borderRadius: "50%",
          background: isOffline ? "#e65100" : "#1a6b3c",
          animation: "ragPulse 2s infinite",
          flexShrink: 0,
        }} />

        {/* RAG title */}
        <span style={{ fontSize: 11, fontWeight: 800, color: isOffline ? "#e65100" : "#1a6b3c", flex: 1 }}>
          🔍 {t.title}
        </span>

        {/* Chunk count badge */}
        <span style={{
          fontSize: 10, fontWeight: 700,
          padding: "2px 8px", borderRadius: 99,
          background: isOffline ? "#fff3e0" : "#e8f5e9",
          color: isOffline ? "#e65100" : "#1a6b3c",
          border: `1px solid ${isOffline ? "#ffcc80" : "#b2dfcc"}`,
        }}>
          {sources.length} {t.retrieved}
        </span>

        {/* Intent badge */}
        <span style={{
          fontSize: 10, fontWeight: 700,
          padding: "2px 8px", borderRadius: 99,
          background: intentInfo.bg,
          color: intentInfo.color,
          border: `1px solid ${intentInfo.color}44`,
        }}>
          {intentInfo.label}
        </span>

        {/* Expand/collapse */}
        <span style={{ fontSize: 11, color: darkMode ? "#5db87a" : "#1a6b3c", fontWeight: 700 }}>
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {/* ── Expanded body ── */}
      {expanded && (
        <div style={{ padding: "0 12px 12px 12px", borderTop: `1px solid ${border}` }}>
          {/* AI mode indicator */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 10px",
            margin: "10px 0 10px 0",
            background: isOffline
              ? (darkMode ? "#1a0a00" : "#fff8f0")
              : (darkMode ? "#0a150d" : "#f0faf3"),
            borderRadius: 10,
            border: `1px solid ${isOffline ? "#ffcc8044" : "#b2dfcc44"}`,
          }}>
            <span style={{ fontSize: 16 }}>{isOffline ? "⚡" : "🤖"}</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: isOffline ? "#e65100" : "#1a6b3c" }}>
                {isOffline ? t.offline : t.aiUsed}
              </div>
              <div style={{ fontSize: 10, color: darkMode ? "#7a9a7a" : "#777", marginTop: 2 }}>
                {isOffline ? t.offlineSub : t.aiSub}
              </div>
            </div>
          </div>

          {/* Pipeline diagram */}
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            marginBottom: 12, overflowX: "auto", paddingBottom: 4,
          }}>
            {[
              { icon: "💬", label: "Query" },
              { icon: "→", label: "" },
              { icon: "🔍", label: "TF-IDF\nSearch" },
              { icon: "→", label: "" },
              { icon: "📚", label: `${sources.length} Chunks` },
              { icon: "→", label: "" },
              { icon: isOffline ? "⚡" : "🤖", label: isOffline ? "KB Answer" : "LLaMA-3.3" },
              { icon: "→", label: "" },
              { icon: "✅", label: "Answer" },
            ].map((step, i) => (
              step.label === "" ? (
                <div key={i} style={{ fontSize: 12, color: darkMode ? "#3a6a4a" : "#b2dfcc", flexShrink: 0 }}>→</div>
              ) : (
                <div key={i} style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 2, flexShrink: 0,
                  padding: "5px 7px",
                  background: darkMode ? "#0d1a10" : "white",
                  borderRadius: 8,
                  border: `1px solid ${darkMode ? "#1c2e20" : "#e0ede4"}`,
                  minWidth: 44,
                }}>
                  <span style={{ fontSize: 14 }}>{step.icon}</span>
                  <span style={{ fontSize: 8, fontWeight: 600, color: darkMode ? "#7aaa8a" : "#888", textAlign: "center", whiteSpace: "pre-line", lineHeight: 1.2 }}>
                    {step.label}
                  </span>
                </div>
              )
            ))}
          </div>

          {/* Retrieved chunks */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sources.map((src, i) => (
              <ChunkCard
                key={i}
                source={src}
                index={i}
                darkMode={darkMode}
                lang={lc}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Animations ── */}
      <style>{`
        @keyframes ragPulse {
          0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(26,107,60,0.4); }
          50%      { opacity: 0.7; box-shadow: 0 0 0 5px rgba(26,107,60,0); }
        }
        @keyframes chunkIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}