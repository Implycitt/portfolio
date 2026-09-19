import type { ReactNode } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import Spotlight from "@/components/ui/Spotlight";
import Reveal from "@/components/ui/Reveal";
import SectionField from "@/components/ui/SectionField";
import ScrollShift from "@/components/ui/ScrollShift";
import Icon from "@/components/ui/icons";

interface Accent {
  text: string;
  tile: string;
  bar: string;
  rule: string;
}

const ACCENTS: Record<string, Accent> = {
  peach: {
    text: "text-mocha-peach",
    tile: "border-mocha-peach/25 bg-mocha-peach/10",
    bar: "bg-mocha-peach",
    rule: "border-mocha-peach/45",
  },
  green: {
    text: "text-mocha-green",
    tile: "border-mocha-green/25 bg-mocha-green/10",
    bar: "bg-mocha-green",
    rule: "border-mocha-green/45",
  },
  red: {
    text: "text-mocha-red",
    tile: "border-mocha-red/25 bg-mocha-red/10",
    bar: "bg-mocha-red",
    rule: "border-mocha-red/45",
  },
  sapphire: {
    text: "text-mocha-sapphire",
    tile: "border-mocha-sapphire/25 bg-mocha-sapphire/10",
    bar: "bg-mocha-sapphire",
    rule: "border-mocha-sapphire/45",
  },
  teal: {
    text: "text-mocha-teal",
    tile: "border-mocha-teal/25 bg-mocha-teal/10",
    bar: "bg-mocha-teal",
    rule: "border-mocha-teal/45",
  },
  mauve: {
    text: "text-mocha-mauve",
    tile: "border-mocha-mauve/25 bg-mocha-mauve/10",
    bar: "bg-mocha-mauve",
    rule: "border-mocha-mauve/45",
  },
};

const LANGUAGES = [
  { label: "english", level: 1, note: "fluent" },
  { label: "french", level: 1, note: "fluent" },
  { label: "russian", level: 0.3, note: "learning" },
  { label: "german", level: 0.24, note: "learning" },
  { label: "italian", level: 0.2, note: "learning" },
];

const ICONS: Record<string, ReactNode> = {
  cooking: (
    <>
      <path d="M6.4 12.6a3.3 3.3 0 1 1 1.7-6.2 3.9 3.9 0 0 1 7.8 0 3.3 3.3 0 1 1 1.7 6.2" />
      <path d="M6.4 12.6h11.2v5.9H6.4Z" />
      <path d="M6.4 15.3h11.2" />
    </>
  ),
  badminton: (
    <>
      <ellipse cx="9.4" cy="9.4" rx="4.6" ry="5.6" />
      <path d="M13.2 13.2 20 20" />
      <path d="M6.6 6.6l5.6 5.6M12.2 6.6 6.6 12.2" />
    </>
  ),
  gym: <path d="M3.5 9v6M7 6.5v11M17 6.5v11M20.5 9v6M7 12h10" />,
  traveling: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.6 2.8 2.6 14.2 0 17M12 3.5c-2.6 2.8-2.6 14.2 0 17" />
    </>
  ),
  tea: (
    <>
      <path d="M4.5 9h11v5.4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5Z" />
      <path d="M15.5 10.6h1.4a2.6 2.6 0 0 1 0 5.2h-1.4" />
      <path d="M7.6 5.4c0 .9.9 1.1.9 2M11 5c0 .9.9 1.1.9 2" />
    </>
  ),
  languages: (
    <>
      <path d="M4 6.5h8M8 6.5c0 3.6-1.6 6.4-4 8.5" />
      <path d="M6 10.5c1.1 2.4 3.1 4.2 5.5 5" />
      <path d="M12.5 19.5 16 10.5l3.5 9M13.8 16.6h4.4" />
    </>
  ),
};

function InterestIcon({ glyph }: { glyph: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      {ICONS[glyph]}
    </svg>
  );
}

interface Interest {
  title: string;
  tag: string;
  blurb: string;
  span: string;
  accent: keyof typeof ACCENTS;
  glyph: string;
}

const INTERESTS: Interest[] = [
  {
    title: "Cooking/Baking",
    tag: "zen",
    accent: "peach",
    glyph: "cooking",
    blurb:
      "Unwinding with cooking or baking. Pasta is my main dish and browned butter cookies are my specialty.",
    span: "lg:col-span-4",
  },
  {
    title: "Badminton",
    tag: "health",
    accent: "green",
    glyph: "badminton",
    blurb: "Hitting the court with friends in between classes.",
    span: "lg:col-span-2",
  },
  {
    title: "Gym",
    tag: "health",
    accent: "red",
    glyph: "gym",
    blurb:
      "Progressive overload, one rep at a time. Rest days are for squashing bugs.",
    span: "lg:col-span-2",
  },
  {
    title: "Traveling",
    tag: "culture",
    accent: "sapphire",
    glyph: "traveling",
    blurb: "Chasing new timezones, local foods, and the perfect picture.",
    span: "lg:col-span-2",
  },
  {
    title: "Tea",
    tag: "zen",
    accent: "teal",
    glyph: "tea",
    blurb: "Loose leaf over bags. A proper cup of chamomile fixes everything.",
    span: "lg:col-span-2",
  },
  {
    title: "Languages",
    tag: "culture",
    accent: "mauve",
    glyph: "languages",
    blurb:
      "Fluent in English and French; currently learning Russian, German, and Italian.",
    span: "lg:col-span-6",
  },
];

export default function MiscSection() {
  return (
    <section
      id="misc"
      data-lenis-snap
      className="relative flex min-h-screen items-center justify-center py-16 sm:py-20"
    >
      <SectionField backdrop="bloom" />

      <ScrollShift className="relative mx-auto w-full max-w-6xl px-6 sm:px-10">
        <Reveal variant="pop">
          <SectionHeading
            title="Interests"
            icon={<Icon name="sparkle" className="h-5 w-5" />}
          />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {INTERESTS.map((item, i) => {
            const accent = ACCENTS[item.accent];
            return (
              <Reveal
                key={item.title}
                variant="pop"
                delay={(i % 3) * 90}
                className={`h-full ${item.span}`}
              >
                <Spotlight className="live-card group relative flex h-full flex-col overflow-hidden rounded-xl border border-mocha-surface bg-mocha-base p-5 transition-colors duration-300 sm:p-6">
                  <div className="flex items-start gap-3.5">
                    <span
                      className={`interest-tile flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${accent.text} ${accent.tile}`}
                    >
                      <InterestIcon glyph={item.glyph} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-mono text-sm font-semibold tracking-wide text-mocha-text">
                        {item.title}
                      </h3>
                      <span
                        aria-hidden
                        className={`mt-2.5 block h-[2px] w-6 rounded-full transition-all duration-500 group-hover:w-14 ${accent.bar}`}
                      />
                    </div>
                    <span
                      className={`shrink-0 font-mono text-[10px] tracking-widest uppercase ${accent.text}`}
                    >
                      {item.tag}
                    </span>
                  </div>

                  <p
                    className={`mt-4 border-l-2 pl-3 font-mono text-sm leading-relaxed text-mocha-subtext ${accent.rule}`}
                  >
                    {item.blurb}
                  </p>

                  {item.title === "Languages" && (
                    <div className="mt-auto grid gap-3 pt-5 sm:grid-cols-2 lg:grid-cols-5">
                      {LANGUAGES.map((lang, li) => (
                        <div key={lang.label} className="min-w-0">
                          <div className="flex items-baseline justify-between gap-2 font-mono text-[11px]">
                            <span className="truncate text-mocha-text">
                              {lang.label}
                            </span>
                            <span className="shrink-0 text-[9px] tracking-widest text-mocha-overlay0 uppercase">
                              {lang.note}
                            </span>
                          </div>
                          <span className="mt-2 block h-1 overflow-hidden rounded-full bg-mocha-surface">
                            <span
                              className="lang-fill block h-full rounded-full bg-gradient-to-r from-mocha-teal via-mocha-lavender to-mocha-mauve"
                              style={{
                                width: `${lang.level * 100}%`,
                                animationDelay: `${li * 90}ms`,
                              }}
                            />
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Spotlight>
              </Reveal>
            );
          })}
        </div>
      </ScrollShift>
    </section>
  );
}
