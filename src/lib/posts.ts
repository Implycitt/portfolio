import { promises as fs } from "fs";
import path from "path";

export interface PostMeta {
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  category: string;
}

export interface Post extends PostMeta {
  slug: string;
  readMinutes: string;
  content: string;
}

const REVALIDATE = 60;

function normalizeRepo(repo: string | undefined): string | undefined {
  if (!repo) return repo;
  const trimmed = repo.trim().replace(/\/+$/, "");
  const match = trimmed.match(/(?:github\.com\/)?([^/]+\/[^/]+?)(?:\.git)?$/);
  return match ? match[1] : trimmed;
}

const BLOG_REPO = normalizeRepo(process.env.BLOG_REPO);
const BLOG_PATH = (process.env.BLOG_PATH ?? "posts").replace(/^\/+|\/+$/g, "");
const BLOG_BRANCH = process.env.BLOG_BRANCH ?? "main";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export const blogSource:
  | { type: "github"; repo: string; path: string; branch: string }
  | {
      type: "local";
      label: string;
    } = BLOG_REPO
  ? {
      type: "github",
      repo: BLOG_REPO,
      path: BLOG_PATH,
      branch: BLOG_BRANCH,
    }
  : { type: "local", label: "content/blog/ (local)" };

const LOCAL_DIR = path.join(process.cwd(), "content", "blog");
const WORDS_PER_MINUTE = 220;

export function formatDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${m}.${d}.${y}`;
}

interface Frontmatter {
  title?: string;
  date?: string;
  tag?: string;
  excerpt?: string;
}

function parseFrontmatter(raw: string): { data: Frontmatter; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };

  const data: Frontmatter = {};
  for (const line of match[1].split("\n")) {
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim() as keyof Frontmatter;
    const value = line
      .slice(sep + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (value) data[key] = value;
  }
  return { data, body: match[2] };
}

function estimateReadTime(markdown: string): string {
  const words = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*`_\-\[\]()!]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return `${minutes} min`;
}

function buildPost(slug: string, raw: string, fallbackDate?: string): Post {
  const { data, body } = parseFrontmatter(raw);
  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? fallbackDate ?? "1970-01-01",
    tag: data.tag ?? "note",
    excerpt: data.excerpt ?? "",
    category: slug.includes("/") ? slug.split("/")[0] : "notes",
    readMinutes: estimateReadTime(body),
    content: body,
  };
}

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "qb-portfolio",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  return headers;
}

async function listGithubSlugs(): Promise<string[] | null> {
  try {
    const url = `https://api.github.com/repos/${BLOG_REPO}/git/trees/${BLOG_BRANCH}?recursive=1`;
    const res = await fetch(url, {
      headers: githubHeaders(),
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    const tree = (await res.json()) as {
      tree?: { path: string; type: string }[];
    };
    if (!tree.tree) return null;

    const prefix = BLOG_PATH ? `${BLOG_PATH}/` : "";
    return tree.tree
      .filter(
        (item) =>
          item.type === "blob" &&
          item.path.startsWith(prefix) &&
          item.path.endsWith(".md"),
      )
      .map((item) => item.path.slice(prefix.length, -3));
  } catch {
    return null;
  }
}

async function fetchGithubRaw(slug: string): Promise<string | null> {
  try {
    const base = [BLOG_REPO, BLOG_BRANCH, BLOG_PATH].filter(Boolean).join("/");
    const encoded = slug.split("/").map(encodeURIComponent).join("/");
    const url = `https://raw.githubusercontent.com/${base}/${encoded}.md`;
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchGithubCommitDate(slug: string): Promise<string | null> {
  try {
    const filePath = [BLOG_PATH, slug].filter(Boolean).join("/") + ".md";
    const url = `https://api.github.com/repos/${BLOG_REPO}/commits?path=${encodeURIComponent(filePath)}&sha=${encodeURIComponent(BLOG_BRANCH)}&per_page=1`;
    const res = await fetch(url, {
      headers: githubHeaders(),
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    const commits = (await res.json()) as {
      commit?: { author?: { date?: string } };
    }[];
    return commits[0]?.commit?.author?.date?.slice(0, 10) ?? null;
  } catch {
    return null;
  }
}

async function fetchPostWithDate(slug: string, raw: string): Promise<Post> {
  const { data } = parseFrontmatter(raw);
  const fallbackDate = data.date
    ? undefined
    : ((await fetchGithubCommitDate(slug)) ?? undefined);
  return buildPost(slug, raw, fallbackDate);
}

async function getAllGithubPosts(): Promise<Post[] | null> {
  const slugs = await listGithubSlugs();
  if (!slugs) return null;
  const posts = (
    await Promise.all(
      slugs.map(async (slug) => {
        const raw = await fetchGithubRaw(slug);
        return raw ? fetchPostWithDate(slug, raw) : null;
      }),
    )
  ).filter((p): p is Post => p !== null);
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

async function readPostFile(slug: string): Promise<Post | null> {
  const filePath = path.join(LOCAL_DIR, ...slug.split("/")) + ".md";
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return buildPost(slug, raw);
  } catch {
    return null;
  }
}

async function getAllLocalPosts(): Promise<Post[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(LOCAL_DIR, { recursive: true });
  } catch {
    return [];
  }
  const slugs = entries
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.slice(0, -3));
  const posts = (await Promise.all(slugs.map(readPostFile))).filter(
    (p): p is Post => p !== null,
  );
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getAllPosts(): Promise<Post[]> {
  if (BLOG_REPO) {
    const github = await getAllGithubPosts();
    if (github !== null) return github;
  }
  return getAllLocalPosts();
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (BLOG_REPO) {
    const raw = await fetchGithubRaw(slug);
    if (raw) return fetchPostWithDate(slug, raw);
  }
  return readPostFile(slug);
}
