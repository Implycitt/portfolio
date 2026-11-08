const GITHUB_USERNAME = "Implycitt";

export interface Project {
  id: number;
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  pushedAt: string;
}

interface GithubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
}

export async function getProjects(): Promise<Project[]> {
  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=pushed&direction=desc`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-Github-Api-Version": "2022-11-28",
          "User-Agent": "portfolio",
          ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : [])
        },
        next: { revalidate: 3600 }
      }
    );

    if (!response.ok) return [];

    const repos = (await response.json()) as GithubRepo[];

    return repos.filter((repo) => !repo.fork && repo.name.toLowerCase() !== GITHUB_USERNAME.toLowerCase())
      .sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at))
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        pushedAt: repo.pushed_at
      }));
  } catch {
    return [];
  }
}