import { motion } from "framer-motion";

const commands = [
  { cmd: "npx @ritwikamit/cl8", desc: "Start CL8" },
  { cmd: "cl8 --model ollama", desc: "Use local Ollama" },
  { cmd: "cl8 --model openai", desc: "Use OpenAI" },
  { cmd: "cl8 --model gemini", desc: "Use Gemini" },
];

export default function CliSection() {
  return (
    <section id="cli" className="relative min-h-screen w-screen overflow-hidden bg-black flex items-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_60%,rgba(255,255,255,0.03),transparent_70%)]" />

      <div className="relative z-10 w-full px-8 md:px-16 lg:px-24 py-24">
        <div className="max-w-7xl mx-auto w-full">
          <p className="overline mb-3">CLI</p>
          <h2 className="font-heading italic text-white text-[clamp(2.5rem,8vw,5rem)] leading-[0.85] tracking-[-3px] md:tracking-[-4px]">
            One command.<br />
            <span className="text-white/50">Your whole stack.</span>
          </h2>

          <div className="divider my-16" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <p className="text-sm text-white/40 font-body font-normal leading-relaxed max-w-md">
                No bloated plugin. No Electron app. CL8 is a single npx invocation — or install it globally and it's always ready in your terminal.
              </p>
              <div className="mt-8 space-y-4">
                {commands.map((c, i) => (
                  <motion.div
                    key={c.cmd}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                    className="flex items-center gap-4"
                  >
                    <code className="text-sm text-white/80 font-mono bg-white/[0.03] px-4 py-2 rounded-lg border border-white/[0.06] min-w-[220px]">
                      {c.cmd}
                    </code>
                    <span className="text-xs text-white/30 font-body">{c.desc}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="surface-card rounded-2xl p-8">
              <p className="text-xs text-white/30 font-body font-medium mb-4">Terminal output</p>
              <code className="text-sm text-white/60 font-mono leading-loose block">
                <span className="text-white/40">$</span> npx @ritwikamit/cl8<br />
                <span className="text-white/30">▸ Connected to Ollama (llama3.2)<br />
                ▸ CL8 ready · 3 providers available<br /><br />
                <span className="text-white/60">&gt;</span> Write a React hook for debounce</span>
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
