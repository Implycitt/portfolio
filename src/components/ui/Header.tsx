"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/ui/Logo";

const NAV_ITEMS = [
  { label: "projects", href: "/projects" },
  { label: "resume", href: "/resume" },
  { label: "blog", href: "/blog" },
];

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoReplay, setLogoReplay] = useState(0);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 pointer-events-none select-none font-mono text-[11px] sm:text-xs tracking-[0.22em] uppercase">
      <div
        className={`flex items-center justify-between px-4 sm:px-8 py-4 transition-all duration-300 bg-gradient-to-b from-black/70 via-black/30 to-transparent ${
          isScrolled ? "bg-black/40 backdrop-blur-sm" : ""
        }`}
      >
        <Link
          href="/"
          onMouseEnter={() => setLogoReplay((n) => n + 1)}
          className="pointer-events-auto group flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <span className="text-cyan group-hover:neon-cyan transition-all">
            [
          </span>
          <Logo
            key={logoReplay}
            isAnimating
            className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110"
          />
          <span className="font-bold tracking-widest">qb</span>
          <span className="hidden sm:inline text-white/40 group-hover:text-white/70 transition-colors">
            @~/portfolio
          </span>
          <span className="text-cyan group-hover:neon-cyan transition-all">
            ]
          </span>
        </Link>

        <nav className="pointer-events-auto flex items-center gap-3 sm:gap-8">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative py-1 whitespace-nowrap transition-colors duration-200 ${
                  isActive ? "text-white" : "text-white/60 hover:text-white"
                }`}
              >
                <span className="hidden sm:inline text-cyan/70 group-hover:text-cyan transition-colors">
                  ~/
                </span>
                {item.label}
                <span
                  className={`absolute -left-2 top-1/2 -translate-y-1/2 text-cyan transition-opacity ${
                    isActive
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  ▸
                </span>
                <span
                  className={`absolute left-0 -bottom-0.5 h-px w-full bg-gradient-to-r from-cyan to-mauve transition-transform duration-300 origin-left ${
                    isActive
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div
          className="relative hidden md:block"
          onMouseEnter={() => setShowStatus(true)}
          onMouseLeave={() => setShowStatus(false)}
        >
          <button
            type="button"
            aria-expanded={showStatus}
            onClick={() => setShowStatus((v) => !v)}
            className="pointer-events-auto flex cursor-pointer items-center gap-2 text-white/40 transition-colors hover:text-cyan"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan" />
            </span>
            <span className="tracking-widest">online</span>
          </button>

          {showStatus && (
            <div className="pointer-events-auto absolute right-0 top-full w-64 pt-3">
              <div className="origin-top-right rounded-lg border border-white/10 bg-black/90 p-4 font-mono text-[11px] text-white/60 shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-md">
                <p className="text-cyan">
                  <span className="text-white/40">$</span> status --check
                </p>
                <div className="mt-3 space-y-1.5">
                  <p>
                    <span className="text-emerald-400/90">●</span> site online
                  </p>
                  <p>
                    <span className="text-emerald-400/90">●</span> accepting
                    work
                  </p>
                  <p>
                    <span className="text-cyan/70">●</span> reach me at
                  </p>
                </div>
                <div className="mt-3 flex flex-col gap-1 border-t border-white/10 pt-3">
                  <a
                    href="https://github.com/Implycitt"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="transition-colors hover:text-cyan"
                  >
                    <span className="text-white/30">↳</span> github
                  </a>
                  <a
                    href="https://www.linkedin.com/in/quentinbordelon"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="transition-colors hover:text-cyan"
                  >
                    <span className="text-white/30">↳</span> linkedin
                  </a>
                  <a
                    href="mailto:qgbordelon@gmail.com"
                    className="transition-colors hover:text-cyan"
                  >
                    <span className="text-white/30">↳</span> email
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
