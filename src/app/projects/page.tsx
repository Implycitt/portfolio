import type { Metadata } from "next";
import { fetchGitHubRepos, fetchGitHubContributions } from "@/lib/github-repos";
import SectionHeading from "@/components/ui/SectionHeading";
import PageBackdrop from "@/components/ui/PageBackdrop";
import ProjectCard from "@/components/ui/ProjectCard";
import OrgCard from "@/components/ui/OrgCard";
import ShowMore from "@/components/ui/ShowMore";
import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/ui/Reveal";
import Icon, { type IconName } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Projects — Quentin Bordelon",
};

export const revalidate = 3600;

const EXCLUDED = [
  "Implycitt",
  "School",
  "GameDev",
  "CSPGame",
  "portfolio",
  "blog",
];

const GITHUB_USER = process.env.GITHUB_USERNAME ?? "Implycitt";

const TAG_MAP: Record<string, string[]> = {
  PrintIt: ["javafx", "maven", "sqlite", "desktop"],
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

function SubHeading({
  title,
  blurb,
  icon,
  count,
  tint,
}: {
  title: string;
  blurb: string;
  icon: IconName;
  count: number | null;
  tint: string;
}) {
  return (
    <Reveal variant="pop" className="mt-20">
      <div className="flex items-start gap-4">
        <span
          className={`interest-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${tint}`}
        >
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="font-mono text-2xl font-bold text-mocha-text">
              {title}
            </h2>
            {count !== null && (
              <span
                className={`rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold tracking-widest uppercase tabular-nums ${tint}`}
              >
                {count}
              </span>
            )}
          </div>
          <p className="mt-2 max-w-2xl font-mono text-sm leading-relaxed text-mocha-subtext">
            {blurb}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

function Unavailable({ what }: { what: string }) {
  return (
    <div className="mt-6 flex items-center gap-2 font-mono text-sm text-amber-400/70">
      <Icon name="info" className="h-4 w-4" />
      Could not reach GitHub — {what} will be back in a moment.
    </div>
  );
}

const SUMMARY = [
  {
    key: "repos",
    icon: "box" as IconName,
    tint: "border-mocha-mauve/25 bg-mocha-mauve/10 text-mocha-mauve",
    text: "text-mocha-mauve",
  },
  {
    key: "contributions",
    icon: "merge" as IconName,
    tint: "border-mocha-teal/25 bg-mocha-teal/10 text-mocha-teal",
    text: "text-mocha-teal",
  },
  {
    key: "orgs",
    icon: "users" as IconName,
    tint: "border-mocha-sapphire/25 bg-mocha-sapphire/10 text-mocha-sapphire",
    text: "text-mocha-sapphire",
  },
];

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

  const counts: Record<string, number> = {
    repos: repos?.length ?? 0,
    contributions: sortedContributed.length,
    orgs: orgs?.length ?? 0,
  };

  return (
    <main
      id="content"
      tabIndex={-1}
      className="relative min-h-screen text-foreground overflow-hidden"
    >
      <PageBackdrop top="constellation" bottom="bloom" />

      <div className="relative mx-auto w-full max-w-4xl px-6 pb-28 pt-28 sm:px-10 sm:pt-36">
        <SectionHeading
          title="Projects"
          icon={<Icon name="code" className="h-5 w-5" />}
        />

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-xl font-mono text-sm leading-relaxed text-mocha-subtext">
            A working directory of things I&apos;ve shipped, the groups I build
            with, and the repos I&apos;ve touched outside my own account.
          </p>

          <a
            href={`https://github.com/${GITHUB_USER}`}
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex items-center gap-2 rounded-xl border border-mocha-surface bg-mocha-base px-5 py-2.5 font-mono text-xs tracking-widest uppercase text-mocha-subtext transition-colors duration-300 hover:border-mocha-mauve hover:text-mocha-text"
          >
            <Icon
              name="github"
              className="h-4 w-4 text-mocha-overlay1 transition-colors group-hover:text-mocha-mauve"
            />
            github.com/{GITHUB_USER}
          </a>
        </div>

        {repos === null && <Unavailable what="your repos" />}

        {repos !== null && (
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[11px] tracking-widest text-mocha-subtext uppercase">
            {SUMMARY.map((item) => (
              <span key={item.key} className="flex items-center gap-2">
                <span
                  className={`interest-tile flex h-7 w-7 items-center justify-center rounded-lg border ${item.tint}`}
                >
                  <Icon name={item.icon} className="h-3.5 w-3.5" />
                </span>
                <span className="text-[13px] tabular-nums">
                  <CountUp
                    value={String(counts[item.key])}
                    className={`${item.text} font-bold`}
                  />
                </span>
                {item.key}
              </span>
            ))}
          </div>
        )}

        {repos !== null && (
          <ShowMore
            className="mt-8"
            gridClassName="grid gap-6 md:grid-cols-2"
            initial={6}
            noun="projects"
            section="projects"
          >
            {repos.map((repo, i) => (
              <Reveal
                key={repo.id}
                variant="pop"
                delay={Math.min(i, 5) * 55}
                className="h-full"
              >
                <ProjectCard
                  repo={repo}
                  owner={GITHUB_USER}
                  extraTags={TAG_MAP[repo.name] ?? []}
                />
              </Reveal>
            ))}
          </ShowMore>
        )}

        <SubHeading
          title="Organizations"
          blurb="The groups I'm active in and build for."
          icon="building"
          count={orgs?.length ?? null}
          tint="border-mocha-sapphire/25 bg-mocha-sapphire/10 text-mocha-sapphire"
        />
        {orgs === null ? (
          <Unavailable what="the organizations" />
        ) : (
          <ShowMore
            className="mt-6"
            gridClassName="grid gap-6 sm:grid-cols-2"
            initial={4}
            noun="orgs"
            section="orgs"
          >
            {orgs.map((org) => (
              <OrgCard key={org.login} org={org} stats={orgStats[org.login]} />
            ))}
          </ShowMore>
        )}

        <SubHeading
          title="Contributions"
          blurb="Repos I've helped build, even when they live outside my account. Auto-discovered from my commit history."
          icon="merge"
          count={contributed?.length ?? null}
          tint="border-mocha-teal/25 bg-mocha-teal/10 text-mocha-teal"
        />
        {contributed === null ? (
          <Unavailable what="your contributions" />
        ) : (
          <ShowMore
            className="mt-6"
            gridClassName="grid gap-6 md:grid-cols-2"
            initial={4}
            noun="contributions"
            section="contributions"
          >
            {sortedContributed.map((c, i) => (
              <Reveal
                key={c.repo.id}
                variant="pop"
                delay={Math.min(i, 5) * 55}
                className="h-full"
              >
                <ProjectCard
                  repo={c.repo}
                  extraTags={TAG_MAP[c.repo.name] ?? []}
                  owner={c.repo.full_name.split("/")[0]}
                  role={c.role}
                  commits={c.commits}
                />
              </Reveal>
            ))}
          </ShowMore>
        )}
      </div>
    </main>
  );
}
