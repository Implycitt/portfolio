import { fetchGitHubContributionTotals } from "@/lib/github-stats";
import { contributionsCardContent } from "@/lib/stats-cards";
import { svgCardResponse } from "@/lib/svg-card";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return svgCardResponse(
    contributionsCardContent(await fetchGitHubContributionTotals()),
  );
}
