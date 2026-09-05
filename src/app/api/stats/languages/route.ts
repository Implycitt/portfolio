import { fetchGitHubLanguageBytes } from "@/lib/github-stats";
import {
  SVG_CYAN,
  SVG_FONT,
  SVG_MAUVE,
  esc,
  svgDocument,
  svgResponse,
} from "@/lib/svg-card";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_USERNAME = process.env.GITHUB_USERNAME ?? "Implycitt";

const W = 520;
const H = 340;
const MAX_ROWS = 8;
const BAR_X = 150;
const BAR_W = 280;

const EXCLUDED_LANGUAGES = new Set(["C#", "ASP.NET"]);

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${bytes} B`;
}

function rows(languages: { name: string; bytes: number }[]): string {
  const total = languages.reduce((sum, lang) => sum + lang.bytes, 0) || 1;
  const shown = languages.slice(0, MAX_ROWS);
  const rest = languages.slice(MAX_ROWS);
  const restBytes = rest.reduce((sum, lang) => sum + lang.bytes, 0);

  const bars = shown
    .map((lang, i) => {
      const y = 112 + i * 25;
      const pct = (lang.bytes / total) * 100;
      const barW = Math.max(3, (lang.bytes / total) * BAR_W);
      const label =
        lang.name.length > 18 ? `${lang.name.slice(0, 16)}…` : lang.name;
      return `
    <text x="20" y="${y}" font-family="${SVG_FONT}" font-size="12" fill="${SVG_MAUVE}">${esc(label)}</text>
    <rect x="${BAR_X}" y="${y - 8}" width="${BAR_W}" height="8" rx="4" fill="#ffffff" fill-opacity="0.06"/>
    <rect x="${BAR_X}" y="${y - 8}" width="${barW.toFixed(1)}" height="8" rx="4" fill="url(#accent)" fill-opacity="0.85"/>
    <text x="${W - 20}" y="${y}" text-anchor="end" font-family="${SVG_FONT}" font-size="11" fill="${SVG_CYAN}">${pct.toFixed(1)}%</text>`;
    })
    .join("");

  const restLine =
    restBytes > 0
      ? `
    <text x="20" y="${112 + shown.length * 25}" font-family="${SVG_FONT}" font-size="11" fill="#ffffff" opacity="0.5">… and ${formatBytes(
      restBytes,
    )} across ${rest.length} more language${rest.length === 1 ? "" : "s"}</text>`
      : "";

  return bars + restLine;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") ?? DEFAULT_USERNAME;
  const fetched = await fetchGitHubLanguageBytes(username);
  const languages =
    fetched === null
      ? null
      : fetched.filter((lang) => !EXCLUDED_LANGUAGES.has(lang.name));

  const body =
    languages === null
      ? `<text x="20" y="58" font-family="${SVG_FONT}" font-size="13" fill="${SVG_CYAN}">$</text>
       <text x="34" y="58" font-family="${SVG_FONT}" font-size="13" fill="#ffffff" opacity="0.9">./langs.sh --bytes</text>
       <text x="20" y="110" font-family="${SVG_FONT}" font-size="15" fill="#ffffff" opacity="0.8">languages temporarily unavailable</text>
       <text x="20" y="134" font-family="${SVG_FONT}" font-size="12" fill="${SVG_MAUVE}">// github api unreachable — retrying shortly</text>
       <text x="20" y="${H - 14}" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.35">// live from quentinb.dev/api/stats · refreshed 5m</text>`
      : languages.length === 0
        ? `<text x="20" y="58" font-family="${SVG_FONT}" font-size="13" fill="${SVG_CYAN}">$</text>
       <text x="34" y="58" font-family="${SVG_FONT}" font-size="13" fill="#ffffff" opacity="0.9">./langs.sh --bytes</text>
       <text x="20" y="110" font-family="${SVG_FONT}" font-size="15" fill="#ffffff" opacity="0.8">no language data yet</text>
       <text x="20" y="134" font-family="${SVG_FONT}" font-size="12" fill="${SVG_MAUVE}">// no bytes to chart — push some code and check back</text>
       <text x="20" y="${H - 14}" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.35">// live from quentinb.dev/api/stats · refreshed 5m</text>`
        : `<text x="20" y="58" font-family="${SVG_FONT}" font-size="13" fill="${SVG_CYAN}">$</text>
       <text x="34" y="58" font-family="${SVG_FONT}" font-size="13" fill="#ffffff" opacity="0.9">./langs.sh --bytes</text>
       <text x="20" y="82" font-family="${SVG_FONT}" font-size="12" fill="${SVG_MAUVE}">@${esc(username)} · language share by bytes of code</text>
       <line x1="20" y1="94" x2="${W - 20}" y2="94" stroke="#ffffff" stroke-opacity="0.1"/>
       ${rows(languages)}
       <text x="20" y="${H - 14}" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.35">// bytes of code per language · refreshed 5m</text>`;

  return svgResponse(svgDocument(W, H, "~/langs.sh — bash — tty1", body));
}
