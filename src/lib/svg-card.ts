export const SVG_FONT =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
export const SVG_CYAN = "#2EDFE5";
export const SVG_VIOLET = "#7B2CBF";
export const SVG_MAUVE = "#C77DFF";
export const SVG_PINK = "#FF2A6D";

export const CARD_W = 400;
export const CARD_H = 210;

export const CARD = {
  inset: 14,
  headerHeight: 28,
  titleY: 19,
  promptY: 48,
  metaY: 65,
  ruleY: 74,
  row1: 96,
  row2: 144,
  valueOffset: 21,
  footerY: CARD_H - 12,
};

export const CARD_COLUMNS = [CARD.inset, 138, 262];

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

function accentDefs(): string {
  return `<defs>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${SVG_CYAN}"/>
      <stop offset="0.5" stop-color="${SVG_VIOLET}"/>
      <stop offset="1" stop-color="${SVG_MAUVE}"/>
    </linearGradient>
  </defs>`;
}

function svgRoot(W: number, H: number, content: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="GitHub stats">
  ${accentDefs()}
  ${content}
</svg>`;
}

export function cardInner(
  W: number,
  H: number,
  title: string,
  body: string,
): string {
  return `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="#0d0b0a" stroke="#ffffff" stroke-opacity="0.14"/>
  <rect x="0" y="0" width="${W}" height="${CARD.headerHeight}" rx="12" fill="#ffffff" fill-opacity="0.05"/>
  <rect x="0" y="${CARD.headerHeight / 2}" width="${W}" height="${CARD.headerHeight / 2}" fill="#ffffff" fill-opacity="0.05"/>
  <text x="${CARD.inset}" y="${CARD.titleY}" font-family="${SVG_FONT}" font-size="11" fill="#ffffff" opacity="0.55">${esc(title)}</text>
  <rect x="0" y="${CARD.headerHeight}" width="${W}" height="2" fill="url(#accent)"/>
  ${body}`;
}

export interface CardContent {
  title: string;
  body: string;
}

export function svgDocument(
  W: number,
  H: number,
  title: string,
  body: string,
): string {
  return svgRoot(W, H, cardInner(W, H, title, body));
}

export function svgCardResponse(content: CardContent): Response {
  return svgResponse(svgDocument(CARD_W, CARD_H, content.title, content.body));
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
      return `<g transform="translate(${x} ${y})">${cardInner(CARD_W, CARD_H, card.title, card.body)}</g>`;
    })
    .join("\n  ");
  return svgRoot(W, H, placed);
}

export function promptLine(command: string, y = CARD.promptY): string {
  return `<text x="${CARD.inset}" y="${y}" font-family="${SVG_FONT}" font-size="11.5" fill="${SVG_CYAN}">$</text>
  <text x="${CARD.inset + 14}" y="${y}" font-family="${SVG_FONT}" font-size="11.5" fill="#ffffff" opacity="0.9">${esc(command)}</text>`;
}

export function metaLine(text: string, y = CARD.metaY): string {
  return `<text x="${CARD.inset}" y="${y}" font-family="${SVG_FONT}" font-size="10" fill="${SVG_MAUVE}">${esc(text)}</text>`;
}

export function divider(y: number): string {
  return `<line x1="${CARD.inset}" y1="${y}" x2="${CARD_W - CARD.inset}" y2="${y}" stroke="#ffffff" stroke-opacity="0.1"/>`;
}

export function metric(
  x: number,
  y: number,
  label: string,
  value: string,
  color: string = "#ffffff",
  unit?: string,
): string {
  const suffix = unit
    ? `<tspan font-size="10" fill="#ffffff" opacity="0.55"> ${esc(unit)}</tspan>`
    : "";
  return `<text x="${x}" y="${y}" font-family="${SVG_FONT}" font-size="9" fill="#ffffff" opacity="0.45">${esc(label)}</text>
  <text x="${x}" y="${y + CARD.valueOffset}" font-family="${SVG_FONT}" font-size="19" font-weight="700" fill="${color}">${esc(value)}${suffix}</text>`;
}

export function capsLabel(x: number, y: number, text: string): string {
  return `<text x="${x}" y="${y}" font-family="${SVG_FONT}" font-size="9" fill="#ffffff" opacity="0.45">${esc(text)}</text>`;
}

export function progressBar(y: number, ratio: number, height = 9): string {
  const width = CARD_W - CARD.inset * 2;
  const filled = (Math.max(0, Math.min(1, ratio)) * width).toFixed(1);
  const radius = height / 2;
  return `<rect x="${CARD.inset}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="#ffffff" fill-opacity="0.06"/>
  <rect x="${CARD.inset}" y="${y}" width="${filled}" height="${height}" rx="${radius}" fill="url(#accent)" fill-opacity="0.85"/>`;
}

export function cardFooter(
  note = "// live from quentinb.dev/api/stats · refreshed 5m",
): string {
  return `<text x="${CARD.inset}" y="${CARD.footerY}" font-family="${SVG_FONT}" font-size="9" fill="#ffffff" opacity="0.35">${esc(note)}</text>`;
}

export function unavailableCard(
  command: string,
  headline: string,
  hint: string,
): string {
  return [
    promptLine(command),
    `<text x="${CARD.inset}" y="104" font-family="${SVG_FONT}" font-size="13" fill="#ffffff" opacity="0.8">${esc(headline)}</text>`,
    `<text x="${CARD.inset}" y="124" font-family="${SVG_FONT}" font-size="10.5" fill="${SVG_MAUVE}">${esc(hint)}</text>`,
    cardFooter(),
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
