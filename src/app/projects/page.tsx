export default function Projects() {
  return (
    <main>
      <div className="flex w-full flex-col items-stretch justify-center gap-8 md:flex-row">
        <div className="flex w-full max-w-80 flex-col justify-center items-center gap-6 rounded-2xl border-[1.5] border-solid border-rose bg-overlay p-5 text-center shadow-header">
          stuff
        </div>
        <div className="w-full min-w-0 rounded-2xl border-[1.5] border-solid border-rose bg-overlay p-5 shadow-header md:w-auto md:flex-1">
          Main container
        </div>
        <div className="flex w-full max-w-80 flex-col justify-center items-center gap-6 rounded-2xl border-[1.5] border-solid border-rose bg-overlay p-5 text-center shadow-header">
          stuff
        </div>
      </div>
    </main>
  )
}