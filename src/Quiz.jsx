import { useState, useEffect } from "react";
import { generateQuizQuestion } from "./api/groq";

const FALLBACK_QUESTIONS = {
  hi: [
    {
      question: "FD में पैसा कितना सुरक्षित है?",
      options: ["A) बिल्कुल नहीं", "B) थोड़ा", "C) पूरी तरह", "D) पता नहीं"],
      correct: 2,
      explanation: "FD में पैसा पूरी तरह सुरक्षित होता है — DICGC द्वारा ₹5 लाख तक insured होता है।",
    },
    {
      question: "PPF खाता कितने साल के लिए होता है?",
      options: ["A) 5 साल", "B) 10 साल", "C) 15 साल", "D) 20 साल"],
      correct: 2,
      explanation: "PPF का lock-in period 15 साल होता है, लेकिन आप इसे extend कर सकते हैं।",
    },
    {
      question: "Sukanya Samridhi Yojana किसके लिए है?",
      options: ["A) बेटों के लिए", "B) बेटियों के लिए", "C) बुज़ुर्गों के लिए", "D) किसानों के लिए"],
      correct: 1,
      explanation: "Sukanya Samridhi Yojana 10 साल से कम उम्र की बेटियों के लिए है, इसमें 8.2% ब्याज मिलता है।",
    },
    {
      question: "SIP में पैसा कहाँ जाता है?",
      options: ["A) बैंक FD में", "B) Post Office में", "C) Mutual Fund में", "D) Government Bond में"],
      correct: 2,
      explanation: "SIP (Systematic Investment Plan) के ज़रिए पैसा Mutual Fund में जाता है, जो बाज़ार पर निर्भर होता है।",
    },
    {
      question: "PM Jan Dhan Yojana में कितना बीमा मिलता है?",
      options: ["A) ₹50,000", "B) ₹1 लाख", "C) ₹2 लाख", "D) ₹5 लाख"],
      correct: 2,
      explanation: "PM Jan Dhan Yojana में ₹2 लाख का accidental insurance बिल्कुल मुफ्त मिलता है।",
    },
  ],
  en: [
    {
      question: "How safe is money in an FD?",
      options: ["A) Not at all", "B) Partially", "C) Completely safe", "D) Unknown"],
      correct: 2,
      explanation: "FD money is completely safe — insured up to ₹5 lakh by DICGC.",
    },
    {
      question: "What is the lock-in period for PPF?",
      options: ["A) 5 years", "B) 10 years", "C) 15 years", "D) 20 years"],
      correct: 2,
      explanation: "PPF has a 15-year lock-in period, after which you can extend it in blocks of 5 years.",
    },
    {
      question: "Sukanya Samridhi Yojana is designed for?",
      options: ["A) Sons", "B) Girl children", "C) Senior citizens", "D) Farmers"],
      correct: 1,
      explanation: "Sukanya Samridhi Yojana is for girl children below 10 years, offering 8.2% interest.",
    },
    {
      question: "Where does SIP money go?",
      options: ["A) Bank FD", "B) Post Office", "C) Mutual Fund", "D) Government Bond"],
      correct: 2,
      explanation: "SIP (Systematic Investment Plan) invests in Mutual Funds, which are market-linked.",
    },
    {
      question: "What insurance cover does PM Jan Dhan Yojana provide?",
      options: ["A) ₹50,000", "B) ₹1 lakh", "C) ₹2 lakh", "D) ₹5 lakh"],
      correct: 2,
      explanation: "PM Jan Dhan Yojana provides free ₹2 lakh accidental insurance.",
    },
  ],
  ta: [
    {
      question: "FD-ல் பணம் எவ்வளவு பாதுகாப்பானது?",
      options: ["A) மொத்தமே இல்லை", "B) கொஞ்சம்", "C) முழுவதும்", "D) தெரியாது"],
      correct: 2,
      explanation: "FD-ல் பணம் முழுவதும் பாதுகாப்பானது — DICGC மூலம் ₹5 லட்சம் வரை காப்பீடு.",
    },
    {
      question: "PPF கணக்கு எத்தனை ஆண்டுகளுக்கு?",
      options: ["A) 5 ஆண்டு", "B) 10 ஆண்டு", "C) 15 ஆண்டு", "D) 20 ஆண்டு"],
      correct: 2,
      explanation: "PPF-ல் 15 ஆண்டு lock-in உண்டு, பின்னர் நீட்டிக்கலாம்.",
    },
    {
      question: "SIP-ல் பணம் எங்கே போகிறது?",
      options: ["A) வங்கி FD", "B) தபால் நிலையம்", "C) Mutual Fund", "D) அரசு பத்திரம்"],
      correct: 2,
      explanation: "SIP மூலம் பணம் Mutual Fund-ல் முதலீடாகிறது, சந்தையை சார்ந்தது.",
    },
    {
      question: "Sukanya Samridhi யாருக்கு?",
      options: ["A) ஆண் குழந்தை", "B) பெண் குழந்தை", "C) முதியோர்", "D) விவசாயி"],
      correct: 1,
      explanation: "Sukanya Samridhi 10 வயதுக்கு கீழ் பெண் குழந்தைகளுக்கானது, 8.2% வட்டி.",
    },
    {
      question: "PM Jan Dhan Yojana-ல் எவ்வளவு காப்பீடு?",
      options: ["A) ₹50,000", "B) ₹1 லட்சம்", "C) ₹2 லட்சம்", "D) ₹5 லட்சம்"],
      correct: 2,
      explanation: "PM Jan Dhan Yojana மூலம் ₹2 லட்சம் விபத்து காப்பீடு இலவசமாக கிடைக்கும்.",
    },
  ],
  bn: [
    {
      question: "FD-তে টাকা কতটা নিরাপদ?",
      options: ["A) মোটেই না", "B) কিছুটা", "C) সম্পূর্ণ", "D) জানি না"],
      correct: 2,
      explanation: "FD-তে টাকা সম্পূর্ণ নিরাপদ — DICGC দ্বারা ₹5 লাখ পর্যন্ত বীমা করা।",
    },
    {
      question: "PPF অ্যাকাউন্ট কত বছরের জন্য?",
      options: ["A) ৫ বছর", "B) ১০ বছর", "C) ১৫ বছর", "D) ২০ বছর"],
      correct: 2,
      explanation: "PPF-এ ১৫ বছরের lock-in আছে, পরে বাড়ানো যায়।",
    },
    {
      question: "SIP-এ টাকা কোথায় যায়?",
      options: ["A) ব্যাংক FD", "B) পোস্ট অফিস", "C) মিউচুয়াল ফান্ড", "D) সরকারি বন্ড"],
      correct: 2,
      explanation: "SIP-এর মাধ্যমে টাকা Mutual Fund-এ যায়, যা বাজারের উপর নির্ভরশীল।",
    },
    {
      question: "Sukanya Samridhi কার জন্য?",
      options: ["A) ছেলেদের", "B) মেয়েদের", "C) বয়স্কদের", "D) কৃষকদের"],
      correct: 1,
      explanation: "Sukanya Samridhi ১০ বছরের কম বয়সী মেয়েদের জন্য, ৮.২% সুদ পাওয়া যায়।",
    },
    {
      question: "PM Jan Dhan Yojana-তে কত বীমা পাওয়া যায়?",
      options: ["A) ₹৫০,০০০", "B) ₹১ লাখ", "C) ₹২ লাখ", "D) ₹৫ লাখ"],
      correct: 2,
      explanation: "PM Jan Dhan Yojana-তে বিনামূল্যে ₹২ লাখের দুর্ঘটনা বীমা পাওয়া যায়।",
    },
  ],
  mr: [
    {
      question: "FD मध्ये पैसे किती सुरक्षित आहेत?",
      options: ["A) मुळीच नाही", "B) थोडे", "C) पूर्णपणे", "D) माहीत नाही"],
      correct: 2,
      explanation: "FD मध्ये पैसे पूर्णपणे सुरक्षित असतात — DICGC द्वारे ₹5 लाखांपर्यंत विमा.",
    },
    {
      question: "PPF खाते किती वर्षांसाठी असते?",
      options: ["A) 5 वर्षे", "B) 10 वर्षे", "C) 15 वर्षे", "D) 20 वर्षे"],
      correct: 2,
      explanation: "PPF मध्ये 15 वर्षांचा lock-in असतो, नंतर वाढवता येतो.",
    },
    {
      question: "SIP मध्ये पैसे कुठे जातात?",
      options: ["A) बँक FD", "B) पोस्ट ऑफिस", "C) Mutual Fund", "D) सरकारी रोखे"],
      correct: 2,
      explanation: "SIP द्वारे पैसे Mutual Fund मध्ये जातात, जे बाजारावर अवलंबून असते.",
    },
    {
      question: "Sukanya Samridhi कोणासाठी आहे?",
      options: ["A) मुलांसाठी", "B) मुलींसाठी", "C) वृद्धांसाठी", "D) शेतकऱ्यांसाठी"],
      correct: 1,
      explanation: "Sukanya Samridhi 10 वर्षांखालील मुलींसाठी आहे, 8.2% व्याज मिळते.",
    },
    {
      question: "PM Jan Dhan Yojana मध्ये किती विमा मिळतो?",
      options: ["A) ₹50,000", "B) ₹1 लाख", "C) ₹2 लाख", "D) ₹5 लाख"],
      correct: 2,
      explanation: "PM Jan Dhan Yojana मध्ये ₹2 लाखांचा अपघात विमा मोफत मिळतो.",
    },
  ],
};

const T = {
  title:      { hi: "🎯 फाइनेंस क्विज़", ta: "🎯 நிதி வினாடி வினா", bn: "🎯 ফাইন্যান্স কুইজ", mr: "🎯 फायनान्स क्विझ", en: "🎯 Finance Quiz" },
  score:      { hi: "स्कोर", ta: "மதிப்பெண்", bn: "স্কোর", mr: "गुण", en: "Score" },
  correct:    { hi: "✅ सही जवाब!", ta: "✅ சரியான பதில்!", bn: "✅ সঠিক উত্তর!", mr: "✅ बरोबर उत्तर!", en: "✅ Correct!" },
  wrong:      { hi: "❌ गलत। सही था:", ta: "❌ தவறு. சரியானது:", bn: "❌ ভুল। সঠিক ছিল:", mr: "❌ चुकीचे. बरोबर होते:", en: "❌ Wrong. Correct answer:" },
  next:       { hi: "अगला सवाल →", ta: "அடுத்த கேள்வி →", bn: "পরের প্রশ্ন →", mr: "पुढील प्रश्न →", en: "Next Question →" },
  finish:     { hi: "नतीजा देखें 🎉", ta: "முடிவு பார்க்க 🎉", bn: "ফলাফল দেখুন 🎉", mr: "निकाल पाहा 🎉", en: "See Results 🎉" },
  restart:    { hi: "फिर खेलें 🔄", ta: "மீண்டும் விளையாடு 🔄", bn: "আবার খেলুন 🔄", mr: "पुन्हा खेळा 🔄", en: "Play Again 🔄" },
  loading:    { hi: "सवाल आ रहा है...", ta: "கேள்வி வருகிறது...", bn: "প্রশ্ন আসছে...", mr: "प्रश्न येत आहे...", en: "Loading question..." },
  great:      { hi: "शाबाश! आप फाइनेंस एक्सपर्ट हैं 🏆", ta: "சாபாஷ்! நீங்கள் நிதி நிபுணர் 🏆", bn: "শাবাশ! আপনি ফাইন্যান্স এক্সপার্ট 🏆", mr: "शाबास! तुम्ही फायनान्स तज्ञ आहात 🏆", en: "Excellent! You're a finance expert 🏆" },
  good:       { hi: "अच्छा! थोड़ा और सीखें 💪", ta: "நல்லது! இன்னும் கற்றுக்கொள்ளுங்கள் 💪", bn: "ভালো! আরও একটু শিখুন 💪", mr: "छान! थोडं आणखी शिका 💪", en: "Good! Keep learning 💪" },
  keep:       { hi: "कोशिश जारी रखें! FD से शुरू करें 📚", ta: "தொடர்ந்து முயற்சியுங்கள்! FD-இல் தொடங்குங்கள் 📚", bn: "চেষ্টা চালিয়ে যান! FD দিয়ে শুরু করুন 📚", mr: "प्रयत्न सुरू ठेवा! FD पासून सुरुवात करा 📚", en: "Keep trying! Start with FD basics 📚" },
  outOf:      { hi: "में से", ta: "இல்", bn: "এর মধ্যে", mr: "पैकी", en: "out of" },
  q:          { hi: "सवाल", ta: "கேள்வி", bn: "প্রশ্ন", mr: "प्रश्न", en: "Q" },
};

export default function Quiz({ lang, onClose }) {
  const lc = lang?.code || "hi";
  const questions = FALLBACK_QUESTIONS[lc] || FALLBACK_QUESTIONS.hi;

  const [idx, setIdx]         = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore]     = useState(0);
  const [done, setDone]       = useState(false);
  const [answered, setAnswered] = useState(false);

  const q = questions[idx];
  const total = questions.length;

  const handleAnswer = (i) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === q.correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (idx + 1 >= total) {
      setDone(true);
    } else {
      setIdx(i => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const restart = () => {
    setIdx(0); setSelected(null); setScore(0); setDone(false); setAnswered(false);
  };

  const pct = Math.round((score / total) * 100);
  const resultMsg = pct >= 80 ? T.great[lc] : pct >= 50 ? T.good[lc] : T.keep[lc];
  const resultColor = pct >= 80 ? "#1a6b3c" : pct >= 50 ? "#e65100" : "#c62828";

  if (done) return (
    <div className="dashboard">
      <div className="dash-card" style={{ textAlign: "center", padding: "32px 20px" }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>
          {pct >= 80 ? "🏆" : pct >= 50 ? "💪" : "📚"}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: resultColor, marginBottom: 8 }}>
          {score} / {total}
        </div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>
          {T.score[lc]}: {pct}%
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#333", marginBottom: 24, lineHeight: 1.6 }}>
          {resultMsg}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={restart} style={{
            background: "#e8f5e9", border: "1.5px solid #1a6b3c", borderRadius: 12,
            padding: "10px 20px", fontSize: 14, fontWeight: 700, color: "#1a6b3c",
            cursor: "pointer", fontFamily: "inherit",
          }}>{T.restart[lc]}</button>
          {onClose && (
            <button onClick={onClose} style={{
              background: "#1a6b3c", border: "none", borderRadius: 12,
              padding: "10px 20px", fontSize: 14, fontWeight: 700, color: "white",
              cursor: "pointer", fontFamily: "inherit",
            }}>← Back</button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-card" style={{ background: "linear-gradient(135deg,#1a6b3c,#2e7d52)", color: "white", padding: "18px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{T.title[lc]}</div>
          <div style={{ fontSize: 13, background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 99 }}>
            🏅 {T.score[lc]}: {score}
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ marginTop: 12, background: "rgba(255,255,255,0.2)", borderRadius: 99, height: 6 }}>
          <div style={{
            width: `${((idx) / total) * 100}%`, height: "100%",
            background: "white", borderRadius: 99, transition: "width 0.4s ease",
          }} />
        </div>
        <div style={{ fontSize: 11, marginTop: 6, opacity: 0.8 }}>
          {T.q[lc]} {idx + 1} / {total}
        </div>
      </div>

      {/* Question */}
      <div className="dash-card">
        <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.5, marginBottom: 20 }}>
          {q.question}
        </div>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt, i) => {
            let bg = "#f7faf8", border = "#e0e8e3", color = "#333";
            if (answered) {
              if (i === q.correct)           { bg = "#e8f5e9"; border = "#1a6b3c"; color = "#1a6b3c"; }
              else if (i === selected)        { bg = "#ffebee"; border = "#ef5350"; color = "#c62828"; }
            } else if (selected === i)        { bg = "#e8f5e9"; border = "#1a6b3c"; }
            return (
              <button key={i} onClick={() => handleAnswer(i)} style={{
                background: bg, border: `1.5px solid ${border}`, borderRadius: 12,
                padding: "12px 14px", fontSize: 14, fontWeight: 500,
                color, cursor: answered ? "default" : "pointer",
                textAlign: "left", fontFamily: "inherit",
                transition: "all 0.2s",
              }}>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {answered && (
          <div style={{
            marginTop: 16, padding: "12px 14px", borderRadius: 12, fontSize: 13,
            background: selected === q.correct ? "#e8f5e9" : "#fff8e1",
            border: `1px solid ${selected === q.correct ? "#a5d6a7" : "#ffe082"}`,
            color: "#333", lineHeight: 1.6,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              {selected === q.correct ? T.correct[lc] : `${T.wrong[lc]} ${q.options[q.correct]}`}
            </div>
            💡 {q.explanation}
          </div>
        )}

        {answered && (
          <button onClick={handleNext} style={{
            width: "100%", background: "#1a6b3c", color: "white", border: "none",
            borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 700,
            cursor: "pointer", marginTop: 16, fontFamily: "inherit",
            boxShadow: "0 4px 14px rgba(26,107,60,0.3)",
          }}>
            {idx + 1 >= total ? T.finish[lc] : T.next[lc]}
          </button>
        )}
      </div>
    </div>
  );
}
