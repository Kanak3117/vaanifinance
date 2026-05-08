import { useState, useRef, useEffect } from "react";
import { askAI } from "./api/groq";
import { askWithRAG, isFinancialQuery } from "./api/rag";
import RAGIndicator from "./RAGIndicator";
import GuidedDemo from "./GuidedDemo";
import Dashboard from "./Dashboard";
import Calculator from "./Calculator";
import SchemesFinder from "./SchemesFinder";
import Quiz from "./Quiz";
import Splash from "./Splash";
import PartnerBanks from "./PartnerBanks";
import "./App.css";

// ════════════════════════════════════════════════════════════
//  LANGUAGE CONFIG — 100% native, ZERO English UI words
// ════════════════════════════════════════════════════════════
const LANGUAGES = [
  {
    code: "hi", label: "हिन्दी",
    greeting: "नमस्ते! मैं VaaniFinance हूँ 😊 कुछ भी पूछिए!",
    placeholder: "यहाँ लिखें...",
    quick: ["FD क्या है?", "SIP समझाओ", "PPF क्या है?", "₹10,000 कहाँ लगाऊं?"],
    voiceLang: "hi-IN",
    disclaimer: "दरें अनुमानित हैं — निवेश से पहले बैंक से जांचें",
    partnerDisclaimer: "ये Blostem की verified partner दरें हैं",
    calculateBtn: "📈 5 साल बाद कितना मिलेगा?",
    schemesBtn: "🏦 FD कैसे खोलें?",
    nextBtn: "📋 Step-by-step गाइड",
    expandDetails: "विवरण देखें ▼",
    collapseDetails: "छुपाएं ▲",
    stepLabels: ["पूछें", "सुझाव", "तुलना", "गणना", "कार्य"],
    uniqueTags: ["क्षेत्रीय भाषा", "AI सलाह", "सरकारी डेटा", "कैलकुलेटर"],
    riskLabel: "जोखिम स्तर",
    riskLow: "कम", riskMed: "मध्यम", riskHigh: "अधिक",
    inflationNote: "महंगाई (~6%) के बाद असली रिटर्न",
    bestForLabel: "आपके लिए सर्वोत्तम",
    horizonQ: "कितने साल निवेश करना है?",
    riskQ: "कितना जोखिम ले सकते हैं?",
    listenBtn: "🔊 सुनें",
    stopBtn: "⏹️ रोकें",
    shareBtn: "📤 शेयर करें",
    helpfulBtn: "👍 उपयोगी",
    notHelpfulBtn: "👎",
    trustItems: ["🔒 डेटा सुरक्षित", "📅 मई 2026 अपडेट", "🚫 कोई विज्ञापन नहीं", "✅ RBI & SEBI"],
    aiPersona: (pick) => `आपके profile के अनुसार — ${pick} सबसे उपयुक्त है`,
    demoBtn: "🚀 1-मिनिट वित्तीय योजना बनाएं",
    partnerBtn: "🏦 Blostem Partner बैंक",
    offlineMsg: "📵 ऑफलाइन — बुनियादी सुरक्षित सलाह दिखा रहे हैं",
    loadingMsg: "🤖 AI सोच रहा है… RBI & SEBI जानकारी जांच रहे हैं",
    errorMsg: "माफ़ करें, कुछ गड़बड़ हुई 🙏",
    darkLabel: "रात",
    lightLabel: "दिन",
    navLabels: { quiz: "क्विज़", schemes: "योजना", dashboard: "डैश", calculator: "कैल्क", partners: "बैंक" },
    benefitLabel: "फायदे",
    riskSectionLabel: "ध्यान रखें",
    nextStepLabel: "अगला कदम",
    bestForYouLabel: "आपके लिए सबसे अच्छा",
    sourceLabel: "📚 उत्तर स्रोत:",
    actionPlanQ: "मुझे step by step कार्य योजना दो",
    answeredFrom: "📚 उत्तर स्रोत:",
    checks: ["कम जोखिम", "गारंटी रिटर्न", "सरकारी सुरक्षा"],
    yearsLabel: "साल",
    amountLabel: "राशि",
    monthlyLabel: "मासिक SIP",
    investedLabel: "निवेश",
    gainLabel: "फायदा",
    maturityLabel: "कुल राशि",
  },
  {
    code: "ta", label: "தமிழ்",
    greeting: "வணக்கம்! நான் VaaniFinance 😊 எதுவும் கேளுங்கள்!",
    placeholder: "இங்கே தட்டச்சு செய்யுங்கள்...",
    quick: ["FD என்றால் என்ன?", "SIP விளக்குங்கள்", "PPF என்றால் என்ன?", "₹10,000 எங்கே போட்டு?"],
    voiceLang: "ta-IN",
    disclaimer: "வட்டி விகிதங்கள் தோராயமானவை — வங்கியிடம் சரிபார்க்கவும்",
    partnerDisclaimer: "இவை Blostem சரிபார்க்கப்பட்ட partner விகிதங்கள்",
    calculateBtn: "📈 5 ஆண்டில் எவ்வளவு கிடைக்கும்?",
    schemesBtn: "🏦 FD எப்படி தொடங்குவது?",
    nextBtn: "📋 படிப்படியான வழிகாட்டி",
    expandDetails: "விவரங்கள் ▼",
    collapseDetails: "மூடு ▲",
    stepLabels: ["கேளுங்கள்", "பரிந்துரை", "ஒப்பிடு", "கணக்கிடு", "செயல்படு"],
    uniqueTags: ["உள்ளூர் மொழி", "AI ஆலோசனை", "அரசு தரவு", "கணக்கி"],
    riskLabel: "ஆபத்து அளவு",
    riskLow: "குறைவு", riskMed: "நடுத்தர", riskHigh: "அதிகம்",
    inflationNote: "பணவீக்கம் (~6%) பிறகு உண்மையான வருமானம்",
    bestForLabel: "உங்களுக்கு சிறந்தது",
    horizonQ: "எத்தனை ஆண்டுகள் முதலீடு செய்வீர்கள்?",
    riskQ: "எவ்வளவு ஆபத்து எடுக்கலாம்?",
    listenBtn: "🔊 கேளுங்கள்",
    stopBtn: "⏹️ நிறுத்து",
    shareBtn: "📤 பகிர்",
    helpfulBtn: "👍 உதவியது",
    notHelpfulBtn: "👎",
    trustItems: ["🔒 தரவு பாதுகாப்பு", "📅 மே 2026 புதுப்பிப்பு", "🚫 விளம்பரம் இல்லை", "✅ RBI & SEBI"],
    aiPersona: (pick) => `உங்கள் profile படி — ${pick} சிறந்தது`,
    demoBtn: "🚀 1-நிமிட நிதி திட்டம்",
    partnerBtn: "🏦 Blostem Partner வங்கிகள்",
    offlineMsg: "📵 இணைப்பு இல்லை — அடிப்படை ஆலோசனை காட்டுகிறோம்",
    loadingMsg: "🤖 AI யோசிக்கிறது… RBI & SEBI தரவை சரிபார்க்கிறது",
    errorMsg: "மன்னிக்கவும், பிழை ஏற்பட்டது 🙏",
    darkLabel: "இரவு",
    lightLabel: "பகல்",
    navLabels: { quiz: "வினா", schemes: "திட்டம்", dashboard: "டாஷ்", calculator: "கணக்கு", partners: "வங்கி" },
    benefitLabel: "நன்மைகள்",
    riskSectionLabel: "கவனிக்கவும்",
    nextStepLabel: "அடுத்த படி",
    bestForYouLabel: "உங்களுக்கு சிறந்தது",
    sourceLabel: "📚 பதில் ஆதாரம்:",
    actionPlanQ: "படிப்படியான செயல் திட்டம் கூறுங்கள்",
    answeredFrom: "📚 பதில் ஆதாரம்:",
    checks: ["குறைந்த ஆபத்து", "உறுதியான வருமானம்", "அரசு உத்தரவாதம்"],
    yearsLabel: "ஆண்டுகள்",
    amountLabel: "தொகை",
    monthlyLabel: "மாதாந்திர SIP",
    investedLabel: "முதலீடு",
    gainLabel: "லாபம்",
    maturityLabel: "மொத்த தொகை",
  },
  {
    code: "bn", label: "বাংলা",
    greeting: "নমস্কার! আমি VaaniFinance 😊 যেকোনো প্রশ্ন করুন!",
    placeholder: "এখানে লিখুন...",
    quick: ["FD কী?", "SIP বোঝান", "PPF কী?", "₹10,000 কোথায় লাগাব?"],
    voiceLang: "bn-IN",
    disclaimer: "সুদের হার আনুমানিক — বিনিয়োগের আগে ব্যাংকে যাচাই করুন",
    partnerDisclaimer: "এগুলো Blostem verified partner হার",
    calculateBtn: "📈 ৫ বছরে কত পাবেন?",
    schemesBtn: "🏦 FD কীভাবে খুলবেন?",
    nextBtn: "📋 ধাপে ধাপে গাইড",
    expandDetails: "বিস্তারিত ▼",
    collapseDetails: "বন্ধ করুন ▲",
    stepLabels: ["জিজ্ঞাসা", "পরামর্শ", "তুলনা", "হিসাব", "পদক্ষেপ"],
    uniqueTags: ["আঞ্চলিক ভাষা", "AI পরামর্শ", "সরকারি তথ্য", "ক্যালকুলেটর"],
    riskLabel: "ঝুঁকির মাত্রা",
    riskLow: "কম", riskMed: "মাঝারি", riskHigh: "বেশি",
    inflationNote: "মূল্যস্ফীতি (~৬%) পরে প্রকৃত আয়",
    bestForLabel: "আপনার জন্য সেরা",
    horizonQ: "কত বছর বিনিয়োগ করতে চান?",
    riskQ: "কতটুকু ঝুঁকি নিতে পারবেন?",
    listenBtn: "🔊 শুনুন",
    stopBtn: "⏹️ থামুন",
    shareBtn: "📤 শেয়ার করুন",
    helpfulBtn: "👍 উপকারী",
    notHelpfulBtn: "👎",
    trustItems: ["🔒 ডেটা সুরক্ষিত", "📅 মে ২০২৬ আপডেট", "🚫 কোনো বিজ্ঞাপন নেই", "✅ RBI & SEBI"],
    aiPersona: (pick) => `আপনার profile অনুযায়ী — ${pick} সবচেয়ে উপযুক্ত`,
    demoBtn: "🚀 ১ মিনিটে আর্থিক পরিকল্পনা",
    partnerBtn: "🏦 Blostem Partner ব্যাংক",
    offlineMsg: "📵 অফলাইন — মৌলিক নিরাপদ পরামর্শ দেখাচ্ছি",
    loadingMsg: "🤖 AI ভাবছে… RBI & SEBI ডেটা যাচাই করছে",
    errorMsg: "দুঃখিত, সমস্যা হয়েছে 🙏",
    darkLabel: "রাত",
    lightLabel: "দিন",
    navLabels: { quiz: "কুইজ", schemes: "প্রকল্প", dashboard: "ড্যাশ", calculator: "ক্যালক", partners: "ব্যাংক" },
    benefitLabel: "সুবিধা",
    riskSectionLabel: "মনে রাখুন",
    nextStepLabel: "পরবর্তী পদক্ষেপ",
    bestForYouLabel: "আপনার জন্য সেরা",
    sourceLabel: "📚 উত্তর উৎস:",
    actionPlanQ: "ধাপে ধাপে কর্মপরিকল্পনা বলুন",
    answeredFrom: "📚 উত্তর উৎস:",
    checks: ["কম ঝুঁকি", "নিশ্চিত রিটার্ন", "সরকারি নিরাপত্তা"],
    yearsLabel: "বছর",
    amountLabel: "পরিমাণ",
    monthlyLabel: "মাসিক SIP",
    investedLabel: "বিনিয়োগ",
    gainLabel: "লাভ",
    maturityLabel: "মোট পরিমাণ",
  },
  {
    code: "mr", label: "मराठी",
    greeting: "नमस्कार! मी VaaniFinance 😊 काहीही विचारा!",
    placeholder: "येथे लिहा...",
    quick: ["FD म्हणजे काय?", "SIP समजावा", "PPF म्हणजे काय?", "₹10,000 कुठे गुंतवायचे?"],
    voiceLang: "mr-IN",
    disclaimer: "व्याजदर अंदाजे आहेत — गुंतवणुकीपूर्वी बँकेत तपासा",
    partnerDisclaimer: "या Blostem verified partner दरे आहेत",
    calculateBtn: "📈 5 वर्षांत किती मिळेल?",
    schemesBtn: "🏦 FD कसे उघडायचे?",
    nextBtn: "📋 चरणबद्ध मार्गदर्शन",
    expandDetails: "तपशील ▼",
    collapseDetails: "बंद करा ▲",
    stepLabels: ["विचारा", "सुचवा", "तुलना", "गणना", "कृती"],
    uniqueTags: ["प्रादेशिक भाषा", "AI सल्ला", "सरकारी माहिती", "कॅल्क्युलेटर"],
    riskLabel: "जोखीम पातळी",
    riskLow: "कमी", riskMed: "मध्यम", riskHigh: "जास्त",
    inflationNote: "महागाई (~6%) नंतर खरा परतावा",
    bestForLabel: "तुमच्यासाठी सर्वोत्तम",
    horizonQ: "किती वर्षे गुंतवणूक करायची?",
    riskQ: "किती जोखीम घेऊ शकता?",
    listenBtn: "🔊 ऐका",
    stopBtn: "⏹️ थांबवा",
    shareBtn: "📤 शेअर करा",
    helpfulBtn: "👍 उपयुक्त",
    notHelpfulBtn: "👎",
    trustItems: ["🔒 माहिती सुरक्षित", "📅 मे 2026 अपडेट", "🚫 जाहिरात नाही", "✅ RBI & SEBI"],
    aiPersona: (pick) => `तुमच्या profile नुसार — ${pick} सर्वोत्तम`,
    demoBtn: "🚀 1-मिनिट आर्थिक योजना",
    partnerBtn: "🏦 Blostem Partner बँका",
    offlineMsg: "📵 ऑफलाइन — मूलभूत सुरक्षित सल्ला दाखवत आहोत",
    loadingMsg: "🤖 AI विचार करतोय… RBI & SEBI डेटा तपासत आहे",
    errorMsg: "माफ करा, काहीतरी चुकले 🙏",
    darkLabel: "रात्र",
    lightLabel: "दिवस",
    navLabels: { quiz: "क्विझ", schemes: "योजना", dashboard: "डॅश", calculator: "कॅल्क", partners: "बँका" },
    benefitLabel: "फायदे",
    riskSectionLabel: "लक्षात ठेवा",
    nextStepLabel: "पुढील पाऊल",
    bestForYouLabel: "तुमच्यासाठी सर्वोत्तम",
    sourceLabel: "📚 उत्तर स्रोत:",
    actionPlanQ: "चरणबद्ध कृती योजना सांगा",
    answeredFrom: "📚 उत्तर स्रोत:",
    checks: ["कमी जोखीम", "हमी परतावा", "सरकारी सुरक्षा"],
    yearsLabel: "वर्षे",
    amountLabel: "रक्कम",
    monthlyLabel: "मासिक SIP",
    investedLabel: "गुंतवणूक",
    gainLabel: "नफा",
    maturityLabel: "एकूण रक्कम",
  },
  {
    code: "en", label: "English",
    greeting: "Hello! I am VaaniFinance 😊 Ask me anything!",
    placeholder: "Type here...",
    quick: ["What is FD?", "Explain SIP", "What is PPF?", "Where to invest ₹10,000?"],
    voiceLang: "en-IN",
    disclaimer: "Rates are approximate — verify with your bank before investing",
    partnerDisclaimer: "Blostem verified partner rates · DICGC insured",
    calculateBtn: "📈 How much in 5 years?",
    schemesBtn: "🏦 How to open FD?",
    nextBtn: "📋 Step-by-step guide",
    expandDetails: "Show details ▼",
    collapseDetails: "Hide ▲",
    stepLabels: ["Ask", "Suggest", "Compare", "Calculate", "Act"],
    uniqueTags: ["Regional language", "AI Advisor", "Govt-verified", "Calculator"],
    riskLabel: "Risk level",
    riskLow: "Low", riskMed: "Medium", riskHigh: "High",
    inflationNote: "Real return after inflation (~6%)",
    bestForLabel: "Best for you",
    horizonQ: "How many years to invest?",
    riskQ: "How much risk can you take?",
    listenBtn: "🔊 Listen",
    stopBtn: "⏹️ Stop",
    shareBtn: "📤 Share",
    helpfulBtn: "👍 Helpful",
    notHelpfulBtn: "👎",
    trustItems: ["🔒 Data Private", "📅 May 2026", "🚫 No Ads", "✅ RBI & SEBI"],
    aiPersona: (pick) => `Based on your profile — ${pick} is your best fit`,
    demoBtn: "🚀 Try 1-min financial plan",
    partnerBtn: "🏦 Blostem Partner Banks",
    offlineMsg: "📵 Offline mode — showing basic safe advice",
    loadingMsg: "🤖 AI is thinking… checking RBI & SEBI data for you",
    errorMsg: "Sorry, something went wrong 🙏",
    darkLabel: "Dark",
    lightLabel: "Light",
    navLabels: { quiz: "Quiz", schemes: "Schemes", dashboard: "Dash", calculator: "Calc", partners: "Banks" },
    benefitLabel: "Benefits",
    riskSectionLabel: "Keep in Mind",
    nextStepLabel: "Next Step",
    bestForYouLabel: "Best for You",
    sourceLabel: "📚 Answered from:",
    actionPlanQ: "Give me a step-by-step action plan for my goal",
    answeredFrom: "📚 Answered from:",
    checks: ["Low risk", "Guaranteed returns", "Government-backed"],
    yearsLabel: "years",
    amountLabel: "Amount",
    monthlyLabel: "Monthly SIP",
    investedLabel: "Invested",
    gainLabel: "Gain",
    maturityLabel: "Maturity",
  },
  {
    code: "hl", label: "Hinglish",
    greeting: "Namaste! Main VaaniFinance hun 😊 Kuch bhi pucho!",
    placeholder: "Yahan likho...",
    quick: ["FD kya hai?", "SIP samjhao", "PPF kya hai?", "₹10,000 kahan lagaun?"],
    voiceLang: "hi-IN",
    disclaimer: "Rates anumanit hain — nivesh se pehle bank se jaancho",
    partnerDisclaimer: "Ye Blostem ki verified partner rates hain",
    calculateBtn: "📈 5 saal mein kitna milega?",
    schemesBtn: "🏦 FD kaise kholen?",
    nextBtn: "📋 Step-by-step guide",
    expandDetails: "Vivaran dekho ▼",
    collapseDetails: "Chupaao ▲",
    stepLabels: ["Pucho", "Sujhav", "Tulna", "Ganana", "Karya"],
    uniqueTags: ["Apni Boli", "AI Salah", "Sarkaari Data", "Calculator"],
    riskLabel: "Jokhim star",
    riskLow: "Kam", riskMed: "Madhyam", riskHigh: "Adhik",
    inflationNote: "Mehangai (~6%) ke baad asli return",
    bestForLabel: "Aapke liye sabse acha",
    horizonQ: "Kitne saal nivesh karna hai?",
    riskQ: "Kitna jokhim le sakte ho?",
    listenBtn: "🔊 Suno",
    stopBtn: "⏹️ Roko",
    shareBtn: "📤 Share karo",
    helpfulBtn: "👍 Upyogi",
    notHelpfulBtn: "👎",
    trustItems: ["🔒 Data Surakshit", "📅 May 2026 Update", "🚫 Koi Ad Nahi", "✅ RBI & SEBI"],
    aiPersona: (pick) => `Aapke profile ke anusar — ${pick} sabse upyukt hai`,
    demoBtn: "🚀 1-minute vittiya yojana banao",
    partnerBtn: "🏦 Blostem Partner Banks",
    offlineMsg: "📵 Offline — bunyadi surakshit salah dikha rahe hain",
    loadingMsg: "🤖 AI soch raha hai… RBI & SEBI jaankari jaanch raha hai",
    errorMsg: "Maaf karo, kuch gadbad hui 🙏",
    darkLabel: "Raat",
    lightLabel: "Din",
    navLabels: { quiz: "Quiz", schemes: "Yojana", dashboard: "Dash", calculator: "Calc", partners: "Bank" },
    benefitLabel: "Fayde",
    riskSectionLabel: "Dhyan Rakho",
    nextStepLabel: "Agla Kadam",
    bestForYouLabel: "Aapke Liye Sabse Acha",
    sourceLabel: "📚 Jawab ka zariya:",
    actionPlanQ: "Mujhe step by step karya yojana do",
    answeredFrom: "📚 Jawab ka zariya:",
    checks: ["Kam jokhim", "Guarantee return", "Sarkaari suraksha"],
    yearsLabel: "saal",
    amountLabel: "Rashi",
    monthlyLabel: "Maasik SIP",
    investedLabel: "Nivesh",
    gainLabel: "Faayda",
    maturityLabel: "Kul Rashi",
  },
];

// ════════════════════════════════════════════════════════════
//  ONBOARDING TEXT — fully localized
// ════════════════════════════════════════════════════════════
const ONBOARD_TEXT = {
  title:       { hi: "पहले थोड़ा बताइए 🙏", ta: "உங்களைப் பற்றி சொல்லுங்கள் 🙏", bn: "একটু বলুন 🙏", mr: "थोडं सांगा 🙏", en: "Tell us about yourself 🙏", hl: "Pehle thoda batao 🙏" },
  incomeLabel: { hi: "मासिक बचत कितनी है?", ta: "மாத சேமிப்பு எவ்வளவு?", bn: "মাসিক সঞ্চয় কত?", mr: "मासिक बचत किती?", en: "Monthly savings?", hl: "Mahine ki bachhat kitni hai?" },
  goalLabel:   { hi: "मुख्य लक्ष्य क्या है?", ta: "முக்கிய இலக்கு என்ன?", bn: "প্রধান লক্ষ্য কী?", mr: "मुख्य ध्येय काय?", en: "Main goal?", hl: "Apna main lakshya kya hai?" },
  horizonLabel:{ hi: "कितने साल का plan?", ta: "எத்தனை ஆண்டுகள் திட்டம்?", bn: "কত বছরের পরিকল্পনা?", mr: "किती वर्षांचा प्लान?", en: "Investment horizon?", hl: "Kitne saal ka plan hai?" },
  riskLabel:   { hi: "जोखिम कितना ले सकते हैं?", ta: "எவ்வளவு ஆபத்து?", bn: "কতটুকু ঝুঁকি?", mr: "किती जोखीम घेऊ शकता?", en: "Risk tolerance?", hl: "Kitna jokhim le sakte ho?" },
  submit:      { hi: "शुरू करें →", ta: "தொடங்குங்கள் →", bn: "শুরু করুন →", mr: "सुरू करा →", en: "Get Started →", hl: "Shuru karo →" },
};

const INCOME_OPTIONS = [
  { en: "Less than ₹500", hi: "₹500 से कम",  ta: "₹500க்கும் குறைவு", bn: "₹500 এর কম",  mr: "₹500 पेक्षा कमी", hl: "₹500 se kam" },
  { en: "₹500-2,000",     hi: "₹500-2,000",   ta: "₹500-2,000",        bn: "₹500-2,000",   mr: "₹500-2,000",      hl: "₹500-2,000" },
  { en: "₹2,000-5,000",   hi: "₹2,000-5,000", ta: "₹2,000-5,000",      bn: "₹2,000-5,000", mr: "₹2,000-5,000",    hl: "₹2,000-5,000" },
  { en: "₹5,000+",        hi: "₹5,000+",      ta: "₹5,000+",           bn: "₹5,000+",      mr: "₹5,000+",         hl: "₹5,000+" },
];

const GOAL_OPTIONS = [
  { en: "Keep money safe",      hi: "पैसा सुरक्षित रखना", ta: "பணத்தை பாதுகாக்க", bn: "টাকা সুরক্ষিত রাখা", mr: "पैसा सुरक्षित ठेवणे", hl: "Paisa safe rakhna" },
  { en: "Children's education", hi: "बच्चों की पढ़ाई",    ta: "குழந்தை படிப்பு",   bn: "সন্তানের পড়াশোনা",  mr: "मुलांचे शिक्षण",      hl: "Bachhon ki padhai" },
  { en: "Build a home",         hi: "घर बनाना",           ta: "வீடு கட்ட",          bn: "বাড়ি বানানো",        mr: "घर बांधणे",           hl: "Ghar banana" },
  { en: "Retirement",           hi: "रिटायरमेंट",         ta: "ஓய்வூதியம்",         bn: "অবসর",               mr: "निवृत्ती",            hl: "Retirement" },
];

const HORIZON_OPTIONS = [
  { en: "< 1 year",  hi: "1 साल से कम",  ta: "1 ஆண்டுக்கும் குறைவு", bn: "১ বছরের কম",  mr: "1 वर्षापेक्षा कमी", hl: "1 saal se kam" },
  { en: "1-3 years", hi: "1-3 साल",      ta: "1-3 ஆண்டுகள்",          bn: "১-৩ বছর",    mr: "1-3 वर्षे",          hl: "1-3 saal" },
  { en: "3-7 years", hi: "3-7 साल",      ta: "3-7 ஆண்டுகள்",          bn: "৩-৭ বছর",    mr: "3-7 वर्षे",          hl: "3-7 saal" },
  { en: "7+ years",  hi: "7+ साल",       ta: "7+ ஆண்டுகள்",           bn: "৭+ বছর",     mr: "7+ वर्षे",           hl: "7+ saal" },
];

const RISK_OPTIONS = [
  { en: "Low — guaranteed returns",    hi: "कम — गारंटी रिटर्न",          ta: "குறைவு — உறுதியான வருமானம்",      bn: "কম — নিশ্চিত রিটার্ন",          mr: "कमी — हमी परतावा",       hl: "Kam — guarantee return" },
  { en: "Medium — some market risk",   hi: "मध्यम — थोड़ा बाज़ार जोखिम",  ta: "நடுத்தர — சிறிய சந்தை ஆபத்து",   bn: "মাঝারি — কিছু বাজার ঝুঁকি",     mr: "मध्यम — थोडा धोका",      hl: "Madhyam — thoda market jokhim" },
  { en: "High — max growth potential", hi: "अधिक — अधिकतम वृद्धि",         ta: "அதிகம் — அதிகபட்ச வளர்ச்சி",     bn: "বেশি — সর্বোচ্চ বৃদ্ধি",        mr: "जास्त — जास्त वाढ",       hl: "Adhik — maximum growth" },
];

// ════════════════════════════════════════════════════════════
//  SESSION STORAGE
// ════════════════════════════════════════════════════════════
const LS = {
  get: (k, fallback = null) => { try { const v = sessionStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
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

// ════════════════════════════════════════════════════════════
//  JOURNEY BAR — slim, elegant
// ════════════════════════════════════════════════════════════
function JourneyBar({ lang, currentStep }) {
  const steps = lang.stepLabels;
  return (
    <div style={{
      display: "flex", alignItems: "center", padding: "10px 18px",
      background: "#fff", borderBottom: "1px solid #e8f0eb", gap: 0, flexShrink: 0
    }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: i < currentStep ? "#1a6b3c" : i === currentStep ? "#1a6b3c" : "#eff4f1",
              color: i <= currentStep ? "white" : "#bbb",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 800, transition: "all 0.3s",
              boxShadow: i === currentStep ? "0 0 0 4px rgba(26,107,60,0.15)" : "none"
            }}>{i < currentStep ? "✓" : i + 1}</div>
            <div style={{
              fontSize: 8.5, marginTop: 4,
              color: i <= currentStep ? "#1a6b3c" : "#bbb",
              fontWeight: i === currentStep ? 800 : 400,
              whiteSpace: "nowrap", maxWidth: 48,
              textAlign: "center", overflow: "hidden", textOverflow: "ellipsis",
              transition: "color 0.3s"
            }}>{s}</div>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: 2,
              background: i < currentStep ? "#1a6b3c" : "#e0eae3",
              margin: "0 4px", marginBottom: 14, transition: "background 0.3s",
              borderRadius: 99
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  INFO STRIP — trust items + AI rec, spacious
// ════════════════════════════════════════════════════════════
function InfoStrip({ lang, darkMode, profile, bestPick }) {
  const dm = darkMode;
  return (
    <div style={{ flexShrink: 0 }}>
      {/* Trust row */}
      <div style={{
        background: dm ? "linear-gradient(90deg,#0a1a0d,#0d1f10)" : "linear-gradient(90deg,#f0faf5,#e8f5ee)",
        borderBottom: `1px solid ${dm ? "#1a3020" : "#c8e6d0"}`,
        padding: "7px 18px",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 14, flexWrap: "wrap",
        fontSize: 10.5, fontWeight: 600,
        color: dm ? "#5db87a" : "#1a6b3c",
      }}>
        {lang.trustItems.map((item, i) => <span key={i}>{item}</span>)}
      </div>

      {/* AI rec — only if profile complete */}
      {profile?.income && profile?.goal && bestPick && (
        <div className="ai-rec-strip" style={{
          background: dm
            ? "linear-gradient(90deg,#0a1a0f,#091509)"
            : "linear-gradient(90deg,#eaf5ef,#e2f5ea)",
          borderBottom: `1px solid ${dm ? "#1a3020" : "#c8e6d0"}`,
          padding: "9px 18px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>🎯</span>
          <span style={{ fontSize: 12, color: dm ? "#5db87a" : "#1a6b3c", fontWeight: 600, lineHeight: 1.5, flex: 1 }}>
            {lang.aiPersona(bestPick)}
          </span>
          <span style={{
            background: "#1a6b3c", color: "white",
            borderRadius: 99, padding: "3px 10px",
            fontSize: 10, fontWeight: 700, flexShrink: 0,
            boxShadow: "0 2px 8px rgba(26,107,60,0.35)"
          }}>✔ AI</span>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  STRUCTURED RESPONSE RENDERER — localized, premium cards
// ════════════════════════════════════════════════════════════
function StructuredResponse({ content, profile, lang, darkMode, isLastAi, onOpenCalc, onOpenSchemes, onAskNext }) {
  const lc = lang?.code || "hi";
  const dm = darkMode;
  const [expanded, setExpanded] = useState(false);

  if (!content) return null;

  const lines = content.split("\n");
  const blocks = [];
  let current = null;

  const pushCurrent = () => { if (current) { blocks.push(current); current = null; } };

  lines.forEach(line => {
    let t = line.trim().replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");
    if (!t) return;
    if (t.match(/^[-=_]{2,}/)) return;

    const isBullet = /^[\u2022\u2714\u{1F449}\-*]|^\d+[.)]/u.test(t);
    const cleanBullet = (s) => s.replace(/^[\u2022\u2714\u{1F449}\-*]\s*/u, "").replace(/^\d+[.)\s]\s*/, "").trim();

    if (t.startsWith("\u{1F3AF}")) { pushCurrent(); return; }
    else if (t.startsWith("\u{1F4D8}")) {
      pushCurrent();
      current = { type: "intro", text: t.replace(/^\u{1F4D8}\s*/u, ""), items: [] };
    }
    else if (t.startsWith("\u{1F7E2}")) {
      pushCurrent();
      const rest = t.replace(/^\u{1F7E2}\s*/u, "").replace(/^[^:]+:\s*/, "").trim();
      current = { type: "benefit", text: "", items: rest && rest.length > 3 ? [rest] : [] };
    }
    else if (t.startsWith("\u26A0") || t.startsWith("\u{26A0}")) {
      pushCurrent();
      const rest = t.replace(/^\u26A0\uFE0F?\s*/u, "").replace(/^[^:]+:\s*/, "").trim();
      current = { type: "risk", text: "", items: rest && rest.length > 3 ? [rest] : [] };
    }
    else if (t.startsWith("\u{1F3E6}")) { pushCurrent(); current = { type: "blostem", text: "", items: [] }; }
    else if (t.startsWith("\u{1F4A1}") || t.startsWith("\u2705")) {
      pushCurrent();
      const bestText = t.replace(/^[\u{1F4A1}\u2705]\s*/u, "")
                        .replace(/^(तुलना|निष्कर्ष|Comparison|Best for you|आपके लिए|ஒப்பீடு|তুলনা|तुलना|Verdict)\s*:\s*/u, "").trim();
      current = { type: "best", text: bestText, items: [] };
    }
    else if (t.startsWith("\u{1F680}")) {
      pushCurrent();
      const nextText = t.replace(/^\u{1F680}\s*/u, "")
                        .replace(/^(अगला कदम|Next step|அடுத்த படி|পরবর্তী পদক্ষেপ|पुढील पाऊल)\s*:\s*/u, "").trim();
      current = { type: "next", text: nextText, items: [] };
    }
    else if (t.startsWith("\u{1F4DA}")) {
      pushCurrent();
      current = { type: "source", text: t.replace(/^\u{1F4DA}\s*/u, ""), items: [] };
    }
    else if (isBullet && current) {
      const item = cleanBullet(t);
      if (item) current.items.push(item);
    }
    else if (current) {
      const isHeaderLabel = /^[\w\u0900-\u09FF\u0B80-\u0BFF\u0980-\u09FF]{1,15}\s*:$/.test(t);
      if (!isHeaderLabel) {
        if (["benefit", "risk", "blostem", "next"].includes(current.type)) {
          current.items.push(t);
        } else {
          if (current.text) current.text += " " + t;
          else current.text = t;
        }
      }
    }
    else { current = { type: "text", text: t, items: [] }; }
  });
  pushCurrent();

  const hasStructure = blocks.some(b => ["benefit","risk","blostem","next"].includes(b.type));
  if (!hasStructure) {
    return <span style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.85, color: dm ? "#eaf4ee" : "#1a1a1a" }}>{content}</span>;
  }

  const seen = {};
  const deduped = [];
  for (let i = blocks.length - 1; i >= 0; i--) {
    const key = blocks[i].type;
    if (!seen[key]) { seen[key] = true; deduped.unshift(blocks[i]); }
  }

  const alwaysShow = deduped.filter(b => ["intro","best","text"].includes(b.type));
  const expandable = deduped.filter(b => !["intro","best","text","source"].includes(b.type));
  const sources    = deduped.filter(b => b.type === "source");

  const renderBlock = (block, i) => {
    switch (block.type) {
      case "intro": return (
        <div key={i} style={{
          fontSize: 14, fontWeight: 700,
          color: dm ? "#eaf4ee" : "#1a1a1a",
          lineHeight: 1.65, paddingBottom: 3
        }}>
          📘 {block.text}
        </div>
      );
      case "text": return block.text ? (
        <p key={i} style={{ fontSize: 13.5, color: dm ? "#c8dece" : "#444", lineHeight: 1.75, margin: 0 }}>{block.text}</p>
      ) : null;

      case "benefit": return (
        <div key={i} style={{
          borderRadius: 14, padding: "12px 14px", marginBottom: 4,
          background: dm ? "linear-gradient(135deg,#0d2015,#0a1a0d)" : "linear-gradient(135deg,#e8f8ef,#d8f0e2)",
          border: `1.5px solid ${dm ? "#1a4a28" : "#a5d6b7"}`,
          boxShadow: `0 2px 12px rgba(26,107,60,${dm ? 0.15 : 0.07})`,
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 900, color: "#1a6b3c", marginBottom: 7, letterSpacing: "0.6px", textTransform: "uppercase" }}>
            🟢 {lang.benefitLabel}
          </div>
          {(block.items.length > 0
            ? block.items
            : block.text ? block.text.split(/[.।]+/).map(s => s.trim()).filter(s => s.length > 3) : []
          ).map((item, ii) => (
            <div key={ii} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "3px 0" }}>
              <span style={{ color: "#1a6b3c", fontWeight: 900, flexShrink: 0, fontSize: 13 }}>✔</span>
              <span style={{ fontSize: 13.5, color: dm ? "#c8dece" : "#2e5c3a", lineHeight: 1.55 }}>{item}</span>
            </div>
          ))}
        </div>
      );

      case "risk": return (
        <div key={i} style={{
          borderRadius: 14, padding: "12px 14px", marginBottom: 4,
          background: dm ? "linear-gradient(135deg,#1a1200,#120d00)" : "linear-gradient(135deg,#fff9e6,#fff3d0)",
          border: `1.5px solid ${dm ? "#3a2e00" : "#f5cc70"}`,
          boxShadow: `0 2px 12px rgba(230,165,0,${dm ? 0.12 : 0.07})`,
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 900, color: "#e65100", marginBottom: 7, letterSpacing: "0.6px", textTransform: "uppercase" }}>
            ⚠️ {lang.riskSectionLabel}
          </div>
          {(block.items.length > 0
            ? block.items
            : block.text ? block.text.split(/[.।]+/).map(s => s.trim()).filter(s => s.length > 3) : []
          ).map((item, ii) => (
            <div key={ii} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "3px 0" }}>
              <span style={{ color: "#e65100", flexShrink: 0 }}>•</span>
              <span style={{ fontSize: 13.5, color: dm ? "#d4aa60" : "#8b4500", lineHeight: 1.55 }}>{item}</span>
            </div>
          ))}
        </div>
      );

      case "blostem": return (
        <div key={i} style={{
          borderRadius: 14, padding: "12px 14px", marginBottom: 4,
          background: dm ? "linear-gradient(135deg,#0d1520,#0a1220)" : "linear-gradient(135deg,#f0f4ff,#e8eeff)",
          border: `1.5px solid ${dm ? "#1a3050" : "#c5d5f0"}`,
          boxShadow: `0 2px 12px rgba(21,101,192,${dm ? 0.12 : 0.07})`,
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 900, color: "#1565c0", marginBottom: 3, letterSpacing: "0.6px", textTransform: "uppercase" }}>
            🏦 Blostem Partner FD
          </div>
          <div style={{ fontSize: 10, color: dm ? "#6a8aaa" : "#888", marginBottom: 8, fontStyle: "italic" }}>
            {lang.partnerDisclaimer}
          </div>
          {(block.items.length > 0 ? block.items
            : ["Suryoday Bank — ~8.5%", "Unity Bank — ~9%", "Bajaj Finance — ~8.2%", "Utkarsh Bank — ~8%"]
          ).map((b, ii) => (
            <div key={ii} style={{ display: "flex", gap: 8, alignItems: "center", padding: "3px 0" }}>
              <span style={{ color: "#1565c0", fontWeight: 800, flexShrink: 0 }}>✔</span>
              <span style={{ fontSize: 13.5, color: dm ? "#90caf9" : "#0d47a1", fontWeight: 600 }}>{b}</span>
            </div>
          ))}
          <div style={{ fontSize: 10, color: dm ? "#5a8abf" : "#1565c0", marginTop: 6, fontStyle: "italic" }}>
            RBI · DICGC ₹5 लाख
          </div>
        </div>
      );

      case "best": {
        const parts = block.text.split(/\s*[—-]\s*/);
        const product = parts[0]?.trim() || block.text;
        const reason  = parts.slice(1).join(" — ").trim();
        return (
          <div key={i} style={{
            borderRadius: 16, padding: "16px 18px", marginBottom: 4,
            background: "linear-gradient(135deg, #1a6b3c, #0e3d22)",
            boxShadow: "0 6px 24px rgba(26,107,60,0.38)",
          }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: "rgba(255,255,255,0.65)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 6 }}>
              🏆 {lang.bestForYouLabel}
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "white", marginBottom: reason ? 5 : 10, lineHeight: 1.3 }}>
              {product}
            </div>
            {reason && (
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.78)", marginBottom: 10, fontStyle: "italic", lineHeight: 1.5 }}>{reason}</div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {lang.checks.map((label, ci) => (
                <div key={ci} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ color: "#a5d6a7", fontWeight: 900, fontSize: 14 }}>✔</span>
                  <span style={{ color: "rgba(255,255,255,0.88)", fontSize: 12.5, fontWeight: 600 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "next": return (
        <div key={i} style={{
          borderRadius: 14, padding: "12px 14px", marginBottom: 4,
          background: dm ? "linear-gradient(135deg,#0f1a12,#0c1509)" : "linear-gradient(135deg,#f1f8e9,#e8f5d6)",
          border: `1.5px solid ${dm ? "#1a3a1a" : "#aed581"}`,
          boxShadow: `0 2px 10px rgba(55,106,32,${dm ? 0.12 : 0.07})`,
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 900, color: "#33691e", marginBottom: 6, letterSpacing: "0.6px", textTransform: "uppercase" }}>
            🚀 {lang.nextStepLabel}
          </div>
          {block.text && <div style={{ fontSize: 13.5, color: dm ? "#a5d6a7" : "#33691e", fontWeight: 600, marginBottom: block.items.length ? 5 : 0, lineHeight: 1.55 }}>{block.text}</div>}
          {block.items.map((item, ii) => (
            <div key={ii} style={{ fontSize: 13.5, color: dm ? "#a5d6a7" : "#33691e", fontWeight: 600, padding: "2px 0", lineHeight: 1.55 }}>👉 {item}</div>
          ))}
        </div>
      );

      default: return null;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {alwaysShow.map((b, i) => renderBlock(b, i))}

      {expandable.length > 0 && (
        <>
          <button onClick={() => setExpanded(x => !x)} style={{
            background: "none",
            border: `1.5px dashed ${dm ? "#243328" : "#c0d8c8"}`,
            borderRadius: 12, padding: "8px 14px",
            fontSize: 12.5, fontWeight: 700,
            color: dm ? "#5db87a" : "#1a6b3c",
            cursor: "pointer", textAlign: "left",
            display: "flex", alignItems: "center", gap: 7,
            transition: "all 0.2s",
            fontFamily: "inherit",
          }}>
            {expanded ? lang.collapseDetails : lang.expandDetails}
          </button>
          {expanded && expandable.map((b, i) => renderBlock(b, i + 100))}
        </>
      )}

      {sources.map((b, i) => (
        <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginTop: 3 }}>
          <span style={{ fontSize: 11, color: dm ? "#5db87a" : "#1a6b3c", fontWeight: 700 }}>📚</span>
          <span style={{ fontSize: 11, color: dm ? "#7aaa8a" : "#4a7a58" }}>{b.text}</span>
        </div>
      ))}

      {/* Post-response CTAs */}
      {isLastAi && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={onOpenCalc} className="post-resp-cta-primary">
            📊 {lang.calculateBtn}
          </button>
          <div style={{ display: "flex", gap: 7 }}>
            <button onClick={onOpenSchemes} className="post-resp-cta-secondary" style={{
              background: dm ? "#0d2015" : "#e8f5e9",
              border: `1.5px solid ${dm ? "#1a4a28" : "#a5d6a7"}`,
              color: dm ? "#5db87a" : "#1a6b3c",
            }}>
              🏛️ {lang.schemesBtn}
            </button>
            <button onClick={onAskNext} className="post-resp-cta-secondary" style={{
              background: dm ? "#1a1000" : "#fff8e1",
              border: `1.5px solid ${dm ? "#3a2800" : "#ffcc80"}`,
              color: dm ? "#e8a040" : "#e65100",
            }}>
              🚀 {lang.nextBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  MAIN APP
// ════════════════════════════════════════════════════════════
export default function App() {
  const savedLangCode = LS.get("vf_lang", "hi");
  const savedProfile  = LS.get("vf_profile", null);
  const savedMessages = LS.get("vf_messages", []);
  const initLang      = LANGUAGES.find(l => l.code === savedLangCode) || LANGUAGES[0];

  const [showSplash,    setShowSplash]    = useState(true);
  const [lang,          setLang]          = useState(initLang);
  const [onboarded,     setOnboarded]     = useState(!!savedProfile);
  const [profile,       setProfile]       = useState(savedProfile || { income: "", goal: "", horizon: "", risk: "" });
  const [messages,      setMessages]      = useState(savedMessages);
  const [input,         setInput]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [listening,     setListening]     = useState(false);
  const [speaking,      setSpeaking]      = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [screen,        setScreen]        = useState("chat");
  const [streak,        setStreak]        = useState(LS.get("vf_streak", { count: 0 }));
  const [darkMode,      setDarkMode]      = useState(() => { try { return JSON.parse(localStorage.getItem("vf_dark") || "false"); } catch { return false; } });
  const [fontSize,      setFontSize]      = useState(() => { try { return localStorage.getItem("vf_fontsize") || "default"; } catch { return "default"; } });
  const [demoMode,      setDemoMode]      = useState(false);
  const [quizKey,       setQuizKey]       = useState(0);
  const [journeyStep,   setJourneyStep]   = useState(0);

  const bottomRef      = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef       = useRef(window.speechSynthesis);

  useEffect(() => { LS.set("vf_lang", lang.code); }, [lang]);
  useEffect(() => { if (profile.income) LS.set("vf_profile", profile); }, [profile]);
  useEffect(() => { if (messages.length) LS.set("vf_messages", messages.slice(-30)); }, [messages]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => {
    localStorage.setItem("vf_dark", JSON.stringify(darkMode));
    if (darkMode) document.body.classList.add("dark-bg");
    else document.body.classList.remove("dark-bg");
  }, [darkMode]);
  useEffect(() => { localStorage.setItem("vf_fontsize", fontSize); }, [fontSize]);
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
    const msg = "💰 VaaniFinance:\n\n" + text + "\n\n" + window.location.href;
    if (navigator.share) {
      navigator.share({ title: "VaaniFinance", text: msg }).catch(() => {});
    } else { window.open("https://wa.me/", "_blank"); }
  };

  const sendMessage = async (text, currentLang, currentMessages) => {
    const activeLang = currentLang || lang;
    if (!text.trim() || loading) return;
    synthRef.current?.cancel(); setSpeaking(false); setSpeakingIndex(null);
    const userMsg         = { role: "user", content: text };
    const updatedMessages = [...(currentMessages || messages), userMsg];
    setMessages(updatedMessages); setInput(""); setLoading(true);
    setJourneyStep(prev => Math.min(prev + 1, 1));
    try {
      let reply, sources = [], rag = null;
      if (isFinancialQuery(text)) {
        rag = await askWithRAG(text, activeLang.code, profile, updatedMessages);
        if (rag.usedRAG && rag.answer) { reply = rag.answer; sources = rag.sources; }
      }
      if (!reply) reply = await askAI(text, activeLang.code, profile, updatedMessages);
      setMessages(prev => [...prev, { role: "assistant", content: reply, sources, isOffline: rag?.isOffline || false, usedRAG: rag?.usedRAG || false, intent: rag?.intent || "general" }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: activeLang.errorMsg }]);
    } finally { setLoading(false); }
  };

  const navigateTo = (s) => {
    synthRef.current?.cancel();
    setScreen(s);
    const stepMap = { chat: 0, schemes: 2, calculator: 3 };
    if (stepMap[s] !== undefined) setJourneyStep(stepMap[s]);
  };

  const startVoice = async () => {
    synthRef.current?.cancel(); setSpeaking(false); setSpeakingIndex(null);
    if (listening) { recognitionRef.current?.abort(); recognitionRef.current = null; setListening(false); return; }
    try { await navigator.mediaDevices.getUserMedia({ audio: true }); } catch {
      alert("Mic permission denied."); return;
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
    const langName = { hi: "Hindi", ta: "Tamil", bn: "Bengali", mr: "Marathi", en: "English", hl: "Hinglish" }[lang.code];
    const langInstruction = lang.code === "hl"
      ? `STRICTLY in Hinglish ONLY — mix Hindi words with English words but write EVERYTHING in Roman/Latin script (English letters). NEVER use Devanagari (Hindi) script. Example style: "Aapke goal ke liye FD best hai, kyunki isme guaranteed return milta hai."`
      : `In ${langName} ONLY (no English)`;
    const silentPrompt = `User profile: savings=${profile.income}, goal="${profile.goal}", investment horizon="${profile.horizon}", risk tolerance="${profile.risk}". ${langInstruction}, give personalized investment advice in 4 short lines. Mention specific products suited for their exact goal, horizon and risk profile. Be warm, direct and specific.`;
    setMessages([{ role: "assistant", content: lang.greeting }]);
    const s = updateStreak(); setStreak(s);
    setTimeout(async () => {
      setLoading(true);
      try { const r = await askAI(silentPrompt, lang.code, profile, []); setMessages(p => [...p, { role: "assistant", content: r }]); }
      catch {} finally { setLoading(false); }
    }, 400);
  };

  // Streak label — fully localized
  const streakLangMap = { hi: `🔥 ${streak.count} दिन`, ta: `🔥 ${streak.count} நாள்`, bn: `🔥 ${streak.count} দিন`, mr: `🔥 ${streak.count} दिवस`, en: `🔥 ${streak.count} days` };
  const streakLabel = streak.count >= 2 ? streakLangMap[lang.code] : null;

  // Adaptive recommendation
  const getPersonalizedRec = () => {
    if (!profile.income || !profile.goal) return null;
    const isLow      = profile.income === "Less than ₹500" || profile.income === "₹500-2,000";
    const isShort    = profile.horizon === "< 1 year" || profile.horizon === "1-3 years";
    const isLowRisk  = profile.risk === "Low — guaranteed returns";
    const isHighRisk = profile.risk === "High — max growth potential";
    if (isLow && isLowRisk) return "Post Office RD";
    if (profile.goal === "Retirement" && !isShort) return "NPS + PPF";
    if (profile.goal === "Children's education" && !isShort) return isHighRisk ? "SSY + SIP" : "SSY + PPF";
    if (profile.goal === "Build a home") return "PPF + PMAY";
    if (isShort && isLowRisk) return "FD";
    if (isHighRisk && !isShort) return "SIP";
    if (isLow) return "Post Office RD";
    return "FD + PPF";
  };

  const bestPick = getPersonalizedRec();

  // ── SPLASH ──
  if (showSplash) return (
    <Splash onDone={(chosenLangCode) => {
      if (chosenLangCode) { const matched = LANGUAGES.find(l => l.code === chosenLangCode); if (matched) setLang(matched); }
      setShowSplash(false);
    }} />
  );

  // ── ONBOARDING ──
  if (!onboarded) return (
    <div className={`app${darkMode ? " dark" : ""}`}>
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

          <p className="onboard-label">{ONBOARD_TEXT.horizonLabel[lang.code]}</p>
          <div className="onboard-options">
            {HORIZON_OPTIONS.map(opt => (
              <button key={opt.en} className={`onboard-btn ${profile.horizon === opt.en ? "selected" : ""}`}
                onClick={() => setProfile(p => ({ ...p, horizon: opt.en }))}>{opt[lang.code]}</button>
            ))}
          </div>

          <p className="onboard-label">{ONBOARD_TEXT.riskLabel[lang.code]}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {RISK_OPTIONS.map(opt => (
              <button key={opt.en} className={`onboard-btn ${profile.risk === opt.en ? "selected" : ""}`}
                onClick={() => setProfile(p => ({ ...p, risk: opt.en }))}
                style={{ textAlign: "left" }}>{opt[lang.code]}</button>
            ))}
          </div>

          <button className="onboard-submit"
            disabled={!profile.income || !profile.goal || !profile.horizon || !profile.risk}
            onClick={handleOnboardSubmit}>
            {ONBOARD_TEXT.submit[lang.code]}
          </button>
        </div>
      </div>
    </div>
  );

  // ── MAIN APP ──
  const NavBtn = ({ screenKey, icon }) => {
    const isActive = screen === screenKey;
    return (
      <button className={`nav-btn ${isActive ? "nav-active" : ""}`} title={screenKey}
        onClick={() => {
          synthRef.current?.cancel();
          if (screenKey === "quiz" && screen !== "quiz") setQuizKey(k => k + 1);
          navigateTo(isActive ? "chat" : screenKey);
        }}>
        <span className="nav-icon">{icon}</span>
        <span className="nav-label">{lang.navLabels[screenKey] || ""}</span>
      </button>
    );
  };

  return (
    <div className={`app${darkMode ? " dark" : ""}${fontSize !== "default" ? ` fs-${fontSize}` : ""}`}>
      {/* ── HEADER ── */}
      <div className="header">
        <div className="header-left">
          <div className="header-title">💰 VaaniFinance</div>
          <div className="header-sub">AI Financial Advisor</div>
        </div>
        <div className="header-right">
          {streakLabel && (
            <span className="streak-chip">{streakLabel}</span>
          )}
          {/* Dark mode toggle */}
          <button className="dark-toggle-btn" onClick={() => setDarkMode(d => !d)}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* ── BOTTOM NAVIGATION ── */}
      <div className="bottom-nav">
        <button className={`nav-btn${screen === "chat" && !demoMode ? " nav-active" : ""}`} onClick={() => { synthRef.current?.cancel(); setDemoMode(false); navigateTo("chat"); }}>
          <span className="nav-icon">💬</span>
          <span className="nav-label">Chat</span>
        </button>
        <button className={`nav-btn${screen === "quiz" ? " nav-active" : ""}`} onClick={() => { synthRef.current?.cancel(); if (screen !== "quiz") setQuizKey(k => k + 1); navigateTo(screen === "quiz" ? "chat" : "quiz"); }}>
          <span className="nav-icon">🎯</span>
          <span className="nav-label">{lang.navLabels.quiz}</span>
        </button>
        <button className={`nav-btn${screen === "schemes" ? " nav-active" : ""}`} onClick={() => { synthRef.current?.cancel(); navigateTo(screen === "schemes" ? "chat" : "schemes"); }}>
          <span className="nav-icon">🏛️</span>
          <span className="nav-label">{lang.navLabels.schemes}</span>
        </button>
        <button className={`nav-btn${screen === "dashboard" ? " nav-active" : ""}`} onClick={() => { synthRef.current?.cancel(); navigateTo(screen === "dashboard" ? "chat" : "dashboard"); }}>
          <span className="nav-icon">📊</span>
          <span className="nav-label">{lang.navLabels.dashboard}</span>
        </button>
        <button className={`nav-btn${screen === "calculator" ? " nav-active" : ""}`} onClick={() => { synthRef.current?.cancel(); navigateTo(screen === "calculator" ? "chat" : "calculator"); }}>
          <span className="nav-icon">🧮</span>
          <span className="nav-label">{lang.navLabels.calculator}</span>
        </button>
        <button className={`nav-btn${screen === "partners" ? " nav-active" : ""}`} onClick={() => { synthRef.current?.cancel(); navigateTo(screen === "partners" ? "chat" : "partners"); }}>
          <span className="nav-icon">🏦</span>
          <span className="nav-label">{lang.navLabels.partners}</span>
        </button>
      </div>

      {/* ── LANGUAGE BAR ── */}
      <div className="lang-bar">
        {LANGUAGES.map(l => (
          <button key={l.code} className={`lang-btn ${lang.code === l.code ? "active" : ""}`} onClick={() => switchLang(l)}>{l.label}</button>
        ))}
      </div>

      {/* ── ROUTED SCREENS ── */}
      {demoMode ? (
        <GuidedDemo lang={lang} darkMode={darkMode} onExit={() => setDemoMode(false)} onNavigate={s => { setDemoMode(false); navigateTo(s); }} />
      ) : screen === "quiz"       ? <Quiz key={quizKey} darkMode={darkMode} lang={lang} onClose={() => navigateTo("chat")} /> :
         screen === "schemes"    ? <SchemesFinder profile={profile} lang={lang} /> :
         screen === "dashboard"  ? <Dashboard     profile={profile} lang={lang} /> :
         screen === "calculator" ? <Calculator    lang={lang} /> :
         screen === "partners"   ? <PartnerBanks  lang={lang} darkMode={darkMode} /> : (
        <>
          {/* Journey + disclaimer */}
          <JourneyBar lang={lang} currentStep={journeyStep} />
          <div className="disclaimer-bar">⚠️ {lang.disclaimer}</div>

          {!navigator.onLine && (
            <div className="offline-bar">{lang.offlineMsg}</div>
          )}

          {/* Trust + AI rec strip */}
          <InfoStrip lang={lang} darkMode={darkMode} profile={profile} bestPick={bestPick} />

          {/* ── CHAT AREA ── */}
          <div className="chat-area">
            {messages.map((m, i) => {
              const lastAiIndex = messages.reduce((last, msg, idx) => msg.role === "assistant" ? idx : last, -1);
              const isLastAi = m.role === "assistant" && i === lastAiIndex;
              return (
                <div key={i} className={`bubble ${m.role}`}>
                  {m.role === "assistant" ? (
                    <div className="ai-response">
                      <div className="ai-icon">🤖</div>
                      <div className="ai-text">
                        {m.sources && m.sources.length > 0 && (
                          <RAGIndicator
                            sources={m.sources}
                            intent={m.intent || "general"}
                            isOffline={m.isOffline}
                            darkMode={darkMode}
                            lang={lang.code}
                            expanded={false}
                          />
                        )}

                        <StructuredResponse
                          content={m.content}
                          profile={profile}
                          lang={lang}
                          darkMode={darkMode}
                          isLastAi={isLastAi}
                          onOpenCalc={() => { navigateTo("calculator"); setJourneyStep(3); }}
                          onOpenSchemes={() => { navigateTo("schemes"); setJourneyStep(2); }}
                          onAskNext={() => {
                            sendMessage(lang.actionPlanQ);
                            setJourneyStep(4);
                          }}
                        />

                        {/* Message actions — fully localized */}
                        <div className="msg-actions" style={{ marginTop: 10 }}>
                          {isLastAi && (
                            <>
                              <button
                                className={`action-btn ${speakingIndex === i ? "speaking" : ""}`}
                                onClick={() => handleSpeakBtn(m.content, i)}
                              >
                                {speakingIndex === i ? lang.stopBtn : lang.listenBtn}
                              </button>
                              <button className="action-btn" onClick={() => shareAdvice(m.content)}>
                                {lang.shareBtn}
                              </button>
                            </>
                          )}
                          <button className="action-btn" onClick={e => {
                            e.currentTarget.innerHTML = lang.helpfulBtn;
                            e.currentTarget.style.color = "#1a6b3c";
                            e.currentTarget.style.borderColor = "#1a6b3c";
                          }}>👍</button>
                          <button className="action-btn" onClick={e => {
                            e.currentTarget.innerHTML = lang.notHelpfulBtn;
                            e.currentTarget.style.color = "#e65100";
                          }}>👎</button>
                        </div>

                        {/* Sources */}
                        {m.sources && m.sources.length > 0 && (() => {
                          const unique = [...new Map(m.sources.map(s => [s.name.split(" - ")[0], s])).values()];
                          return (
                            <div className="source-box">
                              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: "#1a6b3c" }}>{lang.answeredFrom}</span>
                                <span className="govt-badge">✔ Blostem KB · Govt Verified</span>
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                {unique.map((s, si) => (
                                  <a key={si} href={s.url} target="_blank" rel="noreferrer" className="citation-badge">
                                    {s.name.split(" - ")[0]}
                                  </a>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  ) : m.content}
                </div>
              );
            })}

            {loading && (
              <div className="bubble assistant loading" style={{ flexDirection: "column", alignItems: "flex-start", padding: "14px 18px", gap: 7 }}>
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  <span className="dot-anim">●</span>
                  <span className="dot-anim" style={{ animationDelay: "0.2s" }}>●</span>
                  <span className="dot-anim" style={{ animationDelay: "0.4s" }}>●</span>
                </div>
                <span style={{ fontSize: 12.5, color: "#1a6b3c", fontStyle: "italic", fontWeight: 600, animation: "fadeIn 0.4s ease" }}>
                  {lang.loadingMsg}
                </span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* ── QUICK CHIPS ── */}
          <div className="quick-btns">
            <button className="quick-btn" style={{
              background: "linear-gradient(135deg,#1a6b3c,#0f4a28)",
              color: "white", border: "none",
              fontWeight: 800,
              boxShadow: "0 3px 14px rgba(26,107,60,0.42)",
              fontSize: 12.5, padding: "8px 18px",
            }} onClick={() => setDemoMode(true)}>
              {lang.demoBtn}
            </button>
            <button className="quick-btn" onClick={() => navigateTo("partners")} style={{
              background: darkMode
                ? "linear-gradient(135deg,#0d1a20,#0a1520)"
                : "linear-gradient(135deg,#e3f2fd,#bbdefb)",
              color: darkMode ? "#64b5f6" : "#1565c0",
              border: `2px solid ${darkMode ? "#1a3a5c" : "#90caf9"}`,
              fontWeight: 800, fontSize: 12.5, padding: "8px 16px",
              boxShadow: "0 2px 10px rgba(21,101,192,0.2)",
              whiteSpace: "nowrap",
            }}>
              {lang.partnerBtn}
            </button>
            {lang.quick.map((q, i) => (
              <button key={i} className="quick-btn" onClick={() => sendMessage(q)}>{q}</button>
            ))}
          </div>

          {/* ── INPUT ROW ── */}
          <div className="input-row">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage(input)}
              placeholder={lang.placeholder}
              disabled={loading}
            />
            <button className={`mic-btn ${listening ? "active" : ""}`} onClick={startVoice}>
              {listening ? "🔴" : "🎤"}
            </button>
            <button className="send-btn" onClick={() => sendMessage(input)} disabled={loading}>➤</button>
          </div>
        </>
      )}
    </div>
  );
}