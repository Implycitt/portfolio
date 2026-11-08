import Carousel from "@/lib/components/Carousel";
import { fetchGitHubContributionTotals, fetchGitHubStats, fetchGitHubStreak, fetchRecentMergedPRs } from "@/lib/github-stats";
import { getProjects } from "@/lib/projects";
import { Language, Stat } from "@/lib/components/Sides";
import { Heatmap, RecentPRs } from "@/lib/components/Activity";

export default async function Projects() {
  const [projects, stats, streak, pullRequests, totals] = await Promise.all([
    getProjects(),
    fetchGitHubStats(),
    fetchGitHubStreak(),
    fetchRecentMergedPRs(),
    fetchGitHubContributionTotals()
  ]);

  return (
    <main className="mx-auto my-auto w-full max-w-7xl p-4 sm:p-6 lg:p-10">
      <div className="flex w-full flex-col items-stretch justify-center gap-8 lg:flex-row lg:items-center">
        <aside className="mx-auto flex w-full max-w-80 flex-col gap-4 rounded-2xl border-[1.5] border-solid border-rose bg-overlay p-5 text-left shadow-header lg:mx-0 lg:w-64">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.2em] text-rose">
              Github
            </p>
            <a href="https://github.com/Implycitt" target="_blank" rel="noreferrer" className="text-[10px] text-subtle hover:text-rose">@Implycitt</a>
          </div>

          {stats ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Followers" value={stats.followers} accent="rose" />
                <Stat label="Repos" value={stats.public_repos} accent="rose" />
                <Stat label="Forks" value={stats.total_forks} accent="love" />
                <Stat label="Stars" value={stats.total_stars} accent="love" />
                <Stat label="Contributions" value={streak?.totalContributions ?? 0} accent="iris" />
                <Stat label="Day Streak" value={streak?.currentStreak ?? 0} accent="iris" />
              </div>

              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-subtle">
                  Languages
                </p>
                <Language languages={stats.top_languages} />
              </div>
            </>
          ): (
            <p className="text-sm text-subtle">
              Stats not available
            </p>
          )}
          {streak ? (
            <p className="text-[10px] text-subtle">
              {streak.currentStreak} day streak {" "}
              {streak.totalContributions.toLocaleString("en-US")} this year
            </p>
            ) : (
              <p className="text-[10px] leading-4 text-subtle">
                no history 
              </p>
            )}
        </aside>
        

        <div className="h-[58vh] min-h-[26rem] max-h-[38rem] w-full min-w-0 overflow-hidden rounded-2xl border-[1.5] border-solid border-rose bg-overlay shadow-header lg:w-auto lg:flex-1">
          <Carousel projects={projects} />
        </div>

        <aside className="mx-auto flex w-full max-w-80 flex-col items-stretch justify-center gap-4 rounded-2xl border-[1.5px] border-solid border-rose bg-overlay p-5 text-center shadow-header lg:mx-0 lg:w-64">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.2em] text-rose">
              Activity
            </p>
          </div>
          <Heatmap days={streak?.days ?? []} />


            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-subtle">
                Recent merges
              </p>
              <RecentPRs pullRequests={pullRequests} />
            </div>
        </aside>
      </div>
    </main>
  )
}