"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Aurora from "@/components/ui/Aurora";
import { observeVisibility, registerParallax } from "@/lib/field";
import { subscribePointer } from "@/lib/pointer";
import { prefersReducedMotion } from "@/lib/reveal-observer";

type Variant = "orbit" | "constellation" | "bloom" | "ripples" | "horizon";

interface AuroraSpec {
  className: string;
  colors: string;
  depth: number;
}

interface Ring {
  width: number;
  height: number;
  duration: number;
  reverse: boolean;
  delay: number;
  dot: string;
  stroke: string;
}

interface OrbitSystem {
  anchor: string;
  tilt: string;
  precession: number;
  core: string;
  halo: string;
  rings: Ring[];
}

const SCALE = "scale-[0.7] sm:scale-[0.85] lg:scale-100";

const ORBIT_SYSTEMS: OrbitSystem[] = [
  {
    anchor: `right-[-4rem] top-[2%] ${SCALE}`,
    tilt: "-18deg",
    precession: 7,
    core: "bg-mocha-lavender/60",
    halo: "from-mocha-mauve/18",
    rings: [
      {
        width: 420,
        height: 272,
        duration: 34,
        reverse: false,
        delay: 0,
        dot: "bg-mocha-lavender text-mocha-lavender",
        stroke: "border-mocha-lavender/45",
      },
      {
        width: 640,
        height: 408,
        duration: 54,
        reverse: true,
        delay: -18,
        dot: "bg-mocha-mauve text-mocha-mauve",
        stroke: "border-mocha-mauve/32",
      },
      {
        width: 900,
        height: 566,
        duration: 78,
        reverse: false,
        delay: -41,
        dot: "bg-mocha-pink text-mocha-pink",
        stroke: "border-mocha-pink/22",
      },
    ],
  },
  {
    anchor: `left-[-4rem] bottom-[2%] ${SCALE}`,
    tilt: "-26deg",
    precession: -6,
    core: "bg-mocha-teal/60",
    halo: "from-mocha-teal/16",
    rings: [
      {
        width: 380,
        height: 244,
        duration: 30,
        reverse: true,
        delay: -7,
        dot: "bg-mocha-teal text-mocha-teal",
        stroke: "border-mocha-teal/45",
      },
      {
        width: 580,
        height: 364,
        duration: 48,
        reverse: false,
        delay: -25,
        dot: "bg-mocha-sapphire text-mocha-sapphire",
        stroke: "border-mocha-sapphire/30",
      },
      {
        width: 820,
        height: 512,
        duration: 68,
        reverse: true,
        delay: -12,
        dot: "bg-mocha-lavender text-mocha-lavender",
        stroke: "border-mocha-lavender/20",
      },
    ],
  },
  {
    anchor: `right-[16%] bottom-[6%] ${SCALE}`,
    tilt: "-14deg",
    precession: 11,
    core: "bg-mocha-sapphire/55",
    halo: "from-mocha-sapphire/14",
    rings: [
      {
        width: 260,
        height: 166,
        duration: 26,
        reverse: false,
        delay: -4,
        dot: "bg-mocha-sapphire text-mocha-sapphire",
        stroke: "border-mocha-sapphire/40",
      },
      {
        width: 400,
        height: 254,
        duration: 42,
        reverse: true,
        delay: -16,
        dot: "bg-mocha-lavender text-mocha-lavender",
        stroke: "border-mocha-lavender/24",
      },
    ],
  },
];

const ORBIT_STARS: [number, number, number, number, number, number, string][] =
  [
    [6, 18, 2, 4.6, 13, 0.4, "bg-mocha-lavender/60"],
    [13, 62, 1.5, 5.8, 16, 1.6, "bg-mocha-sapphire/50"],
    [19, 34, 2.5, 4.2, 12, 2.8, "bg-mocha-text/55"],
    [26, 78, 1.5, 6.2, 15, 0.9, "bg-mocha-pink/50"],
    [34, 12, 2, 5.1, 14, 3.3, "bg-mocha-mauve/60"],
    [41, 55, 1.5, 4.4, 17, 1.2, "bg-mocha-lavender/50"],
    [49, 88, 2.5, 5.6, 13, 2.4, "bg-mocha-sapphire/60"],
    [56, 26, 1.5, 6.6, 16, 3.8, "bg-mocha-text/50"],
    [64, 68, 2, 4.8, 15, 0.6, "bg-mocha-pink/60"],
    [72, 40, 1.5, 5.4, 12, 2.1, "bg-mocha-lavender/55"],
    [79, 84, 2.5, 4.3, 14, 3.5, "bg-mocha-mauve/50"],
    [88, 30, 1.5, 6, 17, 1.4, "bg-mocha-sapphire/55"],
    [94, 63, 2, 5.2, 13, 2.7, "bg-mocha-text/55"],
    [10, 92, 1.5, 4.9, 15, 0.8, "bg-mocha-lavender/50"],
  ];

const ORBIT_DUST: [number, number, number, number, number][] = [
  [9, 26, 2, 11.2, 0.4],
  [18, 71, 1, 13.6, 2.1],
  [27, 46, 2, 10.4, 4.3],
  [36, 14, 1, 12.8, 1.2],
  [44, 88, 2, 14.2, 3.6],
  [57, 33, 1, 11.6, 5.1],
  [66, 62, 2, 13.1, 0.9],
  [78, 21, 1, 12.2, 2.8],
  [86, 79, 2, 10.9, 4.7],
  [93, 52, 1, 13.9, 1.7],
  [4, 58, 2, 12.4, 3.1],
  [23, 92, 1, 14.6, 5.4],
  [61, 16, 2, 11.4, 2.2],
  [71, 74, 1, 13.4, 0.2],
  [83, 44, 2, 12.1, 4.9],
  [96, 12, 1, 14.1, 1.9],
];

const STARS: [number, number, number, number, number, number, string][] = [
  [7, 22, 2, 4.2, 12, 0, "bg-mocha-lavender/70"],
  [14, 68, 1.5, 5.6, 15, 1.2, "bg-mocha-sapphire/60"],
  [21, 12, 2.5, 3.8, 11, 2.4, "bg-mocha-text/70"],
  [27, 84, 1.5, 6.4, 17, 0.6, "bg-mocha-pink/60"],
  [33, 40, 2, 4.8, 13, 3.1, "bg-mocha-mauve/70"],
  [39, 73, 1.5, 5.2, 16, 1.8, "bg-mocha-lavender/60"],
  [45, 18, 2.5, 4.4, 12, 2.9, "bg-mocha-sapphire/70"],
  [52, 56, 1.5, 6.8, 14, 0.9, "bg-mocha-text/60"],
  [58, 88, 2, 3.6, 18, 3.7, "bg-mocha-pink/70"],
  [63, 30, 1.5, 5.8, 12, 1.5, "bg-mocha-lavender/70"],
  [69, 64, 2.5, 4.6, 15, 2.2, "bg-mocha-mauve/60"],
  [75, 8, 1.5, 6.2, 11, 4.1, "bg-mocha-sapphire/70"],
  [81, 47, 2, 5.4, 16, 0.3, "bg-mocha-text/70"],
  [87, 76, 1.5, 4.9, 13, 2.6, "bg-mocha-pink/60"],
  [93, 26, 2.5, 5.9, 14, 3.4, "bg-mocha-lavender/60"],
  [11, 92, 1.5, 4.2, 17, 1.1, "bg-mocha-mauve/70"],
  [24, 52, 2, 6.6, 12, 4.4, "bg-mocha-sapphire/60"],
  [42, 96, 1.5, 5.1, 15, 2, "bg-mocha-text/60"],
  [56, 5, 2, 4.7, 11, 3.9, "bg-mocha-pink/70"],
  [72, 89, 1.5, 6, 18, 1.6, "bg-mocha-lavender/70"],
  [84, 58, 2.5, 4.3, 13, 0.7, "bg-mocha-mauve/60"],
  [96, 42, 1.5, 5.5, 16, 2.8, "bg-mocha-sapphire/70"],
];

const ORBS: { className: string; duration: number; delay: number }[] = [
  {
    className: "left-[4%] top-[10%] h-56 w-56 from-mocha-peach/20",
    duration: 17,
    delay: 0,
  },
  {
    className: "right-[6%] top-[18%] h-64 w-64 from-mocha-teal/18",
    duration: 21,
    delay: -5,
  },
  {
    className: "left-[12%] bottom-[8%] h-60 w-60 from-mocha-sapphire/18",
    duration: 19,
    delay: -9,
  },
  {
    className: "right-[10%] bottom-[12%] h-52 w-52 from-mocha-mauve/20",
    duration: 23,
    delay: -13,
  },
];

const SPARKS: [number, number, number, number, number, string][] = [
  [12, 44, 4, 5.2, 0, "bg-mocha-peach/80"],
  [23, 79, 3, 6.4, 1.1, "bg-mocha-teal/80"],
  [37, 24, 4, 5.8, 2.3, "bg-mocha-sapphire/80"],
  [48, 63, 3, 6.9, 0.7, "bg-mocha-green/80"],
  [61, 36, 4, 5.4, 3.2, "bg-mocha-mauve/80"],
  [73, 82, 3, 6.1, 1.9, "bg-mocha-red/70"],
  [84, 29, 4, 5.6, 2.7, "bg-mocha-peach/70"],
  [94, 58, 3, 6.6, 4.2, "bg-mocha-mauve/80"],
];

const SHOOTERS: [number, number, number, number][] = [
  [8, 16, 11, 0],
  [62, 34, 15, 4.6],
  [30, 6, 18, 8.9],
];

const RIPPLES: { size: number; duration: number; delay: number }[] = [
  { size: 300, duration: 9, delay: 0 },
  { size: 460, duration: 9, delay: 3 },
  { size: 640, duration: 9, delay: 6 },
];

const HORIZON_MOTES: [number, number, number, number, number][] = [
  [14, 58, 2, 12.4, 0.6],
  [33, 74, 1, 14.8, 2.4],
  [52, 49, 2, 11.7, 4.6],
  [71, 67, 1, 13.2, 1.4],
  [88, 56, 2, 12.9, 3.5],
];

const FIELD: Record<
  Variant,
  { wash: string; auroras: AuroraSpec[]; art: () => ReactNode }
> = {
  orbit: {
    wash: "bg-gradient-to-b from-mocha-lavender/12 via-mocha-mantle/30 to-mocha-sapphire/14",
    auroras: [
      {
        depth: 40,
        className: "-top-24 left-1/2 h-[420px] w-[720px] -translate-x-1/2",
        colors:
          "from-mocha-mauve/20 via-mocha-lavender/10 to-mocha-sapphire/10",
      },
      {
        depth: -30,
        className: "bottom-[-8rem] right-[-6rem] h-[360px] w-[520px]",
        colors: "from-mocha-teal/12 via-mocha-sapphire/10 to-transparent",
      },
      {
        depth: 22,
        className: "left-[-9rem] top-[36%] h-[340px] w-[460px]",
        colors: "from-mocha-lavender/12 via-mocha-mauve/10 to-transparent",
      },
    ],
    art: OrbitArt,
  },
  constellation: {
    wash: "bg-gradient-to-b from-mocha-pink/10 via-mocha-crust/32 to-mocha-mauve/12",
    auroras: [
      {
        depth: -24,
        className: "right-[-10rem] top-1/4 h-[380px] w-[560px]",
        colors: "from-mocha-pink/12 via-mocha-mauve/10 to-transparent",
      },
    ],
    art: ConstellationArt,
  },
  bloom: {
    wash: "bg-gradient-to-b from-mocha-sapphire/12 via-mocha-mantle/26 to-mocha-teal/12",
    auroras: [
      {
        depth: 36,
        className: "inset-x-0 top-1/2 mx-auto h-[400px] w-[720px]",
        colors: "from-mocha-sapphire/15 via-mocha-mauve/12 to-mocha-teal/10",
      },
    ],
    art: BloomArt,
  },
  ripples: {
    wash: "bg-gradient-to-b from-mocha-mauve/12 via-mocha-mantle/26 to-mocha-crust/45",
    auroras: [
      {
        depth: 28,
        className: "inset-x-0 top-1/3 mx-auto h-[380px] w-[680px]",
        colors: "from-mocha-lavender/15 via-mocha-mauve/12 to-transparent",
      },
    ],
    art: RipplesArt,
  },
  horizon: {
    wash: "bg-gradient-to-b from-mocha-crust/45 via-mocha-crust/70 to-mocha-mantle/45",
    auroras: [],
    art: HorizonArt,
  },
};

function OrbitArt() {
  return (
    <>
      {ORBIT_STARS.map(([left, top, size, twinkle, drift, delay, color]) => (
        <span
          key={`o-${left}-${top}`}
          className={`field-star absolute rounded-full ${color}`}
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: size,
            height: size,
            animationDuration: `${twinkle}s, ${drift}s`,
            animationDelay: `${delay}s, ${delay}s`,
          }}
        />
      ))}

      <div className="absolute inset-0 opacity-90">
        {ORBIT_SYSTEMS.map((system) => {
          const outer = system.rings[system.rings.length - 1];
          return (
            <div
              key={system.tilt}
              className={`absolute ${system.anchor}`}
              style={{
                transform: `rotate(calc(${system.tilt} - var(--field-turn, 0) * ${system.precession}deg))`,
              }}
            >
              <span
                className={`absolute rounded-[50%] bg-gradient-to-br to-transparent blur-[80px] ${system.halo}`}
                style={{
                  width: `${outer.width * 0.85}px`,
                  height: `${outer.height * 0.85}px`,
                  left: `${(-outer.width * 0.85) / 2}px`,
                  top: `${(-outer.height * 0.85) / 2}px`,
                }}
              />
              <span
                className="orbit-wash absolute rounded-[50%]"
                style={{
                  width: `${outer.width}px`,
                  height: `${outer.height}px`,
                  left: `${-outer.width / 2}px`,
                  top: `${-outer.height / 2}px`,
                }}
              />
              {system.rings.map((ring) => (
                <div
                  key={ring.width}
                  className={`orbit-ring absolute rounded-[50%] border ${ring.stroke}`}
                  style={{
                    width: `${ring.width}px`,
                    height: `${ring.height}px`,
                    left: `${-ring.width / 2}px`,
                    top: `${-ring.height / 2}px`,
                  }}
                >
                  <div
                    className="orbit-arm absolute inset-0"
                    style={{
                      animationDuration: `${ring.duration}s`,
                      animationDirection: ring.reverse ? "reverse" : "normal",
                      animationDelay: `${ring.delay}s`,
                    }}
                  >
                    <span
                      className={`orbit-dot absolute top-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${ring.dot}`}
                    />
                  </div>
                </div>
              ))}
              <span
                className={`absolute top-0 left-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[3px] ${system.core}`}
              />
            </div>
          );
        })}
      </div>

      {ORBIT_DUST.map(([left, top, size, duration, delay]) => (
        <span
          key={`${left}-${top}`}
          className="dust absolute rounded-full bg-mocha-lavender/60"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: size,
            height: size,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </>
  );
}

function ConstellationArt() {
  return (
    <>
      <span className="field-sweep absolute top-1/2 left-[-30%] h-52 w-[160%]" />

      {SHOOTERS.map(([left, top, duration, delay]) => (
        <span
          key={`s-${left}-${top}`}
          className="field-shoot absolute"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}

      {STARS.map(([left, top, size, twinkle, drift, delay, color]) => (
        <span
          key={`${left}-${top}`}
          className={`field-star absolute rounded-full ${color}`}
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: size,
            height: size,
            animationDuration: `${twinkle}s, ${drift}s`,
            animationDelay: `${delay}s, ${delay}s`,
          }}
        />
      ))}
    </>
  );
}

function BloomArt() {
  return (
    <>
      {ORBS.map((orb) => (
        <span
          key={orb.className}
          className={`field-orb absolute rounded-full bg-gradient-to-br to-transparent blur-[70px] ${orb.className}`}
          style={{
            animationDuration: `${orb.duration}s`,
            animationDelay: `${orb.delay}s`,
          }}
        />
      ))}

      {SPARKS.map(([left, top, size, duration, delay, color]) => (
        <span
          key={`${left}-${top}`}
          className={`field-spark absolute rounded-full ${color}`}
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: size,
            height: size,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </>
  );
}

function RipplesArt() {
  return (
    <div className="absolute top-[38%] left-[68%] -translate-x-1/2 -translate-y-1/2">
      <span className="orbit-wash absolute -top-[380px] -left-[380px] h-[760px] w-[760px] rounded-[50%]" />

      <span className="orbit-ring absolute -top-[380px] -left-[380px] h-[760px] w-[760px] rounded-[50%] border border-mocha-lavender/12">
        <span
          className="orbit-arm absolute inset-0"
          style={{ animationDuration: "120s" }}
        >
          <span className="orbit-dot absolute top-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mocha-lavender text-mocha-lavender" />
        </span>
      </span>

      {RIPPLES.map((ripple) => (
        <span
          key={ripple.size}
          className="field-ripple absolute rounded-full border border-mocha-mauve/30"
          style={{
            width: ripple.size,
            height: ripple.size,
            left: -ripple.size / 2,
            top: -ripple.size / 2,
            animationDuration: `${ripple.duration}s`,
            animationDelay: `${ripple.delay}s`,
          }}
        />
      ))}

      <span className="field-pulse absolute -top-2 -left-2 h-4 w-4 rounded-full bg-mocha-mauve/70 blur-[3px]" />
    </div>
  );
}

function HorizonArt() {
  return (
    <>
      <span className="aurora absolute inset-x-0 -bottom-14 h-64 bg-gradient-to-t from-mocha-mauve/12 via-mocha-lavender/6 to-transparent blur-[60px]" />

      {HORIZON_MOTES.map(([left, top, size, duration, delay]) => (
        <span
          key={`${left}-${top}`}
          className="dust absolute rounded-full bg-mocha-mauve/40"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: size,
            height: size,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </>
  );
}

export default function SectionField({ variant }: { variant: Variant }) {
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
    if (!el || prefersReducedMotion()) return;
    return registerParallax(el, [
      { property: "--field-back", factor: 0.012 },
      { property: "--field-front", factor: 0.042 },
      { property: "--field-turn", factor: 0, progress: true },
    ]);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      frame = 0;
      el.style.setProperty("--field-px", `${(x * 24).toFixed(1)}px`);
      el.style.setProperty("--field-py", `${(y * 18).toFixed(1)}px`);
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

  const spec = FIELD[variant];

  return (
    <div
      ref={ref}
      aria-hidden
      data-paused="false"
      className="section-field pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className={`absolute inset-0 ${spec.wash}`}
        style={{
          transform: "translate3d(0, var(--field-back, 0px), 0) scaleY(1.25)",
        }}
      />

      {spec.auroras.map((aurora) => (
        <Aurora
          key={aurora.className}
          depth={aurora.depth}
          className={aurora.className}
          colors={aurora.colors}
        />
      ))}

      <div
        className="absolute inset-0"
        style={{
          transform:
            "translate3d(var(--field-px, 0px), calc(var(--field-py, 0px) + var(--field-front, 0px)), 0)",
        }}
      >
        {spec.art()}
      </div>
    </div>
  );
}
