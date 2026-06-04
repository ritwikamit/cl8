import { motion } from "framer-motion";
import StarsBackground from "./StarsBackground";

const commands = [
  { cmd: "npx @ritwikamit/cl8@alpha", desc: "Run instantly (no install)" },
  { cmd: "npm i -g @ritwikamit/cl8@alpha --ignore-scripts", desc: "Install globally" },
  { cmd: "cl8 --model gemini", desc: "Use Gemini provider" },
  { cmd: "cl8 --model openai", desc: "Use OpenAI provider" },
  { cmd: "cl8 --model ollama", desc: "Use local Ollama" },
  { cmd: "/mode full", desc: "Enable fully autonomous mode" },
  { cmd: "/upload &lt;path&gt;", desc: "Upload images or text files" },
];

const prerequisites = [
  { icon: "⬥", label: "Node.js", detail: "v18.0.0 or later" },
  { icon: "⬥", label: "npm", detail: "v9+ (ships with Node)" },
  { icon: "⬥", label: "Git", detail: "Optional — for git tool features" },
  { icon: "⬥", label: "Python", detail: "Optional — for Python LSP / scripts" },
  { icon: "⬥", label: "API Key", detail: "Gemini or OpenAI (optional)" },
];

const tips = [
  "/mode full — full autonomy, no approval prompts. CL8 installs missing tools and retries on failure.",
  "Switch to Gemini for speed: cl8 config --set ai.defaultProvider --value gemini",
  "On Windows, use py instead of python. CL8 auto-detects and suggests this.",
  "Mention filenames in backticks (e.g. `app.py`) in your request — CL8 extracts them automatically.",
  "Use /upload &lt;image&gt; to let CL8 see and analyze images via vision models.",
];

export default function CliSection() {
  return (
    <section className="relative min-h-screen w-screen overflow-hidden bg-black flex items-center">
      <div className="absolute inset-0 bg-aura" />
      <StarsBackground />
      <div className="absolute inset-0 z-[2] backdrop-blur-[1px]" />

      <div className="relative z-10 w-full px-8 md:px-16 lg:px-24 py-24">
        <div className="max-w-7xl mx-auto w-full">
          <p className="overline mb-3">CLI</p>
          <h2 className="font-heading italic text-white text-[clamp(2.5rem,8vw,5rem)] leading-[0.85] tracking-[-3px] md:tracking-[-4px]">
            One command.<br />
            <span className="text-white/50">Your whole stack.</span>
          </h2>

          <div className="divider my-16" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left column: Installation + Commands */}
            <div>
              {/* Prerequisites */}
              <div className="mb-12">
                <p className="text-xs text-white/30 font-body font-medium uppercase tracking-widest mb-4">Prerequisites</p>
                <div className="space-y-2">
                  {prerequisites.map((p) => (
                    <div key={p.label} className="flex items-center gap-3 text-sm">
                      <span className="text-white/20">{p.icon}</span>
                      <span className="text-white/70 font-body">{p.label}</span>
                      <span className="text-white/30 font-body">— {p.detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Installation */}
              <div className="mb-12">
                <p className="text-xs text-white/30 font-body font-medium uppercase tracking-widest mb-4">Quick Start</p>
                <div className="space-y-4">
                  {commands.slice(0, 5).map((c, i) => (
                    <motion.div
                      key={c.cmd}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                      className="flex items-center gap-4"
                    >
                      <code className="text-sm text-white/80 font-mono bg-white/[0.03] px-4 py-2 rounded-lg border border-white/[0.06] min-w-[260px] break-all">
                        {c.cmd}
                      </code>
                      <span className="text-xs text-white/30 font-body">{c.desc}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Commands */}
              <div className="mb-12">
                <p className="text-xs text-white/30 font-body font-medium uppercase tracking-widest mb-4">In-App Commands</p>
                <div className="space-y-4">
                  {commands.slice(5).map((c, i) => (
                    <motion.div
                      key={c.cmd}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                      className="flex items-center gap-4"
                    >
                      <code className="text-sm text-white/80 font-mono bg-white/[0.03] px-4 py-2 rounded-lg border border-white/[0.06] min-w-[260px]">
                        {c.cmd}
                      </code>
                      <span className="text-xs text-white/30 font-body">{c.desc}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div>
                <p className="text-xs text-white/30 font-body font-medium uppercase tracking-widest mb-4">Pro Tips</p>
                <ul className="space-y-2">
                  {tips.map((tip, i) => (
                    <li key={i} className="text-sm text-white/40 font-body leading-relaxed flex gap-2">
                      <span className="text-white/20 shrink-0">→</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right column: Terminal simulation */}
            <div className="surface-card rounded-2xl p-8 overflow-x-auto">
              <p className="text-xs text-white/30 font-body font-medium mb-4">Terminal session</p>
              <code className="text-sm font-mono leading-loose block whitespace-pre">
                <span className="text-white/40">$</span> npx @ritwikamit/cl8@alpha
                <br />
                <span className="text-white/30"> ⠋ cl8 is thinking...  </span>
                <br />
                <span className="text-white/30"> │  </span>
                <br />
                <span className="text-white/30"></span>
                <span className="text-white/60">◆ cl8 &gt; </span>write a React hook for debounce
                <br />
                <span className="text-white/30">                          </span>
                <br />
                <span className="text-white/40">  → Creating src/hooks/useDebounce.ts...</span>
                <br />
                <span className="text-white/40">  → ✓ Done</span>
                <br />
                <span className="text-white/30">                          </span>
                <br />
                <span className="text-white/60">◆ cl8 &gt; </span>what does `calculateTotal` do?
                <br />
                <span className="text-white/30">                          </span>
                <br />
                <span className="text-white/40">  → lsp definition src/utils/math.ts:42:5</span>
                <br />
                <span className="text-white/40">    Calculates total with tax and discount</span>
                <br />
                <span className="text-white/30">                          </span>
                <br />
                <span className="text-white/60">◆ cl8 &gt; </span>git status
                <br />
                <span className="text-white/30">                          </span>
                <br />
                <span className="text-white/40">  → git status</span>
                <br />
                <span className="text-white/70">    On branch main</span>
                <br />
                <span className="text-white/70">    Changes: 3 files</span>
                <br />
                <span className="text-white/30">                          </span>
                <br />
                <span className="text-white/60">◆ cl8 &gt; </span>/upload screenshot.png
                <br />
                <span className="text-white/40">  ✓ screenshot.png (124 KB)</span>
                <br />
                <span className="text-white/40">    Type your message to send it with the image.</span>
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
