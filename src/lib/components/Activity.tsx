import type { GitHubMergedPullRequest } from "@/lib/github-stats";

const HEATMAP_DAYS = 91;

const HEATMAP_LEVELS = [
  "bg-rose/10",
  "bg-rose/25",
  "bg-rose/45",
  "bg-rose/70",
  "bg-rose",
] as const;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function heatLevel(count: number, max: number) {
  if (count <= 0) return 0;

  const ratio = count / max;

  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

export function Heatmap({
  days,
}: {
  days: { count: number }[];
}) {
  const recent = Array.from({ length: HEATMAP_DAYS }, (_, index) => {
    const sourceIndex = days.length - HEATMAP_DAYS + index;
    return sourceIndex >= 0 ? (days[sourceIndex]?.count ?? 0) : 0;
  });

  const max = Math.max(1, ...recent);
  const total = recent.reduce((sum, count) => sum + count, 0);
  const weeks = Array.from({ length: 13 }, (_, weekIndex) =>
    recent.slice(weekIndex * 7, weekIndex * 7 + 7),
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[9px] uppercase tracking-[0.12em] text-subtle">
          contributions
        </p>
      </div>

      <div
        role="img"
        aria-label={`${total} contributions over the last 13 weeks`}
        className="mt-3 flex gap-1"
      >
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-1 flex-col gap-1">
            {week.map((count, dayIndex) => (
              <span
                key={dayIndex}
                title={`${count} contribution${count === 1 ? "" : "s"}`}
                className={`aspect-square w-full rounded-[2px] ${
                  HEATMAP_LEVELS[heatLevel(count, max)]
                }`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-center gap-1 text-[9px] uppercase tracking-[0.12em] text-subtle">
        <span className="mr-1">Less</span>
        {HEATMAP_LEVELS.map((className, index) => (
          <span
            key={index}
            className={`size-2 rounded-[2px] ${className}`}
          />
        ))}
        <span className="ml-1">More</span>
      </div>
    </div>
  );
}

export function RecentPRs({
  pullRequests,
}: {
  pullRequests: GitHubMergedPullRequest[] | null;
}) {
  if (pullRequests === null) {
    return (
      <p className="text-xs text-subtle">
        No prs
      </p>
    );
  }

  if (pullRequests.length === 0) {
    return <p className="text-xs text-subtle">No prs</p>;
  }

  return (
    <ul className="space-y-2">
      {pullRequests.slice(0, 4).map((pr) => (
        <li key={pr.url}>
          <a
            href={pr.url}
            target="_blank"
            rel="noreferrer"
            className="group block rounded-xl border border-rose/15 bg-background/30 p-2.5 transition-colors hover:border-rose/50 hover:bg-background/50"
          >
            <div className="flex items-center justify-between gap-2 text-[9px] uppercase tracking-[0.1em] text-subtle">
              <span className="min-w-0 truncate text-rose/80">
                {pr.repository}
              </span>
              <span className="shrink-0">#{pr.number}</span>
            </div>

            <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-text transition-colors group-hover:text-rose">
              {pr.title}
            </p>

            <time
              dateTime={pr.mergedAt}
              className="mt-1 block text-[9px] text-subtle"
            >
              Merged {dateFormatter.format(new Date(pr.mergedAt))}
            </time>
          </a>
        </li>
      ))}
    </ul>
  );
}