import { fetchGitHubLanguageBytes } from "@/lib/github-stats";
import { languagesCardContent, visibleLanguages } from "@/lib/stats-cards";
import { svgCardResponse } from "@/lib/svg-card";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_USERNAME = process.env.GITHUB_USERNAME ?? "Implycitt";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") ?? DEFAULT_USERNAME;
  const languages = visibleLanguages(await fetchGitHubLanguageBytes(username));

  return svgCardResponse(languagesCardContent(languages, username));
}
