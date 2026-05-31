import { motion } from "framer-motion";
import FadingVideo from "./FadingVideo";
import BlurText from "./BlurText";
import { useState } from "react";

const item = (d: number) => ({
  initial: { filter: "blur(10px)", opacity: 0, y: 20 },
  animate: { filter: "blur(0px)", opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: "easeOut", delay: d },
});

function CopyCheck({ copied }: { copied: boolean }) {
  return copied ? (
    <span className="text-green-400 text-xs">Copied!</span>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <section className="relative h-screen w-screen overflow-hidden bg-black">
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0"
        style={{ width: "120%", height: "120%" }}
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Navbar */}
        <nav className="fixed top-4 left-0 right-0 z-50 px-8 lg:px-16 flex items-center justify-between">
          <div className="liquid-glass w-12 h-12 rounded-full flex items-center justify-center">
            <span className="italic text-white text-lg" style={{ fontFamily: "'Instrument Serif', serif" }}>
              c
            </span>
          </div>

          <div className="hidden lg:flex liquid-glass rounded-full px-1.5 py-1.5 items-center gap-1">
            {["Home", "Features", "CLI", "About", "Blog"].map((l) => (
              <a key={l} href="#" className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors">
                {l}
              </a>
            ))}
            <button
              onClick={copyNpx}
              className="bg-white text-black rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-2 hover:bg-white/90 transition-colors cursor-pointer"
            >
              <span>npx @ritwikamit/cl8</span>
              <CopyCheck copied={copied} />
            </button>
          </div>

          <div className="w-12 h-12" />
        </nav>

        {/* Hero content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-24">
          <motion.div {...item(0.4)} className="liquid-glass rounded-full inline-flex items-center gap-2 px-1 py-1 mb-6">
            <span className="bg-white text-black rounded-full px-3 py-1 text-xs font-semibold">New</span>
            <span className="text-sm text-white/90 pr-3 font-body">npx @ritwikamit/cl8 — instant AI in your terminal</span>
          </motion.div>

          <div className="max-w-2xl">
            <BlurText
              text="Code Past Your Limits Across the Terminal"
              className="text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.8] justify-center tracking-[-4px]"
              delay={0.5}
            />
          </div>

          <motion.p {...item(0.8)} className="mt-4 text-sm md:text-base text-white/80 max-w-2xl font-body font-light leading-tight">
            Discover a terminal experience once unimaginable. Our AI-powered assistant brings deep coding intelligence within reach — secure, fast, and extraordinary.
          </motion.p>

          <motion.div {...item(1.1)} className="flex items-center gap-6 mt-6">
            <button
              onClick={copyNpx}
              className="liquid-glass-strong rounded-full px-5 py-2.5 text-sm font-medium text-white flex items-center gap-2 cursor-pointer hover:scale-[1.03] transition-transform"
            >
              <span>Start Your Voyage</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </button>
            <a href="https://github.com/ritwikamit/cl8" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6 4 20 12 6 20 6 4" />
              </svg>
              View on GitHub
            </a>
          </motion.div>

          <motion.div {...item(1.3)} className="flex items-stretch gap-4 mt-8">
            <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <div className="text-4xl tracking-[-1px] leading-none text-white mt-3" style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}>
                0.3s
              </div>
              <div className="text-xs text-white/60 font-body font-light mt-2">Avg. Response Time</div>
            </div>
            <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <div className="text-4xl tracking-[-1px] leading-none text-white mt-3" style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}>
                3+ Models
              </div>
              <div className="text-xs text-white/60 font-body font-light mt-2">Ollama · OpenAI · Gemini</div>
            </div>
          </motion.div>
        </div>

        {/* Partners */}
        <motion.div {...item(1.4)} className="flex flex-col items-center gap-4 pb-8">
          <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white/80">
            Powered by leading AI providers
          </div>
          <div className="flex items-center gap-12 md:gap-16 text-2xl md:text-3xl tracking-tight text-white/70" style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}>
            <span>Ollama</span>
            <span>·</span>
            <span>OpenAI</span>
            <span>·</span>
            <span>Gemini</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
