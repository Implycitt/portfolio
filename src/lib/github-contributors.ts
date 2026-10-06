import {
  fetchJson,
  fetchWithHeaders,
  lastPageFromLink,
} from "@/lib/github-client";

export interface ContributorStats {
  commits: number | null;

  totalContributors: number;
}

export async function fetchContributorStats(
  fullName: string,
  username: string,
): Promise<ContributorStats | null> {
  const { data, link } = await fetchWithHeaders<
    { login: string; contributions: number }[]
  >(
    `https://api.github.com/repos/${fullName}/contributors?per_page=100&anon=0`,
  );
  if (!Array.isArray(data)) return null;

  const me = data.find((c) => c?.login === username);
  const lastPage = lastPageFromLink(link);

  let totalContributors = data.length;
  if (lastPage !== null && lastPage > 1) {
    const probe = await fetchWithHeaders<unknown[]>(
      `https://api.github.com/repos/${fullName}/contributors?per_page=1&anon=0`,
    );
    totalContributors = lastPageFromLink(probe.link) ?? lastPage * 100;
  }

  return { commits: me?.contributions ?? null, totalContributors };
}

const ACTIVITY_MONTHS = 12;

function activityWindowStart(now: Date): Date {
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() - (ACTIVITY_MONTHS - 1),
      1,
    ),
  );
}

export async function fetchCommitActivity(
  fullName: string,
  username: string,
): Promise<number[] | null> {
  const now = new Date();
  const commits = await fetchJson<
    { commit?: { author?: { date?: string } | null } | null }[]
  >(
    `https://api.github.com/repos/${fullName}/commits?author=${encodeURIComponent(
      username,
    )}&since=${activityWindowStart(now).toISOString()}&per_page=100`,
  );
  if (!Array.isArray(commits) || commits.length === 0) return null;

  const buckets = new Array<number>(ACTIVITY_MONTHS).fill(0);
  for (const entry of commits) {
    const date = entry.commit?.author?.date;
    if (!date) continue;
    const at = new Date(date);
    if (Number.isNaN(at.getTime())) continue;
    const monthsBack =
      (now.getUTCFullYear() - at.getUTCFullYear()) * 12 +
      (now.getUTCMonth() - at.getUTCMonth());
    const index = ACTIVITY_MONTHS - 1 - monthsBack;
    if (index >= 0 && index < ACTIVITY_MONTHS) buckets[index] += 1;
  }

  return buckets.some((count) => count > 0) ? buckets : null;
}
