"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { prefersReducedMotion } from "@/lib/reveal-observer";

const MOTES = [
  [4, 46, 2, 0, 23, "#e8c77a"],
  [7, 60, 3, 5, 28, "#e8b8ca"],
  [10, 33, 2, 11, 25, "#8fcbbd"],
  [74, 40, 2, 3, 31, "#e8c77a"],
  [82, 54, 3, 8, 27, "#e8b8ca"],
  [88, 30, 2, 1, 22, "#8fcbbd"],
  [94, 47, 2, 14, 30, "#e8c77a"],
  [73, 63, 2, 6, 26, "#e8b8ca"],
] as const;

const STARS = [
  [4, 18, 2, 0.4, 4.8],
  [11, 32, 3, 2.1, 6.2],
  [19, 12, 2, 1.2, 5.4],
  [26, 42, 2, 3.2, 7.1],
  [33, 9, 3, 0.8, 5.9],
  [41, 27, 2, 2.6, 6.6],
  [47, 16, 2, 4.1, 7.4],
  [54, 37, 3, 1.6, 5.2],
  [61, 10, 2, 3.6, 6.8],
  [68, 24, 2, 0.2, 5.6],
  [75, 14, 3, 2.9, 7.7],
  [82, 33, 2, 1.9, 6.1],
  [88, 20, 2, 4.4, 5.3],
  [92, 41, 3, 0.9, 6.9],
  [8, 54, 2, 3.9, 7.2],
  [22, 60, 2, 1.4, 5.7],
  [44, 52, 2, 2.3, 6.4],
  [58, 58, 3, 4.7, 7.9],
  [72, 49, 2, 0.6, 5.1],
  [86, 56, 2, 3.1, 6.3],
  [96, 12, 2, 2.0, 5.8],
  [15, 8, 2, 3.4, 6.7],
] as const;

export default function DreamScene() {
  const sceneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (prefersReducedMotion()) return;

    let frame = 0;
    let nextX = 0;
    let nextY = 0;

    const apply = () => {
      frame = 0;
      scene.style.setProperty("--scene-x", nextX.toFixed(3));
      scene.style.setProperty("--scene-y", nextY.toFixed(3));
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      nextX = (event.clientX / window.innerWidth) * 2 - 1;
      nextY = (event.clientY / window.innerHeight) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const reset = () => {
      nextX = 0;
      nextY = 0;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", reset);
      window.removeEventListener("blur", reset);
      if (frame) cancelAnimationFrame(frame);
      scene.style.removeProperty("--scene-x");
      scene.style.removeProperty("--scene-y");
    };
  }, []);

  return (
    <div ref={sceneRef} className="dream-scene" aria-hidden>
      <div className="dream-sky" />
      <div className="dream-glow" />

      <div className="dream-stars">
        {STARS.map(([left, top, size, delay, duration], index) => (
          <span
            key={index}
            className="dream-star"
            style={
              {
                left: `${left}%`,
                top: `${top}%`,
                "--star-size": `${size}px`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="dream-moon">
        <svg
          viewBox="0 0 32 32"
          shapeRendering="crispEdges"
          role="presentation"
          focusable="false"
        >
          <g fill="#f4e6bd">
            <rect x="13" y="4" width="6" height="1" />
            <rect x="11" y="5" width="10" height="1" />
            <rect x="9" y="6" width="14" height="1" />
            <rect x="8" y="7" width="16" height="1" />
            <rect x="7" y="8" width="18" height="1" />
            <rect x="6" y="9" width="20" height="1" />
            <rect x="5" y="10" width="22" height="1" />
            <rect x="5" y="11" width="22" height="10" />
            <rect x="6" y="21" width="20" height="1" />
            <rect x="7" y="22" width="18" height="1" />
            <rect x="8" y="23" width="16" height="1" />
            <rect x="10" y="24" width="12" height="1" />
            <rect x="12" y="25" width="8" height="1" />
            <rect x="14" y="26" width="4" height="1" />
          </g>
          <g fill="#d9c797">
            <rect x="18" y="10" width="9" height="1" />
            <rect x="19" y="11" width="8" height="10" />
            <rect x="17" y="21" width="9" height="1" />
            <rect x="16" y="22" width="8" height="1" />
            <rect x="15" y="23" width="7" height="1" />
            <rect x="14" y="24" width="7" height="1" />
            <rect x="13" y="25" width="6" height="1" />
            <rect x="22" y="7" width="2" height="1" />
          </g>
          <g fill="#b9a67b">
            <rect x="8" y="13" width="4" height="2" />
            <rect x="14" y="17" width="3" height="3" />
            <rect x="9" y="19" width="2" height="2" />
            <rect x="16" y="9" width="2" height="1" />
            <rect x="12" y="14" width="2" height="1" />
            <rect x="20" y="14" width="3" height="1" />
          </g>
          <g fill="#fbf3d4">
            <rect x="8" y="9" width="2" height="1" />
            <rect x="6" y="12" width="2" height="2" />
            <rect x="9" y="16" width="2" height="2" />
            <rect x="5" y="18" width="2" height="1" />
          </g>
        </svg>
      </div>

      <div className="dream-sat-layer">
        <span className="dream-sat" />
      </div>

      <div className="dream-cloud-layer dream-cloud-layer--far">
        <div className="dream-cloud dream-cloud--far" />
      </div>
      <div className="dream-cloud-layer dream-cloud-layer--near">
        <div className="dream-cloud dream-cloud--near" />
      </div>
      <div className="dream-orbit" />
      <div className="dream-shoot" />

      <div className="dream-motes">
        {MOTES.map(([left, top, size, delay, duration, color], index) => (
          <span
            key={index}
            className="dream-mote-layer"
            style={{ left: `${left}%`, top: `${top}%` } as CSSProperties}
          >
            <span
              className="dream-mote"
              style={
                {
                  "--mote-size": `${size}px`,
                  "--mote-color": color,
                  "--mote-delay": `${delay}s`,
                  "--mote-duration": `${duration}s`,
                } as CSSProperties
              }
            />
          </span>
        ))}
      </div>

      <div className="dream-hills">
        <svg viewBox="0 0 480 140" preserveAspectRatio="none" aria-hidden>
          <path
            d="M0 140V104h20V96h24V86h20V78h20v8h20v12h20v8h24v-10h20V84h20V72h22v8h22v14h20v8h24v-10h22V82h20v10h22v12h20v-8h20V86h22v8h24v10h22v-8h16v12h20V140Z"
            fill="#3a3568"
          />
          <path
            d="M0 140V118h24v-6h24v-8h24v8h24v8h24v-8h24V96h22v8h24v12h24v8h24v-8h24v-10h22v10h24v12h24v-8h24v-10h24v8h24v8h16v14Z"
            fill="#242142"
          />
          <path
            d="M0 140V124h48v-4h48v4h48v4h48v-4h48v-4h48v4h48v4h48v-4h48v4h48v8Z"
            fill="#191733"
          />
        </svg>
      </div>

      <div className="dream-dither" />
      <div className="dream-vignette" />
    </div>
  );
}
