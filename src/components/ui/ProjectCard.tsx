import Link from "next/link";
import Spotlight from "@/components/ui/Spotlight";
import Icon, { type IconName } from "@/components/ui/icons";
import { tagColor } from "@/lib/tag-color";
import type { GitHubRepoData } from "@/lib/github-repos";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}

const ROLE_BADGES: Record<string, string> = {
  "sole-author": "border-mocha-mauve/35 bg-mocha-mauve/10 text-mocha-mauve",
  lead: "border-mocha-sapphire/35 bg-mocha-sapphire/10 text-mocha-sapphire",
  contributor: "border-mocha-surface bg-mocha-mantle text-mocha-overlay1",
};

const ROLE_LABELS: Record<string, string> = {
  "sole-author": "sole author",
  lead: "lead",
  contributor: "contributor",
};

const ROLE_ICONS: Record<string, IconName> = {
  "sole-author": "user",
  lead: "users",
  contributor: "merge",
};

export default function ProjectCard({
  repo,
  extraTags = [],
  owner,
  role,
  commits,
}: {
  repo: GitHubRepoData;
  extraTags?: string[];
  owner?: string;
  role?: "sole-author" | "lead" | "contributor";
  commits?: number;
}) {
  const dateRange =
    repo.created_at.slice(0, 10) === repo.pushed_at.slice(0, 10)
      ? fmtDate(repo.created_at)
      : `${fmtDate(repo.created_at)} — ${fmtDate(repo.pushed_at)}`;

  const topics =
    repo.topics && repo.topics.length > 0 ? repo.topics.slice(0, 5) : [];

  const rawTags = [
    ...(repo.language ? [repo.language] : []),
    ...extraTags.filter(
      (t) => t.toLowerCase() !== repo.language?.toLowerCase(),
    ),
    ...topics.filter(
      (t) =>
        t.toLowerCase() !== repo.language?.toLowerCase() &&
        !extraTags.some((e) => e.toLowerCase() === t.toLowerCase()),
    ),
  ];
  const allTags = [...new Set(rawTags.map((t) => t.toLowerCase()))]
    .map((t) => rawTags.find((r) => r.toLowerCase() === t) ?? t)
    .slice(0, 6);

  return (
    <Spotlight className="live-card group relative flex h-full flex-col overflow-hidden rounded-xl border border-mocha-surface bg-mocha-base p-5 transition-colors duration-300 sm:p-6">
      <Link
        href={`/projects/${owner ?? "Implycitt"}/${repo.name}`}
        aria-label={`View ${repo.name} details`}
        className="absolute inset-0 z-0"
      />

      <div className="pointer-events-none relative z-10 flex flex-1 flex-col">
        <div className="mb-2 flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.12em] text-mocha-overlay0">
          <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
            {owner && (
              <span className="break-all text-mocha-mauve/80">{owner}</span>
            )}
            <span>{dateRange}</span>
          </span>
          {role && (
            <span
              className={`flex shrink-0 items-center gap-1.5 rounded-md border px-1.5 py-0.5 tracking-[0.14em] uppercase ${ROLE_BADGES[role]}`}
            >
              <Icon name={ROLE_ICONS[role]} className="h-3 w-3" />
              {ROLE_LABELS[role]}
              {commits != null ? ` · ${commits}` : ""}
            </span>
          )}
        </div>

        <div className="flex items-start justify-between gap-4">
          <h3 className="font-mono text-lg font-bold text-mocha-text transition-colors duration-300 group-hover:text-mocha-lavender sm:text-xl">
            {repo.name}
          </h3>
          <div className="flex shrink-0 items-center gap-3 font-mono text-xs text-mocha-overlay0">
            {repo.stargazers_count > 0 && (
              <span className="flex items-center gap-1">
                <span className="text-mocha-pink transition-transform duration-300 group-hover:scale-110">
                  <Icon name="star" className="h-3.5 w-3.5" />
                </span>{" "}
                {repo.stargazers_count}
              </span>
            )}
            {repo.forks_count > 0 && (
              <span className="flex items-center gap-1">
                <span className="text-mocha-sapphire">
                  <Icon name="fork" className="h-3.5 w-3.5" />
                </span>{" "}
                {repo.forks_count}
              </span>
            )}
            <a
              href={`https://github.com/${owner ?? "Implycitt"}/${repo.name}`}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Open ${repo.name} on GitHub`}
              className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-md border border-mocha-surface bg-mocha-mantle text-mocha-overlay1 transition-colors duration-300 hover:border-mocha-mauve hover:text-mocha-mauve"
            >
              <Icon name="github" className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {repo.description && (
          <p className="mt-2 line-clamp-2 font-mono text-sm leading-relaxed text-mocha-subtext">
            {repo.description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-4 pt-4">
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((t) => (
                <span
                  key={t}
                  className={`rounded-md border px-2.5 py-0.5 font-mono text-[10px] tracking-wide transition-transform duration-300 group-hover:-translate-y-px ${tagColor(t)}`}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <span
            aria-hidden
            className="mb-1 flex shrink-0 -translate-x-1 items-center text-mocha-overlay0 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-mocha-mauve group-hover:opacity-100"
          >
            <Icon name="arrowUpRight" className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Spotlight>
  );
}
