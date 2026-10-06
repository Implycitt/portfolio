import {
  fetchGitHubContributions,
  type GitHubContribution,
} from "@/lib/github-contributions";
import type { GitHubOrgData } from "@/lib/github-orgs";
import {
  orderReposByCommits,
  sortContributionsByStars,
} from "@/lib/github-ordering";
import { fetchGitHubRepos, type GitHubRepoData } from "@/lib/github-repos";

export interface ProjectsView {
  repos: GitHubRepoData[] | null;

  contributions: GitHubContribution[] | null;
  orgs: GitHubOrgData[] | null;
  counts: { repos: number; contributions: number; orgs: number };

  orgStats: Record<string, { commits: number; repos: number }>;
}

export async function buildProjectsView(
  username: string,
  exclusions: string[] = [],
): Promise<ProjectsView> {
  const [repoList, { contributions, orgs }] = await Promise.all([
    fetchGitHubRepos(username, exclusions),
    fetchGitHubContributions(username),
  ]);

  const ordered = sortContributionsByStars(contributions ?? []);

  const orgStats: Record<string, { commits: number; repos: number }> = {};
  for (const contribution of ordered) {
    const owner = contribution.repo.full_name.split("/")[0];
    const stats = (orgStats[owner] ??= { commits: 0, repos: 0 });
    stats.commits += contribution.commits;
    stats.repos += 1;
  }

  return {
    repos: repoList === null ? null : orderReposByCommits(repoList),
    contributions: contributions === null ? null : ordered,
    orgs,
    counts: {
      repos: repoList?.length ?? 0,
      contributions: ordered.length,
      orgs: orgs?.length ?? 0,
    },
    orgStats,
  };
}
