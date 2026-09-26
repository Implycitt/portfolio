"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import Snap from "lenis/snap";
import {
  layoutTop,
  NATIVE_SCROLL_QUERY,
  registerScroller,
  sectionTop,
} from "@/lib/scroller";
import "lenis/dist/lenis.css";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [nativeScroll, setNativeScroll] = useState(true);
  const lenisRef = useRef<Lenis | null>(null);
  const snapRef = useRef<Snap | null>(null);
  const snapTargetsRef = useRef<HTMLElement[]>([]);
  const removeSnapTargetsRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    const mobile = window.matchMedia(NATIVE_SCROLL_QUERY);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateScrollMode = () =>
      setNativeScroll(mobile.matches || reducedMotion.matches);

    updateScrollMode();
    mobile.addEventListener("change", updateScrollMode);
    reducedMotion.addEventListener("change", updateScrollMode);

    return () => {
      mobile.removeEventListener("change", updateScrollMode);
      reducedMotion.removeEventListener("change", updateScrollMode);
    };
  }, []);

  useEffect(() => {
    if (nativeScroll) return;

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
      snapRef.current?.destroy();
      snapRef.current = null;
      removeSnapTargetsRef.current.forEach((remove) => remove());
      removeSnapTargetsRef.current = [];
      snapTargetsRef.current = [];
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [nativeScroll]);

  useEffect(() => {
    const lenis = lenisRef.current;
    const started = performance.now();
    let attempts = 0;
    let poll = 0;
    let ticks = 0;
    let settledHash = false;
    let settledSnap = nativeScroll || !lenis;

    const stop = () => {
      if (poll) window.clearInterval(poll);
      poll = 0;
    };

    const scrollToHash = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return false;

      const anchor = document.getElementById(hash);
      if (!anchor) return false;

      const top = sectionTop(anchor);
      if (Math.abs(window.scrollY - top) <= 8) return true;
      if (attempts >= 4) return true;

      attempts += 1;
      if (lenis) lenis.scrollTo(top, { immediate: true });
      else document.documentElement.scrollTop = top;
      return false;
    };

    const registerSnap = () => {
      if (!lenis) return false;

      snapRef.current?.destroy();
      snapRef.current = null;
      removeSnapTargetsRef.current.forEach((remove) => remove());
      removeSnapTargetsRef.current = [];

      const targets = Array.from(
        document.querySelectorAll<HTMLElement>("[data-lenis-snap]"),
      );
      snapTargetsRef.current = targets;
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

    const syncSnapWindow = () => {
      const snap = snapRef.current;
      const last = snapTargetsRef.current.at(-1);
      if (!snap || !last) return;

      const past = window.scrollY > layoutTop(last);
      if (past === snap.isStopped) return;

      if (past) snap.stop();
      else snap.start();
    };

    const settle = () => {
      ticks += 1;

      if (!settledHash) {
        if (!window.location.hash) {
          if (ticks === 1) {
            if (lenis) lenis.scrollTo(0, { immediate: true });
            else document.documentElement.scrollTop = 0;
          }
          if (performance.now() - started > 600) settledHash = true;
        } else if (scrollToHash()) {
          settledHash = true;
        }
      }

      if (!settledSnap && registerSnap()) settledSnap = true;
      syncSnapWindow();

      if ((settledHash && settledSnap) || ticks > 40) stop();
    };

    window.addEventListener("scroll", syncSnapWindow, { passive: true });
    window.addEventListener("resize", syncSnapWindow);
    poll = window.setInterval(settle, 120);
    settle();

    return () => {
      stop();
      window.removeEventListener("scroll", syncSnapWindow);
      window.removeEventListener("resize", syncSnapWindow);
    };
  }, [pathname, nativeScroll]);

  return <>{children}</>;
}
