import { motion } from "framer-motion";
import BlurText from "./BlurText";

const item = (d: number) => ({
  initial: { filter: "blur(10px)", opacity: 0, y: 20 },
  animate: { filter: "blur(0px)", opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: "easeOut", delay: d },
});

export default function AboutSection() {
  return (
    <section id="about" className="relative min-h-screen w-screen overflow-hidden bg-black flex items-center justify-center scroll-mt-28">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(255,107,203,0.07),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_80%,rgba(0,170,255,0.05),transparent_60%)]" />
      </div>

      <div className="relative z-10 px-8 md:px-16 lg:px-20 py-24 flex flex-col items-center text-center max-w-4xl">
        <motion.p {...item(0)} className="text-sm font-medium text-white/70 mb-6 tracking-widest uppercase">// About</motion.p>

        <BlurText
          text="AI that ships with your workflow"
          className="font-heading italic text-white text-5xl md:text-6xl lg:text-7xl leading-[0.9] tracking-[-3px] justify-center text-glow"
          delay={0.2}
        />

        <motion.p {...item(0.4)} className="mt-8 text-base md:text-lg text-white/90 max-w-3xl font-body leading-relaxed font-normal text-glow">
          CL8 was built for developers who want AI assistance without leaving the command line.
          It connects to Ollama, OpenAI, and Gemini — local or cloud — with a unified interface
          that understands your project structure, tracks changes, and delivers context-aware help.
        </motion.p>

        <motion.div {...item(0.6)} className="flex flex-wrap justify-center gap-4 mt-10">
          {["Open Source", "Privacy First", "Local First", "Extensible"].map((trait) => (
            <div key={trait} className="liquid-glass rounded-full px-5 py-2.5 text-sm font-medium text-white/90">
              {trait}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
