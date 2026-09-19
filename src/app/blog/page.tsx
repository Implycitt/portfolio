import type { Metadata } from "next";
import Link from "next/link";
import SynthwaveBackground from "@/components/blog/SynthwaveBackground";
import { getAllPosts, formatDate, blogSource } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog — Quentin Bordelon",
};

export const revalidate = 60;

export default async function Blog() {
  const posts = await getAllPosts();

  const groups: Record<string, typeof posts> = {};
  for (const post of posts) {
    groups[post.category] = groups[post.category] ?? [];
    groups[post.category].push(post);
  }
  const categories = Object.keys(groups).sort();

  return (
    <main
      id="content"
      tabIndex={-1}
      className="relative min-h-screen overflow-hidden bg-background text-foreground"
    >
      <SynthwaveBackground />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-28 pt-28 sm:px-10 sm:pt-36">
        <span aria-hidden className="mb-4 block h-[2px] w-12 bg-mocha-mauve" />

        <h1
          data-text="./blog --synthwave"
          className="glitch-text mt-3 max-w-full font-mono text-2xl font-black tracking-tighter text-transparent break-words sm:text-4xl lg:text-6xl"
          style={{
            backgroundImage:
              "linear-gradient(to right, #05d9e8, #ff2a6d 55%, #d300c5)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
        >
          ./blog --synthwave
        </h1>

        <p className="mt-4 max-w-xl font-mono text-sm leading-relaxed text-mocha-subtext">
          A signal line of notes on math, physics, software, and whatever
          crosses my mind. Rendered at 88% CRT nostalgia.
        </p>

        <div className="mt-6 mb-16 h-px w-full bg-gradient-to-r from-mocha-mauve/50 via-mocha-lavender/30 to-transparent" />

        {categories.length === 0 ? (
          <p className="font-mono text-sm text-mocha-subtext">
            No posts yet — drop .md files into{" "}
            {blogSource.type === "github"
              ? `${blogSource.repo}/${blogSource.path}/{category}/`
              : blogSource.label}
          </p>
        ) : (
          <div className="space-y-14">
            {categories.map((category) => (
              <section key={category} className="space-y-5">
                <div className="flex items-center gap-3 font-mono text-xs tracking-widest uppercase">
                  <span className="text-mocha-text">{category}</span>
                  <span className="text-mocha-overlay0">
                    {groups[category].length}
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-mocha-mauve/40 to-transparent" />
                </div>

                {groups[category].map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="spotlight group relative block overflow-hidden rounded-xl border border-mocha-surface bg-mocha-base p-5 transition-colors duration-300 hover:border-mocha-overlay0 sm:p-6"
                  >
                    <span className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-mocha-lavender via-mocha-mauve to-mocha-pink opacity-50 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-widest uppercase">
                      <span className="text-mocha-mauve">{post.tag}</span>
                      <span className="text-mocha-surface">·</span>
                      <span className="text-mocha-overlay1">
                        {formatDate(post.date)}
                      </span>
                      <span className="ml-auto hidden text-mocha-overlay0 sm:inline">
                        {post.readMinutes} read
                      </span>
                    </div>

                    <h2 className="mt-3 font-mono text-lg font-bold text-mocha-text transition-colors duration-300 group-hover:text-mocha-lavender sm:text-2xl">
                      {post.title}
                    </h2>

                    <p className="mt-2 font-mono text-sm leading-relaxed text-mocha-subtext">
                      {post.excerpt}
                    </p>
                  </Link>
                ))}
              </section>
            ))}
          </div>
        )}

        <p className="mt-16 text-center font-mono text-[10px] tracking-widest text-mocha-overlay0 uppercase">
          feed:{" "}
          {blogSource.type === "github"
            ? `${blogSource.repo} (${blogSource.path}/ · ${blogSource.branch})`
            : blogSource.label}
        </p>
      </div>

      <div className="scanlines pointer-events-none fixed inset-0 z-40" />
    </main>
  );
}
