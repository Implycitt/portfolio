import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import TerminalCard from "@/components/ui/TerminalCard";
import ResumeDownload from "@/components/ui/ResumeDownload";

export const metadata: Metadata = {
  title: "Resume - Quentin Bordelon",
};

export const dynamic = "force-dynamic";

const EXPERIENCE = [
  {
    role: "Implementation Consultant Intern",
    org: "FAST Enterprises",
    period: "May 2026 - Aug 2026",
    points: [
      "Configured, tested, and deployed software solutions for government agency clients, tailoring core system workflows to meet specific regulatory requirements and operational needs.",
      "Supported an active rollout on the production support team, maintaining the GenTax environment to minimize errors for user facing services.",
      "Architected and optimized complex SQL queries across 1M+ row taxpayer tables to ensure seamless integration and functionality across various tax subsystems.",
      "Engineered custom features and modernized legacy codebases by rewriting core VB.NET services into high performance C#, improving maintainability and execution speed across enterprise modules.",
    ],
  },
];

const LANGUAGES = [
  "C++",
  "Python",
  "Java",
  "Rust",
  "TypeScript",
  "C#",
  "SQL (SQL Server)",
  "Go",
];

const FRAMEWORKS = [
  "Svelte",
  "Node.js",
  "React",
  "Three.js",
  "Firebase",
  "PyTorch",
  "NumPy",
  "PyQt6",
  "Matplotlib",
];

const TOOLS = [
  "Git",
  "Docker",
  "Unix",
  "Bash",
  "PowerShell",
  "Tmux",
  "zsh",
];

const EDUCATION = [
  {
    role: "B.S. Computer Science & Physics",
    org: "Louisiana State University",
    period: "Aug 2025 - May 2029",
    points: ["Concentration in Software Engineering."],
  },
];

const LEADERSHIP = [
  {
    role: "Webmaster",
    org: "LSU Google Developer Student Club",
    period: "Aug 2025 - present",
    points: [
      "Engineered and maintained fullstack web applications for a community of 100+ members, automating event checkins and member tracking across 20+ technical workshops and events.",
      "Co-organized campus wide hackathons with organizations like SASE, leading event logistics, venue scheduling, and developer marketing for 100+ student attendees.",
      "Mentored and collaborated with CS students to build proficiency in modern developer tools, frameworks, and Google technologies.",
    ],
  },
];

const SUMMARY = [
  "CS & Physics undergrad at LSU building software at the intersection of engineering and physics.",
  "Completed an Implementation Consultant internship at FAST Enterprises, supporting the GenTax active rollout for the Illinois Department of Revenue.",
  "Webmaster for LSU's Google Developer Student Club - full-stack platform tooling, hackathons, and mentorship.",
];

const SKILL_GROUPS = [
  { title: "Languages", items: LANGUAGES, hover: "hover:border-violet/40 hover:text-mauve" },
  { title: "Frameworks", items: FRAMEWORKS, hover: "hover:border-cyan/40 hover:text-cyan" },
  { title: "Tools", items: TOOLS, hover: "hover:border-mauve/40 hover:text-mauve" },
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
          skills. 
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
            <div className="space-y-8">
              {SKILL_GROUPS.map((group) => (
                <div key={group.title}>
                  <h3 className="mb-4 flex items-center gap-3 font-mono text-xs tracking-[0.25em] uppercase text-mauve">
                    <span className="text-white/40">##</span> {group.title}
                    <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className={`rounded border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-sm text-white/80 transition-colors duration-200 ${group.hover}`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TerminalCard>

        </div>
      </div>
    </main>
  );
}
