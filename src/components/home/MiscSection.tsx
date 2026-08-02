import SectionHeading from "@/components/ui/SectionHeading";
import TerminalCard from "@/components/ui/TerminalCard";

const INTERESTS = [
  {
    path: "physics.md",
    tag: "field",
    title: "Physics",
    blurb: "GR, quantum, optics — the universe runs on surprisingly simple equations.",
  },
  {
    path: "raytracing.c",
    tag: "render",
    title: "Raytracing",
    blurb: "Black holes, lenses, and photons — three.js + GLSL when the CPU isn't enough.",
  },
  {
    path: "webapp.tsx",
    tag: "build",
    title: "Web Engineering",
    blurb: "Next.js, realtime platforms, and teaching students how the web actually works.",
  },
  {
    path: "terminal.sh",
    tag: "vibe",
    title: "Terminal Aesthetics",
    blurb: "If it can't be rendered in a character grid, is it even worth rendering?",
  },
  {
    path: "ml.py",
    tag: "learn",
    title: "Machine Learning",
    blurb: "Backprop, transformers, and why gradients flow where they do.",
  },
  {
    path: "coffee.md",
    tag: "fuel",
    title: "Espresso Engineering",
    blurb: "19-bar extraction curves. No, seriously — it's thermodynamics.",
  },
];

export default function MiscSection() {
  return (
    <section id="misc" className="relative min-h-screen snap-center flex items-center justify-center overflow-hidden py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 mx-auto h-[400px] w-[720px] rounded-full bg-gradient-to-tr from-cyan/10 via-violet/10 to-mauve/10 blur-[130px]" />

      <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-10">
        <SectionHeading prompt="ls ./interests" title="Interests" />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INTERESTS.map((item) => (
            <TerminalCard
              key={item.path}
              path={item.path}
              accent={item.tag === "physics" || item.tag === "raytracing" ? "violet" : "cyan"}
              className="h-full"
            >
              <div className="flex flex-col gap-2 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">{item.title}</span>
                  <span className="rounded border border-white/10 px-2 py-0.5 text-[10px] tracking-widest uppercase text-mauve">
                    {item.tag}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-white/60">{item.blurb}</p>
              </div>
            </TerminalCard>
          ))}
        </div>
      </div>
    </section>
  );
}
