import type { GitHubContribution } from "@/lib/github-contributions";
import type { GitHubRepoData } from "@/lib/github-repos";

export function orderReposByCommits(repos: GitHubRepoData[]): GitHubRepoData[] {
  return [...repos].sort(
    (a, b) =>
      (b.commitCount ?? 0) - (a.commitCount ?? 0) ||
      new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime(),
  );
}

export function sortContributionsByStars(
  contributions: GitHubContribution[],
): GitHubContribution[] {
  return [...contributions].sort(
    (a, b) =>
      b.repo.stargazers_count - a.repo.stargazers_count ||
      b.commits - a.commits,
  );
}
