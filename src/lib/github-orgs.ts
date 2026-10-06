import { fetchJson, hasToken } from "@/lib/github-client";

export interface GitHubOrgData {
  login: string;
  name: string;
  type: string;
  description: string | null;
  blog: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;

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
  const seen = new Set<string>();
  const unique = orgs.filter((org) => {
    const key = org.login.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.sort((a, b) => {
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
  const orgsUrl = hasToken()
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
