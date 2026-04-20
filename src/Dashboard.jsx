import { useState, useEffect } from "react";
import { generateDashboardTips } from "./api/groq";
import "./Dashboard.css";

const GOAL_TARGETS = {
  "Keep money safe":      { target: 10000,  icon: "🛡️", color: "#1a6b3c",
    label: { hi: "आपातकालीन फंड", ta: "அவசர நிதி",      bn: "জরুরি তহবিল",   mr: "आणीबाणी निधी",   en: "Emergency Fund"  } },
  "Children's education": { target: 100000, icon: "📚", color: "#1565c0",
    label: { hi: "शिक्षा फंड",     ta: "கல்வி நிதி",     bn: "শিক্ষা তহবিল",  mr: "शिक्षण निधी",    en: "Education Fund"  } },
  "Build a home":         { target: 500000, icon: "🏠", color: "#6a1b9a",
    label: { hi: "घर फंड",         ta: "வீட்டு நிதி",    bn: "বাড়ির তহবিল",  mr: "गृह निधी",       en: "Home Fund"       } },
  "Retirement":           { target: 200000, icon: "🌅", color: "#e65100",
    label: { hi: "रिटायरमेंट फंड", ta: "ஓய்வூதிய நிதி", bn: "অবসর তহবিল",   mr: "निवृत्ती निधी",  en: "Retirement Fund" } },
};

const INCOME_VALUE = { "Less than ₹500": 300, "₹500–2,000": 1000, "₹2,000–5,000": 3000, "₹5,000+": 6000 };

const RECOMMENDED = {
  "Keep money safe":      ["Post Office RD", "SBI FD", "Savings Account"],
  "Children's education": ["PPF", "Sukanya Samridhi", "RD"],
  "Build a home":         ["FD", "PPF", "PMAY Loan"],
  "Retirement":           ["PPF", "NPS", "FD"],
};

const FALLBACK_TIPS = {
  "Keep money safe": {
    hi: ["Post Office RD में ₹100/माह से शुरू करें", "SBI FD में ₹1000 से emergency fund बनाएं", "3 महीने की बचत हमेशा liquid रखें"],
    ta: ["Post Office RD-ல் ₹100/மாதம் தொடங்குங்கள்", "SBI FD-ல் ₹1000 முதலீடு செய்யுங்கள்", "3 மாத சேமிப்பை எப்போதும் liquid-ஆக வையுங்கள்"],
    bn: ["Post Office RD-তে ₹100/মাস দিয়ে শুরু করুন", "SBI FD-তে ₹1000 দিয়ে ফান্ড তৈরি করুন", "৩ মাসের সঞ্চয় সবসময় liquid রাখুন"],
    mr: ["Post Office RD मध्ये ₹100/महिना सुरू करा", "SBI FD मध्ये ₹1000 ने emergency fund तयार करा", "3 महिन्यांची बचत नेहमी liquid ठेवा"],
    en: ["Start Post Office RD with ₹100/month", "Build emergency fund with ₹1000 in SBI FD", "Always keep 3 months savings in liquid form"],
  },
  "Children's education": {
    hi: ["PPF में सालाना ₹500 जमा करें", "Sukanya Samridhi Yojana बेटी के लिए सबसे अच्छा है", "Post Office RD से पढ़ाई का खर्च निकालें"],
    ta: ["PPF-ல் ஆண்டுதோறும் ₹500 சேமியுங்கள்", "Sukanya Samridhi பெண் குழந்தைக்கு சிறந்தது", "Post Office RD-ல் படிப்பு செலவு சேர்க்கலாம்"],
    bn: ["PPF-এ বার্ষিক ₹500 জমা করুন", "Sukanya Samridhi মেয়ের জন্য সেরা", "Post Office RD দিয়ে পড়াশোনার খরচ তুলুন"],
    mr: ["PPF मध्ये वार्षिक ₹500 जमा करा", "Sukanya Samridhi मुलीसाठी सर्वोत्तम आहे", "Post Office RD मधून शिक्षण खर्च काढा"],
    en: ["Deposit ₹500/year in PPF", "Sukanya Samridhi is best for girl child", "Use Post Office RD for education expenses"],
  },
  "Build a home": {
    hi: ["PMAY scheme check करें — सरकारी subsidy मिलेगी", "FD में 5 साल के लिए पैसा lock करें", "हर महीने अलग savings account में जमा करें"],
    ta: ["PMAY திட்டம் பார்க்கவும் — அரசு மானியம் கிடைக்கும்", "FD-ல் 5 ஆண்டுகளுக்கு பணம் போடுங்கள்", "தனி சேமிப்பு கணக்கில் மாதந்தோறும் போடுங்கள்"],
    bn: ["PMAY স্কিম দেখুন — সরকারি ভর্তুকি পাবেন", "FD-তে ৫ বছরের জন্য টাকা রাখুন", "প্রতি মাসে আলাদা সঞ্চয় অ্যাকাউন্টে জমা করুন"],
    mr: ["PMAY scheme तपासा — सरकारी अनुदान मिळेल", "FD मध्ये 5 वर्षांसाठी पैसे lock करा", "दर महिन्याला वेगळ्या savings account मध्ये जमा करा"],
    en: ["Check PMAY scheme — get government subsidy", "Lock money in FD for 5 years", "Deposit monthly in a separate savings account"],
  },
  "Retirement": {
    hi: ["PPF + NPS दोनों साथ में शुरू करें", "जितना जल्दी शुरू उतना ज़्यादा compound interest", "NPS में Section 80C tax भी बचेगा"],
    ta: ["PPF + NPS இரண்டையும் சேர்த்து தொடங்குங்கள்", "எவ்வளவு சீக்கிரம் தொடங்குகிறீர்களோ அவ்வளவு வட்டி", "NPS-ல் Section 80C வரியும் மிச்சமாகும்"],
    bn: ["PPF + NPS দুটোই একসাথে শুরু করুন", "যত তাড়াতাড়ি শুরু করবেন তত বেশি compound interest", "NPS-এ Section 80C ট্যাক্সও বাঁচবে"],
    mr: ["PPF + NPS दोन्ही एकत्र सुरू करा", "जितक्या लवकर सुरू कराल तितका compound interest जास्त", "NPS मध्ये Section 80C कर पण वाचेल"],
    en: ["Start both PPF + NPS together", "Earlier you start, more compound interest you earn", "NPS also saves Section 80C tax"],
  },
};

const T = {
  target:     { hi: "लक्ष्य",        ta: "இலக்கு",        bn: "লক্ষ্য",        mr: "लक्ष्य",        en: "Target"          },
  saved:      { hi: "जमा",           ta: "சேமிப்பு",      bn: "জমা",           mr: "जमा",           en: "Saved"           },
  complete:   { hi: "पूरा",          ta: "முடிந்தது",     bn: "সম্পূর্ণ",     mr: "पूर्ण",         en: "Complete"        },
  savedAmt:   { hi: "जमा राशि: ₹",  ta: "சேமித்த தொகை: ₹", bn: "জমা পরিমাণ: ₹", mr: "जमा रक्कम: ₹", en: "Amount Saved: ₹" },
  goalDone:   { hi: "🎉 बधाई हो! लक्ष्य पूरा!", ta: "🎉 வாழ்த்துக்கள்! இலக்கு நிறைவு!", bn: "🎉 অভিনন্দন! লক্ষ্য পূর্ণ!", mr: "🎉 अभिनंदन! लक्ष्य पूर्ण!", en: "🎉 Congrats! Goal achieved!" },
  perMonth:   { hi: "माह",           ta: "மாதம்",         bn: "মাস",           mr: "महिना",         en: "month"           },
  months:     { hi: "महीने",         ta: "மாதங்கள்",     bn: "মাস",           mr: "महिने",         en: "months"          },
  years:      { hi: "साल",           ta: "ஆண்டுகள்",     bn: "বছর",           mr: "वर्षे",         en: "years"           },
  goalIn:     { hi: "में लक्ष्य पूरा होगा", ta: "இல் இலக்கு நிறைவடையும்", bn: "এ লক্ষ্য পূরণ হবে", mr: "मध्ये लक्ष्य पूर्ण होईल", en: "to reach your goal" },
  approx:     { hi: "लगभग",          ta: "தோராயமாக",     bn: "প্রায়",         mr: "साधारण",        en: "approx."         },
  summary:    { hi: "📊 बचत सारांश", ta: "📊 சேமிப்பு சுருக்கம்", bn: "📊 সঞ্চয় সারসংক্ষেপ", mr: "📊 बचत सारांश", en: "📊 Savings Summary" },
  monthly:    { hi: "मासिक बचत",    ta: "மாத சேமிப்பு",  bn: "মাসিক সঞ্চয়", mr: "मासिक बचत",     en: "Monthly Savings" },
  yearly:     { hi: "सालाना बचत",   ta: "ஆண்டு சேமிப்பு", bn: "বার্ষিক সঞ্চয়", mr: "वार्षिक बचत", en: "Yearly Savings"  },
  goalPct:    { hi: "लक्ष्य पूरा",  ta: "இலக்கு %",     bn: "লক্ষ্য সম্পূর্ণ", mr: "लक्ष्य पूर्ण", en: "Goal Done"      },
  options:    { hi: "🏦 आपके लिए सही विकल्प", ta: "🏦 உங்களுக்கான சரியான விருப்பங்கள்", bn: "🏦 আপনার জন্য সঠিক বিকল্প", mr: "🏦 तुमच्यासाठी योग्य पर्याय", en: "🏦 Best Options For You" },
  aiTips:     { hi: "💡 AI सुझाव",  ta: "💡 AI ஆலோசனை", bn: "💡 AI পরামর্শ", mr: "💡 AI सूचना",   en: "💡 AI Tips"      },
  loading:    { hi: "AI से सुझाव आ रहे हैं...", ta: "AI-இல் இருந்து ஆலோசனை வருகிறது...", bn: "AI থেকে পরামর্শ আসছে...", mr: "AI कडून सूचना येत आहेत...", en: "Getting tips from AI..." },
  disclaimer: { hi: "अनुमानित — निवेश से पहले बैंक से जानकारी लें", ta: "தோராயமானது — முதலீட்டிற்கு முன் வங்கியிடம் கேளுங்கள்", bn: "আনুমানিক — বিনিয়োগের আগে ব্যাংকে জানুন", mr: "अंदाजे — गुंतवणुकीपूर्वी बँकेकडून माहिती घ्या", en: "Estimated — verify with your bank before investing" },
};

export default function Dashboard({ profile, lang }) {
  const lc = lang?.code || "hi";
  const goalData    = GOAL_TARGETS[profile.goal] || GOAL_TARGETS["Keep money safe"];
  const monthlyAmt  = INCOME_VALUE[profile.income] || 500;
  const [saved, setSaved]             = useState(monthlyAmt * 3);
  const [tips, setTips]               = useState(null);
  const [tipsLoading, setTipsLoading] = useState(true);

  const progress   = Math.min((saved / goalData.target) * 100, 100);
  const monthsLeft = Math.max(0, Math.ceil((goalData.target - saved) / monthlyAmt));
  const yearsLeft  = (monthsLeft / 12).toFixed(1);
  const recommended = RECOMMENDED[profile.goal] || RECOMMENDED["Keep money safe"];
  const fmt = v => "₹" + Math.round(v).toLocaleString("en-IN");

  const etaText = monthsLeft === 0
    ? T.goalDone[lc]
    : `📅 ${fmt(monthlyAmt)}/${T.perMonth[lc]} — ${T.approx[lc]} ${monthsLeft < 12 ? `${monthsLeft} ${T.months[lc]}` : `${yearsLeft} ${T.years[lc]}`} ${T.goalIn[lc]}`;

  useEffect(() => {
    setTipsLoading(true);
    generateDashboardTips(profile).then(aiTips => {
      const fallback = FALLBACK_TIPS[profile.goal]?.[lc] || FALLBACK_TIPS["Keep money safe"][lc];
      setTips(aiTips || fallback);
      setTipsLoading(false);
    });
  }, [profile.goal, profile.income, lc]);

  return (
    <div className="dashboard">

      {/* Goal Progress Card */}
      <div className="dash-card">
        <div className="dash-goal-header">
          <span className="dash-goal-icon">{goalData.icon}</span>
          <div>
            <div className="dash-goal-label">{goalData.label[lc]}</div>
            <div className="dash-target">{T.target[lc]}: {fmt(goalData.target)}</div>
          </div>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%`, background: goalData.color }} />
        </div>
        <div className="progress-meta">
          <span>{fmt(saved)} {T.saved[lc]}</span>
          <span style={{ fontWeight: 600, color: goalData.color }}>{Math.round(progress)}% {T.complete[lc]}</span>
        </div>
        <div className="dash-input-row">
          <label>{T.savedAmt[lc]}</label>
          <input type="number" value={saved} min={0} onChange={e => setSaved(Number(e.target.value))} className="dash-input" />
        </div>
        <div className="dash-eta">{etaText}</div>
      </div>

      {/* Summary Card */}
      <div className="dash-card">
        <div className="dash-section-title">{T.summary[lc]}</div>
        <div className="dash-stat-row">
          <div className="dash-stat"><div className="dash-stat-value">{fmt(monthlyAmt)}</div><div className="dash-stat-label">{T.monthly[lc]}</div></div>
          <div className="dash-stat"><div className="dash-stat-value">{fmt(monthlyAmt * 12)}</div><div className="dash-stat-label">{T.yearly[lc]}</div></div>
          <div className="dash-stat"><div className="dash-stat-value" style={{ color: goalData.color }}>{Math.round(progress)}%</div><div className="dash-stat-label">{T.goalPct[lc]}</div></div>
        </div>
      </div>

      {/* Options Card */}
      <div className="dash-card">
        <div className="dash-section-title">{T.options[lc]}</div>
        <div className="dash-chips">
          {recommended.map((p, i) => <span key={i} className="dash-chip">{p}</span>)}
        </div>
      </div>

      {/* AI Tips Card */}
      <div className="dash-card">
        <div className="dash-section-title">{T.aiTips[lc]} <span className="dash-ai-badge">AI</span></div>
        {tipsLoading ? (
          <div className="tips-loading">
            <span className="tip-dot" /><span className="tip-dot" /><span className="tip-dot" />
            <span className="tips-loading-text">{T.loading[lc]}</span>
          </div>
        ) : tips?.map((tip, i) => <div key={i} className="dash-tip">✅ {tip}</div>)}
      </div>

      <div className="dash-disclaimer">⚠️ {T.disclaimer[lc]}</div>
    </div>
  );
}