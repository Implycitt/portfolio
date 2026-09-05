"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import Snap from "lenis/snap";
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

    return () => {
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

    lenis.scrollTo(0, { immediate: true });

    removeSnapTargetsRef.current.forEach((remove) => remove());
    removeSnapTargetsRef.current = [];
    snapRef.current?.destroy();
    snapRef.current = null;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-lenis-snap]"),
    );
    if (targets.length === 0) return;

    const snap = new Snap(lenis, {
      type: "proximity",
      duration: 1.7,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    });
    snapRef.current = snap;
    removeSnapTargetsRef.current = targets.map((el) =>
      snap.addElement(el, { align: "start", ignoreTransform: true }),
    );
  }, [pathname]);

  return <>{children}</>;
}
