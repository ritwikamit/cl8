import { useState } from "react";
import {
  Search,
  User,
  Menu,
  X,
  Star,
  Clock,
  Calendar,
  Play,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Copy,
  Check,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Features", delay: 100 },
  { label: "Architecture", delay: 150 },
  { label: "Quick Start", delay: 200 },
  { label: "Commands", delay: 250 },
  { label: "Docs", delay: 300 },
];

const INSTALL_COMMANDS = [
  { label: "npx (no install)", cmd: "npx @ritwikamit/cl8", delay: 600 },
  { label: "npm global install", cmd: "npm install -g @ritwikamit/cl8", delay: 700 },
  { label: "PowerShell one-liner", cmd: 'irm bit.ly/cl8-install | iex', delay: 800 },
  { label: "macOS / Linux", cmd: 'curl -fsSL bit.ly/cl8-install-sh | bash', delay: 900 },
];

export default function HeroSection() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black font-sans">
      {/* Background gradient animation */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,170,255,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 30% 100%, rgba(147,51,234,0.1) 0%, transparent 50%), radial-gradient(ellipse 60% 50% at 70% 100%, rgba(255,107,203,0.08) 0%, transparent 50%)",
        }}
      />

      {/* Animated grid overlay */}
      <div
        className="fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Bottom blur overlay */}
      <div
        className="fixed inset-0 z-1 pointer-events-none"
        style={{
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          maskImage: "linear-gradient(to top, black 0%, transparent 45%)",
          WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 45%)",
        }}
      />

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 md:py-6">
        <div className="animate-blur-fade-up flex items-center gap-2" style={{ animationDelay: "0ms" }}>
          <Terminal className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
          <span className="text-xl md:text-2xl font-bold gradient-text">CL8</span>
        </div>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={`#${link.label.toLowerCase().replace(/\s+/g, "-")}`}
              className="animate-blur-fade-up text-sm text-gray-300 hover:text-white transition-colors"
              style={{ animationDelay: `${link.delay}ms` }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop right buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            className="animate-blur-fade-up liquid-glass rounded-full flex items-center gap-2 px-4 md:px-6 py-2 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer"
            style={{ animationDelay: "350ms" }}
          >
            <Search size={18} />
            <span className="hidden md:inline">Search</span>
          </button>
          <button
            className="animate-blur-fade-up liquid-glass w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
            style={{ animationDelay: "400ms" }}
          >
            <User size={18} className="text-gray-300" />
          </button>
        </div>

        {/* Hamburger */}
        <button
          className="lg:hidden animate-blur-fade-up liquid-glass w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
          style={{ animationDelay: "350ms" }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <div className="relative w-5 h-5">
            <Menu
              size={20}
              className={`absolute inset-0 text-gray-300 transition-all duration-500 ease-out ${
                mobileOpen ? "opacity-0 rotate-180 scale-50" : "opacity-100 rotate-0 scale-100"
              }`}
            />
            <X
              size={20}
              className={`absolute inset-0 text-gray-300 transition-all duration-500 ease-out ${
                mobileOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-180 scale-50"
              }`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`lg:hidden absolute top-[72px] left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-lg border-t border-b border-gray-800 shadow-2xl transition-all duration-500 ease-out ${
          mobileOpen
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-4 py-4 space-y-1">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.label}
              href={`#${link.label.toLowerCase().replace(/\s+/g, "-")}`}
              className="block py-3 px-3 rounded-lg text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-300"
              style={{
                transform: `translateX(${mobileOpen ? 0 : -20}px)`,
                transitionDelay: `${i * 50}ms`,
                transitionProperty: "transform, opacity",
                transitionDuration: "500ms",
                transitionTimingFunction: "ease-out",
                opacity: mobileOpen ? 1 : 0,
              }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="border-t border-gray-800 px-4 py-4 flex gap-3 sm:hidden">
          <button className="liquid-glass rounded-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 cursor-pointer">
            <Search size={16} />
            Search
          </button>
          <button className="liquid-glass w-10 h-10 rounded-full flex items-center justify-center cursor-pointer">
            <User size={16} className="text-gray-300" />
          </button>
        </div>
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col justify-end h-full px-4 sm:px-6 md:px-12 pb-8 md:pb-16">
        <div className="flex flex-col md:flex-row items-end gap-8 w-full">
          {/* Left side */}
          <div className="flex-1 w-full">
            {/* Metadata row */}
            <div
              className="animate-blur-fade-up flex flex-wrap items-center gap-3 sm:gap-6 mb-6 md:mb-8 text-xs sm:text-sm text-gray-400"
              style={{ animationDelay: "300ms" }}
            >
              <span className="flex items-center gap-1.5">
                <Star size={16} className="fill-yellow-400 text-yellow-400 sm:w-5 sm:h-5" />
                <span className="font-medium text-white">4.9/5</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Terminal size={16} />
                <span>AI Agent</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={16} />
                <span>Ollama · OpenAI · Gemini</span>
              </span>
            </div>

            {/* Title */}
            <h1
              className="animate-blur-fade-up text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-white mb-4 md:mb-6"
              style={{
                animationDelay: "400ms",
                letterSpacing: "-0.04em",
              }}
            >
              Terminal-First AI
              <br />
              <span className="gradient-text">Coding Assistant</span>
            </h1>

            {/* Description */}
            <p
              className="animate-blur-fade-up text-base sm:text-lg md:text-xl text-gray-400 mb-6 md:mb-8 max-w-2xl"
              style={{ animationDelay: "500ms" }}
            >
              A production-grade, terminal-native AI agent that understands natural language,
              writes and edits code, executes commands, searches your codebase, and automates
              complex multi-step workflows — all from the comfort of your terminal.
            </p>

            {/* Install commands */}
            <div className="animate-blur-fade-up space-y-3 mb-6" style={{ animationDelay: "550ms" }}>
              <p className="text-xs uppercase tracking-widest text-gray-500 font-medium">
                ⚡ One-liner install
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {INSTALL_COMMANDS.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => copyToClipboard(item.cmd, i)}
                    className="animate-blur-fade-up liquid-glass rounded-xl px-4 py-3 flex items-center justify-between gap-2 text-left cursor-pointer group w-full"
                    style={{ animationDelay: `${item.delay}ms` }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-0.5">{item.label}</div>
                      <code className="text-sm text-gray-200 font-mono block truncate">
                        {item.cmd}
                      </code>
                    </div>
                    <div className="shrink-0">
                      {copiedIndex === i ? (
                        <Check size={16} className="text-green-400" />
                      ) : (
                        <Copy size={16} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex md:flex-col gap-3 w-full md:w-auto justify-start md:justify-end">
            <button
              className="animate-blur-fade-up liquid-glass rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-center gap-2 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer"
              style={{ animationDelay: "1000ms" }}
              onClick={() => window.open("https://github.com/ritwikamit/cl8", "_blank")}
            >
              <ChevronLeft size={18} />
              <span className="hidden sm:inline">GitHub</span>
            </button>
            <button
              className="animate-blur-fade-up liquid-glass rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-center gap-2 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer"
              style={{ animationDelay: "1100ms" }}
              onClick={() => window.open("https://github.com/ritwikamit/cl8#readme", "_blank")}
            >
              <span className="hidden sm:inline">Docs</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom glow */}
      <div
        className="fixed bottom-0 left-0 right-0 h-32 z-5 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(0,170,255,0.08) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
