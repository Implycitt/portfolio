export function frame(lines: string[], label: string): string {
  const width = Math.max(...lines.map((line) => line.length));
  const head = `-- ${label} `;
  return [
    `+${head}${"-".repeat(Math.max(0, width + 2 - head.length))}+`,
    ...lines.map((line) => `| ${line.padEnd(width)} |`),
    `+${"-".repeat(width + 2)}+`,
  ].join("\n");
}

export function rule(label: string, width = 44): string {
  const head = `-- ${label} `;
  return `+${head}${"-".repeat(Math.max(0, width - head.length - 2))}+`;
}
