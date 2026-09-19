"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { observeReveal, prefersReducedMotion } from "@/lib/reveal-observer";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "fade" | "pop";
}

export default function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "fade",
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setVisible(true);
      return;
    }
    return observeReveal(el, () => setVisible(true));
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${variant === "pop" ? "reveal-pop" : ""} ${
        visible ? "reveal-visible" : ""
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
