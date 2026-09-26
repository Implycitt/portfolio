"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import {
  PRESETS,
  blobGradient,
  discGradient,
  hueColor,
  hueTint,
  motionClass,
  particles,
  rings,
  ripples,
  shooting,
  type Backdrop,
  type BackdropSpec,
  type BlobLayer,
  type DressingLayer,
  type GroupLayer,
  type LayerSpec,
  type ParticlesLayer,
  type RingSystem,
  type RingsLayer,
  type RipplesLayer,
  type ShootingLayer,
  type SweepLayer,
  type WashLayer,
} from "@/lib/backdrop";
import { observeVisibility, registerParallax } from "@/lib/field";
import { subscribePointer } from "@/lib/pointer";
import { prefersReducedMotion } from "@/lib/reveal-observer";

const SIDES = { left: "left-0", right: "right-0" };

const DEFAULT_POINTER: [number, number] = [24, 18];

function frameVars(pointer?: [number, number], drift?: number): CSSProperties {
  const [x, y] = pointer ?? DEFAULT_POINTER;
  return {
    "--frame-pointer-x": `${x}px`,
    "--frame-pointer-y": `${y}px`,
    "--frame-drift": `${drift ?? 0}px`,
  } as CSSProperties;
}

function Group({ layer }: { layer: GroupLayer }) {
  return (
    <div
      className="field-frame absolute inset-0"
      style={frameVars(layer.pointer, layer.drift)}
    >
      {layer.layers.map((child, index) => (
        <Layer key={index} layer={child} />
      ))}
    </div>
  );
}

function Wash({ layer }: { layer: WashLayer }) {
  return <div className={`field-wash absolute inset-0 ${layer.className}`} />;
}

function Dressing({ layer }: { layer: DressingLayer }) {
  if (!layer.sides) return <span className={`absolute ${layer.className}`} />;
  return (
    <>
      {layer.sides.map((side) => (
        <span
          key={side}
          className={`absolute ${SIDES[side]} ${layer.className}`}
        />
      ))}
    </>
  );
}

function Blob({ layer }: { layer: BlobLayer }) {
  return (
    <span
      className={`aurora-shift absolute ${layer.className}`}
      style={{ "--blob-depth": `${layer.depth ?? 34}px` } as CSSProperties}
    >
      <span
        className="aurora block h-full w-full rounded-full blur-[130px]"
        style={{ backgroundImage: blobGradient(layer.hues, layer.alpha ?? 20) }}
      />
    </span>
  );
}

function Particles({ layer }: { layer: ParticlesLayer }) {
  return (
    <>
      {particles(layer).map((dot, index) => (
        <span
          key={index}
          className={`${motionClass(layer.motion)} absolute rounded-full ${layer.className ?? ""}`}
          style={{
            left: `${dot.left}%`,
            top: `${dot.top}%`,
            width: dot.size,
            height: dot.size,
            backgroundColor: hueTint(dot.hue, layer.alpha ?? 60),
            animationDuration: dot.duration,
            animationDelay: dot.delay,
          }}
        />
      ))}
    </>
  );
}

function RingSystemView({ system }: { system: RingSystem }) {
  const layout = rings(system);
  const outer = layout[layout.length - 1];
  const accent = hueColor(layout[0].hue);

  return (
    <div
      className={`absolute ${system.anchor ?? ""}`}
      style={{
        ...(system.center
          ? { left: `${system.center[0]}%`, top: `${system.center[1]}%` }
          : null),
        transform: `rotate(calc(${system.tilt ?? 0}deg - var(--field-turn, 0) * ${system.precession ?? 0}deg))`,
      }}
    >
      {system.disc ? (
        <span
          className="absolute rounded-[50%]"
          style={{
            width: outer.width * 0.85,
            height: outer.height * 0.85,
            left: (-outer.width * 0.85) / 2,
            top: (-outer.height * 0.85) / 2,
            backgroundImage: discGradient(outer.hue, layout[0].hue),
          }}
        />
      ) : null}

      {layout.map((ring) => (
        <div
          key={ring.width}
          className="orbit-ring absolute rounded-[50%] border"
          style={{
            width: ring.width,
            height: ring.height,
            left: -ring.width / 2,
            top: -ring.height / 2,
            borderColor: hueTint(ring.hue, ring.alpha),
            color: hueColor(ring.hue),
          }}
        >
          <div
            className="orbit-arm absolute inset-0"
            style={{
              animationDuration: `${ring.duration}s`,
              animationDirection: ring.reverse ? "reverse" : "normal",
            }}
          >
            <span
              className="orbit-dot absolute top-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ backgroundColor: accent }}
            />
          </div>
        </div>
      ))}

      <span
        className="absolute top-0 left-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[3px]"
        style={{ backgroundColor: hueTint(layout[0].hue, 60) }}
      />
    </div>
  );
}

function Rings({ layer }: { layer: RingsLayer }) {
  return (
    <>
      {layer.systems.map((system, index) => (
        <RingSystemView key={index} system={system} />
      ))}
    </>
  );
}

function Ripples({ layer }: { layer: RipplesLayer }) {
  const duration = layer.duration ?? 9;
  return (
    <div
      className="absolute"
      style={{ left: `${layer.center[0]}%`, top: `${layer.center[1]}%` }}
    >
      {ripples(layer).map((ripple) => (
        <span
          key={ripple.size}
          className="field-ripple absolute rounded-full border"
          style={{
            width: ripple.size,
            height: ripple.size,
            left: -ripple.size / 2,
            top: -ripple.size / 2,
            borderColor: hueTint(layer.hue, 30),
            animationDuration: `${duration}s`,
            animationDelay: `${ripple.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function Sweep({ layer }: { layer: SweepLayer }) {
  return (
    <span
      className={`field-sweep absolute ${layer.className ?? "top-1/2 left-[-30%] h-52 w-[160%]"}`}
      style={{ animationDuration: `${layer.duration ?? 28}s` }}
    />
  );
}

function Shooters({ layer }: { layer: ShootingLayer }) {
  return (
    <>
      {shooting(layer).map((star, index) => (
        <span
          key={index}
          className="field-shoot absolute"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </>
  );
}

function Layer({ layer }: { layer: LayerSpec }) {
  switch (layer.kind) {
    case "wash":
      return <Wash layer={layer} />;
    case "dressing":
      return <Dressing layer={layer} />;
    case "blob":
      return <Blob layer={layer} />;
    case "particles":
      return <Particles layer={layer} />;
    case "rings":
      return <Rings layer={layer} />;
    case "group":
      return <Group layer={layer} />;
    case "ripples":
      return <Ripples layer={layer} />;
    case "sweep":
      return <Sweep layer={layer} />;
    case "shooting":
      return <Shooters layer={layer} />;
  }
}

export default function SectionField({ backdrop }: { backdrop: Backdrop }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observeVisibility(el, (visible) => {
      el.dataset.paused = visible ? "false" : "true";
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (
      !el ||
      prefersReducedMotion() ||
      window.matchMedia("(max-width: 767px), (pointer: coarse)").matches
    ) {
      return;
    }
    return registerParallax(el, [
      { property: "--field-back", factor: 0.012 },
      { property: "--field-front", factor: 0.042 },
      { property: "--field-turn", factor: 0, progress: true },
      { property: "--field-read", factor: 0, read: true },
    ]);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (
      !el ||
      prefersReducedMotion() ||
      window.matchMedia("(max-width: 767px), (pointer: coarse)").matches
    ) {
      return;
    }

    let frame = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      frame = 0;
      el.style.setProperty("--field-x", x.toFixed(3));
      el.style.setProperty("--field-y", y.toFixed(3));
    };

    const unsubscribe = subscribePointer((nextX, nextY) => {
      x = nextX;
      y = nextY;
      if (!frame) frame = requestAnimationFrame(apply);
    });

    return () => {
      unsubscribe();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const spec: BackdropSpec =
    typeof backdrop === "string" ? PRESETS[backdrop] : backdrop;
  const {
    layers,
    mask = true,
    fixed = false,
    scope = false,
    root = "",
    pointer,
    drift,
  } = spec;

  return (
    <div
      ref={ref}
      aria-hidden
      data-paused="false"
      {...(scope
        ? { "data-backdrop-scope": "", "data-backdrop-fixed": "" }
        : null)}
      className={`pointer-events-none ${fixed ? "fixed" : "absolute"} inset-0 overflow-hidden ${
        mask ? "section-field" : ""
      } ${root}`}
    >
      {layers
        .filter((layer) => layer.kind === "wash")
        .map((layer, index) => (
          <Layer key={`wash-${index}`} layer={layer} />
        ))}

      <div
        className="field-art absolute inset-0"
        style={frameVars(pointer, drift)}
      >
        {layers
          .filter((layer) => layer.kind !== "wash")
          .map((layer, index) => (
            <Layer key={index} layer={layer} />
          ))}
      </div>
    </div>
  );
}
