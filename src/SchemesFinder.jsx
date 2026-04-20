import { useState, useEffect } from "react";
import { askAI } from "./api/groq";

// ── All government schemes data ────────────────────────────────────────────
const ALL_SCHEMES = [
  {
    id: "pmjdy",
    icon: "🏦",
    color: "#1a6b3c",
    name: { hi: "प्रधानमंत्री जन धन योजना", ta: "பிரதமர் ஜன் தன் திட்டம்", bn: "প্রধানমন্ত্রী জন ধন যোজনা", mr: "प्रधानमंत्री जन धन योजना", en: "PM Jan Dhan Yojana" },
    desc: { hi: "ज़ीरो बैलेंस बैंक खाता + ₹2 लाख बीमा + RuPay कार्ड मुफ्त।", ta: "ஜீரோ பேலன்ஸ் வங்கி கணக்கு + ₹2 லட்சம் காப்பீடு + RuPay கார்டு இலவசம்.", bn: "জিরো ব্যালেন্স ব্যাংক অ্যাকাউন্ট + ₹2 লাখ বীমা + RuPay কার্ড বিনামূল্যে।", mr: "झिरो बॅलन्स बँक खाते + ₹2 लाख विमा + RuPay कार्ड मोफत.", en: "Zero balance bank account + ₹2 lakh insurance + free RuPay card." },
    goals: ["Keep money safe"],
    income: ["Less than ₹500", "₹500-2,000"],
    tag: { hi: "सबके लिए", ta: "அனைவருக்கும்", bn: "সবার জন্য", mr: "सर्वांसाठी", en: "For Everyone" },
  },
  {
    id: "pmjjby",
    icon: "🛡️",
    color: "#1565c0",
    name: { hi: "प्रधानमंत्री जीवन ज्योति बीमा", ta: "பிரதமர் ஜீவன் ஜ்யோதி காப்பீடு", bn: "প্রধানমন্ত্রী জীবন জ্যোতি বীমা", mr: "प्रधानमंत्री जीवन ज्योती विमा", en: "PM Jeevan Jyoti Bima Yojana" },
    desc: { hi: "सिर्फ ₹436/साल में ₹2 लाख जीवन बीमा। बैंक खाते से automatic deduct।", ta: "வெறும் ₹436/ஆண்டு-ல் ₹2 லட்சம் ஆயுள் காப்பீடு.", bn: "মাত্র ₹436/বছরে ₹2 লাখ জীবন বীমা।", mr: "फक्त ₹436/वर्षात ₹2 लाख जीवन विमा.", en: "₹2 lakh life insurance for just ₹436/year. Auto-deducted from bank." },
    goals: ["Keep money safe", "Children's education", "Build a home", "Retirement"],
    income: ["Less than ₹500", "₹500-2,000", "₹2,000-5,000"],
    tag: { hi: "सस्ता बीमा", ta: "மலிவு காப்பீடு", bn: "সস্তা বীমা", mr: "स्वस्त विमा", en: "Cheap Insurance" },
  },
  {
    id: "pmsby",
    icon: "⚕️",
    color: "#6a1b9a",
    name: { hi: "प्रधानमंत्री सुरक्षा बीमा योजना", ta: "பிரதமர் சுரட்சா பீமா", bn: "প্রধানমন্ত্রী সুরক্ষা বীমা যোজনা", mr: "प्रधानमंत्री सुरक्षा विमा योजना", en: "PM Suraksha Bima Yojana" },
    desc: { hi: "सिर्फ ₹20/साल में ₹2 लाख दुर्घटना बीमा।", ta: "வெறும் ₹20/ஆண்டு-ல் ₹2 லட்சம் விபத்து காப்பீடு.", bn: "মাত্র ₹20/বছরে ₹2 লাখ দুর্ঘটনা বীমা।", mr: "फक्त ₹20/वर्षात ₹2 लाख अपघात विमा.", en: "₹2 lakh accident insurance for just ₹20/year." },
    goals: ["Keep money safe", "Children's education"],
    income: ["Less than ₹500", "₹500-2,000", "₹2,000-5,000"],
    tag: { hi: "₹20/साल", ta: "₹20/ஆண்டு", bn: "₹20/বছর", mr: "₹20/वर्ष", en: "₹20/year" },
  },
  {
    id: "pmay",
    icon: "🏠",
    color: "#e65100",
    name: { hi: "प्रधानमंत्री आवास योजना", ta: "பிரதமர் ஆவாஸ் திட்டம்", bn: "প্রধানমন্ত্রী আবাস যোজনা", mr: "प्रधानमंत्री आवास योजना", en: "PM Awas Yojana" },
    desc: { hi: "घर बनाने के लिए सरकारी सब्सिडी — शहरी और ग्रामीण दोनों।", ta: "வீடு கட்ட அரசு மானியம் — நகர் மற்றும் கிராமம் இரண்டும்.", bn: "বাড়ি বানাতে সরকারি ভর্তুকি — শহর ও গ্রাম উভয়ের জন্য।", mr: "घर बांधण्यासाठी सरकारी अनुदान — शहरी आणि ग्रामीण.", en: "Government subsidy for house construction — urban and rural both." },
    goals: ["Build a home"],
    income: ["Less than ₹500", "₹500-2,000", "₹2,000-5,000", "₹5,000+"],
    tag: { hi: "घर के लिए", ta: "வீட்டிற்கு", bn: "বাড়ির জন্য", mr: "घरासाठी", en: "For Home" },
  },
  {
    id: "ssy",
    icon: "👧",
    color: "#c2185b",
    name: { hi: "सुकन्या समृद्धि योजना", ta: "சுகன்யா சம்ருத்தி திட்டம்", bn: "সুকন্যা সমৃদ্ধি যোজনা", mr: "सुकन्या समृद्धी योजना", en: "Sukanya Samridhi Yojana" },
    desc: { hi: "बेटी के लिए सबसे अच्छा निवेश। 8.2% ब्याज, टैक्स फ्री। ₹250 से शुरू।", ta: "பெண் குழந்தைக்கு சிறந்த முதலீடு. 8.2% வட்டி, வரி இல்லாதது. ₹250 முதல்.", bn: "মেয়ের জন্য সেরা বিনিয়োগ। 8.2% সুদ, ট্যাক্স ফ্রি। ₹250 থেকে শুরু।", mr: "मुलीसाठी सर्वोत्तम गुंतवणूक. 8.2% व्याज, करमुक्त. ₹250 पासून.", en: "Best investment for girl child. 8.2% interest, tax free. Start from ₹250." },
    goals: ["Children's education"],
    income: ["Less than ₹500", "₹500-2,000", "₹2,000-5,000", "₹5,000+"],
    tag: { hi: "बेटी के लिए", ta: "பெண்ணுக்காக", bn: "মেয়ের জন্য", mr: "मुलीसाठी", en: "For Girl Child" },
  },
  {
    id: "nps",
    icon: "🌅",
    color: "#f57f17",
    name: { hi: "राष्ट्रीय पेंशन योजना (NPS)", ta: "தேசிய ஓய்வூதிய திட்டம்", bn: "জাতীয় পেনশন যোজনা", mr: "राष्ट्रीय पेन्शन योजना", en: "National Pension System (NPS)" },
    desc: { hi: "रिटायरमेंट के लिए बेस्ट। ₹1000/माह से शुरू + टैक्स में छूट।", ta: "ஓய்வூதியத்திற்கு சிறந்தது. ₹1000/மாதம் + வரி சலுகை.", bn: "অবসরের জন্য সেরা। ₹1000/মাস থেকে + ট্যাক্স সুবিধা।", mr: "निवृत्तीसाठी सर्वोत्तम. ₹1000/महिना + कर सूट.", en: "Best for retirement. Start ₹1000/month + tax benefits." },
    goals: ["Retirement"],
    income: ["₹2,000-5,000", "₹5,000+"],
    tag: { hi: "रिटायरमेंट", ta: "ஓய்வூதியம்", bn: "অবসর", mr: "निवृत्ती", en: "Retirement" },
  },
  {
    id: "apyvaj",
    icon: "👴",
    color: "#00695c",
    name: { hi: "अटल पेंशन योजना", ta: "அடல் ஓய்வூதிய திட்டம்", bn: "অটল পেনশন যোজনা", mr: "अटल पेन्शन योजना", en: "Atal Pension Yojana" },
    desc: { hi: "₹42-₹210/माह देकर रिटायरमेंट पर ₹1,000-₹5,000 गारंटीड पेंशन।", ta: "₹42-₹210/மாதம் செலுத்தி ₹1,000-₹5,000 உத்தரவாதமான ஓய்வூதியம்.", bn: "₹42-₹210/মাস দিয়ে ₹1,000-₹5,000 গ্যারান্টেড পেনশন।", mr: "₹42-₹210/महिना भरून ₹1,000-₹5,000 हमी पेन्शन.", en: "Pay ₹42-₹210/month to get ₹1,000-₹5,000 guaranteed pension on retirement." },
    goals: ["Retirement"],
    income: ["Less than ₹500", "₹500-2,000", "₹2,000-5,000"],
    tag: { hi: "गारंटीड पेंशन", ta: "உத்தரவாத ஓய்வூதியம்", bn: "গ্যারান্টেড পেনশন", mr: "हमी पेन्शन", en: "Guaranteed Pension" },
  },
  {
    id: "pmkisan",
    icon: "🌾",
    color: "#33691e",
    name: { hi: "PM किसान सम्मान निधि", ta: "PM கிசான் சம்மான் நிதி", bn: "PM কিষান সম্মান নিধি", mr: "PM किसान सन्मान निधी", en: "PM Kisan Samman Nidhi" },
    desc: { hi: "किसानों को सालाना ₹6,000 सीधे खाते में (₹2,000 x 3 किस्त)।", ta: "விவசாயிகளுக்கு ஆண்டுதோறும் ₹6,000 நேரடி வங்கி கணக்கில்.", bn: "কৃষকদের বার্ষিক ₹6,000 সরাসরি ব্যাংক অ্যাকাউন্টে।", mr: "शेतकऱ्यांना वार्षिक ₹6,000 थेट खात्यात.", en: "₹6,000/year directly to farmers' bank accounts (₹2,000 × 3 installments)." },
    goals: ["Keep money safe", "Build a home"],
    income: ["Less than ₹500", "₹500-2,000"],
    tag: { hi: "किसान के लिए", ta: "விவசாயிகளுக்கு", bn: "কৃষকের জন্য", mr: "शेतकऱ्यांसाठी", en: "For Farmers" },
  },
];

const T = {
  title:    { hi: "🏛️ सरकारी योजनाएं", ta: "🏛️ அரசு திட்டங்கள்", bn: "🏛️ সরকারি প্রকল্প", mr: "🏛️ सरकारी योजना", en: "🏛️ Govt Schemes For You" },
  subtitle: { hi: "आपके प्रोफाइल के हिसाब से सबसे सही योजनाएं", ta: "உங்கள் சுயவிவரத்திற்கு ஏற்ற திட்டங்கள்", bn: "আপনার প্রোফাইল অনুযায়ী সেরা প্রকল্প", mr: "तुमच्या प्रोफाइलनुसार सर्वोत्तम योजना", en: "Best schemes matched to your profile" },
  all:      { hi: "सभी", ta: "அனைத்தும்", bn: "সব", mr: "सर्व", en: "All" },
  apply:    { hi: "आवेदन करें →", ta: "விண்ணப்பிக்க →", bn: "আবেদন করুন →", mr: "अर्ज करा →", en: "Apply Now →" },
  askAI:    { hi: "AI से पूछें", ta: "AI கேளுங்கள்", bn: "AI কে জিজ্ঞেস করুন", mr: "AI ला विचारा", en: "Ask AI" },
  aiLoading:{ hi: "AI समझा रहा है...", ta: "AI விளக்குகிறது...", bn: "AI বুঝাচ্ছে...", mr: "AI समजावत आहे...", en: "AI is explaining..." },
  match:    { hi: "✅ आपके लिए उपयुक्त", ta: "✅ உங்களுக்கு ஏற்றது", bn: "✅ আপনার জন্য উপযুক্ত", mr: "✅ तुमच्यासाठी योग्य", en: "✅ Matched to your profile" },
  disclaimer: { hi: "योजनाओं की जानकारी सरकारी वेबसाइट से verify करें।", ta: "திட்டங்களை அரசு இணையதளத்தில் சரிபார்க்கவும்.", bn: "প্রকল্পের তথ্য সরকারি ওয়েবসাইট থেকে যাচাই করুন।", mr: "योजनांची माहिती सरकारी वेबसाइटवरून तपासा.", en: "Verify scheme details from official government website." },
};

const APPLY_LINKS = {
  pmjdy:  "https://pmjdy.gov.in",
  pmjjby: "https://jansuraksha.gov.in",
  pmsby:  "https://jansuraksha.gov.in",
  pmay:   "https://pmaymis.gov.in",
  ssy:    "https://www.indiapost.gov.in",
  nps:    "https://www.npscra.nsdl.co.in",
  apyvaj: "https://npscra.nsdl.co.in/atal-pension-yojana.php",
  pmkisan:"https://pmkisan.gov.in",
};

export default function SchemesFinder({ profile, lang }) {
  const lc = lang?.code || "hi";
  const [filter, setFilter]     = useState("matched");
  const [aiReply, setAiReply]   = useState({});
  const [aiLoading, setAiLoading] = useState({});

  // Match schemes to user profile
  const matchedIds = ALL_SCHEMES
    .filter(s => s.goals.includes(profile.goal) || s.income.includes(profile.income))
    .map(s => s.id);

  const displayed = filter === "matched"
    ? ALL_SCHEMES.filter(s => matchedIds.includes(s.id))
    : ALL_SCHEMES;

  const askAboutScheme = async (scheme) => {
    if (aiReply[scheme.id]) { setAiReply(p => ({ ...p, [scheme.id]: null })); return; }
    setAiLoading(p => ({ ...p, [scheme.id]: true }));
    const langName = { hi: "Hindi", ta: "Tamil", bn: "Bengali", mr: "Marathi", en: "English" }[lc];
    const q = `Explain "${scheme.name.en}" government scheme in simple ${langName} in 3 short bullet points. Include how to apply and who is eligible. Be very simple for rural users.`;
    try {
      const reply = await askAI(q, lc, profile, []);
      setAiReply(p => ({ ...p, [scheme.id]: reply }));
    } catch {
      setAiReply(p => ({ ...p, [scheme.id]: "जानकारी लाने में दिक्कत हुई। कृपया दोबारा कोशिश करें।" }));
    } finally {
      setAiLoading(p => ({ ...p, [scheme.id]: false }));
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-card" style={{ background: "linear-gradient(135deg,#1a6b3c,#2e7d52)", color: "white", padding: "20px 18px" }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{T.title[lc]}</div>
        <div style={{ fontSize: 13, opacity: 0.88 }}>{T.subtitle[lc]}</div>
        <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
          <button onClick={() => setFilter("matched")} style={{
            background: filter === "matched" ? "white" : "rgba(255,255,255,0.2)",
            color: filter === "matched" ? "#1a6b3c" : "white",
            border: "none", borderRadius: 99, padding: "6px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>{T.match[lc]}</button>
          <button onClick={() => setFilter("all")} style={{
            background: filter === "all" ? "white" : "rgba(255,255,255,0.2)",
            color: filter === "all" ? "#1a6b3c" : "white",
            border: "none", borderRadius: 99, padding: "6px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>{T.all[lc]}</button>
        </div>
      </div>

      {/* Scheme Cards */}
      {displayed.map(scheme => (
        <div key={scheme.id} className="dash-card" style={{ borderLeft: `4px solid ${scheme.color}` }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ fontSize: 32, flexShrink: 0 }}>{scheme.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: scheme.color, marginBottom: 4 }}>
                {scheme.name[lc]}
              </div>
              <span style={{
                background: scheme.color + "20", color: scheme.color,
                fontSize: 11, fontWeight: 700, padding: "2px 10px",
                borderRadius: 99, display: "inline-block", marginBottom: 8,
              }}>{scheme.tag[lc]}</span>
              <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>{scheme.desc[lc]}</div>
            </div>
          </div>

          {/* AI explanation */}
          {aiLoading[scheme.id] && (
            <div style={{ marginTop: 12, fontSize: 13, color: "#888", display: "flex", gap: 6, alignItems: "center" }}>
              <span className="tip-dot" /><span className="tip-dot" /><span className="tip-dot" />
              <span style={{ marginLeft: 4 }}>{T.aiLoading[lc]}</span>
            </div>
          )}
          {aiReply[scheme.id] && (
            <div style={{ marginTop: 12, background: "#f0faf3", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "#222", lineHeight: 1.7 }}>
              🤖 {aiReply[scheme.id]}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button onClick={() => askAboutScheme(scheme)} style={{
              flex: 1, background: aiReply[scheme.id] ? "#f3f3f3" : "#e8f5e9",
              border: `1.5px solid ${scheme.color}`, borderRadius: 10,
              padding: "8px 0", fontSize: 13, fontWeight: 700,
              color: scheme.color, cursor: "pointer",
            }}>
              {aiReply[scheme.id] ? "❌ " + (lc === "hi" ? "बंद करें" : "Close") : `🤖 ${T.askAI[lc]}`}
            </button>
            <a href={APPLY_LINKS[scheme.id]} target="_blank" rel="noreferrer" style={{
              flex: 1, background: scheme.color, color: "white",
              border: "none", borderRadius: 10, padding: "8px 0",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {T.apply[lc]}
            </a>
          </div>
        </div>
      ))}

      <div className="dash-disclaimer">⚠️ {T.disclaimer[lc]}</div>
    </div>
  );
}
