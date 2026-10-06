import { spawn } from "node:child_process";
import { mkdtemp, readdir, stat } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

export async function reachable(url, timeout = 4000) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(timeout),
      redirect: "manual",
    });
    return response.status < 500;
  } catch {
    return false;
  }
}

export async function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/opt/google/chrome/chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ];
  const caches = [
    path.join(os.homedir(), ".cache", "ms-playwright"),
    path.join(os.homedir(), "Library", "Caches", "ms-playwright"),
    path.join(
      process.env.LOCALAPPDATA ?? path.join(os.homedir(), "AppData", "Local"),
      "ms-playwright",
    ),
  ];
  for (const cache of caches) {
    let entries = [];
    try {
      entries = await readdir(cache);
    } catch {
      continue;
    }
    for (const entry of entries.filter((name) =>
      name.startsWith("chromium-"),
    )) {
      candidates.push(
        path.join(cache, entry, "chrome-linux64", "chrome"),
        path.join(cache, entry, "chrome-linux", "chrome"),
        path.join(
          cache,
          entry,
          "chrome-mac",
          "Chromium.app",
          "Contents",
          "MacOS",
          "Chromium",
        ),
        path.join(cache, entry, "chrome-win", "chrome.exe"),
      );
    }
  }
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const info = await stat(candidate);
      if (info.isFile()) return candidate;
    } catch {
      continue;
    }
  }
  return null;
}

export async function startServer(port, cwd) {
  const child = spawn("npx", ["next", "dev", "-p", String(port)], {
    cwd,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.resume();
  child.stderr.resume();

  const base = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    if (await reachable(base, 5000)) return { base, child };
    await sleep(1500);
  }
  stopServer({ child });
  throw new Error(`dev server did not answer on ${base} within 120s`);
}

export function stopServer(server) {
  if (!server?.child?.pid) return;
  try {
    process.kill(-server.child.pid, "SIGTERM");
  } catch {
    try {
      server.child.kill("SIGTERM");
    } catch {
      return;
    }
  }
}

export async function startChrome(bin, label = "portfolio-check") {
  const profile = await mkdtemp(path.join(os.tmpdir(), `${label}-`));
  const port = await freePort();
  const child = spawn(
    bin,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`, {
        signal: AbortSignal.timeout(2000),
      });
      const info = await response.json();
      if (info.webSocketDebuggerUrl) return { child, port, profile };
    } catch {
      await sleep(250);
    }
  }
  child.kill("SIGKILL");
  throw new Error(`chrome did not expose a debugging port on ${port}`);
}

export function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(wsUrl);
    let nextId = 0;
    const pending = new Map();
    const handlers = new Map();

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) {
        const { resolve: done, reject: failRequest } = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) failRequest(new Error(message.error.message));
        else done(message.result);
        return;
      }
      for (const handler of handlers.get(message.method) ?? []) {
        handler(message.params);
      }
    };
    socket.onerror = () => reject(new Error(`cannot connect to ${wsUrl}`));
    socket.onopen = () =>
      resolve({
        send(method, params = {}) {
          return new Promise((done, failRequest) => {
            const id = ++nextId;
            pending.set(id, { resolve: done, reject: failRequest });
            socket.send(JSON.stringify({ id, method, params }));
          });
        },
        on(method, handler) {
          handlers.set(method, [...(handlers.get(method) ?? []), handler]);
        },
        close() {
          socket.close();
        },
      });
  });
}

export async function newPage(port) {
  const response = await fetch(
    `http://127.0.0.1:${port}/json/new?about:blank`,
    {
      method: "PUT",
    },
  );
  if (!response.ok) {
    throw new Error(`cannot open a page target (${response.status})`);
  }
  const target = await response.json();
  return connect(target.webSocketDebuggerUrl);
}

export async function waitForLoad(conn, deadlineMs = 30000) {
  const deadline = Date.now() + deadlineMs;
  while (Date.now() < deadline) {
    const { result } = await conn.send("Runtime.evaluate", {
      expression: "document.readyState",
      returnByValue: true,
    });
    if (result.value === "complete") return;
    await sleep(200);
  }
  throw new Error("page did not finish loading");
}

export async function evaluate(conn, expression) {
  const { result, exceptionDetails } = await conn.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (exceptionDetails) {
    throw new Error(
      exceptionDetails.exception?.description ??
        exceptionDetails.text ??
        "evaluation failed",
    );
  }
  return result.value;
}
