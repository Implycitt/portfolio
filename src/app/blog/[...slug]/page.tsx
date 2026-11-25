import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";
import remarkMath from "remark-math";

import { getBlogPost } from "@/lib/blog";

type BlogPostPageProps = {
    params: Promise<{ slug: string[] }>;
};

export default async function BlogPost({ params }: BlogPostPageProps): Promise<ReactNode> {
    const { slug } = await params;

    if (slug.length !== 2) notFound();

    const [folder, postSlug] = slug;
    const post = await getBlogPost(folder, postSlug);

    if (!post) notFound();

    return (
        <main className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-10">
            <article className=" border-[1.5] border-rose bg-overlay p-5 shadow-header sm:p-8 rounded-xl">
                <header className="flex mb-8 border-b border-rose/25 pb-5">
                    <Link href="/blog" className="hover:text-rose">
                        <svg
                            xmlns="http://w3.org"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-label="Go back"
                        >
                            <path d="M19 12H5" />
                            <path d="m12 19-7-7 7-7" />
                        </svg>
                    </Link>
                    <p className="text-xs uppercase text-subtle ml-6 mt-1">
                        {folder} / {post.title}
                    </p>
                </header>

                <div className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:text-love prose-p:text-text prose-strong:text-foam prose-a:text-rose prose-code:text-gold prose-pre:bg-background/70 prose-blockquote:border-rose prose-blockquote:text-subtle prose-li:text-text">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath, remarkAlert]}
                        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeKatex]}
                    >
                        {post.markdown}
                    </ReactMarkdown>
                </div>
            </article>
        </main>
    );
}
