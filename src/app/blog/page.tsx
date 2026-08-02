import type { Metadata } from "next";
import Link from "next/link";
import SynthwaveBackground from "@/components/blog/SynthwaveBackground";
import { getAllPosts, formatDate, blogSource } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog — Quentin Bordelon",
};

export default async function Blog() {
  const posts = await getAllPosts();

  const groups: Record<string, typeof posts> = {};
  for (const post of posts) {
    groups[post.category] = groups[post.category] ?? [];
    groups[post.category].push(post);
  }
  const categories = Object.keys(groups).sort();

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <SynthwaveBackground />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-28 pt-28 sm:px-10 sm:pt-36">
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-white/50">
          <span className="text-neon-cyan neon-cyan">~/</span>blog
        </p>

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

        <p className="mt-4 max-w-xl font-mono text-sm leading-relaxed text-white/60">
          <span className="text-neon-pink neon-pink">$</span> cat ./feed.log
          <br />
          A signal line of notes on graphics, physics, and shipping software. Rendered at 88% CRT
          nostalgia.
        </p>

        <div className="mt-6 mb-16 h-px w-full bg-gradient-to-r from-neon-cyan/60 via-neon-pink/60 to-transparent" />

        {categories.length === 0 ? (
          <p className="font-mono text-sm text-white/50">
            <span className="text-neon-pink neon-pink">$</span> ls ./feed.log
            <br />
            // no posts yet — drop .md files into{" "}
            {blogSource.type === "github"
              ? `${blogSource.repo}/${blogSource.path}/{category}/`
              : blogSource.label}
          </p>
        ) : (
          <div className="space-y-14">
            {categories.map((category) => (
              <section key={category} className="space-y-5">
                <div className="flex items-center gap-3 font-mono text-xs tracking-widest uppercase">
                  <span className="text-neon-pink neon-pink">▚</span>
                  <span className="text-white/70">~/blog/{category}</span>
                  <span className="text-white/35">({groups[category].length})</span>
                  <span className="h-px flex-1 bg-gradient-to-r from-neon-pink/40 to-transparent" />
                </div>

                {groups[category].map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group relative block overflow-hidden rounded-lg border border-white/10 bg-black/40 p-5 backdrop-blur-sm transition-all duration-300 hover:border-neon-pink/50 hover:bg-black/55 hover:shadow-[0_0_40px_-10px_rgba(255,42,109,0.5)] sm:p-6"
                  >
                    <span className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-neon-cyan via-neon-pink to-neon-purple opacity-60 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-widest uppercase">
                      <span className="text-neon-cyan neon-cyan">#{post.date}</span>
                      <span className="text-white/35">·</span>
                      <span className="text-neon-pink neon-pink">[{post.tag}]</span>
                      <span className="text-white/35">·</span>
                      <span className="text-white/45">{formatDate(post.date)}</span>
                      <span className="ml-auto hidden text-white/35 sm:inline">
                        {post.readMinutes} read
                      </span>
                    </div>

                    <h2 className="mt-3 font-mono text-lg font-bold text-white transition-all duration-300 group-hover:text-neon-cyan sm:text-2xl">
                      <span className="mr-2 text-neon-pink/70">▸</span>
                      {post.title}
                    </h2>

                    <p className="mt-2 font-mono text-sm leading-relaxed text-white/55">
                      {post.excerpt}
                    </p>

                    <p className="mt-4 font-mono text-xs tracking-widest text-white/40 transition-colors duration-300 group-hover:text-neon-pink">
                      $ cat {post.slug}.md{" "}
                      <span className="terminal-caret inline-block h-3 w-1.5 bg-neon-cyan align-middle" />
                    </p>
                  </Link>
                ))}
              </section>
            ))}
          </div>
        )}

        <p className="mt-16 text-center font-mono text-xs tracking-widest uppercase text-white/40">
          <span className="text-neon-cyan neon-cyan">$</span> tail -f ./feed.log
          <span className="terminal-caret ml-1 inline-block h-3 w-1.5 bg-neon-pink align-middle" />
        </p>
        <p className="mt-3 text-center font-mono text-[10px] tracking-widest uppercase text-white/25">
          // feed:{" "}
          {blogSource.type === "github"
            ? `${blogSource.repo} (${blogSource.path}/ · ${blogSource.branch})`
            : blogSource.label}
        </p>
      </div>

      <div className="scanlines pointer-events-none fixed inset-0 z-40" />
    </main>
  );
}
