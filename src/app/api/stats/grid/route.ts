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

const DEFAULT_USERNAME = process.env.GITHUB_USERNAME ?? "Implycitt";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") ?? DEFAULT_USERNAME;

  const svg = await cached(`grid-svg:${username}`, async () => {
    const [stats, streak, languageBytes, totals] = await Promise.all([
      fetchGitHubStats(username),
      fetchGitHubStreak(username),
      fetchGitHubLanguageBytes(username),
      fetchGitHubContributionTotals(username),
    ]);

    return svgGrid([
      statsCardContent(stats),
      streakCardContent(streak),
      languagesCardContent(visibleLanguages(languageBytes), username),
      contributionsCardContent(totals),
    ]);
  });

  return svgResponse(svg);
}
