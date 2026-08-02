import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import TerminalCard from "@/components/ui/TerminalCard";
import ResumeDownload from "@/components/ui/ResumeDownload";

export const metadata: Metadata = {
  title: "Resume — Quentin Bordelon",
};

export const dynamic = "force-dynamic";

const EXPERIENCE = [
  {
    role: "Implementation Consultant Intern",
    org: "FAST Enterprises",
    period: "May 2026 — Aug 2026",
    points: [
      "Configured, tested, and deployed software solutions for government agency clients, tailoring core system workflows to meet specific regulatory requirements and operational needs.",
      "Supported an active rollout on the production support team, maintaining the GenTax environment to minimize errors for user-facing services.",
      "Architected and optimized complex SQL queries across 1M+ row taxpayer tables to ensure seamless integration and functionality across various tax subsystems.",
      "Engineered custom features and modernized legacy codebases by rewriting core VB.NET services into high-performance C#, improving maintainability and execution speed across enterprise modules.",
    ],
  },
];

const SKILLS = [
  ["C++", "90%"],
  ["Python", "85%"],
  ["Java", "80%"],
  ["Rust", "80%"],
  ["TypeScript", "85%"],
  ["C#", "75%"],
  ["SQL (SQL Server)", "85%"],
  ["Go", "70%"],
];

const EDUCATION = [
  {
    role: "B.S. Computer Science & Physics",
    org: "Louisiana State University",
    period: "Aug 2025 — May 2029",
    points: ["Concentration on the intersection of software engineering and physics."],
  },
];

const LEADERSHIP = [
  {
    role: "Webmaster",
    org: "LSU Google Developer Student Club",
    period: "Aug 2025 — present",
    points: [
      "Engineered and maintained full-stack web applications for a community of 100+ members, automating event check-ins and member tracking across 20+ technical workshops and events.",
      "Co-organized campus-wide hackathons with organizations like SASE, leading event logistics, venue scheduling, and developer marketing for 100+ student attendees.",
      "Mentored and collaborated with CS students to build proficiency in modern developer tools, frameworks, and Google technologies.",
    ],
  },
];

const SUMMARY = [
  "CS & Physics undergrad at LSU building software at the intersection of engineering and physics.",
  "Implementation Consultant Intern at FAST Enterprises, working on GovTech systems for state and local governments.",
  "Webmaster for LSU's Google Developer Student Club — full-stack platform tooling, hackathons, and mentorship.",
];

const TOOLS = [
  "Svelte",
  "Node.js",
  "React",
  "Three.js",
  "Firebase",
  "PyTorch",
  "NumPy",
  "PyQt6",
  "Matplotlib",
  "Git",
  "Docker",
  "Unix",
  "Bash",
  "PowerShell",
  "Tmux",
  "zsh",
];

const CONTACT = [
  {
    label: "email",
    value: "qborde1@lsu.edu",
    href: "mailto:qborde1@lsu.edu",
    cmd: "sendmail -t < message.txt",
  },
  {
    label: "github",
    value: "github.com/Implycitt",
    href: "https://github.com/Implycitt",
    cmd: "git clone github.com/Implycitt",
  },
  {
    label: "linkedin",
    value: "in/quentinbordelon",
    href: "https://www.linkedin.com/in/quentinbordelon",
    cmd: "curl linkedin.com/in/quentinbordelon",
  },
];

function Section({
  title,
  items,
}: {
  title: string;
  items: { role: string; org: string; period: string; points: string[] }[];
}) {
  return (
    <div>
      <h3 className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.25em] uppercase text-mauve">
        <span className="text-white/40">##</span> {title}
        <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </h3>
      <div className="space-y-6">
        {items.map((item) => (
          <div key={`${item.role}-${item.org}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-mono text-base font-bold text-white">
                {item.role} <span className="text-cyan">@ {item.org}</span>
              </p>
              <p className="font-mono text-xs text-white/40">{item.period}</p>
            </div>
            <ul className="mt-2 space-y-1.5">
              {item.points.map((pt) => (
                <li key={pt} className="flex gap-2 font-mono text-sm text-white/60">
                  <span className="text-cyan/70">▸</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Resume() {
  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden print:overflow-visible">
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[380px] w-[760px] rounded-full bg-gradient-to-tr from-cyan/10 via-violet/10 to-mauve/10 blur-[130px]" />

      <div className="relative mx-auto w-full max-w-5xl px-6 pb-28 pt-28 sm:px-10 sm:pt-36 print:max-w-none print:px-0 print:py-0">
        <div className="flex flex-wrap items-end justify-between gap-6 print:hidden">
          <SectionHeading prompt="cat ./resume.txt" title="Resume" />
          <ResumeDownload />
        </div>

        <p className="mt-6 max-w-2xl font-mono text-sm leading-relaxed text-white/55 print:hidden">
          <span className="text-mauve">//</span> A structured summary of education, experience, and
          skills. Headers double as terminal prompts because I can't help myself.
        </p>

        <div className="mt-12 space-y-10 print:mt-0">
          <TerminalCard path="cat ./summary.txt" accent="mauve">
            <div className="space-y-3 font-mono text-sm leading-relaxed text-white/75">
              {SUMMARY.map((line) => (
                <p key={line}>
                  <span className="text-mauve">▸</span> <span className="ml-2">{line}</span>
                </p>
              ))}
            </div>
          </TerminalCard>

          <TerminalCard path="resume.txt" accent="cyan">
            <div className="space-y-10 print:space-y-6">
              <Section title="Education" items={EDUCATION} />
              <Section title="Experience" items={EXPERIENCE} />
              <Section title="Leadership" items={LEADERSHIP} />
            </div>
          </TerminalCard>

          <TerminalCard path="skills" accent="violet">
            <h3 className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.25em] uppercase text-mauve">
              <span className="text-white/40">##</span> Skills
              <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </h3>
            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {SKILLS.map(([skill, level]) => {
                const pct = parseInt(level, 10);
                return (
                  <div key={skill} className="font-mono">
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-white/80">{skill}</span>
                      <span className="text-[11px] text-white/40">{level}</span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan via-violet to-mauve"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <h3 className="mb-4 mt-8 flex items-center gap-3 font-mono text-xs tracking-[0.25em] uppercase text-mauve">
              <span className="text-white/40">##</span> Toolchain
              <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {TOOLS.map((tool) => (
                <span
                  key={tool}
                  className="rounded border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-xs text-white/70 transition-colors duration-200 hover:border-cyan/40 hover:text-cyan"
                >
                  {tool}
                </span>
              ))}
            </div>
          </TerminalCard>

          <TerminalCard path="./contact" accent="violet">
            <h3 className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.25em] uppercase text-mauve">
              <span className="text-white/40">##</span> Contact
              <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {CONTACT.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel={c.href.startsWith("http") ? "noreferrer noopener" : undefined}
                  className="group flex flex-col gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-4 transition-all duration-300 hover:border-mauve/40 hover:bg-white/[0.04] hover:shadow-[0_0_24px_-8px_rgba(199,125,255,0.5)]"
                >
                  <span className="font-mono text-[10px] tracking-widest uppercase text-white/40">
                    <span className="text-cyan">$</span> {c.cmd}
                  </span>
                  <span className="font-mono text-sm font-bold text-white group-hover:text-mauve transition-colors">
                    {c.value}
                  </span>
                </a>
              ))}
            </div>
          </TerminalCard>
        </div>
      </div>
    </main>
  );
}
