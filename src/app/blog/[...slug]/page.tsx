import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { getBlogPost } from "@/lib/blog";
import { remarkAlert } from "remark-github-blockquote-alert";

type BlogPostPageProps = {
  params: Promise<{ slug: string[] }>;
};

export default async function BlogPost({ params }: BlogPostPageProps) {
  const { slug } = await params;

  if (slug.length !== 2) notFound();

  const [folder, postSlug] = slug;
  const post = await getBlogPost(folder, postSlug);

  if (!post) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-10">
      <article className="rounded-2xl border-[1.5] border-rose bg-overlay p-5 shadow-header sm:p-8">
        <header className="mb-8 border-b border-rose/25 pb-5">
          <p className="text-xs uppercase tracking-[0.2em] text-subtle">
            {folder}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-love sm:text-4xl">
            {post.title}
          </h1>
        </header>

        <div className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:text-love prose-p:text-text prose-strong:text-foam prose-a:text-rose prose-code:text-gold prose-pre:bg-background/70 prose-blockquote:border-rose prose-blockquote:text-subtle prose-li:text-text">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath, remarkAlert]}
            rehypePlugins={[rehypeKatex]}
          >
            {post.markdown}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  )
}