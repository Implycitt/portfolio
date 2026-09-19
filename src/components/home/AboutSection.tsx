import { existsSync } from "fs";
import path from "path";
import Image from "next/image";
import SectionHeading from "@/components/ui/SectionHeading";
import Panel from "@/components/ui/Panel";
import CountUp from "@/components/ui/CountUp";
import Spotlight from "@/components/ui/Spotlight";
import Reveal from "@/components/ui/Reveal";
import TiltFrame from "@/components/ui/TiltFrame";
import SectionField from "@/components/ui/SectionField";
import ScrollShift from "@/components/ui/ScrollShift";
import Icon, { type IconName } from "@/components/ui/icons";
import { fetchGitHubStats, fetchGitHubPullRequests } from "@/lib/github-stats";

const USERNAME = process.env.GITHUB_USERNAME ?? "Implycitt";

const HEADSHOT_FILE = [
  "headshot.jpg",
  "headshot.jpeg",
  "headshot.png",
  "headshot.webp",
].find((file) => existsSync(path.join(process.cwd(), "public", file)));

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

export default async function AboutSection() {
  const [stats, prs] = await Promise.all([
    fetchGitHubStats(USERNAME),
    fetchGitHubPullRequests(USERNAME),
  ]);

  const STATS: {
    key: string;
    value: string;
    note: string;
    icon: IconName;
    text: string;
    tile: string;
  }[] = [
    {
      key: "stars",
      value: stats ? fmt(stats.total_stars) : "--",
      note: "across public repos",
      icon: "star",
      text: "text-mocha-pink",
      tile: "border-mocha-pink/25 bg-mocha-pink/10",
    },
    {
      key: "followers",
      value: stats ? fmt(stats.followers) : "--",
      note: "on github",
      icon: "users",
      text: "text-mocha-mauve",
      tile: "border-mocha-mauve/25 bg-mocha-mauve/10",
    },
    {
      key: "public repos",
      value: stats ? fmt(stats.public_repos) : "--",
      note: "and counting",
      icon: "box",
      text: "text-mocha-sapphire",
      tile: "border-mocha-sapphire/25 bg-mocha-sapphire/10",
    },
    {
      key: "PRs merged",
      value: prs !== null ? fmt(prs) : "--",
      note: "authored",
      icon: "merge",
      text: "text-mocha-teal",
      tile: "border-mocha-teal/25 bg-mocha-teal/10",
    },
  ];

  const FACTS: {
    label: string;
    value: string;
    icon: IconName;
    tint: string;
  }[] = [
    {
      label: "studying",
      value: "CS + Physics",
      icon: "cap",
      tint: "border-mocha-mauve/25 bg-mocha-mauve/10 text-mocha-mauve",
    },
    {
      label: "based in",
      value: "Baton Rouge",
      icon: "pin",
      tint: "border-mocha-teal/25 bg-mocha-teal/10 text-mocha-teal",
    },
    {
      label: "on campus",
      value: "GDSC @ LSU",
      icon: "briefcase",
      tint: "border-mocha-sapphire/25 bg-mocha-sapphire/10 text-mocha-sapphire",
    },
    {
      label: "status",
      value: "Open to work",
      icon: "sparkle",
      tint: "border-mocha-peach/25 bg-mocha-peach/10 text-mocha-peach",
    },
  ];

  const FOCUS: { label: string; icon: IconName; tint: string }[] = [
    {
      label: "quantitative finance",
      icon: "chart",
      tint: "border-mocha-mauve/30 bg-mocha-mauve/10 text-mocha-mauve",
    },
    {
      label: "algorithms",
      icon: "code",
      tint: "border-mocha-blue/30 bg-mocha-blue/10 text-mocha-blue",
    },
    {
      label: "systems & tooling",
      icon: "cpu",
      tint: "border-mocha-teal/30 bg-mocha-teal/10 text-mocha-teal",
    },
    {
      label: "physics simulation",
      icon: "flask",
      tint: "border-mocha-green/30 bg-mocha-green/10 text-mocha-green",
    },
    {
      label: "research & data",
      icon: "activity",
      tint: "border-mocha-peach/30 bg-mocha-peach/10 text-mocha-peach",
    },
    {
      label: "web platforms",
      icon: "globe",
      tint: "border-mocha-sapphire/30 bg-mocha-sapphire/10 text-mocha-sapphire",
    },
  ];

  return (
    <section
      id="about"
      data-lenis-snap
      className="relative flex min-h-screen items-center justify-center py-12 sm:py-16"
    >
      <SectionField backdrop="orbit" />

      <ScrollShift className="relative mx-auto flex w-full max-w-6xl flex-col px-6 sm:px-10">
        <Reveal variant="pop" className="order-1">
          <SectionHeading
            title="About"
            icon={<Icon name="terminal" className="h-5 w-5" />}
          />
        </Reveal>
        <div className="order-2 mt-8 grid gap-8 lg:order-3 lg:grid-cols-[1.4fr_0.9fr]">
          <Reveal variant="pop" className="h-fit">
            <Panel
              title="Bio"
              icon={<Icon name="user" className="h-3.5 w-3.5" />}
              className="h-full"
            >
              <div className="space-y-4 font-mono text-[13px] leading-normal text-mocha-subtext sm:text-base sm:leading-relaxed">
                <p>
                  <span className="text-mocha-text font-bold">
                    I&apos;m Quentin
                  </span>{" "}
                  - a <span className="text-mocha-text">Computer Science</span>{" "}
                  and <span className="text-mocha-text">Physics</span>{" "}
                  undergraduate student at Louisiana State University,
                  interested in the intersection of software and physics.
                </p>
                <p>
                  Beyond the classroom I serve as the{" "}
                  <span className="text-mocha-text">
                    Webmaster for LSU&apos;s Google Developer Student Club
                  </span>
                  , where I build internal platform tools like the club chapters
                  website, lead technical student workshops, and organize events
                  such as LSU&apos;s annual hackathon Geauxhack.
                </p>
                <p>
                  I recently completed a software engineering internship at{" "}
                  <span className="text-mocha-text">FAST Enterprises</span>,
                  working with the{" "}
                  <span className="text-mocha-text">
                    Illinois Department of Revenue
                  </span>
                  .
                </p>
                <p>
                  I&apos;m at home where a clean model and a fast implementation
                  both matter. I&apos;m looking for an internship or new-grad
                  role in algorithms, systems, or quantitative software.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-mocha-surface pt-3.5 sm:grid-cols-4">
                {FACTS.map((fact) => (
                  <div
                    key={fact.label}
                    className="group flex items-center gap-2.5"
                  >
                    <span
                      className={`interest-tile flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${fact.tint}`}
                    >
                      <Icon name={fact.icon} className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[9px] tracking-[0.2em] text-mocha-overlay0 uppercase">
                        {fact.label}
                      </span>
                      <span className="block font-mono text-[11px] leading-tight text-mocha-text">
                        {fact.value}
                      </span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[9px] tracking-[0.2em] text-mocha-overlay0 uppercase">
                  focus
                </span>
                {FOCUS.map((item) => (
                  <span
                    key={item.label}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] tracking-wide transition-colors duration-300 ${item.tint}`}
                  >
                    <Icon name={item.icon} className="h-3 w-3" />
                    {item.label}
                  </span>
                ))}
              </div>
            </Panel>
          </Reveal>

          <Reveal
            variant="pop"
            delay={120}
            className="mx-auto w-full max-w-[210px] self-center sm:max-w-[280px] lg:max-w-none"
          >
            <TiltFrame
              className={`group relative w-full overflow-hidden rounded-xl border aspect-[4/5] ${
                HEADSHOT_FILE
                  ? "border-mocha-surface bg-mocha-base"
                  : "border-dashed border-mocha-surface bg-mocha-base"
              }`}
            >
              {HEADSHOT_FILE ? (
                <>
                  <Image
                    src={`/${HEADSHOT_FILE}`}
                    alt="Quentin Bordelon"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 800px"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                    quality={90}
                    priority
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-mocha-crust/85 via-mocha-crust/10 to-mocha-mauve/10"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-mocha-mauve/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5 font-mono">
                    <span className="text-sm font-bold text-mocha-text">
                      Quentin Bordelon
                    </span>
                    <span className="flex items-center gap-2 text-[10px] tracking-[0.18em] text-mocha-subtext uppercase">
                      <span className="status-dot h-1.5 w-1.5 rounded-full bg-mocha-teal" />
                      CS + Physics @ LSU
                    </span>
                  </span>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center font-mono">
                    <p className="text-4xl text-mocha-overlay0">▢</p>
                    <p className="mt-3 text-xs tracking-widest text-mocha-overlay1 uppercase">
                      headshot
                    </p>{" "}
                    <p className="mt-1.5 text-[10px] text-mocha-overlay0">
                      upload to /public/headshot.jpg
                    </p>
                  </div>
                </div>
              )}
            </TiltFrame>
          </Reveal>
        </div>{" "}
        <div className="order-3 mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:order-2 lg:mt-8">
          {STATS.map((stat, i) => (
            <Reveal
              key={stat.key}
              variant="pop"
              delay={i * 70}
              className="h-full"
            >
              <Spotlight className="live-card group flex h-full flex-col rounded-xl border border-mocha-surface bg-mocha-base p-3.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`interest-tile flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${stat.tile} ${stat.text}`}
                  >
                    <Icon name={stat.icon} className="h-3.5 w-3.5" />
                  </span>
                  <p className="font-mono text-[10px] tracking-[0.18em] text-mocha-overlay1 uppercase">
                    {stat.key}
                  </p>
                </div>
                <p
                  className={`mt-auto pt-2.5 font-mono text-2xl font-bold tabular-nums sm:text-3xl ${stat.text}`}
                >
                  <CountUp value={stat.value} />
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-mocha-overlay0">
                  {stat.note}
                </p>
                <span
                  aria-hidden
                  className={`mt-2.5 block h-0.5 w-8 rounded-full bg-current opacity-60 transition-all duration-500 group-hover:w-14 ${stat.text}`}
                />
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </ScrollShift>
    </section>
  );
}
