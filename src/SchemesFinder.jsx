import { useState } from "react";
import { askAI } from "./api/groq";

const ALL_SCHEMES = [
  {
    id: "pmjdy", icon: "🏦", color: "#1a6b3c",
    name: { hi: "प्रधानमंत्री जन धन योजना", ta: "பிரதமர் ஜன் தன் திட்டம்", bn: "প্রধানমন্ত্রী জন ধন যোজনা", mr: "प्रधानमंत्री जन धन योजना", en: "PM Jan Dhan Yojana" },
    desc: { hi: "ज़ीरो बैलेंस बैंक खाता + ₹2 लाख बीमा + RuPay कार्ड मुफ्त।", ta: "ஜீரோ பேலன்ஸ் வங்கி கணக்கு + ₹2 லட்சம் காப்பீடு + RuPay கார்டு இலவசம்.", bn: "জিরো ব্যালেন্স ব্যাংক অ্যাকাউন্ট + ₹2 লাখ বীমা + RuPay কার্ড বিনামূল্যে।", mr: "झिरो बॅलन्स बँक खाते + ₹2 लाख विमा + RuPay कार्ड मोफत.", en: "Zero balance bank account + ₹2 lakh insurance + free RuPay card." },
    goals: ["Keep money safe"], income: ["Less than ₹500", "₹500-2,000"],
    tag: { hi: "सबके लिए", ta: "அனைவருக்கும்", bn: "সবার জন্য", mr: "सर्वांसाठी", en: "For Everyone" },
    category: "banking",
  },
  {
    id: "pmjjby", icon: "🛡️", color: "#1565c0",
    name: { hi: "प्रधानमंत्री जीवन ज्योति बीमा", ta: "பிரதமர் ஜீவன் ஜ்யோதி காப்பீடு", bn: "প্রধানমন্ত্রী জীবন জ্যোতি বীমা", mr: "प्रधानमंत्री जीवन ज्योती विमा", en: "PM Jeevan Jyoti Bima Yojana" },
    desc: { hi: "सिर्फ ₹436/साल में ₹2 लाख जीवन बीमा।", ta: "வெறும் ₹436/ஆண்டு-ல் ₹2 லட்சம் ஆயுள் காப்பீடு.", bn: "মাত্র ₹436/বছরে ₹2 লাখ জীবন বীমা।", mr: "फक्त ₹436/वर्षात ₹2 लाख जीवन विमा.", en: "₹2 lakh life insurance for just ₹436/year." },
    goals: ["Keep money safe", "Children's education", "Build a home", "Retirement"],
    income: ["Less than ₹500", "₹500-2,000", "₹2,000-5,000"],
    tag: { hi: "सस्ता बीमा", ta: "மலிவு காப்பீடு", bn: "সস্তা বীমা", mr: "स्वस्त विमा", en: "Cheap Insurance" },
    category: "insurance",
  },
  {
    id: "pmsby", icon: "⚕️", color: "#6a1b9a",
    name: { hi: "प्रधानमंत्री सुरक्षा बीमा योजना", ta: "பிரதமர் சுரட்சா பீமா", bn: "প্রধানমন্ত্রী সুরক্ষা বীমা যোজনা", mr: "प्रधानमंत्री सुरक्षा विमा योजना", en: "PM Suraksha Bima Yojana" },
    desc: { hi: "सिर्फ ₹20/साल में ₹2 लाख दुर्घटना बीमा।", ta: "வெறும் ₹20/ஆண்டு-ல் ₹2 லட்சம் விபத்து காப்பீடு.", bn: "মাত্র ₹20/বছরে ₹2 লাখ দুর্ঘটনা বীমা।", mr: "फक्त ₹20/वर्षात ₹2 लाख अपघात विमा.", en: "₹2 lakh accident insurance for just ₹20/year." },
    goals: ["Keep money safe", "Children's education"],
    income: ["Less than ₹500", "₹500-2,000", "₹2,000-5,000"],
    tag: { hi: "₹20/साल", ta: "₹20/ஆண்டு", bn: "₹20/বছর", mr: "₹20/वर्ष", en: "₹20/year" },
    category: "insurance",
  },
  {
    id: "pmay", icon: "🏠", color: "#e65100",
    name: { hi: "प्रधानमंत्री आवास योजना", ta: "பிரதமர் ஆவாஸ் திட்டம்", bn: "প্রধানমন্ত্রী আবাস যোজনা", mr: "प्रधानमंत्री आवास योजना", en: "PM Awas Yojana" },
    desc: { hi: "घर बनाने के लिए सरकारी सब्सिडी — शहरी और ग्रामीण दोनों।", ta: "வீடு கட்ட அரசு மானியம் — நகர் மற்றும் கிராமம் இரண்டும்.", bn: "বাড়ি বানাতে সরকারি ভর্তুকি — শহর ও গ্রাম উভয়ের জন্য।", mr: "घर बांधण्यासाठी सरकारी अनुदान — शहरी आणि ग्रामीण.", en: "Government subsidy for house construction — urban and rural both." },
    goals: ["Build a home"],
    income: ["Less than ₹500", "₹500-2,000", "₹2,000-5,000", "₹5,000+"],
    tag: { hi: "घर के लिए", ta: "வீட்டிற்கு", bn: "বাড়ির জন্য", mr: "घरासाठी", en: "For Home" },
    category: "housing",
  },
  {
    id: "ssy", icon: "👧", color: "#c2185b",
    name: { hi: "सुकन्या समृद्धि योजना", ta: "சுகன்யா சம்ருத்தி திட்டம்", bn: "সুকন্যা সমৃদ্ধি যোজনা", mr: "सुकन्या समृद्धी योजना", en: "Sukanya Samridhi Yojana" },
    desc: { hi: "बेटी के लिए सबसे अच्छा निवेश। 8.2% ब्याज, टैक्स फ्री। ₹250 से शुरू।", ta: "பெண் குழந்தைக்கு சிறந்த முதலீடு. 8.2% வட்டி, வரி இல்லாதது. ₹250 முதல்.", bn: "মেয়ের জন্য সেরা বিনিয়োগ। 8.2% সুদ, ট্যাক্স ফ্রি। ₹250 থেকে শুরু।", mr: "मुलीसाठी सर्वोत्तम गुंतवणूक. 8.2% व्याज, करमुक्त. ₹250 पासून.", en: "Best investment for girl child. 8.2% interest, tax free. Start from ₹250." },
    goals: ["Children's education"],
    income: ["Less than ₹500", "₹500-2,000", "₹2,000-5,000", "₹5,000+"],
    tag: { hi: "बेटी के लिए", ta: "பெண்ணுக்காக", bn: "মেয়ের জন্য", mr: "मुलीसाठी", en: "For Girl Child" },
    category: "women",
  },
  {
    id: "nps", icon: "🌅", color: "#f57f17",
    name: { hi: "राष्ट्रीय पेंशन योजना (NPS)", ta: "தேசிய ஓய்வூதிய திட்டம்", bn: "জাতীয় পেনশন যোজনা", mr: "राष्ट्रीय पेन्शन योजना", en: "National Pension System (NPS)" },
    desc: { hi: "रिटायरमेंट के लिए बेस्ट। ₹1000/माह से शुरू + टैक्स में छूट।", ta: "ஓய்வூதியத்திற்கு சிறந்தது. ₹1000/மாதம் + வரி சலுகை.", bn: "অবসরের জন্য সেরা। ₹1000/মাস থেকে + ট্যাক্স সুবিধা।", mr: "निवृत्तीसाठी सर्वोत्तम. ₹1000/महिना + कर सूट.", en: "Best for retirement. Start ₹1000/month + tax benefits." },
    goals: ["Retirement"],
    income: ["₹2,000-5,000", "₹5,000+"],
    tag: { hi: "रिटायरमेंट", ta: "ஓய்வூதியம்", bn: "অবসর", mr: "निवृत्ती", en: "Retirement" },
    category: "pension",
  },
  {
    id: "apyvaj", icon: "👴", color: "#00695c",
    name: { hi: "अटल पेंशन योजना", ta: "அடல் ஓய்வூதிய திட்டம்", bn: "অটল পেনশন যোজনা", mr: "अटल पेन्शन योजना", en: "Atal Pension Yojana" },
    desc: { hi: "₹42-₹210/माह देकर रिटायरमेंट पर ₹1,000-₹5,000 गारंटीड पेंशन।", ta: "₹42-₹210/மாதம் செலுத்தி ₹1,000-₹5,000 உத்தரவாதமான ஓய்வூதியம்.", bn: "₹42-₹210/মাস দিয়ে ₹1,000-₹5,000 গ্যারান্টেড পেনশন।", mr: "₹42-₹210/महिना भरून ₹1,000-₹5,000 हमी पेन्शन.", en: "Pay ₹42-₹210/month to get ₹1,000-₹5,000 guaranteed pension on retirement." },
    goals: ["Retirement"],
    income: ["Less than ₹500", "₹500-2,000", "₹2,000-5,000"],
    tag: { hi: "गारंटीड पेंशन", ta: "உத்தரவாத ஓய்வூதியம்", bn: "গ্যারান্টেড পেনশন", mr: "हमी पेन्शन", en: "Guaranteed Pension" },
    category: "pension",
  },
  {
    id: "pmkisan", icon: "🌾", color: "#33691e",
    name: { hi: "PM किसान सम्मान निधि", ta: "PM கிசான் சம்மான் நிதி", bn: "PM কিষান সম্মান নিধি", mr: "PM किसान सन्मान निधी", en: "PM Kisan Samman Nidhi" },
    desc: { hi: "किसानों को सालाना ₹6,000 सीधे खाते में (₹2,000 x 3 किस्त)।", ta: "விவசாயிகளுக்கு ஆண்டுதோறும் ₹6,000 நேரடி வங்கி கணக்கில்.", bn: "কৃষকদের বার্ষিক ₹6,000 সরাসরি ব্যাংক অ্যাকাউন্টে।", mr: "शेतकऱ्यांना वार्षिक ₹6,000 थेट खात्यात.", en: "₹6,000/year directly to farmers' bank accounts (₹2,000 × 3 installments)." },
    goals: ["Keep money safe", "Build a home"],
    income: ["Less than ₹500", "₹500-2,000"],
    tag: { hi: "किसान के लिए", ta: "விவசாயிகளுக்கு", bn: "কৃষকের জন্য", mr: "शेतकऱ्यांसाठी", en: "For Farmers" },
    category: "farming",
  },
  {
    id: "scss", icon: "🏅", color: "#6a1b9a",
    name: { hi: "वरिष्ठ नागरिक बचत योजना", ta: "மூத்த குடிமக்கள் சேமிப்பு திட்டம்", bn: "সিনিয়র সিটিজেন সেভিংস স্কিম", mr: "ज्येष्ठ नागरिक बचत योजना", en: "Senior Citizen Savings Scheme (SCSS)" },
    desc: { hi: "60+ उम्र के लिए 8.2% ब्याज। ₹30 लाख तक निवेश। Tax benefit भी।", ta: "60+ வயதினருக்கு 8.2% வட்டி. ₹30 லட்சம் வரை முதலீடு.", bn: "60+ বয়সীদের জন্য 8.2% সুদ। ₹30 লাখ পর্যন্ত বিনিয়োগ।", mr: "60+ वयासाठी 8.2% व्याज. ₹30 लाखापर्यंत गुंतवणूक.", en: "8.2% interest for 60+ age. Invest up to ₹30 lakh. Tax benefits under 80C." },
    goals: ["Retirement", "Keep money safe"],
    income: ["₹2,000-5,000", "₹5,000+"],
    tag: { hi: "कर बचत", ta: "வரி சேமிப்பு", bn: "कर बचत", mr: "कर बचत", en: "Tax Saving" },
    category: "senior",
  },
  {
    id: "nsc", icon: "📜", color: "#1565c0",
    name: { hi: "राष्ट्रीय बचत पत्र (NSC)", ta: "தேசிய சேமிப்பு சான்றிதழ்", bn: "ন্যাশনাল সেভিংস সার্টিফিকেট", mr: "राष्ट्रीय बचत प्रमाणपत्र", en: "National Savings Certificate (NSC)" },
    desc: { hi: "7.7% ब्याज, 5 साल lock-in। ₹1000 से शुरू। Section 80C tax benefit। Post Office से मिलता है।", ta: "7.7% வட்டி, 5 ஆண்டு lock-in. ₹1000 முதல். 80C வரி சலுகை.", bn: "7.7% সুদ, 5 বছর lock-in। ₹1000 থেকে শুরু। 80C ট্যাক্স benefit।", mr: "7.7% व्याज, 5 वर्ष lock-in. ₹1000 पासून. 80C कर सूट.", en: "7.7% interest, 5-year lock-in. Start ₹1000. Section 80C tax benefit." },
    goals: ["Keep money safe", "Retirement"],
    income: ["₹500-2,000", "₹2,000-5,000", "₹5,000+"],
    tag: { hi: "कम जोखिम", ta: "குறைந்த ஆபத்து", bn: "कम जोखिम", mr: "कमी जोखीम", en: "कम जोखिम" },
    category: "tax",
  },
  {
    id: "kvp", icon: "💎", color: "#e65100",
    name: { hi: "किसान विकास पत्र (KVP)", ta: "கிசான் விகாஸ் பத்திரம்", bn: "কিষান বিকাশ পত্র", mr: "किसान विकास पत्र", en: "Kisan Vikas Patra (KVP)" },
    desc: { hi: "पैसा double होता है 115 महीनों में (7.5% ब्याज)। ₹1000 से शुरू।", ta: "115 மாதங்களில் பணம் இரட்டிப்பாகும் (7.5% வட்டி). ₹1000 முதல்.", bn: "115 মাসে টাকা double হয় (7.5% সুদ)। ₹1000 থেকে শুরু।", mr: "115 महिन्यांत पैसे दुप्पट (7.5% व्याज). ₹1000 पासून.", en: "Money doubles in 115 months (7.5% interest). Start ₹1000." },
    goals: ["Keep money safe", "Children's education"],
    income: ["₹500-2,000", "₹2,000-5,000", "₹5,000+"],
    tag: { hi: "पैसा double", ta: "பணம் இரட்டிப்பு", bn: "টাকা double", mr: "पैसे दुप्पट", en: "Money Doubles" },
    category: "tax",
  },
];

const CATEGORY_FILTERS = [
  { key: "matched", icon: "⭐", hi: "मेरे लिए", en: "For Me", ta: "என்னுக்கு", bn: "আমার জন্য", mr: "माझ्यासाठी", hl: "Mere Liye" },
  { key: "insurance", icon: "🛡️", hi: "बीमा", en: "Insurance", ta: "காப்பீடு", bn: "বীমা", mr: "विमा", hl: "Bima" },
  { key: "pension", icon: "🌅", hi: "पेंशन", en: "Pension", ta: "ஓய்வூதியம்", bn: "পেনশন", mr: "पेन्शन", hl: "Pension" },
  { key: "tax", icon: "📋", hi: "Tax बचत", en: "Tax Saving", ta: "வரி சேமிப்பு", bn: "Tax সাশ্রয়", mr: "कर बचत", hl: "Tax Bachao" },
  { key: "women", icon: "👧", hi: "महिला", en: "Women", ta: "பெண்கள்", bn: "মহিলা", mr: "महिला", hl: "Mahila" },
  { key: "senior", icon: "👴", hi: "वरिष्ठ", en: "Senior", ta: "மூத்தோர்", bn: "বয়স্ক", mr: "ज्येष्ठ", hl: "Buzurg" },
  { key: "farming", icon: "🌾", hi: "किसान", en: "Farmers", ta: "விவசாயிகள்", bn: "কৃষক", mr: "शेतकरी", hl: "Kisan" },
];

const APPLY_LINKS = {
  pmjdy: "https://pmjdy.gov.in", pmjjby: "https://jansuraksha.gov.in",
  pmsby: "https://jansuraksha.gov.in", pmay: "https://pmaymis.gov.in",
  ssy: "https://www.indiapost.gov.in", nps: "https://www.npscra.nsdl.co.in",
  apyvaj: "https://npscra.nsdl.co.in/atal-pension-yojana.php",
  pmkisan: "https://pmkisan.gov.in", scss: "https://www.indiapost.gov.in",
  nsc: "https://www.indiapost.gov.in", kvp: "https://www.indiapost.gov.in",
};

export default function SchemesFinder({ profile, lang }) {
  const lc = lang?.code || "hi";
  // For scheme name/desc/tag fields that don't have hl translations, fall back to en
  const slc = lc === "hl" ? "en" : lc;
  const [filter, setFilter]     = useState("matched");
  const [expanded, setExpanded] = useState({});
  const [aiReply, setAiReply]   = useState({});
  const [aiLoading, setAiLoading] = useState({});

  const matchedIds = ALL_SCHEMES
    .filter(s => s.goals.includes(profile.goal) || s.income.includes(profile.income))
    .map(s => s.id);

  const displayed = filter === "matched"
    ? ALL_SCHEMES.filter(s => matchedIds.includes(s.id))
    : ALL_SCHEMES.filter(s => s.category === filter);

  const toggleExpand = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const askAboutScheme = async (scheme) => {
    if (aiReply[scheme.id]) { setAiReply(p => ({ ...p, [scheme.id]: null })); return; }
    setAiLoading(p => ({ ...p, [scheme.id]: true }));
    const langName = { hi: "Hindi", ta: "Tamil", bn: "Bengali", mr: "Marathi", en: "English", hl: "Hinglish (Hindi written in English letters)" }[lc] || "English";
    const q = `Explain "${scheme.name.en}" government scheme in simple ${langName} in 3 short bullet points. Include how to apply and who is eligible. Be very simple for rural users.`;
    try {
      const reply = await askAI(q, lc, profile, []);
      setAiReply(p => ({ ...p, [scheme.id]: reply }));
    } catch {
      setAiReply(p => ({ ...p, [scheme.id]: lc === "hl" ? "Jaankari laane mein dikkat hui." : "जानकारी लाने में दिक्कत हुई।" }));
    } finally {
      setAiLoading(p => ({ ...p, [scheme.id]: false }));
    }
  };

  return (
    <div className="dashboard">
      {/* Single trust banner at top */}
      <div style={{ background: "#1a6b3c", color: "white", borderRadius: 14, padding: "10px 16px", display: "flex", gap: 8, alignItems: "center", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
        <span>🔒</span>
        <span>{lc==="hi"?"100% सरकारी योजनाएं — जांची और सुरक्षित":lc==="en"?"100% Govt backed — verified & safe":lc==="ta"?"100% அரசு திட்டங்கள் — நம்பகமான":lc==="bn"?"100% সরকারি — যাচাইকৃত":lc==="hl"?"100% Sarkaari yojanaen — jaanchi aur safe":"100% सरकारी — verified"}</span>
      </div>

      {/* Category filter pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "6px 0" }}>
        {CATEGORY_FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: "pointer",
            border: filter === f.key ? "2px solid #1a6b3c" : "1.5px solid #ddd",
            background: filter === f.key ? "#e8f5e9" : "#fff",
            color: filter === f.key ? "#1a6b3c" : "#666",
          }}>
            {f.icon} {f[lc] || f.en}
          </button>
        ))}
      </div>

      {displayed.length === 0 && (
        <div style={{ textAlign: "center", color: "#888", fontSize: 14, padding: 24 }}>
          {lc==="hi"?"इस श्रेणी में कोई योजना नहीं":lc==="en"?"No schemes in this category":lc==="hl"?"Is category mein koi yojana nahi":"No schemes found"}
        </div>
      )}

      {/* Scheme Cards — icon + 1-line facts, ONE CTA */}
      {displayed.map(scheme => {
        const isOpen = expanded[scheme.id];
        const isMatched = matchedIds.includes(scheme.id);

        // Extract key facts from desc as short icon chips
        const factChips = {
          pmjdy:  [["🏦","Zero balance"],["🛡️","₹2L insurance"],["💳","RuPay free"]],
          pmjjby: [["🛡️","₹2L cover"],["💰","₹436/yr"],["✅","Auto-debit"]],
          pmsby:  [["⚕️","₹2L accident"],["💰","₹20/yr"],["✅","Bank linked"]],
          pmay:   [["🏠","Govt subsidy"],["📋","Urban+Rural"],["💡","Apply online"]],
          ssy:    [["👧","Girl child"],["📈","~8.2% interest"],["🚫","Tax-free"]],
          nps:    [["🌅","Retirement"],["💰","₹1000/mo+"],["📋","80C benefit"]],
          apyvaj: [["👴","Guaranteed"],["💰","₹42-₹210/mo"],["🌅","₹1K-5K pension"]],
          pmkisan:[["🌾","Farmers only"],["💰","₹6000/yr"],["🏦","Direct to bank"]],
          scss:   [["🏅","60+ age"],["📈","~8.2% interest"],["💰","₹30L max"]],
          nsc:    [["📜","Post Office"],["📈","~7.7%"],["🔒","5yr lock-in"]],
          kvp:    [["💎","Money doubles"],["⏱","115 months"],["💰","₹1000 min"]],
        };
        const chips = factChips[scheme.id] || [];

        return (
          <div key={scheme.id} className="dash-card" style={{ borderLeft: `4px solid ${scheme.color}`, padding: 0, overflow: "hidden" }}>
            {/* Header — tap to expand */}
            <div onClick={() => toggleExpand(scheme.id)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer" }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{scheme.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: scheme.color, marginBottom: 4 }}>{scheme.name[slc] || scheme.name.en}</div>
                {/* Icon + 1-line fact chips */}
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                  {chips.map(([ic, txt], ci) => (
                    <span key={ci} style={{ background: scheme.color + "15", color: scheme.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, display: "flex", alignItems: "center", gap: 3 }}>
                      {ic} {txt}
                    </span>
                  ))}
                  {isMatched && <span style={{ background: "#1a6b3c", color: "white", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 99 }}>⭐ {lc==="hi"?"आपके लिए":lc==="en"||lc==="hl"?"For You":"✔"}</span>}
                </div>
              </div>
              <span style={{ fontSize: 16, color: "#aaa", flexShrink: 0, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none" }}>▼</span>
            </div>

            {/* Expanded — short desc + single primary CTA */}
            {isOpen && (
              <div style={{ padding: "0 16px 16px" }}>
                <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 12, paddingTop: 2 }}>{scheme.desc[slc] || scheme.desc.en}</div>

                {aiLoading[scheme.id] && (
                  <div style={{ fontSize: 13, color: "#888", display: "flex", gap: 4, alignItems: "center", marginBottom: 10 }}>
                    <span className="dot-anim">●</span><span className="dot-anim" style={{animationDelay:"0.2s"}}>●</span><span className="dot-anim" style={{animationDelay:"0.4s"}}>●</span>
                    <span style={{ marginLeft: 6 }}>{lc==="hi"?"AI soch raha hai...":lc==="hl"?"AI soch raha hai...":lc==="en"?"AI is thinking...":"Loading..."}</span>
                  </div>
                )}
                {aiReply[scheme.id] && (
                  <div style={{ background: "#f0faf3", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "#222", lineHeight: 1.7, marginBottom: 12 }}>
                    🤖 {aiReply[scheme.id]}
                  </div>
                )}

                {/* ONE primary CTA — Apply Now */}
                <a href={APPLY_LINKS[scheme.id]} target="_blank" rel="noreferrer" style={{
                  display: "block", textAlign: "center",
                  background: `linear-gradient(135deg,${scheme.color},${scheme.color}cc)`,
                  color: "white", border: "none", borderRadius: 12,
                  padding: "12px 16px", fontSize: 14, fontWeight: 800,
                  cursor: "pointer", textDecoration: "none",
                  boxShadow: `0 4px 14px ${scheme.color}40`,
                  marginBottom: 8,
                }}>
                  {lc==="hi"?"आवेदन करें →":lc==="en"?"Apply Now →":lc==="hl"?"Apply Karo →":lc==="ta"?"விண்ணப்பிக்க →":lc==="bn"?"আবেদন করুন →":"अर्ज करा →"}
                </a>
                {/* Secondary — AI explain (text link style) */}
                <button onClick={() => askAboutScheme(scheme)} style={{
                  display: "block", width: "100%", background: "transparent",
                  border: "none", color: scheme.color, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", padding: "4px 0", textAlign: "center", fontFamily: "inherit",
                }}>
                  {aiReply[scheme.id] ? "❌ " + (lc==="hi"?"बंद करें":lc==="hl"?"Band karo":"Close") : `🤖 ${lc==="hi"?"AI से विस्तार में जानें":lc==="en"||lc==="hl"?"Learn more with AI":"AI se janein"}`}
                </button>
              </div>
            )}
          </div>
        );
      })}

      <div className="dash-disclaimer" style={{ marginTop: 8 }}>
        ⚠️ {lc==="hi"?"योजनाओं की जानकारी सरकारी वेबसाइट पर जाँचें।":lc==="en"?"Verify scheme details from official government website.":lc==="hl"?"Yojanaon ki jaankari sarkaar ki website par check karo.":"जानकारी सरकारी वेबसाइट पर verify करें।"}
      </div>
    </div>
  );
}