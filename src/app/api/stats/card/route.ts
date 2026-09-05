import { fetchGitHubStats } from "@/lib/github-stats";
import {
  SVG_CYAN,
  SVG_FONT,
  SVG_MAUVE,
  SVG_PINK,
  SVG_VIOLET,
  chip,
  chipWidth,
  esc,
  number,
  svgDocument,
  svgResponse,
} from "@/lib/svg-card";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_USERNAME = process.env.GITHUB_USERNAME ?? "Implycitt";

const W = 520;
const H = 300;

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
    ? `<text x="20" y="58" font-family="${SVG_FONT}" font-size="13" fill="${SVG_CYAN}">$</text>
       <text x="34" y="58" font-family="${SVG_FONT}" font-size="13" fill="#ffffff" opacity="0.9">./stats.sh --live</text>
       <text x="20" y="94" font-family="${SVG_FONT}" font-size="22" font-weight="700" fill="#ffffff">${esc(stats.name)}</text>
       <text x="20" y="116" font-family="${SVG_FONT}" font-size="12" fill="${SVG_MAUVE}">@${esc(stats.username)} · ${esc(
         stats.profile_url.replace("https://", ""),
       )}</text>
       <line x1="20" y1="132" x2="${W - 20}" y2="132" stroke="#ffffff" stroke-opacity="0.1"/>
       <text x="20" y="158" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.45">FOLLOWERS</text>
       <text x="20" y="182" font-family="${SVG_FONT}" font-size="22" font-weight="700" fill="${SVG_CYAN}">${number(
         stats.followers,
       )}</text>
       <text x="185" y="158" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.45">PUBLIC REPOS</text>
       <text x="185" y="182" font-family="${SVG_FONT}" font-size="22" font-weight="700" fill="${SVG_MAUVE}">${number(
         stats.public_repos,
       )}</text>
       <text x="350" y="158" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.45">STARS</text>
       <text x="350" y="182" font-family="${SVG_FONT}" font-size="22" font-weight="700" fill="${SVG_PINK}">${number(
         stats.total_stars,
       )}</text>
       <text x="20" y="218" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.45">FORKS</text>
       <text x="20" y="242" font-family="${SVG_FONT}" font-size="22" font-weight="700" fill="${SVG_VIOLET}">${number(
         stats.total_forks,
       )}</text>
       <text x="185" y="218" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.45">WATCHERS</text>
       <text x="185" y="242" font-family="${SVG_FONT}" font-size="22" font-weight="700" fill="${SVG_CYAN}">${number(
         stats.total_watchers,
       )}</text>
       ${langChips ? `<text x="20" y="262" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.45">TOP LANGUAGES</text>${langChips}` : ""}
       <text x="20" y="286" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.35">// live from quentinb.dev/api/stats · refreshed 5m</text>`
    : `<text x="20" y="58" font-family="${SVG_FONT}" font-size="13" fill="${SVG_CYAN}">$</text>
       <text x="34" y="58" font-family="${SVG_FONT}" font-size="13" fill="#ffffff" opacity="0.9">./stats.sh --live</text>
       <text x="20" y="110" font-family="${SVG_FONT}" font-size="15" fill="#ffffff" opacity="0.8">stats temporarily unavailable</text>
       <text x="20" y="134" font-family="${SVG_FONT}" font-size="12" fill="${SVG_MAUVE}">// github api unreachable — retrying shortly</text>
       <text x="20" y="286" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.35">// live from quentinb.dev/api/stats · refreshed 5m</text>`;

  return svgResponse(svgDocument(W, H, "~/stats.sh — bash — tty1", body));
}
