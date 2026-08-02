"use client";

import { useEffect, useRef, useState } from "react";

const SECTION_NAMES = [
  { id: "about", file: "about.md" },
  { id: "misc", file: "interests.md" },
  { id: "socials", file: "socials.md" },
];

interface Flash {
  file: string;
  index: number;
}

export default function SectionLoader() {
  const [flash, setFlash] = useState<Flash | null>(null);
  const currentRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const sections = SECTION_NAMES.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );

    const observer = new IntersectionObserver(
      (entries) => {
        let best: { id: string; ratio: number } | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { id: entry.target.id, ratio: entry.intersectionRatio };
          }
        }
        if (!best || currentRef.current === best.id) return;

        currentRef.current = best.id;
        const info = SECTION_NAMES.find((s) => s.id === best.id);
        if (!info) return;

        if (timerRef.current) window.clearTimeout(timerRef.current);
        setFlash({ file: info.file, index: SECTION_NAMES.indexOf(info) });
        timerRef.current = window.setTimeout(() => setFlash(null), 1200);
      },
      { threshold: [0.2, 0.45, 0.7] }
    );

    sections.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  if (!flash) return null;

  return (
    <div
      key={flash.index}
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-40 -translate-x-1/2 select-none"
    >
      <div className="rounded-md border border-cyan/30 bg-black/85 px-4 py-2.5 font-mono text-[11px] tracking-wider text-white/80 shadow-[0_0_30px_-8px_rgba(46,223,229,0.5)] backdrop-blur-sm">
        <p className="flex items-center gap-2">
          <span className="text-cyan">$</span>
          <span className="text-white/60">ls ./sections</span>
          <span className="text-mauve">
            ▸ loading {flash.index + 1}/{SECTION_NAMES.length} {flash.file}
          </span>
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1 w-24 overflow-hidden rounded-full bg-white/10">
            <div className="terminal-loader-bar h-full rounded-full bg-gradient-to-r from-cyan via-violet to-mauve" />
          </div>
          <span className="text-cyan">[ ok ]</span>
        </div>
      </div>
    </div>
  );
}
