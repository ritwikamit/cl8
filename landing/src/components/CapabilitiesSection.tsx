import { motion } from "framer-motion";
import FadingVideo from "./FadingVideo";
import BlurText from "./BlurText";

const cards = [
  {
    title: "Code Generation",
    icon: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m18-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4m18 0H3",
    tags: ["Natural Language", "Multi-File", "Refactor", "Smart Suggest"],
    body: "Describe what you need in plain English. CL8 generates production-ready code across files, with intelligent suggestions and automatic refactoring.",
  },
  {
    title: "Multi-Provider",
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    tags: ["Ollama", "OpenAI", "Gemini", "Fast Switch"],
    body: "Seamlessly switch between AI providers. Run locally with Ollama or connect to cloud models — all through the same unified terminal interface.",
  },
  {
    title: "Context-Aware",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    tags: ["Workspace Aware", "File Memory", "Smart Context", "History"],
    body: "CL8 understands your entire project. It remembers your codebase structure, tracks changes, and provides contextually relevant assistance across every session.",
  },
];

export default function CapabilitiesSection() {
  return (
    <section id="features" className="relative min-h-screen w-screen overflow-hidden bg-black scroll-mt-28">
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      <div className="absolute inset-0 z-[1] vignette-dark" />

      <div className="relative z-10 px-8 md:px-16 lg:px-20 pt-28 pb-16 flex flex-col min-h-screen">
        <div className="mb-auto">
          <p className="text-sm font-medium text-white/70 mb-6 tracking-widest uppercase text-glow">// Capabilities</p>
          <BlurText
            text="Terminal evolved"
            className="font-heading italic text-white text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px] justify-start text-glow"
            delay={0.2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ filter: "blur(10px)", opacity: 0, y: 30 }}
              whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 + i * 0.15 }}
              className="liquid-glass rounded-[1.25rem] p-8 min-h-[400px] flex flex-col"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="liquid-glass w-11 h-11 rounded-[0.75rem] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={card.icon} />
                  </svg>
                </div>
                <div className="flex flex-wrap justify-end gap-1.5 max-w-[65%]">
                  {card.tags.map((tag) => (
                    <span key={tag} className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-medium whitespace-nowrap">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex-1" />

              <div className="mt-6">
                <h3
                  className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  {card.title}
                </h3>
                <p className="mt-4 text-sm text-white/90 font-body leading-relaxed max-w-[32ch] font-normal">
                  {card.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
