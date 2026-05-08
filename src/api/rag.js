// ============================================================
//  VaaniFinance — RAG Engine v3
//  PRIMARY SOURCE: chunks.json  (Blostem Internal KB)
//  SECONDARY:      knowledgeBase.js (extended reference KB)
//  Exports: askWithRAG, isFinancialQuery, searchKB, getPartnerRates
// ============================================================

import { KNOWLEDGE_BASE } from "./knowledgeBase";
import BLOSTEM_CHUNKS from "../rag/chunks.json";      // src/rag/chunks.json → Blostem's OWN data

// ─── 1. MERGE KNOWLEDGE SOURCES ──────────────────────────────────────────
//
//  chunks.json  = Blostem's proprietary internal knowledge base
//                 (partner banks, rates, how-to guides — OUR data)
//  KNOWLEDGE_BASE = extended reference data (RBI rules, PPF, SIP etc.)
//
//  chunks.json entries get a priority BOOST so Blostem-specific
//  queries always pull from Blostem's own data first.

function normaliseChunk(c) {
  // Convert chunks.json format → internal KNOWLEDGE_BASE format
  const isBlostemPartner =
    c.source?.toLowerCase().includes("blostem") ||
    c.id?.startsWith("blostem_");

  // Derive tags from topic + text
  const topicTags = (c.topic || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(" ")
    .filter(Boolean);

  const textTags = (c.text || "")
    .toLowerCase()
    .match(/\b(fd|sip|ppf|rd|nps|unity|suryoday|utkarsh|bajaj|dicgc|rbi|sebi|blostem|partner|rate|interest|safe|invest|savings|fixed deposit|small finance)\b/g) || [];

  return {
    id:       c.id,
    category: isBlostemPartner ? "blostem_kb" : "general_kb",
    tags:     [...new Set([...topicTags, ...textTags])],
    title:    c.topic || c.id,
    content:  c.text  || "",
    source:   c.source || "Blostem Internal KB",
    url:      c.sourceUrl || "https://blostem.in",
    lang:     ["hi", "en", "ta", "bn", "mr"],
    isBlostemOwn: isBlostemPartner,   // ← flag for priority boost
  };
}

// Merge: Blostem chunks first, then reference KB (dedup by id)
const BLOSTEM_NORMALISED = BLOSTEM_CHUNKS.map(normaliseChunk);
const REFERENCE_ONLY     = KNOWLEDGE_BASE.filter(
  kb => !BLOSTEM_NORMALISED.find(bc => bc.id === kb.id)
);
const COMBINED_KB        = [...BLOSTEM_NORMALISED, ...REFERENCE_ONLY];

// ─── 2. FINANCIAL QUERY DETECTOR ─────────────────────────────────────────
const FINANCIAL_KEYWORDS = [
  "fd", "fixed deposit", "interest rate", "invest", "investment", "savings",
  "sip", "ppf", "nps", "rd", "recurring", "mutual fund", "returns",
  "blostem", "partner", "unity", "suryoday", "utkarsh", "bajaj",
  "tax", "tds", "80c", "dicgc", "insurance", "maturity", "withdrawal",
  "senior citizen", "pension", "retirement", "sukanya", "pmay", "home loan",
  "post office", "rbi", "sebi", "nifty", "sensex", "equity", "debt",
  "inflation", "real return", "compounding", "compound interest",
  "risk", "safe", "guarantee", "guaranteed", "secure",
  "paise", "rupee", "rupees", "lakh", "crore",
  "जमा", "ब्याज", "निवेश", "बचत", "सुरक्षित", "गारंटी",
  "कितना", "मिलेगा", "कहाँ", "लगाऊं", "पैसा", "रिटर्न", "टैक्स",
  "बैंक", "मुनाफा", "फायदा", "नुकसान", "जोखिम", "तुलना", "कौन",
  "कौन से बैंक", "Blostem के बैंक", "पार्टनर बैंक", "कहाँ खुलवाऊं",
  "வங்கிகள்", "கூட்டாளர்", "ব্যাংক তালিকা", "बँका कोणत्या",
  "வட்டி", "சேமிப்பு", "முதலீடு", "வங்கி", "திட்டம்", "வருமானம்",
  "সুদ", "সঞ্চয়", "বিনিয়োগ", "ব্যাংক", "আয়", "নিরাপদ",
  "व्याज", "बचत", "गुंतवणूक", "बँक", "परतावा", "सुरक्षित",
];

export function isFinancialQuery(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return FINANCIAL_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
}

// ─── 3. QUERY INTENT DETECTOR ────────────────────────────────────────────
function detectIntent(query) {
  const q = query.toLowerCase();

  // senior citizen — check FIRST before general savings
  if (q.includes("senior") || q.includes("वरिष्ठ") || q.includes("budhapa") ||
      q.includes("elderly") || q.includes("retirement income") ||
      q.includes("varisht") || q.includes("pensioner") || q.includes("60 year"))
    return "senior_citizen";

  // monthly savings / RD / small amounts
  if (q.includes("monthly") || q.includes("mahine") || q.includes("maasik") ||
      q.includes("मासिक") || q.includes("har mahine") || q.includes("bachat") ||
      q.includes("बचत") || q.includes("rd ") || q.includes("recurring") ||
      q.includes("best option") || q.includes("small savings") || q.includes("shuru karu") ||
      /[₹]?500/.test(q) || /[₹]?1000/.test(q))
    return "monthly_savings";

  // comparison
  if (q.includes(" vs ") || q.includes("compare") || q.includes("तुलना") ||
      q.includes("better") || q.includes("kaun sa") || q.includes("कौन सा") ||
      q.includes("difference") || q.includes("zyada") || q.includes("ya "))
    return "comparison";

  // partner list
  if (q.includes("blostem") || q.includes("partner") || q.includes("kaun kaun") ||
      q.includes("which banks") || q.includes("partner bank") || q.includes("सभी बैंक") ||
      q.includes("कौन से बैंक") || q.includes("पार्टनर बैंक") || q.includes("Blostem के बैंक") ||
      q.includes("கூட்டாளர்") || q.includes("ব্যাংক তালিকা") || q.includes("बँका कोणत्या") ||
      q.includes("list") || q.includes("kaunse"))
    return "partner_list";

  // how-to
  if (q.includes("kaise") || q.includes("कैसे") || q.includes("how to") ||
      q.includes("step") || q.includes("process") || q.includes("खोलें") ||
      q.includes("shuru") || q.includes("शुरू") || q.includes("kholein") ||
      q.includes("apply"))
    return "howto";

  // safety
  if (q.includes("safe") || q.includes("सुरक्षित") || q.includes("risk") ||
      q.includes("जोखिम") || q.includes("dicgc") || q.includes("guaranteed") ||
      q.includes("गारंटी") || q.includes("surakshit"))
    return "safety";

  // tax
  if (q.includes("tax") || q.includes("टैक्स") || q.includes("tds") ||
      q.includes("80c") || q.includes("form 15"))
    return "tax";

  // rates / returns
  if (q.includes("rate") || q.includes("interest") || q.includes("ब्याज") ||
      q.includes("percent") || q.includes("%") || q.includes("return") ||
      q.includes("kitna") || q.includes("कितना") || q.includes("milega") ||
      q.includes("मिलेगा") || q.includes("vyaj"))
    return "rates";

  // definition
  if (q.includes("kya hai") || q.includes("क्या है") || q.includes("what is") ||
      q.includes("explain") || q.includes("samjhao") || q.includes("समझाओ") ||
      q.includes("batao") || q.includes("बताओ"))
    return "definition";

  return "general";
}

// ─── 4. TOKENIZER ────────────────────────────────────────────────────────
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s₹%]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 1);
}

// ─── 5. SMART SCORER (intent-aware + Blostem-own boost) ──────────────────
function scoreChunk(chunk, queryTokens, intent) {
  const docText     = `${chunk.title} ${chunk.content} ${chunk.tags.join(" ")}`.toLowerCase();
  const docTokens   = tokenize(docText);
  const docFreq     = {};
  docTokens.forEach(t => { docFreq[t] = (docFreq[t] || 0) + 1; });

  let score = 0;

  // Token matching — exact match weighted higher than partial
  queryTokens.forEach(qt => {
    if (docFreq[qt]) score += docFreq[qt] * 3;   // exact match
    Object.keys(docFreq).forEach(dt => {
      if (dt !== qt && dt.includes(qt) && qt.length > 3) score += 0.5; // partial
    });
  });

  // Tag matching (strong signal)
  const tagText = chunk.tags.join(" ").toLowerCase();
  queryTokens.forEach(qt => { if (tagText.includes(qt)) score += 6; });

  // BLOSTEM OWN DATA boost
  if (chunk.isBlostemOwn) score += 3;

  // ── NEGATIVE SIGNAL: suppress clearly wrong categories ────────────────
  // If query is about monthly/small savings, penalise senior citizen chunks
  if (intent === "monthly_savings" && chunk.id === "senior_citizen_001") score -= 20;
  if (intent === "senior_citizen"  && chunk.id === "invest_advice_002")  score -= 10;

  // Intent-based boosts
  switch (intent) {

    case "monthly_savings":
      // Primary: invest_advice_002 (₹500 monthly guide), rd_guide_001, invest_advice_001
      if (["invest_advice_002","rd_guide_001","invest_advice_001"].includes(chunk.id)) score += 25;
      // Secondary: post office RD, utkarsh (min ₹500), guide-001 (₹500 beginner)
      if (["post-001","post_rd_001","guide-001","blostem_utkarsh_001","blostem_utkarsh_002"].includes(chunk.id)) score += 12;
      // Penalise senior citizen even more
      if (chunk.id?.includes("senior")) score -= 20;
      break;

    case "senior_citizen":
      // Primary: senior_citizen_001 from chunks.json (Blostem senior rates)
      if (["senior_citizen_001","guide-003"].includes(chunk.id)) score += 25;
      // Secondary: blostem unity/suryoday (they have senior rates)
      if (["blostem_unity_001","blostem_suryoday_001","blostem_utkarsh_001"].includes(chunk.id)) score += 12;
      // Penalise beginner/monthly guides
      if (["invest_advice_001","invest_advice_002","rd_guide_001"].includes(chunk.id)) score -= 15;
      break;

    case "partner_list":
      if (chunk.isBlostemOwn || chunk.category === "partner_fd" || chunk.category === "partner_comparison")
        score += 14;
      if (["blostem_comparison_001","blostem_comparison_002","blostem-005"].includes(chunk.id)) score += 8;
      break;

    case "rates":
      // If query mentions specific bank, boost that bank's chunk
      if (queryTokens.some(t => ["unity","suryoday","utkarsh","bajaj"].includes(t))) {
        if (chunk.isBlostemOwn) score += 12;
        queryTokens.forEach(qt => {
          if (chunk.id?.toLowerCase().includes(qt)) score += 8;
        });
      } else {
        // Generic rates query — boost comparison chunk
        if (["blostem_comparison_001","blostem_comparison_002","blostem-005"].includes(chunk.id)) score += 10;
      }
      break;

    case "comparison": {
      if (chunk.isBlostemOwn) score += 5;
      if (["guide-002","blostem_comparison_001","blostem_comparison_002","blostem-005"].includes(chunk.id))
        score += 10;
      const allBanks = ["unity","suryoday","utkarsh","bajaj","ppf","sip","nps","rd","post"];
      const queryEntities = allBanks.filter(b => queryTokens.some(qt => qt.includes(b) || b.includes(qt)));
      const chunkMentions = queryEntities.filter(b => docText.includes(b));
      score += chunkMentions.length * 9;
      break;
    }

    case "howto":
      if (["fd-002","blostem_how_to_001","blostem_how_to_002"].includes(chunk.id)) score += 20;
      break;

    case "safety":
      if (chunk.category === "rbi_rules" || chunk.id?.startsWith("blostem_safety")) score += 14;
      if (["rbi-001","rbi-002","blostem_safety_001","blostem_safety_002"].includes(chunk.id)) score += 8;
      // Suppress irrelevant chunks for safety queries
      if (["ppf_guide_001","sip_guide_001","rd_guide_001","invest_advice_002"].includes(chunk.id)) score -= 15;
      break;

    case "tax":
      if (["rbi-003","tax_saving_001"].includes(chunk.id)) score += 18;
      break;

    case "definition":
      if (["fd-001","fd_basics_001","fd_basics_002"].includes(chunk.id)) score += 14;
      if (["ppf-001","sip-001","nps-001","ppf_guide_001","sip_guide_001","nps_guide_001"].includes(chunk.id)) score += 8;
      break;

    default:
      break;
  }

  return score / Math.log(docTokens.length + 2);
}

// ─── 6. RETRIEVE TOP-K ───────────────────────────────────────────────────
function retrieveChunks(query, topK = 3) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return { chunks: [], intent: "general" };

  const intent = detectIntent(query);

  const scored = COMBINED_KB.map(chunk => ({
    chunk,
    score: scoreChunk(chunk, queryTokens, intent),
  }));

  scored.sort((a, b) => b.score - a.score);

  const chunks = scored
    .filter(s => s.score > 0.5)
    .slice(0, topK)
    .map(s => s.chunk);

  return { chunks, intent };
}

// ─── 7. BUILD CONTEXT ────────────────────────────────────────────────────
function buildContext(chunks) {
  return chunks
    .map((c, i) => [
      `[SOURCE ${i + 1}: ${c.source}]`,
      `TITLE: ${c.title}`,
      c.isBlostemOwn ? "[BLOSTEM PROPRIETARY DATA]" : "[REFERENCE DATA]",
      c.content,
    ].join("\n"))
    .join("\n\n---\n\n");
}

// ─── 8. INTENT-AWARE PROMPT ──────────────────────────────────────────────
function buildRAGPrompt(query, context, langCode, profile, intent) {
  const langName = { hi: "Hindi", ta: "Tamil", bn: "Bengali", mr: "Marathi", en: "English", hl: "Hinglish" }[langCode] || "Hindi";

  const profileStr = profile?.goal
    ? `User profile: savings=${profile.income || "unknown"}, goal=${profile.goal}, horizon=${profile.horizon || "medium"}, risk=${profile.risk || "low"}.`
    : "";

  const intentInstruction = {
    comparison:
`The user wants to COMPARE two things. Your job:
- 📘 State clearly what you're comparing
- 🟢 Pros of Option A | 🟢 Pros of Option B
- ⚠ Cons of each
- 💡 Clear verdict: "Choose A if [condition]. Choose B if [condition]."
- DO NOT just list all partner banks — answer the specific comparison asked.`,

    partner_list:
`The user wants to know Blostem's partner banks. Your job:
- 📘 Introduce Blostem partnerships in 1-2 lines
- 🏦 List each partner bank: name, rate, minimum deposit, key feature
- 🟢 Why these banks are safe (RBI, DICGC)
- 💡 Which bank suits which user type
- 🚀 Next step to open via Blostem`,

    howto:
`The user wants step-by-step instructions. Your job:
- 📘 One-line intro
- 🟢 Numbered steps — practical and specific (use Blostem how-to data)
- ⚠ Common mistakes to avoid
- 🚀 The very first action to take right now`,

    safety:
`The user is concerned about safety. Your job:
- 📘 Address their worry directly and reassuringly
- 🟢 Specific protections: DICGC ₹5 lakh, RBI regulation, etc.
- ⚠ Honest about any real risks
- 💡 Clear safety verdict with specific numbers`,

    tax:
`The user is asking about tax. Your job:
- 📘 Explain the tax rule simply
- 🟢 Tax-saving opportunities (80C, Form 15G/15H)
- ⚠ Tax liabilities they must know
- 💡 Specific tax tip based on their profile
- 🚀 What to do next`,

    rates:
`The user wants interest rate information. Your job:
- 📘 State current rates clearly with numbers
- 🟢 Best rate option for their need
- ⚠ Conditions (minimum deposit, lock-in, etc.)
- 🏦 Blostem partner rates ONLY if relevant to what they asked
- 💡 Specific rate-based recommendation`,

    definition:
`The user wants to understand a concept. Your job:
- 📘 Simple plain-language explanation with a real-life analogy
- 🟢 Key benefits
- ⚠ Who should avoid it / limitations
- 💡 Whether this suits their profile
- 🚀 How to get started`,

    monthly_savings:
`The user wants advice for small monthly savings (₹500-₹5000/month). Your job:
- 📘 Acknowledge their savings amount and situation
- 🟢 BEST OPTIONS ranked by their amount: Post Office RD (₹100/month), Utkarsh FD (₹500 minimum), Unity FD (₹1000 minimum)
- Give SPECIFIC rupee amounts, rates, and expected maturity values
- ⚠ Emergency fund first — 3 months expenses before investing
- 💡 Step-by-step plan: what to do in Month 1, Month 3, Month 6
- 🚀 Single clear first action to take TODAY
- DO NOT give generic partner bank list — give specific advice for their amount`,

    senior_citizen:
`The user is a senior citizen asking about investments. Your job:
- 📘 Address senior citizen needs directly (safe income, monthly payout)
- 🟢 BEST OPTIONS with EXACT rates from knowledge base:
  Unity SFB: 9.5% (senior rate), Suryoday SFB: 9.0% (senior rate), SCSS: 8.2%, POMIS: 7.4%
- 🏦 Use ONLY rates from the knowledge base — never make up percentages
- ⚠ Tax benefits: Section 80TTB ₹50,000 deduction, Form 15H for TDS
- 💡 Specific recommendation with rupee example (e.g., ₹1 lakh at X% = ₹Y/month)
- 🚀 First step to open the account`,

    general:
`Answer the user's specific question directly.
- 📘 Main direct answer
- 🟢 Key relevant benefits
- ⚠ Important caution if any
- 💡 Your recommendation
- 🚀 Next step`,
  }[intent] || "Answer the user's question directly using the knowledge base.";

  return `You are VaaniFinance, a trusted AI financial advisor for rural and semi-urban India, powered by Blostem.

${profileStr}

KNOWLEDGE BASE — use ONLY this to answer (this is Blostem's own proprietary data):
${context}

YOUR SPECIFIC TASK:
${intentInstruction}

LANGUAGE — ABSOLUTE RULE:
Write EVERY word in ${langName}.
${langCode === "hi" ? "Use Devanagari script. ZERO English words. Banned: approximately, benefits, lock-in, penalty, safe, next step, keep in mind. Use: लगभग, फायदे, तय समय, जुर्माना, सुरक्षित, अगला कदम, ध्यान रखें." : ""}
${langCode === "ta" ? "Use Tamil script. ZERO English words." : ""}
${langCode === "bn" ? "Use Bengali script. ZERO English words." : ""}
${langCode === "mr" ? "Use Devanagari. ZERO English words." : ""}
${langCode === "hl" ? "CRITICAL: Write EVERY word in Roman/Latin letters (A-Z). Mix Hindi + English words but ZERO Devanagari script. USE: 'paisa' | 'nivesh' | 'bachat' | 'surakshit' | 'byaaj' | 'faayda' | 'jokhim' | 'guaranteed'. HEADERS in Roman: 🟢 Fayde | ⚠️ Dhyan Rakho | 💡 Tulna | 📚 Source | ✅ Aapke Liye Best | 🚀 Agla Kadam" : ""}
Allowed exceptions: ₹, numbers, FD, SIP, PPF, RD, RBI, SEBI, DICGC, Blostem, Suryoday, Unity, Bajaj, Utkarsh.

RESPONSE FORMAT (mandatory emoji headers):
📘 [intro line]
🟢 फायदे / Benefits:
• [item 1]
• [item 2]
⚠️ ध्यान रखें / Keep in mind:
• [item 1]
💡 [recommendation]
🚀 [next step]

RULES:
1. Answer ONLY from the knowledge base above — no external info, no hallucination.
2. Reply in ${langName} ONLY (FD, SIP, PPF, DICGC, Blostem names are fine).
3. Include specific numbers and rupee amounts from the data.
4. NEVER give a generic partner bank list unless specifically asked.
5. Your entire response must directly answer: "${query}"

USER QUESTION: ${query}`;
}

// ─── 9. LLM CALL (Groq) ──────────────────────────────────────────────────
// Models in priority order — fallback to larger if small hits 429
const RAG_MODELS = [
  "llama-3.3-70b-versatile",    // primary — best quality
  "llama-3.1-8b-instant",       // fallback — if 70b hits rate limit
];

async function callLLM(prompt) {
  const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not set");

  for (const model of RAG_MODELS) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 350,
        temperature: 0.35,
      messages: [
        {
          role: "system",
          content: `You are VaaniFinance, AI financial advisor for Blostem.
CRITICAL: Every question gets a unique, specific answer based on EXACTLY what was asked.
Never give a generic partner bank list unless specifically asked for it.
Answer the EXACT question. Use: 📘 🟢 ⚠️ 🏦 💡 🚀 📚

LANGUAGE RULES — ABSOLUTE PRIORITY:
The langCode in the prompt tells you which language to use. Follow strictly:
- hi (Hindi): EVERY word in Devanagari. Numbers and ₹ OK. Allowed English brand names: FD, SIP, PPF, RD, NPS, DICGC, RBI, SEBI, SBI, Blostem, Suryoday, Unity, Bajaj, Utkarsh, Post Office, SCSS, UPI, KYC, PAN, Aadhaar.
  BANNED→Hindi: approximately→लगभग | benefits→फायदे | lock-in→तय समय | penalty→जुर्माना | safe→सुरक्षित | returns→रिटर्न | payout→भुगतान | option→विकल्प | monthly→मासिक | interest→ब्याज | rate→दर | income→आय | savings→बचत | guaranteed→गारंटी | maturity→परिपक्वता | amount→राशि | minimum→न्यूनतम | senior→वरिष्ठ | citizen→नागरिक | comparison→तुलना | source→स्रोत
  Hindi headers: 🟢 फायदे | ⚠️ ध्यान रखें | 💡 तुलना | 📚 स्रोत | ✅ आपके लिए सबसे अच्छा | 🚀 अगला कदम
- ta (Tamil): EVERY word in Tamil script. Same brand exceptions.
  Tamil headers: 🟢 நன்மைகள் | ⚠️ கவனிக்கவும் | 💡 ஒப்பீடு | 📚 ஆதாரம் | ✅ உங்களுக்கு சிறந்தது | 🚀 அடுத்த படி
- bn (Bengali): EVERY word in Bengali script. Same brand exceptions.
  Bengali headers: 🟢 সুবিধা | ⚠️ মনে রাখুন | 💡 তুলনা | 📚 সূত্র | ✅ আপনার জন্য সেরা | 🚀 পরবর্তী পদক্ষেপ
- mr (Marathi): EVERY word in Marathi Devanagari. Same brand exceptions.
  Marathi headers: 🟢 फायदे | ⚠️ लक्षात ठेवा | 💡 तुलना | 📚 स्रोत | ✅ तुमच्यासाठी सर्वोत्तम | 🚀 पुढील पाऊल
- en (English): Full English only.
NEVER mix. Numbers (1,2,3) are always allowed in any language.

CONTEXT-SPECIFIC RULES:
- monthly_savings queries: give specific amounts, rates, step-by-step plan for their budget. Never show senior citizen rates.
- senior_citizen queries: use ONLY the rates from the knowledge base. Senior rates: Unity 9.5%, Suryoday 9.0%, Utkarsh 8.5%. Never hallucinate rates.
- Do NOT show partner bank comparison list for monthly savings queries.

MANDATORY FORMAT — always use bullet points under 🟢 and ⚠️:
🟢 [label in correct language]:
• item one
• item two
⚠️ [label in correct language]:
• item one

MATHS RULES — HIGHEST PRIORITY — NEVER VIOLATE:
- Monthly income from FD = (Principal x Annual_Rate%) / 12
  EXAMPLE: Rs1,00,000 at 9.5% annual = Rs9,500/year = Rs791/month. NEVER Rs7,925.
- Maturity (simple interest) = Principal + (Principal x Rate% x Years)
  EXAMPLE: Rs1,00,000 at 9% for 3 years = Rs1,27,000 at maturity.
- Maturity (compound annual) = Principal x (1 + Rate/100)^Years
  EXAMPLE: Rs1,00,000 at 9% for 3 years = Rs1,29,503 at maturity.
- ALWAYS divide annual interest by 12 to get monthly income. NEVER skip the division.
- ALWAYS verify: monthly_figure x 12 = annual_interest. If mismatch, recalculate.
- If unsure of exact number, say "approximately" and round down. NEVER invent a precise rupee figure.

LANGUAGE RULE: Reply in the same language as the user's question.`,
        },
        { role: "user", content: prompt },
      ],
      }),
    });

    if (response.status === 429) {
      console.warn(`[RAG] 429 on ${model} — trying next model`);
      continue;
    }
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq error: ${response.status} — ${err}`);
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }
  // All models rate-limited
  throw new Error("Groq rate limit reached on all models — try again in a few minutes.");
}

// ─── 10. OFFLINE FALLBACK COMPOSER ───────────────────────────────────────
function composeAnswerFromChunks(chunks, intent, langCode, query) {
  if (!chunks || chunks.length === 0) return null;

  const primary = chunks[0];

  const extractSentences = (text, max = 4) =>
    text
      .replace(/(\d)\.(\d)/g, "$1DECIMAL$2")
      .split(/[।\n]|\.(?=\s)/)
      .map(s => s.replace(/DECIMAL/g, ".").trim())
      .filter(s => s.length > 12 && s.length < 200)
      .slice(0, max);

  const extractRates = (text) => {
    const matches = [...text.matchAll(/(\d+\.?\d+)%\s*(?:for|ke liye)?[^.,\n]{0,40}/g)];
    return matches.slice(0, 5).map(m => `• ~${m[0]}`);
  };

  const L = {
    offline: { hi: "⚡ Blostem KB से सीधा जवाब", en: "⚡ Direct from Blostem KB (offline)", ta: "⚡ Blostem KB இலிருந்து", bn: "⚡ Blostem KB থেকে", mr: "⚡ Blostem KB मधून" },
    benefit: { hi: "🟢 फायदे", en: "🟢 Benefits", ta: "🟢 நன்மைகள்", bn: "🟢 সুবিধা", mr: "🟢 फायदे" },
    caution: { hi: "⚠️ ध्यान रखें", en: "⚠️ Keep in mind", ta: "⚠️ கவனிக்கவும்", bn: "⚠️ মনে রাখুন", mr: "⚠️ लक्षात ठेवा" },
    next:    { hi: "🚀 अगला कदम", en: "🚀 Next step", ta: "🚀 அடுத்த படி", bn: "🚀 পরবর্তী পদক্ষেপ", mr: "🚀 पुढील पाऊल" },
    source:  { hi: "📚 स्रोत", en: "📚 Source", ta: "📚 ஆதாரம்", bn: "📚 সূত্র", mr: "📚 स्रोत" },
    safe:    { hi: "• RBI regulated — पूरी तरह सुरक्षित", en: "• RBI regulated — completely safe", ta: "• RBI ஒழுங்குபடுத்தப்பட்டது", bn: "• RBI নিয়ন্ত্রিত — সম্পূর্ণ নিরাপদ", mr: "• RBI नियंत्रित — पूर्णपणे सुरक्षित" },
    dicgc:   { hi: "• DICGC insured — ₹5 लाख तक", en: "• DICGC insured up to ₹5 lakh", ta: "• DICGC insured — ₹5 லட்சம் வரை", bn: "• DICGC insured — ₹5 লাখ পর্যন্ত", mr: "• DICGC insured — ₹5 लाखांपर्यंत" },
  };
  const lbl = (key) => L[key]?.[langCode] || L[key]?.en || "";

  if (intent === "partner_list") {
    return [
      lbl("offline"), "",
      "📘 Blostem ke 4 Partner Banks:",
      "• 🥇 Unity SFB: ~9.0% | min ₹1,000 | DICGC ✅",
      "• 🌟 Suryoday SFB: ~8.5% | min ₹1,000 | DICGC ✅",
      "• 🌱 Utkarsh SFB: ~8.0% | min ₹500  | DICGC ✅",
      "• 🏛️ Bajaj Finance: ~8.2% | min ₹5,000 | CRISIL FAAA ✅",
      "",
      lbl("benefit") + ":",
      lbl("safe"),
      lbl("dicgc"),
      "",
      lbl("next") + ":",
      "👉 Blostem app se FD kholein — sirf 5 minute mein",
      "",
      lbl("source") + ": " + [...new Set(chunks.map(c => c.source))].join(" · "),
    ].join("\n");
  }

  if (intent === "rates") {
    const rates = extractRates(primary.content);
    const sentences = extractSentences(primary.content, 3);
    return [
      lbl("offline"), "",
      `📘 ${primary.title}:`,
      rates.length > 0 ? rates.join("\n") : sentences.slice(0, 2).map(s => "• " + s).join("\n"),
      "",
      lbl("benefit") + ":",
      lbl("dicgc"),
      lbl("safe"),
      "",
      lbl("next") + ":",
      `👉 ${primary.url && primary.url !== "#" ? primary.url : "Blostem app mein open karein"}`,
      "",
      lbl("source") + ": " + primary.source,
    ].join("\n");
  }

  if (intent === "howto") {
    const sentences = extractSentences(primary.content, 6);
    return [
      lbl("offline"), "",
      `📘 ${primary.title}`,
      sentences.map((s, i) => `${i + 1}. ${s}`).join("\n"),
      "",
      lbl("source") + ": " + primary.source,
    ].join("\n");
  }

  // Default
  const sentences = extractSentences(primary.content, 5);
  return [
    lbl("offline"), "",
    `📘 ${primary.title}`,
    lbl("benefit") + ":",
    sentences.slice(0, 3).map(s => "• " + s).join("\n"),
    sentences.length > 3 ? [
      "",
      lbl("caution") + ":",
      sentences.slice(3, 5).map(s => "• " + s).join("\n"),
    ].join("\n") : "",
    "",
    lbl("source") + ": " + chunks.map(c => c.source).join(" · "),
  ].filter(Boolean).join("\n");
}

// ─── 11. MAIN EXPORT ─────────────────────────────────────────────────────
export async function askWithRAG(query, langCode = "hi", profile = {}, _history = []) {
  let intent = "general";
  try {
    const { chunks, intent: detectedIntent } = retrieveChunks(query, 3);
    intent = detectedIntent;

    if (chunks.length === 0) return { usedRAG: false, answer: null, sources: [], intent };

    const context = buildContext(chunks);
    const prompt  = buildRAGPrompt(query, context, langCode, profile, intent);
    const answer  = await callLLM(prompt);

    if (!answer || answer.trim().length < 20) {
      const fallback = composeAnswerFromChunks(chunks, intent, langCode, query);
      if (fallback) {
        const sources = chunks.map(c => ({ name: c.source, url: c.url || "#", title: c.title, category: c.category }));
        return { usedRAG: true, answer: fallback, sources, isOffline: true };
      }
      return { usedRAG: false, answer: null, sources: [] };
    }

    const sources = chunks.map(c => ({
      name: c.source, url: c.url || "#", title: c.title, category: c.category,
    }));

    return { usedRAG: true, answer, sources, intent };

  } catch (error) {
    console.error("[RAG] Error:", error.message);
    try {
      const { chunks: fbChunks, intent: fbIntent } = retrieveChunks(query, 3);
      if (fbChunks.length > 0) {
        const fallback = composeAnswerFromChunks(fbChunks, fbIntent, langCode, query);
        if (fallback) {
          const sources = fbChunks.map(c => ({ name: c.source, url: c.url || "#", title: c.title, category: c.category }));
          return { usedRAG: true, answer: fallback, sources, isOffline: true, intent };
        }
      }
    } catch (fbErr) {
      console.error("[RAG] Fallback also failed:", fbErr.message);
    }
    return { usedRAG: false, answer: null, sources: [] };
  }
}

export function searchKB(query, topK = 5) {
  const { chunks } = retrieveChunks(query, topK);
  return chunks;
}

export function getPartnerRates() {
  return COMBINED_KB.filter(d =>
    d.isBlostemOwn || d.category === "partner_fd" || d.category === "partner_comparison"
  );
}

// ── Expose KB stats for demo/debugging ───────────────────────────────────
export const KB_STATS = {
  total:          COMBINED_KB.length,
  blostemOwn:     COMBINED_KB.filter(c => c.isBlostemOwn).length,
  reference:      COMBINED_KB.filter(c => !c.isBlostemOwn).length,
  partnerBanks:   COMBINED_KB.filter(c => c.id?.startsWith("blostem_")).length,
};