import SectionHeading from "@/components/ui/SectionHeading";
import TerminalCard from "@/components/ui/TerminalCard";
import { fetchGitHubStats, fetchGitHubPullRequests } from "@/lib/github-stats";

const USERNAME = process.env.GITHUB_USERNAME ?? "Implycitt";

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
    <section id="about" data-lenis-snap className="relative min-h-screen flex items-center justify-center overflow-hidden py-16 sm:py-20">
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[420px] w-[720px] rounded-full bg-gradient-to-tr from-cyan/10 via-violet/10 to-mauve/10 blur-[120px]" />

      <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-10">
        <SectionHeading prompt="cat ./about.txt" title="About" />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <TerminalCard path="whoami" accent="cyan" className="h-fit">
            <div className="space-y-5 font-mono text-sm sm:text-base leading-relaxed text-white/75">
              <p className="flex items-baseline gap-2">
                <span className="text-cyan">$</span>
                <span className="text-white">whoami</span>
              </p>
              <p>
                <span className="text-white font-bold">Quentin Bordelon</span> — a{" "}
                <span className="text-cyan">Computer Science</span> and{" "}
                <span className="text-mauve">Physics</span> undergraduate at Louisiana State
                University, working at the intersection of software engineering and physics.
              </p>
              <p>
                Beyond the classroom I serve as the{" "}
                <span className="text-white">Webmaster for LSU's Google Developer Student Club</span>
                , where I build internal platform tools like the club chapters website and lead
                technical student workshops.
              </p>
              <p>
                I'm currently a software engineering intern at{" "}
                <span className="text-white">FAST Enterprises</span> and the{" "}
                <span className="text-white">Illinois Department of Revenue</span>.
              </p>
              <p className="text-white/50 text-xs">
                <span className="text-mauve">//</span> status: compiling dreams, one commit at a
                time
              </p>
            </div>
          </TerminalCard>

          <TerminalCard path="stats" accent="violet" className="h-fit">
            <div className="space-y-4 font-mono">
              <p className="text-xs tracking-widest text-white/45 uppercase">// live from github</p>
              {STATS.map((s) => (
                <div
                  key={s.key}
                  className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-white/55">{s.key}</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-cyan neon-cyan">{s.value}</span>
                    <span className="ml-2 text-[11px] text-white/40">{s.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </TerminalCard>
        </div>
      </div>
    </section>
  );
}
