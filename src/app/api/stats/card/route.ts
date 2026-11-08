import { fetchGitHubStats } from "@/lib/github-stats";
import { statsCardContent } from "@/lib/stats-cards";
import { svgCardResponse } from "@/lib/svg-card";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return svgCardResponse(statsCardContent(await fetchGitHubStats()));
}
