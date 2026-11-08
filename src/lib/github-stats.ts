import { cached } from "@/lib/ttl-cache";

export interface GitHubStatsData {
  username: "Implycitt";
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
  username: "Implycitt";
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
  days: { count: number }[];
}

export interface GitHubContributionTotalsData {
  commits: number;
  repositories: number;
  pullRequests: number;
  issues: number;
  reviews: number;
  mergedPullRequests: number | null;
}

export interface GitHubMergedPullRequest {
  number: number;
  title: string;
  url: string;
  repository: string;
  mergedAt: string;
}

interface GitHubPRSearchItem {
  number: number;
  title: string;
  html_url: string;
  repository_url: string;
  pull_request?: {
    merged_at: string | null;
  };
}

interface GitHubPRSearchResponse {
  items?: GitHubPRSearchItem[];
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
        totalCommitContributions?: number;
        totalIssueContributions?: number;
        totalPullRequestContributions?: number;
        totalPullRequestReviewContributions?: number;
        totalRepositoryContributions?: number;
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

interface ContributionCalendar {
  totalContributions: number;
  days: number[];
  commits: number;
  issues: number;
  pullRequests: number;
  reviews: number;
  repositories: number;
}

const TOKEN = process.env.GITHUB_TOKEN;

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "portfolio",
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

async function githubGraphQL<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "portfolio",
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function fetchGitHubStats(): Promise<GitHubStatsData | null> {
  return cached(`stats:Implycitt`, () => loadGitHubStats());
}

async function loadGitHubStats(): Promise<GitHubStatsData | null> {
  const user = await fetchJson<GitHubUser>(
    `https://api.github.com/users/Implycitt`,
  );
  if (!user) return null;

  const repos = await fetchJson<GitHubRepo[]>(
    `https://api.github.com/users/Implycitt/repos?per_page=100&sort=updated`,
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
    username: "Implycitt",
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

export function fetchGitHubPullRequests(): Promise<number | null> {
  return cached(`merged-prs:Implycitt`, async () => {
    const data = await fetchJson<{ total_count?: number }>(
      `https://api.github.com/search/issues?q=author:${encodeURIComponent("Implycitt")}+type:pr+is:merged&per_page=1`,
    );
    if (!data) return null;
    return data.total_count ?? 0;
  });
}

export function fetchRecentMergedPRs(): Promise<GitHubMergedPullRequest[] | null> {
  return cached(`recent-merged-prs:Implycitt`, async () => {
    const data = await fetchJson<GitHubPRSearchResponse>(
      `https://api.github.com/search/issues?q=author:${encodeURIComponent("Implycitt")}+type:pr+is:merged+is:public&sort=updated&order=desc&per_page=6`
    );
    if (!data) return null;

    return (data.items ?? []).flatMap((item) => {
      const mergedAt = item.pull_request?.merged_at;
      if(!mergedAt) return [];

      return [
        {
          number: item.number,
          title: item.title,
          url: item.html_url,
          repository: item.repository_url.split("/repos/")[1] ?? "unknown",
          mergedAt
        }
      ];
    });
  });
}

interface LanguageRepositoriesPage {
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  nodes: {
    languages: { edges: { size: number; node: { name: string } }[] };
  }[];
}

interface LanguagesGraphQLResponse {
  data?: { user?: { repositories?: LanguageRepositoriesPage } };
}

const LANGUAGES_QUERY = `query($login: String!, $cursor: String) {
  user(login: $login) {
    repositories(first: 100, isFork: false, ownerAffiliations: OWNER, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        languages(first: 100, orderBy: { field: SIZE, direction: DESC }) {
          edges { size node { name } }
        }
      }
    }
  }
}`;

const MAX_LANGUAGE_PAGES = 10;

export function fetchGitHubLanguageBytes(): Promise<GitHubLanguageData[] | null> {
  return cached(`languages:Implycitt`, () =>
    loadGitHubLanguageBytes(),
  );
}

async function loadGitHubLanguageBytes(): Promise<GitHubLanguageData[] | null> {
  if (!process.env.GITHUB_TOKEN) return loadLanguageBytesRest();

  const totals: Record<string, number> = {};
  let cursor: string | null = null;

  for (let page = 0; page < MAX_LANGUAGE_PAGES; page++) {
    const json: LanguagesGraphQLResponse | null =
      await githubGraphQL<LanguagesGraphQLResponse>(LANGUAGES_QUERY, {
        login: "Implycitt",
        cursor,
      });
    const repositories: LanguageRepositoriesPage | undefined =
      json?.data?.user?.repositories;
    if (!repositories) return null;

    for (const repo of repositories.nodes) {
      for (const edge of repo.languages?.edges ?? []) {
        totals[edge.node.name] = (totals[edge.node.name] ?? 0) + edge.size;
      }
    }

    if (!repositories.pageInfo.hasNextPage) break;
    cursor = repositories.pageInfo.endCursor;
  }

  return sortLanguages(totals);
}

function sortLanguages(totals: Record<string, number>): GitHubLanguageData[] {
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, bytes]) => ({ name, bytes }));
}

async function loadLanguageBytesRest(): Promise<GitHubLanguageData[] | null> {
  const repos = await fetchJson<GitHubRepo[]>(
    `https://api.github.com/users/Implycitt/repos?per_page=100&sort=updated`,
  );
  if (!repos) return null;

  const owned = repos.filter((repo) => !repo.fork);
  const results = await Promise.allSettled(
    owned.map((repo) =>
      fetch(`https://api.github.com/repos/Implycitt/${repo.name}/languages`, {
        headers: githubHeaders(),
        next: { revalidate: 3600 },
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

  return sortLanguages(totals);
}

function fetchContributionCalendar(): Promise<ContributionCalendar | null> {
  return cached(`contributions:Implycitt`, () =>
    requestContributionCalendar(),
  );
}

async function requestContributionCalendar(): Promise<ContributionCalendar | null> {
  const query = `query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        totalRepositoryContributions
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

  const json = await githubGraphQL<GraphQLResponse>(query, { login: "Implycitt" });
  const collection = json?.data?.user?.contributionsCollection;
  const calendar = collection?.contributionCalendar;
  if (!collection || !calendar) return null;

  const days = calendar.weeks.flatMap((week) =>
    week.contributionDays.map((day) => day.contributionCount),
  );

  return {
    totalContributions: calendar.totalContributions ?? 0,
    days,
    commits: collection.totalCommitContributions ?? 0,
    issues: collection.totalIssueContributions ?? 0,
    pullRequests: collection.totalPullRequestContributions ?? 0,
    reviews: collection.totalPullRequestReviewContributions ?? 0,
    repositories: collection.totalRepositoryContributions ?? 0,
  };
}

function streaksFrom(days: number[]): {
  currentStreak: number;
  longestStreak: number;
} {
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

  return { currentStreak, longestStreak };
}

export async function fetchGitHubStreak(): Promise<GitHubStreakData | null> {
  const calendar = await fetchContributionCalendar();
  if (!calendar) return null;

  return {
    username: "Implycitt",
    ...streaksFrom(calendar.days),
    totalContributions: calendar.totalContributions,
    days: calendar.days.map((count) => ({ count })),
  };
}

export async function fetchGitHubContributionTotals(): Promise<GitHubContributionTotalsData | null> {
  const calendar = await fetchContributionCalendar();
  if (!calendar) return null;

  return {
    commits: calendar.commits,
    repositories: calendar.repositories,
    pullRequests: calendar.pullRequests,
    issues: calendar.issues,
    reviews: calendar.reviews,
    mergedPullRequests: await fetchGitHubPullRequests(),
  };
}
