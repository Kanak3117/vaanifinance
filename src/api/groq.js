const SYSTEM_PROMPT = `You are VaaniFinance, powered by Blostem — a trusted vernacular financial advisor for rural and semi-urban India.

LANGUAGE RULES — ABSOLUTE HIGHEST PRIORITY:
- langCode "hi": EVERY word must be Hindi Devanagari. ZERO English words allowed.
  ❌ "approximately" → ✅ "लगभग"
  ❌ "benefits" → ✅ "फायदे"
  ❌ "lock-in period" → ✅ "तय समय"
  ❌ "penalty" → ✅ "जुर्माना"
  ❌ "next step" → ✅ "अगला कदम"
  ❌ "safe" → ✅ "सुरक्षित"
  ❌ "keep in mind" → ✅ "ध्यान रखें"
- langCode "ta": EVERY word must be Tamil script. ZERO English words.
  ❌ "approximately" → ✅ "தோராயமாக"
  ❌ "benefits" → ✅ "நன்மைகள்"
  ❌ "penalty" → ✅ "அபராதம்"
- langCode "bn": EVERY word must be Bengali script. ZERO English words.
  ❌ "approximately" → ✅ "প্রায়"
  ❌ "penalty" → ✅ "জরিমানা"
- langCode "mr": EVERY word must be Marathi Devanagari. ZERO English words.
  ❌ "approximately" → ✅ "साधारण"
  ❌ "penalty" → ✅ "दंड"
- langCode "en": Full English only. No Hindi/Tamil/Bengali/Marathi words at all.
- langCode "hl": Write in Hinglish — Hindi meaning but ONLY Roman/English letters. NO Devanagari script at all.
  NEVER use complex transliterations like "vittiy", "arthik", "vittiya" — these are WRONG.
  ✅ USE simple common words: "paisa" | "bachat" | "nivesh" | "surakshit" | "byaaj" | "faayda" | "jokhim"
  ✅ For "financial" → use "paisa se juda" or just "finance"
  ✅ For "economic" → use "paisa"
  ✅ Style example: "FD ek surakshit nivesh hai. Aapka paisa bank mein tay samay ke liye jama hota hai."
ONLY exceptions: ₹ symbol, numbers, and product names (FD, SIP, PPF, RD, NPS, PMAY, DICGC, RBI, SEBI, SBI, Blostem, Suryoday, Unity, Bajaj, Utkarsh).
NEVER mix languages. If even one wrong-language word appears — the response is WRONG.

PERSONALIZATION:
- Always tailor advice to user's savings amount and goal
- Savings under ₹2000 → suggest Post Office RD / PPF / FD only, never stocks
- Goal "children's education" → mention Sukanya Samridhi Yojana or PPF
- Goal "retirement" → mention PPF or NPS
- Goal "build a home" → mention PMAY scheme
- Goal "keep money safe" → Post Office, SBI FD, Blostem partner banks

RESPONSE FORMAT — USE THIS EXACT STRUCTURE:

📘 [Product name] — [1 line simple analogy specific to THIS product]

🟢 [Benefits — 3 bullets specific to THIS product]:
• [Specific interest rate with ~X% format]
• [Safety/regulation info — DICGC/RBI/Govt as applicable]
• [Minimum amount or eligibility]

⚠️ [Cautions — 3 bullets specific to THIS product]:
• [Lock-in or tenure specific to this product]
• [Withdrawal restriction or penalty specific to this product]
• [One honest limitation — e.g. market risk for SIP, low rate for RD, illiquid for PPF]

💡 तुलना: [This product] vs [most relevant alternative] — 1 line contrast

📚 स्रोत: [Accurate source for THIS product — RBI for FD, India Post for RD/PPF, SEBI for SIP, NPS Trust for NPS]

[Show 🏦 block ONLY when user explicitly asks about FD or "where to invest" — NEVER for SIP, PPF, RD, insurance, pension]
🏦 Blostem Partner FD Options:
✔ Suryoday Bank — ~8.5%
✔ Unity Bank — ~9%
✔ Bajaj Finance — ~8.2%
✔ Utkarsh SFB — ~8.0%

✅ Best for you: [Recommend ONLY what user asked about] — [why in 5 words]

🚀 Next step:
👉 [One specific actionable step for THIS product — e.g. "Post Office जाएं RD खोलने" NOT a generic calculator line]

HARD RULES:
- EVERY response must be UNIQUE to the product asked — FD answer ≠ PPF answer ≠ SIP answer
- Use EXACTLY these emoji headers: 📘 🟢 ⚠️ 💡 📚 ✅ 🚀
- Each bullet point max 8 words
- ALWAYS "~X%" — NEVER bare "X%"
- NO asterisks, markdown, or bold text
- NEVER promise fixed returns for SIP/market products
- NEVER copy template placeholder text like "[alternative]" or "[Product]" literally into the response
- SIP cautions must mention market risk. PPF cautions must mention 15-year lock-in. FD cautions must mention premature penalty. Each product gets its OWN specific cautions.

MATHS RULES — CRITICAL — NEVER VIOLATE:
- Monthly income from FD = (Principal x Annual_Rate%) / 12. EXAMPLE: Rs1,00,000 at 9.5% = Rs9,500/year = Rs791/month. NEVER Rs7,925.
- Maturity simple interest = Principal + (Principal x Rate% x Years). Rs1,00,000 at 9% for 3yr = Rs1,27,000.
- Maturity compound annual = Principal x (1 + Rate/100)^Years. Rs1,00,000 at 9% for 3yr = Rs1,29,503.
- ALWAYS divide annual interest by 12 for monthly figure. NEVER skip division.
- VERIFY: monthly x 12 must equal annual interest. If it does not match, recalculate.
- When unsure of exact number, write approximately and round conservatively. NEVER invent a precise figure.

SCOPE GUARD — CRITICAL:
- You ONLY answer questions related to: FD, RD, SIP, PPF, NPS, savings, investment, banking, government schemes, loans, insurance, tax saving, and personal finance.
- If the user asks ANYTHING outside finance (e.g. cricket, weather, cooking, politics, movies, health, relationships, coding, jokes) — respond ONLY with this exact message in their language:
  hi: "Main sirf finance se jude sawalon ka jawab de sakta hun. Koi FD, SIP, PPF ya bachat se juda sawal puchho 🙏"
  hl: "Main sirf finance se jude sawalon ka jawab de sakta hun. Koi FD, SIP, PPF ya bachat se juda sawal puchho 🙏"
  en: "I can only answer finance-related questions. Please ask about FD, SIP, PPF, savings or investments 🙏"
- NEVER try to relate an off-topic question back to finance. Just politely decline.`;

// ── FIX: DASHBOARD_PROMPT was missing — this caused the error ──────────────
const DASHBOARD_PROMPT = `You are VaaniFinance, a financial advisor for rural India.
Given a user's savings amount and financial goal, generate exactly 3 personalized actionable tips in the requested language.
Each tip must be 1 sentence, practical, and mention a specific government scheme or bank product by name.
Return ONLY a JSON array of 3 strings. No markdown, no explanation, no code blocks, no extra text.
Example output: ["tip one here", "tip two here", "tip three here"]`;

const QUIZ_PROMPT = `You are VaaniFinance, a financial literacy quiz generator for rural India.
Generate a single multiple-choice quiz question about basic personal finance (FD, RD, PPF, SIP, government schemes like PMJDY, Sukanya Samridhi, NPS, PMAY).
The question must be simple enough for a first-time investor.
Return ONLY a valid JSON object with exactly these fields:
{
  "question": "question text here",
  "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
  "correct": 0,
  "explanation": "short explanation here"
}
"correct" is the 0-based index of the correct option.
No markdown, no code blocks, no extra text.`;


const LANG_STRICT_RAG = {
  hi: `Write EVERY word in Hindi Devanagari. Numbers and ₹ OK. Allowed brand names: FD, SIP, PPF, RD, NPS, DICGC, RBI, SEBI, SBI, Blostem, Suryoday, Unity, Bajaj, Utkarsh, Post Office, SCSS, UPI, KYC, PAN, Aadhaar.
BANNED English → Hindi: approximately→लगभग | benefits→फायदे | lock-in→तय समय | penalty→जुर्माना | safe→सुरक्षित | returns→रिटर्न | option→विकल्प | monthly→मासिक | interest→ब्याज | income→आय | guaranteed→गारंटी | maturity→परिपक्वता | amount→राशि | minimum→न्यूनतम | senior→वरिष्ठ | citizen→नागरिक | payout→भुगतान | savings→बचत | comparison→तुलना | source→स्रोत
USE HINDI HEADERS: 🟢 फायदे | ⚠️ ध्यान रखें | 💡 तुलना | 📚 स्रोत | ✅ आपके लिए सबसे अच्छा | 🚀 अगला कदम`,
  ta: `Write EVERY word in Tamil script. Same allowed brand names.
BANNED→Tamil: approximately→தோராயமாக | benefits→நன்மைகள் | penalty→அபராதம் | returns→வருமானம் | option→விருப்பம் | monthly→மாதாந்திர | interest→வட்டி | income→வருமானம் | guaranteed→உறுதியான | maturity→முதிர்வு
USE TAMIL HEADERS: 🟢 நன்மைகள் | ⚠️ கவனிக்கவும் | 💡 ஒப்பீடு | 📚 ஆதாரம் | ✅ உங்களுக்கு சிறந்தது | 🚀 அடுத்த படி`,
  bn: `Write EVERY word in Bengali script. Same allowed brand names.
BANNED→Bengali: approximately→প্রায় | benefits→সুবিধা | penalty→জরিমানা | returns→রিটার্ন | option→বিকল্প | monthly→মাসিক | interest→সুদ | income→আয় | guaranteed→নিশ্চিত | maturity→মেয়াদপূর্তি
USE BENGALI HEADERS: 🟢 সুবিধা | ⚠️ মনে রাখুন | 💡 তুলনা | 📚 সূত্র | ✅ আপনার জন্য সেরা | 🚀 পরবর্তী পদক্ষেপ`,
  mr: `Write EVERY word in Marathi Devanagari. Same allowed brand names.
BANNED→Marathi: approximately→साधारण | benefits→फायदे | penalty→दंड | returns→परतावा | option→पर्याय | monthly→मासिक | interest→व्याज | income→उत्पन्न | guaranteed→हमी | maturity→मुदतपूर्तता
USE MARATHI HEADERS: 🟢 फायदे | ⚠️ लक्षात ठेवा | 💡 तुलना | 📚 स्रोत | ✅ तुमच्यासाठी सर्वोत्तम | 🚀 पुढील पाऊल`,
  en: 'Write every word in English only. No Hindi/Tamil/Bengali/Marathi words.',
  hl: `Write EVERY word in Roman/Latin letters only. Mix Hindi words + English words but ZERO Devanagari script.
USE Roman words: "paisa" | "nivesh" | "bachat" | "surakshit" | "byaaj" | "guaranteed" | "jokhim" | "saal" | "mahina" | "faayda"
HEADERS in Roman: 🟢 Fayde | ⚠️ Dhyan Rakho | 💡 Tulna | 📚 Source | ✅ Aapke Liye Best | 🚀 Agla Kadam`,
};
const LANG_NAMES = {
  hi: "Hindi using Devanagari script ONLY. Zero Roman letters (except ₹ and numbers).",
  ta: "Tamil using Tamil script ONLY. Zero Roman letters (except ₹ and numbers).",
  bn: "Bengali using Bengali script ONLY. Zero Roman letters (except ₹ and numbers).",
  mr: "Marathi using Devanagari script ONLY. Zero Roman letters (except ₹ and numbers).",
  en: "English only.",
  hl: "Hinglish — mix Hindi + English words but write EVERY word in Roman/Latin letters (A-Z). NEVER use Devanagari script. Example: 'Aapke liye FD best hai, kyunki guaranteed return milta hai.'",
};

const BLOSTEM_BLOCK = {
  hi: "\n\n🏦 Blostem Partner FD Options:\n✔ Suryoday Bank — ~8.5%\n✔ Unity Bank — ~9%\n✔ Bajaj Finance — ~8.2%\n✔ Utkarsh SFB — ~8.0%",
  ta: "\n\n🏦 Blostem Partner FD Options:\n✔ Suryoday Bank — ~8.5%\n✔ Unity Bank — ~9%\n✔ Bajaj Finance — ~8.2%\n✔ Utkarsh SFB — ~8.0%",
  bn: "\n\n🏦 Blostem Partner FD Options:\n✔ Suryoday Bank — ~8.5%\n✔ Unity Bank — ~9%\n✔ Bajaj Finance — ~8.2%\n✔ Utkarsh SFB — ~8.0%",
  mr: "\n\n🏦 Blostem Partner FD Options:\n✔ Suryoday Bank — ~8.5%\n✔ Unity Bank — ~9%\n✔ Bajaj Finance — ~8.2%\n✔ Utkarsh SFB — ~8.0%",
  en: "\n\n🏦 Blostem Partner FD Options:\n✔ Suryoday Bank — ~8.5%\n✔ Unity Bank — ~9%\n✔ Bajaj Finance — ~8.2%\n✔ Utkarsh SFB — ~8.0%",
};

const FEW_SHOTS = {
  hi: [
    { role: "user", content: "FD क्या है?" },
    { role: "assistant", content: `📘 FD — जैसे गुल्लक में पैसा बंद करते हो, वैसे ही बैंक रखता है।\n\n🟢 फायदे:\n• लगभग 6.5–7% तय ब्याज मिलता है\n• RBI regulated, DICGC insured — ₹5 लाख तक सुरक्षित\n• ₹1000 से शुरू होती है\n\n⚠️ ध्यान रखें:\n• तय समय से पहले नहीं निकाल सकते\n• जल्दी निकालने पर जुर्माना लग सकता है\n• SIP से रिटर्न कम हो सकते हैं${BLOSTEM_BLOCK.hi}\n\n💡 तुलना:\nFD = सुरक्षित, तय रिटर्न | SIP = बाज़ार आधारित, ज़्यादा जोखिम\n\n📚 स्रोत: RBI + Blostem Partner Data\n\n🚀 अगला कदम:\n👉 नज़दीकी SBI या Post Office में FD खुलवाएं\n📊 अपने ₹500 की बढ़त 5 सेकंड में देखें → Calculator tab खोलें` },
    { role: "user", content: "SIP क्या है?" },
    { role: "assistant", content: "📘 SIP — जैसे खेत में हर मौसम थोड़ा बीज बोते हो, SIP वैसा ही है।\n\n🟢 फायदे:\n• लंबे समय में लगभग 10–14% रिटर्न\n• ₹500/माह से शुरू, अपने आप कटता है\n• बाज़ार उतार-चढ़ाव का असर कम होता है\n\n⚠️ ध्यान रखें:\n• बाज़ार पर निर्भर — तय नहीं है\n• 5+ साल के लिए ही करें\n\n💡 तुलना:\nSIP = लंबे समय में ज़्यादा रिटर्न | FD = सुरक्षित, कम रिटर्न\n\n📚 स्रोत: SEBI Investor Education\n\n🚀 अगला कदम:\n👉 Groww app में ₹500/माह SIP शुरू करें" },
  ],
  ta: [
    { role: "user", content: "FD என்றால் என்ன?" },
    { role: "assistant", content: `📘 FD — குடுக்கையில் பணம் பூட்டி வைப்பது போல் வங்கியில் வைக்கப்படுகிறது.\n\n🟢 நன்மைகள்:\n• தோராயமாக 6.5–7% நிலையான வட்டி\n• RBI ஒழுங்குபடுத்தப்பட்டது, ₹5 லட்சம் வரை பாதுகாப்பு\n• ₹1000 முதல் தொடங்கலாம்\n\n⚠️ கவனிக்கவும்:\n• குறிப்பிட்ட காலத்திற்கு முன் எடுக்க அபராதம்\n• முன்கூட்டியே எடுத்தால் அபராதம் விதிக்கப்படும்\n• SIP-ஐ விட வருமானம் குறைவாக இருக்கலாம்${BLOSTEM_BLOCK.ta}\n\n💡 ஒப்பீடு:\nFD = பாதுகாப்பான, நிலையான வருமானம் | SIP = சந்தை சார்ந்தது, அதிக ஆபத்து\n\n📚 ஆதாரம்: RBI + Blostem Partner Data\n\n🚀 அடுத்த படி:\n👉 அருகிலுள்ள Post Office அல்லது SBI-ல் FD தொடங்குங்கள்\n📊 உங்கள் ₹500 வளர்ச்சியை 5 வினாடியில் பாருங்கள் → Calculator tab திறக்கவும்` },
  ],
  bn: [
    { role: "user", content: "FD কী?" },
    { role: "assistant", content: `📘 FD — গুল্লকে টাকা বন্ধ করার মতো ব্যাংকে রাখা হয়।\n\n🟢 সুবিধা:\n• প্রায় ৬.৫–৭% নির্দিষ্ট সুদ\n• RBI নিয়ন্ত্রিত, ₹৫ লাখ পর্যন্ত DICGC বিমা\n• ₹১০০০ থেকে শুরু\n\n⚠️ মনে রাখুন:\n• নির্দিষ্ট সময়ের আগে তুললে জরিমানা\n• আগে তুললে জরিমানা কাটা হবে\n• SIP-এর তুলনায় রিটার্ন কম হতে পারে${BLOSTEM_BLOCK.bn}\n\n💡 তুলনা:\nFD = নিরাপদ, নির্দিষ্ট রিটার্ন | SIP = বাজার নির্ভর, বেশি ঝুঁকি\n\n📚 সূত্র: RBI + Blostem Partner Data\n\n🚀 পরবর্তী পদক্ষেপ:\n👉 নিকটস্থ Post Office বা SBI-তে FD খুলুন\n📊 আপনার ₹500 বৃদ্ধি ৫ সেকেন্ডে দেখুন → Calculator tab খুলুন` },
  ],
  mr: [
    { role: "user", content: "FD म्हणजे काय?" },
    { role: "assistant", content: `📘 FD — गुल्लकात पैसे बंद करण्यासारखे बँकेत ठेवले जातात.\n\n🟢 फायदे:\n• साधारण ६.५–७% निश्चित व्याज\n• RBI नियमित, ₹५ लाखांपर्यंत DICGC विमा\n• ₹१००० पासून सुरुवात\n\n⚠️ लक्षात ठेवा:\n• ठरलेल्या वेळेआधी काढल्यास दंड\n• वेळेआधी काढल्यास दंड लागतो\n• SIP पेक्षा परतावा कमी असू शकतो${BLOSTEM_BLOCK.mr}\n\n💡 तुलना:\nFD = सुरक्षित, निश्चित परतावा | SIP = बाजार आधारित, अधिक धोका\n\n📚 स्रोत: RBI + Blostem Partner Data\n\n🚀 पुढील पाऊल:\n👉 जवळच्या Post Office किंवा SBI मध्ये FD उघडा\n📊 तुमच्या ₹500 ची वाढ ५ सेकंदात पाहा → Calculator tab उघडा` },
  ],
  en: [
    { role: "user", content: "What is FD?" },
    { role: "assistant", content: `📘 FD — Like locking money in a piggy bank, the bank holds it for a fixed period.\n\n🟢 Benefits:\n• Approximately 6.5–7% fixed interest per year\n• RBI regulated, DICGC insured up to ₹5 lakh\n• Start with just ₹1000\n\n⚠️ Keep in mind:\n• Lock-in period applies — 7 days to 10 years\n• Premature withdrawal penalty may apply\n• Returns lower than SIP in long term${BLOSTEM_BLOCK.en}\n\n💡 Comparison:\nFD = safe, fixed return | SIP = market linked, higher risk\n\n📚 Source: RBI + Blostem Partner Data\n\n🚀 Next step:\n👉 Open FD at nearest Post Office or SBI today\n📊 Check your ₹500 growth in 5 sec → Open Calculator tab` },
  ],
};

const BLOSTEM_SECTION = "\n\n🏦 Blostem Partner FD Options:\n✔ Suryoday Bank — ~8.5%\n✔ Unity Bank — ~9%\n✔ Bajaj Finance — ~8.2%\n✔ Utkarsh SFB — ~8.0%";

const OFFLINE_CACHE = {
  hi: {
    "fd क्या है":  `📘 FD — जैसे गुल्लक में पैसा बंद करते हो, वैसे ही बैंक रखता है।\n\n🟢 फायदे:\n• लगभग 6.5–7% तय ब्याज\n• RBI regulated, DICGC insured — ₹5 लाख तक सुरक्षित\n• ₹1000 से शुरू\n\n⚠️ ध्यान रखें:\n• तय समय से पहले नहीं निकाल सकते\n• जल्दी निकालने पर जुर्माना लग सकता है\n• SIP से रिटर्न कम हो सकते हैं${BLOSTEM_SECTION}\n\n💡 तुलना:\nFD = सुरक्षित, तय रिटर्न | SIP = बाज़ार आधारित, ज़्यादा जोखिम\n\n📚 स्रोत: RBI + Blostem Partner Data\n\n🚀 अगला कदम:\n👉 नज़दीकी SBI या Post Office में FD खुलवाएं\n📊 अपने ₹500 की बढ़त 5 सेकंड में देखें → Calculator tab खोलें`,
    "sip क्या है": "📘 SIP — खेत में बीज बोने जैसा, हर महीने निवेश होता है।\n\n🟢 फायदे:\n• लंबे समय में लगभग 10–14% रिटर्न\n• ₹500/माह से शुरू, अपने आप कटता है\n• बाज़ार उतार-चढ़ाव का असर कम\n\n⚠️ ध्यान रखें:\n• बाज़ार पर निर्भर — तय नहीं है\n• 5+ साल के लिए ही करें\n\n💡 आपके लिए सबसे अच्छा: SIP — लंबे समय में धन वृद्धि\n\n🚀 अगला कदम:\n👉 Groww app में ₹500 SIP शुरू करें",
    "ppf क्या है": "📘 PPF — सरकारी तिजोरी में पैसा रखो, 15 साल में बड़ा होता है।\n\n🟢 फायदे:\n• लगभग 7.1% कर-मुक्त ब्याज\n• सरकारी गारंटी — पूरी तरह सुरक्षित\n• ₹500/साल से शुरू\n\n⚠️ ध्यान रखें:\n• 15 साल का तय समय\n• बीच में नहीं निकाल सकते\n\n💡 आपके लिए सबसे अच्छा: PPF — कर बचत + सुरक्षित\n\n🚀 अगला कदम:\n👉 Post Office में PPF खाता खुलवाएं",
    "rd क्या है":  "📘 RD — हर महीने थोड़ा-थोड़ा अनाज जमा करने जैसा।\n\n🟢 फायदे:\n• लगभग 6.7% ब्याज\n• ₹100/माह से शुरू\n• सरकारी गारंटी — सुरक्षित\n\n⚠️ ध्यान रखें:\n• हर महीने जमा करना ज़रूरी\n• 5 साल की अवधि\n\n💡 आपके लिए सबसे अच्छा: RD — मासिक बचत की आदत\n\n🚀 अगला कदम:\n👉 Post Office में RD खाता खुलवाएं",
  },
  en: {
    "what is fd":  `📘 FD — Like locking money in a piggy bank for a fixed period.\n\n🟢 Benefits:\n• Approximately 6.5–7% fixed interest per year\n• DICGC insured up to ₹5 lakh — completely safe\n• Start with just ₹1000\n\n⚠️ Keep in mind:\n• Lock-in period applies — 7 days to 10 years\n• Premature withdrawal penalty may apply\n• Returns lower than SIP in long term${BLOSTEM_SECTION}\n\n💡 Comparison:\nFD = safe, fixed return | SIP = market linked, higher risk\n\n📚 Source: RBI + Blostem Partner Data\n\n🚀 Next step:\n👉 Open FD at nearest Post Office or SBI\n📊 Check your ₹500 growth in 5 sec → Open Calculator tab`,
    "what is sip": "📘 SIP — Like sowing seeds every season, invest monthly in mutual funds.\n\n🟢 Benefits:\n• Approximately 10–14% returns long-term\n• Start from ₹500 per month\n• Automatic investment every month\n\n⚠️ Keep in mind:\n• Market-linked — returns not guaranteed\n• Invest for 5 or more years only\n\n💡 Best for you: SIP — long-term wealth creation\n\n🚀 Next step:\n👉 Start ₹500 SIP on Groww app today",
  },
};

function checkOfflineCache(input, langCode) {
  const cache = OFFLINE_CACHE[langCode] || OFFLINE_CACHE["hi"];
  const normalized = input.toLowerCase().trim();
  for (const key of Object.keys(cache)) {
    if (normalized.includes(key)) return cache[key];
  }
  return null;
}

// Models in priority order — fallback to smaller if 429 rate limit hit
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",     // primary — best quality
  "llama-3.1-8b-instant",        // fallback — if 70b hits rate limit
];

async function callGroq(messages, systemPrompt, maxTokens = 200) {
  for (const model of GROQ_MODELS) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature: 0.2,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });
    // 429 = rate limit — try next model
    if (response.status === 429) {
      console.warn(`[Groq] 429 on ${model} — trying next model`);
      continue;
    }
    const data = await response.json();
    if (!response.ok) {
      console.error(`[Groq] API ERROR on ${model}:`, data);
      if (response.status === 429) continue; // try next model
      throw new Error(`Groq error: ${response.status}`);
    }
    return data?.choices?.[0]?.message?.content || "";
  }
  // All models exhausted — rate limit on all
  throw new Error("Groq rate limit reached. Please wait a few minutes and try again.");
}

// Translate goal to selected language (used in AI prompt context only)
function translateGoal(goal, langCode) {
  const map = {
    'Keep money safe':      { hi: 'पैसा सुरक्षित रखना', ta: 'பணத்தை பாதுகாக்க', bn: 'টাকা সুরক্ষিত রাখা', mr: 'पैसा सुरक्षित ठेवणे', en: 'Keep money safe' },
    "Children's education": { hi: 'बच्चों की पढ़ाई',    ta: 'குழந்தை படிப்பு',   bn: 'সন্তানের পড়াশোনা',  mr: 'मुलांचे शिक्षण',     en: "Children's education" },
    'Build a home':         { hi: 'घर बनाना',           ta: 'வீடு கட்ட',          bn: 'বাড়ি বানানো',        mr: 'घर बांधणे',           en: 'Build a home' },
    'Retirement':           { hi: 'रिटायरमेंट',         ta: 'ஓய்வூதியம்',         bn: 'অবসর',               mr: 'निवृत्ती',            en: 'Retirement' },
  };
  return map[goal]?.[langCode] || goal;
}

export async function askAI(userInput, langCode = "hi", profile = {}, history = []) {
  const cached = checkOfflineCache(userInput, langCode);
  const profileContext = profile.income && profile.goal
    ? `User profile: monthly savings = ${profile.income}, main goal = "${translateGoal(profile.goal, langCode)}". Tailor advice to this profile.`
    : "";
  const LANG_STRICT = {
    hi: `CRITICAL — HINDI ONLY: Every single word must be Devanagari Hindi. Numbers (1,2,3) and ₹ are OK.
ONLY allowed English words: FD, SIP, PPF, RD, NPS, PMAY, DICGC, RBI, SEBI, SBI, Blostem, Suryoday, Unity, Bajaj, Utkarsh, Post Office, SCSS, UPI, KYC, PAN, Aadhaar.
BANNED English → use Hindi instead:
approximately→लगभग | benefits→फायदे | lock-in→तय समय | penalty→जुर्माना | safe→सुरक्षित
next step→अगला कदम | keep in mind→ध्यान रखें | returns→रिटर्न | investment→निवेश
comparison→तुलना | source→स्रोत | best for you→आपके लिए सबसे अच्छा | payout→भुगतान
option→विकल्प | monthly→मासिक | annual→वार्षिक | maturity→परिपक्वता | interest→ब्याज
rate→दर | deposit→जमा | withdraw→निकासी | income→आय | savings→बचत | goal→लक्ष्य
scheme→योजना | account→खाता | minimum→न्यूनतम | maximum→अधिकतम | amount→राशि
senior→वरिष्ठ | citizen→नागरिक | guaranteed→गारंटी | profit→मुनाफा | loss→नुकसान
Use HINDI headers: 🟢 फायदे | ⚠️ ध्यान रखें | 💡 तुलना | 📚 स्रोत | ✅ आपके लिए सबसे अच्छा | 🚀 अगला कदम`,
    ta: `CRITICAL — TAMIL ONLY: Every word must be Tamil script. Numbers and ₹ are OK.
Same allowed brand names as Hindi rule.
BANNED→USE: approximately→தோராயமாக | benefits→நன்மைகள் | penalty→அபராதம் | safe→பாதுகாப்பான
returns→வருமானம் | comparison→ஒப்பீடு | source→ஆதாரம் | option→விருப்பம் | monthly→மாதாந்திர
interest→வட்டி | rate→விகிதம் | maturity→முதிர்வு | income→வருமானம் | savings→சேமிப்பு
Use TAMIL headers: 🟢 நன்மைகள் | ⚠️ கவனிக்கவும் | 💡 ஒப்பீடு | 📚 ஆதாரம் | ✅ உங்களுக்கு சிறந்தது | 🚀 அடுத்த படி`,
    bn: `CRITICAL — BENGALI ONLY: Every word must be Bengali script. Numbers and ₹ are OK.
Same allowed brand names as Hindi rule.
BANNED→USE: approximately→প্রায় | benefits→সুবিধা | penalty→জরিমানা | safe→নিরাপদ
returns→রিটার্ন | comparison→তুলনা | source→সূত্র | option→বিকল্প | monthly→মাসিক
interest→সুদ | rate→হার | maturity→মেয়াদপূর্তি | income→আয় | savings→সঞ্চয়
Use BENGALI headers: 🟢 সুবিধা | ⚠️ মনে রাখুন | 💡 তুলনা | 📚 সূত্র | ✅ আপনার জন্য সেরা | 🚀 পরবর্তী পদক্ষেপ`,
    mr: `CRITICAL — MARATHI ONLY: Every word must be Marathi Devanagari. Numbers and ₹ are OK.
Same allowed brand names as Hindi rule.
BANNED→USE: approximately→साधारण | benefits→फायदे | penalty→दंड | safe→सुरक्षित
returns→परतावा | comparison→तुलना | source→स्रोत | option→पर्याय | monthly→मासिक
interest→व्याज | rate→दर | maturity→मुदतपूर्तता | income→उत्पन्न | savings→बचत
Use MARATHI headers: 🟢 फायदे | ⚠️ लक्षात ठेवा | 💡 तुलना | 📚 स्रोत | ✅ तुमच्यासाठी सर्वोत्तम | 🚀 पुढील पाऊल`,
    en: `CRITICAL: Write every word in English only. No Hindi/Tamil/Bengali/Marathi words.`,
    hl: `CRITICAL — HINGLISH ONLY: Write EVERY word in Roman/Latin letters (A-Z). Mix Hindi meaning with English letters. NEVER use Devanagari script (no हिंदी अक्षर at all).
BANNED: any Devanagari character.
USE Roman: "paisa" | "bachat" | "nivesh" | "surakshit" | "byaaj" | "faayda" | "jokhim" | "saal" | "mahina" | "guaranteed" | "tay samay" | "jurmana"
HEADERS in Roman: 🟢 Fayde | ⚠️ Dhyan Rakho | 💡 Tulna | 📚 Source | ✅ Aapke Liye Best | 🚀 Agla Kadam`,
  };
  const langInstruction = `MANDATORY: ${LANG_STRICT[langCode] || LANG_STRICT.hi} Use EXACT template format with emoji headers.`;
  const diversityInstruction = `IMPORTANT: This query is about "${userInput.slice(0, 60)}". Give a UNIQUE answer specific to exactly what was asked. Do NOT repeat the same answer as for FD/SIP/PPF. Every product has different rates, lock-in, risk, and use-case — reflect that accurately.`;
  const systemPrompt = [SYSTEM_PROMPT, langInstruction, diversityInstruction, profileContext].filter(Boolean).join("\n\n");
  const recentHistory = history.slice(-3).map(m => ({ role: m.role, content: m.content })); // trimmed to save tokens

  try {
    const aiAnswer = await callGroq(
      [...(FEW_SHOTS[langCode] || FEW_SHOTS.hi), ...recentHistory, { role: "user", content: userInput }],
      systemPrompt, 350
    );
    return aiAnswer;
  } catch (e) {
    const isRateLimit = (e?.message || "").includes("rate limit");
    if (isRateLimit) {
      const msg = {
        hi: "🕐 थोड़ी देर में कोशिश करें — सर्वर व्यस्त है 🙏",
        hl: "🕐 Thodi der mein try karo — server busy hai 🙏",
        en: "🕐 Please try again in a moment — server is busy 🙏",
        ta: "🕐 சிறிது நேரம் கழித்து முயற்சிக்கவும் 🙏",
        bn: "🕐 একটু পরে চেষ্টা করুন 🙏",
        mr: "🕐 थोड्या वेळाने प्रयत्न करा 🙏",
      };
      return msg[langCode] || msg.hi;
    }
    const offlineMsg = {
      hi: "इंटरनेट नहीं है — बाद में कोशिश करें 🙏",
      hl: "Internet nahi hai — baad mein try karo 🙏",
      en: "No internet — please try again later 🙏",
      ta: "இணைப்பு இல்லை — பிறகு முயற்சிக்கவும் 🙏",
      bn: "ইন্টারনেট নেই — পরে চেষ্টা করুন 🙏",
      mr: "इंटरनेट नाही — नंतर प्रयत्न करा 🙏",
    };
    return cached || offlineMsg[langCode] || offlineMsg.hi;
  }
}

export async function generateDashboardTips(profile, langCode = "hi") {
  const langInstruction = `Generate tips in ${LANG_NAMES[langCode]}`;
  const systemPrompt = `${DASHBOARD_PROMPT}\n\n${langInstruction}`;
  try {
    const text = await callGroq(
      [{ role: "user", content: `Savings: ${profile.income}, Goal: ${profile.goal}. Return JSON array of 3 tips only.` }],
      systemPrompt, 200
    );
    const clean = text.replace(/```json|```/g, "").trim();
    const match = clean.match(/\[[\s\S]*\]/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed) ? parsed : null;
  } catch { return null; }
}

export async function generateQuizQuestion(langCode = "hi") {
  const langInstruction = `Generate question and all text in ${LANG_NAMES[langCode]}`;
  const systemPrompt = `${QUIZ_PROMPT}\n\n${langInstruction}`;
  try {
    const text = await callGroq(
      [{ role: "user", content: `Generate a quiz question. Return JSON only.` }],
      systemPrompt, 250
    );
    const clean = text.replace(/```json|```/g, "").trim();
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found");
    const parsed = JSON.parse(match[0]);
    if (!parsed.question || !parsed.options || typeof parsed.correct !== "number") throw new Error("Bad format");
    return parsed;
  } catch (e) {
    const fallbacks = {
      hi: { question: "FD में पैसा कितना सुरक्षित है?", options: ["A) बिल्कुल नहीं", "B) थोड़ा", "C) पूरी तरह", "D) पता नहीं"], correct: 2, explanation: "FD में पैसा पूरी तरह सुरक्षित होता है — DICGC द्वारा ₹5 लाख तक insured।" },
      ta: { question: "FD-ல் பணம் எவ்வளவு பாதுகாப்பானது?", options: ["A) மொத்தமே இல்லை", "B) கொஞ்சம்", "C) முழுவதும்", "D) தெரியாது"], correct: 2, explanation: "FD-ல் பணம் முழுவதும் பாதுகாப்பானது." },
      bn: { question: "FD-তে টাকা কতটা নিরাপদ?", options: ["A) মোটেই না", "B) কিছুটা", "C) সম্পূর্ণ", "D) জানি না"], correct: 2, explanation: "FD-তে টাকা সম্পূর্ণ নিরাপদ।" },
      mr: { question: "FD मध्ये पैसे किती सुरक्षित?", options: ["A) मुळीच नाही", "B) थोडे", "C) पूर्णपणे", "D) माहीत नाही"], correct: 2, explanation: "FD मध्ये पैसे पूर्णपणे सुरक्षित असतात।" },
      en: { question: "How safe is money in an FD?", options: ["A) Not at all", "B) Partially", "C) Completely safe", "D) Unknown"], correct: 2, explanation: "FD money is completely safe — insured up to ₹5 lakh by DICGC." },
    };
    return fallbacks[langCode] || fallbacks.en;
  }
}

export async function askAIWithContext(ragPrompt, langCode = "hi", history = [], profile = {}) {
  const recentHistory = history.slice(-2).map(m => ({ role: m.role, content: m.content })); // trimmed to save tokens
  const langInstruction = `MANDATORY: ${LANG_STRICT_RAG[langCode] || LANG_STRICT_RAG.hi}`;

  const answer = await callGroq(
    [...recentHistory, { role: "user", content: ragPrompt }],
    `${SYSTEM_PROMPT}

${langInstruction}`,
    320
  );

  const isFdQuery = ragPrompt.toLowerCase().includes("fd") ||
                    ragPrompt.toLowerCase().includes("fixed deposit") ||
                    ragPrompt.toLowerCase().includes("invest");
  const hasBlostem = answer.includes("Blostem") || answer.includes("Suryoday") || answer.includes("🏦");

  const finalAnswer = (isFdQuery && !hasBlostem)
    ? answer + `

🏦 Blostem Partner FD Options:
✔ Suryoday Bank — ~8.5%
✔ Unity Bank — ~9%
✔ Bajaj Finance — ~8.2%
✔ Utkarsh SFB — ~8.0%`
    : answer;

  return finalAnswer;
}