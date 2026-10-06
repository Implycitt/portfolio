#!/usr/bin/env node

import { spawn } from "node:child_process";
import net from "node:net";
import process from "node:process";

const STEPS = [
  { name: "build", script: "build" },
  { name: "unit — contribution discovery", script: "test:unit" },
  { name: "a11y — browser checks", script: "test:a11y" },
  {
    name: "smoke — routes × viewports",
    script: "test:smoke",
    port: Number(process.env.SMOKE_PORT ?? 3000),
    portEnv: "SMOKE_PORT",
  },
  {
    name: "blog — content checks",
    script: "test:blog",
    port: Number(process.env.BLOG_PORT ?? 3000),
    portEnv: "BLOG_PORT",
  },
];

function isPortBusy(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", (error) => resolve(error.code === "EADDRINUSE"));
    server.once("listening", () => server.close(() => resolve(false)));
    server.listen(port, "127.0.0.1");
  });
}

function run(script) {
  return new Promise((resolve) => {
    const child = spawn("bun", ["run", script], { stdio: "inherit" });
    child.on("error", () => resolve(1));
    child.on("close", (code) => resolve(code ?? 1));
  });
}

function seconds(ms) {
  return `${(ms / 1000).toFixed(1)}s`;
}

for (const step of STEPS) {
  if (step.port === undefined) continue;
  if (await isPortBusy(step.port)) {
    console.error(
      `\n✗ port ${step.port} is already in use, so "${step.name}" can't start its own server.\n` +
        `  It would either test whatever is already running there or time out after two minutes.\n` +
        `  Stop that process, or re-run with a free port:\n\n` +
        `    ${step.portEnv}=3100 bun run verify\n`,
    );
    process.exit(1);
  }
}

const results = [];
const started = Date.now();

for (const step of STEPS) {
  console.log(`\n\x1b[1m▶ ${step.name}\x1b[0m  (bun run ${step.script})`);
  const stepStart = Date.now();
  const code = await run(step.script);
  const elapsed = Date.now() - stepStart;
  results.push({ name: step.name, code, elapsed });

  if (code !== 0) {
    console.error(
      `\n\x1b[31m✗ ${step.name} failed\x1b[0m (${seconds(elapsed)})\n` +
        `  Skipped the ${STEPS.length - results.length} step(s) after it.\n` +
        `  Re-run just this one to iterate: bun run ${step.script}\n`,
    );
    break;
  }

  console.log(`\x1b[32m✓ ${step.name}\x1b[0m (${seconds(elapsed)})`);
}

const failed = results.filter((result) => result.code !== 0);
console.log(`\n${"─".repeat(52)}`);
for (const result of results) {
  const mark = result.code === 0 ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m";
  console.log(
    `${mark} ${result.name.padEnd(38)} ${seconds(result.elapsed).padStart(7)}`,
  );
}

if (failed.length > 0) {
  console.log(
    `\n\x1b[31m${failed.length} of ${STEPS.length} checks failed\x1b[0m (${seconds(Date.now() - started)})\n`,
  );
  process.exit(1);
}

console.log(
  `\n\x1b[32mAll ${STEPS.length} checks passed\x1b[0m (${seconds(Date.now() - started)})\n`,
);
