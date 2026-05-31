import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "Features", active: true },
  { label: "Studio" },
  { label: "About" },
  { label: "Journal" },
  { label: "Reach Us" },
];

const INSTALL_CMDS = [
  { label: "Run instantly", cmd: "npx @ritwikamit/cl8" },
  { label: "Install globally", cmd: "npm install -g @ritwikamit/cl8" },
  {
    label: "Windows",
    cmd: 'irm https://raw.githubusercontent.com/ritwikamit/cl8/main/scripts/install.ps1 | iex',
  },
  {
    label: "macOS / Linux",
    cmd: 'curl -fsSL https://raw.githubusercontent.com/ritwikamit/cl8/main/scripts/install.sh | bash',
  },
];

export default function HeroSection() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyCmd = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black font-body">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 w-full h-full object-cover"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
          type="video/mp4"
        />
      </video>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-1 select-none">
          <span className="text-3xl tracking-tight gradient-text" style={{ fontFamily: "'Instrument Serif', serif" }}>
            CL8
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href="#"
              className={`text-sm transition-colors ${
                link.active
                  ? "text-foreground"
                  : "text-[hsl(var(--muted-foreground))] hover:text-foreground"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <button
          onClick={() => copyCmd("npx @ritwikamit/cl8", -1)}
          className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground hover:scale-[1.03] transition-transform cursor-pointer"
        >
          Begin Journey
        </button>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 h-[calc(100vh-80px)]">
        <h1
          className="animate-fade-rise text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Your terminal's new{" "}
          <em className="not-italic text-[hsl(var(--muted-foreground))]">
            copilot.
          </em>
          <br />
          Built for{" "}
          <em className="not-italic text-[hsl(var(--muted-foreground))]">
            deep focus.
          </em>
        </h1>

        <p
          className="animate-fade-rise text-[hsl(var(--muted-foreground))] text-base sm:text-lg max-w-2xl mt-8 leading-relaxed"
          style={{ animationDelay: "0.2s", animation: "fade-rise 0.8s ease-out 0.2s both" }}
        >
          A production-grade, terminal-native AI agent that understands natural language,
          writes and edits code, executes commands, searches your codebase, and automates
          complex multi-step workflows — all from the comfort of your terminal.
        </p>

        {/* Primary CTA */}
        <button
          onClick={() => copyCmd("npx @ritwikamit/cl8", -1)}
          className="animate-fade-rise liquid-glass rounded-full px-14 py-5 text-base text-foreground mt-12 hover:scale-[1.03] transition-transform cursor-pointer"
          style={{ animationDelay: "0.4s", animation: "fade-rise 0.8s ease-out 0.4s both" }}
        >
          Install Now
        </button>

        {/* Install method pills */}
        <div
          className="flex flex-wrap justify-center gap-3 mt-10 max-w-2xl"
          style={{ animation: "fade-rise 0.8s ease-out 0.6s both" }}
        >
          {INSTALL_CMDS.map((item, i) => (
            <button
              key={i}
              onClick={() => copyCmd(item.cmd, i)}
              className="liquid-glass rounded-full px-5 py-2 text-[13px] text-foreground/80 hover:text-foreground hover:scale-[1.03] transition-all cursor-pointer flex items-center gap-2"
            >
              <code className="font-mono text-inherit">{item.cmd}</code>
              <span className="shrink-0">
                {copiedIdx === i ? (
                  <span className="text-green-400">✓</span>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" />
                    <rect x="2" y="2" width="6.5" height="6.5" rx="1" fill="currentColor" />
                  </svg>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
