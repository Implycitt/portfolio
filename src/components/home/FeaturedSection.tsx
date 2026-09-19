import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import ProjectCard from "@/components/ui/ProjectCard";
import Reveal from "@/components/ui/Reveal";
import SectionField from "@/components/ui/SectionField";
import { fetchGitHubRepos } from "@/lib/github-repos";

const USERNAME = process.env.GITHUB_USERNAME ?? "Implycitt";

const FEATURED = ["competitive-programming", "quickView", "AveResearch2026"];

const EXCLUDED = ["Implycitt", "School", "GameDev", "CSPGame"];

export default async function FeaturedSection() {
  const repos = await fetchGitHubRepos(USERNAME, EXCLUDED);
  if (repos === null) return null;

  const picks = FEATURED.map((name) =>
    repos.find((repo) => repo.name.toLowerCase() === name.toLowerCase()),
  )
    .filter((repo) => repo !== undefined)
    .slice(0, 3);

  if (picks.length === 0) return null;

  return (
    <section
      id="featured"
      data-lenis-snap
      className="relative flex min-h-screen items-center justify-center py-16 sm:py-20"
    >
      <SectionField variant="constellation" />

      <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal variant="pop">
            <SectionHeading title="Selected work" />
          </Reveal>

          <Reveal variant="pop" delay={80}>
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 rounded-xl border border-mocha-surface bg-mocha-base px-5 py-2.5 font-mono text-xs tracking-widest text-mocha-subtext uppercase transition-colors duration-300 hover:border-mocha-mauve hover:text-mocha-text"
            >
              all projects
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {picks.map((repo, i) => (
            <Reveal
              key={repo.id}
              variant="pop"
              delay={i * 90}
              className="h-full"
            >
              <ProjectCard repo={repo} owner={USERNAME} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
