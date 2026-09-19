"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

export default function Spotlight({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const track = (event: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const radius = Math.min(
      420,
      Math.max(90, Math.min(rect.width, rect.height) * 0.8),
    );
    el.style.setProperty("--spot-r", `${Math.round(radius)}px`);
    el.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={track}
      onPointerEnter={track}
      className={`spotlight ${className}`}
    >
      {children}
    </div>
  );
}
