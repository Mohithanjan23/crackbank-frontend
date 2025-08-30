import React, { useState, useEffect } from "react";
import "./App.css";

// --- SHA1 Helper ---
const sha1 = async (text) => {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-1", enc.encode(text));
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export default function App() {
  const [inputValue, setInputValue] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("[waiting target designation...]");
  const [isLoading, setIsLoading] = useState(false);
  const [subtitle, setSubtitle] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

  // Matrix Rain Background
  useEffect(() => {
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

    const letters = "01";
    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    const rainDrops = Array(columns).fill(1);

    const render = () => {
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Green text with 30% opacity
  ctx.fillStyle = "rgba(0, 255, 0, 0.13)";
  ctx.font = fontSize + "px monospace";

  for (let i = 0; i < rainDrops.length; i++) {
    const text = letters.charAt(Math.floor(Math.random() * letters.length));
    ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

    if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      rainDrops[i] = 0;
    }
    rainDrops[i]++;
  }
  animationFrameId = requestAnimationFrame(render);
};
    render();
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Typing effect for subtitle
  useEffect(() => {
    const text = "Cybernetic Breach Analysis Protocol";
    let i = 0;
    const interval = setInterval(() => {
      setSubtitle((prev) => prev + text[i]);
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 70);
    return () => clearInterval(interval);
  }, []);

  // Handle Breach Check
  const handleCheck = async (e) => {
    e.preventDefault();
    if (!inputValue) return;

    setIsLoading(true);
    setResult("[scanning target ID...]");

    try {
      const hash = await sha1(inputValue.trim());
      const body = { hash, last4: inputValue.slice(-4), email };

      const response = await fetch(`${API_BASE}/check-breach-hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      let logLines = [
        "[INIT] Connecting to breach database...",
        `[SCAN] Target hash → ${hash.slice(0, 12)}...`,
      ];

      if (data.breached) {
        logLines.push(`[FOUND] ${data.breaches.length} Breach(es) Detected`);
        data.breaches.forEach((b) =>
          logLines.push(
            `> ${b.source} (${b.date}) [Risk: ${b.risk_level}]`
          )
        );
      } else {
        logLines.push("[SECURE] No breaches found.");
      }
      logLines.push("[COMPLETE] Scan finished.");

      setResult(""); // reset terminal
      let i = 0;
      const interval = setInterval(() => {
        setResult((prev) => prev + "\n" + logLines[i]);
        i++;
        if (i === logLines.length) clearInterval(interval);
      }, 900);
    } catch (err) {
      setResult(`[SYSTEM_ERROR] ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <canvas id="matrix-canvas"></canvas>
      <div className="container crt">
        <div className="header">
          <h1>⚡CRACK BANK</h1>
          <p className="subtitle">{subtitle}</p>
        </div>

        <form className="form" onSubmit={handleCheck}>
          <input
            type="text"
            placeholder="Enter Banking ID (Card, IBAN, UPI, etc.)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "⏳ Scanning..." : "Analyze"}
          </button>
          <input
            type="email"
            placeholder="Enter email for alerts (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </form>

        <div className="terminal">
          <div className="terminal-header">
            <span className="red"></span>
            <span className="yellow"></span>
            <span className="green"></span>
            <p>CRACK_BANK_TERMINAL.EXE</p>
          </div>
          <pre className="terminal-body">{result}</pre>
        </div>

        <div className="disclaimer">
          ⚠️ DISCLAIMER & SECURITY NOTICE ⚠️<br />
          This application is an educational demo. Do not enter your actual,
          sensitive financial information. All checks are simulated.
        </div>
      </div>
    </>
  );
}
