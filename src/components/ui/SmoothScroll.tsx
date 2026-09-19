"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import Snap from "lenis/snap";
import { registerScroller } from "@/lib/scroller";
import "lenis/dist/lenis.css";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const snapRef = useRef<Snap | null>(null);
  const removeSnapTargetsRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.6,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      anchors: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    });
    lenisRef.current = lenis;
    const unregister = registerScroller({
      scrollTo: (target, options) => lenis.scrollTo(target, options),
    });

    return () => {
      unregister();
      removeSnapTargetsRef.current.forEach((remove) => remove());
      removeSnapTargetsRef.current = [];
      snapRef.current?.destroy();
      snapRef.current = null;
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    const started = performance.now();
    let attempts = 0;

    const layoutTop = (el: HTMLElement) => {
      let top = 0;
      let node: HTMLElement | null = el;
      while (node) {
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      return top;
    };

    const scrollToHash = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return false;

      const anchor = document.getElementById(hash);
      if (!anchor) return false;

      const top = layoutTop(anchor);
      if (Math.abs(window.scrollY - top) <= 8) return true;
      if (attempts >= 4) return true;

      attempts += 1;
      lenis.scrollTo(top, { immediate: true });
      return false;
    };

    const registerSnap = () => {
      removeSnapTargetsRef.current.forEach((remove) => remove());
      removeSnapTargetsRef.current = [];
      snapRef.current?.destroy();
      snapRef.current = null;

      const targets = Array.from(
        document.querySelectorAll<HTMLElement>("[data-lenis-snap]"),
      );
      if (targets.length === 0) return false;

      const snap = new Snap(lenis, {
        type: "proximity",
        duration: 1.7,
        easing: (t) => 1 - Math.pow(1 - t, 4),
      });
      snapRef.current = snap;
      removeSnapTargetsRef.current = targets.map((el) =>
        snap.addElement(el, { align: "start", ignoreTransform: true }),
      );
      return true;
    };

    let poll = 0;
    let ticks = 0;
    let settledHash = false;
    let settledSnap = false;

    const stop = () => {
      if (poll) window.clearInterval(poll);
      poll = 0;
    };

    const settle = () => {
      ticks += 1;

      if (!settledHash) {
        if (!window.location.hash) {
          if (ticks === 1) lenis.scrollTo(0, { immediate: true });
          if (performance.now() - started > 600) settledHash = true;
        } else if (scrollToHash()) {
          settledHash = true;
        }
      }

      if (!settledSnap && registerSnap()) settledSnap = true;

      if ((settledHash && settledSnap) || ticks > 40) stop();
    };

    poll = window.setInterval(settle, 120);
    settle();

    return stop;
  }, [pathname]);

  return <>{children}</>;
}
