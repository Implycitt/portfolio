import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import "katex/dist/katex.min.css";
import SynthwaveBackground from "@/components/blog/SynthwaveBackground";
import {
  getAllPosts,
  getPostBySlug,
  formatDate,
  blogSource,
} from "@/lib/posts";
import { renderMarkdown } from "@/lib/markdown";

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

  return (
    <main
      id="content"
      tabIndex={-1}
      className="relative min-h-screen overflow-hidden bg-background text-foreground"
    >
      <SynthwaveBackground />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-28 pt-28 sm:px-10 sm:pt-36">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 font-mono text-xs tracking-[0.25em] uppercase text-mocha-overlay1 transition-colors hover:text-mocha-mauve"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">
            ←
          </span>
          ~/blog
        </Link>

        <div className="mt-10 flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-widest uppercase">
          <span className="text-mocha-mauve">{post.tag}</span>
          <span className="text-mocha-surface">·</span>
          <span className="text-mocha-lavender">{post.category}</span>
          <span className="text-mocha-surface">·</span>
          <span className="text-mocha-overlay1">{formatDate(post.date)}</span>
          <span className="text-mocha-surface">·</span>
          <span className="text-mocha-overlay1">{post.readMinutes} read</span>
        </div>

        <h1
          data-text={post.title}
          className="glitch-text mt-4 max-w-full font-mono text-2xl font-black leading-tight tracking-tighter text-transparent break-words sm:text-4xl lg:text-5xl"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff, #05d9e8 60%, #ff2a6d)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
        >
          {post.title}
        </h1>

        <div className="mt-6 mb-12 h-px w-full bg-gradient-to-r from-mocha-mauve/50 via-mocha-lavender/30 to-transparent" />

        <div className="rounded-xl border border-mocha-surface bg-mocha-base p-6 sm:p-10">
          <article
            className="md-body font-mono"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-mocha-surface pt-8 font-mono text-xs tracking-widest uppercase text-mocha-overlay0 sm:flex-row sm:items-center">
          <p>Thanks for reading</p>
          <Link
            href="/blog"
            className="transition-colors hover:text-mocha-mauve"
          >
            ← all posts
          </Link>
        </div>
      </div>

      <div className="scanlines pointer-events-none fixed inset-0 z-40" />
    </main>
  );
}
