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

  scrollDistanceVh: 3,
  fillProgressRange: [0.0, 0.35] as [number, number],
  fillMaxDensity: 0.85,
  dissolveProgressRange: [0.3, 0.6] as [number, number],
  clearProgressRange: [0.55, 0.85] as [number, number],
  nameProgressRange: [0.58, 1.0] as [number, number],

  nameFontRatio: 0.09,
  nameMaxWidthRatio: 0.82,
  nameMaskScale: 2,
  nameThreshold: 0.05,
  nameGlitchChars: "!<>-_\\/[]{}()=+*^?#$&|;:,.~",
} as const;

interface Star {
  angle: number;
  radius: number;
  seed: number;
  twinkleSpeed: number;
}

interface NameCell {
  row: number;
  col: number;
  brightness: number;
  seed: number;
}

function smoothstep(x: number, edge0: number, edge1: number) {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function buildNameMask(
  ctx: CanvasRenderingContext2D,
  name: string,
  w: number,
  h: number,
  charWidth: number,
  charHeight: number
): { cells: NameCell[]; rowMin: number; rowMax: number } {
  let fontSize = h * CONFIG.nameFontRatio;
  ctx.font = `bold ${fontSize}px "Courier New", monospace`;
  const maxWidth = w * CONFIG.nameMaxWidthRatio;
  const measured = ctx.measureText(name).width;
  if (measured > maxWidth) {
    fontSize *= maxWidth / measured;
    ctx.font = `bold ${fontSize}px "Courier New", monospace`;
  }

  const maskScale = CONFIG.nameMaskScale;
  const pad = fontSize * 0.6;
  const maskW = Math.max(2, Math.ceil(measured + pad * 2));
  const maskH = Math.max(2, Math.ceil(fontSize * 1.6));
  const mask = document.createElement("canvas");
  mask.width = Math.ceil(maskW * maskScale);
  mask.height = Math.ceil(maskH * maskScale);
  const mctx = mask.getContext("2d");
  if (!mctx) return { cells: [], rowMin: 0, rowMax: 0 };

  mctx.scale(maskScale, maskScale);
  mctx.fillStyle = "#000";
  mctx.fillRect(0, 0, maskW, maskH);
  mctx.font = `bold ${fontSize}px "Courier New", monospace`;
  mctx.fillStyle = "#fff";
  mctx.textAlign = "center";
  mctx.textBaseline = "middle";
  mctx.fillText(name, maskW / 2, maskH / 2);
  const img = mctx.getImageData(0, 0, mask.width, mask.height);
  const data = img.data;

  const boxLeft = w / 2 - maskW / 2;
  const boxTop = h / 2 - maskH / 2;
  const cells: NameCell[] = [];
  const firstCol = Math.max(0, Math.floor(boxLeft / charWidth));
  const lastCol = Math.min(Math.floor(w / charWidth) - 1, Math.floor((boxLeft + maskW) / charWidth));
  const firstRow = Math.max(0, Math.floor(boxTop / charHeight));
  const lastRow = Math.min(Math.floor(h / charHeight) - 1, Math.floor((boxTop + maskH) / charHeight));

  let rowMin = Infinity;
  let rowMax = -Infinity;

  for (let row = firstRow; row <= lastRow; row++) {
    for (let col = firstCol; col <= lastCol; col++) {
      const x0 = Math.max(0, Math.round((col * charWidth - boxLeft) * maskScale));
      const y0 = Math.max(0, Math.round((row * charHeight - boxTop) * maskScale));
      const x1 = Math.min(mask.width, Math.round((col * charWidth + charWidth - boxLeft) * maskScale));
      const y1 = Math.min(mask.height, Math.round((row * charHeight + charHeight - boxTop) * maskScale));
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
      const brightness = (sum / count / 255) * (1 / 3);
      if (brightness < CONFIG.nameThreshold) continue;
      cells.push({ row, col, brightness, seed: Math.random() });
      if (row < rowMin) rowMin = row;
      if (row > rowMax) rowMax = row;
    }
  }
  if (rowMin === Infinity) rowMin = rowMax = 0;
  return { cells, rowMin, rowMax };
}

interface BlackHoleASCIIProps {
  name: string;
  className?: string;
}

export default function BlackHoleASCII({ name, className = "" }: BlackHoleASCIIProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    setMounted(true);
  }, []);

  useEffect(() => {
    const node = canvasRef.current;
    if (!node) return;
    const context = node.getContext("2d");
    if (!context) return;

    let frameId = 0;
    let cols = 0;
    let rows = 0;
    let viewW = 0;
    let viewH = 0;
    let charWidth = 1;
    let charHeight = 1;
    let stars: Star[] = [];
    let cellRandom = new Float32Array(0);
    let nameCells: NameCell[] = [];
    let nameRowMin = 0;
    let nameRowMax = 0;
    let glitchTimer = 0;
    let nextGlitchAt = 2.5 + Math.random() * 2;
    let lastTime = 0;
    let nameSeen = false;
    let corruptScratch: boolean[] = [];

    const measureFont = () => {
      context.font = `${CONFIG.fontSize}px "Courier New", monospace`;
      charWidth = context.measureText("M").width;
      charHeight = CONFIG.fontSize;
    };

    const initStars = () => {
      stars = [];
      const halfDiag = Math.sqrt((cols * charWidth) ** 2 + (rows * charHeight) ** 2) / 2;
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
      const dpr = window.devicePixelRatio || 1;
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
      const mask = buildNameMask(context, name, viewW, viewH, charWidth, charHeight);
      nameCells = mask.cells;
      nameRowMin = mask.rowMin;
      nameRowMax = mask.rowMax;
    };

    resize();
    window.addEventListener("resize", resize);

    let zbuf = new Float32Array(0);
    let buffer: string[] = [];

    const render = (time: number) => {
      const t = time * 0.001;
      const dt = lastTime === 0 ? 0.016 : Math.min(0.1, t - lastTime);
      lastTime = t;
      if (glitchTimer <= 0) {
        if (t >= nextGlitchAt) {
          glitchTimer = 0.09 + Math.random() * 0.21;
          nextGlitchAt = t + 4 + Math.random() * 6;
        }
      } else {
        glitchTimer -= dt;
      }
      const total = cols * rows;
      if (zbuf.length !== total) zbuf = new Float32Array(total);
      buffer = new Array(total).fill(" ");
      zbuf.fill(-Infinity);

      const scrollProgress = Math.min(
        1,
        Math.max(0, window.scrollY / (window.innerHeight * CONFIG.scrollDistanceVh))
      );
      const fillAmount =
        smoothstep(scrollProgress, CONFIG.fillProgressRange[0], CONFIG.fillProgressRange[1]) *
        CONFIG.fillMaxDensity;
      const dissolveAmount = smoothstep(
        scrollProgress,
        CONFIG.dissolveProgressRange[0],
        CONFIG.dissolveProgressRange[1]
      );
      const clearAmount = smoothstep(scrollProgress, CONFIG.clearProgressRange[0], CONFIG.clearProgressRange[1]);
      const nameProgress = smoothstep(scrollProgress, CONFIG.nameProgressRange[0], CONFIG.nameProgressRange[1]);

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
            Math.floor(twinkle * CONFIG.starRamp.length)
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

      const tilt = CONFIG.tiltBase + CONFIG.tiltAmplitude * Math.sin(t * CONFIG.tiltSpeed);
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

          const heat = Math.pow(Math.max(0, 1 - (rho - innerR) / (outerR - innerR)), 1.2);
          const flicker = 0.8 + 0.2 * Math.sin(rho * 0.15 + theta * 4 + t * 1.3);
          const lighting = 0.35 + 0.65 * Math.abs(-sinT * 0.6 + cosT * 0.8);
          const brightness = Math.min(1, Math.max(0, heat * flicker * lighting));
          const level = Math.min(ramp.length - 1, Math.floor(brightness * ramp.length));

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
          const outerNorm = (dx * dx) / ((Rs * 1.18) * (Rs * 1.18)) + (dy * dy) / ((RsY * 1.18) * (RsY * 1.18));
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
            const level = Math.min(ramp.length - 2, Math.max(1, Math.floor(flicker * (ramp.length - 2))));
            buffer[idx] = ramp[level];
          }
        }
      }

      if (dissolveAmount > 0 && cellRandom.length === total) {
        for (let idx = 0; idx < total; idx++) {
          const rv = cellRandom[idx];
          if (rv < dissolveAmount) {
            const flicker = 0.5 + 0.5 * Math.sin(t * 1.7 + rv * 40);
            const level = Math.min(ramp.length - 1, Math.max(1, Math.floor(flicker * (ramp.length - 1))));
            buffer[idx] = ramp[level];
          }
        }
      }

      if (clearAmount > 0 && cellRandom.length === total) {
        for (let idx = 0; idx < total; idx++) {
          if (cellRandom[idx] < clearAmount) buffer[idx] = " ";
        }
      }

      if (nameProgress > 0 && nameCells.length > 0) {
        if (!nameSeen) {
          nameSeen = true;
          glitchTimer = 0;
          nextGlitchAt = t + 0.8 + Math.random() * 1.5;
        }
        const glitching = glitchTimer > 0;
        let sliceBands: { rowStart: number; rowEnd: number; shift: number }[] = [];
        let corrupt: boolean[] | null = null;

        if (glitching) {
          const bandCount = 1 + Math.floor(Math.random() * 2);
          for (let i = 0; i < bandCount; i++) {
            const bandLen = 1 + Math.floor(Math.random() * 3);
            const rowStart =
              nameRowMin + Math.floor(Math.random() * Math.max(1, nameRowMax - nameRowMin + 1));
            sliceBands.push({
              rowStart,
              rowEnd: rowStart + bandLen - 1,
              shift: (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 3)),
            });
          }
          if (corruptScratch.length !== nameCells.length) {
            corruptScratch = new Array(nameCells.length).fill(false);
          } else {
            corruptScratch.fill(false);
          }
          corrupt = corruptScratch;
          const corruptCount = Math.floor(nameCells.length * (0.06 + Math.random() * 0.12));
          for (let i = 0; i < corruptCount; i++) {
            corruptScratch[Math.floor(Math.random() * nameCells.length)] = true;
          }
        }

        const flicker = glitching && Math.random() < 0.18 ? 0.35 : 1;

        for (let ci = 0; ci < nameCells.length; ci++) {
          const cell = nameCells[ci];
          let row = cell.row;
          let col = cell.col;

          if (sliceBands.length > 0) {
            for (const band of sliceBands) {
              if (row >= band.rowStart && row <= band.rowEnd) {
                col += band.shift;
                break;
              }
            }
          }
          if (col < 0 || col >= cols) continue;

          let brightness = cell.brightness * nameProgress * flicker;
          if (brightness < CONFIG.nameThreshold) continue;
          const level = Math.min(
            ramp.length - 1,
            Math.max(0, Math.floor(brightness * (ramp.length - 1) + (cell.seed - 0.5) * 1.4))
          );
          let ch = ramp[level];
          if (corrupt && corrupt[ci]) {
            ch = CONFIG.nameGlitchChars[Math.floor(Math.random() * CONFIG.nameGlitchChars.length)];
          }
          buffer[row * cols + col] = ch;
        }
      }

      context.fillStyle = "#000000";
      context.fillRect(0, 0, viewW, viewH);
      context.save();
      context.beginPath();
      context.rect(0, 0, cols * charWidth, rows * charHeight);
      context.clip();
      context.font = `${CONFIG.fontSize}px "Courier New", monospace`;
      context.fillStyle = CONFIG.color;
      context.shadowColor = CONFIG.color;
      context.shadowBlur = CONFIG.glow;
      context.textBaseline = "top";
      for (let row = 0; row < rows; row++) {
        const line = buffer.slice(row * cols, row * cols + cols).join("");
        if (line.trim().length === 0) continue;
        context.fillText(line, 0, row * charHeight);
      }
      context.restore();

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, [name, mounted]);

  if (!mounted) return null;

  return (
    <>
      <div aria-hidden style={{ height: `${(CONFIG.scrollDistanceVh + 1) * 100}vh` }} />
      {createPortal(
        <div
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
          }}
        >
          <canvas ref={canvasRef} style={{ display: "block" }} />
        </div>,
        document.body
      )}
    </>
  );
}
