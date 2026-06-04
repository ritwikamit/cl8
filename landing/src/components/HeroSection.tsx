import { motion } from "framer-motion";
import FadingVideo from "./FadingVideo";

export default function HeroSection() {
  return (
    <section className="relative h-screen w-screen overflow-hidden bg-aura">
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0 scale-110"
      />

      <div className="absolute inset-0 z-[1] vignette" />

      <div className="relative z-10 flex flex-col h-full pt-20">
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="max-w-5xl text-center">
            <p className="overline mb-6">Terminal AI · v0.1.0-alpha.33</p>
            <h1 className="font-heading italic text-white text-[clamp(2.5rem,10vw,7rem)] leading-[0.88] tracking-[-2px] md:tracking-[-3px] px-2">
              Your terminal<br />
              is the <span className="bg-gradient-to-r from-white via-white/80 to-white bg-clip-text text-transparent inline-block px-1">IDE</span>
            </h1>
            <p className="mt-8 text-base md:text-lg text-white/50 max-w-xl mx-auto font-body font-normal leading-relaxed">
              An AI-powered CLI with full IDE capabilities — code intelligence, version control, file management, and desktop automation. Connect any model and work without leaving the terminal.
            </p>
          </div>

          <div className="flex items-center gap-5 mt-10">
            <button
              onClick={() => { navigator.clipboard.writeText("npx @ritwikamit/cl8"); }}
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
