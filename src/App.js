import { useState, useRef, useEffect } from "react";
import { askAI } from "./api/groq";
import Dashboard from "./Dashboard";
import Calculator from "./Calculator";
import SchemesFinder from "./SchemesFinder";
import Quiz from "./Quiz";
import Splash from "./Splash";
import "./App.css";

const LANGUAGES = [
  { code: "hi", label: "हिन्दी",  greeting: "नमस्ते! मैं VaaniFinance हूँ 😊 कुछ भी पूछिए!", placeholder: "यहाँ लिखें...",                    quick: ["FD क्या है?", "SIP समझाओ", "PPF क्या है?", "₹10,000 कहाँ लगाऊं?"],                   voiceLang: "hi-IN", disclaimer: "दरें अनुमानित हैं — निवेश से पहले बैंक से जांचें" },
  { code: "ta", label: "தமிழ்",   greeting: "வணக்கம்! நான் VaaniFinance 😊 எதுவும் கேளுங்கள்!", placeholder: "இங்கே தட்டச்சு செய்யுங்கள்...", quick: ["FD என்றால் என்ன?", "SIP விளக்குங்கள்", "PPF என்றால் என்ன?", "₹10,000 எங்கே போட்டு?"], voiceLang: "ta-IN", disclaimer: "வட்டி விகிதங்கள் தோராயமானவை" },
  { code: "bn", label: "বাংলা",   greeting: "নমস্কার! আমি VaaniFinance 😊 যেকোনো প্রশ্ন করুন!", placeholder: "এখানে লিখুন...",                  quick: ["FD কী?", "SIP বোঝান", "PPF কী?", "₹10,000 কোথায় লাগাব?"],                          voiceLang: "bn-IN", disclaimer: "সুদের হার আনুমানিক" },
  { code: "mr", label: "मराठी",   greeting: "नमस्कार! मी VaaniFinance 😊 काहीही विचारा!",       placeholder: "येथे लिहा...",                    quick: ["FD म्हणजे काय?", "SIP समजावा", "PPF म्हणजे काय?", "₹10,000 कुठे गुंतवायचे?"],         voiceLang: "mr-IN", disclaimer: "व्याजदर अंदाजे आहेत" },
  { code: "en", label: "English", greeting: "Hello! I am VaaniFinance 😊 Ask me anything!",     placeholder: "Type here...",                    quick: ["What is FD?", "Explain SIP", "What is PPF?", "Where to invest ₹10,000?"],             voiceLang: "en-IN", disclaimer: "Rates are approximate — verify with your bank" },
];

const NAV_LABELS = {
  quiz:       { hi: "क्विज़",      ta: "வினாடி",    bn: "কুইজ",       mr: "क्विझ",       en: "Quiz"       },
  schemes:    { hi: "योजनाएं",    ta: "திட்டங்கள்", bn: "প্রকল্প",    mr: "योजना",       en: "Schemes"    },
  dashboard:  { hi: "डैशबोर्ड",   ta: "டாஷ்போர்டு", bn: "ড্যাশবোর্ড", mr: "डॅशबोर्ड",   en: "Dashboard"  },
  calculator: { hi: "कैलकुलेटर", ta: "கணக்கி",     bn: "ক্যালকুলেটর", mr: "कॅल्क्युलेटर", en: "Calculator" },
};

const ONBOARD_TEXT = {
  title:       { hi: "पहले थोड़ा बताइए 🙏",  ta: "உங்களைப் பற்றி சொல்லுங்கள் 🙏", bn: "একটু বলুন 🙏",      mr: "थोडं सांगा 🙏",    en: "Tell us about yourself 🙏" },
  incomeLabel: { hi: "मासिक बचत कितनी है?",  ta: "மாத சேமிப்பு எவ்வளவு?",          bn: "মাসিক সঞ্চয় কত?",  mr: "मासिक बचत किती?",  en: "Monthly savings?"          },
  goalLabel:   { hi: "मुख्य लक्ष्य क्या है?", ta: "முக்கிய இலக்கு என்ன?",           bn: "প্রধান লক্ষ্য কী?", mr: "मुख्य ध्येय काय?", en: "Main goal?"                },
  submit:      { hi: "शुरू करें →",           ta: "தொடங்குங்கள் →",                  bn: "শুরু করুন →",        mr: "सुरू करा →",        en: "Get Started →"             },
};

const INCOME_OPTIONS = [
  { en: "Less than ₹500", hi: "₹500 से कम",  ta: "₹500க்கும் குறைவு", bn: "₹500 এর কম",  mr: "₹500 पेक्षा कमी" },
  { en: "₹500-2,000",     hi: "₹500-2,000",   ta: "₹500-2,000",        bn: "₹500-2,000",   mr: "₹500-2,000"      },
  { en: "₹2,000-5,000",   hi: "₹2,000-5,000", ta: "₹2,000-5,000",      bn: "₹2,000-5,000", mr: "₹2,000-5,000"    },
  { en: "₹5,000+",        hi: "₹5,000+",      ta: "₹5,000+",           bn: "₹5,000+",      mr: "₹5,000+"         },
];

const GOAL_OPTIONS = [
  { en: "Keep money safe",      hi: "पैसा सुरक्षित रखना", ta: "பணத்தை பாதுகாக்க", bn: "টাকা সুরক্ষিত রাখা", mr: "पैसा सुरक्षित ठेवणे" },
  { en: "Children's education", hi: "बच्चों की पढ़ाई",    ta: "குழந்தை படிப்பு",   bn: "সন্তানের পড়াশোনা",  mr: "मुलांचे शिक्षण"      },
  { en: "Build a home",         hi: "घर बनाना",           ta: "வீடு கட்ட",          bn: "বাড়ি বানানো",        mr: "घर बांधणे"           },
  { en: "Retirement",           hi: "रिटायरमेंट",         ta: "ஓய்வூதியம்",         bn: "অবসর",               mr: "निवृत्ती"            },
];

const LS = {
  get: (k, fallback = null) => {
    try { const v = sessionStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set: (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

function updateStreak() {
  const today     = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const s         = LS.get("vf_streak", { count: 0, lastDate: "" });
  let count = 1;
  if      (s.lastDate === today)      count = s.count;
  else if (s.lastDate === yesterday)  count = s.count + 1;
  const updated = { count, lastDate: today };
  LS.set("vf_streak", updated);
  return updated;
}

export default function App() {
  const savedLangCode = LS.get("vf_lang", "hi");
  const savedProfile  = LS.get("vf_profile", null);
  const savedMessages = LS.get("vf_messages", []);
  const initLang      = LANGUAGES.find(l => l.code === savedLangCode) || LANGUAGES[0];

  const [showSplash,    setShowSplash]    = useState(true);
  const [lang,          setLang]          = useState(initLang);
  const [onboarded,     setOnboarded]     = useState(!!savedProfile);
  const [profile,       setProfile]       = useState(savedProfile || { income: "", goal: "" });
  const [messages,      setMessages]      = useState(savedMessages);
  const [input,         setInput]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [listening,     setListening]     = useState(false);
  const [speaking,      setSpeaking]      = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [screen,        setScreen]        = useState("chat");
  const [streak,        setStreak]        = useState(LS.get("vf_streak", { count: 0 }));

  const bottomRef      = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef       = useRef(window.speechSynthesis);

  useEffect(() => { LS.set("vf_lang", lang.code); }, [lang]);
  useEffect(() => { if (profile.income) LS.set("vf_profile", profile); }, [profile]);
  useEffect(() => { if (messages.length) LS.set("vf_messages", messages.slice(-30)); }, [messages]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => () => synthRef.current?.cancel(), []);
  useEffect(() => { if (onboarded) { const s = updateStreak(); setStreak(s); } }, [onboarded]);

  const speakText = (text, activeLang, msgIndex) => {
    if (!synthRef.current) return;
    if (synthRef.current.speaking) { synthRef.current.cancel(); setSpeaking(false); setSpeakingIndex(null); return; }
    const cleanText = text.replace(/[\u{1F300}-\u{1FFFF}]/gu, "").replace(/[●►▶⚠️✅💡📅🎉📊🏦]/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = activeLang.voiceLang; utterance.rate = 0.78; utterance.pitch = 0.92;
    const trySpeak = () => {
      const voices = synthRef.current.getVoices();
      const match  = voices.find(v => v.lang === activeLang.voiceLang) || voices.find(v => v.lang.startsWith(activeLang.voiceLang.split("-")[0]));
      if (match) utterance.voice = match;
      utterance.onstart = () => { setSpeaking(true);  setSpeakingIndex(msgIndex); };
      utterance.onend   = () => { setSpeaking(false); setSpeakingIndex(null); };
      utterance.onerror = () => { setSpeaking(false); setSpeakingIndex(null); };
      synthRef.current.speak(utterance);
    };
    synthRef.current.getVoices().length === 0 ? (window.speechSynthesis.onvoiceschanged = trySpeak) : trySpeak();
  };

  const handleSpeakBtn = (text, msgIndex) => {
    if (speaking && speakingIndex === msgIndex) {
      synthRef.current?.cancel(); setSpeaking(false); setSpeakingIndex(null);
    } else {
      synthRef.current?.cancel(); setSpeaking(false); setSpeakingIndex(null);
      setTimeout(() => speakText(text, lang, msgIndex), 100);
    }
  };

  const shareAdvice = (text) => {
    const msg = `💰 VaaniFinance se mili advice:\n\n${text}\n\nAI Financial Advisor\n${window.location.href}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    if (navigator.share) {
      navigator.share({ title: "VaaniFinance", text: msg }).catch(() => window.open(waUrl, "_blank"));
    } else {
      window.open(waUrl, "_blank");
    }
  };

  const sendMessage = async (text, currentLang, currentMessages) => {
    const activeLang = currentLang || lang;
    if (!text.trim() || loading) return;
    synthRef.current?.cancel(); setSpeaking(false); setSpeakingIndex(null);
    const userMsg         = { role: "user", content: text };
    const updatedMessages = [...(currentMessages || messages), userMsg];
    setMessages(updatedMessages); setInput(""); setLoading(true);
    try {
      const reply = await askAI(text, activeLang.code, profile, updatedMessages);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      const ERR = { hi: "माफ़ करें, कुछ गड़बड़ हुई 🙏", ta: "மன்னிக்கவும், பிழை ஏற்பட்டது 🙏", bn: "দুঃখিত, সমস্যা হয়েছে 🙏", mr: "माफ करा, काहीतरी चुकले 🙏", en: "Sorry, something went wrong 🙏" };
      setMessages(prev => [...prev, { role: "assistant", content: ERR[activeLang.code] || ERR.en }]);
    } finally { setLoading(false); }
  };

  const startVoice = async () => {
    synthRef.current?.cancel(); setSpeaking(false); setSpeakingIndex(null);
    if (listening) { recognitionRef.current?.abort(); recognitionRef.current = null; setListening(false); return; }
    try { await navigator.mediaDevices.getUserMedia({ audio: true }); } catch {
      const M = { hi: "Mic permission नहीं मिली।", ta: "மைக் அனுமதி இல்லை.", bn: "মাইক অনুমতি নেই।", mr: "मायक्रोफोन परवानगी नाही.", en: "Mic permission denied." };
      alert(M[lang.code] || M.en); return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Please use Chrome browser."); return; }
    const r = new SR();
    r.continuous = false; r.interimResults = false; r.lang = lang.voiceLang;
    r.onstart  = () => setListening(true);
    r.onresult = (e) => { const t = e.results[0][0].transcript; setListening(false); recognitionRef.current = null; sendMessage(t); };
    r.onerror  = (e) => { recognitionRef.current = null; setListening(false); if (e.error !== "aborted") alert("Voice error: " + e.error); };
    r.onend    = () => { setListening(false); recognitionRef.current = null; };
    recognitionRef.current = r;
    try { r.start(); } catch { setListening(false); recognitionRef.current = null; }
  };

  const switchLang = (l) => {
    synthRef.current?.cancel(); setSpeaking(false); setSpeakingIndex(null);
    setLang(l);
    if (onboarded) setMessages([{ role: "assistant", content: l.greeting }]);
  };

  const handleOnboardSubmit = () => {
    setOnboarded(true);
    LS.set("vf_profile", profile);
    const langName     = { hi: "Hindi", ta: "Tamil", bn: "Bengali", mr: "Marathi", en: "English" }[lang.code];
    const silentPrompt = `User: savings=${profile.income}, goal="${profile.goal}". In ${langName}, give best investment advice in exactly 4 short simple lines. Be warm and easy to understand.`;
    setMessages([{ role: "assistant", content: lang.greeting }]);
    const s = updateStreak(); setStreak(s);
    setTimeout(async () => {
      setLoading(true);
      try { const r = await askAI(silentPrompt, lang.code, profile, []); setMessages(p => [...p, { role: "assistant", content: r }]); }
      catch {} finally { setLoading(false); }
    }, 400);
  };

  const streakLabel = streak.count >= 2
    ? ({ hi: `🔥 ${streak.count} दिन`, ta: `🔥 ${streak.count} நாள்`, bn: `🔥 ${streak.count} দিন`, mr: `🔥 ${streak.count} दिवस`, en: `🔥 ${streak.count} days` })[lang.code]
    : null;

  // Nav button: icon on top, translated label below
  const NavBtn = ({ screenKey, icon }) => {
    const isActive = screen === screenKey;
    return (
      <button
        className={`nav-btn ${isActive ? "nav-active" : ""}`}
        onClick={() => { synthRef.current?.cancel(); setScreen(isActive ? "chat" : screenKey); }}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 2, padding: "4px 7px", borderRadius: 10, minWidth: 42,
        }}
      >
        <span style={{ fontSize: 15, lineHeight: 1 }}>{icon}</span>
        <span style={{ fontSize: 9, lineHeight: 1.1, fontWeight: 600, opacity: 0.93, letterSpacing: 0.1, whiteSpace: "nowrap" }}>
          {NAV_LABELS[screenKey][lang.code]}
        </span>
      </button>
    );
  };

  // ── SPLASH
  if (showSplash) return (
    <Splash onDone={(chosenLangCode) => {
      if (chosenLangCode) { const matched = LANGUAGES.find(l => l.code === chosenLangCode); if (matched) setLang(matched); }
      setShowSplash(false);
    }} />
  );

  // ── ONBOARDING
  if (!onboarded) return (
    <div className="app">
      <div className="header">
        <div className="header-left">
          <div className="header-title">💰 VaaniFinance</div>
          <div className="header-sub">AI Financial Advisor</div>
        </div>
      </div>
      <div className="lang-bar">
        {LANGUAGES.map(l => (
          <button key={l.code} className={`lang-btn ${lang.code === l.code ? "active" : ""}`} onClick={() => setLang(l)}>{l.label}</button>
        ))}
      </div>
      <div className="onboard-screen">
        <div className="onboard-card">
          <p className="onboard-title">{ONBOARD_TEXT.title[lang.code]}</p>
          <p className="onboard-label">{ONBOARD_TEXT.incomeLabel[lang.code]}</p>
          <div className="onboard-options">
            {INCOME_OPTIONS.map(opt => (
              <button key={opt.en} className={`onboard-btn ${profile.income === opt.en ? "selected" : ""}`}
                onClick={() => setProfile(p => ({ ...p, income: opt.en }))}>{opt[lang.code]}</button>
            ))}
          </div>
          <p className="onboard-label">{ONBOARD_TEXT.goalLabel[lang.code]}</p>
          <div className="onboard-options">
            {GOAL_OPTIONS.map(opt => (
              <button key={opt.en} className={`onboard-btn ${profile.goal === opt.en ? "selected" : ""}`}
                onClick={() => setProfile(p => ({ ...p, goal: opt.en }))}>{opt[lang.code]}</button>
            ))}
          </div>
          <button className="onboard-submit" disabled={!profile.income || !profile.goal} onClick={handleOnboardSubmit}>
            {ONBOARD_TEXT.submit[lang.code]}
          </button>
        </div>
      </div>
    </div>
  );

  // ── MAIN APP
  return (
    <div className="app">
      <div className="header">
        <div className="header-left">
          <div className="header-title">💰 VaaniFinance</div>
          <div className="header-sub">AI Financial Advisor</div>
        </div>
        <div className="header-right">
          {streakLabel && (
            <span className="profile-chip" style={{ background: "rgba(255,160,0,0.28)", borderColor: "rgba(255,160,0,0.55)" }}>
              {streakLabel}
            </span>
          )}
          <NavBtn screenKey="quiz"       icon="🎯" />
          <NavBtn screenKey="schemes"    icon="🏛️" />
          <NavBtn screenKey="dashboard"  icon="📊" />
          <NavBtn screenKey="calculator" icon="🧮" />
        </div>
      </div>

      <div className="lang-bar">
        {LANGUAGES.map(l => (
          <button key={l.code} className={`lang-btn ${lang.code === l.code ? "active" : ""}`} onClick={() => switchLang(l)}>{l.label}</button>
        ))}
      </div>

      {screen === "quiz"       ? <Quiz         lang={lang} onClose={() => setScreen("chat")} /> :
       screen === "schemes"    ? <SchemesFinder profile={profile} lang={lang} /> :
       screen === "dashboard"  ? <Dashboard     profile={profile} lang={lang} /> :
       screen === "calculator" ? <Calculator    lang={lang} /> : (
        <>
          <div className="disclaimer-bar">⚠️ {lang.disclaimer}</div>
          <div className="chat-area">
            {messages.map((m, i) => (
              <div key={i} className={`bubble ${m.role}`}>
                {m.role === "assistant" ? (
                  <div className="ai-response">
                    <div className="ai-icon">🤖</div>
                    <div className="ai-text">
                      {m.content}
                      <div className="msg-actions">
                        <button className={`action-btn ${speakingIndex === i ? "speaking" : ""}`} onClick={() => handleSpeakBtn(m.content, i)}>
                          {speakingIndex === i ? "⏹️" : "🔊"}
                        </button>
                        <button className="action-btn" title="Share on WhatsApp" onClick={() => shareAdvice(m.content)}>📤</button>
                      </div>
                    </div>
                  </div>
                ) : m.content}
              </div>
            ))}
            {loading && (
              <div className="bubble assistant loading">
                <span className="dot-anim">●</span>
                <span className="dot-anim" style={{ animationDelay: "0.2s" }}>●</span>
                <span className="dot-anim" style={{ animationDelay: "0.4s" }}>●</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="quick-btns">
            {lang.quick.map((q, i) => (
              <button key={i} className="quick-btn" onClick={() => sendMessage(q)}>{q}</button>
            ))}
          </div>
          <div className="input-row">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage(input)}
              placeholder={lang.placeholder} disabled={loading} />
            <button className={`mic-btn ${listening ? "active" : ""}`} onClick={startVoice}>{listening ? "🔴" : "🎤"}</button>
            <button className="send-btn" onClick={() => sendMessage(input)} disabled={loading}>➤</button>
          </div>
        </>
      )}
    </div>
  );
}