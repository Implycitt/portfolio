import SectionHeading from "@/components/ui/SectionHeading";
import TerminalCard from "@/components/ui/TerminalCard";

interface Interest {
  path: string;
  tag: string;
  title: string;
  blurb: string;
}

const INTERESTS: Interest[] = [
  {
    path: "chef.md",
    tag: "zen",
    title: "Cooking/Baking",
    blurb:
      "Unwinding with cooking or baking. Pasta is my main dish and browned butter cookies are my specialty.",
  },
  {
    path: "bmntn.rkt",
    tag: "health",
    title: "Badminton",
    blurb: "Hitting the court with friends in between classes.",
  },
  {
    path: "lift.cpp",
    tag: "health",
    title: "Gym",
    blurb:
      "Progressive overload, one rep at a time. Rest days are for squashing bugs.",
  },
  {
    path: "plane.sh",
    tag: "culture",
    title: "Traveling",
    blurb: "Chasing new timezones, local foods, and the perfect picture.",
  },
  {
    path: "L10n.json",
    tag: "culture",
    title: "Languages",
    blurb:
      "Fluent in English and French; currently learning Russian, German, and Italian.",
  },
  {
    path: "tea.md",
    tag: "zen",
    title: "Tea",
    blurb: "Loose leaf over bags. A proper cup of chamomile fixes everything.",
  },
];

export default function MiscSection() {
  return (
    <section
      id="misc"
      data-lenis-snap
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-16 sm:py-20"
    >
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 mx-auto h-[400px] w-[720px] rounded-full bg-gradient-to-tr from-cyan/10 via-violet/10 to-mauve/10 blur-[130px]" />

      <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-10">
        <SectionHeading
          prompt="cat ./sections/interests.md"
          title="Interests"
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INTERESTS.map((item) => (
            <TerminalCard
              key={item.path}
              path={item.path}
              accent={
                item.tag === "physics" || item.tag === "raytracing"
                  ? "violet"
                  : "cyan"
              }
              className="h-full"
            >
              <div className="flex flex-col gap-2 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">
                    {item.title}
                  </span>
                  <span className="rounded border border-white/10 px-2 py-0.5 text-[10px] tracking-widest uppercase text-mauve">
                    {item.tag}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-white/60">
                  {item.blurb}
                </p>
              </div>
            </TerminalCard>
          ))}
        </div>
      </div>
    </section>
  );
}