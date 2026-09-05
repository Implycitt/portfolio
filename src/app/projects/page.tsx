import type { Metadata } from "next";
import { fetchGitHubRepos, fetchGitHubContributions } from "@/lib/github-repos";
import ProjectCard from "@/components/ui/ProjectCard";
import OrgCard from "@/components/ui/OrgCard";

export const metadata: Metadata = {
  title: "Projects — Quentin Bordelon",
};

export const revalidate = 3600;

const EXCLUDED = ["Implycitt", "School", "GameDev", "CSPGame"];

const GITHUB_USER = process.env.GITHUB_USERNAME ?? "Implycitt";

const TAG_MAP: Record<string, string[]> = {
  PrintIt: ["javafx", "maven", "sqlite", "desktop"],
  portfolio: ["next.js", "react", "tailwindcss", "typescript", "three.js"],
  quickView: ["electron", "latex", "typst", "pdf"],
  tools: ["cli"],
  dotfiles: ["neovim", "tmux", "zsh", "alacritty"],
  LightsOut: ["galois", "math", "game", "puzzle"],
  AveResearch2026: ["numpy", "scipy", "research", "data-science", "pandas"],
  Guardium: ["bevy", "gamedev", "tower-defense", "2d"],
  OpenMeteo: ["3d", "weather", "api", "three.js"],
  Zenithly: ["hackathon", "web", "mapbox"],
  CurrencyConverter: ["swing", "desktop", "gui"],
  ValentinesDay: ["animation", "web", "frontend"],
  DesktopPet: ["pygame", "desktop", "gui"],
  Orderbook: ["trading", "wip", "finance"],
  "competitive-programming": [
    "algorithms",
    "data-structures",
    "problem-solving",
  ],
  blog: ["markdown", "next.js"],
  gdsclsu: ["svelte", "gdsc", "club-site"],
  hackGrader: ["django", "grading", "gdsc"],
  WebDevWorkshop: ["workshop", "gdsc", "web"],
  GeauxHack: ["gdsc", "hackathon"],
  "saselsu.github.io": ["sasel", "club-site"],
  Voyago: ["hackathon", "travel", "group-project"],
};

function SectionHeading({
  prompt,
  title,
  blurb,
}: {
  prompt: string;
  title: string;
  blurb: string;
}) {
  return (
    <div className="mt-20">
      <div className="mb-2 flex items-center gap-3 font-mono text-xs text-white/40">
        <span className="text-cyan">$</span>
        <span className="text-white/60">{prompt}</span>
        <span className="terminal-caret inline-block h-3.5 w-2 bg-cyan" />
      </div>
      <h2 className="font-mono text-2xl font-bold text-white">{title}</h2>
      <p className="mt-2 font-mono text-sm leading-relaxed text-white/55">
        <span className="text-mauve">//</span> {blurb}
      </p>
    </div>
  );
}

export default async function Projects() {
  const [repos, data] = await Promise.all([
    fetchGitHubRepos(GITHUB_USER, EXCLUDED),
    fetchGitHubContributions(GITHUB_USER),
  ]);
  const { contributions: contributed, orgs } = data;
  const sortedContributed = [...(contributed ?? [])].sort(
    (a, b) => b.commits - a.commits,
  );

  const orgStats: Record<string, { commits: number; repos: number }> = {};
  for (const c of sortedContributed) {
    const owner = c.repo.full_name.split("/")[0];
    const s = (orgStats[owner] ??= { commits: 0, repos: 0 });
    s.commits += c.commits;
    s.repos += 1;
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <div className="terminal-grid-bg pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-cyan/10 via-violet/10 to-mauve/10 blur-[130px]" />
      <div
        aria-hidden
        className="scanlines pointer-events-none fixed inset-0 z-40"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-30"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-4xl px-6 pb-28 pt-28 sm:px-10 sm:pt-36">
        <h1 className="mb-8 font-mono text-3xl font-black tracking-tight text-white sm:text-4xl">
          <span className="text-white/40">~/</span>
          <span className="text-cyan">projects</span>
          <span className="text-mauve">/</span>
        </h1>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 font-mono text-xs text-white/40">
            <span className="text-cyan">$</span>
            <span className="text-white/60">
              gh repo list {GITHUB_USER} --source --limit 100
            </span>
            <span className="terminal-caret inline-block h-3.5 w-2 bg-cyan" />
          </div>

          <a
            href={`https://github.com/${GITHUB_USER}`}
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex items-center gap-2 rounded-lg border border-cyan/30 bg-cyan/5 px-5 py-2.5 font-mono text-xs tracking-wider text-white transition-all duration-300 hover:border-cyan/60 hover:bg-cyan/10 hover:text-white hover:shadow-[0_0_24px_-6px_rgba(46,223,229,0.5)]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4 text-white/60 transition-colors group-hover:text-cyan"
            >
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.8 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
            github.com/{GITHUB_USER}
          </a>
        </div>

        <p className="max-w-2xl font-mono text-sm leading-relaxed text-white/55">
          <span className="text-mauve">//</span> A working directory of things
          I've shipped, the groups I build with, and the repos I've touched
          outside my own account.
        </p>

        {repos === null && (
          <div className="mt-16 font-mono text-sm text-amber-400/70">
            <span className="text-amber-400">!</span> Could not reach GitHub —
            try again in a moment.
          </div>
        )}

        {repos !== null && (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {repos.map((repo, i) => (
              <ProjectCard
                key={repo.id}
                repo={repo}
                index={i}
                owner={GITHUB_USER}
                extraTags={TAG_MAP[repo.name] ?? []}
              />
            ))}
          </div>
        )}

        {repos !== null && (
          <p className="mt-16 font-mono text-xs tracking-widest text-white/35">
            <span className="text-cyan">$</span> gh repo list | wc -l
            <span className="terminal-caret ml-1 inline-block h-3 w-1.5 bg-cyan align-middle" />
          </p>
        )}

        <SectionHeading
          prompt={`gh org list ${GITHUB_USER}`}
          title="organizations"
          blurb="The groups I'm active in and build for."
        />
        {orgs === null ? (
          <div className="mt-6 font-mono text-sm text-amber-400/70">
            <span className="text-amber-400">!</span> Could not reach GitHub —
            try again in a moment.
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {orgs.map((org, i) => (
              <OrgCard
                key={org.login}
                org={org}
                index={i}
                stats={orgStats[org.login]}
              />
            ))}
          </div>
        )}

        <SectionHeading
          prompt={`gh search commits --author=${GITHUB_USER} --json repository`}
          title="contributions"
          blurb="Repos I've helped build, even when they live outside my account. Auto-discovered from my commit history."
        />
        {contributed === null ? (
          <div className="mt-6 font-mono text-sm text-amber-400/70">
            <span className="text-amber-400">!</span> Could not reach GitHub —
            try again in a moment.
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {sortedContributed.map((c, i) => (
              <ProjectCard
                key={c.repo.id}
                repo={c.repo}
                index={i}
                extraTags={TAG_MAP[c.repo.name] ?? []}
                owner={c.repo.full_name.split("/")[0]}
                role={c.role}
                commits={c.commits}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
