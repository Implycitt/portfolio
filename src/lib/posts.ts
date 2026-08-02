import { promises as fs } from "fs";
import path from "path";

export interface PostMeta {
  title: string;
  date: string;
  tag: string;
  excerpt: string;
}

export interface Post extends PostMeta {
  slug: string;
  readMinutes: string;
  content: string;
}

const BLOG_REPO = process.env.BLOG_REPO;
const BLOG_PATH = (process.env.BLOG_PATH ?? "posts").replace(/^\/+|\/+$/g, "");
const BLOG_BRANCH = process.env.BLOG_BRANCH ?? "main";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REVALIDATE = 3600;

export const blogSource: { type: "github"; repo: string; path: string; branch: string } | {
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
    const value = line.slice(sep + 1).trim().replace(/^["']|["']$/g, "");
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

function buildPost(slug: string, raw: string): Post {
  const { data, body } = parseFrontmatter(raw);
  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? "1970-01-01",
    tag: data.tag ?? "note",
    excerpt: data.excerpt ?? "",
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
    const url = `https://api.github.com/repos/${BLOG_REPO}/contents/${encodeURIComponent(BLOG_PATH)}?ref=${BLOG_BRANCH}`;
    const res = await fetch(url, {
      headers: githubHeaders(),
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    const items = (await res.json()) as { name: string; type: string }[];
    if (!Array.isArray(items)) return null;
    return items
      .filter((i) => i.type === "file" && i.name.endsWith(".md"))
      .map((i) => i.name.slice(0, -3));
  } catch {
    return null;
  }
}

async function fetchGithubRaw(slug: string): Promise<string | null> {
  try {
    const base = [BLOG_REPO, BLOG_BRANCH, BLOG_PATH].filter(Boolean).join("/");
    const url = `https://raw.githubusercontent.com/${base}/${encodeURIComponent(slug)}.md`;
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function getAllGithubPosts(): Promise<Post[] | null> {
  const slugs = await listGithubSlugs();
  if (!slugs) return null;
  const posts = (
    await Promise.all(
      slugs.map(async (slug) => {
        const raw = await fetchGithubRaw(slug);
        return raw ? buildPost(slug, raw) : null;
      })
    )
  ).filter((p): p is Post => p !== null);
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

async function readPostFile(slug: string): Promise<Post | null> {
  const filePath = path.join(LOCAL_DIR, `${slug}.md`);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return buildPost(slug, raw);
  } catch {
    return null;
  }
}

async function getAllLocalPosts(): Promise<Post[]> {
  let files: string[];
  try {
    files = await fs.readdir(LOCAL_DIR);
  } catch {
    return [];
  }
  const slugs = files.filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3));
  const posts = (await Promise.all(slugs.map(readPostFile))).filter(
    (p): p is Post => p !== null
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
    if (raw) return buildPost(slug, raw);
  }
  return readPostFile(slug);
}
