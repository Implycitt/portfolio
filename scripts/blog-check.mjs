#!/usr/bin/env node
import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  evaluate,
  findChrome,
  newPage,
  reachable,
  startChrome,
  startServer,
  stopServer,
  waitForLoad,
} from "./lib/browser.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MOBILE_WIDTH = 390;
const WIDTHS = [MOBILE_WIDTH, 1440];
const VIEWPORT_HEIGHT = 820;
const SELF_TEST = Boolean(process.env.BLOG_SELF_TEST);
const OUTLINE_SELF_TEST = Boolean(process.env.OUTLINE_SELF_TEST);
const LIMIT = Number(process.env.BLOG_LIMIT ?? 0);

const AUDIT = `(async () => {
  await document.fonts.ready;
  await new Promise((resolve) => setTimeout(resolve, 250));

  const parse = (value) => {
    const srgb = value.match(/color\\(srgb ([^)]+)\\)/);
    if (srgb) {
      const parts = srgb[1].split(/[\\s/]+/).filter(Boolean).map(Number);
      return [parts[0] * 255, parts[1] * 255, parts[2] * 255, parts[3] ?? 1];
    }
    const rgb = value.match(/rgba?\\(([^)]+)\\)/);
    if (!rgb) return [0, 0, 0, 0];
    const parts = rgb[1].split(/[,\\s/]+/).filter(Boolean).map(Number);
    return [parts[0], parts[1], parts[2], parts[3] ?? 1];
  };

  const over = (top, bottom) => [
    top[0] * top[3] + bottom[0] * (1 - top[3]),
    top[1] * top[3] + bottom[1] * (1 - top[3]),
    top[2] * top[3] + bottom[2] * (1 - top[3]),
    1,
  ];

  const channel = (value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const luminance = (c) => 0.2126 * channel(c[0]) + 0.7152 * channel(c[1]) + 0.0722 * channel(c[2]);
  const ratio = (a, b) => {
    const l1 = luminance(a);
    const l2 = luminance(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  const visible = (el) => {
    const style = getComputedStyle(el);
    if (style.visibility !== "visible" || style.display === "none") return false;
    if (Number(style.opacity) === 0) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };

  const directText = (el) =>
    [...el.childNodes]
      .filter((node) => node.nodeType === 3)
      .map((node) => node.textContent)
      .join(" ")
      .replace(/\\s+/g, " ")
      .trim();

  const background = (el) => {
    const layers = [];
    for (let node = el; node instanceof Element; node = node.parentElement) {
      const bg = parse(getComputedStyle(node).backgroundColor);
      if (bg[3] > 0) layers.push(bg);
    }
    let base = parse(getComputedStyle(document.documentElement).backgroundColor);
    if (base[3] === 0) base = [17, 17, 27, 1];
    let out = base;
    for (let i = layers.length - 1; i >= 0; i -= 1) out = over(layers[i], out);
    return out;
  };

  const opacityChain = (el) => {
    let alpha = 1;
    for (let node = el; node instanceof Element; node = node.parentElement) {
      alpha *= Number(getComputedStyle(node).opacity);
    }
    return alpha;
  };

  const failures = [];
  const notes = [];

  const faces = [...document.fonts];
  const loaded = faces
    .filter((face) => face.status === "loaded")
    .map((face) => face.family.replace(/["']/g, "").toLowerCase());
  const failedFaces = faces
    .filter((face) => face.status === "error")
    .filter((face) => !/fallback$/i.test(face.family.replace(/["']/g, "")))
    .map((face) => face.family);
  const sample = (selector) => document.querySelector(selector);
  const fontTargets = [
    [".md-body", sample(".md-body")],
    [".hud-bar", sample(".hud-bar")],
  ].filter((entry) => entry[1]);
  const firstFamily = (el) =>
    getComputedStyle(el).fontFamily.split(",")[0].replace(/["']/g, "").trim().toLowerCase();

  const patchVar = "--font-fira-code-nerd";
  const patchVarValue = getComputedStyle(document.documentElement)
    .getPropertyValue(patchVar)
    .trim();
  if (!patchVarValue) {
    failures.push("font: " + patchVar + " is not set on <html>, so the webfont never applies");
  }
  for (const [label, el] of fontTargets) {
    const family = firstFamily(el);
    if (!loaded.includes(family)) {
      failures.push(
        'font: ' + label + ' resolves to "' + family + '", which is not a loaded webfont',
      );
    }
  }
  for (const family of failedFaces) {
    failures.push('font: face "' + family + '" failed to load');
  }

  const anchorTargets = [
    ...new Set(
      [...document.querySelectorAll('a[href^="#"]')]
        .map((a) => a.getAttribute("href"))
        .filter((href) => href && href.length > 1),
    ),
  ];
  for (const href of anchorTargets) {
    if (!document.getElementById(decodeURIComponent(href.slice(1)))) {
      failures.push("anchor: " + href + " points at nothing");
    }
  }

  const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
  for (const id of [...new Set(ids.filter((value, index) => ids.indexOf(value) !== index))]) {
    failures.push('anchor: duplicate id "' + id + '"');
  }

  const headingIds = [...document.querySelectorAll(".md-body h2[id], .md-body h3[id]")].map(
    (el) => el.id,
  );
  const outline = [...document.querySelectorAll('aside nav a[href^="#"]')].map((a) =>
    a.getAttribute("href").slice(1),
  );
  if (outline.length > 0) {
    for (const id of headingIds.filter((value) => !outline.includes(value))) {
      failures.push("outline: missing entry for #" + id);
    }
    for (const id of outline.filter((value) => !headingIds.includes(value))) {
      failures.push("outline: entry #" + id + " has no heading");
    }
  }

  const worst = { prose: [], chrome: [] };
  const panel = sample(".md-body")?.closest(".hud-panel");
  if (panel) {
    const alpha = parse(getComputedStyle(panel).backgroundColor)[3];
    if (alpha < 0.9) {
      failures.push(
        "contrast: reading surface is translucent (" + alpha.toFixed(2) + " alpha), so backdrop art shows through the prose",
      );
    }
  }

  for (const el of document.querySelectorAll("main *")) {
    if (el.closest("[data-backdrop-scope]")) continue;
    if (el.closest('[aria-hidden="true"]')) continue;
    if (el.closest("svg")) continue;
    if (!visible(el)) continue;
    const text = directText(el);
    if (!text) continue;

    const style = getComputedStyle(el);
    const fg = parse(style.color);
    const bg = background(el);
    const alpha = fg[3] * opacityChain(el);
    const size = parseFloat(style.fontSize);
    const weight = Number(style.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const category = el.closest(".md-body") ? "prose" : "chrome";
    const threshold = large ? 3 : category === "prose" ? 4.5 : 3;
    const value = ratio(over([fg[0], fg[1], fg[2], alpha], bg), bg);
    if (value < threshold) {
      worst[category].push({
        text: text.slice(0, 28),
        value: Number(value.toFixed(2)),
        threshold,
        size: Number(size.toFixed(1)),
        color: style.color,
        where: el.tagName.toLowerCase() + (el.className ? "." + String(el.className).split(" ")[0] : ""),
      });
    }
  }

  for (const category of ["prose", "chrome"]) {
    worst[category] = worst[category].sort((a, b) => a.value - b.value).slice(0, 4);
    for (const item of worst[category]) {
      failures.push(
        "contrast (" + category + '): "' + item.text + '" is ' + item.value + ":1, needs " + item.threshold + ":1 (" + item.where + " @ " + item.size + "px, " + item.color + ")",
      );
    }
  }

  const container = sample(".md-body");
  let clipped = 0;
  let scrollable = 0;
  if (container) {
    const box = container.getBoundingClientRect();
    for (const el of container.querySelectorAll("pre, code, .katex-display, table, img, .md-math-block")) {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      const past = Math.round(
        Math.max(rect.right - box.right, box.left - rect.left),
      );
      const scrollsX = style.overflowX === "auto" || style.overflowX === "scroll";
      if (past > 1) {
        clipped += 1;
        failures.push(
          "overflow: " + el.tagName.toLowerCase() + (el.className ? "." + String(el.className).split(" ")[0] : "") + " sticks " + past + "px past the prose column (overflow-x: " + style.overflowX + ")",
        );
      } else if (scrollsX && el.scrollWidth > el.clientWidth + 1) {
        scrollable += 1;
      }
    }
  }

  const pageOverflow = Math.max(
    0,
    document.documentElement.scrollWidth - window.innerWidth,
  );
  if (pageOverflow > 0) {
    failures.push("overflow: page scrolls sideways by " + pageOverflow + "px");
  }

  const sections = headingIds.length;
  if (sections > 0) {
    notes.push(sections + " section(s) tracked in the outline");
  }
  if (scrollable > 0) {
    notes.push(scrollable + " block(s) scroll horizontally inside the prose");
  }

  const outlineFlow = async () => {
    if (!sample(".md-body")) return;

    const aside = sample("aside");
    const toggle = aside ? aside.querySelector("button") : null;
    const panel = document.getElementById("post-outline");
    if (!aside || !toggle || !panel) {
      failures.push("outline: the article renders no outline panel");
      return;
    }

    const expanded = () => toggle.getAttribute("aria-expanded") === "true";
    const shown = () => getComputedStyle(panel).display !== "none";
    const rows = () =>
      [...panel.querySelectorAll("nav a")].filter(
        (link) => link.getBoundingClientRect().height > 0,
      );
    const settle = async () => {
      let last = -1;
      let still = 0;
      for (let i = 0; i < 30; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const now = Math.round(window.scrollY);
        still = now === last ? still + 1 : 0;
        last = now;
        if (still >= 2) return;
      }
    };

    if (toggle.getBoundingClientRect().width === 0) {
      if (!shown()) {
        failures.push(
          "outline: the panel is collapsed on a viewport wide enough to show it outright",
        );
      }
      return;
    }

    if (shown() || expanded()) {
      failures.push(
        "outline: the panel starts expanded on a narrow viewport, so the toggle has nothing to expand",
      );
    }

    toggle.click();
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!shown()) failures.push("outline: expanding left the panel hidden");
    if (!expanded()) {
      failures.push(
        "outline: the toggle does not report aria-expanded after expanding",
      );
    }

    if (headingIds.length > 0) {
      const listed = rows().map((link) =>
        (link.getAttribute("href") ?? "").slice(1),
      );
      if (listed.join(",") !== headingIds.join(",")) {
        failures.push(
          "outline: the expanded panel lists [" +
            listed.join(", ") +
            "] but the article has [" +
            headingIds.join(", ") +
            "]",
        );
      }

      const id = headingIds[headingIds.length - 1];
      const row = rows().find(
        (link) => link.getAttribute("href") === "#" + id,
      );

      if (!row) {
        failures.push("outline: the expanded panel has no row for #" + id);
      } else {
        row.click();
        await settle();

        const heading = document.getElementById(id);
        const padding =
          Number.parseFloat(
            getComputedStyle(document.documentElement).scrollPaddingTop,
          ) || 0;
        const top = Math.round(heading.getBoundingClientRect().top);
        if (Math.abs(top - padding) > 10) {
          const max = Math.round(
            document.documentElement.scrollHeight - window.innerHeight,
          );
          const docTop = Math.round(
            heading.getBoundingClientRect().top + window.scrollY,
          );
          failures.push(
            "outline: jumping to #" +
              id +
              " left the heading " +
              top +
              "px from the top of the viewport, not the " +
              padding +
              "px the scroll padding asks for (scrollY " +
              Math.round(window.scrollY) +
              ", target " +
              (docTop - padding) +
              ", max " +
              max +
              ")",
          );
        }
        if (window.location.hash !== "#" + id) {
          failures.push(
            "outline: jumping to #" +
              id +
              ' left the url on "' +
              (window.location.hash || window.location.pathname) +
              '"',
          );
        }

        const label = heading.textContent.replace(/\\s+/g, " ").trim();
        const bar = toggle.textContent.replace(/\\s+/g, " ").trim();
        if (label && !bar.includes(label)) {
          failures.push(
            'outline: the collapsed bar reads "' +
              bar +
              '" instead of the current section "' +
              label +
              '"',
          );
        }

        if (shown() || expanded()) {
          failures.push(
            "outline: the panel stayed open after a section was picked",
          );
        }

        const spacer = document.createElement("div");
        spacer.style.height = "220px";
        const host = document.querySelector("main") ?? document.body;
        host.prepend(spacer);

        toggle.click();
        await new Promise((resolve) => setTimeout(resolve, 300));
        const again = rows().find(
          (link) => link.getAttribute("href") === "#" + id,
        );
        if (!again) {
          failures.push(
            "outline: the panel lost its row for #" + id + " after reopening",
          );
        } else {
          again.click();
          await settle();
          const drifted = Math.round(
            heading.getBoundingClientRect().top,
          );
          if (Math.abs(drifted - padding) > 10) {
            failures.push(
              "outline: after the layout shifted, jumping to #" +
                id +
                " left the heading " +
                drifted +
                "px from the top of the viewport, not the " +
                padding +
                "px the scroll padding asks for",
            );
          }
          window.scrollTo(0, 0);
        }
        spacer.remove();

        notes.push(
          "outline: expanded " +
            listed.length +
            " row(s), jumped to #" +
            id +
            " in " +
            top +
            "px and collapsed again",
        );
      }
    }
  };

  await outlineFlow();

  return {
    failures,
    notes,
    fonts: loaded.length,
    anchors: anchorTargets.length,
    clipped,
    pageOverflow,
  };
})()`;

const SELF_TEST_SCRIPT = `(() => {
  const holder = document.createElement("div");
  holder.innerHTML =
    '<p style="color:#26262f">self test faint text</p>' +
    '<a href="#self-test-missing">self test broken anchor</a>' +
    '<div class="katex-display" style="width:4000px;height:20px">self test overflow</div>';
  const target = document.querySelector(".md-body") ?? document.querySelector("main");
  target.appendChild(holder);
  const style = document.createElement("style");
  style.textContent = ".md-body { font-family: ui-monospace, monospace !important }";
  document.head.appendChild(style);
  return true;
})()`;

const OUTLINE_SELF_TEST_SCRIPT = `(() => {
  const rows = [...document.querySelectorAll("#post-outline nav a")];
  if (rows[0]) rows[0].removeAttribute("href");
  const headings = [...document.querySelectorAll(".md-body h2[id], .md-body h3[id]")];
  const target = headings[headings.length - 1];
  if (target) target.style.transform = "translateY(300px)";
  return rows.length;
})()`;

const failures = [];
const notes = [];
let checks = 0;

function fail(message) {
  failures.push(message);
}

function log(message) {
  process.stdout.write(message + "\n");
}

async function routes(conn, base) {
  await conn.send("Page.navigate", { url: `${base}/blog` });
  await waitForLoad(conn);
  const found = await evaluate(
    conn,
    `[...new Set([...document.querySelectorAll('a[href^="/blog/"]')].map((a) => a.getAttribute("href")))]`,
  );
  const articles = (found ?? []).sort();
  return LIMIT > 0 ? articles.slice(0, LIMIT) : articles;
}

async function auditRoute(chrome, base, route, width) {
  const conn = await newPage(chrome.port);
  const errors = [];
  conn.on("Runtime.exceptionThrown", (params) => {
    errors.push(
      params.exceptionDetails?.exception?.description ??
        params.exceptionDetails?.text ??
        "page error",
    );
  });
  conn.on("Runtime.consoleAPICalled", (params) => {
    if (params.type === "error") {
      errors.push(
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
    if (SELF_TEST || OUTLINE_SELF_TEST) {
      await evaluate(
        conn,
        "new Promise((resolve) => setTimeout(resolve, 1500))",
      );
    }
    if (SELF_TEST) await evaluate(conn, SELF_TEST_SCRIPT);
    if (OUTLINE_SELF_TEST) await evaluate(conn, OUTLINE_SELF_TEST_SCRIPT);
    const report = await evaluate(conn, AUDIT);
    checks += 1;

    if (SELF_TEST || OUTLINE_SELF_TEST) {
      notes.push(
        `${route} @${width}px: self-test injected ${report.failures.length} fault(s) and the check reported them`,
      );
    } else {
      for (const message of report.failures) {
        fail(`${route} @${width}px: ${message}`);
      }
    }
    for (const message of report.notes) {
      notes.push(`${route} @${width}px: ${message}`);
    }
    if (errors.length) {
      fail(`${route} @${width}px: console errors — ${errors.join(" | ")}`);
    }
    return report;
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

  const requested = process.env.BLOG_URL;
  const port = Number(process.env.BLOG_PORT ?? 3000);
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
    `checking ${base} with ${bin}` +
      (SELF_TEST ? " (self-test: injected faults)" : "") +
      (OUTLINE_SELF_TEST ? " (outline self-test: injected faults)" : ""),
  );

  const chrome = await startChrome(bin, "portfolio-blog");
  try {
    const probe = await newPage(chrome.port);
    let articles = [];
    try {
      await probe.send("Page.enable");
      articles = await routes(probe, base);
    } finally {
      probe.close();
    }

    const all = ["/blog", ...articles];
    log(`${all.length} blog route(s) found: ${all.join(", ")}`);
    for (const route of all) {
      for (const width of WIDTHS) {
        if ((SELF_TEST || OUTLINE_SELF_TEST) && route === "/blog") continue;
        if (OUTLINE_SELF_TEST && width !== MOBILE_WIDTH) continue;
        const report = await auditRoute(chrome, base, route, width);
        log(
          `${route.padEnd(28)} ${String(width).padStart(4)}px  ` +
            `fonts=${report.fonts}  anchors=${report.anchors}  ` +
            `clipped=${report.clipped}  pageOverflow=${report.pageOverflow}  ` +
            `failures=${report.failures.length}`,
        );
        if (!SELF_TEST && !OUTLINE_SELF_TEST) continue;
        if (SELF_TEST) {
          for (const kind of ["font", "anchor", "contrast", "overflow"]) {
            const caught = report.failures.some((message) =>
              message.startsWith(kind),
            );
            if (!caught) {
              fail(
                `${route} @${width}px: self-test did not catch the injected ${kind} fault`,
              );
            }
          }
        }
        if (OUTLINE_SELF_TEST) {
          for (const marker of [
            "outline: the expanded panel lists",
            "outline: jumping to",
          ]) {
            const caught = report.failures.some((message) =>
              message.includes(marker),
            );
            if (!caught) {
              fail(
                `${route} @${width}px: outline self-test did not catch the injected fault (${marker})`,
              );
            }
          }
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
  log(`\n✓ ${checks} blog route/viewport checks passed`);
}

main().catch((error) => {
  log(`✗ ${error.message}`);
  process.exitCode = 1;
});
