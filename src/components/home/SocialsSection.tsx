import SectionHeading from "@/components/ui/SectionHeading";
import Spotlight from "@/components/ui/Spotlight";
import Reveal from "@/components/ui/Reveal";
import SectionField from "@/components/ui/SectionField";
import ScrollShift from "@/components/ui/ScrollShift";

const SOCIALS = [
  {
    name: "github",
    href: "https://github.com/Implycitt",
    handle: "@Implycitt",
    accent: "text-mocha-mauve",
    tile: "border-mocha-mauve/25 bg-mocha-mauve/10 group-hover:border-mocha-mauve/50",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.8 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
      </svg>
    ),
  },
  {
    name: "linkedin",
    href: "https://www.linkedin.com/in/quentinbordelon",
    handle: "in/quentinbordelon",
    accent: "text-mocha-sapphire",
    tile: "border-mocha-sapphire/25 bg-mocha-sapphire/10 group-hover:border-mocha-sapphire/50",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0Z" />
      </svg>
    ),
  },
  {
    name: "email",
    href: "mailto:qgbordelon@gmail.com",
    handle: "qgbordelon@gmail.com",
    accent: "text-mocha-pink",
    tile: "border-mocha-pink/25 bg-mocha-pink/10 group-hover:border-mocha-pink/50",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4.5 w-4.5"
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m2 7 10 6 10-6" />
      </svg>
    ),
  },
];

export default function SocialsSection() {
  return (
    <section
      id="socials"
      data-lenis-snap
      className="relative flex min-h-screen items-center justify-center py-16 sm:py-20"
    >
      <SectionField backdrop="ripples" />

      <ScrollShift className="relative mx-auto w-full max-w-6xl px-6 sm:px-10">
        <Reveal variant="pop">
          <SectionHeading title="Socials" />
        </Reveal>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {SOCIALS.map((s, i) => (
            <Reveal
              key={s.name}
              variant="pop"
              delay={i * 90}
              className="w-full sm:w-[calc(50%-0.5rem)]"
            >
              <a
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  s.href.startsWith("http") ? "noreferrer noopener" : undefined
                }
                className="social-card group flex h-full items-center justify-between gap-4 overflow-hidden rounded-xl border border-mocha-surface bg-mocha-base px-5 py-4"
              >
                <Spotlight className="flex min-w-0 flex-1 items-center justify-between gap-4 pl-1">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300 ${s.accent} ${s.tile}`}
                    >
                      {s.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-base font-semibold text-mocha-text">
                        {s.name}
                      </p>
                      <p className="truncate font-mono text-xs text-mocha-overlay1">
                        {s.handle}
                      </p>
                    </div>
                  </div>
                  <span
                    aria-hidden
                    className="shrink-0 font-mono text-sm text-mocha-overlay0 transition-colors duration-300 group-hover:text-mocha-mauve"
                  >
                    ↗
                  </span>
                </Spotlight>
              </a>
            </Reveal>
          ))}
        </div>
      </ScrollShift>
    </section>
  );
}
