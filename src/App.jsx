import React, { useState, useEffect, useMemo } from "react";

// --- Icon Components ---
const ShieldCheck = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
);

const ShieldAlert = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="M12 8v4"></path>
    <path d="M12 16h.01"></path>
  </svg>
);

const Terminal = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const Fingerprint = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 12c-2 0-4.5 1-4.5 3.5S10 19 12 19s4.5-1 4.5-3.5-2-3.5-4.5-3.5z"/>
    <path d="M2 12c0-5.52 4.48-10 10-10s10 4.48 10 10"/>
    <path d="M2 12a4.5 4.5 0 0 0 4.5 4.5"/>
    <path d="M17.5 16.5a4.5 4.5 0 0 0 4.5-4.5"/>
  </svg>
);

const Search = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const Loader = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="animate-spin">
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

// --- Helpers ---
const sha1 = async (text) => {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-1", enc.encode(text));
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const useMatrixAnimation = (isAnimating) => {
  useEffect(() => {
    if (!isAnimating) return;
    const canvas = document.getElementById("matrix-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const alphabet = "01";
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const rainDrops = Array.from({ length: columns }).fill(1);

    const render = () => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0F0";
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975)
          rainDrops[i] = 0;
        rainDrops[i]++;
      }
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [isAnimating]);
};

const TypingEffect = ({ text }) => {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const intervalId = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(intervalId);
      }
    }, 20);
    return () => clearInterval(intervalId);
  }, [text]);
  return <pre className="whitespace-pre-wrap typing-cursor">{displayedText}</pre>;
};

// --- Main App ---
export default function App() {
  const [inputValue, setInputValue] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [aiSummary, setAiSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(true);

  useMatrixAnimation(true);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

  const handleCheckBreach = async (e) => {
    e.preventDefault();
    if (isLoading || !inputValue) return;

    setIsLoading(true);
    setResult(null);
    setError("");
    setAiSummary("");

    try {
      let body = { email };
      let endpoint = "/check-breach";

      if (privacyMode) {
        const hash = await sha1(inputValue.trim());
        body.hash = hash;
        body.last4 = inputValue.slice(-4);
        endpoint = "/check-breach-hash";
      } else {
        body.detail = inputValue.trim();
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Unknown error");
      }

      const data = await response.json();
      setResult(data);

      if (data.breached && data.breaches) {
        fetchAiSummary(data.breaches);
      }
    } catch (err) {
      setError(`[SYSTEM_ERROR]: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAiSummary = async (breachData) => {
    setIsAiLoading(true);
    try {
      const response = await fetch(`${API_BASE}/summarize-breach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ breach_data: breachData }),
      });
      if (!response.ok) throw new Error("AI summary failed");
      const data = await response.json();
      setAiSummary(data.summary);
    } catch (err) {
      setAiSummary(`[AI_CORE_ERROR]: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const ResultDisplay = useMemo(() => {
    if (isLoading) return null;
    if (error) return <TypingEffect text={error} />;
    if (!result) return <TypingEffect text="[Awaiting target designation...]" />;

    if (!result.breached) {
      return (
        <div className="flex items-start space-x-3">
          <ShieldCheck className="text-green-400 h-6 w-6 mt-1" />
          <TypingEffect text="[SCAN COMPLETE] :: Target ID appears secure. No breaches found." />
        </div>
      );
    }

    return (
      <div className="flex items-start space-x-3">
        <ShieldAlert className="text-red-500 h-6 w-6 mt-1" />
        <div>
          <TypingEffect text={`[COMPROMISED] :: Found in ${result.breaches.length} breach(es).`} />
          <div className="mt-4 space-y-2">
            {result.breaches.map((breach, i) => (
              <div key={i} className="p-3 border border-yellow-400/30 rounded-lg bg-yellow-900/20">
                <p><span className="text-yellow-400 font-bold">&gt; Breach Source:</span> {breach.source}</p>
                <p><span className="text-yellow-400 font-bold">&gt; Date:</span> {breach.date}</p>
                <p><span className="text-yellow-400 font-bold">&gt; Risk:</span> {breach.risk_level}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 border border-cyan-400/30 rounded-lg bg-cyan-900/20">
            <h3 className="text-cyan-400 font-bold text-lg mb-2 flex items-center">
              <Terminal className="mr-2" /> CYPHER AI BRIEFING:
            </h3>
            {isAiLoading ? (
              <div className="flex items-center space-x-2 text-cyan-300">
                <Loader /> <span>Contacting AI core...</span>
              </div>
            ) : (
              <TypingEffect text={aiSummary} />
            )}
          </div>
        </div>
      </div>
    );
  }, [isLoading, error, result, aiSummary, isAiLoading]);

  return (
    <>
      <canvas id="matrix-canvas" className="fixed top-0 left-0 w-full h-full -z-10"></canvas>
      <div className="min-h-screen bg-black/80 text-green-400 hacker-font flex flex-col items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2 flex items-center justify-center">
              <Fingerprint className="h-10 w-10 mr-3 animate-pulse"/> CRACK BANK
            </h1>
            <p className="text-green-500">Cybernetic Breach Analysis Protocol</p>
          </div>

          <form onSubmit={handleCheckBreach} className="space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter Banking ID (Card, IBAN, UPI, etc.)"
                className="w-full flex-grow bg-gray-900/50 border-2 border-green-500/50 focus:border-cyan-400 rounded-md px-4 py-3 text-lg text-green-300 placeholder-green-700"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600/80 hover:bg-cyan-500 border-2 border-cyan-400/50 text-black font-bold rounded-md disabled:opacity-50"
              >
                {isLoading ? (<><Loader/>Scanning...</>) : (<><Search className="h-5 w-5"/>Analyze</>)}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email for alerts (optional)"
                className="w-full bg-gray-900/50 border-2 border-green-500/50 focus:border-cyan-400 rounded-md px-4 py-2 text-green-300 placeholder-green-700"
              />
              <label className="inline-flex items-center gap-2 text-green-300 select-none">
                <input type="checkbox" checked={privacyMode} onChange={(e)=>setPrivacyMode(e.target.checked)} className="accent-cyan-400"/>
                Privacy mode (SHA-1 hash only)
              </label>
            </div>
          </form>

          <div className="bg-black/70 border-2 border-gray-700/50 rounded-lg p-4 md:p-6 min-h-[200px]">
            <div className="flex items-center pb-3 border-b-2 border-gray-700/50 mb-4">
              <div className="flex space-x-2">
                <span className="h-4 w-4 rounded-full bg-red-500"></span>
                <span className="h-4 w-4 rounded-full bg-yellow-500"></span>
                <span className="h-4 w-4 rounded-full bg-green-500"></span>
              </div>
              <p className="text-center flex-grow text-gray-400">CRACK_BANK_TERMINAL.EXE</p>
            </div>
            <div className="text-lg leading-relaxed">{ResultDisplay}</div>
          </div>

          <div className="text-center mt-8 text-xs text-yellow-600 border border-yellow-700/50 bg-yellow-900/20 p-3 rounded-md">
            <p className="font-bold mb-1">DISCLAIMER & SECURITY NOTICE</p>
            <p>This app is an educational demo. Do not enter actual, sensitive financial information.</p>
          </div>
        </div>
      </div>
    </>
  );
}
