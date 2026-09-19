"use client";

type VisibilityCallback = (visible: boolean) => void;

const visibilityCallbacks = new WeakMap<Element, VisibilityCallback>();
let visibilityObserver: IntersectionObserver | null = null;

function getVisibilityObserver(): IntersectionObserver {
  if (visibilityObserver) return visibilityObserver;
  visibilityObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        visibilityCallbacks.get(entry.target)?.(entry.isIntersecting);
      }
    },
    { rootMargin: "160px 0px 160px 0px" },
  );
  return visibilityObserver;
}

export function observeVisibility(
  element: Element,
  callback: VisibilityCallback,
): () => void {
  const observer = getVisibilityObserver();
  visibilityCallbacks.set(element, callback);
  observer.observe(element);
  return () => {
    visibilityCallbacks.delete(element);
    observer.unobserve(element);
  };
}

export interface ParallaxLayer {
  property: string;
  factor: number;
  progress?: boolean;
  read?: boolean;
}

const parallaxLayers = new Map<HTMLElement, ParallaxLayer[]>();
let parallaxFrame = 0;
let listening = false;

function measure() {
  parallaxFrame = 0;
  const centre = window.innerHeight / 2;
  for (const [element, layers] of parallaxLayers) {
    const rect = element.getBoundingClientRect();
    const offset = centre - (rect.top + rect.height / 2);
    for (const layer of layers) {
      if (layer.progress) {
        const value = Math.max(
          -1.4,
          Math.min(1.4, offset / window.innerHeight),
        );
        element.style.setProperty(layer.property, value.toFixed(3));
        continue;
      }
      if (layer.read) {
        const scrollable =
          window.document.documentElement.scrollHeight - window.innerHeight;
        const value =
          scrollable > 0
            ? Math.min(1, Math.max(0, window.scrollY / scrollable))
            : 0;
        element.style.setProperty(layer.property, value.toFixed(4));
        continue;
      }
      const shift = Math.max(-80, Math.min(80, offset * layer.factor));
      element.style.setProperty(layer.property, `${shift.toFixed(1)}px`);
    }
  }
}

function schedule() {
  if (parallaxFrame) return;
  parallaxFrame = requestAnimationFrame(measure);
}

let resizeObserver: ResizeObserver | null = null;

function getResizeObserver(): ResizeObserver | null {
  if (typeof ResizeObserver === "undefined") return null;
  if (!resizeObserver) resizeObserver = new ResizeObserver(schedule);
  return resizeObserver;
}

export function registerParallax(
  element: HTMLElement,
  layers: ParallaxLayer[],
): () => void {
  if (!listening) {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    listening = true;
  }

  parallaxLayers.set(element, layers);
  const resizes = getResizeObserver();
  resizes?.observe(element);
  schedule();

  return () => {
    resizes?.unobserve(element);
    parallaxLayers.delete(element);
    for (const layer of layers) element.style.removeProperty(layer.property);
    if (parallaxLayers.size === 0) {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      listening = false;
      if (parallaxFrame) {
        cancelAnimationFrame(parallaxFrame);
        parallaxFrame = 0;
      }
    }
  };
}
