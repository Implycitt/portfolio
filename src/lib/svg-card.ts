export const SVG_FONT =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
export const SVG_CYAN = "#2EDFE5";
export const SVG_VIOLET = "#7B2CBF";
export const SVG_MAUVE = "#C77DFF";
export const SVG_PINK = "#FF2A6D";

export function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function number(value: number): string {
  return value.toLocaleString("en-US");
}

export function chipWidth(label: string): number {
  return 12 + label.length * 7.4;
}

export function chip(x: number, y: number, label: string): string {
  const w = chipWidth(label);
  return `<rect x="${x}" y="${y - 12}" width="${w}" height="18" rx="4" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.14"/><text x="${x + 6}" y="${y}" font-family="${SVG_FONT}" font-size="11" fill="${SVG_MAUVE}">${esc(label)}</text>`;
}

export function svgDocument(
  W: number,
  H: number,
  title: string,
  body: string,
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="GitHub stats">
  <defs>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${SVG_CYAN}"/>
      <stop offset="0.5" stop-color="${SVG_VIOLET}"/>
      <stop offset="1" stop-color="${SVG_MAUVE}"/>
    </linearGradient>
  </defs>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="#0d0b0a" stroke="#ffffff" stroke-opacity="0.14"/>
  <rect x="0" y="0" width="${W}" height="34" rx="12" fill="#ffffff" fill-opacity="0.05"/>
  <rect x="0" y="17" width="${W}" height="17" fill="#ffffff" fill-opacity="0.05"/>
  <text x="16" y="22" font-family="${SVG_FONT}" font-size="12" fill="#ffffff" opacity="0.55">${esc(title)}</text>
  <rect x="0" y="34" width="${W}" height="2" fill="url(#accent)"/>
  ${body}
</svg>`;
}

export function svgResponse(svg: string): Response {
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
