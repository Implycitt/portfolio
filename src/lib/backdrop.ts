export type Hue =
  | "lavender"
  | "mauve"
  | "pink"
  | "teal"
  | "sapphire"
  | "green"
  | "peach"
  | "red"
  | "text";

const HUE_VAR: Record<Hue, string> = {
  lavender: "--color-mocha-lavender",
  mauve: "--color-mocha-mauve",
  pink: "--color-mocha-pink",
  teal: "--color-mocha-teal",
  sapphire: "--color-mocha-sapphire",
  green: "--color-mocha-green",
  peach: "--color-mocha-peach",
  red: "--color-mocha-red",
  text: "--color-mocha-text",
};

export const hueColor = (hue: Hue) => `var(${HUE_VAR[hue]})`;

export const hueTint = (hue: Hue, alpha: number) =>
  `color-mix(in srgb, ${hueColor(hue)} ${alpha}%, transparent)`;

export interface Area {
  x: [number, number];
  y: [number, number];
}

export type Motion = "twinkle" | "rise" | "bob" | "breathe" | "pulse";

const MOTION_CLASS: Record<Motion, string> = {
  twinkle: "field-star",
  rise: "dust",
  bob: "field-spark",
  breathe: "field-orb",
  pulse: "field-pulse",
};

export const motionClass = (motion: Motion) => MOTION_CLASS[motion];

export interface ParticlesLayer {
  kind: "particles";
  motion: Motion;
  count: number;
  hues: Hue[];
  alpha?: number;
  area?: Area;
  size?: [number, number];
  duration?: [number, number];
  drift?: [number, number];
  delay?: [number, number];
  seed?: number;
  className?: string;
}

export interface WashLayer {
  kind: "wash";
  className: string;
}

export interface DressingLayer {
  kind: "dressing";
  className: string;
  sides?: ("left" | "right")[];
}

export interface BlobLayer {
  kind: "blob";
  className: string;
  hues: Hue[];
  depth?: number;
  alpha?: number;
}

export interface RingSystem {
  anchor?: string;
  center?: [number, number];
  tilt?: number;
  precession?: number;
  hues: Hue[];
  base: [number, number];
  count: number;
  spacing?: number;
  duration?: [number, number];
  alpha?: number[];
  disc?: boolean;
}

export interface RingsLayer {
  kind: "rings";
  systems: RingSystem[];
}

export interface GroupLayer {
  kind: "group";
  layers: LayerSpec[];
  pointer?: [number, number];
  drift?: number;
}

export interface RipplesLayer {
  kind: "ripples";
  center: [number, number];
  count: number;
  size: number;
  hue: Hue;
  step?: number;
  duration?: number;
}

export interface SweepLayer {
  kind: "sweep";
  className?: string;
  duration?: number;
}

export interface ShootingLayer {
  kind: "shooting";
  count: number;
  area?: Area;
  duration?: [number, number];
  seed?: number;
}

export type LayerSpec =
  | ParticlesLayer
  | WashLayer
  | DressingLayer
  | BlobLayer
  | RingsLayer
  | GroupLayer
  | RipplesLayer
  | SweepLayer
  | ShootingLayer;

export interface BackdropSpec {
  layers: LayerSpec[];
  mask?: boolean;
  fixed?: boolean;
  scope?: boolean;
  root?: string;
  pointer?: [number, number];
  drift?: number;
}

export type BackdropName =
  "orbit" | "constellation" | "bloom" | "ripples" | "horizon" | "station";

export type Backdrop = BackdropName | BackdropSpec;

const cache = new WeakMap<object, unknown>();

function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function between(
  random: () => number,
  range: [number, number],
  decimals = 2,
): number {
  const [min, max] = range;
  if (min === max) return min;
  return Number((min + random() * (max - min)).toFixed(decimals));
}

export interface DotLayout {
  left: number;
  top: number;
  size: number;
  hue: Hue;
  duration: string;
  delay: string;
}

export function particles(layer: ParticlesLayer): DotLayout[] {
  const cached = cache.get(layer) as DotLayout[] | undefined;
  if (cached) return cached;

  const random = makeRandom(layer.seed ?? 1);
  const area = layer.area ?? { x: [0, 100], y: [0, 100] };
  const size = layer.size ?? [1.5, 2.5];
  const duration = layer.duration ?? [4, 7];
  const drift = layer.drift ?? [11, 17];
  const delay = layer.delay ?? [0, 4];
  const twinkle = layer.motion === "twinkle";

  const dots = Array.from({ length: layer.count }, (_, index) => {
    const wait = between(random, delay, 1);
    return {
      left: between(random, area.x),
      top: between(random, area.y),
      size: between(random, size, 1),
      hue: layer.hues[index % layer.hues.length],
      duration: twinkle
        ? `${between(random, duration, 1)}s, ${between(random, drift, 1)}s`
        : `${between(random, duration, 1)}s`,
      delay: twinkle ? `${wait}s, ${wait}s` : `${wait}s`,
    };
  });

  cache.set(layer, dots);
  return dots;
}

export interface RingLayout {
  width: number;
  height: number;
  hue: Hue;
  alpha: number;
  duration: number;
  reverse: boolean;
}

const RING_ALPHA = [45, 30, 20];

export function rings(system: RingSystem): RingLayout[] {
  const cached = cache.get(system) as RingLayout[] | undefined;
  if (cached) return cached;

  const spacing = system.spacing ?? 1.5;
  const [fastest, slowest] = system.duration ?? [26, 78];
  const span = Math.max(1, system.count - 1);
  const ladder = system.alpha ?? RING_ALPHA;

  const out = Array.from({ length: system.count }, (_, index) => {
    const scale = spacing ** index;
    return {
      width: Math.round(system.base[0] * scale),
      height: Math.round(system.base[1] * scale),
      hue: system.hues[index % system.hues.length],
      alpha: ladder[Math.min(index, ladder.length - 1)],
      duration: Number(
        (fastest + ((slowest - fastest) * index) / span).toFixed(1),
      ),
      reverse: index % 2 === 1,
    };
  });

  cache.set(system, out);
  return out;
}

export interface RippleLayout {
  size: number;
  delay: number;
}

export function ripples(layer: RipplesLayer): RippleLayout[] {
  const cached = cache.get(layer) as RippleLayout[] | undefined;
  if (cached) return cached;

  const step = layer.step ?? 1.5;
  const duration = layer.duration ?? 9;
  const out = Array.from({ length: layer.count }, (_, index) => ({
    size: Math.round(layer.size * step ** index),
    delay: Number(((duration * index) / layer.count).toFixed(2)),
  }));

  cache.set(layer, out);
  return out;
}

export interface ShootingLayout {
  left: number;
  top: number;
  duration: number;
  delay: number;
}

export function shooting(layer: ShootingLayer): ShootingLayout[] {
  const cached = cache.get(layer) as ShootingLayout[] | undefined;
  if (cached) return cached;

  const random = makeRandom(layer.seed ?? 1);
  const area = layer.area ?? { x: [10, 60], y: [5, 35] };
  const [fastest, slowest] = layer.duration ?? [11, 18];

  const out = Array.from({ length: layer.count }, () => {
    const duration = between(random, [fastest, slowest], 1);
    return {
      left: between(random, area.x),
      top: between(random, area.y),
      duration,
      delay: Number((random() * duration).toFixed(1)),
    };
  });

  cache.set(layer, out);
  return out;
}

export const blobGradient = (hues: Hue[], alpha = 20) =>
  `radial-gradient(closest-side, ${hueTint(hues[0], alpha)}, ${hueTint(
    hues[1] ?? hues[0],
    alpha * 0.55,
  )}, ${hueTint(hues[2] ?? hues[1] ?? hues[0], 0)} 78%)`;

export const discGradient = (hue: Hue, accent: Hue) =>
  `radial-gradient(closest-side, ${hueTint(hue, 16)}, ${hueTint(
    accent,
    6,
  )} 55%, transparent)`;

const SCALE = "scale-[0.7] sm:scale-[0.85] lg:scale-100";

export const PRESETS: Record<BackdropName, BackdropSpec> = {
  orbit: {
    layers: [
      {
        kind: "wash",
        className:
          "bg-gradient-to-b from-mocha-lavender/12 via-mocha-mantle/30 to-mocha-sapphire/14",
      },
      {
        kind: "blob",
        depth: 40,
        alpha: 20,
        hues: ["mauve", "lavender", "sapphire"],
        className: "-top-24 left-1/2 h-[420px] w-[720px] -translate-x-1/2",
      },
      {
        kind: "blob",
        depth: -30,
        alpha: 12,
        hues: ["teal", "sapphire"],
        className: "bottom-[-8rem] right-[-6rem] h-[360px] w-[520px]",
      },
      {
        kind: "blob",
        depth: 22,
        alpha: 12,
        hues: ["lavender", "mauve"],
        className: "left-[-9rem] top-[36%] h-[340px] w-[460px]",
      },
      {
        kind: "rings",
        systems: [
          {
            anchor: `right-[-4rem] top-[2%] ${SCALE}`,
            tilt: -18,
            precession: 7,
            hues: ["lavender", "mauve", "pink"],
            base: [420, 272],
            count: 3,
            spacing: 1.52,
            duration: [34, 78],
          },
          {
            anchor: `left-[-4rem] bottom-[2%] ${SCALE}`,
            tilt: -26,
            precession: -6,
            hues: ["teal", "sapphire", "lavender"],
            base: [380, 244],
            count: 3,
            spacing: 1.5,
            duration: [30, 68],
          },
          {
            anchor: `right-[16%] bottom-[6%] ${SCALE}`,
            tilt: -14,
            precession: 11,
            hues: ["sapphire", "lavender"],
            base: [260, 166],
            count: 2,
            spacing: 1.54,
            duration: [26, 42],
          },
        ],
      },
      {
        kind: "particles",
        motion: "twinkle",
        count: 14,
        alpha: 60,
        seed: 1101,
        size: [1.5, 2.5],
        duration: [3.6, 6.6],
        drift: [11, 17],
        delay: [0, 4],
        hues: ["lavender", "sapphire", "text", "pink", "mauve"],
      },
      {
        kind: "particles",
        motion: "rise",
        count: 16,
        alpha: 60,
        seed: 2202,
        size: [1, 2],
        duration: [10.4, 14.6],
        delay: [0, 5.4],
        hues: ["lavender"],
      },
    ],
  },
  constellation: {
    layers: [
      {
        kind: "wash",
        className:
          "bg-gradient-to-b from-mocha-pink/10 via-mocha-crust/32 to-mocha-mauve/12",
      },
      {
        kind: "blob",
        depth: -24,
        alpha: 12,
        hues: ["pink", "mauve"],
        className: "right-[-10rem] top-1/4 h-[380px] w-[560px]",
      },
      { kind: "sweep", duration: 28 },
      {
        kind: "shooting",
        count: 3,
        seed: 3303,
        area: { x: [8, 62], y: [6, 34] },
        duration: [11, 18],
      },
      {
        kind: "particles",
        motion: "twinkle",
        count: 22,
        alpha: 60,
        seed: 3404,
        size: [1.5, 2.5],
        duration: [3.6, 6.8],
        drift: [11, 18],
        delay: [0, 4.4],
        hues: ["lavender", "sapphire", "text", "pink", "mauve"],
      },
    ],
  },
  bloom: {
    layers: [
      {
        kind: "wash",
        className:
          "bg-gradient-to-b from-mocha-sapphire/12 via-mocha-mantle/26 to-mocha-teal/12",
      },
      {
        kind: "blob",
        depth: 36,
        alpha: 15,
        hues: ["sapphire", "mauve", "teal"],
        className: "inset-x-0 top-1/2 mx-auto h-[400px] w-[720px]",
      },
      {
        kind: "particles",
        motion: "breathe",
        count: 4,
        alpha: 20,
        seed: 4404,
        size: [208, 256],
        duration: [17, 23],
        delay: [-13, 0],
        className: "blur-[70px]",
        hues: ["peach", "teal", "sapphire", "mauve"],
      },
      {
        kind: "particles",
        motion: "bob",
        count: 8,
        alpha: 80,
        seed: 4505,
        size: [3, 4],
        duration: [5.2, 6.9],
        delay: [0, 4.2],
        hues: ["peach", "teal", "sapphire", "green", "mauve", "red"],
      },
    ],
  },
  ripples: {
    layers: [
      {
        kind: "wash",
        className:
          "bg-gradient-to-b from-mocha-mauve/12 via-mocha-mantle/26 to-mocha-crust/45",
      },
      {
        kind: "blob",
        depth: 28,
        alpha: 15,
        hues: ["lavender", "mauve"],
        className: "inset-x-0 top-1/3 mx-auto h-[380px] w-[680px]",
      },
      {
        kind: "rings",
        systems: [
          {
            center: [68, 38],
            hues: ["lavender"],
            base: [760, 760],
            count: 1,
            alpha: [12],
            disc: true,
            duration: [120, 120],
          },
        ],
      },
      {
        kind: "ripples",
        center: [68, 38],
        count: 3,
        size: 300,
        step: 1.53,
        duration: 9,
        hue: "mauve",
      },
      {
        kind: "particles",
        motion: "pulse",
        count: 1,
        alpha: 70,
        seed: 5505,
        area: { x: [68, 68], y: [38, 38] },
        size: [16, 16],
        className: "blur-[3px]",
        hues: ["mauve"],
      },
    ],
  },
  horizon: {
    layers: [
      {
        kind: "wash",
        className:
          "bg-gradient-to-b from-mocha-crust/45 via-mocha-crust/70 to-mocha-mantle/45",
      },
      {
        kind: "dressing",
        className:
          "aurora inset-x-0 -bottom-14 h-64 bg-gradient-to-t from-mocha-mauve/12 via-mocha-lavender/6 to-transparent blur-[60px]",
      },
      {
        kind: "particles",
        motion: "rise",
        count: 5,
        alpha: 40,
        seed: 6606,
        size: [1, 2],
        duration: [11.7, 14.8],
        delay: [0, 3.5],
        hues: ["mauve"],
      },
    ],
  },
  station: {
    mask: false,
    fixed: true,
    scope: true,
    root: "z-0",
    pointer: [0, 0],
    drift: 0,
    layers: [
      { kind: "wash", className: "hud-space" },
      {
        kind: "group",
        pointer: [5, 4],
        drift: -14,
        layers: [
          {
            kind: "dressing",
            className:
              "station-planet rounded-full -top-[26%] -right-[20%] h-[40rem] w-[40rem] sm:-top-[20%] sm:-right-[14%]",
          },
          {
            kind: "dressing",
            className:
              "inset-x-[-2%] top-[46%] h-4 bg-gradient-to-r from-transparent via-mocha-sapphire/20 to-transparent blur-[7px]",
          },
        ],
      },
      {
        kind: "group",
        pointer: [15, 11],
        drift: 6,
        layers: [
          {
            kind: "particles",
            motion: "twinkle",
            count: 36,
            alpha: 45,
            seed: 7707,
            area: { x: [2, 99], y: [3, 100] },
            size: [1, 2],
            duration: [3.6, 6.8],
            drift: [10, 18],
            delay: [0, 5],
            hues: ["text"],
          },
          {
            kind: "particles",
            motion: "twinkle",
            count: 5,
            alpha: 70,
            seed: 8808,
            area: { x: [10, 95], y: [8, 84] },
            size: [6, 6],
            duration: [4, 6],
            drift: [12, 16],
            delay: [0, 4],
            hues: ["sapphire", "lavender", "teal", "pink"],
          },
          {
            kind: "dressing",
            className:
              "hud-grid inset-x-[-22%] bottom-[-2%] h-[34%] opacity-70",
          },
        ],
      },
      {
        kind: "group",
        pointer: [28, 20],
        drift: 18,
        layers: [
          {
            kind: "dressing",
            className: "station-horizon inset-x-[-3%] bottom-0 h-56",
          },
          {
            kind: "dressing",
            className: "station-rail inset-y-0 w-8",
            sides: ["left", "right"],
          },
          {
            kind: "dressing",
            className: "station-sweep inset-x-0 top-0 h-[30vh]",
          },
        ],
      },
    ],
  },
};
