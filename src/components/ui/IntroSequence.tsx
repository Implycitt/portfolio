"use client";

import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import Logo from "@/components/ui/Logo";

const FADE_AT = 2600;
const REMOVE_AT = 3400;

export default function IntroSequence() {
  const [isActive, setIsActive] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [isFirstVisit] = useState(true);

  useLayoutEffect(() => {
    const hasPlayed = sessionStorage.getItem("introPlayed");

    if (hasPlayed) return;

    sessionStorage.setItem("introPlayed", "true");
    setIsActive(true);

    const fadeTimer = setTimeout(() => setIsFading(true), FADE_AT);
    const removeTimer = setTimeout(() => setIsActive(false), REMOVE_AT);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isActive) return null;

  const overlay = (
    <div
      aria-hidden
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-background transition-[opacity,transform] duration-[900ms]"
      style={{
        transform: isFading ? "translateY(100%)" : "translateY(0%)",
        opacity: isFading ? 0 : 1,
      }}
    >
      <Logo className="h-32 w-32 md:h-40 md:w-40" isAnimating={isFirstVisit} />
      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
        initializing…
      </p>
    </div>
  );

  return createPortal(overlay, document.body);
}
