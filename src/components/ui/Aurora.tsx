"use client";

import { useEffect, useRef } from "react";
import { subscribePointer } from "@/lib/pointer";
import { prefersReducedMotion } from "@/lib/reveal-observer";

export default function Aurora({
  className = "",
  colors = "from-mocha-mauve/20 via-mocha-lavender/10 to-mocha-sapphire/10",
  depth = 34,
}: {
  className?: string;
  colors?: string;
  depth?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;

    const apply = () => {
      frame = 0;
      el.style.setProperty("--aurora-x", `${(targetX * depth).toFixed(1)}px`);
      el.style.setProperty("--aurora-y", `${(targetY * depth).toFixed(1)}px`);
    };

    const unsubscribe = subscribePointer((x, y) => {
      targetX = x;
      targetY = y;
      if (!frame) frame = requestAnimationFrame(apply);
    });

    return () => {
      unsubscribe();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [depth]);

  return (
    <div aria-hidden className={`pointer-events-none absolute ${className}`}>
      <div ref={ref} className="aurora-shift h-full w-full">
        <div
          className={`aurora h-full w-full rounded-full bg-gradient-to-tr blur-[130px] ${colors}`}
        />
      </div>
    </div>
  );
}
