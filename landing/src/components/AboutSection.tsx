import { motion } from "framer-motion";
import StarsBackground from "./StarsBackground";

const stats = [
  { label: "Open Source", value: "MIT" },
  { label: "Local First", value: "Ollama" },
  { label: "Privacy", value: "Your data" },
  { label: "Extensible", value: "APIs" },
];

export default function AboutSection() {
  return (
    <section className="relative min-h-screen w-screen overflow-hidden bg-black flex items-center">
      <div className="absolute inset-0 bg-aura" />
      <StarsBackground />
      <div className="absolute inset-0 z-[2] backdrop-blur-[1px]" />

      <div className="relative z-10 w-full px-8 md:px-16 lg:px-24 py-24">
        <div className="max-w-7xl mx-auto w-full">
          <p className="overline mb-3">About</p>
          <h2 className="font-heading italic text-white text-[clamp(2.5rem,8vw,5rem)] leading-[0.85] tracking-[-3px] md:tracking-[-4px]">
            AI that ships with<br />
            <span className="text-white/50">your workflow</span>
          </h2>

          <div className="divider my-16" />

          <div className="flex flex-col md:flex-row gap-16">
            <div className="flex-1 max-w-xl">
              <p className="text-sm text-white/40 font-body font-normal leading-relaxed">
                CL8 was built for developers who want AI assistance without leaving the command line.
                It connects to Ollama, OpenAI, and Gemini — local or cloud — with a unified interface
                that understands your project structure and delivers context-aware help.
              </p>
              <p className="mt-8 text-sm text-white/20 font-body">
                Built by <span className="text-white/40">Amit Chauhan</span>
              </p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-xs text-white/20 font-body font-medium mb-2">{s.label}</p>
                  <p className="font-heading italic text-white text-2xl tracking-[-0.5px]">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
