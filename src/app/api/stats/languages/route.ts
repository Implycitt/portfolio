import { fetchGitHubLanguageBytes } from "@/lib/github-stats";
import { languagesCardContent, visibleLanguages } from "@/lib/stats-cards";
import { svgCardResponse } from "@/lib/svg-card";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const languages = visibleLanguages(await fetchGitHubLanguageBytes());

  return svgCardResponse(languagesCardContent(languages));
}
