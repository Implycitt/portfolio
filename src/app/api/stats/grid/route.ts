import {
  fetchGitHubContributionTotals,
  fetchGitHubLanguageBytes,
  fetchGitHubStats,
  fetchGitHubStreak,
} from "@/lib/github-stats";
import {
  contributionsCardContent,
  languagesCardContent,
  statsCardContent,
  streakCardContent,
  visibleLanguages,
} from "@/lib/stats-cards";
import { cached } from "@/lib/ttl-cache";
import { svgGrid, svgResponse } from "@/lib/svg-card";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const svg = await cached(`grid-svg:Implycitt`, async () => {
    const [stats, streak, languageBytes, totals] = await Promise.all([
      fetchGitHubStats(),
      fetchGitHubStreak(),
      fetchGitHubLanguageBytes(),
      fetchGitHubContributionTotals(),
    ]);

    return svgGrid([
      statsCardContent(stats),
      streakCardContent(streak),
      languagesCardContent(visibleLanguages(languageBytes)),
      contributionsCardContent(totals),
    ]);
  });

  return svgResponse(svg);
}
