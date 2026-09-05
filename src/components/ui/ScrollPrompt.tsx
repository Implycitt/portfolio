"use client";

import { useEffect, useState } from "react";

export default function ScrollPrompt() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-10 left-1/2 z-40 -translate-x-1/2 transition-opacity duration-500"
      style={{ opacity: hidden ? 0 : 1 }}
    >
      <div className="flex flex-col items-center gap-2 font-mono">
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/45">
          scroll
        </span>
        <span className="animate-bounce text-sm text-cyan/80">▾</span>
      </div>
    </div>
  );
}