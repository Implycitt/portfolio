#!/usr/bin/env node
import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  evaluate,
  findChrome,
  newPage,
  reachable,
  sleep,
  startChrome,
  startServer,
  stopServer,
  waitForLoad,
} from "./lib/browser.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROUTES = ["/", "/projects", "/resume", "/blog"];
const WIDTHS = [390, 768, 1440];
const VIEWPORT_HEIGHT = 820;
const SEAM_LIMIT = 3;
const SEAM_WINDOW = 120;
const WIDE_COVERAGE = 0.6;
const MIN_LUMINANCE = 4;
const BOUNDARY_GAP = 200;
const SELF_TEST = Boolean(process.env.SMOKE_SELF_TEST);
const SELF_TEST_CSS =
  '[data-backdrop-scope] .section-field::before{content:"";position:absolute;left:0;right:0;top:15%;height:2px;background:rgba(255,255,255,0.5)}' +
  '[data-backdrop-scope][data-backdrop-fixed]::after{content:"";position:absolute;left:0;right:0;top:38%;height:2px;background:rgba(255,255,255,0.5)}';

const AUDIT = `(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const stagger = window.innerHeight * 0.5;
  for (let y = 0; y < document.documentElement.scrollHeight; y += stagger) {
    window.scrollTo({ top: y, behavior: "instant" });
    await sleep(90);
  }
  window.scrollTo({ top: 0, behavior: "instant" });
  await sleep(600);

  const report = {
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    hiddenReveals: [...document.querySelectorAll(".reveal")].filter(
      (el) => Number(getComputedStyle(el).opacity) < 0.9,
    ).length,
    hasScope: Boolean(document.querySelector("[data-backdrop-scope]")),
    fixedScope: Boolean(
      document.querySelector("[data-backdrop-scope][data-backdrop-fixed]"),
    ),
    firstPost:
      document.querySelector('a[href^="/blog/"]')?.getAttribute("href") ?? null,
    fields: document.querySelectorAll(".section-field").length,
    maskedFields: [...document.querySelectorAll(".section-field")].filter((el) =>
      getComputedStyle(el).maskImage.includes("gradient"),
    ).length,
    height: document.documentElement.scrollHeight,
  };

  const style = document.createElement("style");
  style.textContent =
    "*{visibility:hidden !important}" +
    "html,body{visibility:visible !important}" +
    "[data-backdrop-scope],[data-backdrop-scope] *{visibility:visible !important}" +
    "section > div:not(.section-field),section > div:not(.section-field) *," +
    "footer > div:not(.section-field),footer > div:not(.section-field) *{visibility:hidden !important}" +
    (document.querySelector("[data-backdrop-scope][data-backdrop-fixed]")
      ? ""
      : ".field-art,.field-art *{visibility:hidden !important}") +
    ${SELF_TEST ? JSON.stringify(SELF_TEST_CSS) : '""'};
  document.head.appendChild(style);
  await sleep(250);

  const top = (el) => el.getBoundingClientRect().top + window.scrollY;
  const boundaries = new Set();
  const scope = document.querySelector("[data-backdrop-scope]");
  if (scope) {
    boundaries.add(Math.round(top(scope)));
    for (const node of scope.querySelectorAll("section, footer")) {
      boundaries.add(Math.round(top(node)));
    }
  }
  for (const field of document.querySelectorAll(".section-field")) {
    const start = top(field);
    const height = field.getBoundingClientRect().height;
    boundaries.add(Math.round(start));
    boundaries.add(Math.round(start + height * 0.15));
    boundaries.add(Math.round(start + height * 0.85));
  }
  report.boundaries = [...boundaries]
    .filter((value) => value > 0)
    .sort((a, b) => a - b);

  return report;
})()`;

const ROW_SAMPLER = `async (b64, row, spread) => {
  const blob = await (await fetch("data:image/png;base64," + b64)).blob();
  const bmp = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bmp.width;
  canvas.height = bmp.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bmp, 0, 0);

  const rows = [];
  let total = 0;
  for (let y = 0; y < bmp.height; y += 2) {
    const line = ctx.getImageData(0, y, bmp.width, 1).data;
    let sum = 0;
    for (let i = 0; i < line.length; i += 4) sum += line[i] + line[i + 1] + line[i + 2];
    const mean = sum / (3 * (line.length / 4));
    rows.push([y, mean]);
    total += mean;
  }

  const step = (i) => Math.abs(rows[i][1] - rows[i - 1][1]);
  const coverage = (y) => {
    const above = ctx.getImageData(0, Math.max(0, y - 2), bmp.width, 1).data;
    const line = ctx.getImageData(0, y, bmp.width, 1).data;
    let hits = 0;
    const n = line.length / 4;
    for (let i = 0; i < line.length; i += 4) {
      const a = above[i] + above[i + 1] + above[i + 2];
      const b = line[i] + line[i + 1] + line[i + 2];
      if (Math.abs(b - a) >= 12) hits += 1;
    }
    return hits / n;
  };

  const inWindow = [];
  for (let i = 1; i < rows.length; i++) {
    if (Math.abs(rows[i][0] - row) <= spread) inWindow.push(i);
  }

  let widest = 0;
  let widestAt = row;
  let any = 0;
  let anyAt = row;
  for (const i of inWindow) {
    const value = step(i);
    if (value > any) {
      any = value;
      anyAt = rows[i][0];
    }
    if (value > widest && coverage(rows[i][0]) >= ${WIDE_COVERAGE}) {
      widest = value;
      widestAt = rows[i][0];
    }
  }

  return {
    measured: inWindow.length,
    widest: Number(widest.toFixed(2)),
    widestAt,
    any: Number(any.toFixed(2)),
    anyAt,
    luminance: Number((total / rows.length).toFixed(2)),
  };
}`;

const failures = [];
const notes = [];
let checks = 0;

function fail(message) {
  failures.push(message);
}

function log(message) {
  process.stdout.write(message + "\n");
}

function dedupe(values, gap) {
  const out = [];
  for (const value of values) {
    if (!out.length || value - out[out.length - 1] >= gap) out.push(value);
  }
  return out;
}

async function inspectBoundaries(conn, boundaries, docHeight) {
  const steps = [];
  for (const boundary of dedupe(boundaries, BOUNDARY_GAP)) {
    const maxScroll = Math.max(0, docHeight - VIEWPORT_HEIGHT);
    const wanted = Math.max(
      0,
      Math.min(boundary - Math.round(VIEWPORT_HEIGHT * 0.45), maxScroll),
    );
    await evaluate(
      conn,
      `window.scrollTo({ top: ${wanted}, behavior: "instant" }), window.scrollY`,
    );
    await sleep(200);
    const scrollY = await evaluate(conn, "window.scrollY");
    const row = Math.round(boundary - scrollY);
    const spread = Math.min(SEAM_WINDOW, row - 8, VIEWPORT_HEIGHT - 8 - row);
    if (spread < 40) {
      steps.push({ boundary, skipped: true });
      continue;
    }
    const shot = await conn.send("Page.captureScreenshot", { format: "png" });
    const result = await evaluate(
      conn,
      `(${ROW_SAMPLER})(${JSON.stringify(shot.data)}, ${row}, ${spread})`,
    );
    steps.push({ boundary, row, spread, ...result });
  }
  return steps;
}

async function inspectFixedBackdrop(conn, docHeight) {
  const maxScroll = Math.max(0, docHeight - VIEWPORT_HEIGHT);
  const offsets = [0, 0.34, 0.67, 1].map((share) =>
    Math.round(maxScroll * share),
  );
  const row = Math.round(VIEWPORT_HEIGHT / 2);
  const spread = row - 8;
  const steps = [];
  for (const offset of offsets) {
    await evaluate(
      conn,
      `window.scrollTo({ top: ${offset}, behavior: "instant" }), window.scrollY`,
    );
    await sleep(220);
    const shot = await conn.send("Page.captureScreenshot", { format: "png" });
    const result = await evaluate(
      conn,
      `(${ROW_SAMPLER})(${JSON.stringify(shot.data)}, ${row}, ${spread})`,
    );
    steps.push({ boundary: offset, row, spread, ...result });
  }
  return steps;
}

async function auditRoute(chrome, base, route, width) {
  const conn = await newPage(chrome.port);
  const consoleErrors = [];
  conn.on("Runtime.exceptionThrown", (params) => {
    consoleErrors.push(
      params.exceptionDetails?.exception?.description ??
        params.exceptionDetails?.text ??
        "page error",
    );
  });
  conn.on("Runtime.consoleAPICalled", (params) => {
    if (params.type === "error") {
      consoleErrors.push(
        params.args.map((arg) => arg.value ?? arg.description).join(" "),
      );
    }
  });

  try {
    await conn.send("Page.enable");
    await conn.send("Runtime.enable");
    await conn.send("Emulation.setDeviceMetricsOverride", {
      width,
      height: VIEWPORT_HEIGHT,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });
    await conn.send("Page.addScriptToEvaluateOnNewDocument", {
      source: 'try { sessionStorage.setItem("introPlayed", "true"); } catch {}',
    });
    await conn.send("Page.navigate", { url: base + route });
    await waitForLoad(conn);

    const report = await evaluate(conn, AUDIT);
    checks += 1;

    if (report.overflowX > 0) {
      fail(
        `${route} @${width}px: horizontal overflow of ${report.overflowX}px`,
      );
    }
    if (report.hiddenReveals > 0) {
      fail(
        `${route} @${width}px: ${report.hiddenReveals} reveal(s) stuck invisible`,
      );
    }
    if (consoleErrors.length) {
      fail(
        `${route} @${width}px: console errors — ${consoleErrors.join(" | ")}`,
      );
    }
    if (report.fields !== report.maskedFields) {
      fail(
        `${route} @${width}px: ${report.fields - report.maskedFields} field(s) without an edge mask`,
      );
    }

    let steps = [];
    if (!report.hasScope) {
      notes.push(`${route} @${width}px: no backdrop, seam check skipped`);
    } else {
      steps = report.fixedScope
        ? await inspectFixedBackdrop(conn, report.height)
        : await inspectBoundaries(conn, report.boundaries, report.height);
      const measured = steps.filter((step) => !step.skipped);
      if (!measured.length) {
        fail(`${route} @${width}px: no backdrop boundary could be measured`);
      }
      const worst = measured.reduce(
        (best, step) => (step.widest > (best ? best.widest : -1) ? step : best),
        null,
      );
      const detected = Boolean(worst && worst.widest >= SEAM_LIMIT);
      if (SELF_TEST) {
        if (detected) {
          notes.push(
            `${route} @${width}px: self-test caught the injected seam (${worst.widest} at y=${worst.boundary})`,
          );
        } else {
          fail(
            `${route} @${width}px: self-test did not catch the injected seam`,
          );
        }
      } else if (detected) {
        fail(
          `${route} @${width}px: backdrop seam of ${worst.widest} luminance units at boundary y=${worst.boundary}`,
        );
      }
      const local = measured.reduce(
        (best, step) => (step.any > (best ? best.any : -1) ? step : best),
        null,
      );
      if (local && local.any >= SEAM_LIMIT) {
        notes.push(
          `${route} @${width}px: largest local step is ${local.any} at y=${local.anyAt} (narrower than ${WIDE_COVERAGE} of the width, so art rather than a seam)`,
        );
      }
      const luminance = measured[0]?.luminance ?? 0;
      if (luminance < MIN_LUMINANCE) {
        fail(
          `${route} @${width}px: backdrop looks blank (mean luminance ${luminance})`,
        );
      }
      return { report, worst, local, measured: measured.length, luminance };
    }

    return { report, measured: 0 };
  } finally {
    conn.close();
  }
}

async function main() {
  if (typeof WebSocket !== "function") {
    throw new Error("this check needs Node 22+ (global WebSocket)");
  }

  const bin = await findChrome();
  if (!bin) {
    throw new Error(
      "no Chrome/Chromium found — set CHROME_PATH to a browser binary",
    );
  }

  const requested = process.env.SMOKE_URL;
  const port = Number(process.env.SMOKE_PORT ?? 3000);
  let server = null;
  let base;
  if (requested) {
    base = requested.replace(/\/$/, "");
  } else if (await reachable(`http://127.0.0.1:${port}`)) {
    base = `http://127.0.0.1:${port}`;
  } else {
    log(`starting next dev on port ${port}…`);
    server = await startServer(port, ROOT);
    base = server.base;
  }
  log(
    `checking ${base} with ${bin}${SELF_TEST ? " (self-test: injected seam)" : ""}`,
  );

  const chrome = await startChrome(bin);
  const line = (route, width, outcome) =>
    `${route.padEnd(24)} ${String(width).padStart(4)}px  ` +
    `overflow=${outcome.report.overflowX}  ` +
    `reveals=${outcome.report.hiddenReveals}  ` +
    `fields=${outcome.report.maskedFields}/${outcome.report.fields}  ` +
    (outcome.measured
      ? `boundaries=${outcome.measured}  seamStep=${outcome.worst?.widest ?? 0}  lum=${outcome.luminance}`
      : "backdrop=skipped");
  try {
    for (const route of ROUTES) {
      for (const width of WIDTHS) {
        const outcome = await auditRoute(chrome, base, route, width);
        log(line(route, width, outcome));
        if (outcome.report.firstPost) {
          const article = await auditRoute(
            chrome,
            base,
            outcome.report.firstPost,
            width,
          );
          log(line(outcome.report.firstPost, width, article));
        }
      }
    }
  } finally {
    chrome.child.kill("SIGTERM");
    await rm(chrome.profile, { recursive: true, force: true }).catch(() => {});
    stopServer(server);
  }

  for (const note of notes) log(`note: ${note}`);
  if (failures.length) {
    log(`\n${failures.length} failure(s):`);
    for (const message of failures) log(`  ✗ ${message}`);
    process.exitCode = 1;
    return;
  }
  log(`\n✓ ${checks} route/viewport checks passed`);
}

main().catch((error) => {
  log(`✗ ${error.message}`);
  process.exitCode = 1;
});
