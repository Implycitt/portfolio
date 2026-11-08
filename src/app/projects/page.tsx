import Carousel from "@/lib/components/Carousel";
import { getProjects } from "@/lib/projects";

export default async function Projects() {
  const projects = await getProjects();

  return (
    <main className="mx-auto my-auto w-full max-w-7xl p-4 sm:p-6 lg:p-10">
      <div className="flex w-full flex-col items-stretch justify-center gap-8 lg:flex-row lg:items-center">
        <aside className="mx-auto flex w-full max-w-80 flex-col items-center justify-center gap-4 rounded-2xl border-[1.5] border-solid border-rose bg-overlay p-5 text-center shadow-header lg:mx-0 lg:w-64">
          <p className="text-xs uppercase tracking-[0.2em] text-rose">
            proj
          </p>
          <p className="text-5xl font-bold text-love">
            {projects.length}
          </p>
          <p className="text-sm text-subtle">public proj</p>
          <div className="h-px w-16 bg-rose/30" />
        </aside>

        <div className="h-[58vh] min-h-[26rem] max-h-[38rem] w-full min-w-0 overflow-hidden rounded-2xl border-[1.5] border-solid border-rose bg-overlay shadow-header lg:w-auto lg:flex-1">
          <Carousel projects={projects} />
        </div>

        <aside className="mx-auto flex w-full max-w-80 flex-col items-center justify-center gap-4 rounded-2xl border-[1.5] border-solid border-rose bg-overlay p-5 text-center shadow-header lg:mx-0 lg:w-64">
          <p className="text-xs uppercase tracking-[0.2em] text-rose">
            Source
          </p>
          <a href="https://github.com/Implycitt" target="_blank" rel="noreferrer" className="text-lg font-bold">Implycitt</a>
        </aside>
      </div>
    </main>
  )
}