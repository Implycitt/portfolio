import { NextResponse } from "next/server";
import { fetchGitHubStats } from "@/lib/github-stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_USERNAME = process.env.GITHUB_USERNAME ?? "Implycitt";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") ?? DEFAULT_USERNAME;

  const stats = await fetchGitHubStats(username);

  if (!stats) {
    return NextResponse.json(
      { error: "GitHub user not found or API rate limited" },
      { status: 502 },
    );
  }

  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
