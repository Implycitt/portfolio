import type { ReactNode } from "react";

import { Groups, Heatmap, RecentCommits, RecentPRs } from "@/lib/components/Activity";
import Carousel from "@/lib/components/Carousel";
import { Language, Stat } from "@/lib/components/Sides";
import {
    fetchGitHubContributionTotals,
    fetchGitHubGroups,
    fetchGitHubStats,
    fetchGitHubStreak,
    fetchRecentCommits,
    fetchRecentMergedPRs
} from "@/lib/github-stats";
import { getProjects } from "@/lib/projects";

export default async function Projects(): Promise<ReactNode> {
    const [projects, stats, streak, pullRequests, commits, groups, totals] = await Promise.all([
        getProjects(),
        fetchGitHubStats(),
        fetchGitHubStreak(),
        fetchRecentMergedPRs(),
        fetchRecentCommits(),
        fetchGitHubGroups(),
        fetchGitHubContributionTotals()
    ]);

    return (
        <main className="mx-auto my-auto w-full max-w-[110rem] p-4 sm:p-6 lg:p-10">
            <div className="flex w-full flex-col items-stretch justify-center gap-8 lg:flex-row lg:items-center">
                <aside className="mx-auto flex w-full max-w-80 flex-col gap-4 rounded-md border-[1.5] border-solid border-rose bg-overlay p-5 text-left shadow-header lg:mx-0 lg:w-64 xl:grid xl:w-[25rem] xl:max-w-none xl:grid-cols-2 xl:items-start xl:gap-5">
                    <div className="flex items-center justify-between gap-2 xl:col-span-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-rose">Github</p>
                        <a
                            href="https://github.com/Implycitt"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-subtle hover:text-rose"
                        >
                            @Implycitt
                        </a>
                    </div>

                    {stats ? (
                        <div className="grid grid-cols-2 gap-3 xl:col-span-2 xl:grid-cols-3">
                            <Stat label="Followers" value={stats.followers} accent="rose" />
                            <Stat label="Repos" value={stats.public_repos} accent="rose" />
                            <Stat label="Forks" value={stats.total_forks} accent="love" />
                            <Stat label="Stars" value={stats.total_stars} accent="love" />
                            <Stat label="Contributions" value={streak?.totalContributions ?? 0} accent="iris" />
                            <Stat label="Day Streak" value={streak?.currentStreak ?? 0} accent="iris" />
                        </div>
                    ) : (
                        <p className="text-sm text-subtle xl:col-span-2">Stats not available</p>
                    )}

                    {streak ? (
                        <p className="text-[10px] text-subtle xl:col-span-2">
                            {streak.currentStreak} day streak {streak.totalContributions.toLocaleString("en-US")} this
                            year
                        </p>
                    ) : (
                        <p className="text-[10px] leading-4 text-subtle xl:col-span-2">no history</p>
                    )}

                    <div className="flex min-w-0 flex-col gap-4">
                        {stats ? (
                            <div className="min-w-0">
                                <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-subtle">Languages</p>
                                <Language languages={stats.top_languages} />
                            </div>
                        ) : null}

                        {totals ? (
                            <div className="min-w-0">
                                <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-subtle">This year</p>
                                <ul className="space-y-1.5 text-[11px]">
                                    {[
                                        { label: "Commits", value: totals.commits },
                                        { label: "Pull requests", value: totals.pullRequests },
                                        { label: "Issues", value: totals.issues },
                                        { label: "Reviews", value: totals.reviews }
                                    ].map(({ label, value }) => (
                                        <li key={label} className="flex items-center justify-between gap-2 text-subtle">
                                            <span className="min-w-0 truncate">{label}</span>
                                            <span className="shrink-0">{value.toLocaleString("en-US")}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </div>

                    <div className="min-w-0">
                        <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-subtle">Recent pushes</p>
                        <RecentCommits commits={commits} />
                    </div>
                </aside>

                <div className="h-[58vh] min-h-104 max-h-152 w-full min-w-0 overflow-hidden border-[1.5] border-solid border-rose bg-overlay shadow-header lg:w-auto lg:flex-1">
                    <Carousel projects={projects} />
                </div>

                <div className="mx-auto flex w-full max-w-120 flex-col gap-4 rounded-md border-[1.5] border-solid border-rose bg-overlay p-5 text-left shadow-header lg:mx-1 lg:w-80 xl:grid xl:w-[30rem] xl:max-w-none xl:grid-cols-2 xl:items-start xl:gap-6">
                    <div className="flex items-center justify-between gap-2 xl:col-span-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-rose">Activity</p>
                    </div>

                    <div className="flex min-w-0 flex-col gap-3">
                        <p className="text-center text-[10px] uppercase tracking-[0.16em] text-subtle">Recent merges</p>
                        <RecentPRs pullRequests={pullRequests} />
                    </div>

                    <div className="flex min-w-0 flex-col gap-4">
                        <Heatmap days={streak?.days ?? []} />
                        <div>
                            <p className="text-center mb-2 text-[10px] uppercase tracking-[0.16em] text-subtle">
                                Groups
                            </p>
                            <Groups groups={groups} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
