import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import "katex/dist/katex.min.css";
import SectionField from "@/components/ui/SectionField";
import { PostRead, ReadOutro, ReadStatus } from "@/components/blog/PostRead";
import {
  getAllPosts,
  getPostBySlug,
  formatDate,
  blogSource,
} from "@/lib/posts";
import { extractHeadings, renderMarkdown } from "@/lib/markdown";

interface BlogPostPageProps {
  params: Promise<{ slug: string[] }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug.split("/") }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const slug = (await params).slug.join("/");
  const post = await getPostBySlug(slug);
  return {
    title: post
      ? `${post.title} — Quentin Bordelon`
      : "Blog — Quentin Bordelon",
  };
}

export default async function BlogPost({ params }: BlogPostPageProps) {
  const slug = (await params).slug.join("/");
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const postDir = post.slug.includes("/")
    ? post.slug.slice(0, post.slug.lastIndexOf("/"))
    : "";
  const repoBase =
    blogSource.type === "github"
      ? [blogSource.repo, blogSource.branch, blogSource.path, postDir]
          .filter(Boolean)
          .join("/")
      : null;
  const html = renderMarkdown(
    post.content,
    repoBase ? `https://raw.githubusercontent.com/${repoBase}` : undefined,
    repoBase ? `https://github.com/${repoBase}` : undefined,
  );
  const headings = extractHeadings(html);

  return (
    <main
      id="content"
      tabIndex={-1}
      className="relative min-h-screen overflow-clip text-foreground"
    >
      <SectionField backdrop="station" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-24 pt-24 sm:px-10 sm:pt-32">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.25em] uppercase text-mocha-overlay1 transition-colors hover:text-mocha-teal"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">
            ←
          </span>
          ~/blog
        </Link>

        <PostRead headings={headings}>
          <header className="hud-panel hud-frame">
            <div className="hud-bar text-mocha-overlay1">
              <span className="hud-lamp text-mocha-teal" />
              <span className="text-mocha-teal normal-case tracking-normal">
                {post.slug}.md
              </span>
              <span className="hidden sm:inline">{formatDate(post.date)}</span>
              <ReadStatus />
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] tracking-[0.24em] uppercase">
                <span className="text-mocha-mauve">{post.tag}</span>
                <span className="text-mocha-overlay0">/</span>
                <span className="text-mocha-lavender">{post.category}</span>
                <span className="text-mocha-overlay0">/</span>
                <span className="text-mocha-overlay1">
                  {post.readMinutes} read
                </span>
              </div>

              <h1 className="mt-4 font-mono text-2xl font-black leading-tight tracking-tighter text-mocha-text break-words sm:text-4xl">
                {post.title}
              </h1>

              {post.excerpt ? (
                <p className="mt-4 border-l border-mocha-surface pl-4 font-mono text-[13px] leading-relaxed text-mocha-subtext">
                  {post.excerpt}
                </p>
              ) : null}
            </div>
          </header>

          <article className="hud-panel hud-panel-solid hud-frame hud-edge-amber mt-8 px-5 py-8 sm:px-10 sm:py-12">
            <div
              className="md-body font-mono"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </article>

          <div className="hud-panel mt-12">
            <div className="hud-bar text-mocha-overlay0">
              <ReadOutro />
              <Link
                href="/blog"
                className="ml-auto transition-colors hover:text-mocha-teal"
              >
                ← all posts
              </Link>
            </div>
          </div>
        </PostRead>
      </div>
    </main>
  );
}
