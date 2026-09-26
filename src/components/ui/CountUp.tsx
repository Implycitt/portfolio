"use client";

import { useEffect, useRef } from "react";

export default function CountUp({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const target = Number(value.replace(/[^0-9]/g, ""));
    if (!Number.isFinite(target) || target <= 0) {
      el.textContent = value;
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = value;
      return;
    }

    const duration = 800;
    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-US");
      if (t < 1) frame = requestAnimationFrame(step);
    };

    el.textContent = "0";
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}
