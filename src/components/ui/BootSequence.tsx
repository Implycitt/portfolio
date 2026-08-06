"use client";

import { useEffect, useRef, useState } from "react";

const CMD = "./enter --content";
const SECTIONS = ["ABOUT.md", "INTERESTS.md", "SOCIALS.md"];
const LINES = [
  "> mounting ascii://blackhole.scene ... ok",
  "> loading ui/header ............ ok",
  "> resolving sections ........... 3 found",
  "> system ready.",
];

export default function BootSequence() {
  const outerRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const el = outerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const room = Math.max(1, rect.height - vh);
      setP(Math.min(1, Math.max(0, (vh - rect.top) / room)));
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const s = (a: number, b: number, x = p) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };

  const cmdPop = s(0.0, 0.1);
  const typedFrac = s(0.08, 0.38);
  const typed = CMD.slice(0, Math.floor(typedFrac * CMD.length));
  const linesVisible = Math.floor(s(0.3, 0.55) * LINES.length);
  const wipe = s(0.55, 0.74);
  const listing = s(0.76, 0.9);
  const hint = s(0.9, 0.98);

  return (
    <div ref={outerRef} className="relative h-[240vh]" aria-hidden="true">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6">
        <div
          className="w-full max-w-2xl font-mono text-sm sm:text-base"
          style={{
            opacity: cmdPop * (1 - wipe),
            transform: `scale(${0.92 + 0.08 * cmdPop}) translateY(${(1 - cmdPop) * 18}px)`,
          }}
        >
          <div className="rounded-lg border border-white/10 bg-black/60 backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 text-[11px] tracking-wider text-white/50">
              <span className="truncate">~/enter.sh — bash — tty1</span>
              <span className="terminal-caret ml-auto inline-block h-3 w-1.5 bg-cyan" />
            </div>
            <div className="space-y-2 px-5 py-4">
              <p className="text-white/90">
                <span className="text-cyan">$</span> <span className="text-white">{typed}</span>
                <span className="terminal-caret ml-1 inline-block h-3.5 w-2 bg-cyan" />
              </p>
              {LINES.slice(0, linesVisible).map((line) => (
                <p key={line} className="text-white/55">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div
          className="relative z-30 w-full max-w-2xl font-mono text-sm sm:text-base"
          style={{ opacity: listing }}
        >
          <p className="text-white/90">
            <span className="text-cyan">$</span> <span className="text-white">ls ./SECTIONS</span>
          </p>
          <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-white/80">
            {SECTIONS.map((f) => (
              <span key={f} className="text-mauve">
                {f}
              </span>
            ))}
          </p>
          <p className="mt-6 text-white/50">
            <span className="text-cyan">$</span>{" "}
            <span className="terminal-caret inline-block h-3.5 w-2 bg-cyan" />
          </p>
        </div>

        <div
          className="pointer-events-none absolute inset-0 z-20"
          style={{ clipPath: `inset(0 0 ${(1 - wipe) * 100}% 0)` }}
        >
          <div className="absolute inset-0 bg-background" />
          <div
            className="absolute inset-x-0 h-px bg-cyan shadow-[0_0_24px_2px_rgba(46,223,229,0.9)]"
            style={{ bottom: `${(1 - wipe) * 100}%` }}
          />
          <div className="scan-line absolute inset-x-0 h-16" />
        </div>

        <p
          className="absolute bottom-10 z-30 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40"
          style={{ opacity: hint }}
        >
          scroll to enter <span className="inline-block animate-bounce">▾</span>
        </p>
      </div>
    </div>
  );
}
