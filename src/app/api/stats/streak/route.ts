import { fetchGitHubStreak } from "@/lib/github-stats";
import { streakCardContent } from "@/lib/stats-cards";
import { svgCardResponse } from "@/lib/svg-card";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return svgCardResponse(streakCardContent(await fetchGitHubStreak()));
}
