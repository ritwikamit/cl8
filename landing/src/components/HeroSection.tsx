import { useState, useEffect, useRef, useCallback } from "react";
import { useTypewriter } from "../hooks/useTypewriter";

const NAV_LINKS = ["Labs", "Studio", "Openings", "Shop"];

const PILL_LABELS = [
  "Pitch us an idea",
  "Come work here",
  "Send a brief hello",
  "See how we operate",
];

const TYPEWRITER_TEXT =
  "Glad you stopped in. Good taste tends to find us. Now, what are we building?";

function CopyIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <rect
        x="3.5"
        y="3.5"
        width="7"
        height="7"
        rx="1"
        stroke="currentColor"
        strokeWidth="1"
      />
      <rect
        x="1.5"
        y="1.5"
        width="7"
        height="7"
        rx="1"
        fill="white"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function HeroSection() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pillsVisible, setPillsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevXRef = useRef(0);
  const targetTimeRef = useRef(0);
  const seekingRef = useRef(false);

  const { displayed, done } = useTypewriter(TYPEWRITER_TEXT, 38, 600);

  // Show pills 400ms after mount
  useEffect(() => {
    const t = setTimeout(() => setPillsVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  // Mouse-scrub video
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const delta = e.clientX - prevXRef.current;
    prevXRef.current = e.clientX;
    const sensitivity = 0.8;
    const offset = (delta / window.innerWidth) * sensitivity * video.duration;
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

  const copyEmail = () => {
    navigator.clipboard.writeText("hello@mainframe.co");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-white">
      {/* Background video (mouse-scrub) */}
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        onSeeked={handleSeeked}
        className="fixed inset-0 z-0 w-full h-full object-cover"
        style={{ objectPosition: "70% center" }}
        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect fill='%23fff' width='1920' height='1080'/%3E%3C/svg%3E"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4"
          type="video/mp4"
        />
      </video>

      {/* Navbar (fixed, z-index: 10) */}
      <nav className="fixed top-0 left-0 right-0 z-10 px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between bg-transparent">
        {/* Logo */}
        <div className="flex items-center gap-3 select-none">
          <span
            className="text-[21px] sm:text-[26px] tracking-tight text-black"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Mainframe&reg;
          </span>
          <span
            className="text-[25px] sm:text-[30px] text-black select-none"
            style={{ letterSpacing: "-0.02em" }}
          >
            ✳︎
          </span>
        </div>

        {/* Desktop nav links (center) */}
        <div className="hidden md:flex items-center text-[23px] text-black gap-0">
          {NAV_LINKS.map((link, i) => (
            <span key={link}>
              <a
                href="#"
                className="hover:opacity-60 transition-opacity"
              >
                {link}
              </a>
              {i < NAV_LINKS.length - 1 && <span>, </span>}
            </span>
          ))}
        </div>

        {/* Desktop CTA */}
        <a
          href="#"
          className="hidden md:inline text-[23px] text-black underline underline-offset-2 hover:opacity-60 transition-opacity"
        >
          Get in touch
        </a>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] items-center justify-center w-8 h-8 cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`w-6 h-[2px] bg-black block transition-all duration-300 ${
              mobileOpen ? "rotate-45 translate-y-[7px]" : ""
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-black block transition-all duration-300 ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-black block transition-all duration-300 ${
              mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`md:hidden fixed inset-0 z-9 bg-white/95 backdrop-blur-sm flex flex-col items-start justify-center px-8 gap-8 transition-all duration-300 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href="#"
            className="text-[32px] font-medium text-black hover:opacity-60 transition-opacity"
            onClick={() => setMobileOpen(false)}
          >
            {link}
          </a>
        ))}
        <a
          href="#"
          className="text-[32px] font-medium text-black underline underline-offset-4 hover:opacity-60 transition-opacity"
          onClick={() => setMobileOpen(false)}
        >
          Get in touch
        </a>
      </div>

      {/* Hero content (z-index: 1) */}
      <div className="relative z-1 h-screen flex flex-col justify-end md:justify-center pb-12 md:pb-0 px-5 sm:px-8 md:px-10 overflow-hidden">
        <div className="max-w-xl relative z-10">
          {/* Blurred intro label */}
          <div
            className="pointer-events-none select-none mb-5 sm:mb-6"
            style={{
              fontSize: "clamp(18px, 4vw, 26px)",
              lineHeight: 1.3,
              fontWeight: 400,
              color: "#000",
              filter: "blur(4px)",
            }}
          >
            Hey there, meet A.R.I.A,
            <br />
            Mainframe's Adaptive Response Interface Agent
          </div>

          {/* Typewriter text */}
          <div
            className="mb-5 sm:mb-6 text-black"
            style={{
              fontSize: "clamp(18px, 4vw, 26px)",
              lineHeight: 1.35,
              fontWeight: 400,
              minHeight: "54px",
            }}
          >
            {displayed}
            {!done && (
              <span className="inline-block w-[2px] h-[1.1em] bg-black align-middle ml-[2px] animate-blink" />
            )}
          </div>

          {/* Pill buttons (appear after 400ms) */}
          <div
            className="flex flex-wrap gap-y-1 transition-all duration-400"
            style={{
              opacity: pillsVisible ? 1 : 0,
              transform: pillsVisible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
            }}
          >
            {PILL_LABELS.map((label) => (
              <span
                key={label}
                className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"
              >
                {label}
              </span>
            ))}

            {/* Outline pill (email button) */}
            <span
              onClick={copyEmail}
              className="inline-flex items-center justify-center bg-transparent text-white border border-white rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-white hover:text-black transition-colors duration-200 cursor-pointer gap-2 sm:gap-3"
            >
              <span>
                Reach us:{" "}
                <span className="underline underline-offset-1">
                  hello@mainframe.co
                </span>
              </span>
              {copied ? (
                <span className="text-xs">Copied!</span>
              ) : (
                <CopyIcon />
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
