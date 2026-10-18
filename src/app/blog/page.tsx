import type { Metadata } from "next";
import Link from "next/link";
import DreamScene from "@/components/blog/DreamScene";
import BlogDesktop from "@/components/blog/BlogDesktop";
import {
  getAllPosts,
  formatDate,
  blogSource,
  excerptFromMarkdown,
} from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog — Quentin Bordelon",
  description:
    "Notes on math, physics and software, recovered from a machine that never booted again.",
};

export const revalidate = 60;

export default async function Blog() {
  const posts = await getAllPosts();
  const items = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || excerptFromMarkdown(post.content),
    tag: post.tag,
    date: formatDate(post.date),
    readMinutes: post.readMinutes,
    category: post.category,
  }));

  const feedLabel =
    blogSource.type === "github"
      ? `${blogSource.repo} · ${blogSource.path}/ · ${blogSource.branch}`
      : blogSource.label;

  const sourceUrl =
    blogSource.type === "github"
      ? `https://github.com/${blogSource.repo}/tree/${blogSource.branch}/${blogSource.path}`
      : null;

  const latest = posts[0] ? formatDate(posts[0].date) : "—";

  return (
    <main
      id="content"
      tabIndex={-1}
      className="os-desk relative overflow-clip text-foreground"
    >
      <DreamScene />

      <div className="os-shell">
        <header className="os-deskhead">
          <Link
            href="/"
            className="os-back group inline-flex items-center gap-2"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">
              ←
            </span>
            ~/home
          </Link>

          <h1 className="os-wordmark">~/BLOG</h1>

          <p className="os-blurb">notes recovered from a dead machine</p>

          <p className="os-deskmeta">
            <span>{String(posts.length).padStart(2, "0")} file(s)</span>
            <span aria-hidden>·</span>
            <span>last write {latest}</span>
            <span aria-hidden>·</span>
            <span>read-only</span>
          </p>
        </header>

        <BlogDesktop
          posts={items}
          feedLabel={feedLabel}
          sourceUrl={sourceUrl}
        />
      </div>
    </main>
  );
}
