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

export interface GitHubLanguageData {
  name: string;
  bytes: number;
}

export interface GitHubStreakData {
  username: string;
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
  days: { count: number }[];
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
  name: string;
  description: string | null;
  html_url: string;
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string | null;
}

interface GraphQLResponse {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions?: number;
          weeks: {
            contributionDays: { date: string; contributionCount: number }[];
          }[];
        };
      };
    };
  };
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
  username: string,
): Promise<GitHubStatsData | null> {
  const user = await fetchJson<GitHubUser>(
    `https://api.github.com/users/${username}`,
  );
  if (!user) return null;

  const repos = await fetchJson<GitHubRepo[]>(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
  );

  const emptyRepos = repos ?? [];
  const totalStars = emptyRepos.reduce(
    (s, r) => s + (r.stargazers_count ?? 0),
    0,
  );
  const totalForks = emptyRepos.reduce((s, r) => s + (r.forks_count ?? 0), 0);
  const totalWatchers = emptyRepos.reduce(
    (s, r) => s + (r.watchers_count ?? 0),
    0,
  );

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

export async function fetchGitHubPullRequests(
  username: string,
): Promise<number | null> {
  const data = await fetchJson<{ total_count?: number }>(
    `https://api.github.com/search/issues?q=author:${encodeURIComponent(username)}+type:pr+is:merged&per_page=1`,
  );
  if (!data) return null;
  return data.total_count ?? 0;
}

export async function fetchGitHubLanguageBytes(
  username: string,
): Promise<GitHubLanguageData[] | null> {
  const repos = await fetchJson<GitHubRepo[]>(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
  );
  if (!repos) return null;

  const owned = repos.filter((repo) => !repo.fork);
  const results = await Promise.allSettled(
    owned.map((repo) =>
      fetch(`https://api.github.com/repos/${username}/${repo.name}/languages`, {
        headers: githubHeaders(),
      }).then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as Record<string, number>;
      }),
    ),
  );

  const totals: Record<string, number> = {};
  for (const result of results) {
    if (result.status !== "fulfilled" || !result.value) continue;
    for (const [language, bytes] of Object.entries(result.value)) {
      totals[language] = (totals[language] ?? 0) + bytes;
    }
  }

  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, bytes]) => ({ name, bytes }));
}

export async function fetchGitHubStreak(
  username: string,
): Promise<GitHubStreakData | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const query = `query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }`;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "qb-portfolio-stats",
      },
      body: JSON.stringify({ query, variables: { login: username } }),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as GraphQLResponse;
    const calendar =
      json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) return null;

    const days = calendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => day.contributionCount),
    );

    let idx = days.length - 1;
    if (idx >= 0 && days[idx] === 0) idx -= 1;
    let currentStreak = 0;
    while (idx >= 0 && days[idx] > 0) {
      currentStreak++;
      idx--;
    }

    let longestStreak = 0;
    let run = 0;
    for (const count of days) {
      if (count > 0) {
        run++;
        if (run > longestStreak) longestStreak = run;
      } else {
        run = 0;
      }
    }

    return {
      username,
      currentStreak,
      longestStreak,
      totalContributions: calendar.totalContributions ?? 0,
      days: days.map((count) => ({ count })),
    };
  } catch {
    return null;
  }
}
