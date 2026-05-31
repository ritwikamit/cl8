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
} from "lucide-react";

const NAV_LINKS = [
  { label: "Movies", delay: 100 },
  { label: "TV Series", delay: 150 },
  { label: "Editor's Pick", delay: 200 },
  { label: "Interviews", delay: 250 },
  { label: "User Reviews", delay: 300 },
];

export default function HeroSection() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black font-sans">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 z-0 w-full h-full object-cover"
        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect fill='%23000' width='1920' height='1080'/%3E%3C/svg%3E"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4"
          type="video/mp4"
        />
      </video>

      {/* Bottom blur overlay (no dark gradient) */}
      <div
        className="fixed inset-0 z-1 pointer-events-none"
        style={{
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          maskImage: "linear-gradient(to top, black 0%, transparent 45%)",
          WebkitMaskImage:
            "linear-gradient(to top, black 0%, transparent 45%)",
        }}
      />

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 md:py-6">
        {/* Logo */}
        <div
          className="animate-blur-fade-up flex items-center gap-2"
          style={{ animationDelay: "0ms" }}
        >
          <Terminal className="w-5 h-5 md:w-6 md:h-6 text-white" />
          <span className="text-base md:text-lg font-semibold tracking-wide text-white">
            CL8
          </span>
        </div>

        {/* Desktop nav links (center) */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href="#"
              className="animate-blur-fade-up text-sm text-gray-300 hover:text-gray-300/70 transition-colors"
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

        {/* Hamburger (below lg) */}
        <button
          className="lg:hidden animate-blur-fade-up liquid-glass w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
          style={{ animationDelay: "350ms" }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <div className="relative w-5 h-5">
            <Menu
              size={20}
              className={`absolute inset-0 text-gray-300 transition-all duration-500 ease-out ${
                mobileOpen
                  ? "opacity-0 rotate-180 scale-50"
                  : "opacity-100 rotate-0 scale-100"
              }`}
            />
            <X
              size={20}
              className={`absolute inset-0 text-gray-300 transition-all duration-500 ease-out ${
                mobileOpen
                  ? "opacity-100 rotate-0 scale-100"
                  : "opacity-0 -rotate-180 scale-50"
              }`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile menu (below lg) */}
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
              href="#"
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
        {/* Mobile search/profile (below sm) */}
        <div className="border-t border-gray-800 px-4 py-4 flex gap-3 sm:hidden">
          <button className="liquid-glass rounded-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 flex-1 justify-center cursor-pointer">
            <Search size={16} />
            Search
          </button>
          <button className="liquid-glass w-10 h-10 rounded-full flex items-center justify-center cursor-pointer">
            <User size={16} className="text-gray-300" />
          </button>
        </div>
      </div>

      {/* Hero content (aligned to bottom) */}
      <div className="relative z-10 flex flex-col justify-end h-full px-4 sm:px-6 md:px-12 pb-8 md:pb-16">
        <div className="flex flex-col md:flex-row items-end gap-8 w-full">
          {/* Left side */}
          <div className="flex-1 w-full">
            {/* Metadata row */}
            <div
              className="animate-blur-fade-up flex flex-wrap items-center gap-3 sm:gap-6 mb-6 md:mb-8 text-xs sm:text-sm"
              style={{ animationDelay: "300ms" }}
            >
              <span className="flex items-center gap-1.5 text-gray-300">
                <Star
                  size={16}
                  className="fill-white text-white sm:w-5 sm:h-5"
                />
                <span className="font-medium">4.9/5</span>
              </span>
              <span className="flex items-center gap-1.5 text-gray-300">
                <Clock size={16} />
                <span>Terminal AI</span>
              </span>
              <span className="flex items-center gap-1.5 text-gray-300">
                <Calendar size={16} />
                <span>April, 2025</span>
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
              Step Through.
              <br />
              Work Smarter.
            </h1>

            {/* Description */}
            <p
              className="animate-blur-fade-up text-base sm:text-lg md:text-xl text-gray-400 mb-6 md:mb-12 max-w-2xl"
              style={{ animationDelay: "500ms" }}
            >
              A voyage through forgotten realms, where past and future
              intertwine. Your terminal becomes a portal.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                className="animate-blur-fade-up bg-white text-black rounded-full font-medium px-6 sm:px-8 py-2.5 sm:py-3 flex items-center gap-2 hover:bg-gray-200 transition-colors cursor-pointer text-sm sm:text-base"
                style={{ animationDelay: "600ms" }}
                onClick={() => {
                  navigator.clipboard.writeText("npx @ritwikamit/cl8");
                }}
              >
                <Play size={18} className="fill-black" />
                Install Now
              </button>
              <button
                className="animate-blur-fade-up liquid-glass rounded-full font-medium px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base text-gray-300 hover:text-white transition-colors cursor-pointer"
                style={{ animationDelay: "700ms" }}
                onClick={() =>
                  window.open(
                    "https://github.com/ritwikamit/cl8#readme",
                    "_blank"
                  )
                }
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right side navigation arrows */}
          <div className="flex md:flex-col gap-3 w-full md:w-auto justify-start md:justify-end mt-6 md:mt-0">
            <button
              className="animate-blur-fade-up liquid-glass rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-center gap-2 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer"
              style={{ animationDelay: "800ms" }}
              onClick={() =>
                window.open("https://github.com/ritwikamit/cl8", "_blank")
              }
            >
              <ChevronLeft size={18} />
              <span className="hidden sm:inline">GitHub</span>
            </button>
            <button
              className="animate-blur-fade-up liquid-glass rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-center gap-2 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer"
              style={{ animationDelay: "900ms" }}
              onClick={() =>
                window.open(
                  "https://github.com/ritwikamit/cl8#readme",
                  "_blank"
                )
              }
            >
              <span className="hidden sm:inline">Docs</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
