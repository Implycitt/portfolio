import BlackHoleASCII from "@/components/BlackHoleASCII";
import AboutSection from "@/components/home/AboutSection";
import FeaturedSection from "@/components/home/FeaturedSection";
import SocialsSection from "@/components/home/SocialsSection";
import MiscSection from "@/components/home/MiscSection";
import Reveal from "@/components/ui/Reveal";
import IntroSequence from "@/components/ui/IntroSequence";
import ScrollPrompt from "@/components/ui/ScrollPrompt";
import SectionLoader from "@/components/ui/SectionLoader";
import SiteFooter from "@/components/ui/SiteFooter";

const CHARSET = " .:-=+*#%@";

function frame(lines: string[], label: string): string {
  const width = Math.max(...lines.map((line) => line.length));
  const head = `-- ${label} `;
  return [
    `+${head}${"-".repeat(Math.max(0, width + 2 - head.length))}+`,
    ...lines.map((line) => `| ${line.padEnd(width)} |`),
    `+${"-".repeat(width + 2)}+`,
  ].join("\n");
}

function rule(label: string, width = 44): string {
  const head = `-- ${label} `;
  return `+${head}${"-".repeat(Math.max(0, width - head.length - 2))}+`;
}

const SESSION = frame(
  [
    `$ ./raster --charset "${CHARSET}"`,
    "  scroll: fill > dissolve > reveal",
    "  cell 12px, canvas 2d, requestAnimationFrame",
  ],
  "session",
);

const SCROLL_RULE = {
  compact: rule("scroll to enter", 34),
  wide: rule("scroll to enter", 44),
};

const SECTIONS_RULE = {
  compact: rule("~/portfolio/sections", 40),
  wide: rule("~/portfolio/sections", 58),
};

const EXIT = frame(
  [
    `$ echo "exit 0"`,
    "[process completed]",
    "",
    "(c) 2026 Quentin Bordelon",
    "compiled in the terminal",
  ],
  "session ended",
);

export default function Home() {
  return (
    <main
      id="content"
      tabIndex={-1}
      className="relative min-h-screen text-foreground"
    >
      <IntroSequence />
      <ScrollPrompt />
      <SectionLoader />
      <BlackHoleASCII name="Quentin Bordelon" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-screen"
      >
        <pre className="ascii-block absolute bottom-8 left-6 hidden lg:block">
          {SESSION}
        </pre>
        <pre className="ascii-block absolute bottom-8 right-6 hidden text-right lg:block">
          {rule(CHARSET, 26)}
        </pre>
      </div>

      <section
        aria-hidden
        className="relative flex h-[60vh] flex-col items-center justify-center gap-4"
      >
        <pre className="ascii-block sm:hidden">{SCROLL_RULE.compact}</pre>
        <pre className="ascii-block hidden sm:block">{SCROLL_RULE.wide}</pre>
        <p className="font-mono text-[11px] tracking-widest text-white/45">
          <span className="text-cyan">qb@portfolio:~$</span> cd ./sections
          <span className="terminal-caret ml-1 inline-block h-3.5 w-2 bg-cyan align-middle" />
        </p>
      </section>

      <div className="page-flow relative z-10 overflow-hidden">
        <div aria-hidden className="page-drift" />
        <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-10">
          {" "}
          <pre aria-hidden className="ascii-block pt-16 sm:hidden">
            {SECTIONS_RULE.compact}
          </pre>
          <pre aria-hidden className="ascii-block hidden pt-16 sm:block">
            {SECTIONS_RULE.wide}
          </pre>
        </div>

        <Reveal variant="pop" delay={0}>
          <AboutSection />
        </Reveal>

        <Reveal variant="pop" delay={80}>
          <FeaturedSection />
        </Reveal>

        <Reveal variant="pop" delay={80}>
          <MiscSection />
        </Reveal>

        <Reveal variant="pop" delay={160}>
          <SocialsSection />
        </Reveal>

        <Reveal variant="pop" delay={120}>
          <SiteFooter exit={EXIT} />
        </Reveal>
      </div>
    </main>
  );
}
