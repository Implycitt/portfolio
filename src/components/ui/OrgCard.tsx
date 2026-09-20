import Image from "next/image";
import Link from "next/link";
import Spotlight from "@/components/ui/Spotlight";
import Icon from "@/components/ui/icons";
import type { GitHubOrgData } from "@/lib/github-repos";

export default function OrgCard({
  org,
  stats,
}: {
  org: GitHubOrgData;
  stats?: { commits: number; repos: number };
}) {
  const isClub = org.type !== "Organization";

  return (
    <Spotlight className="live-card group relative flex flex-col overflow-hidden rounded-xl border border-mocha-surface bg-mocha-base p-5 transition-colors duration-300 hover:border-mocha-overlay0 sm:p-6">
      <div className="flex items-center gap-4">
        <span className="relative shrink-0 overflow-hidden rounded-lg border border-mocha-surface bg-mocha-mantle">
          <Image
            src={org.avatar_url}
            alt={org.login}
            width={48}
            height={48}
            className="h-12 w-12 object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-mono text-base font-bold text-mocha-text transition-colors group-hover:text-mocha-mauve">
            {org.name}
          </h3>
          <p className="flex items-center gap-1.5 font-mono text-[10px] tracking-wide text-mocha-overlay0">
            <span className="text-mocha-sapphire">
              <Icon name={isClub ? "users" : "building"} className="h-3 w-3" />
            </span>
            @{org.login}
            <span className="text-mocha-surface">·</span>
            {isClub ? "club" : "org"}
          </p>
        </div>
      </div>

      {org.description && (
        <p className="mt-3 line-clamp-2 font-mono text-sm leading-relaxed text-mocha-subtext">
          {org.description}
        </p>
      )}

      {org.blog && (
        <a
          href={org.blog.startsWith("http") ? org.blog : `https://${org.blog}`}
          target="_blank"
          rel="noreferrer noopener"
          className="group/site mt-3 inline-flex items-center gap-2 font-mono text-xs text-mocha-mauve/80 transition-colors hover:text-mocha-mauve"
        >
          <Icon name="link" className="h-3.5 w-3.5" />
          {org.blog.replace(/^https?:\/\//, "")}
        </a>
      )}

      {stats && stats.commits > 0 && (
        <div className="mt-3 flex items-center gap-2 font-mono text-[11px] tracking-wide text-mocha-subtext">
          <Icon name="commit" className="h-3.5 w-3.5 text-mocha-teal" />
          <span>
            <span className="font-bold tabular-nums text-mocha-teal">
              {stats.commits}
            </span>{" "}
            commits across{" "}
            <span className="font-bold tabular-nums text-mocha-teal">
              {stats.repos}
            </span>{" "}
            repo{stats.repos === 1 ? "" : "s"}
          </span>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between pt-4 font-mono text-[11px] tracking-wide text-mocha-subtext">
        <span className="flex items-center gap-2">
          <Icon name="box" className="h-3.5 w-3.5 text-mocha-sapphire" />
          <span className="font-bold tabular-nums text-mocha-text">
            {org.public_repos}
          </span>
          public repos
        </span>
        <Link
          href={org.html_url}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 text-mocha-overlay1 transition-colors hover:text-mocha-mauve"
        >
          view org
          <Icon
            name="arrowUpRight"
            className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>
    </Spotlight>
  );
}
