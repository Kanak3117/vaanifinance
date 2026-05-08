import { useState } from "react";

const CALC_TEXT = {
  title:      { hi: "निवेश कैलकुलेटर", ta: "முதலீட்டு கணக்கி", bn: "বিনিয়োগ ক্যালকুলেটর", mr: "गुंतवणूक कॅल्क्युलेटर", en: "Investment Calculator", hl: "Investment Calculator" },
  types:      { hi: "योजना चुनें", ta: "திட்டம் தேர்வு", bn: "পরিকল্পনা বেছে নিন", mr: "योजना निवडा", en: "Choose Plan", hl: "Plan Chuno" },
  monthly:    { hi: "मासिक निवेश (₹)", ta: "மாத முதலீடு (₹)", bn: "মাসিক বিনিয়োগ (₹)", mr: "मासिक गुंतवणूक (₹)", en: "Monthly Investment (₹)", hl: "Maasik Nivesh (₹)" },
  years:      { hi: "कितने साल?", ta: "எத்தனை ஆண்டுகள்?", bn: "কত বছর?", mr: "किती वर्षे?", en: "How many years?", hl: "Kitne saal?" },
  yr:         { hi: "साल", ta: "ஆண்டு", bn: "বছর", mr: "वर्ष", en: "yr", hl: "saal" },
  calculate:  { hi: "हिसाब लगाओ →", ta: "கணக்கிடு →", bn: "হিসাব করুন →", mr: "हिशोब काढा →", en: "Calculate →", hl: "Hisab lagao →" },
  invested:   { hi: "कुल जमा", ta: "மொத்த முதலீடு", bn: "মোট জমা", mr: "एकूण गुंतवणूक", en: "Total Invested", hl: "Kul Jama" },
  returns:    { hi: "कुल ब्याज", ta: "மொத்த வட்டி", bn: "মোট সুদ", mr: "एकूण व्याज", en: "Total Interest", hl: "Kul Byaj" },
  total:      { hi: "कुल रकम", ta: "மொத்த தொகை", bn: "মোট পরিমাণ", mr: "एकूण रक्कम", en: "Total Amount", hl: "Kul Rashi" },
  disclaimer: { hi: "यह अनुमानित है — असल मुनाफा अलग हो सकता है", ta: "இது தோராயமானது — உண்மையான வருமானம் மாறுபடலாம்", bn: "এটি আনুমানিক — প্রকৃত রিটার্ন আলাদা হতে পারে", mr: "हे अंदाजे आहे — प्रत्यक्ष परतावा वेगळा असू शकतो", en: "Estimated only — actual returns may vary", hl: "Sirf andaza hai — asli return alag ho sakta hai" },
  market:     { hi: "बाज़ार पर निर्भर", ta: "சந்தையை சார்ந்தது", bn: "বাজারের উপর নির্ভরশীল", mr: "बाजारावर अवलंबून", en: "Market dependent", hl: "Market par nirbhar" },
  rate:       { hi: "ब्याज दर: लगभग", ta: "வட்டி விகிதம்: சுமார்", bn: "হার: প্রায়", mr: "दर: साधारण", en: "Rate: approx", hl: "Rate: lagbhag" },
  yearly:     { hi: "सालाना", ta: "ஆண்டு", bn: "বার্ষিক", mr: "वार्षिक", en: "yearly", hl: "saalana" },
  yr1:        { hi: "1 साल", ta: "1 ஆண்டு", bn: "১ বছর", mr: "1 वर्ष", en: "1 yr", hl: "1 saal" },
  yr15:       { hi: "15 साल", ta: "15 ஆண்டு", bn: "১৫ বছর", mr: "15 वर्षे", en: "15 yrs", hl: "15 saal" },
  yr30:       { hi: "30 साल", ta: "30 ஆண்டு", bn: "৩০ বছর", mr: "30 वर्षे", en: "30 yrs", hl: "30 saal" },
  deposit:    { hi: "🟢 जमा:", ta: "🟢 முதலீடு:", bn: "🟢 জমা:", mr: "🟢 गुंतवणूक:", en: "🟢 Invested:", hl: "🟢 Jama:" },
  interest:   { hi: "📈 ब्याज:", ta: "📈 வட்டி:", bn: "📈 সুদ:", mr: "📈 व्याज:", en: "📈 Interest:", hl: "📈 Byaj:" },
};

const INFLATION_RATE = 0.05; // 5% — RBI medium-term target average

const PLANS = [
  { key: "unity",    label: "Unity FD",    rate: 9.0,  safe: true,  tag: "best",   tagEn: "🏆 Blostem Partner · Highest rate",  tagHi: "🏆 सबसे ज़्यादा ब्याज — ब्लॉस्टम" },
  { key: "suryoday", label: "Suryoday FD", rate: 8.5,  safe: true,  tag: "shield", tagEn: "🛡 Blostem Partner · DICGC insured",  tagHi: "🛡 Blostem Partner · DICGC insured" },
  { key: "fd",       label: "SBI FD",      rate: 7.0,  safe: true,  tag: "shield", tagEn: "🛡 Safe option",                     tagHi: "🛡 सुरक्षित विकल्प" },
  { key: "ppf",      label: "PPF",         rate: 7.1,  safe: true,  tag: "govt",   tagEn: "🏛️ Tax-free · Govt backed",          tagHi: "🏛️ टैक्स फ्री · सरकारी" },
  { key: "rd",       label: "Post Office RD", rate: 6.7, safe: true, tag: "shield", tagEn: "🛡 Safe · Start ₹100/month",         tagHi: "🛡 सुरक्षित · ₹100 से शुरू" },
  { key: "sip",      label: "SIP",         rate: 12.0, safe: false, tag: "risky",  tagEn: "⚠️ High return, market risk",         tagHi: "⚠️ जोखिम — पर ज़्यादा मुनाफा" },
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

    // Comparison: Savings A/c vs SBI FD vs Unity (Blostem) vs SIP
    const calcTotal = (rate, key) => {
      if (key === "ppf") { let b=0; for(let y=0;y<years;y++) b=(b+monthly*12)*(1+rate/100); return Math.round(b); }
      const rr = rate/100/12;
      return Math.round(rr===0 ? invested : monthly*((Math.pow(1+rr,n)-1)/rr)*(1+rr));
    };
    const comparison = [
      { label: "Savings A/c", rate: 3.5,  color: "#aaa",     key: "savings",  total: calcTotal(3.5,  "savings") },
      { label: "SBI FD",      rate: 7.0,  color: "#1565c0",  key: "fd",       total: calcTotal(7.0,  "fd") },
      { label: "Unity FD 🏆", rate: 9.0,  color: "#1a6b3c",  key: "unity",    total: calcTotal(9.0,  "unity") },
      { label: "SIP (est.)",  rate: 12.0, color: "#e65100",  key: "sip",      total: calcTotal(12.0, "sip") },
    ];
    const maxTotal = Math.max(...comparison.map(c => c.total));

    setResult({
      invested: Math.round(invested),
      interest: Math.round(total - invested),
      total: Math.round(total),
      realValue: Math.round(Math.round(total) / Math.pow(1 + INFLATION_RATE, years)),
      comparison, maxTotal
    });
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
          {PLANS.map(p => {
            const tagColor = p.tag === "best" ? "#1a6b3c" : p.tag === "shield" ? "#1565c0" : "#e65100";
            const tagBg    = p.tag === "best" ? "#e8f5e9"  : p.tag === "shield" ? "#e3f2fd"  : "#fff3e0";
            const tagText  = (lc === "en" || lc === "hl") ? p.tagEn : p.tagHi;
            return (
              <div key={p.key} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                <button onClick={() => { setPlan(p); setResult(null); }} style={{
                  padding: "7px 16px", borderRadius: 99,
                  border: plan.key === p.key ? "2px solid #1a6b3c" : "1.5px solid #ddd",
                  background: plan.key === p.key ? "#e8f5e9" : "#fff",
                  color: plan.key === p.key ? "#1a6b3c" : "#555",
                  fontWeight: plan.key === p.key ? 700 : 400,
                  cursor: "pointer", fontSize: 14, fontFamily: "inherit",
                }}>
                  {p.label} ({p.rate}%)
                </button>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                  background: plan.key === p.key ? tagBg : "#f5f5f5",
                  color: plan.key === p.key ? tagColor : "#bbb",
                  border: `1px solid ${plan.key === p.key ? tagColor + "44" : "#eee"}`,
                  transition: "all 0.2s",
                }}>
                  {tagText}
                </span>
              </div>
            );
          })}
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
      {result && (() => {
        const growthPct = Math.round((result.interest / result.invested) * 100);
        return (
          <div className="dash-card" style={{ borderTop: "3px solid #1a6b3c" }}>
            {/* Smart Tag badge */}
            {(() => {
              const tagColor = plan.tag === "best" ? "#1a6b3c" : plan.tag === "shield" ? "#1565c0" : "#e65100";
              const tagBg    = plan.tag === "best" ? "#e8f5e9"  : plan.tag === "shield" ? "#e3f2fd"  : "#fff3e0";
              const tagText  = lc === "en" ? plan.tagEn : plan.tagHi;
              return (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 800, padding: "4px 12px", borderRadius: 99,
                    background: tagBg, color: tagColor,
                    border: `1.5px solid ${tagColor}44`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)"
                  }}>
                    {tagText}
                  </span>
                </div>
              );
            })()}
            {/* Emotional WOW header */}
            <div style={{ background: "linear-gradient(135deg,#1a6b3c,#0f4a28)", borderRadius: 16, padding: "18px 16px", marginBottom: 16, color: "white", textAlign: "center" }}>
              <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>
                🔥 {lc==="hi"?"आपने जमा किया:": lc==="ta"?"முதலீடு:": lc==="bn"?"বিনিয়োগ:": lc==="mr"?"गुंतवणूक:": "You invested:"} <strong>{fmt(result.invested)}</strong>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>
                💰 {fmt(result.total)}
              </div>
              <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 10 }}>
                {lc==="hi"?"बिना मेहनत के कमाया:": lc==="ta"?"உழைக்காமல் சம்பாதித்தது:": lc==="bn"?"বিনা প্রচেষ্টায় উপার্জন:": lc==="mr"?"प्रयत्नाशिवाय कमावले:": "You earned without effort:"} <strong style={{color:"#a5d6a7"}}>{fmt(result.interest)}</strong>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, background: "rgba(255,255,255,0.2)", borderRadius: 99, padding: "4px 12px", fontWeight: 700 }}>
                  📈 {growthPct}% {lc==="hi"?"की वृद्धि": lc==="ta"?"வளர்ச்சி": lc==="bn"?"বৃদ্ধি": lc==="mr"?"वाढ": "growth"}
                </span>
                <span style={{ fontSize: 11, background: "rgba(255,255,255,0.2)", borderRadius: 99, padding: "4px 12px", fontWeight: 700 }}>
                  🏦 {lc==="hi"?"बचत खाते में रखते → ₹0 अतिरिक्त": lc==="ta"?"Savings account-ல் → ₹0 extra": lc==="bn"?"Savings account-এ → ₹0 extra": lc==="mr"?"Savings account मध्ये → ₹0 extra": "In savings account → ₹0 extra"}
                </span>
              </div>
            </div>

            <div className="dash-stat-row">
              <div className="dash-stat">
                <div className="dash-stat-value" style={{ fontSize: 14 }}>{fmt(result.invested)}</div>
                <div className="dash-stat-label">{CALC_TEXT.invested[lc]}</div>
              </div>
              <div className="dash-stat">
                <div className="dash-stat-value" style={{ fontSize: 14, color: "#2e7d32" }}>{fmt(result.interest)}</div>
                <div className="dash-stat-label">{CALC_TEXT.returns[lc]}</div>
              </div>
              <div className="dash-stat" style={{ background: "#e8f5e9" }}>
                <div className="dash-stat-value" style={{ fontSize: 14 }}>{fmt(result.total)}</div>
                <div className="dash-stat-label">{CALC_TEXT.total[lc]}</div>
              </div>
            </div>

            {/* Inflation Impact — WOW factor */}
            <div style={{
              marginTop: 14, borderRadius: 14, padding: "12px 16px",
              background: "linear-gradient(135deg,#fff8e1,#fff3e0)",
              border: "1.5px solid #ffcc80",
              display: "flex", flexDirection: "column", gap: 6
            }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#e65100", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                💸 {lc === "hi" ? "महंगाई का असर (5% सालाना, RBI औसत)" : lc === "en" ? "Inflation Impact (5% yearly, RBI avg)" : lc === "ta" ? "பணவீக்க தாக்கம் (5% ஆண்டு)" : lc === "bn" ? "মূল্যস্ফীতির প্রভাব (৫% বার্ষিক)" : "महागाईचा परिणाम (5% वार्षिक)"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#1a6b3c" }}>{fmt(result.total)}</div>
                  <div style={{ fontSize: 10, color: "#888" }}>{lc === "hi" ? "मिलेगा (अंकों में)" : lc === "en" ? "Nominal value" : lc === "ta" ? "பெறுவது" : lc === "bn" ? "পাবেন" : "मिळेल"}</div>
                </div>
                <div style={{ fontSize: 20, color: "#ffb74d", fontWeight: 900 }}>→</div>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#e65100" }}>{fmt(result.realValue)}</div>
                  <div style={{ fontSize: 10, color: "#888" }}>{lc === "hi" ? "असली मूल्य (आज के अनुसार)" : lc === "en" ? "Real value today" : lc === "ta" ? "உண்மை மதிப்பு" : lc === "bn" ? "প্রকৃত মূল্য" : "खरी किंमत"}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#bf6b00", fontStyle: "italic", textAlign: "center" }}>
                {lc === "hi"
                  ? `महंगाई से खरीदने की ताकत कम होगी — गणना: maturity ÷ (1.05)^${years}`
                  : lc === "en"
                  ? `Inflation reduces future purchasing power — formula: maturity ÷ (1.05)^${years} yrs`
                  : lc === "ta"
                  ? `பணவீக்கம் எதிர்கால வாங்கும் சக்தியை குறைக்கும்`
                  : lc === "bn"
                  ? `মূল্যস্ফীতি ভবিষ্যৎ ক্রয়ক্ষমতা কমায়`
                  : `महागाई भविष्यातील क्रयशक्ती कमी करते`
                }
              </div>
            </div>

            {/* Bar */}
            <div style={{ marginTop: 16 }}>
              <div style={{ background: "#f0f0f0", borderRadius: 99, height: 18, overflow: "hidden" }}>
                <div style={{ width: `${Math.min((result.invested / result.total) * 100, 100)}%`, height: "100%", background: "linear-gradient(90deg,#a5d6a7,#1a6b3c)", borderRadius: 99, transition: "width 0.8s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginTop: 6 }}>
                <span>{CALC_TEXT.deposit[lc]} {fmt(result.invested)}</span>
                <span>{CALC_TEXT.interest[lc]} {fmt(result.interest)}</span>
              </div>
            </div>

            <div className="dash-disclaimer" style={{ marginTop: 14 }}>
              ⚠️ {CALC_TEXT.disclaimer[lc]}
            </div>

            {/* Plan Comparison — with insight text */}
            {result.comparison && (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#555", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  📊 {lc === "hi" ? "सभी विकल्पों की तुलना" : lc === "ta" ? "அனைத்து விருப்பங்கள் ஒப்பீடு" : lc === "bn" ? "সব বিকল্পের তুলনা" : lc === "mr" ? "सर्व पर्यायांची तुलना" : "Compare all options"}
                </div>
                {result.comparison.map((c) => {
                  const pct = Math.round((c.total / result.maxTotal) * 100);
                  const isSelected = c.key === plan.key;
                  const insights = {
                    savings: { hi: "बहुत कम फायदा — पैसा घटता है", ta: "மிகவும் குறைவு — பணம் குறைகிறது", bn: "খুব কম লাভ — টাকা কমে", mr: "खूप कमी फायदा — पैसे घटतात", en: "Very low — money loses value" },
                    fd:      { hi: "सुरक्षित ✔ — निश्चित मुनाफा, कोई जोखिम नहीं", ta: "Safe ✔ — நிலையான வருமானம்", bn: "Safe ✔ — Fixed return, ঝুঁকি নেই", mr: "Safe ✔ — Fixed return, जोखीम नाही", en: "सुरक्षित ✔ — निश्चित मुनाफा, कोई जोखिम नहीं" },
                    ppf:     { hi: "सुरक्षित + कर-मुक्त ✔ — लंबे समय के लिए सबसे अच्छा", ta: "Safe + Tax-free ✔ — நீண்டகால சிறந்தது", bn: "Safe + Tax-free ✔ — দীর্ঘমেয়াদে সেরা", mr: "Safe + Tax-free ✔ — दीर्घकालीन सर्वोत्तम", en: "Safe + Tax-free ✔ — Best long-term" },
                    sip:     { hi: "⚠ जोखिम भरा — लेकिन सबसे ज़्यादा मुनाफा", ta: "⚠ Risky — ஆனால் அதிக வருமானம்", bn: "⚠ Risky — কিন্তু সর্বোচ্চ রিটার্ন", mr: "⚠ Risky — पण सर्वाधिक परतावा", en: "⚠ Risky — but highest return" },
                  };
                  const insightText = insights[c.key]?.[["ta","bn","mr"].includes(lc) ? lc : lc === "en" ? "en" : "hi"] || "";
                  return (
                    <div key={c.key} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, marginBottom: 3 }}>
                        <span style={{ fontWeight: isSelected ? 800 : 500, color: isSelected ? c.color : "#666" }}>
                          {c.label} (~{c.rate}%) {isSelected ? "✔" : ""}
                        </span>
                        <span style={{ fontWeight: 700, color: c.color }}>₹{c.total.toLocaleString("en-IN")}</span>
                      </div>
                      <div style={{ background: "#f0f0f0", borderRadius: 99, height: 10, overflow: "hidden", marginBottom: 3 }}>
                        <div style={{
                          width: `${pct}%`, height: "100%", background: c.color, borderRadius: 99,
                          transition: "width 0.8s ease", opacity: isSelected ? 1 : 0.55
                        }} />
                      </div>
                      <div style={{ fontSize: 10, color: isSelected ? c.color : "#aaa", fontWeight: isSelected ? 700 : 400 }}>
                        {insightText}
                      </div>
                    </div>
                  );
                })}
                <div style={{ fontSize: 10, color: "#aaa", marginTop: 6 }}>
                  {lc === "hi" ? "* व्यवस्थित निवेश (SIP) मुनाफा बाज़ार पर निर्भर — निश्चित नहीं" : lc === "ta" ? "* SIP returns சந்தையை சார்ந்தது, உத்தரவாதமில்லை" : lc === "bn" ? "* SIP returns বাজার নির্ভর, নিশ্চিত নয়" : lc === "mr" ? "* SIP returns बाजारावर अवलंबून — guaranteed नाही" : "* SIP returns are market-linked, not guaranteed"}
                </div>

                {/* Mini Growth Chart — bar per year (sampled) */}
                <div style={{ marginTop: 18, background: "#f8fdf9", borderRadius: 14, padding: "14px 12px", border: "1px solid #d0ead8" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#1a6b3c", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    📈 {lc === "hi" ? "साल-दर-साल बढ़त" : lc === "ta" ? "ஆண்டு வாரியான வளர்ச்சி" : lc === "bn" ? "বছর-ওয়ারি বৃদ্ধি" : lc === "mr" ? "वर्षनिहाय वाढ" : "Year-by-Year Growth"}
                  </div>
                  {(() => {
                    const r = plan.rate / 100 / 12;
                    const chartYears = Math.min(years, 10);
                    const dataPoints = Array.from({ length: chartYears }, (_, i) => {
                      const n = (i + 1) * 12;
                      const invested = monthly * n;
                      let total;
                      if (plan.key === "ppf") {
                        let bal = 0;
                        for (let y = 0; y <= i; y++) bal = (bal + monthly * 12) * (1 + plan.rate / 100);
                        total = bal;
                      } else {
                        total = r === 0 ? invested : monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
                      }
                      return { year: i + 1, invested: Math.round(invested), total: Math.round(total) };
                    });
                    const maxVal = Math.max(...dataPoints.map(d => d.total));
                    const barW = Math.max(18, Math.floor(220 / chartYears));
                    return (
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 80, paddingBottom: 20, position: "relative", overflowX: "auto" }}>
                        {dataPoints.map((d, i) => {
                          const totalH = Math.round((d.total / maxVal) * 70);
                          const investH = Math.round((d.invested / maxVal) * 70);
                          return (
                            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: barW }}>
                              <div style={{ display: "flex", alignItems: "flex-end", height: 70, gap: 1 }}>
                                <div style={{ width: barW * 0.45, height: investH, background: "#a5d6a7", borderRadius: "3px 3px 0 0" }} title={`Invested: ₹${d.invested.toLocaleString("en-IN")}`} />
                                <div style={{ width: barW * 0.45, height: totalH, background: "#1a6b3c", borderRadius: "3px 3px 0 0", opacity: 0.9 }} title={`Total: ₹${d.total.toLocaleString("en-IN")}`} />
                              </div>
                              <div style={{ fontSize: 9, color: "#888", marginTop: 2 }}>Y{d.year}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                  <div style={{ display: "flex", gap: 12, fontSize: 10, color: "#777" }}>
                    <span><span style={{ display: "inline-block", width: 8, height: 8, background: "#a5d6a7", borderRadius: 2, marginRight: 3 }} />{lc === "hi" ? "जमा" : lc === "ta" ? "முதலீடு" : lc === "bn" ? "বিনিয়োগ" : lc === "mr" ? "गुंतवणूक" : "Invested"}</span>
                    <span><span style={{ display: "inline-block", width: 8, height: 8, background: "#1a6b3c", borderRadius: 2, marginRight: 3 }} />{lc === "hi" ? "कुल रकम" : lc === "ta" ? "மொத்தம்" : lc === "bn" ? "মোট" : lc === "mr" ? "एकूण" : "Total"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}