import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import Panel from "@/components/ui/Panel";
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
      "Architected and optimized complex SQL queries across 100M+ row taxpayer tables, improving query execution performance by over 90% across various tax subsystems.",
      "Engineered custom features for tax subsystems as well as modernized legacy codebases by rewriting 20+ core VB.NET services into high-performance C#, improving maintainability and system execution speed across enterprise modules.",
      "Maintained the GenTax environment during an active production support rollout, isolating and resolving 20+ bugs across return, mailing, and account/customer subsystems, alongside one critical Core GenTax defect.",
      "Configured, tested, and deployed software solutions for the Illinois government agency, tailoring core system workflows to meet specific regulatory requirements and operational needs.",
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

const TOOLS = ["Git", "Docker", "Unix", "Bash", "PowerShell", "Tmux", "zsh"];

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
  { title: "Languages", items: LANGUAGES },
  { title: "Frameworks", items: FRAMEWORKS },
  { title: "Tools", items: TOOLS },
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
      <h3 className="mb-5 flex items-center gap-4 font-mono text-[11px] tracking-[0.25em] uppercase text-mocha-overlay1">
        {title}
        <span className="h-px flex-1 bg-mocha-surface" />
      </h3>
      <div className="space-y-6">
        {items.map((item) => (
          <div key={`${item.role}-${item.org}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-mono text-base font-bold text-mocha-text">
                {item.role}{" "}
                <span className="font-normal text-mocha-mauve">
                  @ {item.org}
                </span>
              </p>
              <p className="font-mono text-xs text-mocha-overlay0">
                {item.period}
              </p>
            </div>
            <ul className="mt-2 space-y-1.5">
              {item.points.map((pt) => (
                <li
                  key={pt}
                  className="flex gap-3 font-mono text-sm leading-relaxed text-mocha-subtext"
                >
                  <span aria-hidden className="text-mocha-mauve">
                    —
                  </span>
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
    <main
      id="content"
      tabIndex={-1}
      className="relative min-h-screen bg-background text-foreground overflow-hidden print:overflow-visible"
    >
      <div className="aurora pointer-events-none absolute inset-x-0 top-0 mx-auto h-[380px] w-[760px] rounded-full bg-gradient-to-tr from-mocha-mauve/18 via-mocha-lavender/10 to-mocha-sapphire/10 blur-[130px]" />

      <div className="relative mx-auto w-full max-w-5xl px-6 pb-28 pt-28 sm:px-10 sm:pt-36 print:max-w-none print:px-0 print:py-0">
        <div className="flex flex-col items-center gap-6 print:hidden">
          <SectionHeading title="Resume" align="center" />
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.linkedin.com/in/quentinbordelon"
              target="_blank"
              rel="noreferrer noopener"
              className="group inline-flex items-center gap-2 rounded-xl border border-mocha-surface bg-mocha-base px-5 py-2.5 font-mono text-xs tracking-widest uppercase text-mocha-subtext transition-colors duration-300 hover:border-mocha-mauve hover:text-mocha-text"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 text-mocha-overlay1 transition-colors group-hover:text-mocha-mauve"
              >
                <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0Z" />
              </svg>
              linkedin.com/in/quentinbordelon
            </a>
            <ResumeDownload />
          </div>
        </div>

        <div className="mt-12 space-y-6 print:mt-0">
          <Panel title="Summary" note="profile">
            <div className="space-y-3 font-mono text-sm leading-relaxed text-mocha-subtext">
              {SUMMARY.map((line) => (
                <p key={line} className="flex gap-3">
                  <span aria-hidden className="text-mocha-mauve">
                    —
                  </span>
                  <span>{line}</span>
                </p>
              ))}
            </div>
          </Panel>

          <Panel title="Background" note="education · experience · leadership">
            <div className="space-y-10 print:space-y-6">
              <Section title="Education" items={EDUCATION} />
              <Section title="Experience" items={EXPERIENCE} />
              <Section title="Leadership" items={LEADERSHIP} />
            </div>
          </Panel>

          <Panel title="Skills" note="tools I reach for">
            <div className="space-y-8">
              {SKILL_GROUPS.map((group) => (
                <div key={group.title}>
                  <h3 className="mb-4 flex items-center gap-4 font-mono text-[11px] tracking-[0.25em] uppercase text-mocha-overlay1">
                    {group.title}
                    <span className="h-px flex-1 bg-mocha-surface" />
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-md border border-mocha-surface bg-mocha-mantle px-3 py-1.5 font-mono text-sm text-mocha-subtext transition-colors duration-200 hover:border-mocha-mauve hover:text-mocha-text"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}
