import { useState, useEffect, useRef, useCallback } from "react";
import { useTypewriter } from "../hooks/useTypewriter";

const NAV_LINKS = ["Features", "Docs", "GitHub", "Changelog"];

const INSTALL_CMDS = [
  { label: "Run instantly (npx)", cmd: "npx @ritwikamit/cl8" },
  { label: "Install globally (npm)", cmd: "npm install -g @ritwikamit/cl8" },
  {
    label: "Windows (PowerShell)",
    cmd: 'irm https://raw.githubusercontent.com/ritwikamit/cl8/main/scripts/install.ps1 | iex',
  },
  {
    label: "macOS / Linux",
    cmd: 'curl -fsSL https://raw.githubusercontent.com/ritwikamit/cl8/main/scripts/install.sh | bash',
  },
];

const TYPEWRITER_TEXT =
  "A production-grade, terminal-native AI agent that understands natural language, writes and edits code, executes commands, searches your codebase, and automates complex workflows — all from the comfort of your terminal.";

export default function HeroSection() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pillsVisible, setPillsVisible] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevXRef = useRef(0);
  const targetTimeRef = useRef(0);
  const seekingRef = useRef(false);

  const { displayed, done } = useTypewriter(TYPEWRITER_TEXT, 28, 800);

  useEffect(() => {
    const t = setTimeout(() => setPillsVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const delta = e.clientX - prevXRef.current;
    prevXRef.current = e.clientX;
    const offset =
      (delta / window.innerWidth) * 0.8 * video.duration;
    targetTimeRef.current = Math.max(
      0,
      Math.min(video.duration, targetTimeRef.current + offset),
    );
    if (!seekingRef.current) {
      seekingRef.current = true;
      video.currentTime = targetTimeRef.current;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const handleSeeked = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    seekingRef.current = false;
    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.01) {
      seekingRef.current = true;
      video.currentTime = targetTimeRef.current;
    }
  }, []);

  const copyCmd = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Video background */}
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        onSeeked={handleSeeked}
        className="fixed inset-0 z-0 w-full h-full object-cover opacity-60"
        style={{ objectPosition: "70% center" }}
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark gradient overlay for readability */}
      <div className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-10 px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
        <div className="flex items-center gap-2 select-none">
          <span className="text-xl font-bold gradient-text">CL8</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="text-[15px] text-gray-300 hover:text-white transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
        <a
          href="https://github.com/ritwikamit/cl8"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline text-[15px] text-gray-300 underline underline-offset-2 hover:text-white transition-colors"
        >
          GitHub →
        </a>
        <button
          className="md:hidden flex flex-col gap-[5px] items-center justify-center w-8 h-8 cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={`w-6 h-[2px] bg-white block transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`w-6 h-[2px] bg-white block transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`w-6 h-[2px] bg-white block transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </nav>

      {/* Mobile overlay */}
      <div className={`md:hidden fixed inset-0 z-[9] bg-black/95 backdrop-blur-sm flex flex-col items-start justify-center px-8 gap-8 transition-all duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        {NAV_LINKS.map((link) => (
          <a key={link} href="#" className="text-[28px] font-medium text-white hover:opacity-60 transition-opacity" onClick={() => setMobileOpen(false)}>
            {link}
          </a>
        ))}
        <a href="https://github.com/ritwikamit/cl8" target="_blank" rel="noopener noreferrer" className="text-[28px] font-medium text-white underline underline-offset-4 hover:opacity-60 transition-opacity" onClick={() => setMobileOpen(false)}>
          GitHub →
        </a>
      </div>

      {/* Hero content */}
      <div className="relative z-[2] h-screen flex flex-col justify-end md:justify-center pb-16 md:pb-0 px-5 sm:px-8 md:px-12 overflow-hidden">
        <div className="max-w-2xl relative">
          {/* Blurred intro */}
          <div
            className="pointer-events-none select-none mb-4 sm:mb-5 text-white/70"
            style={{
              fontSize: "clamp(14px, 3vw, 18px)",
              lineHeight: 1.3,
              fontWeight: 400,
              filter: "blur(3px)",
            }}
          >
            Hey there, meet CL8 —<br />
            your terminal AI coding assistant
          </div>

          {/* Typewriter */}
          <div
            className="mb-5 sm:mb-7 text-white/90"
            style={{
              fontSize: "clamp(16px, 3.5vw, 22px)",
              lineHeight: 1.4,
              fontWeight: 300,
              minHeight: "60px",
            }}
          >
            {displayed}
            {!done && (
              <span className="inline-block w-[2px] h-[1.1em] bg-white align-middle ml-[2px] animate-blink" />
            )}
          </div>

          {/* Install pills */}
          <div
            className="flex flex-wrap gap-2"
            style={{
              opacity: pillsVisible ? 1 : 0,
              transform: pillsVisible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
            }}
          >
            {INSTALL_CMDS.map((item, i) => (
              <button
                key={i}
                onClick={() => copyCmd(item.cmd, i)}
                className="group inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/15 rounded-full text-[13px] sm:text-[14px] px-4 sm:px-5 py-2 hover:bg-white hover:text-black transition-all duration-200 cursor-pointer"
              >
                <code className="font-mono text-inherit">{item.cmd}</code>
                <span className="shrink-0 text-white/50 group-hover:text-black/50 transition-colors">
                  {copiedIdx === i ? (
                    <span className="text-green-400 group-hover:text-green-600">✓</span>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="4" width="8" height="8" rx="1" />
                      <rect x="2" y="2" width="8" height="8" rx="1" fill="currentColor" />
                    </svg>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
