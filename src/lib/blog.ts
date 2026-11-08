const repo = "Implycitt/blog"
const branch = "main";

export interface BlogPost {
  folder: string;
  slug: string;
  path: string;
  title: string;
};

interface TreeEntry {
  path: string; 
  type: "blob" | "tree"
};

export interface BlogPostContent {
  folder: string;
  slug: string;
  title: string;
  markdown: string;
};

const validSegment = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

export async function getBlogPosts(): Promise<BlogPost[]> {
  const response = await fetch(
    `https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        ...(process.env.GITHUB_TOKEN && {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
        })
      },
      next: { revalidate: 300 }
    }
  );

  if (!response.ok) throw new Error("Failed");

  const { tree } = (await response.json()) as { tree: TreeEntry[] };

  return tree.filter((e) => e.type === "blob" && e.path.startsWith("posts/") && /\.md$/i.test(e.path)).map((e) => {
    const [, folder, file] = e.path.split("/");
    const name= file.replace(/\.md$/i, "");
    return { folder, slug: name, path: e.path, title: name};
  });
}

export async function getBlogPost(folder: string, slug: string): Promise<BlogPostContent | null> {
  if (!validSegment.test(folder) || !validSegment.test(slug)) return null;

  const path = `posts/${folder}/${slug}.md`;

  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/${repo}/${branch}/${path}`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) return null;

    return {
      folder, slug, title: slug, markdown: await response.text()
    };
  } catch {
    return null;
  }
}