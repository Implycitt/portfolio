import type { Metadata } from "next";
import Link from "next/link";
import SectionField from "@/components/ui/SectionField";
import { PRESETS, type BackdropSpec } from "@/lib/backdrop";
import { getAllPosts, formatDate, blogSource } from "@/lib/posts";

const ARCHIVE_SKY: BackdropSpec = {
  ...PRESETS.station,
  layers: [
    ...PRESETS.station.layers,
    {
      kind: "shooting",
      count: 2,
      seed: 9909,
      area: { x: [12, 78], y: [8, 30] },
      duration: [14, 20],
    },
  ],
};

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

  const feedLabel =
    blogSource.type === "github"
      ? `${blogSource.repo} · ${blogSource.path}/ · ${blogSource.branch}`
      : blogSource.label;

  return (
    <main
      id="content"
      tabIndex={-1}
      className="relative min-h-screen overflow-hidden text-foreground"
    >
      <SectionField backdrop={ARCHIVE_SKY} />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-24 pt-24 sm:px-10 sm:pt-32">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.25em] uppercase text-mocha-overlay1 transition-colors hover:text-mocha-teal"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">
            ←
          </span>
          ~/home
        </Link>

        <header className="hud-panel hud-frame mt-8">
          <div className="hud-bar text-mocha-overlay1">
            <span className="hud-lamp text-mocha-teal" />
            <span className="text-mocha-teal">archive link</span>
            <span className="text-mocha-overlay0">//</span>
            <span>station net · sector 07</span>
            <span className="ml-auto text-mocha-overlay0">
              {String(posts.length).padStart(2, "0")} logged
            </span>
          </div>
          <div className="p-6 sm:p-8">
            <h1 className="font-mono text-3xl font-black tracking-tighter text-mocha-text sm:text-5xl">
              ./blog
              <span className="hud-cursor ml-1 text-mocha-teal" />
            </h1>
            <p className="mt-4 max-w-xl font-mono text-sm leading-relaxed text-mocha-subtext">
              A signal line of notes on math, physics, software, and whatever
              crosses my mind.
            </p>
          </div>
        </header>

        {categories.length === 0 ? (
          <p className="hud-panel mt-10 p-5 font-mono text-sm leading-relaxed text-mocha-subtext">
            No posts yet — drop .md files into {feedLabel}
          </p>
        ) : (
          <div className="mt-12 space-y-12">
            {categories.map((category) => (
              <section key={category}>
                <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.3em] uppercase">
                  <span className="hud-lamp text-mocha-mauve" />
                  <h2 className="text-mocha-text">{category}</h2>
                  <span className="hidden shrink-0 sm:block">
                    <span className="hud-meter block w-20 text-mocha-teal">
                      <span
                        style={{
                          width: `${Math.round((groups[category].length / posts.length) * 100)}%`,
                        }}
                      />
                    </span>
                  </span>
                  <span className="text-mocha-overlay0">
                    {String(groups[category].length).padStart(2, "0")}
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-mocha-surface to-transparent" />
                </div>

                <div className="hud-panel hud-notch mt-4 overflow-hidden">
                  {groups[category].map((post, i) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="hud-row group flex items-start gap-4 px-5 py-5 sm:gap-6 sm:px-6"
                    >
                      <span className="mt-0.5 w-5 shrink-0 font-mono text-[11px] tracking-widest text-mocha-overlay0">
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <span className="min-w-0 flex-1">
                        <h3 className="font-mono text-base font-bold text-mocha-text transition-colors group-hover:text-mocha-teal sm:text-lg">
                          {post.title}
                        </h3>
                        <span className="mt-2 block font-mono text-[13px] leading-relaxed text-mocha-subtext">
                          {post.excerpt}
                        </span>
                        <span className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] tracking-[0.2em] uppercase text-mocha-overlay0">
                          <span className="text-mocha-mauve">{post.tag}</span>
                          <span>{formatDate(post.date)}</span>
                          <span>{post.readMinutes} read</span>
                        </span>
                      </span>

                      <span className="hidden shrink-0 pt-1 font-mono text-[10px] tracking-[0.2em] uppercase text-mocha-overlay0 transition-colors group-hover:text-mocha-teal sm:block">
                        open ▸
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="hud-panel mt-14">
          <div className="hud-bar text-mocha-overlay0">
            <span className="hud-lamp hud-lamp-idle text-mocha-overlay1" />
            <span>feed</span>
            <span className="normal-case tracking-normal text-mocha-overlay1">
              {feedLabel}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
