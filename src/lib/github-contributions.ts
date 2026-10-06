import {
  fetchGraphQL,
  fetchJson,
  searchCommitCount,
  searchCommitRepos,
  tokenOwnsUser,
} from "@/lib/github-client";
import {
  fetchCommitActivity,
  fetchContributorStats,
} from "@/lib/github-contributors";
import {
  fetchGitHubOrgs,
  fetchOrgProfiles,
  sortOrgs,
  type GitHubOrgData,
} from "@/lib/github-orgs";
import type { GitHubRepoData } from "@/lib/github-repos";

export interface GitHubContribution {
  repo: GitHubRepoData;
  commits: number;
  totalContributors: number;
  role: "sole-author" | "lead" | "contributor";

  activity: number[] | null;
}

export const ROLE_LABELS: Record<string, string> = {
  "sole-author": "sole author",
  lead: "lead",
  contributor: "contributor",
};

function contributionRole(
  commits: number,
  totalContributors: number,
): GitHubContribution["role"] {
  if (totalContributors <= 1) return "sole-author";
  if (commits >= Math.ceil(totalContributors / 2)) return "lead";
  return "contributor";
}

export async function fetchGitHubContribution(
  owner: string,
  repoName: string,
  username: string,
): Promise<GitHubContribution | null> {
  const repo = await fetchJson<GitHubRepoData>(
    `https://api.github.com/repos/${owner}/${repoName}`,
  );
  if (!repo) return null;

  const stats = await fetchContributorStats(`${owner}/${repoName}`, username);
  const commits =
    stats?.commits ??
    (await searchCommitCount(`author:${username} repo:${owner}/${repoName}`));
  if (!commits) return null;

  const totalContributors = stats?.totalContributors ?? 0;
  return {
    repo,
    commits,
    totalContributors,
    role: contributionRole(commits, totalContributors),
    activity: null,
  };
}

async function fetchContributedReposGraphQL(
  username: string,
): Promise<Map<string, number> | null> {
  if (!(await tokenOwnsUser(username))) return null;

  const data = await fetchGraphQL<{
    user?: {
      contributionsCollection?: {
        commitContributionsByRepository?: {
          repository?: { nameWithOwner?: string } | null;
          contributions?: { totalCount?: number } | null;
        }[];
      } | null;
    } | null;
  }>(
    `query ($login: String!) {
      user(login: $login) {
        contributionsCollection {
          commitContributionsByRepository(maxRepositories: 100) {
            repository { nameWithOwner }
            contributions { totalCount }
          }
        }
      }
    }`,
    { login: username },
  );

  const repos =
    data?.user?.contributionsCollection?.commitContributionsByRepository ?? [];
  const map = new Map<string, number>();
  for (const entry of repos) {
    const full = entry.repository?.nameWithOwner;
    if (full) map.set(full, entry.contributions?.totalCount ?? 0);
  }
  return map.size === 0 ? null : map;
}

export interface GitHubContributionsData {
  contributions: GitHubContribution[] | null;
  orgs: GitHubOrgData[] | null;
}

export async function fetchGitHubContributions(
  username: string,
): Promise<GitHubContributionsData> {
  const [orgs, contributedRepos] = await Promise.all([
    fetchGitHubOrgs(username),
    fetchContributedReposGraphQL(username),
  ]);
  const candidates = new Map<string, boolean>();
  const commitCounts = new Map<string, number>();
  const addCandidate = (full: string, verified: boolean) => {
    if (!full.includes("/")) return;
    const [owner, name] = full.split("/");
    if (owner.toLowerCase() === username.toLowerCase()) return;
    if (name === ".github") return;
    candidates.set(full, candidates.get(full) || verified);
  };

  for (const [full, commits] of contributedRepos ?? []) {
    addCandidate(full, true);
    if (commits > 0) commitCounts.set(full, commits);
  }

  const searches = [searchCommitRepos(`author:${username}`)];
  for (const org of orgs ?? []) {
    if (org.type === "Organization") {
      searches.push(searchCommitRepos(`author:${username} org:${org.login}`));
    }
  }
  const searchResults = await Promise.all(searches);
  for (const names of searchResults) {
    for (const n of names) addCandidate(n, true);
  }

  for (const org of orgs ?? []) {
    if (org.type === "Organization") continue;
    const repos = await fetchJson<GitHubRepoData[]>(
      `https://api.github.com/users/${org.login}/repos?per_page=100`,
    );
    for (const r of repos ?? []) {
      if (r.fork) continue;
      addCandidate(r.full_name, false);
    }
  }

  const results = await Promise.all(
    [...candidates.entries()].map(async ([fullName, verified]) => {
      const [repo, stats, activity] = await Promise.all([
        fetchJson<GitHubRepoData>(`https://api.github.com/repos/${fullName}`),
        fetchContributorStats(fullName, username),
        fetchCommitActivity(fullName, username),
      ]);
      if (!repo) return null;
      if (!verified && stats?.commits == null) return null;
      return {
        repo,
        commits: stats?.commits ?? commitCounts.get(fullName) ?? 0,
        totalContributors: stats?.totalContributors ?? 0,
        role:
          stats?.commits != null
            ? contributionRole(stats.commits, stats.totalContributors)
            : "contributor",
        activity,
      } as GitHubContribution;
    }),
  );

  const byRepo = new Map<number, GitHubContribution>();
  for (const contribution of results) {
    if (!contribution) continue;
    const existing = byRepo.get(contribution.repo.id);
    if (!existing || contribution.commits > existing.commits) {
      byRepo.set(contribution.repo.id, contribution);
    }
  }

  const list = [...byRepo.values()].sort(
    (a, b) =>
      new Date(b.repo.pushed_at).getTime() -
      new Date(a.repo.pushed_at).getTime(),
  );

  const knownLogins = new Set((orgs ?? []).map((o) => o.login.toLowerCase()));
  const extraLogins = [
    ...new Set(list.map((c) => c.repo.full_name.split("/")[0]).filter(Boolean)),
  ].filter((l) => !knownLogins.has(l.toLowerCase()));
  const allOrgs = sortOrgs([
    ...(orgs ?? []),
    ...(extraLogins.length > 0
      ? await fetchOrgProfiles(extraLogins, new Set())
      : []),
  ]);

  return {
    contributions: list.length === 0 ? null : list,
    orgs: allOrgs.length === 0 ? null : allOrgs,
  };
}
