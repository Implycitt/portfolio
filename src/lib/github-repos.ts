import {
  fetchGraphQL,
  fetchJson,
  githubHeaders,
  tokenOwnsUser,
} from "@/lib/github-client";

export interface GitHubRepoData {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  languages_url: string;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  default_branch: string;

  commitCount?: number;
  license: { spdx_id: string; name: string } | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  size: number;
}

export interface GitHubRepoDetail extends GitHubRepoData {
  readme: string | null;
  languages: Record<string, number>;
}

export async function fetchGitHubRepos(
  username: string,
  exclusions: string[] = [],
): Promise<GitHubRepoData[] | null> {
  const repos = await fetchJson<GitHubRepoData[]>(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed&type=owner`,
  );
  if (!repos) return null;

  const exclude = new Set(exclusions.map((n) => n.toLowerCase()));
  const filtered = repos.filter(
    (repo) =>
      !repo.fork && !repo.archived && !exclude.has(repo.name.toLowerCase()),
  );

  const commitCounts = await fetchOwnRepoCommitCounts(username);
  return filtered.map((repo) => {
    const commitCount = commitCounts?.get(repo.name.toLowerCase());
    return commitCount === undefined ? repo : { ...repo, commitCount };
  });
}

export async function fetchGitHubRepoDetail(
  owner: string,
  repoName: string,
): Promise<GitHubRepoDetail | null> {
  const [repo, readme, languages] = await Promise.all([
    fetchJson<GitHubRepoData>(
      `https://api.github.com/repos/${owner}/${repoName}`,
    ),
    fetchReadme(owner, repoName),
    fetchJson<Record<string, number>>(
      `https://api.github.com/repos/${owner}/${repoName}/languages`,
    ),
  ]);

  if (!repo) return null;

  return {
    ...repo,
    readme,
    languages: languages ?? {},
  };
}

async function fetchReadme(
  owner: string,
  repoName: string,
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/readme`,
      {
        headers: {
          ...githubHeaders(),
          Accept: "application/vnd.github.raw+json",
        },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchOwnRepoCommitCounts(
  username: string,
): Promise<Map<string, number> | null> {
  if (!(await tokenOwnsUser(username))) return null;

  const data = await fetchGraphQL<{
    user?: {
      repositories?: {
        nodes?: ({
          name?: string;
          defaultBranchRef?: {
            target?: { history?: { totalCount?: number } | null } | null;
          } | null;
        } | null)[];
      } | null;
    } | null;
  }>(
    `query ($login: String!) {
      user(login: $login) {
        repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: PUSHED_AT, direction: DESC}) {
          nodes {
            name
            defaultBranchRef {
              target {
                ... on Commit { history { totalCount } }
              }
            }
          }
        }
      }
    }`,
    { login: username },
  );

  const nodes = data?.user?.repositories?.nodes ?? [];
  const counts = new Map<string, number>();
  for (const node of nodes) {
    if (!node?.name) continue;
    const total = node.defaultBranchRef?.target?.history?.totalCount;
    if (typeof total === "number") counts.set(node.name.toLowerCase(), total);
  }
  return counts.size === 0 ? null : counts;
}
