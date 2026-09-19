"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { registerParallax } from "@/lib/field";
import { prefersReducedMotion } from "@/lib/reveal-observer";

export default function ScrollShift({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    return registerParallax(el, [
      { property: "--flow", factor: 0, progress: true },
    ]);
  }, []);

  return (
    <div ref={ref} className={`flow-shift ${className}`}>
      {children}
    </div>
  );
}
