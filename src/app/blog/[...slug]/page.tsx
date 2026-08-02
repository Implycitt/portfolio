import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import SynthwaveBackground from "@/components/blog/SynthwaveBackground";
import { getAllPosts, getPostBySlug, formatDate } from "@/lib/posts";

interface BlogPostPageProps {
  params: Promise<{ slug: string[] }>;
}

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
    title: post ? `${post.title} — Quentin Bordelon` : "Blog — Quentin Bordelon",
  };
}

export default async function BlogPost({ params }: BlogPostPageProps) {
  const slug = (await params).slug.join("/");
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const html = await marked.parse(post.content);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <SynthwaveBackground />

      <div className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-28 pt-28 sm:px-10 sm:pt-36">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 font-mono text-xs tracking-[0.25em] uppercase text-white/50 transition-colors hover:text-neon-cyan"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
          ~/blog
        </Link>

        <div className="mt-10 flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-widest uppercase">
          <span className="text-neon-cyan neon-cyan">#{post.date}</span>
          <span className="text-white/35">·</span>
          <span className="text-neon-pink neon-pink">[{post.tag}]</span>
          <span className="text-white/35">·</span>
          <span className="text-mauve">~/blog/{post.category}</span>
          <span className="text-white/35">·</span>
          <span className="text-white/45">{formatDate(post.date)}</span>
          <span className="text-white/35">·</span>
          <span className="text-white/45">{post.readMinutes} read</span>
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

        <div className="mt-6 mb-12 h-px w-full bg-gradient-to-r from-neon-cyan/60 via-neon-pink/60 to-transparent" />

        <article
          className="md-body font-mono"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 font-mono text-xs tracking-widest uppercase text-white/40 sm:flex-row sm:items-center">
          <p>
            <span className="text-neon-cyan neon-cyan">$</span> exit 0
          </p>
          <Link href="/blog" className="transition-colors hover:text-neon-pink">
            ← all posts
          </Link>
        </div>
      </div>

      <div className="scanlines pointer-events-none fixed inset-0 z-40" />
    </main>
  );
}
