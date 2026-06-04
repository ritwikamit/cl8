import { useState, useCallback, useEffect } from "react";
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

function Hamburger({ open }: { open: boolean }) {
  return (
    <svg width="22" height="18" viewBox="0 0 22 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      {open ? (
        <>
          <path d="M2 2L20 16" />
          <path d="M20 2L2 16" />
        </>
      ) : (
        <>
          <path d="M2 3h18" />
          <path d="M2 9h18" />
          <path d="M2 15h18" />
        </>
      )}
    </svg>
  );
}

export default function Navbar() {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => { setMenuOpen(false); }, [pathname]);

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
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (link: typeof links[0]) => {
    if (link.anchor) return false;
    return pathname === link.path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-16 h-20 flex items-center justify-between" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%)" }}>
      <Link to="/" className="flex items-center gap-3 group shrink-0" onClick={() => setMenuOpen(false)}>
        <span className="flex gap-[5px] items-center">
          <span className="w-[9px] h-[9px] rounded-full bg-[#00aaff]" />
          <span className="w-[9px] h-[9px] rounded-full bg-[#9333ea]" />
        </span>
        <svg width="60" height="26" viewBox="0 0 60 26" className="inline-block">
          <defs>
            <linearGradient id="logoG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00aaff" />
              <stop offset="50%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#ff6bcb" />
            </linearGradient>
          </defs>
          <text x="0" y="21" fontFamily="'Instrument Serif', Georgia, serif" fontStyle="italic" fontSize="24" fontWeight="500" fill="url(#logoG)">CL8</text>
        </svg>
      </Link>

      {/* Desktop nav */}
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

      {/* Mobile controls */}
      <div className="flex md:hidden items-center gap-3">
        <button
          onClick={copyNpx}
          className="surface rounded-full px-3 py-1.5 text-xs text-white/70 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <span>npx cl8</span>
          <CopyFeedback copied={copied} />
        </button>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 text-white/60 hover:text-white/90 transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          <Hamburger open={menuOpen} />
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="fixed top-20 left-0 right-0 z-50 md:hidden" style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}>
          <div className="flex flex-col px-6 py-6 gap-5">
            {links.map((l) => (
              l.anchor ? (
                <a
                  key={l.label}
                  href={`/#${l.anchor}`}
                  onClick={scrollToFeatures}
                  className="text-base font-body font-normal text-white/70 hover:text-white transition-colors"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.path}
                  to={l.path}
                  onClick={() => setMenuOpen(false)}
                  className={`text-base font-body font-normal transition-colors ${
                    isActive(l) ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              )
            ))}
            <div className="divider my-2" />
            <p className="text-xs text-white/30 font-body">Built by Amit Chauhan</p>
          </div>
        </div>
      )}
    </nav>
  );
}
