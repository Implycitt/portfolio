export const SVG_FONT =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export const MOCHA = {
  base: "#1e1e2e",
  mantle: "#181825",
  surface0: "#313244",
  overlay0: "#6c7086",
  overlay1: "#7f849c",
  subtext0: "#a6adc8",
  subtext1: "#bac2de",
  text: "#cdd6f4",
  mauve: "#cba6f7",
} as const;

export const CARD_W = 400;
export const CARD_H = 210;

export const CARD = {
  inset: 16,
  headerHeight: 34,
  titleY: 22,
  row1: 78,
  row2: 144,
  valueOffset: 28,
  captionY: 156,
  barY: 166,
  tailY: 186,
};

export const CARD_COLUMNS = [CARD.inset, 146, 276];

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

export interface CardContent {
  title: string;
  note?: string;
  body: string;
}

function svgRoot(W: number, H: number, content: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="GitHub stats">
  ${content}
</svg>`;
}

export function cardInner(W: number, H: number, content: CardContent): string {
  const band = CARD.headerHeight;
  const note = content.note
    ? `\n  <text x="${W - CARD.inset}" y="${CARD.titleY}" text-anchor="end" font-family="${SVG_FONT}" font-size="9.5" fill="${MOCHA.overlay0}">${esc(content.note)}</text>`
    : "";
  return `<rect x="0" y="0" width="${W}" height="${H}" rx="12" fill="${MOCHA.base}"/>
  <rect x="0" y="0" width="${W}" height="${band}" rx="12" fill="${MOCHA.mantle}"/>
  <rect x="0" y="${band / 2}" width="${W}" height="${band / 2}" fill="${MOCHA.mantle}"/>
  <rect x="0" y="${band}" width="${W}" height="2" fill="${MOCHA.mauve}"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="11.5" fill="none" stroke="${MOCHA.surface0}"/>
  <text x="${CARD.inset}" y="${CARD.titleY}" font-family="${SVG_FONT}" font-size="11" font-weight="600" fill="${MOCHA.text}">${esc(content.title)}</text>${note}
  ${content.body}`;
}

export function svgDocument(
  W: number,
  H: number,
  content: CardContent,
): string {
  return svgRoot(W, H, cardInner(W, H, content));
}

export function svgCardResponse(content: CardContent): Response {
  return svgResponse(svgDocument(CARD_W, CARD_H, content));
}

export const GRID_GAP = 16;

export function svgGrid(cards: CardContent[], columns = 2): string {
  const rows = Math.ceil(cards.length / columns);
  const W = columns * CARD_W + (columns - 1) * GRID_GAP;
  const H = rows * CARD_H + (rows - 1) * GRID_GAP;
  const placed = cards
    .map((card, i) => {
      const x = (i % columns) * (CARD_W + GRID_GAP);
      const y = Math.floor(i / columns) * (CARD_H + GRID_GAP);
      return `<g transform="translate(${x} ${y})">${cardInner(CARD_W, CARD_H, card)}</g>`;
    })
    .join("\n  ");
  return svgRoot(W, H, placed);
}

export function label(x: number, y: number, text: string): string {
  return `<text x="${x}" y="${y}" font-family="${SVG_FONT}" font-size="9.5" letter-spacing="0.4" fill="${MOCHA.overlay1}">${esc(text)}</text>`;
}

export function metric(
  x: number,
  y: number,
  name: string,
  value: string,
  unit?: string,
): string {
  const suffix = unit
    ? `<tspan font-size="10" fill="${MOCHA.overlay0}"> ${esc(unit)}</tspan>`
    : "";
  return `${label(x, y, name)}
  <text x="${x}" y="${y + CARD.valueOffset}" font-family="${SVG_FONT}" font-size="20" font-weight="700" fill="${MOCHA.text}">${esc(value)}${suffix}</text>`;
}

export function divider(y: number): string {
  return `<line x1="${CARD.inset}" y1="${y}" x2="${CARD_W - CARD.inset}" y2="${y}" stroke="${MOCHA.surface0}"/>`;
}

export function caption(
  x: number,
  y: number,
  text: string,
  anchor: "start" | "end" = "start",
): string {
  const anchorAttr = anchor === "end" ? ' text-anchor="end"' : "";
  return `<text x="${x}" y="${y}"${anchorAttr} font-family="${SVG_FONT}" font-size="9.5" fill="${MOCHA.overlay0}">${esc(text)}</text>`;
}

export function progressBar(y: number, ratio: number, height = 10): string {
  const width = CARD_W - CARD.inset * 2;
  const filled = (Math.max(0, Math.min(1, ratio)) * width).toFixed(1);
  const radius = height / 2;
  return `<rect x="${CARD.inset}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${MOCHA.surface0}"/>
  <rect x="${CARD.inset}" y="${y}" width="${filled}" height="${height}" rx="${radius}" fill="${MOCHA.mauve}"/>`;
}

export function unavailableCard(headline: string, hint: string): string {
  return [
    `<text x="${CARD.inset}" y="110" font-family="${SVG_FONT}" font-size="13" fill="${MOCHA.text}">${esc(headline)}</text>`,
    caption(CARD.inset, 132, hint),
  ].join("\n  ");
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
