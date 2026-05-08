import { useState, useEffect, useRef } from "react";
import FuturePhases from "./FuturePhases";

const DEMO_STEPS = {
  hi: [
    {
      id: 1,
      type: "message",
      delay: 500,
      content: "👋 नमस्ते! मैं VaaniFinance हूँ\n\nसोचिए — अगर आप ₹500/महीना अभी बचाना शुरू करें...\n\n📅 5 साल बाद → ₹36,000 से ज़्यादा\n🎓 बच्चे की पढ़ाई में काम आएगा\n🏥 अचानक ज़रूरत में सहारा बनेगा\n\nबस ₹500 — चाय छोड़ने की ज़रूरत नहीं! ☕",
      icon: "🤖",
    },
    {
      id: 2, type: "message", delay: 2500,
      content: "❌ अभी क्या होता है:\nआपका ₹500 → बचत खाता → 3.5% ब्याज → पैसा असल में घटता है (महंगाई के कारण)\n\n✅ क्या होना चाहिए:\nआपका ₹500 → सही जगह → 7-12% ब्याज → पैसा बढ़ता है 🚀",
      icon: "🤖",
    },
    {
      id: "2b", type: "choice", delay: 0,
      question: "📋 आप क्या चाहते हैं?",
      options: [
        { label: "🔒 सुरक्षित — पैसा सुरक्षित रहे", value: "safe" },
        { label: "📈 ज़्यादा मुनाफा — ज़्यादा कमाई", value: "growth" },
        { label: "💰 ₹500/महीना से शुरू", value: "small" },
      ],
    },
    {
      id: 3,
      type: "card",
      delay: 2500,
      title: "💰 ₹500/महीना के लिए सबसे अच्छे रास्ते:",
      items: [
        { icon: "✔", text: "डाकघर आवर्ती जमा — ₹100 से शुरू, 6.7% ब्याज", color: "#1a6b3c" },
        { icon: "✔", text: "भारतीय स्टेट बैंक सावधि जमा — 100% सुरक्षित, 7% तक", color: "#1a6b3c" },
        { icon: "✔", text: "PPF — Tax-free, 7.1% सालाना", color: "#1565c0" },
      ],
      badge: "✔ सरकारी और सुरक्षित",
      source: "RBI & India Post",
    },
    {
      id: 4,
      type: "action",
      delay: 2500,
      content: "अब देखते हैं — ₹500/महीना 5 साल में कितना होगा? 📊",
      actionLabel: "🧮 हिसाब लगाओ",
      actionKey: "calculator",
    },
    {
      id: 5,
      type: "calculator",
      delay: 1000,
      monthly: 500,
      years: 5,
      rate: 6.7,
      plan: "Post Office RD",
    },
    {
      id: 6,
      type: "schemes",
      delay: 2000,
      content: "🏛️ आपको इन सरकारी योजनाओं का भी लाभ मिल सकता है:",
      schemes: [
        { icon: "🏦", name: "PM Jan Dhan Yojana", benefit: "₹2 लाख मुफ्त बीमा" },
        { icon: "👧", name: "Sukanya Samridhi", benefit: "8.2% — बेटी के लिए" },
        { icon: "🛡️", name: "PMJJBY", benefit: "₹436/साल में ₹2 लाख बीमा" },
      ],
      actionLabel: "🏛️ सभी योजनाएं देखें",
      actionKey: "schemes",
    },
    {
      id: 7,
      type: "trust",
      delay: 2000,
      content: "📚 यह सारी जानकारी सरकारी स्रोतों से ली गई है।",
      sources: ["RBI", "India Post", "SEBI"],
    },
    {
      id: 8,
      type: "voice",
      delay: 1500,
      content: "🎤 VaaniFinance आपकी भाषा में बोलकर भी समझाता है।\nसुनिए — यह है आपके लिए सबसे अच्छी सलाह:",
      speak: "डाकघर आवर्ती जमा से शुरुआत करें। ₹500 हर महीने जमा करें। 5 साल में आपका पैसा बढ़कर ₹35,000 से ज़्यादा हो जाएगा। पैसा पूरी तरह सुरक्षित।",
    },
    {
      id: 9,
      type: "cta",
      delay: 3000,
      content: "🎯 आपने अपना पहला financial plan बना लिया!\n\n🚀 Confusion → Clarity\n💡 Saving → Smart Investing\n\nPowered by AI + Govt Data",
      actions: [
        { label: "💬 अपना सवाल पूछें", key: "chat" },
        { label: "📊 मेरा डैशबोर्ड", key: "dashboard" },
        { label: "🧮 मुनाफा हिसाब करें", key: "calculator" },
      ],
    },
    {
      id: 10,
      type: "future_phases",
      delay: 2000,
      content: "🔮 आगे क्या? देखिए VaaniFinance का रोडमैप — चरण 2 और 3 में और भी बड़ा बदलाव आने वाला है!",
      actionLabel: "🚀 रोडमैप देखें",
    },
  ],
  en: [
    {
      id: 1, type: "message", delay: 500,
      content: "👋 Welcome to VaaniFinance!\n\nImagine investing just ₹500/month starting today...\n\n📅 In 5 years → ₹36,000+\n🎓 Covers a school term's fees\n🏥 Your emergency safety net\n\nJust ₹500 — less than one meal out. 🍽️",
      icon: "🤖",
    },
    {
      id: 2, type: "message", delay: 2500,
      content: "Many people save money — but don't know where to invest safely.\n\nNo one explains. No advisor available.\n\nI am here — your own financial companion. 🙏",
      icon: "🤖",
    },
    {
      id: "2b", type: "choice", delay: 0,
      question: "📋 What do you prefer?",
      options: [
        { label: "🔒 Safe — keep money secure", value: "safe" },
        { label: "📈 High Return — more growth", value: "growth" },
        { label: "💰 Start with ₹500/month", value: "small" },
      ],
    },
    {
      id: 3, type: "card", delay: 2500,
      title: "💰 सबसे अच्छे रास्ते for ₹500/month:",
      items: [
        { icon: "✔", text: "Post Office RD — start ₹100, 6.7% interest", color: "#1a6b3c" },
        { icon: "✔", text: "SBI Fixed Deposit — 100% safe, up to 7%", color: "#1a6b3c" },
        { icon: "✔", text: "PPF — Tax-free, 7.1% yearly", color: "#1565c0" },
      ],
      badge: "✔ Government-backed & Safe",
      source: "RBI & India Post",
    },
    {
      id: 4, type: "action", delay: 2500,
      content: "Now let's see — how much will ₹500/month grow in 5 years? 📊",
      actionLabel: "🧮 Open Calculator",
      actionKey: "calculator",
    },
    {
      id: 5, type: "calculator", delay: 1000, monthly: 500, years: 5, rate: 6.7, plan: "Post Office RD",
    },
    {
      id: 6, type: "schemes", delay: 2000,
      content: "🏛️ You may also benefit from these government schemes:",
      schemes: [
        { icon: "🏦", name: "PM Jan Dhan Yojana", benefit: "₹2 lakh free insurance" },
        { icon: "👧", name: "Sukanya Samridhi", benefit: "8.2% — for girl child" },
        { icon: "🛡️", name: "PMJJBY", benefit: "₹2 lakh for just ₹436/year" },
      ],
      actionLabel: "🏛️ View All Schemes",
      actionKey: "schemes",
    },
    {
      id: 7, type: "trust", delay: 2000,
      content: "📚 All information is sourced from trusted government documents.",
      sources: ["RBI", "India Post", "SEBI"],
    },
    {
      id: 8, type: "voice", delay: 1500,
      content: "🎤 VaaniFinance also speaks in your language.\nListen — here is the best advice for you:",
      speak: "Start with Post Office RD. Deposit 500 rupees every month. In 5 years, your money will grow to more than 35,000 rupees. Your money is completely safe.",
    },
    {
      id: 9, type: "cta", delay: 3000,
      content: "🎯 You just built your first financial plan!\n\n🚀 From confusion → clarity\n💡 From saving → smart investing\n\nPowered by AI + Govt Data",
      actions: [
        { label: "💬 Ask your question", key: "chat" },
        { label: "📊 My Dashboard", key: "dashboard" },
        { label: "🧮 Calculate returns", key: "calculator" },
      ],
    },
    {
      id: 10,
      type: "future_phases",
      delay: 2000,
      content: "🔮 What's next? See VaaniFinance's full Roadmap — Phase 2 & 3 bring even bigger changes!",
      actionLabel: "🚀 See Roadmap",
    },
  ],
};

// Fill missing languages with English
["ta", "bn", "mr"].forEach(lc => { DEMO_STEPS[lc] = DEMO_STEPS.en; });

// Calculator helper
function calcRD(monthly, years, rate) {
  const r = rate / 100 / 12;
  const n = years * 12;
  const total = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  return Math.round(total);
}
const fmt = v => "₹" + v.toLocaleString("en-IN");

export default function GuidedDemo({ lang, darkMode, onExit, onNavigate }) {
  const lc = lang?.code || "hi";
  const steps = DEMO_STEPS[lc] || DEMO_STEPS.en;

  const [visibleSteps, setVisibleSteps] = useState([]);
  const [currentIdx,   setCurrentIdx]   = useState(0);
  const [isRunning,    setIsRunning]     = useState(true);
  const [speaking,     setSpeaking]      = useState(false);
  const [userChoice,   setUserChoice]    = useState(null); // track user's choice
  const [waitingForChoice, setWaitingForChoice] = useState(false);
  const [showFuturePhases, setShowFuturePhases] = useState(false);
  const synthRef = useRef(window.speechSynthesis);
  const bottomRef = useRef(null);

  // bg & text based on dark mode
  const bg   = darkMode ? "#0c1610" : "#eef2ef";
  const card = darkMode ? "#1a2a1e" : "#ffffff";
  const txt  = darkMode ? "#eaf4ee" : "#1a1a1a";
  const sub  = darkMode ? "#7aaa8a" : "#555";
  const border = darkMode ? "#243328" : "#e0ede4";

  useEffect(() => {
    if (!isRunning || currentIdx >= steps.length || waitingForChoice) return;
    const step = steps[currentIdx];

    // Pause at choice steps — wait for user
    if (step.type === "choice") {
      setVisibleSteps(prev => [...prev, step]);
      setCurrentIdx(i => i + 1);
      setWaitingForChoice(true);
      setIsRunning(false);
      return;
    }

    const timer = setTimeout(() => {
      setVisibleSteps(prev => [...prev, step]);
      // Auto-speak voice step
      if (step.type === "voice" && synthRef.current) {
        const utt = new SpeechSynthesisUtterance(step.speak);
        utt.lang = lang?.voiceLang || "hi-IN";
        utt.rate = 0.78;
        utt.onstart = () => setSpeaking(true);
        utt.onend   = () => setSpeaking(false);
        utt.onerror = () => setSpeaking(false);
        const voices = synthRef.current.getVoices();
        const match = voices.find(v => v.lang === utt.lang) || voices.find(v => v.lang.startsWith(utt.lang.split("-")[0]));
        if (match) utt.voice = match;
        synthRef.current.speak(utt);
      }
      setCurrentIdx(i => i + 1);
    }, step.delay);
    return () => clearTimeout(timer);
  }, [currentIdx, isRunning, steps, lang, waitingForChoice]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleSteps]);

  useEffect(() => () => synthRef.current?.cancel(), []);

  const renderStep = (step, idx) => {
    const animation = { animation: "bubbleIn 0.4s cubic-bezier(0.34,1.2,0.64,1)" };

    switch (step.type) {

      case "message":
        return (
          <div key={idx} style={{ ...animation, display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#e8f5ee,#c8e6d0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🤖</div>
            <div style={{ background: card, borderRadius: "18px 18px 18px 4px", padding: "13px 16px", boxShadow: `0 2px 12px rgba(0,0,0,${darkMode?0.3:0.08})`, maxWidth: "88%", fontSize: 14, lineHeight: 1.75, color: txt, whiteSpace: "pre-wrap", border: `1px solid ${border}` }}>
              {step.content}
            </div>
          </div>
        );

      case "card":
        return (
          <div key={idx} style={{ ...animation, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#e8f5ee,#c8e6d0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🤖</div>
              <div style={{ flex: 1, background: card, borderRadius: "18px 18px 18px 4px", overflow: "hidden", boxShadow: `0 3px 16px rgba(0,0,0,${darkMode?0.3:0.1})`, border: `1px solid ${border}` }}>
                {/* Card header */}
                <div style={{ background: "linear-gradient(135deg,#1a6b3c,#145c32)", padding: "12px 16px" }}>
                  <div style={{ color: "white", fontWeight: 800, fontSize: 15 }}>{step.title}</div>
                </div>
                {/* Items */}
                <div style={{ padding: "14px 16px" }}>
                  {step.items.map((item, ii) => (
                    <div key={ii} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10, padding: "8px 12px", background: darkMode ? "#0f1a12" : "#f6faf7", borderRadius: 10, border: `1px solid ${darkMode ? "#243328" : "#ddeee3"}` }}>
                      <span style={{ color: item.color, fontWeight: 800, fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                      <span style={{ fontSize: 13, color: txt, fontWeight: 500, lineHeight: 1.5 }}>{item.text}</span>
                    </div>
                  ))}
                  {/* Trust badge */}
                  <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", background: darkMode ? "#0f1a12" : "#e8f5e9", borderRadius: 10, padding: "8px 12px", border: `1px solid ${darkMode ? "#243328" : "#b2dfcc"}` }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1a6b3c" }}>✔ Government-backed</span>
                    <span style={{ marginLeft: "auto", fontSize: 10, color: sub }}>📚 {step.source}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "action":
        return (
          <div key={idx} style={{ ...animation, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#e8f5ee,#c8e6d0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🤖</div>
              <div style={{ background: card, borderRadius: "18px 18px 18px 4px", padding: "13px 16px", boxShadow: `0 2px 12px rgba(0,0,0,${darkMode?0.3:0.08})`, border: `1px solid ${border}` }}>
                <div style={{ fontSize: 14, color: txt, marginBottom: 12, lineHeight: 1.6 }}>{step.content}</div>
                <button
                  onClick={() => onNavigate(step.actionKey)}
                  style={{ background: "linear-gradient(135deg,#1a6b3c,#145c32)", color: "white", border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(26,107,60,0.35)", animation: "pulse 2s infinite" }}>
                  {step.actionLabel}
                </button>
              </div>
            </div>
          </div>
        );

      case "calculator": {
        const total    = calcRD(step.monthly, step.years, step.rate);
        const invested = step.monthly * step.years * 12;
        const interest = total - invested;
        const pct      = Math.round((invested / total) * 100);
        return (
          <div key={idx} style={{ ...animation, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#e8f5ee,#c8e6d0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📊</div>
              <div style={{ flex: 1, background: card, borderRadius: "18px 18px 18px 4px", overflow: "hidden", boxShadow: `0 3px 16px rgba(0,0,0,${darkMode?0.3:0.1})`, border: `1px solid ${border}` }}>
                <div style={{ background: "linear-gradient(135deg,#1565c0,#0d47a1)", padding: "10px 16px" }}>
                  <div style={{ color: "white", fontWeight: 800, fontSize: 14 }}>📈 {step.plan} — {step.years} {lc==="hi"?"साल":"years"}</div>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    {[
                      { label: lc==="hi"?"जमा":"Invested", val: fmt(invested), color: "#1565c0" },
                      { label: lc==="hi"?"ब्याज":"Interest", val: fmt(interest), color: "#1a6b3c" },
                      { label: lc==="hi"?"कुल":"Total", val: fmt(total), color: "#e65100", big: true },
                    ].map((s, si) => (
                      <div key={si} style={{ flex: 1, background: darkMode ? "#0f1a12" : "#f7faf8", borderRadius: 12, padding: "10px 6px", textAlign: "center", border: `1px solid ${border}` }}>
                        <div style={{ fontSize: s.big ? 15 : 13, fontWeight: 800, color: s.color }}>{s.val}</div>
                        <div style={{ fontSize: 10, color: sub, marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Progress bar */}
                  <div style={{ background: darkMode ? "#243328" : "#e8f0eb", borderRadius: 99, height: 14, overflow: "hidden", marginBottom: 6 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#a5d6a7,#1a6b3c)", borderRadius: 99, transition: "width 1s ease" }} />
                  </div>
                  <div style={{ fontSize: 12, color: "#1a6b3c", fontWeight: 700, textAlign: "center" }}>
                    📈 {lc==="hi"?`₹${step.monthly}/माह → ${fmt(total)} in ${step.years} साल`:`₹${step.monthly}/month → ${fmt(total)} in ${step.years} years`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case "schemes":
        return (
          <div key={idx} style={{ ...animation, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#e8f5ee,#c8e6d0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🤖</div>
              <div style={{ flex: 1, background: card, borderRadius: "18px 18px 18px 4px", padding: "13px 16px", boxShadow: `0 2px 12px rgba(0,0,0,${darkMode?0.3:0.08})`, border: `1px solid ${border}` }}>
                <div style={{ fontSize: 14, color: txt, marginBottom: 12, fontWeight: 600 }}>{step.content}</div>
                {step.schemes.map((s, si) => (
                  <div key={si} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 12px", background: darkMode ? "#0f1a12" : "#f6faf7", borderRadius: 10, marginBottom: 8, border: `1px solid ${border}` }}>
                    <span style={{ fontSize: 20 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: txt }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: "#1a6b3c", fontWeight: 600 }}>{s.benefit}</div>
                    </div>
                  </div>
                ))}
                <button onClick={() => onNavigate(step.actionKey)} style={{ marginTop: 8, background: darkMode ? "#162118" : "#e8f5e9", border: `1.5px solid #1a6b3c`, borderRadius: 12, padding: "9px 18px", fontSize: 13, fontWeight: 700, color: "#1a6b3c", cursor: "pointer", fontFamily: "inherit" }}>
                  {step.actionLabel}
                </button>
              </div>
            </div>
          </div>
        );

      case "trust":
        return (
          <div key={idx} style={{ ...animation, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#e8f5ee,#c8e6d0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🤖</div>
              <div style={{ background: card, borderRadius: "18px 18px 18px 4px", padding: "13px 16px", boxShadow: `0 2px 12px rgba(0,0,0,${darkMode?0.3:0.08})`, border: `1px solid ${border}` }}>
                <div style={{ fontSize: 14, color: txt, marginBottom: 10 }}>{step.content}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, background: "#1a6b3c", color: "white", borderRadius: 99, padding: "3px 10px", fontWeight: 700 }}>✔ Govt Verified</span>
                  {step.sources.map((s, si) => (
                    <span key={si} style={{ fontSize: 11, background: darkMode ? "#0f1a12" : "#e8f5e9", color: "#1a6b3c", border: "1px solid #b2dfcc", borderRadius: 99, padding: "3px 10px", fontWeight: 700 }}>📚 {s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "choice":
        return (
          <div key={idx} style={{ ...animation, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#e8f5ee,#c8e6d0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🤖</div>
              <div style={{ background: card, borderRadius: "18px 18px 18px 4px", padding: "13px 16px", boxShadow: `0 2px 12px rgba(0,0,0,${darkMode?0.3:0.08})`, border: `1px solid ${border}` }}>
                <div style={{ fontSize: 14, color: txt, marginBottom: 12, lineHeight: 1.6, fontWeight: 600 }}>{step.question}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {step.options.map((opt, oi) => (
                    <button
                      key={oi}
                      disabled={!!userChoice}
                      onClick={() => {
                        setUserChoice(opt.value);
                        setWaitingForChoice(false);
                        setIsRunning(true);
                        // Show user reply bubble
                        setVisibleSteps(prev => [...prev, { type: "__user_reply__", text: opt.label }]);
                      }}
                      style={{
                        background: userChoice === opt.value ? "#1a6b3c" : (darkMode ? "#0f1a12" : "#f0faf4"),
                        color: userChoice === opt.value ? "white" : "#1a6b3c",
                        border: `2px solid ${userChoice && userChoice !== opt.value ? "#ddd" : "#1a6b3c"}`,
                        borderRadius: 12, padding: "8px 16px", fontSize: 13, fontWeight: 700,
                        cursor: userChoice ? "default" : "pointer", fontFamily: "inherit",
                        opacity: userChoice && userChoice !== opt.value ? 0.45 : 1,
                        transition: "all 0.2s",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "__user_reply__":
        return (
          <div key={idx} style={{ ...animation, display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <div style={{ background: "#1a6b3c", color: "white", borderRadius: "18px 18px 4px 18px", padding: "10px 16px", maxWidth: "75%", fontSize: 14, fontWeight: 600 }}>
              {step.text}
            </div>
          </div>
        );

      case "voice":
        return (
          <div key={idx} style={{ ...animation, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: speaking ? "linear-gradient(135deg,#ffebee,#ffcdd2)" : "linear-gradient(135deg,#e8f5ee,#c8e6d0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, animation: speaking ? "pulse 1s infinite" : "none" }}>
                {speaking ? "🔊" : "🎤"}
              </div>
              <div style={{ background: card, borderRadius: "18px 18px 18px 4px", padding: "13px 16px", boxShadow: `0 2px 12px rgba(0,0,0,${darkMode?0.3:0.08})`, border: `1px solid ${border}` }}>
                <div style={{ fontSize: 14, color: txt, marginBottom: 10, whiteSpace: "pre-wrap" }}>{step.content}</div>
                {speaking && (
                  <div style={{ display: "flex", gap: 3, alignItems: "center", height: 24 }}>
                    {[1,2,3,4,5,6,7,8].map(i => (
                      <div key={i} style={{ width: 3, background: "#1a6b3c", borderRadius: 99, animation: `soundWave 0.8s infinite`, animationDelay: `${i*0.1}s`, height: `${8 + (i % 3) * 6}px` }} />
                    ))}
                    <span style={{ fontSize: 11, color: "#1a6b3c", fontWeight: 700, marginLeft: 6 }}>
                      {lc === "hi" ? "बोल रहा हूँ..." : lc === "hl" ? "Bol raha hun..." : "Speaking..."}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "cta":
        return (
          <div key={idx} style={{ ...animation, marginBottom: 14 }}>
            <div style={{ background: "linear-gradient(135deg,#1a6b3c,#0f4a28)", borderRadius: 20, padding: "20px 18px", boxShadow: "0 6px 24px rgba(26,107,60,0.4)" }}>
              <div style={{ color: "white", fontSize: 16, fontWeight: 800, marginBottom: 6, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{step.content}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                {step.actions.map((a, ai) => (
                  <button key={ai} onClick={() => { if (a.key === "chat") onExit(); else onNavigate(a.key); }}
                    style={{ background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.4)", color: "white", borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", backdropFilter: "blur(4px)", transition: "all 0.2s" }}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "future_phases":
        return (
          <div key={idx} style={{ ...animation, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#e8f5ee,#c8e6d0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🤖</div>
              <div style={{ background: card, borderRadius: "18px 18px 18px 4px", padding: "13px 16px", boxShadow: `0 2px 12px rgba(0,0,0,${darkMode?0.3:0.08})`, border: `1px solid ${border}` }}>
                <div style={{ fontSize: 14, color: txt, marginBottom: 12, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{step.content}</div>
                <button
                  onClick={() => setShowFuturePhases(true)}
                  style={{
                    background: "linear-gradient(135deg,#1a6b3c,#0f4a28)",
                    color: "white", border: "none", borderRadius: 12,
                    padding: "10px 20px", fontSize: 14, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                    boxShadow: "0 4px 14px rgba(26,107,60,0.4)",
                    animation: "pulse 2s infinite",
                  }}>
                  {step.actionLabel}
                </button>
              </div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {showFuturePhases ? (
        <FuturePhases
          darkMode={darkMode}
          lang={lc}
          onClose={() => setShowFuturePhases(false)}
        />
      ) : (
    <div style={{ flex: 1, overflowY: "auto", background: bg, padding: "16px 14px", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: darkMode ? "#4caf7d" : "#1a6b3c" }}>
          🎬 {lc === "hi" ? "Guided Demo" : "Guided Demo"}
        </div>
        <button onClick={onExit} style={{ background: "transparent", border: `1px solid ${darkMode ? "#243328" : "#d8e8dc"}`, borderRadius: 99, padding: "5px 14px", fontSize: 12, color: darkMode ? "#7aaa8a" : "#4a7a58", cursor: "pointer", fontFamily: "inherit" }}>
          {lc === "hi" ? "× बंद करें" : lc === "hl" ? "× Band karo" : "× Close"}
        </button>
      </div>

      {/* Steps progress with label */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: darkMode ? "#5db87a" : "#1a6b3c" }}>
            {lc==="hi"?`Step ${visibleSteps.length}/${steps.length}`:`Step ${visibleSteps.length}/${steps.length}`}
          </span>
          <span style={{ fontSize: 11, color: darkMode ? "#7aaa8a" : "#888" }}>
            {visibleSteps.length > 0 && (
              lc==="hi" ? [
                "शुरुआत", "समस्या समझो", "सबसे अच्छे रास्ते", "हिसाब देखो",
                "मुनाफा जानो", "सरकारी योजनाएं", "भरोसेमंद जाँच", "आवाज़ सुनो", "Journey शुरू!"
              ][visibleSteps.length - 1] :
              ["Welcome", "The Problem", "Best Options", "Open Calculator",
               "See Returns", "Govt Schemes", "Trust & Sources", "Voice Demo", "Your Journey!"
              ][visibleSteps.length - 1]
            )}
          </span>
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i < visibleSteps.length ? "#1a6b3c" : (darkMode ? "#243328" : "#e0ede4"), transition: "background 0.5s ease" }} />
          ))}
        </div>
      </div>

      {/* Rendered steps */}
      {visibleSteps.map((step, idx) => renderStep(step, idx))}

      {/* Loading dots while next step coming */}
      {isRunning && currentIdx < steps.length && (
        <div style={{ display: "flex", gap: 5, padding: "8px 0", marginLeft: 46 }}>
          {[0,1,2].map(i => (
            <div key={i} className="tip-dot" style={{ animationDelay: `${i*0.15}s` }} />
          ))}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
      )}
    </div>
  );
}