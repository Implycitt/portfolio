#!/usr/bin/env node
/**
 * UI and accessibility regression checks.
 *
 * Drives the repo's own CDP harness (scripts/lib/browser.mjs) against a dev
 * server, including real `prefers-reduced-motion` emulation, so the theming,
 * motion and labelling guarantees are verified in a browser rather than by
 * reading the CSS.
 *
 * Run with `bun run test:a11y`.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  evaluate,
  findChrome,
  freePort,
  newPage,
  sleep,
  startChrome,
  startServer,
  stopServer,
  waitForLoad,
} from "./lib/browser.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROUTES = ["/", "/projects", "/resume", "/blog"];
const WIDTH = 1024;
const HEIGHT = 900;

const SNAPSHOT = `(() => {
  const html = document.documentElement;
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const controls = [...document.querySelectorAll("a[href], button")];
  const unlabeled = controls.filter((el) => {
    if (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby")) return false;
    if (el.getAttribute("title")) return false;
    if ((el.textContent ?? "").trim()) return false;
    if (el.querySelector("img[alt]:not([alt=''])")) return false;
    return true;
  });
  // transition-property defaults to "all", so it only matters when a
  // non-zero duration actually animates everything.
  const chromeless = [...document.querySelectorAll("*")].filter((el) => {
    const style = getComputedStyle(el);
    return (
      style.transitionProperty === "all" &&
      Number.parseFloat(style.transitionDuration) > 0
    );
  });
  return {
    colorScheme: getComputedStyle(html).colorScheme,
    themeColor: themeMeta ? themeMeta.getAttribute("content") : null,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    touchAction: getComputedStyle(html).touchAction,
    transitionAll: chromeless.length,
    transitionAllSample: chromeless.slice(0, 3).map((el) => el.className.toString().slice(0, 60)),
    unlabeledControls: unlabeled.length,
    unlabeledSample: unlabeled.slice(0, 3).map((el) => el.outerHTML.slice(0, 90)),
    hasIntro: (document.body.innerText ?? "").includes("initializing"),
    hiddenReveals: [...document.querySelectorAll(".reveal")].filter(
      (el) => Number(getComputedStyle(el).opacity) < 0.9,
    ).length,
  };
})()`;

/** Measured after a real Tab key press so `:focus-visible` actually matches. */
const SKIP_LINK = `(() => {
  const link = document.querySelector(".skip-link");
  if (!link) return { found: false };
  const rect = link.getBoundingClientRect();
  return {
    found: true,
    focused: document.activeElement === link,
    focusVisible: link.matches(":focus-visible"),
    top: Math.round(rect.top),
    transform: getComputedStyle(link).transform,
  };
})()`;

const POPOVER = `(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const button = [...document.querySelectorAll("header button")].find((b) =>
    b.hasAttribute("aria-expanded"),
  );
  if (!button) return { found: false };

  const controls = button.getAttribute("aria-controls");
  const panelExists = controls ? Boolean(document.getElementById(controls)) : false;

  button.click();
  await wait(80);
  const opened = button.getAttribute("aria-expanded") === "true";

  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await wait(80);
  const closedByEscape = button.getAttribute("aria-expanded") === "false";

  button.click();
  await wait(80);
  const reopened = button.getAttribute("aria-expanded") === "true";
  document.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  await wait(80);
  const closedByOutside = button.getAttribute("aria-expanded") === "false";

  return { found: true, controls, panelExists, opened, closedByEscape, reopened, closedByOutside };
})()`;

async function pressTab(conn) {
  const key = {
    key: "Tab",
    code: "Tab",
    windowsVirtualKeyCode: 9,
    nativeVirtualKeyCode: 9,
  };
  await conn.send("Input.dispatchKeyEvent", { type: "keyDown", ...key });
  await conn.send("Input.dispatchKeyEvent", { type: "keyUp", ...key });
}

async function open({ serverPort, chromePort }, route, reduced) {
  const conn = await newPage(chromePort);
  await conn.send("Emulation.setDeviceMetricsOverride", {
    width: WIDTH,
    height: HEIGHT,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await conn.send("Emulation.setEmulatedMedia", {
    features: reduced
      ? [{ name: "prefers-reduced-motion", value: "reduce" }]
      : [],
  });
  await conn.send("Page.navigate", {
    url: `http://127.0.0.1:${serverPort}${route}`,
  });
  await waitForLoad(conn);
  await sleep(700);
  return conn;
}

const failures = [];

async function main() {
  const bin = await findChrome();
  const port = await freePort();
  const server = await startServer(port, ROOT);
  const chrome = await startChrome(bin, "portfolio-a11y");
  const target = { serverPort: port, chromePort: chrome.port };

  try {
    for (const route of ROUTES) {
      const conn = await open(target, route, false);
      const snap = await evaluate(conn, SNAPSHOT);

      if (snap.colorScheme !== "dark") {
        failures.push(
          `${route}: color-scheme is "${snap.colorScheme}", expected dark`,
        );
      }
      if (!snap.themeColor) {
        failures.push(`${route}: missing <meta name="theme-color">`);
      }
      if (snap.touchAction !== "manipulation") {
        failures.push(`${route}: html touch-action is "${snap.touchAction}"`);
      }
      if (snap.transitionAll > 0) {
        failures.push(
          `${route}: ${snap.transitionAll} element(s) transition all — ${snap.transitionAllSample.join(" | ")}`,
        );
      }
      if (snap.unlabeledControls > 0) {
        failures.push(
          `${route}: ${snap.unlabeledControls} control(s) without accessible name — ${snap.unlabeledSample.join(" | ")}`,
        );
      }
      await pressTab(conn);
      // The skip link animates its transform over 220ms, so let it settle
      // before measuring where it actually ends up.
      await sleep(400);
      const skip = await evaluate(conn, SKIP_LINK);
      if (!skip.found) {
        failures.push(`${route}: no skip link found`);
      } else if (!skip.focused) {
        failures.push(`${route}: first Tab stop is not the skip link`);
      } else if (skip.top < 0) {
        failures.push(
          `${route}: skip link stays off-screen when focused (top ${skip.top}, transform ${skip.transform})`,
        );
      }

      if (route === "/projects") {
        const popover = await evaluate(conn, POPOVER);
        if (!popover.found) {
          failures.push(`${route}: no aria-expanded control in header`);
        } else {
          if (!popover.panelExists) {
            failures.push(
              `${route}: aria-controls="${popover.controls}" points at no element`,
            );
          }
          if (!popover.opened)
            failures.push(`${route}: status panel did not open on click`);
          if (!popover.closedByEscape)
            failures.push(`${route}: Escape did not close status panel`);
          if (!popover.closedByOutside) {
            failures.push(`${route}: click outside did not close status panel`);
          }
        }
      }
      conn.close();

      // Same routes again, now with reduced motion actually emulated.
      const reducedConn = await open(target, route, true);
      const reduced = await evaluate(reducedConn, SNAPSHOT);
      if (reduced.hasIntro) {
        failures.push(
          `${route}: intro overlay still plays under prefers-reduced-motion`,
        );
      }
      if (reduced.hiddenReveals > 0) {
        failures.push(
          `${route}: ${reduced.hiddenReveals} element(s) stay hidden under prefers-reduced-motion`,
        );
      }
      reducedConn.close();

      console.log(`✓ ${route} checked (default + reduced motion)`);
    }
  } finally {
    chrome.child.kill("SIGKILL");
    stopServer(server);
  }
}

await main();

if (failures.length > 0) {
  console.error("");
  for (const failure of failures) console.error(`✗ ${failure}`);
  console.error(`\n${failures.length} issue(s) found`);
  process.exit(1);
}
console.log(`\n✓ ${ROUTES.length * 2} UI checks passed`);
