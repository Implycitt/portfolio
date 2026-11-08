"use client";

const numberFormatter = new Intl.NumberFormat("en-US");

const accents = {
  rose: "text-rose",
  love: "text-love",
  gold: "text-gold",
  iris: "text-iris",
  foam: "text-foam"
} as const;

const bg = [
  "bg-rose",
  "bg-love",
  "bg-gold",
  "bg-iris",
  "bg-foam",
  "bg-pine"
];

type StatAccent = keyof typeof accents;

export function Stat({ label, value, accent = "rose" }: { label: string; value: number; accent?: StatAccent; }) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] uppercase tracking-[0.16em] text-subtle">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold ${accents[accent]}`}>
        {numberFormatter.format(value)}
      </p>
    </div>
  );
}

export function Language({ languages, limit = 5 }: { languages: { name: string; count: number }[]; limit?: number; }) {
  const visible = languages.slice(0, limit);
  const total = visible.reduce((sum, language) => sum + language.count, 0) || 1;

  if (visible.length === 0) {
    return <p className="text-xs text-subtle">No data</p>;
  }

  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full bg-rose/10">
        {visible.map((language, index) => (
          <span key={language.name} className={bg[index%bg.length]} style={{ width: `${(language.count / total) * 100}%`}}/>
        ))}
      </div>

      <ul className="mt-2 space-y-1.5">
        {visible.map((language, index) => ( 
          <li key={language.name} className="flex items-center gap-2 text-[11px]">
            <span className={`size-1.5 shrink-0 rounded-full ${bg[index%bg.length]}`} />
            <span className="min-w-0 flex-1 truncate text-subtle">
              {language.name}
            </span>
            <span className="text-subtle">{language.count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
