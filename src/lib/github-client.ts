const TOKEN = process.env.GITHUB_TOKEN;

export function hasToken(): boolean {
  return Boolean(TOKEN);
}

export function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "qb-portfolio-repos",
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  return headers;
}

export async function fetchJson<T>(url: string): Promise<T | null> {
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

export async function fetchWithHeaders<T>(
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

export function lastPageFromLink(link: string | null): number | null {
  if (!link) return null;
  const match = /[?&]page=(\d+)[^>]*>;\s*rel="last"/.exec(link);
  return match ? Number(match[1]) : null;
}

export async function searchCommitCount(query: string): Promise<number | null> {
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

export async function searchCommitRepos(query: string): Promise<string[]> {
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

export async function tokenOwnsUser(username: string): Promise<boolean> {
  if (!TOKEN) return false;
  const viewer = await fetchJson<{ login: string }>(
    "https://api.github.com/user",
  );
  if (!viewer?.login) return false;
  return viewer.login.toLowerCase() === username.toLowerCase();
}

export async function fetchGraphQL<T>(
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
    if (!res.ok) {
      console.warn(
        `[github] GraphQL request failed with ${res.status}; falling back to REST.`,
      );
      return null;
    }
    const body = (await res.json()) as { data?: T };
    return body.data ?? null;
  } catch (error) {
    console.warn(
      "[github] GraphQL request failed; falling back to REST.",
      error,
    );
    return null;
  }
}
