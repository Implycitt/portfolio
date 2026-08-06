import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import TerminalCard from "@/components/ui/TerminalCard";
import { getAllPosts } from "@/lib/posts";

interface Interest {
  path: string;
  tag: string;
  title: string;
  blurb: string;
  blogCategory?: string;
}

const INTERESTS: Interest[] = [
  {
    path: "chef.md",
    tag: "zen",
    title: "Cooking/Baking",
    blurb: "Unwinding with cooking or baking. Pasta is my main dish and browned butter cookies are my specialty.",
    blogCategory: "cooking",
  },
  {
    path: "bmntn.rkt",
    tag: "health",
    title: "Badminton",
    blurb: "Hitting the court with friends in between classes.",
    blogCategory: "sports",
  },
  {
    path: "lift.cpp",
    tag: "health",
    title: "Gym",
    blurb: "Progressive overload, one rep at a time. Rest days are for squashing bugs.",
    blogCategory: "fitness",
  },
  {
    path: "plane.sh",
    tag: "culture",
    title: "Traveling",
    blurb: "Chasing new timezones, local foods, and the perfect picture.",
    blogCategory: "culture",
  },
  {
    path: "game.cs",
    tag: "zen",
    title: "Gaming",
    blurb: "Late night sessions and strategy sims to decompress.",
    blogCategory: "gaming",
  },
  {
    path: "tea.md",
    tag: "zen",
    title: "Tea",
    blurb: "Loose leaf over bags. A proper cup of chamomile fixes everything.",
    blogCategory: "tea",
  },
];

export default async function MiscSection() {
  const posts = await getAllPosts();
  const postsByCategory: Record<string, typeof posts> = {};
  for (const post of posts) {
    postsByCategory[post.category] = postsByCategory[post.category] ?? [];
    postsByCategory[post.category].push(post);
  }

  return (
    <section id="misc" data-lenis-snap className="relative min-h-screen flex items-center justify-center overflow-hidden py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 mx-auto h-[400px] w-[720px] rounded-full bg-gradient-to-tr from-cyan/10 via-violet/10 to-mauve/10 blur-[130px]" />

      <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-10">
        <SectionHeading prompt="cat ./sections/interests.md" title="Interests" />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INTERESTS.map((item) => {
            const related = item.blogCategory
              ? (postsByCategory[item.blogCategory] ?? []).slice(0, 2)
              : [];
            return (
              <TerminalCard
                key={item.path}
                path={item.path}
                accent={item.tag === "physics" || item.tag === "raytracing" ? "violet" : "cyan"}
                className="h-full"
              >
                <div className="flex flex-col gap-2 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">{item.title}</span>
                    <span className="rounded border border-white/10 px-2 py-0.5 text-[10px] tracking-widest uppercase text-mauve">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-white/60">{item.blurb}</p>

                  {item.blogCategory && (
                    <div className="mt-2 border-t border-white/10 pt-2.5">
                      {related.length > 0 ? (
                        <>
                          <p className="text-[10px] tracking-widest uppercase text-white/35">
                            ~/blog/{item.blogCategory}/
                          </p>
                          <div className="mt-1.5 space-y-1">
                            {related.map((post) => (
                              <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="group flex items-center gap-1.5 text-xs text-white/55 transition-colors hover:text-cyan"
                              >
                                <span className="text-cyan/60">▸</span>
                                <span className="truncate">{post.title}</span>
                                <span className="ml-auto shrink-0 text-white/25 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-cyan">
                                  →
                                </span>
                              </Link>
                            ))}
                          </div>
                        </>
                      ) : (
                        <Link
                          href="/blog"
                          className="text-[10px] tracking-widest text-white/30 uppercase transition-colors hover:text-cyan"
                        >
                          $ ls ~/blog/{item.blogCategory}/
                          <span className="ml-1 text-cyan/50">// no posts yet</span>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </TerminalCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
