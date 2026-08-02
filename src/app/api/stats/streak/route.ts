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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") ?? DEFAULT_USERNAME;
  const streak = await fetchGitHubStreak(username);

  const body = streak
    ? (() => {
        const activeDays = streak.days.filter((day) => day.count > 0).length;
        const ratio = Math.min(1, activeDays / 365);
        return `<text x="20" y="58" font-family="${SVG_FONT}" font-size="13" fill="${SVG_CYAN}">$</text>
       <text x="34" y="58" font-family="${SVG_FONT}" font-size="13" fill="#ffffff" opacity="0.9">./streak.sh --live</text>
       <text x="20" y="88" font-family="${SVG_FONT}" font-size="12" fill="${SVG_MAUVE}">@${esc(streak.username)} · last 365 days</text>
       <line x1="20" y1="102" x2="${W - 20}" y2="102" stroke="#ffffff" stroke-opacity="0.1"/>
       <text x="20" y="132" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.45">CURRENT STREAK</text>
       <text x="20" y="158" font-family="${SVG_FONT}" font-size="26" font-weight="700" fill="${SVG_CYAN}">${number(
         streak.currentStreak
       )}<tspan font-size="12" fill="#ffffff" opacity="0.55"> days</tspan></text>
       <text x="185" y="132" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.45">LONGEST STREAK</text>
       <text x="185" y="158" font-family="${SVG_FONT}" font-size="26" font-weight="700" fill="${SVG_VIOLET}">${number(
         streak.longestStreak
       )}<tspan font-size="12" fill="#ffffff" opacity="0.55"> days</tspan></text>
       <text x="350" y="132" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.45">LAST 365 DAYS</text>
       <text x="350" y="158" font-family="${SVG_FONT}" font-size="26" font-weight="700" fill="${SVG_MAUVE}">${number(
         streak.totalContributions
       )}<tspan font-size="12" fill="#ffffff" opacity="0.55"> commits</tspan></text>
       <line x1="20" y1="190" x2="${W - 20}" y2="190" stroke="#ffffff" stroke-opacity="0.1"/>
       <text x="20" y="218" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.45">ACTIVE DAYS · ${number(activeDays)}/365</text>
       <rect x="20" y="228" width="${W - 40}" height="10" rx="5" fill="#ffffff" fill-opacity="0.06"/>
       <rect x="20" y="228" width="${(ratio * (W - 40)).toFixed(1)}" height="10" rx="5" fill="url(#accent)" fill-opacity="0.85"/>
       <text x="20" y="286" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.35">// live from quentinb.dev/api/stats · refreshed 5m</text>`;
      })()
    : `<text x="20" y="58" font-family="${SVG_FONT}" font-size="13" fill="${SVG_CYAN}">$</text>
       <text x="34" y="58" font-family="${SVG_FONT}" font-size="13" fill="#ffffff" opacity="0.9">./streak.sh --live</text>
       <text x="20" y="110" font-family="${SVG_FONT}" font-size="15" fill="#ffffff" opacity="0.8">streak temporarily unavailable</text>
       <text x="20" y="134" font-family="${SVG_FONT}" font-size="12" fill="${SVG_MAUVE}">// needs GITHUB_TOKEN to read contribution data</text>
       <text x="20" y="286" font-family="${SVG_FONT}" font-size="10" fill="#ffffff" opacity="0.35">// live from quentinb.dev/api/stats · refreshed 5m</text>`;

  return svgResponse(svgDocument(W, H, "~/streak.sh — bash — tty1", body));
}
