import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import "katex/dist/katex.min.css";
import DreamScene from "@/components/blog/DreamScene";
import { PostRead } from "@/components/blog/PostRead";
import {
  getAllPosts,
  getPostBySlug,
  formatDate,
  blogSource,
  excerptFromMarkdown,
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
    description: post
      ? post.excerpt || excerptFromMarkdown(post.content)
      : undefined,
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

  const fileName = `${slug.split("/").pop()}.md`;
  const displayFile = fileName.toUpperCase();
  const filePath = `C:\\DREAMDRIVE\\BLOG\\${slug
    .replaceAll("/", "\\")
    .toUpperCase()}.MD`;
  const sourceUrl = repoBase
    ? `https://github.com/${repoBase}/${fileName}`
    : null;

  return (
    <main
      id="content"
      tabIndex={-1}
      className="os-desk os-desk--article relative min-h-screen overflow-clip text-foreground"
    >
      <DreamScene />

      <div className="os-shell os-shell--article">
        <PostRead
          headings={headings}
          fileName={displayFile}
          filePath={filePath}
          dateLabel={formatDate(post.date)}
          sourceUrl={sourceUrl}
        >
          <div className="os-doc">
            <header className="os-doc-head">
              <p className="os-doc-eyebrow">
                <span className="os-chip">{post.tag}</span>
                <span className="os-doc-folder">{post.category}/</span>
                <span>{formatDate(post.date)}</span>
                <span aria-hidden className="os-doc-dot">
                  ·
                </span>
                <span>{post.readMinutes} read</span>
              </p>

              <h1 className="os-doc-title">{post.title}</h1>

              {post.excerpt ? (
                <p className="os-doc-excerpt">{post.excerpt}</p>
              ) : null}

              <div className="os-doc-rule" aria-hidden>
                <span />
                <span />
                <span />
              </div>
            </header>

            <article className="os-doc-article">
              <div
                className="md-body"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </article>

            <footer className="os-doc-end">
              <span className="os-doc-end-mark">— end of file —</span>
              <Link href="/blog" className="os-doc-end-link">
                return to index <span aria-hidden>↗</span>
              </Link>
            </footer>
          </div>
        </PostRead>
      </div>
    </main>
  );
}
