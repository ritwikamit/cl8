import { useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";

function CopyFeedback({ copied }: { copied: boolean }) {
  return copied ? (
    <span className="text-xs text-white/40">copied</span>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

const links = [
  { label: "Home", path: "/" },
  { label: "Features", path: "/", anchor: "features" },
  { label: "CLI", path: "/cli" },
  { label: "About", path: "/about" },
  { label: "Blog", path: "/blog" },
];

export default function Navbar() {
  const [copied, setCopied] = useState(false);
  const { pathname } = useLocation();

  const copyNpx = () => {
    navigator.clipboard.writeText("npx @ritwikamit/cl8");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToFeatures = useCallback((e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [pathname]);

  const isActive = (link: typeof links[0]) => {
    if (link.anchor) return false;
    return pathname === link.path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-8 lg:px-16 h-20 flex items-center justify-between" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%)" }}>
      <Link to="/" className="flex items-center gap-2.5 group">
        <span className="flex gap-[3px] items-center">
          <span className="w-[5px] h-[5px] rounded-full bg-[#00aaff]" />
          <span className="w-[5px] h-[5px] rounded-full bg-[#9333ea]" />
        </span>
        <svg width="40" height="18" viewBox="0 0 40 18" className="inline-block">
          <defs>
            <linearGradient id="logoG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00aaff" />
              <stop offset="50%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#ff6bcb" />
            </linearGradient>
          </defs>
          <text x="0" y="15" fontFamily="'Instrument Serif', Georgia, serif" fontStyle="italic" fontSize="16" fontWeight="500" fill="url(#logoG)">CL8</text>
        </svg>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {links.map((l) => (
          l.anchor ? (
            <a
              key={l.label}
              href={`/#${l.anchor}`}
              onClick={scrollToFeatures}
              className="text-sm font-body font-normal tracking-wide text-white/50 hover:text-white/90 transition-colors"
            >
              {l.label}
            </a>
          ) : (
            <Link
              key={l.path}
              to={l.path}
              className={`text-sm font-body font-normal tracking-wide transition-colors ${
                isActive(l) ? "text-white/90" : "text-white/50 hover:text-white/90"
              }`}
            >
              {l.label}
            </Link>
          )
        ))}
        <button
          onClick={copyNpx}
          className="surface rounded-full px-5 py-2 text-sm text-white/80 flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
        >
          <span className="font-body font-normal">npx @ritwikamit/cl8</span>
          <CopyFeedback copied={copied} />
        </button>
      </div>

      <button
        onClick={copyNpx}
        className="md:hidden surface rounded-full px-4 py-2 text-sm text-white/70 flex items-center gap-2 cursor-pointer"
      >
        <span className="text-xs">npx @ritwikamit/cl8</span>
        <CopyFeedback copied={copied} />
      </button>
    </nav>
  );
}
