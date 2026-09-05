import Image from "next/image";
import Link from "next/link";
import type { GitHubOrgData } from "@/lib/github-repos";

const ACCENT_COLORS: Record<string, string> = {
  cyan: "border-cyan/25 hover:border-cyan/50 hover:shadow-[0_0_24px_-4px_rgba(46,223,229,0.35)]",
  violet:
    "border-violet/30 hover:border-violet/50 hover:shadow-[0_0_24px_-4px_rgba(123,44,191,0.45)]",
  mauve:
    "border-mauve/30 hover:border-mauve/50 hover:shadow-[0_0_24px_-4px_rgba(199,125,255,0.4)]",
};

const ACCENTS = ["cyan", "violet", "mauve"] as const;

export default function OrgCard({
  org,
  index,
  stats,
}: {
  org: GitHubOrgData;
  index: number;
  stats?: { commits: number; repos: number };
}) {
  const a = ACCENTS[index % ACCENTS.length];

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-lg border bg-black/30 backdrop-blur-sm transition-all duration-300 hover-lift ${ACCENT_COLORS[a]} p-5 sm:p-6`}
    >
      <div className="flex items-center gap-4">
        <Image
          src={org.avatar_url}
          alt={org.login}
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-md border border-white/15 bg-black/40 object-cover"
        />
        <div className="min-w-0">
          <h3 className="truncate font-mono text-base font-bold text-white transition-colors group-hover:text-cyan">
            {org.name}
          </h3>
          <p className="font-mono text-[10px] tracking-wide text-white/35">
            @{org.login}
            <span className="mx-1.5 text-white/20">·</span>
            {org.type === "Organization" ? "org" : "club"}
          </p>
        </div>
      </div>

      {org.description && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/55">
          {org.description}
        </p>
      )}

      {org.blog && (
        <a
          href={org.blog.startsWith("http") ? org.blog : `https://${org.blog}`}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-3 inline-flex items-center gap-2 font-mono text-xs text-mauve/70 transition-colors hover:text-mauve"
        >
          <span className="text-mauve">→</span>{" "}
          {org.blog.replace(/^https?:\/\//, "")}
        </a>
      )}

      {stats && stats.commits > 0 && (
        <div className="mt-3 flex items-center gap-2 font-mono text-[10px] tracking-wide text-cyan/70">
          <span className="text-cyan">▸</span>
          <span>
            {stats.commits} commits across {stats.repos} repo
            {stats.repos === 1 ? "" : "s"}
          </span>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="font-mono text-[10px] tracking-wide text-white/35">
          {org.public_repos} public repos
        </span>
        <Link
          href={org.html_url}
          target="_blank"
          rel="noreferrer noopener"
          className="font-mono text-xs text-white/50 transition-colors hover:text-cyan"
        >
          view org →
        </Link>
      </div>

      <div className="scan-line pointer-events-none absolute inset-x-0 top-0 h-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}
