import { fetchGitHubStats } from "@/lib/github-stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_USERNAME = process.env.GITHUB_USERNAME ?? "Implycitt";

const W = 520;
const H = 300;
const FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const CYAN = "#2EDFE5";
const VIOLET = "#7B2CBF";
const MAUVE = "#C77DFF";
const PINK = "#FF2A6D";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function number(value: number): string {
  return value.toLocaleString("en-US");
}

function chipWidth(label: string): number {
  return 12 + label.length * 7.4;
}

function chip(x: number, y: number, label: string): string {
  const w = chipWidth(label);
  return `<rect x="${x}" y="${y - 12}" width="${w}" height="18" rx="4" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.14"/><text x="${x + 6}" y="${y}" font-family="${FONT}" font-size="11" fill="${MAUVE}">${esc(label)}</text>`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") ?? DEFAULT_USERNAME;
  const stats = await fetchGitHubStats(username);

  let langChips = "";
  if (stats && stats.top_languages.length > 0) {
    let cx = 108;
    langChips = stats.top_languages
      .slice(0, 3)
      .map((l) => {
        const label = `[${l.name} x${l.count}]`;
        const out = chip(cx, 262, label);
        cx += chipWidth(label) + 10;
        return out;
      })
      .join("");
  }

  const body = stats
    ? `<text x="20" y="58" font-family="${FONT}" font-size="13" fill="${CYAN}">$</text>
       <text x="34" y="58" font-family="${FONT}" font-size="13" fill="#ffffff" opacity="0.9">./stats.sh --live</text>
       <text x="20" y="94" font-family="${FONT}" font-size="22" font-weight="700" fill="#ffffff">${esc(stats.name)}</text>
       <text x="20" y="116" font-family="${FONT}" font-size="12" fill="${MAUVE}">@${esc(stats.username)} · ${esc(
         stats.profile_url.replace("https://", "")
       )}</text>
       <line x1="20" y1="132" x2="${W - 20}" y2="132" stroke="#ffffff" stroke-opacity="0.1"/>
       <text x="20" y="158" font-family="${FONT}" font-size="10" fill="#ffffff" opacity="0.45">FOLLOWERS</text>
       <text x="20" y="182" font-family="${FONT}" font-size="22" font-weight="700" fill="${CYAN}">${number(
         stats.followers
       )}</text>
       <text x="185" y="158" font-family="${FONT}" font-size="10" fill="#ffffff" opacity="0.45">PUBLIC REPOS</text>
       <text x="185" y="182" font-family="${FONT}" font-size="22" font-weight="700" fill="${MAUVE}">${number(
         stats.public_repos
       )}</text>
       <text x="350" y="158" font-family="${FONT}" font-size="10" fill="#ffffff" opacity="0.45">STARS</text>
       <text x="350" y="182" font-family="${FONT}" font-size="22" font-weight="700" fill="${PINK}">${number(
         stats.total_stars
       )}</text>
       <text x="20" y="218" font-family="${FONT}" font-size="10" fill="#ffffff" opacity="0.45">FORKS</text>
       <text x="20" y="242" font-family="${FONT}" font-size="22" font-weight="700" fill="${VIOLET}">${number(
         stats.total_forks
       )}</text>
       <text x="185" y="218" font-family="${FONT}" font-size="10" fill="#ffffff" opacity="0.45">WATCHERS</text>
       <text x="185" y="242" font-family="${FONT}" font-size="22" font-weight="700" fill="${CYAN}">${number(
         stats.total_watchers
       )}</text>
       ${langChips ? `<text x="20" y="262" font-family="${FONT}" font-size="10" fill="#ffffff" opacity="0.45">TOP LANGUAGES</text>${langChips}` : ""}
       <text x="20" y="286" font-family="${FONT}" font-size="10" fill="#ffffff" opacity="0.35">// live from quentinb.dev/api/stats · refreshed 5m</text>`
    : `<text x="20" y="58" font-family="${FONT}" font-size="13" fill="${CYAN}">$</text>
       <text x="34" y="58" font-family="${FONT}" font-size="13" fill="#ffffff" opacity="0.9">./stats.sh --live</text>
       <text x="20" y="110" font-family="${FONT}" font-size="15" fill="#ffffff" opacity="0.8">stats temporarily unavailable</text>
       <text x="20" y="134" font-family="${FONT}" font-size="12" fill="${MAUVE}">// github api unreachable — retrying shortly</text>
       <text x="20" y="286" font-family="${FONT}" font-size="10" fill="#ffffff" opacity="0.35">// live from quentinb.dev/api/stats · refreshed 5m</text>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="GitHub stats">
  <defs>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${CYAN}"/>
      <stop offset="0.5" stop-color="${VIOLET}"/>
      <stop offset="1" stop-color="${MAUVE}"/>
    </linearGradient>
  </defs>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="#0d0b0a" stroke="#ffffff" stroke-opacity="0.14"/>
  <rect x="0" y="0" width="${W}" height="34" rx="12" fill="#ffffff" fill-opacity="0.05"/>
  <rect x="0" y="17" width="${W}" height="17" fill="#ffffff" fill-opacity="0.05"/>
  <text x="16" y="22" font-family="${FONT}" font-size="12" fill="${CYAN}">▚</text>
  <text x="34" y="22" font-family="${FONT}" font-size="12" fill="#ffffff" opacity="0.55">~/stats.sh — bash — tty1</text>
  <rect x="470" y="10" width="8" height="14" fill="${CYAN}" fill-opacity="0.9"/>
  <rect x="0" y="34" width="${W}" height="2" fill="url(#accent)"/>
  ${body}
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
