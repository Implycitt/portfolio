"use client";

import { prefersReducedMotion } from "@/lib/reveal-observer";

interface Scroller {
  scrollTo(
    target: number,
    options: { immediate?: boolean; duration?: number },
  ): void;
}

let scroller: Scroller | null = null;

export function registerScroller(next: Scroller): () => void {
  scroller = next;
  return () => {
    if (scroller === next) scroller = null;
  };
}

function scrollPadding(): number {
  const value = getComputedStyle(document.documentElement).scrollPaddingTop;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function layoutTop(el: HTMLElement): number {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

export function sectionTop(el: HTMLElement): number {
  return Math.max(0, layoutTop(el) - scrollPadding());
}

export function scrollToTarget(
  target: number | HTMLElement,
  duration = 1.1,
): void {
  const reduced = prefersReducedMotion();
  const resolve = () =>
    typeof target === "number" ? Math.max(0, target) : sectionTop(target);

  const apply = (immediate: boolean) => {
    const top = resolve();
    if (scroller) {
      scroller.scrollTo(top, immediate ? { immediate: true } : { duration });
      return;
    }
    window.scrollTo({
      top,
      behavior: immediate ? "auto" : "smooth",
    });
  };

  apply(reduced);
  if (reduced) return;

  let last = window.scrollY;
  let stable = 0;
  let attempts = 0;
  let frames = 0;
  let cancelled = false;

  const cancel = () => {
    cancelled = true;
  };

  const events: [string, EventListener][] = [
    ["wheel", cancel],
    ["touchstart", cancel],
    ["keydown", cancel],
  ];
  for (const [name, handler] of events) {
    window.addEventListener(name, handler, { passive: true });
  }

  const cleanup = () => {
    for (const [name, handler] of events) {
      window.removeEventListener(name, handler);
    }
  };

  const tick = () => {
    if (cancelled) {
      cleanup();
      return;
    }

    frames += 1;
    const y = window.scrollY;
    stable = Math.abs(y - last) <= 0.5 ? stable + 1 : 0;
    last = y;

    if (stable >= 2) {
      if (Math.abs(y - resolve()) > 6 && attempts < 2) {
        attempts += 1;
        stable = 0;
        apply(true);
        requestAnimationFrame(tick);
        return;
      }
      cleanup();
      return;
    }

    if (frames < 300) {
      requestAnimationFrame(tick);
    } else {
      cleanup();
    }
  };

  requestAnimationFrame(tick);
}
