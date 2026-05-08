// ─────────────────────────────────────────────────────────────
//  langInstruction.js  —  VaaniFinance
//  Single source of truth for language instructions sent to AI.
//  Import this in api/groq.js AND api/rag.js.
// ─────────────────────────────────────────────────────────────

/**
 * Returns the language instruction string to inject into every
 * system prompt / user-turn prompt sent to the LLM.
 *
 * @param {string} langCode  e.g. "hi" | "hl" | "en" | "ta" | "bn" | "mr"
 * @returns {string}
 */
export function getLangInstruction(langCode) {
  switch (langCode) {
    case "hl":
      return `CRITICAL LANGUAGE RULE: Reply ONLY in Hinglish.
Hinglish means: mix Hindi vocabulary with English words, BUT write EVERY word using Roman/Latin letters (A-Z).
NEVER use Devanagari script (हिंदी अक्षर). NEVER write in pure Hindi.
Correct style example: "Aapke liye FD sabse safe option hai, kyunki isme guaranteed return milta hai aur koi market risk nahi hota."
Wrong style (DO NOT DO THIS): "आपके लिए FD सबसे safe है।"
Always Roman script — this is non-negotiable.`;

    case "hi":
      return "Reply in Hindi (Devanagari script). Do not use English except for proper nouns like FD, SIP, PPF, RBI, SEBI.";

    case "ta":
      return "Reply in Tamil script only. Do not use English except for proper nouns like FD, SIP, PPF, RBI, SEBI.";

    case "bn":
      return "Reply in Bengali (Bangla) script only. Do not use English except for proper nouns like FD, SIP, PPF, RBI, SEBI.";

    case "mr":
      return "Reply in Marathi (Devanagari script). Do not use English except for proper nouns like FD, SIP, PPF, RBI, SEBI.";

    case "en":
      return "Reply in clear, simple English suitable for first-time investors in India.";

    default:
      return "Reply in simple English.";
  }
}