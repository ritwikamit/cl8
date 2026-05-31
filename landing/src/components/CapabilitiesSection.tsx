import { motion } from "framer-motion";
import FadingVideo from "./FadingVideo";

const cards = [
  {
    number: "01",
    title: "Code Generation",
    body: "Describe what you need in plain English. CL8 generates production-ready code across files with intelligent suggestions.",
  },
  {
    number: "02",
    title: "Multi-Provider",
    body: "Seamlessly switch between Ollama, OpenAI, and Gemini through a single unified terminal interface.",
  },
  {
    number: "03",
    title: "Context-Aware",
    body: "CL8 understands your entire project — structure, changes, history — and provides relevant assistance every session.",
  },
];

export default function CapabilitiesSection() {
  return (
    <section id="features" className="relative min-h-screen w-screen overflow-hidden bg-aura">
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0 scale-110"
      />
      <div className="absolute inset-0 z-[1]" style={{ background: "radial-gradient(ellipse 80% 50% at 50% 50%, transparent 10%, rgba(0,0,0,0.8) 100%)", pointerEvents: "none" }} />

      <div className="relative z-10 min-h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24 py-24">
        <div className="max-w-7xl mx-auto w-full">
          <p className="overline mb-3">Capabilities</p>
          <h2 className="font-heading italic text-white text-[clamp(2.5rem,8vw,5rem)] leading-[0.85] tracking-[-3px] md:tracking-[-4px]">
            Everything you need,<br />
            <span className="text-white/50">nothing you don't</span>
          </h2>

          <div className="divider my-16" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            {cards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.12 }}
              >
                <p className="text-xs text-white/20 font-body font-medium mb-4">{card.number}</p>
                <h3 className="font-heading italic text-white text-2xl md:text-3xl tracking-[-0.5px] leading-tight mb-4">
                  {card.title}
                </h3>
                <p className="text-sm text-white/40 font-body font-normal leading-relaxed max-w-xs">
                  {card.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
