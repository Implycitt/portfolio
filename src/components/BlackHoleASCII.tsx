"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const CONFIG = {
  fontSize: 12,
  color: "#ffffff",
  glow: 12,
  charRamp: " .:-=+*#%@",
  starRamp: " .,*+",
  eventHorizonRatio: 0.13,
  eventHorizonSquashY: 1.0,
  diskInner: 1.4,
  diskOuter: 3.5,
  diskSquashY: 0.5,
  thetaSamples: 460,
  rhoSamples: 26,
  tiltBase: 0.55,
  tiltAmplitude: 0.35,
  tiltSpeed: 0.06,
  spinSpeed: 0.3,
  starCount: 340,
  starDrift: 0.015,
  lensStrength: 900,

  scrollDistanceVh: 2,
  fillProgressRange: [0.0, 0.35] as [number, number],
  fillMaxDensity: 0.85,
  dissolveProgressRange: [0.3, 0.6] as [number, number],
  clearProgressRange: [0.5, 0.76] as [number, number],
  nameProgressRange: [0.55, 0.85] as [number, number],
  fadeProgressRange: [1.2, 1.45] as [number, number],
} as const;

const NAME = {
  heightRatio: 0.13,
  maxWidthRatio: 0.88,
  cellMin: 5,
  cellMax: 8,
  targetRows: 8,
  minRows: 8,
  maxBlockRatio: 0.55,
  capRatio: 0.72,
  maskScale: 2,
  strokeRatio: 0.06,
  coverageThreshold: 0.2,
  ramp: " .:-=+*#%@",
  jitter: 1.4,
  revealSpan: 0.6,
  redrawSteps: 24,
  glitchChars: "!<>-_\\/[]{}()=+*^?#$&|;:,.~",
} as const;

const GLITCH = {
  firstDelay: [0.2, 0.5] as [number, number],
  interval: [1.1, 2.6] as [number, number],
  duration: [0.12, 0.3] as [number, number],
  redrawInterval: 0.05,
  charRate: 0.07,
  bandMin: 1,
  bandMax: 3,
  bandRows: 3,
  shiftMax: 3,
} as const;

interface Star {
  angle: number;
  radius: number;
  seed: number;
  twinkleSpeed: number;
}

interface NameCell {
  col: number;
  level: number;
  seed: number;
}

interface NameGrid {
  rows: (NameCell[] | undefined)[];
  rowMin: number;
  colMin: number;
  colMax: number;
  cellW: number;
  cellH: number;
}

const EMPTY_GRID: NameGrid = {
  rows: [],
  rowMin: 0,
  colMin: 0,
  colMax: 0,
  cellW: 1,
  cellH: 1,
};

function smoothstep(x: number, edge0: number, edge1: number) {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function nameFont(size: number, bold = true): string {
  return `${bold ? "bold " : ""}${size}px "Courier New", monospace`;
}

function buildNameGrid(
  ctx: CanvasRenderingContext2D,
  name: string,
  w: number,
  h: number,
): NameGrid {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return EMPTY_GRID;

  const maxWidth = w * NAME.maxWidthRatio;
  const ideal = Math.min(h * NAME.heightRatio, maxWidth);

  const measure = (text: string, size: number) => {
    ctx.font = nameFont(size);
    return ctx.measureText(text).width;
  };
  const cellFor = (size: number) =>
    Math.max(
      NAME.cellMin,
      Math.min(
        NAME.cellMax,
        Math.round((size * NAME.capRatio) / NAME.targetRows),
      ),
    );
  const rowsFor = (size: number) => (size * NAME.capRatio) / cellFor(size);

  const singleWidth = Math.max(1, measure(name, ideal));
  const singleSize = Math.min(ideal, (ideal * maxWidth) / singleWidth);
  let lines = [name];
  let fontSize = singleSize;

  if (words.length > 1 && rowsFor(singleSize) < NAME.minRows) {
    const longest = Math.max(1, ...words.map((word) => measure(word, ideal)));
    const stacked = Math.min(
      ideal,
      (ideal * maxWidth) / longest,
      (h * NAME.maxBlockRatio) / (words.length * 1.3),
    );
    if (stacked > singleSize && rowsFor(stacked) > rowsFor(singleSize) + 1) {
      lines = words;
      fontSize = stacked;
    }
  }

  if (!Number.isFinite(fontSize) || fontSize < 8) return EMPTY_GRID;

  const cellSize = cellFor(fontSize);

  ctx.font = nameFont(cellSize, false);
  const cellW = Math.max(1, ctx.measureText("M").width);
  const cellH = cellSize;

  const lineH = fontSize * 1.3;
  const widest = Math.max(...lines.map((line) => measure(line, fontSize)));
  const pad = fontSize * 0.35;
  const maskW = Math.max(2, Math.ceil(widest + pad * 2));
  const maskH = Math.max(2, Math.ceil(lineH * lines.length + pad));

  const mask = document.createElement("canvas");
  mask.width = Math.ceil(maskW * NAME.maskScale);
  mask.height = Math.ceil(maskH * NAME.maskScale);
  const mctx = mask.getContext("2d");
  if (!mctx) return EMPTY_GRID;

  mctx.scale(NAME.maskScale, NAME.maskScale);
  mctx.fillStyle = "#000";
  mctx.fillRect(0, 0, maskW, maskH);
  mctx.font = nameFont(fontSize);
  mctx.textAlign = "center";
  mctx.textBaseline = "middle";
  mctx.lineJoin = "round";
  mctx.fillStyle = "#fff";
  mctx.strokeStyle = "#fff";
  mctx.lineWidth = fontSize * NAME.strokeRatio;

  const centerY = maskH / 2;
  lines.forEach((line, i) => {
    const y = centerY + (i - (lines.length - 1) / 2) * lineH;
    mctx.fillText(line, maskW / 2, y);
    mctx.strokeText(line, maskW / 2, y);
  });

  const img = mctx.getImageData(0, 0, mask.width, mask.height);
  const data = img.data;

  const boxLeft = w / 2 - maskW / 2;
  const boxTop = h / 2 - maskH / 2;
  const firstCol = Math.max(0, Math.floor(boxLeft / cellW));
  const lastCol = Math.min(
    Math.ceil(w / cellW) - 1,
    Math.ceil((boxLeft + maskW) / cellW),
  );
  const firstRow = Math.max(0, Math.floor(boxTop / cellH));
  const lastRow = Math.min(
    Math.ceil(h / cellH) - 1,
    Math.ceil((boxTop + maskH) / cellH),
  );
  if (lastCol < firstCol || lastRow < firstRow) return EMPTY_GRID;

  const rows: (NameCell[] | undefined)[] = new Array(lastRow - firstRow + 1);
  const rampTop = NAME.ramp.length - 1;

  for (let row = firstRow; row <= lastRow; row++) {
    for (let col = firstCol; col <= lastCol; col++) {
      const x0 = Math.max(
        0,
        Math.round((col * cellW - boxLeft) * NAME.maskScale),
      );
      const y0 = Math.max(
        0,
        Math.round((row * cellH - boxTop) * NAME.maskScale),
      );
      const x1 = Math.min(
        mask.width,
        Math.round((col * cellW + cellW - boxLeft) * NAME.maskScale),
      );
      const y1 = Math.min(
        mask.height,
        Math.round((row * cellH + cellH - boxTop) * NAME.maskScale),
      );
      if (x1 <= x0 || y1 <= y0) continue;

      let sum = 0;
      let count = 0;
      for (let y = y0; y < y1; y++) {
        let o = (y * mask.width + x0) * 4;
        for (let x = x0; x < x1; x++, o += 4) {
          sum += data[o] + data[o + 1] + data[o + 2];
          count++;
        }
      }
      if (count === 0) continue;

      const coverage = sum / count / 255 / 3;
      if (coverage < NAME.coverageThreshold) continue;

      const t =
        (coverage - NAME.coverageThreshold) / (1 - NAME.coverageThreshold);
      const seed = Math.random();
      const level = Math.max(
        1,
        Math.min(rampTop, Math.round(t * rampTop + (seed - 0.5) * NAME.jitter)),
      );

      const bucket = row - firstRow;
      const cells = rows[bucket] ?? (rows[bucket] = []);
      cells.push({ col, level, seed });
    }
  }

  return {
    rows,
    rowMin: firstRow,
    colMin: firstCol,
    colMax: lastCol,
    cellW,
    cellH,
  };
}

interface BlackHoleASCIIProps {
  name: string;
  className?: string;
}

export default function BlackHoleASCII({
  name,
  className = "",
}: BlackHoleASCIIProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "scrollRestoration" in window.history
    ) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    setMounted(true);
  }, []);

  useEffect(() => {
    const node = canvasRef.current;
    const nameNode = nameCanvasRef.current;
    if (!node || !nameNode) return;
    const context = node.getContext("2d");
    const nameContext = nameNode.getContext("2d");
    if (!context || !nameContext) return;

    let frameId = 0;
    let cols = 0;
    let rows = 0;
    let viewW = 0;
    let viewH = 0;
    let charWidth = 1;
    let charHeight = 1;
    let stars: Star[] = [];
    let cellRandom = new Float32Array(0);
    let nameGrid: NameGrid = EMPTY_GRID;
    let nameSteps = -1;
    let nameDirty = false;
    let nameOpacity = "0";
    let glitchTimer = 0;
    let glitchArmed = false;
    let nextGlitchAt = 0;
    let lastGlitchDraw = 0;
    let lastTime = 0;
    let running = true;
    const nameScratch: string[] = [""];

    const measureFont = () => {
      context.font = `${CONFIG.fontSize}px "Courier New", monospace`;
      charWidth = context.measureText("M").width;
      charHeight = CONFIG.fontSize;
    };

    const initStars = () => {
      stars = [];
      const halfDiag =
        Math.sqrt((cols * charWidth) ** 2 + (rows * charHeight) ** 2) / 2;
      const maxR = halfDiag * 1.08;
      for (let i = 0; i < CONFIG.starCount; i++) {
        const r = Math.sqrt(Math.random()) * maxR;
        stars.push({
          angle: Math.random() * Math.PI * 2,
          radius: Math.max(20, r),
          seed: Math.random() * 100,
          twinkleSpeed: 0.5 + Math.random() * 1.5,
        });
      }
    };

    const initCellRandom = () => {
      const total = cols * rows;
      cellRandom = new Float32Array(total);
      for (let i = 0; i < total; i++) cellRandom[i] = Math.random();
    };

    const resize = () => {
      viewW = window.innerWidth;
      viewH = window.innerHeight;
      const rawDpr = window.devicePixelRatio || 1;
      const dpr = Math.min(rawDpr, viewW < 768 ? 1.5 : 2);
      node.width = Math.round(viewW * dpr);
      node.height = Math.round(viewH * dpr);
      node.style.width = `${viewW}px`;
      node.style.height = `${viewH}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      measureFont();
      cols = Math.max(1, Math.floor(viewW / charWidth));
      rows = Math.max(1, Math.floor(viewH / charHeight));
      initStars();
      initCellRandom();

      nameNode.width = Math.round(viewW * dpr);
      nameNode.height = Math.round(viewH * dpr);
      nameNode.style.width = `${viewW}px`;
      nameNode.style.height = `${viewH}px`;
      nameContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      nameGrid = buildNameGrid(context, name, viewW, viewH);
      nameSteps = -1;
      measureFont();
    };

    resize();
    window.addEventListener("resize", resize);

    let zbuf = new Float32Array(0);
    let buffer: string[] = [];

    const drawName = (progress: number, glitch: boolean) => {
      const step = Math.round(progress * NAME.redrawSteps);
      if (step === nameSteps && !glitch && !nameDirty) return;
      nameSteps = step;
      nameDirty = glitch;

      nameContext.setTransform(1, 0, 0, 1, 0, 0);
      nameContext.clearRect(0, 0, nameNode.width, nameNode.height);
      if (progress <= 0) return;

      const dpr = nameNode.width / Math.max(1, viewW);
      nameContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      const { rows: gridRows, rowMin, colMin, colMax, cellW, cellH } = nameGrid;
      if (gridRows.length === 0) return;
      nameContext.font = `${cellH}px "Courier New", monospace`;
      nameContext.fillStyle = "#fff";
      nameContext.textBaseline = "top";

      const reveal = progress / NAME.revealSpan;
      const bands: { start: number; end: number; shift: number }[] = [];
      if (glitch) {
        const bandCount =
          GLITCH.bandMin +
          Math.floor(Math.random() * (GLITCH.bandMax - GLITCH.bandMin + 1));
        for (let i = 0; i < bandCount; i++) {
          const start = Math.floor(Math.random() * gridRows.length);
          bands.push({
            start,
            end: start + Math.floor(Math.random() * GLITCH.bandRows),
            shift:
              (Math.random() < 0.5 ? -1 : 1) *
              (1 + Math.floor(Math.random() * GLITCH.shiftMax)),
          });
        }
      }

      const span = colMax - colMin + 1;
      if (nameScratch.length !== span) {
        nameScratch.length = span;
        for (let i = 0; i < span; i++) nameScratch[i] = " ";
      }

      for (let i = 0; i < gridRows.length; i++) {
        const cells = gridRows[i];
        if (!cells || cells.length === 0) continue;
        for (let s = 0; s < span; s++) nameScratch[s] = " ";
        let ink = false;
        for (const cell of cells) {
          if (reveal < cell.seed) continue;
          let ch = NAME.ramp[cell.level];
          if (glitch && Math.random() < GLITCH.charRate) {
            ch =
              NAME.glitchChars[
                Math.floor(Math.random() * NAME.glitchChars.length)
              ];
          }
          nameScratch[cell.col - colMin] = ch;
          ink = true;
        }
        if (!ink) continue;
        let shift = 0;
        for (const band of bands) {
          if (i >= band.start && i <= band.end) {
            shift = band.shift;
            break;
          }
        }
        nameContext.fillText(
          nameScratch.join(""),
          (colMin + shift) * cellW,
          (rowMin + i) * cellH,
        );
      }
    };

    const render = (time: number) => {
      const t = time * 0.001;
      const dt = lastTime === 0 ? 0.016 : Math.min(0.1, t - lastTime);
      lastTime = t;
      const total = cols * rows;
      if (zbuf.length !== total) zbuf = new Float32Array(total);
      if (buffer.length !== total) buffer = new Array(total);
      buffer.fill(" ");
      zbuf.fill(-Infinity);

      const scrollProgress = Math.min(
        1.6,
        Math.max(
          0,
          window.scrollY / (window.innerHeight * CONFIG.scrollDistanceVh),
        ),
      );
      const fillAmount =
        smoothstep(
          scrollProgress,
          CONFIG.fillProgressRange[0],
          CONFIG.fillProgressRange[1],
        ) * CONFIG.fillMaxDensity;
      const dissolveAmount = smoothstep(
        scrollProgress,
        CONFIG.dissolveProgressRange[0],
        CONFIG.dissolveProgressRange[1],
      );
      const clearAmount = smoothstep(
        scrollProgress,
        CONFIG.clearProgressRange[0],
        CONFIG.clearProgressRange[1],
      );
      const nameProgress = smoothstep(
        scrollProgress,
        CONFIG.nameProgressRange[0],
        CONFIG.nameProgressRange[1],
      );

      if (nameProgress <= 0) {
        glitchArmed = false;
        glitchTimer = 0;
      } else {
        if (!glitchArmed) {
          glitchArmed = true;
          nextGlitchAt =
            t +
            GLITCH.firstDelay[0] +
            Math.random() * (GLITCH.firstDelay[1] - GLITCH.firstDelay[0]);
        }
        if (glitchTimer <= 0 && t >= nextGlitchAt) {
          glitchTimer =
            GLITCH.duration[0] +
            Math.random() * (GLITCH.duration[1] - GLITCH.duration[0]);
          nextGlitchAt =
            t +
            GLITCH.interval[0] +
            Math.random() * (GLITCH.interval[1] - GLITCH.interval[0]);
        }
        if (glitchTimer > 0) glitchTimer -= dt;
      }

      const cx = cols / 2;
      const cy = rows / 2;
      const minDimPx = Math.min(cols * charWidth, rows * charHeight);
      const Rs = minDimPx * CONFIG.eventHorizonRatio;
      const RsY = Rs * CONFIG.eventHorizonSquashY;
      const innerR = Rs * CONFIG.diskInner;
      const outerR = Rs * CONFIG.diskOuter;
      const ramp = CONFIG.charRamp;

      for (const s of stars) {
        const angle = s.angle + t * CONFIG.starDrift;
        let r = s.radius;
        if (r < Rs * 1.2) continue;
        r += CONFIG.lensStrength / r;
        const wx = Math.cos(angle) * r;
        const wy = Math.sin(angle) * r;
        const col = Math.round(cx + wx / charWidth);
        const row = Math.round(cy + wy / charHeight);
        if (col < 0 || col >= cols || row < 0 || row >= rows) continue;
        const idx = row * cols + col;
        if (zbuf[idx] < -99999) {
          const twinkle = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.seed);
          const level = Math.min(
            CONFIG.starRamp.length - 1,
            Math.floor(twinkle * CONFIG.starRamp.length),
          );
          buffer[idx] = CONFIG.starRamp[level];
          zbuf[idx] = -99999;
        }
      }

      const boxR = Rs * 1.2;
      const boxRY = RsY * 1.2;
      const colSpan = Math.ceil(boxR / charWidth) + 1;
      const rowSpan = Math.ceil(boxRY / charHeight) + 1;
      const cCol = Math.round(cx);
      const cRow = Math.round(cy);
      for (let rr = -rowSpan; rr <= rowSpan; rr++) {
        const row = cRow + rr;
        if (row < 0 || row >= rows) continue;
        for (let cc = -colSpan; cc <= colSpan; cc++) {
          const col = cCol + cc;
          if (col < 0 || col >= cols) continue;
          const dx = cc * charWidth;
          const dy = rr * charHeight;
          const norm = (dx * dx) / (Rs * Rs) + (dy * dy) / (RsY * RsY);
          if (norm > 1) continue;
          const idx = row * cols + col;
          const zFront = Rs * Math.sqrt(Math.max(0, 1 - norm));
          if (zFront > zbuf[idx]) {
            buffer[idx] = " ";
            zbuf[idx] = zFront;
          }
        }
      }

      const tilt =
        CONFIG.tiltBase + CONFIG.tiltAmplitude * Math.sin(t * CONFIG.tiltSpeed);
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);

      for (let ri = 0; ri < CONFIG.rhoSamples; ri++) {
        const rho = innerR + (ri / (CONFIG.rhoSamples - 1)) * (outerR - innerR);
        const omega = CONFIG.spinSpeed * Math.pow(innerR / rho, 1.5);
        for (let ti = 0; ti < CONFIG.thetaSamples; ti++) {
          const theta = (ti / CONFIG.thetaSamples) * Math.PI * 2 + t * omega;
          const x = rho * Math.cos(theta);
          const y0 = rho * Math.sin(theta);
          const y = y0 * cosT * CONFIG.diskSquashY;
          const z = y0 * sinT;

          const horizonNorm = (x * x) / (Rs * Rs) + (y * y) / (RsY * RsY);
          if (horizonNorm <= 1) {
            const zFront = Rs * Math.sqrt(Math.max(0, 1 - horizonNorm));
            if (z < zFront) continue;
          }

          const col = Math.round(cx + x / charWidth);
          const row = Math.round(cy + y / charHeight);
          if (col < 0 || col >= cols || row < 0 || row >= rows) continue;
          const idx = row * cols + col;
          if (z <= zbuf[idx]) continue;

          const heat = Math.pow(
            Math.max(0, 1 - (rho - innerR) / (outerR - innerR)),
            1.2,
          );
          const flicker =
            0.8 + 0.2 * Math.sin(rho * 0.15 + theta * 4 + t * 1.3);
          const lighting = 0.35 + 0.65 * Math.abs(-sinT * 0.6 + cosT * 0.8);
          const brightness = Math.min(
            1,
            Math.max(0, heat * flicker * lighting),
          );
          const level = Math.min(
            ramp.length - 1,
            Math.floor(brightness * ramp.length),
          );

          buffer[idx] = ramp[level];
          zbuf[idx] = z;
        }
      }

      for (let rr = -rowSpan; rr <= rowSpan; rr++) {
        const row = cRow + rr;
        if (row < 0 || row >= rows) continue;
        for (let cc = -colSpan; cc <= colSpan; cc++) {
          const col = cCol + cc;
          if (col < 0 || col >= cols) continue;
          const dx = cc * charWidth;
          const dy = rr * charHeight;
          const norm = (dx * dx) / (Rs * Rs) + (dy * dy) / (RsY * RsY);
          const outerNorm =
            (dx * dx) / (Rs * 1.18 * (Rs * 1.18)) +
            (dy * dy) / (RsY * 1.18 * (RsY * 1.18));
          if (norm <= 1 || outerNorm > 1) continue;
          const idx = row * cols + col;
          if (buffer[idx] !== " ") continue;
          const ang = Math.atan2(dy, dx);
          const shimmer = 0.5 + 0.5 * Math.sin(ang * 6 + t * 3);
          buffer[idx] = shimmer > 0.5 ? "@" : "#";
        }
      }

      if (fillAmount > 0 && cellRandom.length === total) {
        for (let idx = 0; idx < total; idx++) {
          if (buffer[idx] !== " ") continue;
          const rv = cellRandom[idx];
          if (rv < fillAmount) {
            const flicker = 0.5 + 0.5 * Math.sin(t * 1.5 + rv * 30);
            const level = Math.min(
              ramp.length - 2,
              Math.max(1, Math.floor(flicker * (ramp.length - 2))),
            );
            buffer[idx] = ramp[level];
          }
        }
      }

      if (dissolveAmount > 0 && cellRandom.length === total) {
        for (let idx = 0; idx < total; idx++) {
          const rv = cellRandom[idx];
          if (rv < dissolveAmount) {
            const flicker = 0.5 + 0.5 * Math.sin(t * 1.7 + rv * 40);
            const level = Math.min(
              ramp.length - 1,
              Math.max(1, Math.floor(flicker * (ramp.length - 1))),
            );
            buffer[idx] = ramp[level];
          }
        }
      }

      if (clearAmount > 0 && cellRandom.length === total) {
        for (let idx = 0; idx < total; idx++) {
          if (cellRandom[idx] < clearAmount) buffer[idx] = " ";
        }
      }

      context.clearRect(0, 0, viewW, viewH);
      context.save();
      context.beginPath();
      context.rect(0, 0, cols * charWidth, rows * charHeight);
      context.clip();
      context.font = `${CONFIG.fontSize}px "Courier New", monospace`;
      context.fillStyle = CONFIG.color;
      context.textBaseline = "top";
      for (let row = 0; row < rows; row++) {
        const line = buffer.slice(row * cols, row * cols + cols).join("");
        if (line.trim().length === 0) continue;
        context.fillText(line, 0, row * charHeight);
      }
      context.restore();

      const nextOpacity = nameProgress <= 0 ? "0" : nameProgress.toFixed(3);
      if (nextOpacity !== nameOpacity) {
        nameOpacity = nextOpacity;
        nameNode.style.opacity = nextOpacity;
      }
      if (nameProgress > 0) {
        const glitchNow = glitchTimer > 0;
        if (glitchNow) {
          if (t - lastGlitchDraw > GLITCH.redrawInterval) {
            lastGlitchDraw = t;
            drawName(nameProgress, true);
          }
        } else {
          drawName(nameProgress, false);
        }
      }

      const rawProgress =
        window.scrollY / (window.innerHeight * CONFIG.scrollDistanceVh);
      const fadeAlpha =
        1 -
        smoothstep(
          rawProgress,
          CONFIG.fadeProgressRange[0],
          CONFIG.fadeProgressRange[1],
        );
      const wrapper = wrapperRef.current;
      if (wrapper) {
        const nextWrapperOpacity = fadeAlpha.toFixed(3);
        if (wrapper.style.opacity !== nextWrapperOpacity) {
          wrapper.style.opacity = nextWrapperOpacity;
        }
      }

      if (
        document.hidden ||
        window.scrollY >= window.innerHeight * (CONFIG.scrollDistanceVh + 1)
      ) {
        running = false;
        return;
      }
      frameId = requestAnimationFrame(render);
    };

    const resumeIfNeeded = () => {
      if (running) return;
      if (document.hidden) return;
      if (window.scrollY >= window.innerHeight * (CONFIG.scrollDistanceVh + 1))
        return;
      running = true;
      lastTime = 0;
      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    document.addEventListener("visibilitychange", resumeIfNeeded);
    window.addEventListener("scroll", resumeIfNeeded, { passive: true });

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", resumeIfNeeded);
      window.removeEventListener("scroll", resumeIfNeeded);
    };
  }, [name, mounted]);

  if (!mounted) return null;

  return (
    <>
      <div
        aria-hidden
        style={{ height: `${(CONFIG.scrollDistanceVh + 1) * 100}vh` }}
      />
      {createPortal(
        <div
          ref={wrapperRef}
          className={className}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
            backgroundColor: "#000",
            zIndex: -10,
            pointerEvents: "none",
            opacity: 1,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              display: "block",
              filter: `drop-shadow(0 0 ${CONFIG.glow}px rgba(255, 255, 255, 0.85))`,
            }}
          />
          <canvas
            ref={nameCanvasRef}
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              display: "block",
              opacity: 0,
              filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))",
            }}
          />
        </div>,
        document.body,
      )}
    </>
  );
}
