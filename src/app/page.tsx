import BlackHoleASCII from "@/components/BlackHoleASCII";
import AboutSection from "@/components/home/AboutSection";
import SocialsSection from "@/components/home/SocialsSection";
import MiscSection from "@/components/home/MiscSection";
import Reveal from "@/components/ui/Reveal";
import SectionLoader from "@/components/ui/SectionLoader";
import IntroSequence from "@/components/ui/IntroSequence";
import ScrollPrompt from "@/components/ui/ScrollPrompt";

export default function Home() {
  return (
    <main className="relative min-h-screen text-foreground">
      <IntroSequence />
      <ScrollPrompt />
      <BlackHoleASCII name="Quentin Bordelon" />

      <section
        aria-hidden
        className="relative flex h-[60vh] flex-col items-center justify-center gap-5"
      >
        <div className="h-12 w-px bg-gradient-to-b from-transparent via-cyan/60 to-transparent" />
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
          scroll to enter
        </p>
        <p className="animate-bounce font-mono text-sm text-cyan/70">▾</p>
      </section>

      <div className="relative z-10 bg-background">
        <div
          aria-hidden
          className="terminal-grid-bg pointer-events-none absolute inset-0"
        />

        <Reveal variant="pop" delay={0}>
          <AboutSection />
        </Reveal>

        <Reveal variant="pop" delay={80}>
          <MiscSection />
        </Reveal>

        <Reveal variant="pop" delay={160}>
          <SocialsSection />
        </Reveal>

        <Reveal variant="pop" delay={120}>
          <footer
            data-lenis-snap
            className="relative min-h-[40vh] flex items-center justify-center border-t border-white/5 py-10"
          >
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 font-mono text-xs tracking-widest text-white/40 sm:flex-row sm:px-10">
              <p>
                <span className="text-cyan">$</span> qb@portfolio:~$ echo "exit
                0"
              </p>
              <p className="uppercase tracking-[0.25em]">
                © 2026 Quentin Bordelon · compiled in the terminal
              </p>
            </div>
          </footer>
        </Reveal>
      </div>
      <SectionLoader />
    </main>
  );
}
