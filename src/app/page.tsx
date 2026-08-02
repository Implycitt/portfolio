import BlackHoleASCII from "@/components/BlackHoleASCII";
import AboutSection from "@/components/home/AboutSection";
import SocialsSection from "@/components/home/SocialsSection";
import MiscSection from "@/components/home/MiscSection";
import Reveal from "@/components/ui/Reveal";
import BootSequence from "@/components/ui/BootSequence";
import SectionLoader from "@/components/ui/SectionLoader";

export default function Home() {
  return (
    <main className="relative min-h-screen text-foreground">
      <BlackHoleASCII name="Quentin Bordelon" />

      <BootSequence />

      <div className="relative z-10 bg-background">
        <div aria-hidden className="terminal-grid-bg pointer-events-none absolute inset-0" />

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
          <footer className="relative min-h-[40vh] snap-center flex items-center justify-center border-t border-white/5 py-10">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 font-mono text-xs tracking-widest text-white/40 sm:flex-row sm:px-10">
              <p>
                <span className="text-cyan">$</span> qb@portfolio:~$ echo "exit 0"
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
