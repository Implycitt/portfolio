"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "projects", href: "/projects" },
  { label: "resume", href: "/resume" },
  { label: "blog", href: "/blog" },
];

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

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
          className="pointer-events-auto group flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <span className="text-cyan group-hover:neon-cyan transition-all">[</span>
          <span className="font-bold tracking-widest">qb</span>
          <span className="hidden sm:inline text-white/40 group-hover:text-white/70 transition-colors">
            @~/portfolio
          </span>
          <span className="text-cyan group-hover:neon-cyan transition-all">]</span>
        </Link>

        <nav className="pointer-events-auto flex items-center gap-3 sm:gap-8">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative py-1 whitespace-nowrap transition-colors duration-200 ${
                  isActive
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <span className="hidden sm:inline text-cyan/70 group-hover:text-cyan transition-colors">~/</span>
                {item.label}
                <span
                  className={`absolute -left-2 top-1/2 -translate-y-1/2 text-cyan transition-opacity ${
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  ▸
                </span>
                <span
                  className={`absolute left-0 -bottom-0.5 h-px w-full bg-gradient-to-r from-cyan to-mauve transition-transform duration-300 origin-left ${
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2 text-white/40">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan" />
          </span>
          <span className="tracking-widest">online</span>
        </div>
      </div>
    </header>
  );
}
