import type { Metadata } from "next";
import TerminalCard from "@/components/ui/TerminalCard";

export const metadata: Metadata = {
  title: "Projects — Quentin Bordelon",
};

interface ProjectLinks {
  live?: string;
  code?: string;
}

interface Project {
  id: string;
  name: string;
  desc: string;
  tags: string[];
  links: ProjectLinks;
  accent: "cyan" | "violet" | "mauve";
}

const PROJECTS: Project[] = [
  {
    id: "01",
    name: "AveResearch2026",
    desc: "Research project on birds (Aves) and urbanization. An API ingestion layer for a 600k+ record dataset, WorldPop raster density modeling with latitude corrected spherical trigonometry, and chi squared + regression analysis to isolate urbanization effects by taxon.",
    tags: ["python", "numpy", "scipy", "research"],
    links: { code: "https://github.com/Implycitt/AveResearch2026" },
    accent: "violet",
  },
  {
    id: "02",
    name: "PrintIt",
    desc: "Label printing software for an active retail business. A JavaFX desktop app with a searchable, categorized SQLite backed label catalog that cut printing time by ~50% for non technical staff.",
    tags: ["java", "javafx", "maven", "sqlite"],
    links: { code: "https://github.com/Implycitt/PrintIt" },
    accent: "cyan",
  },
  {
    id: "03",
    name: "gdsclsu",
    desc: "Fullstack platform for LSU's Google Developer Student Club - event checkins, member tracking, and workshop tooling for a 100+ member community across 20+ events.",
    tags: ["web", "fullstack", "community"],
    links: { code: "https://github.com/Implycitt/gdsclsu" },
    accent: "mauve",
  },
  {
    id: "04",
    name: "portfolio",
    desc: "My portfolio site.",
    tags: ["next.js", "typescript", "canvas", "raymarching"],
    links: { live: "https://quentinb.dev", code: "https://github.com/Implycitt/portfolio" },
    accent: "cyan",
  },
  {
    id: "05",
    name: "Guardium",
    desc: "A 2D tower defense game built in Rust with Bevy - defend a tower from incoming projectiles, built as the final project for Computer Science Principles.",
    tags: ["rust", "bevy", "gamedev"],
    links: { code: "https://github.com/Implycitt/Guardium" },
    accent: "violet",
  },
  {
    id: "06",
    name: "OpenMeteo",
    desc: "Weather app with 3D models showing current, low, and high temperatures, wind speed, precipitation, and more for any location. An updated version of a CAC 2023 submission.",
    tags: ["javascript", "3d", "weather", "api"],
    links: { code: "https://github.com/Implycitt/OpenMeteo" },
    accent: "mauve",
  },
];

const BANNER = String.raw`
  _ __   __ _ _ __   ___ _ __
 | '_ \ / _\` | '_ \ / _ \ '__|
 | |_) | (_| | |_) |  __/ |
 | .__/ \__, | .__/ \___|_|
 |_|    |___/|_|
`.replaceAll("\\`", "`");

export default function Projects() {
  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <div className="terminal-grid-bg pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-cyan/10 via-violet/10 to-mauve/10 blur-[130px]" />
      <div
        aria-hidden
        className="scanlines pointer-events-none fixed inset-0 z-40"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-30"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 pb-28 pt-28 sm:px-10 sm:pt-36">
        <pre
          aria-hidden
          className="select-none overflow-hidden font-mono text-[9px] leading-tight text-cyan/50 sm:text-xs sm:text-cyan/60"
        >
          {BANNER}
        </pre>

        <div className="mb-8 flex items-center gap-3 font-mono text-xs text-white/40">
          <span className="text-cyan">$</span>
          <span className="text-white/60">ls ./projects --color=always</span>
          <span className="terminal-caret inline-block h-3.5 w-2 bg-cyan" />
        </div>

        <p className="max-w-2xl font-mono text-sm leading-relaxed text-white/55">
          <span className="text-mauve">//</span> A working directory of things I've shipped - 
          experiments in rendering, platforms for student clubs, and a healthy dose of systems
          programming.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {PROJECTS.map((p) => (
            <TerminalCard key={p.id} path={`projects/${p.name}`} accent={p.accent} className="h-full">
              <div className="flex flex-col gap-4 font-mono">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] tracking-widest text-white/40"># {p.id}</p>
                    <h3 className="mt-1 text-xl font-bold text-white transition-colors group-hover:text-cyan">
                      {p.name}
                    </h3>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-white/60">{p.desc}</p>

                <div className="mt-auto flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-white/55 transition-colors group-hover:border-cyan/30 group-hover:text-cyan/80"
                    >
                      [{t}]
                    </span>
                  ))}
                </div>

                {(p.links.live || p.links.code) && (
                  <div className="flex gap-4 border-t border-white/5 pt-3 text-xs text-white/45">
                    {p.links.live && (
                      <a
                        href={p.links.live}
                        className="transition-colors hover:text-cyan"
                      >
                        ./run_demo.sh →
                      </a>
                    )}
                    {p.links.code && (
                      <a
                        href={p.links.code}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="transition-colors hover:text-cyan"
                      >
                        $ git clone ←
                      </a>
                    )}
                  </div>
                )}
              </div>
            </TerminalCard>
          ))}
        </div>

        <p className="mt-16 font-mono text-xs tracking-widest text-white/35">
          <span className="text-cyan">$</span> ls ./projects | wc -l
          <span className="terminal-caret ml-1 inline-block h-3 w-1.5 bg-cyan align-middle" />
        </p>
      </div>
    </main>
  );
}
