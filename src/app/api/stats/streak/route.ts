import { fetchGitHubStreak } from "@/lib/github-stats";
import {
  SVG_CYAN,
  SVG_FONT,
  SVG_MAUVE,
  SVG_VIOLET,
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

function heatmap(days: { count: number }[]): string {
  if (days.length === 0) return "";
  const cells = days.slice(-182);
  const max = Math.max(1, ...cells.map((d) => d.count));
  const palette = ["#ffffff", SVG_CYAN, SVG_VIOLET, SVG_MAUVE];
  let out = "";
  for (let i = 0; i < cells.length; i++) {
    const count = cells[i].count;
    const level = count === 0 ? 0 : count / max < 0.34 ? 1 : count / max < 0.67 ? 2 : 3;
    const x = 20 + Math.floor(i / 7) * 9;
    const y = 182 + (i % 7) * 9;
    out += `<rect x="${x}" y="${y}" width="7" height="7" rx="1.5" fill="${palette[level]}" fill-opacity="${level === 0 ? 0.06 : 0.35 + level * 0.2}"/>`;
  }
  return out;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") ?? DEFAULT_USERNAME;
  const streak = await fetchGitHubStreak(username);

  const body = streak
    ? `<text x="20" y="58" font-family="${SVG_FONT}" font-size="13" fill="${SVG_CYAN}">$</text>
       <text x="34" y="58" font-family="${SVG_FONT}" font-size="13" fill="#ffffff" opacity="0.9">./streak.sh --live</text>
       <text x="20" y="88" font-family="${SVG_FONT}" font-size="12" fill="${SVG_MAUVE}">@${esc(streak.username)} · last 26 weeks</text>
       <line x1="20" y1="102" x2="${W - 20}" y2="102" stroke="#ffffff" stroke-opacity="0.1"/>
       <text x="20" y="128" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.45">CURRENT STREAK</text>
       <text x="20" y="152" font-family="${SVG_FONT}" font-size="22" font-weight="700" fill="${SVG_CYAN}">${number(
         streak.currentStreak
       )}<tspan font-size="11" fill="#ffffff" opacity="0.55"> days</tspan></text>
       <text x="185" y="128" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.45">LONGEST STREAK</text>
       <text x="185" y="152" font-family="${SVG_FONT}" font-size="22" font-weight="700" fill="${SVG_VIOLET}">${number(
         streak.longestStreak
       )}<tspan font-size="11" fill="#ffffff" opacity="0.55"> days</tspan></text>
       <text x="350" y="128" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.45">LAST 365 DAYS</text>
       <text x="350" y="152" font-family="${SVG_FONT}" font-size="22" font-weight="700" fill="${SVG_MAUVE}">${number(
         streak.totalContributions
       )}<tspan font-size="11" fill="#ffffff" opacity="0.55"> commits</tspan></text>
       ${heatmap(streak.days)}
       <text x="20" y="286" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.35">// live from quentinb.dev/api/stats · refreshed 5m</text>`
    : `<text x="20" y="58" font-family="${SVG_FONT}" font-size="13" fill="${SVG_CYAN}">$</text>
       <text x="34" y="58" font-family="${SVG_FONT}" font-size="13" fill="#ffffff" opacity="0.9">./streak.sh --live</text>
       <text x="20" y="110" font-family="${SVG_FONT}" font-size="15" fill="#ffffff" opacity="0.8">streak temporarily unavailable</text>
       <text x="20" y="134" font-family="${SVG_FONT}" font-size="12" fill="${SVG_MAUVE}">// needs GITHUB_TOKEN to read contribution data</text>
       <text x="20" y="286" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.35">// live from quentinb.dev/api/stats · refreshed 5m</text>`;

  return svgResponse(svgDocument(W, H, "~/streak.sh — bash — tty1", body));
}
