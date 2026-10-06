const TOKEN = process.env.GITHUB_TOKEN;

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "qb-portfolio-repos",
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  return headers;
}

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
  /** Total commits on the default branch, when we could read them. */
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

async function fetchWithHeaders<T>(
  url: string,
): Promise<{ data: T | null; link: string | null }> {
  try {
    const res = await fetch(url, {
      headers: githubHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { data: null, link: null };
    return { data: (await res.json()) as T, link: res.headers.get("link") };
  } catch {
    return { data: null, link: null };
  }
}

/** GitHub paginates the contributor list, so `rel="last"` carries the real total. */
function lastPageFromLink(link: string | null): number | null {
  if (!link) return null;
  const match = /[?&]page=(\d+)[^>]*>;\s*rel="last"/.exec(link);
  return match ? Number(match[1]) : null;
}

/** Commit count fallback for repos whose contributor list doesn't reach the user. */
async function searchCommitCount(query: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.github.com/search/commits?q=${encodeURIComponent(
        query,
      )}&per_page=1`,
      { headers: githubHeaders(), next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { total_count?: number };
    return typeof data.total_count === "number" ? data.total_count : null;
  } catch {
    return null;
  }
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

  // Most commits first; recency only breaks ties. Falls back to pure recency
  // when commit counts aren't available (no token, or someone else's account).
  const commitCounts = await fetchOwnRepoCommitCounts(username);
  return filtered
    .map((repo) => {
      const commitCount = commitCounts?.get(repo.name.toLowerCase());
      return commitCount === undefined ? repo : { ...repo, commitCount };
    })
    .sort(
      (a, b) =>
        (b.commitCount ?? 0) - (a.commitCount ?? 0) ||
        new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime(),
    );
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

export interface GitHubOrgData {
  login: string;
  name: string;
  type: string;
  description: string | null;
  blog: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  /** True when the user belongs to it, false when they only committed there. */
  member: boolean;
}

const KNOWN_ORGS = ["GDSCLSU", "SASELSU"];

function orgRank(login: string): number {
  const idx = KNOWN_ORGS.findIndex(
    (known) => known.toLowerCase() === login.toLowerCase(),
  );
  return idx === -1 ? 1000 : idx;
}

export function sortOrgs(orgs: GitHubOrgData[]): GitHubOrgData[] {
  // Renamed accounts can surface twice (once under the old login, which still
  // resolves), so keep only the first entry per canonical login.
  const seen = new Set<string>();
  const unique = orgs.filter((org) => {
    const key = org.login.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.sort((a, b) => {
    // Real memberships lead; orgs only contributed to follow.
    if (a.member !== b.member) return a.member ? -1 : 1;
    const ar = orgRank(a.login);
    const br = orgRank(b.login);
    if (ar !== br) return ar - br;
    const at = a.type === "Organization" ? 0 : 1;
    const bt = b.type === "Organization" ? 0 : 1;
    if (at !== bt) return at - bt;
    return a.login.localeCompare(b.login);
  });
}

export async function fetchOrgProfiles(
  logins: string[],
  memberLogins: Set<string>,
): Promise<GitHubOrgData[]> {
  const profiles = await Promise.all(
    logins.map(async (login) => {
      const p = await fetchJson<{
        login: string;
        name: string | null;
        type: string;
        description: string | null;
        bio: string | null;
        blog: string | null;
        avatar_url: string;
        html_url: string;
        public_repos: number;
      }>(`https://api.github.com/users/${login}`);
      if (!p) return null;
      return {
        login: p.login,
        name: p.name ?? p.login,
        type: p.type,
        description: p.description ?? p.bio ?? null,
        blog: p.blog || null,
        avatar_url: p.avatar_url,
        html_url: p.html_url,
        public_repos: p.public_repos ?? 0,
        member: memberLogins.has(p.login.toLowerCase()),
      } as GitHubOrgData;
    }),
  );

  return profiles.filter((p): p is GitHubOrgData => p !== null);
}

export async function fetchGitHubOrgs(
  username: string,
): Promise<GitHubOrgData[] | null> {
  const orgsUrl = TOKEN
    ? "https://api.github.com/user/orgs?per_page=100"
    : `https://api.github.com/users/${username}/orgs`;
  const apiOrgs = await fetchJson<{ login: string }[]>(orgsUrl);

  const logins = new Set<string>(KNOWN_ORGS);
  const memberLogins = new Set<string>(
    KNOWN_ORGS.map((login) => login.toLowerCase()),
  );
  for (const o of apiOrgs ?? []) {
    if (o?.login) {
      logins.add(o.login);
      memberLogins.add(o.login.toLowerCase());
    }
  }

  const orgs = await fetchOrgProfiles([...logins], memberLogins);
  if (orgs.length === 0) return null;
  return sortOrgs(orgs);
}

export interface GitHubContribution {
  repo: GitHubRepoData;
  commits: number;
  totalContributors: number;
  role: "sole-author" | "lead" | "contributor";
  /** Monthly commit buckets for the last year, oldest first. */
  activity: number[] | null;
}

/**
 * Most-starred first — contributed repos belong to other people, so reach is the
 * headline. Commit count settles ties, which matters because starless repos are
 * the common case.
 */
export function sortContributionsByStars(
  contributions: GitHubContribution[],
): GitHubContribution[] {
  return [...contributions].sort(
    (a, b) =>
      b.repo.stargazers_count - a.repo.stargazers_count ||
      b.commits - a.commits,
  );
}

function contributionRole(
  commits: number,
  totalContributors: number,
): GitHubContribution["role"] {
  if (totalContributors <= 1) return "sole-author";
  if (commits >= Math.ceil(totalContributors / 2)) return "lead";
  return "contributor";
}

async function searchCommitRepos(query: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://api.github.com/search/commits?q=${encodeURIComponent(
        query,
      )}&per_page=100`,
      {
        headers: {
          ...githubHeaders(),
          Accept: "application/vnd.github+json",
        },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      items?: { repository?: { full_name?: string } }[];
    };
    const names = new Set<string>();
    for (const item of data.items ?? []) {
      const full = item.repository?.full_name;
      if (full) names.add(full);
    }
    return [...names];
  } catch {
    return [];
  }
}

/**
 * The commit search API only samples the first page of results (100 commits),
 * and those are heavily clustered by repo — so a repo with a single commit easily
 * falls outside the window. GitHub's GraphQL `contributionsCollection` instead
 * returns every repo the user committed to (with per-repo counts) in one request.
 * It is only available for the authenticated user, so we gate on the token owning
 * the requested username and fall back to commit search otherwise.
 */
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

/** GraphQL bodies are only readable for the token's own account. */
async function tokenOwnsUser(username: string): Promise<boolean> {
  if (!TOKEN) return false;
  const viewer = await fetchJson<{ login: string }>(
    "https://api.github.com/user",
  );
  if (!viewer?.login) return false;
  return viewer.login.toLowerCase() === username.toLowerCase();
}

async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T | null> {
  if (!TOKEN) return null;
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { ...githubHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: T };
    return body.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Total commits on each owned repo's default branch, in a single request — the
 * REST equivalent would be one paginated call per repository.
 */
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

export interface ContributorStats {
  /** Null when the user isn't among the first page of contributors. */
  commits: number | null;
  /** True contributor total, read past the first page rather than capped at 100. */
  totalContributors: number;
}

async function fetchContributorStats(
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
    // A 100-item page only reveals the last page *number*, so ask for one item
    // per page — there `rel="last"` is the contributor count itself.
    const probe = await fetchWithHeaders<unknown[]>(
      `https://api.github.com/repos/${fullName}/contributors?per_page=1&anon=0`,
    );
    totalContributors = lastPageFromLink(probe.link) ?? lastPage * 100;
  }

  return { commits: me?.contributions ?? null, totalContributors };
}

const ACTIVITY_MONTHS = 12;

/** First day of the earliest month shown, so whole months are counted. */
function activityWindowStart(now: Date): Date {
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() - (ACTIVITY_MONTHS - 1),
      1,
    ),
  );
}

/**
 * Monthly commit buckets for the last year, oldest first. Capped at the 100 most
 * recent matching commits, so it reads as recent activity rather than a complete
 * history.
 */
async function fetchCommitActivity(
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

  // Authoritative discovery: every repo the user has committed to recently.
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

  // A repo can be reached through both its current and a former owner name
  // (GitHub search keeps stale names, and /repos/<old-owner>/<repo> redirects
  // to the canonical repo), so collapse duplicates by repo identity.
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
