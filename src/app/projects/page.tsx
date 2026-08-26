import type { Metadata } from "next";
import {
  fetchGitHubRepos,
  fetchGitHubOrgs,
  fetchGitHubContributions,
} from "@/lib/github-repos";
import ProjectCard from "@/components/ui/ProjectCard";
import OrgCard from "@/components/ui/OrgCard";

export const metadata: Metadata = {
  title: "Projects — Quentin Bordelon",
};

export const revalidate = 3600;

const EXCLUDED = [
  "Implycitt",
  "School",
  "GameDev",
  "CSPGame",
];

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
  "competitive-programming": ["algorithms", "data-structures", "problem-solving"],
  blog: ["markdown", "next.js"],
  gdsclsu: ["svelte", "gdsc", "club-site"],
  hackGrader: ["django", "grading", "gdsc"],
  WebDevWorkshop: ["workshop", "gdsc", "web"],
  GeauxHack: ["gdsc", "hackathon"],
  "saselsu.github.io": ["sasel", "club-site"],
  Voyago: ["hackathon", "travel", "group-project"],
};

const BANNER = String.raw`
  _ __   __ _ _ __   ___ _ __
 | '_ \ / _\` | '_ \ / _ \ '__|
 | |_) | (_| | |_) |  __/ |
 | .__/ \__, | .__/ \___|_|
 |_|    |___/|_|
`.replaceAll("\\`", "`");

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

  const orgStats: Record<string, { commits: number; repos: number }> = {};
  for (const c of contributed ?? []) {
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
        <pre
          aria-hidden
          className="select-none overflow-hidden font-mono text-[9px] leading-tight text-cyan/50 sm:text-xs sm:text-cyan/60"
        >
          {BANNER}
        </pre>

        <div className="mb-8 flex items-center gap-3 font-mono text-xs text-white/40">
          <span className="text-cyan">$</span>
          <span className="text-white/60">
            gh repo list {GITHUB_USER} --source --limit 100
          </span>
          <span className="terminal-caret inline-block h-3.5 w-2 bg-cyan" />
        </div>

        <p className="max-w-2xl font-mono text-sm leading-relaxed text-white/55">
          <span className="text-mauve">//</span> A working directory of things I've
          shipped, the groups I build with, and the repos I've touched outside my
          own account.
        </p>

        {repos === null && (
          <div className="mt-16 font-mono text-sm text-amber-400/70">
            <span className="text-amber-400">!</span> Could not reach GitHub — try
            again in a moment.
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
            <span className="text-amber-400">!</span> Could not reach GitHub — try
            again in a moment.
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
            <span className="text-amber-400">!</span> Could not reach GitHub — try
            again in a moment.
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {contributed.map((c, i) => (
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
