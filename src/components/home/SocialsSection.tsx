import SectionHeading from "@/components/ui/SectionHeading";

const SOCIALS = [
  {
    name: "github",
    href: "https://github.com/Implycitt",
    handle: "@Implycitt",
    cmd: "git clone github.com/Implycitt",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.8 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
      </svg>
    ),
  },
  {
    name: "linkedin",
    href: "https://www.linkedin.com",
    handle: "in/quentin-bordelon",
    cmd: "curl linkedin.com/in/quentin-bordelon",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0Z" />
      </svg>
    ),
  },
  {
    name: "email",
    href: "mailto:hello@quentinb.dev",
    handle: "hello@quentinb.dev",
    cmd: "sendmail -t < message.txt",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m2 7 10 6 10-6" />
      </svg>
    ),
  },
];

export default function SocialsSection() {
  return (
    <section id="socials" className="relative min-h-screen snap-center flex items-center justify-center overflow-hidden py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 mx-auto h-[380px] w-[680px] rounded-full bg-gradient-to-tr from-violet/10 to-mauve/10 blur-[120px]" />

      <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-10">
        <SectionHeading prompt="ls ./socials" title="Socials" />

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {SOCIALS.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel={s.href.startsWith("http") ? "noreferrer noopener" : undefined}
              className="group relative w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-all duration-300 hover:border-cyan/40 hover:bg-white/[0.04] hover:shadow-[0_0_30px_-8px_rgba(46,223,229,0.4)] hover-lift sm:w-[calc(50%-0.5rem)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] tracking-widest uppercase text-white/40">
                    <span className="text-cyan">$</span> {s.cmd}
                  </p>
                  <p className="mt-3 flex items-center gap-2 font-mono text-lg font-bold text-white transition-colors group-hover:text-cyan">
                    <span className="text-white/40 group-hover:text-cyan/70 transition-colors">
                      {s.icon}
                    </span>
                    {s.name}
                  </p>
                  <p className="mt-1 font-mono text-xs text-white/50">{s.handle}</p>
                </div>
                <span className="font-mono text-white/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-cyan">
                  →_
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
