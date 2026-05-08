import { useState, useEffect } from "react";
import { generateDashboardTips } from "./api/groq";
import "./Dashboard.css";

const GOAL_TARGETS = {
  "Keep money safe":      { target: 10000,  icon: "🛡️", color: "#1a6b3c",
    label: { hi: "आपातकालीन फंड", ta: "அவசர நிதி",      bn: "জরুরি তহবিল",   mr: "आणीबाणी निधी",   en: "Emergency Fund",  hl: "Emergency Fund"  } },
  "Children's education": { target: 100000, icon: "📚", color: "#1565c0",
    label: { hi: "शिक्षा फंड",     ta: "கல்வி நிதி",     bn: "শিক্ষা তহবিল",  mr: "शिक्षण निधी",    en: "Education Fund",  hl: "Education Fund"  } },
  "Build a home":         { target: 500000, icon: "🏠", color: "#6a1b9a",
    label: { hi: "घर फंड",         ta: "வீட்டு நிதி",    bn: "বাড়ির তহবিল",  mr: "गृह निधी",       en: "Home Fund",       hl: "Ghar Fund"       } },
  "Retirement":           { target: 200000, icon: "🌅", color: "#e65100",
    label: { hi: "रिटायरमेंट फंड", ta: "ஓய்வூதிய நிதி", bn: "অবসর তহবিল",   mr: "निवृत्ती निधी",  en: "Retirement Fund", hl: "Retirement Fund" } },
};

// ── BUG FIX 2: dashes now match exactly what profile stores ───────────────
const INCOME_VALUE = {
  "Less than ₹500": 300,
  "₹500-2,000":     1000,
  "₹2,000-5,000":   3000,
  "₹5,000+":        6000,
};

const RECOMMENDED = {
  "Keep money safe":      ["Post Office RD", "SBI FD", "Savings Account"],
  "Children's education": ["PPF", "Sukanya Samridhi", "RD"],
  "Build a home":         ["FD", "PPF", "PMAY Loan"],
  "Retirement":           ["PPF", "NPS", "FD"],
};

const FALLBACK_TIPS = {
  "Keep money safe": {
    hi: ["Post Office RD में ₹100/माह से शुरू करें", "SBI सावधि जमा में ₹1000 से आपातकालीन निधि बनाएं", "3 महीने की बचत हमेशा नकद में रखें"],
    ta: ["Post Office RD-ல் ₹100/மாதம் தொடங்குங்கள்", "SBI FD-ல் ₹1000 முதலீடு செய்யுங்கள்", "3 மாத சேமிப்பை எப்போதும் liquid-ஆக வையுங்கள்"],
    bn: ["Post Office RD-তে ₹100/মাস দিয়ে শুরু করুন", "SBI FD-তে ₹1000 দিয়ে ফান্ড তৈরি করুন", "৩ মাসের সঞ্চয় সবসময় liquid রাখুন"],
    mr: ["Post Office RD मध्ये ₹100/महिना सुरू करा", "SBI FD मध्ये ₹1000 ने emergency fund तयार करा", "3 महिन्यांची बचत नेहमी liquid ठेवा"],
    en: ["Start Post Office RD with ₹100/month", "Build emergency fund with ₹1000 in SBI FD", "Always keep 3 months savings in liquid form"],
    hl: ["Post Office RD mein ₹100/mahine se shuru karo", "SBI FD mein ₹1000 se emergency fund banao", "3 mahine ki bachhat hamesha liquid rakhna"],
  },
  "Children's education": {
    hi: ["PPF में सालाना ₹500 जमा करें", "Sukanya Samridhi Yojana बेटी के लिए सबसे अच्छा है", "Post Office RD से पढ़ाई का खर्च निकालें"],
    ta: ["PPF-ல் ஆண்டுதோறும் ₹500 சேமியுங்கள்", "Sukanya Samridhi பெண் குழந்தைக்கு சிறந்தது", "Post Office RD-ல் படிப்பு செலவு சேர்க்கலாம்"],
    bn: ["PPF-এ বার্ষিক ₹500 জমা করুন", "Sukanya Samridhi মেয়ের জন্য সেরা", "Post Office RD দিয়ে পড়াশোনার খরচ তুলুন"],
    mr: ["PPF मध्ये वार्षिक ₹500 जमा करा", "Sukanya Samridhi मुलीसाठी सर्वोत्तम आहे", "Post Office RD मधून शिक्षण खर्च काढा"],
    en: ["Deposit ₹500/year in PPF", "Sukanya Samridhi is best for girl child", "Use Post Office RD for education expenses"],
    hl: ["PPF mein saal mein ₹500 jama karo", "Sukanya Samridhi beti ke liye sabse acha hai", "Post Office RD se padhai ka kharcha nikalo"],
  },
  "Build a home": {
    hi: ["PMAY scheme check करें — सरकारी subsidy मिलेगी", "FD में 5 साल के लिए पैसा lock करें", "हर महीने अलग savings account में जमा करें"],
    ta: ["PMAY திட்டம் பார்க்கவும் — அரசு மானியம் கிடைக்கும்", "FD-ல் 5 ஆண்டுகளுக்கு பணம் போடுங்கள்", "தனி சேமிப்பு கணக்கில் மாதந்தோறும் போடுங்கள்"],
    bn: ["PMAY স্কিম দেখুন — সরকারি ভর্তুকি পাবেন", "FD-তে ৫ বছরের জন্য টাকা রাখুন", "প্রতি মাসে আলাদা সঞ্চয় অ্যাকাউন্টে জমা করুন"],
    mr: ["PMAY scheme तपासा — सरकारी अनुदान मिळेल", "FD मध्ये 5 वर्षांसाठी पैसे lock करा", "दर महिन्याला वेगळ्या savings account मध्ये जमा करा"],
    en: ["Check PMAY scheme — get government subsidy", "Lock money in FD for 5 years", "Deposit monthly in a separate savings account"],
    hl: ["PMAY scheme check karo — sarkaari subsidy milegi", "FD mein 5 saal ke liye paisa lock karo", "Har mahine alag savings account mein paisa daalo"],
  },
  "Retirement": {
    hi: ["PPF + NPS दोनों साथ में शुरू करें", "जितना जल्दी शुरू उतना ज़्यादा compound interest", "NPS में Section 80C tax भी बचेगा"],
    ta: ["PPF + NPS இரண்டையும் சேர்த்து தொடங்குங்கள்", "எவ்வளவு சீக்கிரம் தொடங்குகிறீர்களோ அவ்வளவு வட்டி", "NPS-ல் Section 80C வரியும் மிச்சமாகும்"],
    bn: ["PPF + NPS দুটোই একসাথে শুরু করুন", "যত তাড়াতাড়ি শুরু করবেন তত বেশি compound interest", "NPS-এ Section 80C ট্যাক্সও বাঁচবে"],
    mr: ["PPF + NPS दोन्ही एकत्र सुरू करा", "जितक्या लवकर सुरू कराल तितका compound interest जास्त", "NPS मध्ये Section 80C कर पण वाचेल"],
    en: ["Start both PPF + NPS together", "Earlier you start, more compound interest you earn", "NPS also saves Section 80C tax"],
    hl: ["PPF + NPS dono saath mein shuru karo", "Jitna jaldi shuru karo utna zyada compound interest milega", "NPS mein Section 80C tax bhi bachega"],
  },
};

const T = {
  target:      { hi: "लक्ष्य",              ta: "இலக்கு",               bn: "লক্ষ্য",              mr: "लक्ष्य",              en: "Target",              hl: "Target"             },
  saved:       { hi: "जमा",                 ta: "சேமிப்பு",             bn: "জমা",                 mr: "जमा",                 en: "Saved",               hl: "Jama"               },
  complete:    { hi: "पूरा",                ta: "முடிந்தது",            bn: "সম্পূর্ণ",            mr: "पूर्ण",               en: "Complete",            hl: "Poora"              },
  savedAmt:    { hi: "आपने कितना जमा किया?", ta: "எவ்வளவு சேமித்தீர்கள்?", bn: "কতটুকু জমা করেছেন?", mr: "किती जमा केले?",      en: "How much have you saved?", hl: "Aapne kitna jama kiya?" },
  goalDone:    { hi: "🎉 बधाई हो! लक्ष्य पूरा!", ta: "🎉 வாழ்த்துக்கள்! இலக்கு நிறைவு!", bn: "🎉 অভিনন্দন! লক্ষ্য পূর্ণ!", mr: "🎉 अभिनंदन! लक्ष्य पूर्ण!", en: "🎉 Congrats! Goal achieved!", hl: "🎉 Badhai ho! Target poora!" },
  perMonth:    { hi: "माह",                 ta: "மாதம்",                bn: "মাস",                 mr: "महिना",               en: "month",               hl: "mahine"             },
  months:      { hi: "महीने",               ta: "மாதங்கள்",            bn: "মাস",                 mr: "महिने",               en: "months",              hl: "mahine"             },
  years:       { hi: "साल",                 ta: "ஆண்டுகள்",            bn: "বছর",                 mr: "वर्षे",               en: "years",               hl: "saal"               },
  goalIn:      { hi: "में लक्ष्य पूरा होगा", ta: "இல் இலக்கு நிறைவடையும்", bn: "এ লক্ষ্য পূরণ হবে", mr: "मध्ये लक्ष्य पूर्ण होईल", en: "to reach your goal", hl: "mein target poora hoga" },
  approx:      { hi: "साधारण",               ta: "தோராயமாக",            bn: "প্রায়",               mr: "साधारण",              en: "approx.",             hl: "lagbhag"            },
  summary:     { hi: "📊 बचत सारांश",       ta: "📊 சேமிப்பு சுருக்கம்", bn: "📊 সঞ্চয় সারসংক্ষেপ", mr: "📊 बचत सारांश",       en: "📊 Savings Summary",  hl: "📊 Bachhat Summary"  },
  monthly:     { hi: "मासिक बचत",           ta: "மாத சேமிப்பு",        bn: "মাসিক সঞ্চয়",        mr: "मासिक बचत",           en: "Monthly Savings",     hl: "Maasik Bachhat"     },
  yearly:      { hi: "सालाना बचत",          ta: "ஆண்டு சேமிப்பு",     bn: "বার্ষিক সঞ্চয়",      mr: "वार्षिक बचत",         en: "Yearly Savings",      hl: "Saalana Bachhat"    },
  goalPct:     { hi: "लक्ष्य पूरा",         ta: "இலக்கு %",            bn: "লক্ষ্য সম্পূর্ণ",    mr: "लक्ष्य पूर्ण",        en: "Goal Done",           hl: "Target Done"        },
  options:     { hi: "🏦 आपके लिए सही विकल्प", ta: "🏦 உங்களுக்கான சரியான விருப்பங்கள்", bn: "🏦 আপনার জন্য সঠিক বিকল্প", mr: "🏦 तुमच्यासाठी योग्य पर्याय", en: "🏦 Best Options For You", hl: "🏦 Aapke Liye Sahi Options" },
  aiTips:      { hi: "💡 AI सुझाव",         ta: "💡 AI ஆலோசனை",       bn: "💡 AI পরামর্শ",       mr: "💡 AI सूचना",         en: "💡 AI Tips",          hl: "💡 AI Tips"          },
  loading:     { hi: "AI से सुझाव आ रहे हैं...", ta: "AI-இல் இருந்து ஆலோசனை வருகிறது...", bn: "AI থেকে পরামর্শ আসছে...", mr: "AI कडून सूचना येत आहेत...", en: "Getting tips from AI...", hl: "AI se tips aa rahe hain..." },
  disclaimer:  { hi: "अनुमानित — निवेश से पहले बैंक से जानकारी लें", ta: "தோராயமானது — முதலீட்டிற்கு முன் வங்கியிடம் கேளுங்கள்", bn: "আনুমানিক — বিনিয়োগের আগে ব্যাংকে জানুন", mr: "अंदाजे — गुंतवणुकीपूर्वी बँकेकडून माहिती घ्या", en: "Estimated — verify with your bank before investing", hl: "Anumanit hai — nivesh se pehle bank se check karo" },
  updateBtn:   { hi: "बदलाव सहेजें ✓",        ta: "புதுப்பி ✓",           bn: "আপডেট করুন ✓",       mr: "अपडेट करा ✓",         en: "Update ✓",            hl: "Save karo ✓"        },
  remaining:   { hi: "बाकी है",             ta: "மீதம்",               bn: "বাকি আছে",           mr: "बाकी आहे",            en: "remaining",           hl: "baaki hai"          },
  nearGoal:    { hi: "🎯 लक्ष्य के बहुत करीब!", ta: "🎯 இலக்கு மிக அருகில்!", bn: "🎯 লক্ষ্যের খুব কাছে!", mr: "🎯 लक्ष्याच्या जवळ!", en: "🎯 Almost there!",  hl: "🎯 Target ke bahut karib!" },
};

export default function Dashboard({ profile, lang }) {
  const lc = lang?.code || "hi";
  const goalData   = GOAL_TARGETS[profile.goal] || GOAL_TARGETS["Keep money safe"];
  const monthlyAmt = INCOME_VALUE[profile.income] || 500;

  const [saved,        setSaved]        = useState(monthlyAmt * 3);
  const [inputVal,     setInputVal]     = useState(String(monthlyAmt * 3));
  const [tips,         setTips]         = useState(null);
  const [tipsLoading,  setTipsLoading]  = useState(true);

  const fmt        = v => "₹" + Math.round(v).toLocaleString("en-IN");
  const progress   = Math.min((saved / goalData.target) * 100, 100);
  const remaining  = Math.max(0, goalData.target - saved);
  const monthsLeft = Math.max(0, Math.ceil(remaining / monthlyAmt));
  const yearsLeft  = (monthsLeft / 12).toFixed(1);
  const recommended = RECOMMENDED[profile.goal] || RECOMMENDED["Keep money safe"];
  const nearGoal   = progress >= 80 && progress < 100;

  // Emotional messages
  const MOTIVATION = {
    hi: { near: "🔥 बस थोड़ा और! लक्ष्य पास है!", great: "💪 बढ़िया जा रहे हो! जारी रखो!", start: "🚀 शुरुआत हो गई है! हर महीना मायने रखता है!" },
    ta: { near: "🔥 கொஞ்சம் மட்டுமே! இலக்கு அருகில்!", great: "💪 சிறப்பாக செல்கிறீர்கள்!", start: "🚀 தொடக்கம் நல்லது!" },
    bn: { near: "🔥 আর একটু! লক্ষ্য কাছে!", great: "💪 দারুণ যাচ্ছে!", start: "🚀 শুরু হয়েছে!" },
    mr: { near: "🔥 थोडंच बाकी! ध्येय जवळ!", great: "💪 छान चालू आहे!", start: "🚀 सुरुवात झाली!" },
    en: { near: "🔥 Almost there! Goal is close!", great: "💪 Great progress! Keep going!", start: "🚀 Journey started! Every month counts!" },
  };
  const motivMsg = progress >= 80 ? MOTIVATION[lc]?.near : progress >= 40 ? MOTIVATION[lc]?.great : MOTIVATION[lc]?.start;

  const etaText = monthsLeft === 0
    ? T.goalDone[lc]
    : nearGoal
    ? `${T.nearGoal[lc]} — ${fmt(remaining)} ${T.remaining[lc]}`
    : `📅 ${fmt(monthlyAmt)}/${T.perMonth[lc]} — ${T.approx[lc]} ${monthsLeft < 12 ? `${monthsLeft} ${T.months[lc]}` : `${yearsLeft} ${T.years[lc]}`} ${T.goalIn[lc]}`;
  const progressMsg = lc === 'hi' ? `${Math.round(progress)}% पूरा — बस ${fmt(remaining)} और चाहिए!`
    : lc === 'ta' ? `${Math.round(progress)}% முடிந்தது — ${fmt(remaining)} மேலும் தேவை!`
    : lc === 'bn' ? `${Math.round(progress)}% সম্পূর্ণ — আরও ${fmt(remaining)} দরকার!`
    : lc === 'mr' ? `${Math.round(progress)}% पूर्ण — आणखी ${fmt(remaining)} लागेल!`
    : `${Math.round(progress)}% done — just ${fmt(remaining)} more to go!`;

  // ── BUG FIX 1: pass lc so tips come in the right language ─────────────
  useEffect(() => {
    setTipsLoading(true);
    generateDashboardTips(profile, lc).then(aiTips => {
      setTips(aiTips || null); // null triggers fallback in render
      setTipsLoading(false);
    });
  }, [profile.goal, profile.income, lc]);

  const handleSavedUpdate = () => {
    const n = Number(inputVal);
    if (!isNaN(n) && n >= 0) setSaved(n);
  };

  // Progress bar color: green → amber → green (full)
  const progressColor = progress >= 100 ? "#1a6b3c"
    : progress >= 60 ? "#1565c0"
    : progress >= 30 ? "#0097a7"
    : "#43a047";

  return (
    <div className="dashboard">

      {/* ── Goal Progress Card ───────────────────────────────────────────── */}
      <div className="dash-card">
        <div className="dash-goal-header">
          <span className="dash-goal-icon">{goalData.icon}</span>
          <div>
            <div className="dash-goal-label">{goalData.label[lc]}</div>
            <div className="dash-target">{T.target[lc]}: {fmt(goalData.target)}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%`, background: progressColor }} />
        </div>
        <div className="progress-meta">
          <span>{fmt(saved)} {T.saved[lc]}</span>
          <span style={{ fontWeight: 600, color: progressColor }}>{Math.round(progress)}% {T.complete[lc]}</span>
        </div>

        {/* ── DAY 2: Saved amount — slider + number input together ──────── */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: "#555", fontWeight: 600, marginBottom: 8 }}>
            {T.savedAmt[lc]}
          </div>
          {/* Slider */}
          <input
            type="range"
            min={0}
            max={goalData.target}
            step={Math.max(100, Math.floor(goalData.target / 100))}
            value={saved}
            onChange={e => { setSaved(Number(e.target.value)); setInputVal(String(e.target.value)); }}
            style={{ width: "100%", accentColor: goalData.color, marginBottom: 10 }}
          />
          {/* Number input + update button */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#888", flexShrink: 0 }}>₹</span>
            <input
              type="number"
              value={inputVal}
              min={0}
              max={goalData.target}
              onChange={e => setInputVal(e.target.value)}
              onBlur={handleSavedUpdate}
              onKeyDown={e => e.key === "Enter" && handleSavedUpdate()}
              className="dash-input"
              style={{ flex: 1, width: "auto" }}
            />
            <button
              onClick={handleSavedUpdate}
              style={{
                background: goalData.color, color: "white", border: "none",
                borderRadius: 10, padding: "7px 14px", fontSize: 13,
                fontWeight: 700, cursor: "pointer", flexShrink: 0, fontFamily: "inherit",
              }}>
              {T.updateBtn[lc]}
            </button>
          </div>
        </div>

        <div className="dash-eta">{etaText}</div>
        {motivMsg && (
          <div style={{marginTop:8,fontSize:13,fontWeight:700,color:progress>=80?"#00897b":"#1a6b3c",background:progress>=80?"#e0f2f1":"#e8f5ee",borderRadius:10,padding:"8px 14px",border:`1px solid ${progress>=80?"#80cbc4":"#b2dfcc"}`}}>
            {motivMsg}
          </div>
        )}
        {progress > 0 && progress < 100 && (
          <div style={{marginTop:6,fontSize:12,color:"#888",textAlign:"center"}}>
            {progressMsg}
          </div>
        )}
      </div>

      {/* ── Summary Card ────────────────────────────────────────────────── */}
      <div className="dash-card">
        <div className="dash-section-title">{T.summary[lc]}</div>
        <div className="dash-stat-row">
          <div className="dash-stat">
            <div className="dash-stat-value">{fmt(monthlyAmt)}</div>
            <div className="dash-stat-label">{T.monthly[lc]}</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-value">{fmt(monthlyAmt * 12)}</div>
            <div className="dash-stat-label">{T.yearly[lc]}</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-value" style={{ color: progressColor }}>
              {Math.round(progress)}%
            </div>
            <div className="dash-stat-label">{T.goalPct[lc]}</div>
          </div>
        </div>

        {/* ── DAY 2: Remaining amount chip ─────────────────────────────── */}
        {remaining > 0 && (
          <div style={{
            marginTop: 12, background: "#fff8e1", borderRadius: 10,
            padding: "8px 14px", fontSize: 13, color: "#92700a", fontWeight: 500,
          }}>
            🎯 {fmt(remaining)} {T.remaining[lc]}
          </div>
        )}
      </div>

      {/* ── Goal-Based Plan — HIGHLIGHTED ─────────────────────────────── */}
      <div className="dash-card" style={{ background: "linear-gradient(135deg,#1a6b3c,#0f4a28)", color: "white", borderRadius: 22 }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, opacity: 0.9 }}>
          🚀 {lc==="hi"?"आपका योजना: अगले 3 कदम":lc==="en"?"Your Plan: Next 3 Steps":lc==="ta"?"உங்கள் திட்டம்: 3 படிகள்":lc==="bn"?"আপনার পরিকল্পনা: ৩ ধাপ":"तुमचा Plan: पुढील 3 Steps"}
        </div>
        {(() => {
          const steps = {
            "Keep money safe": {
              hi: ["डाकघर आवर्ती जमा खोलें — ₹100/माह से","3 महीने की बचत आपातकालीन निधि में रखें","6 महीने बाद सावधि जमा में डालें"],
              en: ["Open Post Office RD — ₹100/month","Keep 3 months savings as emergency fund","After 6 months, move to FD"],
              ta: ["Post Office RD திற — ₹100/மாதம்","3 மாத சேமிப்பை emergency-ல் வையுங்கள்","6 மாதம் பின் FD-க்கு மாறுங்கள்"],
              bn: ["Post Office RD খুলুন — ₹100/মাস","৩ মাসের সঞ্চয় emergency fund-এ রাখুন","৬ মাস পর FD-তে রাখুন"],
              mr: ["Post Office RD उघडा — ₹100/महिना","3 महिन्यांची बचत emergency fund मध्ये ठेवा","6 महिन्यांनंतर FD मध्ये टाका"],
            },
            "Children's education": {
              hi: ["सुकन्या समृद्धि (बेटी) / PPF खोलें","₹250/माह अपने-आप जमा लगाएं","हर साल ₹500 अतिरिक्त जमा करें"],
              en: ["Open Sukanya Samridhi or PPF","Set ₹250/month auto-deposit","Add ₹500 extra every year"],
              ta: ["Sukanya Samridhi / PPF திற","₹250/மாதம் auto-deposit அமைக்கவும்","ஆண்டுதோறும் ₹500 கூடுதலாக போடுங்கள்"],
              bn: ["Sukanya Samridhi / PPF খুলুন","₹250/মাস auto-deposit সেট করুন","প্রতি বছর ₹500 অতিরিক্ত জমা করুন"],
              mr: ["Sukanya Samridhi / PPF उघडा","₹250/महिना auto-deposit लावा","दर वर्षी ₹500 जास्त जमा करा"],
            },
            "Build a home": {
              hi: ["PMAY योजना में आवेदन करें (सब्सिडी मिलेगी)","सावधि जमा में 5 साल के लिए ₹500/माह जमाएं","3 साल बाद गृह ऋण योजना बनाएं"],
              en: ["Apply for PMAY (get govt subsidy)","Deposit ₹500/month in FD for 5 years","Plan home loan after 3 years"],
              ta: ["PMAY-ல் விண்ணப்பியுங்கள் (மானியம் பெறுங்கள்)","FD-ல் 5 ஆண்டுகளுக்கு ₹500/மாதம் போடுங்கள்","3 ஆண்டுகள் பின் home loan திட்டமிடுங்கள்"],
              bn: ["PMAY-তে আবেদন করুন (ভর্তুকি পাবেন)","FD-তে ৫ বছরের জন্য ₹500/মাস জমা করুন","৩ বছর পর home loan পরিকল্পনা করুন"],
              mr: ["PMAY साठी अर्ज करा (अनुदान मिळेल)","FD मध्ये 5 वर्षांसाठी ₹500/महिना जमा करा","3 वर्षांनंतर home loan plan करा"],
            },
            "Retirement": {
              hi: ["NPS + PPF दोनों आज शुरू करें","₹500/माह NPS में अपने-आप निवेश करें","धारा 80C से कर बचाएं"],
              en: ["Start NPS + PPF today","Auto-invest ₹500/month in NPS","Save tax under Section 80C"],
              ta: ["NPS + PPF இன்றே தொடங்குங்கள்","₹500/மாதம் NPS-ல் auto-invest செய்யுங்கள்","Section 80C-ல் வரி சேமியுங்கள்"],
              bn: ["NPS + PPF আজই শুরু করুন","₹500/মাস NPS-এ auto-invest করুন","Section 80C-এ ট্যাক্স বাঁচান"],
              mr: ["NPS + PPF आजच सुरू करा","₹500/महिना NPS मध्ये auto-invest करा","Section 80C मधून कर वाचवा"],
            },
          };
          const goalSteps = steps[profile.goal]?.[lc] || steps["Keep money safe"][lc] || steps["Keep money safe"].en;
          return goalSteps.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i+1}</span>
              <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.5, opacity: 0.95 }}>{step}</span>
            </div>
          ));
        })()}
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 12px", fontSize: 11, marginTop: 4, textAlign: "center", fontWeight: 700 }}>
          💡 {lc==="hi"?`सुझाया मासिक निवेश: ₹${(INCOME_VALUE[profile.income]||500).toLocaleString("en-IN")}`:lc==="en"?`Recommended monthly investment: ₹${(INCOME_VALUE[profile.income]||500).toLocaleString("en-IN")}`:lc==="ta"?`பரிந்துரைக்கப்பட்ட மாத முதலீடு: ₹${(INCOME_VALUE[profile.income]||500).toLocaleString("en-IN")}`:lc==="bn"?`প্রস্তাবিত মাসিক বিনিয়োগ: ₹${(INCOME_VALUE[profile.income]||500).toLocaleString("en-IN")}`:`सुचवलेली मासिक गुंतवणूक: ₹${(INCOME_VALUE[profile.income]||500).toLocaleString("en-IN")}`}
        </div>
      </div>

      {/* ── AI Insight Card (personalized) ──────────────────────────────── */}
      <div className="dash-card">
        <div className="dash-section-title">
          🧠 {lc==="hi"?"AI Insight":lc==="ta"?"AI நுண்ணறிவு":lc==="bn"?"AI অন্তর্দৃষ্টি":lc==="mr"?"AI अंतर्दृष्टी":"AI Insight"}
          <span className="dash-ai-badge">AI</span>
        </div>
        {tipsLoading ? (
          <div className="tips-loading">
            <span className="tip-dot" /><span className="tip-dot" /><span className="tip-dot" />
            <span className="tips-loading-text">{T.loading[lc]}</span>
          </div>
        ) : tips ? (
          <div>
            {/* Personalized summary block */}
            {(tips.userType || tips.bestCombo || tips.avoid) && (
              <div style={{
                background: "linear-gradient(135deg,#e8f5e9,#f0faf3)",
                border: "1.5px solid #b2dfcc", borderRadius: 14,
                padding: "12px 14px", marginBottom: 14,
              }}>
                {tips.userType && (
                  <div style={{ fontSize: 13, color: "#555", marginBottom: 6 }}>
                    👤 {tips.userType}
                  </div>
                )}
                {tips.bestCombo && (
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#1a6b3c", marginBottom: 4 }}>
                    ✅ {lc==="hi"?"इसलिए सबसे अच्छा:":lc==="en"?"Best for you:":lc==="ta"?"உங்களுக்கு சிறந்தது:":lc==="bn"?"আপনার জন্য সেরা:":"तुमच्यासाठी सर्वोत्तम:"} {tips.bestCombo}
                  </div>
                )}
                {tips.avoid && (
                  <div style={{ fontSize: 12, color: "#e65100", fontWeight: 600 }}>
                    ⚠️ {tips.avoid}
                  </div>
                )}
              </div>
            )}
            {/* Actionable tips */}
            {tips.tips?.map((tip, i) => (
              <div key={i} className="dash-tip">✅ {tip}</div>
            ))}
          </div>
        ) : (
          /* Fallback to static tips */
          (FALLBACK_TIPS[profile.goal]?.[lc] || FALLBACK_TIPS[profile.goal]?.hi || []).map((tip, i) => (
            <div key={i} className="dash-tip">✅ {tip}</div>
          ))
        )}
      </div>

      <div className="dash-disclaimer">⚠️ {T.disclaimer[lc]}</div>
    </div>
  );
}