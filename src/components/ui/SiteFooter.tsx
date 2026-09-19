import Link from "next/link";
import SectionField from "@/components/ui/SectionField";

const SITE_LINKS = [
  { label: "home", href: "/" },
  { label: "projects", href: "/projects" },
  { label: "resume", href: "/resume" },
  { label: "blog", href: "/blog" },
];

const ELSEWHERE = [
  { label: "github", href: "https://github.com/Implycitt", external: true },
  {
    label: "linkedin",
    href: "https://www.linkedin.com/in/quentinbordelon",
    external: true,
  },
  { label: "email", href: "mailto:qgbordelon@gmail.com", external: false },
];

const STACK = [
  { label: "next.js 16", accent: "text-mocha-text" },
  { label: "react 19", accent: "text-mocha-sapphire" },
  { label: "tailwind 4", accent: "text-mocha-teal" },
];

export default function SiteFooter({ exit }: { exit: string }) {
  return (
    <footer data-lenis-snap className="relative py-16 sm:py-20">
      <SectionField backdrop="horizon" />

      <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-mono text-[11px] tracking-[0.25em] text-mocha-overlay1 uppercase">
              site
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {SITE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-mono text-sm text-mocha-subtext transition-colors hover:text-mocha-lavender"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <p className="mt-6 max-w-sm font-mono text-xs leading-relaxed text-mocha-overlay1">
              Computer science and physics at LSU, building software and tooling
              where engineering, physics and math overlap.
            </p>
          </div>

          <div>
            <p className="font-mono text-[11px] tracking-[0.25em] text-mocha-overlay1 uppercase">
              elsewhere
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {ELSEWHERE.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer noopener" : undefined}
                  className="group flex items-center gap-2 font-mono text-sm text-mocha-subtext transition-colors hover:text-mocha-mauve"
                >
                  <span
                    aria-hidden
                    className="text-mocha-overlay0 transition-transform duration-300 group-hover:translate-x-0.5"
                  >
                    ↳
                  </span>
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[11px] tracking-[0.25em] text-mocha-overlay1 uppercase">
              built with
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {STACK.map((item) => (
                <span
                  key={item.label}
                  className={`rounded-md border border-mocha-surface bg-mocha-mantle px-2.5 py-1 font-mono text-[10px] tracking-wide ${item.accent}`}
                >
                  {item.label}
                </span>
              ))}
            </div>
            <a
              href="#top"
              className="mt-6 inline-flex items-center gap-2 font-mono text-xs tracking-widest text-mocha-overlay1 uppercase transition-colors hover:text-mocha-lavender"
            >
              <span aria-hidden>↑</span> back to top
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-6 border-t border-mocha-surface/60 pt-10">
          <pre className="ascii-block">{exit}</pre>
          <p className="font-mono text-[10px] tracking-widest text-mocha-overlay0 uppercase">
            © 2026 Quentin Bordelon
          </p>
        </div>
      </div>
    </footer>
  );
}
