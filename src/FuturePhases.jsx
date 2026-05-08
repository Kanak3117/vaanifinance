// ============================================================
//  VaaniFinance — FuturePhases.jsx
//  A full-screen roadmap slide for the Guided Demo & standalone view
//  Shows Phase 2 (live APIs + partner agreements) and
//  Phase 3 (vector embeddings / true semantic RAG)
//  Props:
//    darkMode  {boolean}
//    lang      {string}  "hi" | "en" | "ta" | "bn" | "mr"
//    onClose   {fn}      called when user taps the close/back button
// ============================================================

import { useState, useEffect } from "react";

// ── Translations ──────────────────────────────────────────────────────────────
const T = {
  hi: {
    title:       "🚀 VaaniFinance — आगे की राह",
    subtitle:    "हमने अभी शुरुआत की है। यहाँ है हमारा रोडमैप:",
    phase1:      "चरण 1  ·  अभी चालू",
    phase1sub:   "हैकाथॉन प्रोटोटाइप",
    phase2:      "चरण 2  ·  Q3 2026",
    phase2sub:   "ब्लॉस्टम पार्टनर API सीधे जुड़े",
    phase3:      "चरण 3  ·  भविष्य",
    phase3sub:   "सच्ची अर्थ-खोज (Semantic RAG)",
    p1items: [
      "📚 जाँचा ज्ञान-आधार — RBI/SEBI/डाकघर दस्तावेज़",
      "🤖 Groq LLaMA-3 आधारित क्षेत्रीय भाषा चैट",
      "🏦 पार्टनर बैंकों की ब्याज दरें (यूनिटी, सूर्योदय…)",
      "🧮 हिसाब + सरकारी योजना खोजक",
      "🎤 5 भारतीय भाषाओं में आवाज़",
    ],
    p2items: [
      "🤝 ब्लॉस्टम पार्टनर बैंक का सीधा डेटा — सूर्योदय, यूनिटी, उत्कर्ष, बजाज",
      "📡 सावधि जमा दर APIs — बैंक से सीधे (अभी ज्ञान-आधार से)",
      "📄 पार्टनर PDF अपने-आप ज्ञान-आधार में जुड़ेंगे",
      "🔔 सूचना: ब्याज बदलाव, नई योजनाएं",
      "🏛️ RBI नियमन फ़ीड — हमेशा अद्यतन",
    ],
    p3items: [
      "🧬 pgvector / Pinecone अर्थ-आधारित खोज",
      "🔍 10,000+ हिस्सों में सच्ची समानता-खोज",
      "📝 हर हिस्से का हवाला और विश्वसनीयता अंक",
      "🌐 बहुभाषी अर्थ-खोज (mBERT / multilingual-e5)",
      "🤖 ब्लॉस्टम डेटा पर प्रशिक्षित विशेष AI मॉडल",
    ],
    impact:      "💡 Impact at Scale",
    impactSub:   "यह सिर्फ एक चैटबॉट नहीं — भारत की आर्थिक साक्षरता की नींव है",
    users:       "10M+",
    usersLabel:  "लक्षित उपयोगकर्ता",
    langs:       "22+",
    langsLabel:  "भारतीय भाषाएं",
    accuracy:    "95%",
    accuracyLabel: "जवाब सटीकता (चरण 3)",
    close:       "← वापस जाएं",
  },
  en: {
    title:       "🚀 VaaniFinance — The Road Ahead",
    subtitle:    "We've just started. Here is our Roadmap:",
    phase1:      "Phase 1  ·  Live Now",
    phase1sub:   "हैकाथॉन प्रोटोटाइप",
    phase2:      "चरण 2  ·  Q3 2026",
    phase2sub:   "ब्लॉस्टम पार्टनर API सीधे जुड़े",
    phase3:      "चरण 3  ·  भविष्य",
    phase3sub:   "सच्ची अर्थ-खोज (Semantic RAG)",
    p1items: [
      "📚 जाँचा ज्ञान-आधार — RBI/SEBI/डाकघर दस्तावेज़",
      "🤖 Groq LLaMA-3 आधारित क्षेत्रीय भाषा चैट",
      "🏦 पार्टनर बैंकों की ब्याज दरें (यूनिटी, सूर्योदय…)",
      "🧮 हिसाब + सरकारी योजना खोजक",
      "🎤 5 भारतीय भाषाओं में आवाज़",
    ],
    p2items: [
      "🤝 ब्लॉस्टम पार्टनर बैंक का सीधा डेटा — सूर्योदय, यूनिटी, उत्कर्ष, बजाज",
      "📡 सावधि जमा दर APIs — बैंक से सीधे (अभी ज्ञान-आधार से)",
      "📄 पार्टनर PDF अपने-आप ज्ञान-आधार में जुड़ेंगे",
      "🔔 Push alerts for rate changes, new schemes",
      "🏛️ RBI Regulatory feed — always current",
    ],
    p3items: [
      "🧬 pgvector / Pinecone अर्थ-आधारित खोज",
      "🔍 10,000+ हिस्सों में सच्ची समानता-खोज",
      "📝 हर हिस्से का हवाला और विश्वसनीयता अंक",
      "🌐 Multilingual embedding (mBERT / multilingual-e5)",
      "🤖 ब्लॉस्टम डेटा पर प्रशिक्षित विशेष AI मॉडल",
    ],
    impact:      "💡 Impact at Scale",
    impactSub:   "Not just a chatbot — the financial literacy infrastructure for Bharat",
    users:       "10M+",
    usersLabel:  "लक्षित उपयोगकर्ता",
    langs:       "22+",
    langsLabel:  "भारतीय भाषाएं",
    accuracy:    "95%",
    accuracyLabel: "जवाब सटीकता (चरण 3)",
    close:       "← Go Back",
  },
};
// Fallback for languages without full translation
["ta","bn","mr"].forEach(c => { T[c] = T.en; });

// ── Helper: animated count-up ─────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
function CountUp({ target, suffix = "", duration = 1200 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const num = parseInt(target.replace(/[^\d]/g, ""), 10);
    const step = Math.ceil(num / (duration / 16));
    let cur = 0;
    const id = setInterval(() => {
      cur = Math.min(cur + step, num);
      setVal(cur);
      if (cur >= num) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [target, duration]);
  return <>{val}{suffix}</>;
}

// ── Phase card component ──────────────────────────────────────────────────────
function PhaseCard({ phase, title, sub, items, color, accent, glowColor, index, darkMode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 200 + 100);
    return () => clearTimeout(t);
  }, [index]);

  const bg   = darkMode ? "#0d1a10" : "#ffffff";
  const txt  = darkMode ? "#e8f5ee" : "#1a1a1a";
  const sub_ = darkMode ? "#6aad82" : "#666";

  const isLive = phase === "1";

  return (
    <div style={{
      opacity:    visible ? 1 : 0,
      transform:  visible ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.5s ease ${index * 0.18}s, transform 0.5s ease ${index * 0.18}s`,
      background: bg,
      borderRadius: 20,
      padding: "18px 16px",
      border: `2px solid ${isLive ? "#1a6b3c" : (darkMode ? "#1c2e20" : "#e8f0eb")}`,
      boxShadow: isLive
        ? `0 4px 24px rgba(26,107,60,0.25), 0 0 0 1px rgba(26,107,60,0.1)`
        : `0 2px 14px rgba(0,0,0,${darkMode ? 0.3 : 0.06})`,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Phase number accent stripe */}
      <div style={{
        position:  "absolute",
        top: 0, left: 0, right: 0,
        height: 4,
        background: color,
        borderRadius: "18px 18px 0 0",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, marginTop: 4 }}>
        <div style={{
          width: 36, height: 36,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${color}33, ${color}66)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 800, color,
          flexShrink: 0,
        }}>
          {phase}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: txt }}>{title}</div>
          <div style={{ fontSize: 11, color: sub_, marginTop: 1 }}>{sub}</div>
        </div>
        {isLive && (
          <div style={{
            marginLeft: "auto",
            background: "#e8f5e9",
            color: "#1a6b3c",
            fontSize: 10, fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 99,
            border: "1px solid #b2dfcc",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1a6b3c", animation: "pulse 1.5s infinite" }} />
            LIVE
          </div>
        )}
        {phase === "2" && (
          <div style={{ marginLeft: "auto", background: "#fff3e0", color: "#e65100", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, border: "1px solid #ffcc80" }}>
            🔜 Q3 2026
          </div>
        )}
        {phase === "3" && (
          <div style={{ marginLeft: "auto", background: "#ede7f6", color: "#6a1b9a", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, border: "1px solid #ce93d8" }}>
            🔮 2027
          </div>
        )}
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            fontSize: 12,
            color: darkMode ? "#c8e6cc" : "#333",
            lineHeight: 1.5,
            padding: "6px 10px",
            background: darkMode ? "#111e14" : "#f7faf8",
            borderRadius: 10,
            border: `1px solid ${darkMode ? "#1c2e20" : "#eef4f0"}`,
            opacity: isLive ? 1 : 0.85,
          }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function FuturePhases({ darkMode = false, lang = "hi", onClose }) {
  const lc  = T[lang] ? lang : "en";
  const t   = T[lc];
  const bg  = darkMode ? "#080f0a" : "#f2f4f3";
  const txt = darkMode ? "#e8f5ee" : "#1a1a1a";
  const sub = darkMode ? "#5db87a" : "#1a6b3c";

  const phases = [
    {
      phase: "1", title: t.phase1, sub: t.phase1sub,
      items: t.p1items,
      color: "#1a6b3c",
      accent: "#e8f5e9",
    },
    {
      phase: "2", title: t.phase2, sub: t.phase2sub,
      items: t.p2items,
      color: "#e65100",
      accent: "#fff3e0",
    },
    {
      phase: "3", title: t.phase3, sub: t.phase3sub,
      items: t.p3items,
      color: "#6a1b9a",
      accent: "#ede7f6",
    },
  ];

  return (
    <div style={{
      flex: 1, overflowY: "auto",
      background: bg,
      padding: "16px 14px",
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      {/* ── Back button ── */}
      <button onClick={onClose} style={{
        alignSelf: "flex-start",
        background: "transparent",
        border: `1px solid ${darkMode ? "#243328" : "#c8e0cc"}`,
        borderRadius: 99,
        padding: "5px 14px",
        fontSize: 12,
        color: darkMode ? "#7aaa8a" : "#4a7a58",
        cursor: "pointer",
        fontFamily: "inherit",
      }}>
        {t.close}
      </button>

      {/* ── Title ── */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: txt, lineHeight: 1.3 }}>{t.title}</div>
        <div style={{ fontSize: 13, color: sub, marginTop: 5 }}>{t.subtitle}</div>
      </div>

      {/* ── Timeline connector visual ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
        {["🟢", "🟠", "🟣"].map((dot, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              width: 28, height: 28,
              borderRadius: "50%",
              background: ["#1a6b3c", "#e65100", "#6a1b9a"][i],
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800, color: "white",
              boxShadow: `0 2px 8px ${["rgba(26,107,60,0.4)","rgba(230,81,0,0.4)","rgba(106,27,154,0.4)"][i]}`,
            }}>
              {i + 1}
            </div>
            {i < 2 && (
              <div style={{
                width: 40, height: 3,
                background: `linear-gradient(to right, ${["#1a6b3c","#e65100"][i]}, ${["#e65100","#6a1b9a"][i]})`,
                opacity: 0.4,
              }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Phase Cards ── */}
      {phases.map((p, i) => (
        <PhaseCard key={i} {...p} index={i} darkMode={darkMode} />
      ))}

      {/* ── Impact Stats ── */}
      <div style={{
        background: "linear-gradient(135deg, #1a6b3c, #0f4a28)",
        borderRadius: 20,
        padding: "18px 16px",
        boxShadow: "0 6px 24px rgba(26,107,60,0.35)",
      }}>
        <div style={{ color: "white", fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{t.impact}</div>
        <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginBottom: 14, lineHeight: 1.5 }}>{t.impactSub}</div>

        <div style={{ display: "flex", gap: 10 }}>
          {[
            { val: t.users,    suffix: "",   label: t.usersLabel },
            { val: t.langs,    suffix: "",   label: t.langsLabel },
            { val: t.accuracy, suffix: "",   label: t.accuracyLabel },
          ].map((stat, i) => (
            <div key={i} style={{
              flex: 1,
              background: "rgba(255,255,255,0.12)",
              borderRadius: 14,
              padding: "12px 8px",
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.15)",
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "white" }}>{stat.val}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", marginTop: 4, lineHeight: 1.4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tech stack note ── */}
      <div style={{
        background: darkMode ? "#0d1a10" : "white",
        borderRadius: 16,
        padding: "14px 16px",
        border: `1px solid ${darkMode ? "#1c2e20" : "#e0ede4"}`,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: sub, marginBottom: 8 }}>🛠️ तकनीकी विकास</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {[
            { label: "Groq / LLaMA-3", phase: "1" },
            { label: "TF-IDF RAG", phase: "1" },
            { label: "React PWA", phase: "1" },
            { label: "Live Rate APIs", phase: "2" },
            { label: "pgvector", phase: "3" },
            { label: "Pinecone", phase: "3" },
            { label: "multilingual-e5", phase: "3" },
            { label: "Fine-tuned LLM", phase: "3" },
          ].map((tech, i) => (
            <span key={i} style={{
              fontSize: 11, fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 99,
              background: tech.phase === "1"
                ? (darkMode ? "#0f2016" : "#e8f5e9")
                : tech.phase === "2"
                  ? (darkMode ? "#1a1000" : "#fff3e0")
                  : (darkMode ? "#16001e" : "#ede7f6"),
              color: tech.phase === "1" ? "#1a6b3c" : tech.phase === "2" ? "#e65100" : "#6a1b9a",
              border: `1px solid ${tech.phase === "1" ? "#b2dfcc" : tech.phase === "2" ? "#ffcc80" : "#ce93d8"}`,
            }}>
              {tech.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Subtle CSS for pulse animation ── */}
      <style>{`
        @keyframes pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}