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

export async function fetchGitHubRepos(
  username: string,
  exclusions: string[] = []
): Promise<GitHubRepoData[] | null> {
  const repos = await fetchJson<GitHubRepoData[]>(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed&type=owner`
  );
  if (!repos) return null;

  const exclude = new Set(exclusions.map((n) => n.toLowerCase()));

  return repos
    .filter(
      (repo) =>
        !repo.fork &&
        !repo.archived &&
        !exclude.has(repo.name.toLowerCase())
    )
    .sort(
      (a, b) =>
        new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
    );
}

export async function fetchGitHubRepoDetail(
  owner: string,
  repoName: string
): Promise<GitHubRepoDetail | null> {
  const [repo, readme, languages] = await Promise.all([
    fetchJson<GitHubRepoData>(
      `https://api.github.com/repos/${owner}/${repoName}`
    ),
    fetchReadme(owner, repoName),
    fetchJson<Record<string, number>>(
      `https://api.github.com/repos/${owner}/${repoName}/languages`
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
  username: string
): Promise<GitHubContribution | null> {
  const repo = await fetchJson<GitHubRepoData>(
    `https://api.github.com/repos/${owner}/${repoName}`
  );
  if (!repo) return null;
  const counts = await fetchContributorCounts(`${owner}/${repoName}`, username);
  if (!counts) return null;
  return {
    repo,
    commits: counts.commits,
    totalContributors: counts.totalContributors,
    role: contributionRole(counts.commits, counts.totalContributors),
  };
}

async function fetchReadme(
  owner: string,
  repoName: string
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
      }
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
}

// Orgs the public memberships API doesn't surface (private membership).
// Merged with whatever /users/{username}/orgs actually returns, so new
// public memberships show up automatically.
const KNOWN_ORGS = ["Google-Developers-Student-Club-LSU", "SASELSU"];

function orgRank(login: string): number {
  const idx = KNOWN_ORGS.indexOf(login);
  return idx === -1 ? 1000 : idx;
}

export function sortOrgs(orgs: GitHubOrgData[]): GitHubOrgData[] {
  return [...orgs].sort((a, b) => {
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
  logins: string[]
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
      } as GitHubOrgData;
    })
  );

  return profiles.filter((p): p is GitHubOrgData => p !== null);
}

export async function fetchGitHubOrgs(
  username: string
): Promise<GitHubOrgData[] | null> {
  // With a token, /user/orgs returns ALL memberships (including private
  // orgs). Without one, only public memberships are visible, so fall back
  // to the curated KNOWN_ORGS list.
  const orgsUrl = TOKEN
    ? "https://api.github.com/user/orgs?per_page=100"
    : `https://api.github.com/users/${username}/orgs`;
  const apiOrgs = await fetchJson<{ login: string }[]>(orgsUrl);

  const logins = new Set<string>(KNOWN_ORGS);
  for (const o of apiOrgs ?? []) {
    if (o?.login) logins.add(o.login);
  }

  const orgs = await fetchOrgProfiles([...logins]);
  if (orgs.length === 0) return null;
  return sortOrgs(orgs);
}

export interface GitHubContribution {
  repo: GitHubRepoData;
  commits: number;
  totalContributors: number;
  role: "sole-author" | "lead" | "contributor";
}

function contributionRole(
  commits: number,
  totalContributors: number
): GitHubContribution["role"] {
  if (totalContributors <= 1) return "sole-author";
  if (commits >= Math.ceil(totalContributors / 2)) return "lead";
  return "contributor";
}

// Search commits authored by the user, returning the repos they touch.
// Catches contributions on default branches. Used per-org so results are
// never crowded out by other repos in the global ranking.
async function searchCommitRepos(query: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://api.github.com/search/commits?q=${encodeURIComponent(
        query
      )}&per_page=100`,
      {
        headers: {
          ...githubHeaders(),
          Accept: "application/vnd.github+json",
        },
        next: { revalidate: 3600 },
      }
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

async function fetchContributorCounts(
  fullName: string,
  username: string
): Promise<{ commits: number; totalContributors: number } | null> {
  const data = await fetchJson<
    { login: string; contributions: number }[] | null
  >(`https://api.github.com/repos/${fullName}/contributors?per_page=100&anon=0`);
  if (!Array.isArray(data)) return null;
  const me = data.find((c) => c?.login === username);
  if (!me) return null;
  return { commits: me.contributions, totalContributors: data.length };
}

export interface GitHubContributionsData {
  contributions: GitHubContribution[] | null;
  orgs: GitHubOrgData[] | null;
}

// Auto-discover repos the user contributed to outside their own account:
// 1. Commit searches (global + per org) surface repos on default branches.
// 2. User-account orgs (like SASELSU) get their repos scanned and verified
//    against each repo's contributors list.
// Every candidate gets repo data + contributor counts fetched, which gives
// the commit count and role for the badge and drops anything unverifiable.
// The owners of discovered repos are folded into the org list so the
// organizations section grows on its own.
export async function fetchGitHubContributions(
  username: string
): Promise<GitHubContributionsData> {
  const orgs = await fetchGitHubOrgs(username);
  const candidates = new Map<string, boolean>();
  const addCandidate = (full: string, verified: boolean) => {
    if (!full.includes("/")) return;
    const [owner, name] = full.split("/");
    if (owner.toLowerCase() === username.toLowerCase()) return;
    if (name === ".github") return;
    candidates.set(full, candidates.get(full) || verified);
  };

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

  // User-account orgs can't be queried with `org:`, so scan their repos.
  for (const org of orgs ?? []) {
    if (org.type === "Organization") continue;
    const repos = await fetchJson<GitHubRepoData[]>(
      `https://api.github.com/users/${org.login}/repos?per_page=100`
    );
    for (const r of repos ?? []) {
      if (r.fork) continue;
      addCandidate(r.full_name, false);
    }
  }

  const results = await Promise.all(
    [...candidates.entries()].map(async ([fullName, verified]) => {
      const [repo, counts] = await Promise.all([
        fetchJson<GitHubRepoData>(`https://api.github.com/repos/${fullName}`),
        fetchContributorCounts(fullName, username),
      ]);
      if (!repo) return null;
      if (!verified && !counts) return null;
      return {
        repo,
        commits: counts?.commits ?? 0,
        totalContributors: counts?.totalContributors ?? 0,
        role: counts
          ? contributionRole(counts.commits, counts.totalContributors)
          : "contributor",
      } as GitHubContribution;
    })
  );

  const list = results
    .filter((r): r is GitHubContribution => r !== null)
    .sort(
      (a, b) =>
        new Date(b.repo.pushed_at).getTime() -
        new Date(a.repo.pushed_at).getTime()
    );

  // Fold newly discovered repo owners into the org list.
  const knownLogins = new Set((orgs ?? []).map((o) => o.login));
  const extraLogins = [
    ...new Set(
      list.map((c) => c.repo.full_name.split("/")[0]).filter(Boolean)
    ),
  ].filter((l) => !knownLogins.has(l));
  const allOrgs = sortOrgs([
    ...(orgs ?? []),
    ...(extraLogins.length > 0 ? await fetchOrgProfiles(extraLogins) : []),
  ]);

  return {
    contributions: list.length === 0 ? null : list,
    orgs: allOrgs.length === 0 ? null : allOrgs,
  };
}