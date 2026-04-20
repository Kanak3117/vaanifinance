const SYSTEM_PROMPT = `You are VaaniFinance, a warm and trusted financial advisor for rural and semi-urban India. You speak like a knowledgeable village elder — simple, grounded, and caring.

LANGUAGE RULES — HIGHEST PRIORITY:
- langCode "hi": respond ONLY in Hindi Devanagari script
- langCode "ta": respond ONLY in Tamil script
- langCode "bn": respond ONLY in Bengali script
- langCode "mr": respond ONLY in Marathi Devanagari script
- langCode "en": respond ONLY in English
Zero Roman letters allowed except for rupee symbol ₹ and numbers.

PERSONALIZATION:
- Always tailor advice to user's savings amount and goal
- Savings under ₹2000 → suggest Post Office RD / PPF / FD only, never stocks
- Goal "children's education" → mention Sukanya Samridhi Yojana or PPF
- Goal "retirement" → mention PPF or NPS
- Goal "build a home" → mention PMAY scheme
- Goal "keep money safe" → Post Office, SBI FD, RD

RESPONSE FORMAT — exactly 4 lines, story-like flow:
Line 1: A desi analogy that explains the concept naturally (relate to farm/kitchen/village life)
Line 2: Rupee example matched to user's savings bracket
Line 3: The main benefit tied directly to user's goal
Line 4: Risk or safety line — short and final

HARD RULES:
- EXACTLY 4 lines. Not 3. Not 5. Never more.
- No title, heading, or greeting at the start
- No bullet points, bold, asterisks, or markdown
- Safe products: line 4 ends with "पैसा पूरी तरह सुरक्षित" (or language equivalent)
- Market products: line 4 ends with "guaranteed नहीं" (or language equivalent)
- NEVER promise fixed rupee returns for market products
- ALWAYS say "लगभग X%" never just "X%"`;

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

const LANG_NAMES = {
  hi: "Hindi using Devanagari script ONLY. Zero Roman letters (except ₹ and numbers).",
  ta: "Tamil using Tamil script ONLY. Zero Roman letters (except ₹ and numbers).",
  bn: "Bengali using Bengali script ONLY. Zero Roman letters (except ₹ and numbers).",
  mr: "Marathi using Devanagari script ONLY. Zero Roman letters (except ₹ and numbers).",
  en: "English only.",
};

const FEW_SHOTS = {
  hi: [
    { role: "user", content: "FD क्या है?" },
    { role: "assistant", content: "जैसे गुल्लक में पैसा बंद करते हो — FD भी वैसा ही है।\n₹1000 से शुरू करो, बैंक तय समय तक पैसा रखता है।\nसमय पूरा होने पर पैसा वापस मिलता है ब्याज के साथ।\nपैसा पूरी तरह सुरक्षित।" },
    { role: "user", content: "SIP क्या है?" },
    { role: "assistant", content: "जैसे खेत में हर मौसम थोड़ा बीज बोते हो — SIP वैसा ही है।\nहर महीने ₹500 म्यूचुअल फंड में जाता है, अपने आप।\nसालों बाद छोटी रकम मिलकर बड़ी बन जाती है।\nबाज़ार पर निर्भर, guaranteed नहीं।" },
  ],
  ta: [
    { role: "user", content: "FD என்றால் என்ன?" },
    { role: "assistant", content: "குடுக்கையில் பணம் பூட்டி வைப்பது போல் — FD-வும் அதே மாதிரிதான்.\n₹1000 முதல் தொடங்கலாம், வங்கி குறிப்பிட்ட காலம் வரை பணம் வைத்திருக்கும்.\nகாலம் முடிந்ததும் வட்டியுடன் பணம் திரும்ப கிடைக்கும்.\nபணம் முழுவதும் பாதுகாப்பானது." },
  ],
  bn: [
    { role: "user", content: "FD কী?" },
    { role: "assistant", content: "গুল্লকে টাকা বন্ধ করার মতো — FD-ও ঠিক তাই।\n₹১০০০ থেকে শুরু করুন, ব্যাংক নির্দিষ্ট সময় টাকা রাখে।\nসময় শেষে সুদসহ টাকা ফেরত পাওয়া যায়।\nটাকা সম্পূর্ণ নিরাপদ।" },
  ],
  mr: [
    { role: "user", content: "FD म्हणजे काय?" },
    { role: "assistant", content: "गुल्लकात पैसे बंद करण्यासारखे — FD पण तसेच आहे.\n₹१००० पासून सुरुवात करा, बँक ठरलेल्या वेळेपर्यंत पैसे ठेवते.\nवेळ संपल्यावर व्याजासह पैसे परत मिळतात.\nपैसे पूर्णपणे सुरक्षित." },
  ],
  en: [
    { role: "user", content: "What is FD?" },
    { role: "assistant", content: "Like locking money in a piggy bank — FD works the same way.\nStart with ₹1000, the bank holds it for a fixed period.\nYou get your money back with interest when time is up.\nFully safe, approximately 6.5–7% interest per year." },
  ],
};

const OFFLINE_CACHE = {
  hi: {
    "fd क्या है":  "जैसे गुल्लक में पैसा बंद करते हो — FD भी वैसा ही है।\n₹1000 से शुरू करो, बैंक तय समय तक पैसा रखता है।\nसमय पूरा होने पर पैसा वापस मिलता है ब्याज के साथ।\nपैसा पूरी तरह सुरक्षित।",
    "sip क्या है": "जैसे खेत में हर मौसम थोड़ा बीज बोते हो — SIP वैसा ही है।\nहर महीने ₹500 म्यूचुअल फंड में जाता है, अपने आप।\nसालों बाद छोटी रकम मिलकर बड़ी बन जाती है।\nबाज़ार पर निर्भर, guaranteed नहीं।",
    "ppf क्या है": "जैसे सरकारी तिजोरी में पैसा रखो — PPF वैसी ही योजना है।\n₹500 से शुरू करो, 15 साल में पैसा धीरे-धीरे बढ़ता है।\nसाथ में income tax भी बचता है हर साल।\nपैसा पूरी तरह सुरक्षित।",
    "rd क्या है":  "जैसे हर महीने थोड़ा-थोड़ा अनाज जमा करते हो — RD वैसी ही है।\n₹100 से Post Office में हर महीने जमा होता है।\n1-5 साल में पैसा ब्याज सहित वापस मिलता है।\nपैसा पूरी तरह सुरक्षित।",
  },
  en: {
    "what is fd":  "Like locking money in a piggy bank — FD works the same way.\nStart with ₹1000, the bank holds it for a fixed period.\nYou get your money back with interest when time is up.\nFully safe, approximately 6.5–7% interest per year.",
    "what is sip": "Like sowing seeds every season — SIP works the same way.\n₹500 every month goes into a mutual fund automatically.\nSmall amounts grow big over many years.\nMarket-linked, not guaranteed — but rewarding long-term.",
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

async function callClaude(messages, systemPrompt, maxTokens = 200) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: maxTokens,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    }),
  });
  const data = await response.json();
  if (!response.ok) {          // ← FIXED: was `res.ok` (undefined variable)
    console.error("API ERROR:", data);
    throw new Error("API failed");
  }
  return data?.choices?.[0]?.message?.content || "";
}

export async function askAI(userInput, langCode = "hi", profile = {}, history = []) {
  const cached = checkOfflineCache(userInput, langCode);
  const profileContext = profile.income && profile.goal
    ? `User profile: monthly savings = ${profile.income}, main goal = "${profile.goal}". Tailor advice to this profile.`
    : "";
  const langInstruction = `MANDATORY: Respond ONLY in ${LANG_NAMES[langCode]}. EXACTLY 4 lines. Story-like flow. No title. No greeting.`;
  const systemPrompt = [SYSTEM_PROMPT, langInstruction, profileContext].filter(Boolean).join("\n\n");
  const recentHistory = history.slice(-8).map(m => ({ role: m.role, content: m.content }));

  try {
    return await callClaude(
      [...(FEW_SHOTS[langCode] || FEW_SHOTS.hi), ...recentHistory, { role: "user", content: userInput }],
      systemPrompt, 160
    );
  } catch {
    return cached || "इंटरनेट नहीं है — बाद में कोशिश करें 🙏";
  }
}

export async function generateDashboardTips(profile) {
  try {
    const text = await callClaude(
      [{ role: "user", content: `Savings: ${profile.income}, Goal: ${profile.goal}. Language: English. Return JSON array of 3 tips only.` }],
      DASHBOARD_PROMPT, 200
    );
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? parsed : null;
  } catch { return null; }
}

export async function generateQuizQuestion(langCode = "hi") {
  try {
    const text = await callClaude(
      [{ role: "user", content: `Generate a quiz question in ${LANG_NAMES[langCode]}. Return JSON only.` }],
      QUIZ_PROMPT, 350
    );
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    // Fallback questions per language
    const fallbacks = {
      hi: { question: "FD में पैसा कितना सुरक्षित है?", options: ["A) बिल्कुल नहीं", "B) थोड़ा", "C) पूरी तरह", "D) पता नहीं"], correct: 2, explanation: "FD में पैसा पूरी तरह सुरक्षित होता है — DICGC द्वारा ₹5 लाख तक insured।" },
      ta: { question: "FD-ல் பணம் எவ்வளவு பாதுகாப்பானது?", options: ["A) மொத்தமே இல்லை", "B) கொஞ்சம்", "C) முழுவதும்", "D) தெரியாது"], correct: 2, explanation: "FD-ல் பணம் முழுவதும் பாதுகாப்பானது — DICGC மூலம் ₹5 லட்சம் வரை." },
      bn: { question: "FD-তে টাকা কতটা নিরাপদ?", options: ["A) মোটেই না", "B) কিছুটা", "C) সম্পূর্ণ", "D) জানি না"], correct: 2, explanation: "FD-তে টাকা সম্পূর্ণ নিরাপদ — DICGC দ্বারা ₹5 লাখ পর্যন্ত বীমা।" },
      mr: { question: "FD मध्ये पैसे किती सुरक्षित?", options: ["A) मुळीच नाही", "B) थोडे", "C) पूर्णपणे", "D) माहीत नाही"], correct: 2, explanation: "FD मध्ये पैसे पूर्णपणे सुरक्षित — DICGC द्वारे ₹5 लाखांपर्यंत विमा." },
      en: { question: "How safe is money in an FD?", options: ["A) Not at all", "B) Partially", "C) Completely safe", "D) Unknown"], correct: 2, explanation: "FD money is completely safe — insured up to ₹5 lakh by DICGC." },
    };
    return fallbacks[langCode] || fallbacks.en;
  }
}