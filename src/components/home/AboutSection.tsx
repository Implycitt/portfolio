import { existsSync } from "fs";
import path from "path";
import Image from "next/image";
import SectionHeading from "@/components/ui/SectionHeading";
import TerminalCard from "@/components/ui/TerminalCard";
import { fetchGitHubStats, fetchGitHubPullRequests } from "@/lib/github-stats";

const USERNAME = process.env.GITHUB_USERNAME ?? "Implycitt";

const HEADSHOT_FILE = [
  "headshot.jpg",
  "headshot.jpeg",
  "headshot.png",
  "headshot.webp",
].find((file) => existsSync(path.join(process.cwd(), "public", file)));

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

export default async function AboutSection() {
  const [stats, prs] = await Promise.all([
    fetchGitHubStats(USERNAME),
    fetchGitHubPullRequests(USERNAME),
  ]);

  const STATS = [
    {
      key: "stars",
      value: stats ? fmt(stats.total_stars) : "--",
      note: "across public repos",
    },
    {
      key: "followers",
      value: stats ? fmt(stats.followers) : "--",
      note: "on github",
    },
    {
      key: "public repos",
      value: stats ? fmt(stats.public_repos) : "--",
      note: "and counting",
    },
    {
      key: "PRs merged",
      value: prs !== null ? fmt(prs) : "--",
      note: "authored",
    },
  ];

  return (
    <section
      id="about"
      data-lenis-snap
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-16 sm:py-20"
    >
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[420px] w-[720px] rounded-full bg-gradient-to-tr from-cyan/10 via-violet/10 to-mauve/10 blur-[120px]" />

      <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-10">
        <SectionHeading prompt="cat ./sections/about.md" title="About" />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
          <TerminalCard path="whoami" accent="cyan" className="h-fit">
            <div className="space-y-5 font-mono text-sm sm:text-base leading-relaxed text-white/75">
              <p className="flex items-baseline gap-2">
                <span className="text-cyan">$</span>
                <span className="text-white">whoami</span>
              </p>
              <p>
                <span className="text-white font-bold">I'm Quentin</span> - a{" "}
                <span className="text-cyan">Computer Science</span> and{" "}
                <span className="text-mauve">Physics</span> undergraduate
                student at Louisiana State University, interested in the
                intersection of software and physics.
              </p>
              <p>
                Beyond the classroom I serve as the{" "}
                <span className="text-white">
                  Webmaster for LSU's Google Developer Student Club
                </span>
                , where I build internal platform tools like the club chapters
                website, lead technical student workshops, and organize events
                such as LSU's annual hackathon Geauxhack.
              </p>
              <p>
                I recently completed a software engineering internship at{" "}
                <span className="text-white">FAST Enterprises</span>, working
                with the{" "}
                <span className="text-white">
                  Illinois Department of Revenue
                </span>
                .
              </p>
            </div>
          </TerminalCard>

          <div
            className={`relative mx-auto w-full max-w-[260px] overflow-hidden rounded-lg border bg-black/30 aspect-[4/5] sm:max-w-[300px] lg:max-w-none ${HEADSHOT_FILE ? "border-white/10" : "border-dashed border-white/15"}`}
          >
            {" "}
            {HEADSHOT_FILE ? (
              <Image
                src={`/${HEADSHOT_FILE}`}
                alt="Quentin Bordelon"
                fill
                sizes="(min-width: 1024px) 400px, 300px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center font-mono">
                  <p className="text-4xl text-white/15">▢</p>
                  <p className="mt-3 text-xs tracking-widest text-white/35 uppercase">
                    // headshot
                  </p>
                  <p className="mt-1.5 text-[10px] text-white/25">
                    upload to /public/headshot.jpg
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <TerminalCard path="stats" accent="violet" className="mt-8 h-fit">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <p className="sm:col-span-4 text-xs tracking-widest text-white/45 uppercase">
              // live from github
            </p>
            {STATS.map((s) => (
              <div
                key={s.key}
                className="text-center sm:border-r sm:border-white/5 last:border-0"
              >
                <p className="text-2xl font-bold text-cyan neon-cyan">
                  {s.value}
                </p>
                <p className="mt-1 text-xs tracking-widest text-white/55 uppercase">
                  {s.key}
                </p>
                <p className="mt-0.5 text-[10px] text-white/35">{s.note}</p>
              </div>
            ))}
          </div>
        </TerminalCard>
      </div>
    </section>
  );
}
