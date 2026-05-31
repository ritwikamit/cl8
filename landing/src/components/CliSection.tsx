import { motion } from "framer-motion";
import BlurText from "./BlurText";

const item = (d: number) => ({
  initial: { filter: "blur(10px)", opacity: 0, y: 20 },
  animate: { filter: "blur(0px)", opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: "easeOut", delay: d },
});

export default function CliSection() {
  return (
    <section id="cli" className="relative min-h-screen w-screen overflow-hidden bg-black flex items-center justify-center scroll-mt-28">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(0,170,255,0.08),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_80%,rgba(147,51,234,0.06),transparent_60%)]" />
      </div>

      <div className="relative z-10 px-8 md:px-16 lg:px-20 py-24 flex flex-col items-center text-center max-w-4xl">
        <motion.p {...item(0)} className="text-sm font-medium text-white/70 mb-6 tracking-widest uppercase">// CLI</motion.p>

        <BlurText
          text="Built for the terminal native"
          className="font-heading italic text-white text-5xl md:text-6xl lg:text-7xl leading-[0.9] tracking-[-3px] justify-center text-glow"
          delay={0.2}
        />

        <motion.p {...item(0.4)} className="mt-8 text-base md:text-lg text-white/90 max-w-2xl font-body leading-relaxed font-normal text-glow">
          No bloated IDE plugin. No Electron app. CL8 lives in your terminal, where you already work. One npx command is all it takes.
        </motion.p>

        <motion.div {...item(0.6)} className="mt-10 liquid-glass rounded-2xl p-8 w-full max-w-2xl text-left">
          <code className="text-sm md:text-base text-white/90 font-mono leading-relaxed block">
            <span className="text-green-400">$</span> npx @ritwikamit/cl8<br />
            <span className="text-white/60 mt-2 block">▸ Connected to Ollama (llama3.2)<br />▸ Ready — ask me anything about your code</span>
          </code>
        </motion.div>
      </div>
    </section>
  );
}
