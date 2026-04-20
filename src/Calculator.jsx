import { useState } from "react";

const CALC_TEXT = {
  title:      { hi: "निवेश कैलकुलेटर", ta: "முதலீட்டு கணக்கி", bn: "বিনিয়োগ ক্যালকুলেটর", mr: "गुंतवणूक कॅल्क्युलेटर", en: "Investment Calculator" },
  types:      { hi: "योजना चुनें", ta: "திட்டம் தேர்வு", bn: "পরিকল্পনা বেছে নিন", mr: "योजना निवडा", en: "Choose Plan" },
  monthly:    { hi: "मासिक निवेश (₹)", ta: "மாத முதலீடு (₹)", bn: "মাসিক বিনিয়োগ (₹)", mr: "मासिक गुंतवणूक (₹)", en: "Monthly Investment (₹)" },
  years:      { hi: "कितने साल?", ta: "எத்தனை ஆண்டுகள்?", bn: "কত বছর?", mr: "किती वर्षे?", en: "How many years?" },
  yr:         { hi: "साल", ta: "ஆண்டு", bn: "বছর", mr: "वर्ष", en: "yr" },
  calculate:  { hi: "हिसाब लगाओ →", ta: "கணக்கிடு →", bn: "হিসাব করুন →", mr: "हिशोब काढा →", en: "Calculate →" },
  invested:   { hi: "कुल जमा", ta: "மொத்த முதலீடு", bn: "মোট জমা", mr: "एकूण गुंतवणूक", en: "Total Invested" },
  returns:    { hi: "कुल ब्याज", ta: "மொத்த வட்டி", bn: "মোট সুদ", mr: "एकूण व्याज", en: "Total Interest" },
  total:      { hi: "कुल रकम", ta: "மொத்த தொகை", bn: "মোট পরিমাণ", mr: "एकूण रक्कम", en: "Total Amount" },
  disclaimer: { hi: "यह अनुमानित है — actual returns अलग हो सकते हैं", ta: "இது தோராயமானது — உண்மையான வருமானம் மாறுபடலாம்", bn: "এটি আনুমানিক — প্রকৃত রিটার্ন আলাদা হতে পারে", mr: "हे अंदाजे आहे — प्रत्यक्ष परतावा वेगळा असू शकतो", en: "Estimated only — actual returns may vary" },
  market:     { hi: "बाज़ार पर निर्भर", ta: "சந்தையை சார்ந்தது", bn: "বাজারের উপর নির্ভরশীল", mr: "बाजारावर अवलंबून", en: "Market dependent" },
  rate:       { hi: "दर: लगभग", ta: "வட்டி விகிதம்: சுமார்", bn: "হার: প্রায়", mr: "दर: साधारण", en: "Rate: approx" },
  yearly:     { hi: "सालाना", ta: "ஆண்டு", bn: "বার্ষিক", mr: "वार्षिक", en: "yearly" },
  yr1:        { hi: "1 साल", ta: "1 ஆண்டு", bn: "১ বছর", mr: "1 वर्ष", en: "1 yr" },
  yr15:       { hi: "15 साल", ta: "15 ஆண்டு", bn: "১৫ বছর", mr: "15 वर्षे", en: "15 yrs" },
  yr30:       { hi: "30 साल", ta: "30 ஆண்டு", bn: "৩০ বছর", mr: "30 वर्षे", en: "30 yrs" },
  deposit:    { hi: "🟢 जमा:", ta: "🟢 முதலீடு:", bn: "🟢 জমা:", mr: "🟢 गुंतवणूक:", en: "🟢 Invested:" },
  interest:   { hi: "📈 ब्याज:", ta: "📈 வட்டி:", bn: "📈 সুদ:", mr: "📈 व्याज:", en: "📈 Interest:" },
};

const PLANS = [
  { key: "fd",  label: "FD",  rate: 7.0,  safe: true  },
  { key: "ppf", label: "PPF", rate: 7.1,  safe: true  },
  { key: "rd",  label: "RD",  rate: 6.5,  safe: true  },
  { key: "sip", label: "SIP", rate: 12.0, safe: false },
];

export default function Calculator({ lang }) {
  const [monthly, setMonthly] = useState(500);
  const [years,   setYears]   = useState(5);
  const [plan,    setPlan]    = useState(PLANS[0]);
  const [result,  setResult]  = useState(null);

  const lc = lang?.code || "hi";

  const calculate = () => {
    const r        = plan.rate / 100 / 12;
    const n        = years * 12;
    const invested = monthly * n;
    let total;
    if (plan.key === "ppf") {
      let bal = 0;
      for (let y = 0; y < years; y++) bal = (bal + monthly * 12) * (1 + plan.rate / 100);
      total = bal;
    } else {
      total = r === 0 ? invested : monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    }
    setResult({ invested: Math.round(invested), interest: Math.round(total - invested), total: Math.round(total) });
  };

  const fmt = n => "₹" + n.toLocaleString("en-IN");

  return (
    <div className="dashboard">
      <div className="dash-card">
        <div style={{ fontSize: 18, fontWeight: 800, color: "#1a6b3c", marginBottom: 16 }}>
          🧮 {CALC_TEXT.title[lc]}
        </div>

        {/* Plan Tabs */}
        <p className="onboard-label" style={{ marginTop: 0 }}>{CALC_TEXT.types[lc]}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {PLANS.map(p => (
            <button key={p.key} onClick={() => { setPlan(p); setResult(null); }} style={{
              padding: "7px 16px", borderRadius: 99,
              border: plan.key === p.key ? "2px solid #1a6b3c" : "1.5px solid #ddd",
              background: plan.key === p.key ? "#e8f5e9" : "#fff",
              color: plan.key === p.key ? "#1a6b3c" : "#555",
              fontWeight: plan.key === p.key ? 700 : 400,
              cursor: "pointer", fontSize: 14, fontFamily: "inherit",
            }}>
              {p.label} ({p.rate}%) {!p.safe && "⚠️"}
            </button>
          ))}
        </div>

        {/* Monthly Amount */}
        <p className="onboard-label">{CALC_TEXT.monthly[lc]}</p>
        <input type="number" value={monthly} min={100}
          onChange={e => { setMonthly(Number(e.target.value)); setResult(null); }}
          className="dash-input"
          style={{ width: "100%", marginBottom: 16, padding: "10px 14px", fontSize: 16 }}
        />

        {/* Years Slider */}
        <p className="onboard-label">
          {CALC_TEXT.years[lc]}: <strong style={{ color: "#1a6b3c" }}>{years} {CALC_TEXT.yr[lc]}</strong>
        </p>
        <input type="range" min={1} max={30} value={years}
          onChange={e => { setYears(Number(e.target.value)); setResult(null); }}
          style={{ width: "100%", accentColor: "#1a6b3c", marginBottom: 4 }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#aaa", marginBottom: 16 }}>
          <span>{CALC_TEXT.yr1[lc]}</span><span>{CALC_TEXT.yr15[lc]}</span><span>{CALC_TEXT.yr30[lc]}</span>
        </div>

        {/* Rate Info */}
        <div style={{ background: "#f0faf3", borderRadius: 12, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#1a6b3c" }}>
          📈 {plan.label} {CALC_TEXT.rate[lc]} {plan.rate}% {CALC_TEXT.yearly[lc]}
          {!plan.safe && <span style={{ color: "#e65100", marginLeft: 8 }}>⚠️ {CALC_TEXT.market[lc]}</span>}
        </div>

        <button className="onboard-submit" style={{ marginTop: 0 }} onClick={calculate}>
          {CALC_TEXT.calculate[lc]}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="dash-card" style={{ borderTop: "3px solid #1a6b3c" }}>
          <div className="dash-stat-row">
            <div className="dash-stat">
              <div className="dash-stat-value" style={{ fontSize: 15 }}>{fmt(result.invested)}</div>
              <div className="dash-stat-label">{CALC_TEXT.invested[lc]}</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-value" style={{ fontSize: 15, color: "#2e7d32" }}>{fmt(result.interest)}</div>
              <div className="dash-stat-label">{CALC_TEXT.returns[lc]}</div>
            </div>
            <div className="dash-stat" style={{ background: "#e8f5e9" }}>
              <div className="dash-stat-value" style={{ fontSize: 15 }}>{fmt(result.total)}</div>
              <div className="dash-stat-label">{CALC_TEXT.total[lc]}</div>
            </div>
          </div>

          {/* Bar */}
          <div style={{ marginTop: 16 }}>
            <div style={{ background: "#f0f0f0", borderRadius: 99, height: 18, overflow: "hidden" }}>
              <div style={{
                width: `${Math.min((result.invested / result.total) * 100, 100)}%`,
                height: "100%", background: "#1a6b3c", borderRadius: 99, transition: "width 0.6s ease",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginTop: 6 }}>
              <span>{CALC_TEXT.deposit[lc]} {fmt(result.invested)}</span>
              <span>{CALC_TEXT.interest[lc]} {fmt(result.interest)}</span>
            </div>
          </div>

          <div className="dash-disclaimer" style={{ marginTop: 14 }}>
            ⚠️ {CALC_TEXT.disclaimer[lc]}
          </div>
        </div>
      )}
    </div>
  );
}
