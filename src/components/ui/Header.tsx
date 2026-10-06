"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/ui/Logo";
import { scrollToTarget } from "@/lib/scroller";

const NAV_ITEMS = [
  { label: "projects", href: "/projects" },
  { label: "resume", href: "/resume" },
  { label: "blog", href: "/blog" },
];

const SOCIAL_LINKS = [
  { label: "github", href: "https://github.com/Implycitt" },
  { label: "linkedin", href: "https://www.linkedin.com/in/quentinbordelon" },
  { label: "email", href: "mailto:qgbordelon@gmail.com" },
];

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const aboutRef = useRef<HTMLElement | null>(null);
  const [showStatus, setShowStatus] = useState(false);
  const [clock, setClock] = useState<string | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);
  const statusId = useId();

  const onBrandClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (
        !isHome ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const about = aboutRef.current ?? document.getElementById("about");
      if (!about) return;

      event.preventDefault();
      aboutRef.current = about;

      if (window.location.hash !== "#about") {
        history.replaceState(null, "", "#about");
      }
      scrollToTarget(about, 0.8);
    },
    [isHome],
  );

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!showStatus) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowStatus(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      const root = statusRef.current;
      if (root && !root.contains(event.target as Node)) setShowStatus(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [showStatus]);

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 pointer-events-none select-none font-mono text-[11px] sm:text-xs tracking-[0.22em] uppercase">
      <div
        className={`relative flex items-center justify-between px-4 sm:px-8 py-4 transition-colors duration-300 bg-gradient-to-b from-mocha-crust/85 via-mocha-crust/35 to-transparent ${
          isScrolled ? "bg-mocha-crust/70 backdrop-blur-sm" : ""
        }`}
      >
        <Link
          href={isHome ? "#about" : "/#about"}
          onClick={onBrandClick}
          className="pointer-events-auto group flex items-center gap-2 text-mocha-text/85 hover:text-mocha-text transition-colors"
        >
          <span className="text-mocha-mauve">[</span>
          <Logo
            isAnimating={false}
            className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110"
          />
          <span className="font-bold tracking-widest">qb</span>
          <span className="hidden sm:inline text-mocha-overlay1 group-hover:text-mocha-subtext transition-colors">
            @~/portfolio
          </span>
          <span className="text-mocha-mauve">]</span>
        </Link>

        <nav className="pointer-events-auto flex items-center gap-4 sm:gap-8">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative py-1 whitespace-nowrap transition-colors duration-200 ${
                  isActive
                    ? "text-mocha-text"
                    : "text-mocha-overlay1 hover:text-mocha-text"
                }`}
              >
                {item.label}
                <span
                  className={`absolute left-0 -bottom-0.5 h-px w-full bg-mocha-mauve transition-transform duration-300 origin-left ${
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
          ref={statusRef}
          className="relative hidden md:block"
          onMouseEnter={() => setShowStatus(true)}
          onMouseLeave={() => setShowStatus(false)}
        >
          <button
            type="button"
            aria-expanded={showStatus}
            aria-controls={statusId}
            onClick={() => setShowStatus((v) => !v)}
            className="pointer-events-auto flex cursor-pointer items-center gap-2.5 text-mocha-overlay1 transition-colors hover:text-mocha-text"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="status-dot relative inline-flex h-1.5 w-1.5 rounded-full bg-mocha-teal" />
            </span>
            <span className="tracking-widest lowercase">online</span>
            <span className="tabular-nums tracking-[0.14em] text-mocha-overlay0">
              {clock ?? "--:--:--"}
            </span>
          </button>

          {/* Kept mounted but hidden so the button's aria-controls always
              resolves to an element in the document. */}
          <div
            hidden={!showStatus}
            className="pointer-events-auto absolute right-0 top-full w-64 pt-3"
          >
            <div
              id={statusId}
              className="origin-top-right overflow-hidden rounded-xl border border-mocha-surface bg-mocha-base shadow-[0_16px_50px_rgba(0,0,0,0.7)]"
            >
              <div className="flex items-center gap-2 border-b-2 border-mocha-mauve bg-mocha-mantle px-4 py-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-mocha-green" />
                <span className="font-mono text-[11px] font-semibold normal-case tracking-wide text-mocha-text">
                  Available for work
                </span>
              </div>
              <div className="space-y-1.5 px-4 py-3.5 font-mono text-[11px] normal-case tracking-normal text-mocha-subtext">
                <p className="text-mocha-overlay0">$ status --check</p>
                <p>
                  <span className="text-mocha-teal">●</span> site online
                </p>
                <p>
                  <span className="text-mocha-green">●</span> accepting work
                </p>
                <p>
                  <span className="text-mocha-mauve">●</span> built in Baton
                  Rouge, LA
                </p>
                <p className="text-mocha-overlay1">
                  ● powered by caffeine and CSS
                  <span className="terminal-caret ml-1 inline-block">▌</span>
                </p>
              </div>

              <div className="flex flex-col gap-1.5 border-t border-mocha-surface px-4 py-3 font-mono text-[11px] normal-case tracking-normal">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      link.href.startsWith("http")
                        ? "noreferrer noopener"
                        : undefined
                    }
                    className="group/link flex items-center gap-2 text-mocha-overlay1 transition-colors hover:text-mocha-mauve"
                  >
                    <span
                      aria-hidden
                      className="text-mocha-overlay0 transition-transform duration-300 group-hover/link:translate-x-0.5"
                    >
                      ↳
                    </span>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
