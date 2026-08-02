export interface GitHubStatsData {
  username: string;
  name: string;
  avatar_url: string;
  profile_url: string;
  followers: number;
  following: number;
  public_repos: number;
  total_stars: number;
  total_forks: number;
  total_watchers: number;
  top_languages: { name: string; count: number }[];
  updated_at: string;
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

export async function fetchGitHubStats(
  username: string
): Promise<GitHubStatsData | null> {
  const user = await fetchJson<GitHubUser>(`https://api.github.com/users/${username}`);
  if (!user) return null;

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

  return {
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
  };
}
