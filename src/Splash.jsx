import { useEffect, useRef, useState } from "react";
import "./Splash.css";
 
const LANGUAGES = [
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "bn", label: "বাংলা" },
  { code: "mr", label: "मराठी" },
  { code: "en", label: "English" },
];
 
const SPLASH_TEXT = {
  sub: {
    hi: "अपनी भाषा में — अपना पैसा समझो",
    ta: "உங்கள் மொழியில் — உங்கள் பணம் புரியட்டும்",
    bn: "আপনার ভাষায় — আপনার টাকা বুঝুন",
    mr: "तुमच्या भाषेत — तुमचे पैसे समजून घ्या",
    en: "Understand your money — in your language",
  },
  skip: {
    hi: "छोड़ें →", ta: "தவிர் →", bn: "এড়িয়ে যান →", mr: "वगळा →", en: "Skip →",
  },
};
 
export default function Splash({ onDone }) {
  const [selectedLang, setSelectedLang] = useState("hi");
  const langRef = useRef("hi");
 
  const handleSelect = (code) => {
    setSelectedLang(code);
    langRef.current = code;
  };
 
  const handleDone = () => onDone(langRef.current);
 
  useEffect(() => {
    const timer = setTimeout(handleDone, 2600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, []);
 
  return (
    <div className="splash">
      <div className="splash-content">
        <div className="splash-icon">💰</div>
        <div className="splash-title">VaaniFinance</div>
        <div className="splash-sub">{SPLASH_TEXT.sub[selectedLang]}</div>
 
        {/* Language picker */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 14 }}>
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => handleSelect(l.code)} style={{
              background:   selectedLang === l.code ? "white" : "rgba(255,255,255,0.15)",
              color:        selectedLang === l.code ? "#1a6b3c" : "white",
              border:       "1.5px solid rgba(255,255,255,0.4)",
              borderRadius: 99, padding: "5px 14px", fontSize: 13,
              fontWeight:   selectedLang === l.code ? 700 : 400,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
            }}>
              {l.label}
            </button>
          ))}
        </div>
 
        <div className="splash-loader" style={{ marginTop: 22 }}>
          <div className="splash-bar" />
        </div>
 
        {/* Skip button */}
        <button onClick={handleDone} style={{
          marginTop: 16, background: "rgba(255,255,255,0.18)",
          border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: 99,
          color: "white", fontSize: 13, padding: "6px 22px",
          cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
        }}>
          {SPLASH_TEXT.skip[selectedLang]}
        </button>
 
        <div className="splash-tagline">Smart Financial Guidance for Bharat</div>
      </div>
    </div>
  );
}