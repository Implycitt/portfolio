import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_USERNAME = process.env.GITHUB_USERNAME ?? "Implycitt";
const TOKEN = process.env.GITHUB_TOKEN;

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "qb-portfolio-stats",
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  return headers;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: githubHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
}

interface GitHubRepo {
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string | null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") ?? DEFAULT_USERNAME;

  const user = await fetchJson<GitHubUser>(
    `https://api.github.com/users/${username}`
  );

  if (!user) {
    return NextResponse.json(
      { error: "GitHub user not found or API rate limited" },
      { status: 502 }
    );
  }

  const repos = await fetchJson<GitHubRepo[]>(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`
  );

  const emptyRepos = repos ?? [];
  const totalStars = emptyRepos.reduce((s, r) => s + (r.stargazers_count ?? 0), 0);
  const totalForks = emptyRepos.reduce((s, r) => s + (r.forks_count ?? 0), 0);
  const totalWatchers = emptyRepos.reduce((s, r) => s + (r.watchers_count ?? 0), 0);

  const languageCounts: Record<string, number> = {};
  for (const repo of emptyRepos) {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] ?? 0) + 1;
    }
  }
  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  return NextResponse.json(
    {
      username: user.login,
      name: user.name ?? user.login,
      avatar_url: user.avatar_url,
      profile_url: user.html_url,
      followers: user.followers ?? 0,
      following: user.following ?? 0,
      public_repos: user.public_repos ?? emptyRepos.length,
      total_stars: totalStars,
      total_forks: totalForks,
      total_watchers: totalWatchers,
      top_languages: topLanguages,
      updated_at: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "X-Robots-Tag": "noindex, nofollow",
      },
    }
  );
}
