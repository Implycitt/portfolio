"use client";

import { useEffect, useRef, useState } from "react";

const SECTION_NAMES = [
  { id: "about", label: "About" },
  { id: "featured", label: "Selected work" },
  { id: "misc", label: "Interests" },
  { id: "socials", label: "Socials" },
];

interface Flash {
  label: string;
  index: number;
}

export default function SectionLoader() {
  const [flash, setFlash] = useState<Flash | null>(null);
  const currentRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const sections = SECTION_NAMES.map((s) =>
      document.getElementById(s.id),
    ).filter((el): el is HTMLElement => el !== null);

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
        setFlash({ label: info.label, index: SECTION_NAMES.indexOf(info) });
        timerRef.current = window.setTimeout(() => setFlash(null), 1600);
      },
      { threshold: [0.2, 0.45, 0.7] },
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
      <div className="flex items-center gap-3 rounded-xl border border-mocha-surface bg-mocha-base/95 px-4 py-2.5 font-mono text-[11px] shadow-[0_14px_40px_rgba(0,0,0,0.6)] backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-mocha-mauve" />
        <span className="tracking-widest uppercase text-mocha-text">
          {flash.label}
        </span>
        <span className="tabular-nums text-mocha-overlay0">
          {flash.index + 1}/{SECTION_NAMES.length}
        </span>
        <span className="flex gap-1">
          {SECTION_NAMES.map((s, i) => (
            <span
              key={s.id}
              className={`h-1 w-5 rounded-full ${
                i <= flash.index ? "bg-mocha-mauve" : "bg-mocha-surface"
              }`}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
