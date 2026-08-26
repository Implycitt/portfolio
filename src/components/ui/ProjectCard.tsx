import Link from "next/link";
import type { GitHubRepoData } from "@/lib/github-repos";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}

const ACCENT_COLORS: Record<string, string> = {
  cyan: "border-cyan/25 hover:border-cyan/50 hover:shadow-[0_0_24px_-4px_rgba(46,223,229,0.35)]",
  violet: "border-violet/30 hover:border-violet/50 hover:shadow-[0_0_24px_-4px_rgba(123,44,191,0.45)]",
  mauve: "border-mauve/30 hover:border-mauve/50 hover:shadow-[0_0_24px_-4px_rgba(199,125,255,0.4)]",
};

const ACCENTS = ["cyan", "violet", "mauve"] as const;

const ROLE_BADGES: Record<
  string,
  { label: string; cls: string }
> = {
  "sole-author": {
    label: "sole author",
    cls: "border-amber-400/30 bg-amber-400/10 text-amber-300/90",
  },
  lead: {
    label: "lead",
    cls: "border-cyan/30 bg-cyan/10 text-cyan/90",
  },
  contributor: {
    label: "contributor",
    cls: "border-violet/30 bg-violet/10 text-violet/90",
  },
};

export default function ProjectCard({
  repo,
  index,
  accent,
  extraTags = [],
  owner,
  role,
  commits,
}: {
  repo: GitHubRepoData;
  index: number;
  accent?: (typeof ACCENTS)[number];
  extraTags?: string[];
  owner?: string;
  role?: "sole-author" | "lead" | "contributor";
  commits?: number;
}) {
  const a = accent ?? ACCENTS[index % ACCENTS.length];
  const dateRange =
    repo.created_at.slice(0, 10) === repo.pushed_at.slice(0, 10)
      ? fmtDate(repo.created_at)
      : `${fmtDate(repo.created_at)} — ${fmtDate(repo.pushed_at)}`;

  const topics =
    repo.topics && repo.topics.length > 0
      ? repo.topics.slice(0, 5)
      : [];

  const rawTags = [
    ...(repo.language ? [repo.language] : []),
    ...extraTags.filter(
      (t) => t.toLowerCase() !== repo.language?.toLowerCase()
    ),
    ...topics.filter(
      (t) =>
        t.toLowerCase() !== repo.language?.toLowerCase() &&
        !extraTags.some((e) => e.toLowerCase() === t.toLowerCase())
    ),
  ];
  const allTags = [...new Set(rawTags.map((t) => t.toLowerCase()))]
    .map((t) => rawTags.find((r) => r.toLowerCase() === t) ?? t)
    .slice(0, 6);

  const roleBadge = role ? ROLE_BADGES[role] : null;

  return (
    <Link
      href={`/projects/${owner ?? "Implycitt"}/${repo.name}`}
      className={`group relative flex flex-col overflow-hidden rounded-lg border bg-black/30 backdrop-blur-sm transition-all duration-300 hover-lift ${ACCENT_COLORS[a]} p-5 sm:p-6`}
    >
      {owner && (
        <div className="mb-1 font-mono text-[10px] tracking-[0.12em] text-mauve/50">
          {owner} /
        </div>
      )}
      <div className="mb-2 flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.12em] text-white/35">
        <span>{dateRange}</span>
        {roleBadge && (
          <span
            className={`shrink-0 rounded border px-1.5 py-0.5 tracking-[0.14em] ${roleBadge.cls}`}
          >
            {roleBadge.label}
            {commits != null ? ` · ${commits}` : ""}
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-4">
        <h3 className="font-mono text-lg font-bold text-white transition-colors group-hover:text-cyan sm:text-xl">
          {repo.name}
        </h3>
        <div className="flex shrink-0 items-center gap-3 text-xs text-white/30">
          {repo.stargazers_count > 0 && (
            <span className="flex items-center gap-1">
              <span className="text-yellow-400/70">★</span> {repo.stargazers_count}
            </span>
          )}
          {repo.forks_count > 0 && (
            <span className="flex items-center gap-1">
              <span className="text-cyan/60">⑂</span> {repo.forks_count}
            </span>
          )}
        </div>
      </div>

      {repo.description && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/55">
          {repo.description}
        </p>
      )}

      {allTags.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {allTags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] tracking-wide text-white/50 transition-colors group-hover:border-cyan/25 group-hover:text-cyan/70"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="scan-line pointer-events-none absolute inset-x-0 top-0 h-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </Link>
  );
}