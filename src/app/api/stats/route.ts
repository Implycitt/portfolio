import { NextResponse } from "next/server";
import { fetchGitHubStats } from "@/lib/github-stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const stats = await fetchGitHubStats();

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
