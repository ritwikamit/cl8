import { motion } from "framer-motion";
import { useState } from "react";
import FadingVideo from "./FadingVideo";

function CopyFeedback({ copied }: { copied: boolean }) {
  return copied ? (
    <span className="text-xs text-white/40">copied</span>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

export default function HeroSection() {
  const [copied, setCopied] = useState(false);

  const copyNpx = () => {
    navigator.clipboard.writeText("npx @ritwikamit/cl8");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="home" className="relative h-screen w-screen overflow-hidden bg-aura">
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0 scale-110"
      />

      <div className="absolute inset-0 z-[1] vignette" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-8 lg:px-16 h-20 flex items-center justify-between" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%)" }}>
          <a href="#home" className="flex items-center gap-3 group">
            <span className="flex items-center gap-0.5">
              <span className="w-2 h-2 rounded-full bg-[#00aaff]" />
              <span className="w-2 h-2 rounded-full bg-[#9333ea]" />
            </span>
            <span className="text-xl font-heading italic gradient-logo tracking-[-1px]">
              CL8
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {["Features", "CLI", "About", "Blog"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-white/50 hover:text-white/90 transition-colors font-body font-normal tracking-wide">
                {l}
              </a>
            ))}
            <button
              onClick={copyNpx}
              className="surface rounded-full px-5 py-2 text-sm text-white/80 flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
            >
              <span className="font-body font-normal">npx @ritwikamit/cl8</span>
              <CopyFeedback copied={copied} />
            </button>
          </div>

          <button
            onClick={copyNpx}
            className="md:hidden surface rounded-full px-4 py-2 text-sm text-white/70 flex items-center gap-2 cursor-pointer"
          >
            <span className="text-xs">npx @ritwikamit/cl8</span>
            <CopyFeedback copied={copied} />
          </button>
        </nav>

        {/* Center */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="max-w-5xl text-center">
            <p className="overline mb-6">Terminal AI · v0.1.0</p>
            <h1 className="font-heading italic text-white text-[clamp(3rem,12vw,8rem)] leading-[0.82] tracking-[-4px] md:tracking-[-6px]">
              Code beyond<br />
              <span className="bg-gradient-to-r from-white/90 via-white/70 to-white/90 bg-clip-text text-transparent">the terminal</span>
            </h1>
            <p className="mt-8 text-base md:text-lg text-white/50 max-w-xl mx-auto font-body font-normal leading-relaxed">
              An AI assistant that lives in your command line. Connect Ollama, OpenAI, or Gemini — local or cloud — and ship code faster.
            </p>
          </div>

          <div className="flex items-center gap-5 mt-10">
            <button
              onClick={copyNpx}
              className="surface rounded-full px-7 py-3 text-sm text-white flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-all"
            >
              <span>Install CL8</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </button>
            <a
              href="https://github.com/ritwikamit/cl8"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/40 hover:text-white/80 transition-colors flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6 4 20 12 6 20 6 4" />
              </svg>
              GitHub
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="pb-8 flex items-center justify-center gap-12 text-sm text-white/30 font-body font-normal">
          <span>0.3s avg response</span>
          <span className="w-0.5 h-0.5 rounded-full bg-white/20" />
          <span>3+ models</span>
          <span className="w-0.5 h-0.5 rounded-full bg-white/20" />
          <span>Ollama · OpenAI · Gemini</span>
        </div>
      </div>
    </section>
  );
}
