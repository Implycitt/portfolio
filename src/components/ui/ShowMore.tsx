"use client";

import { Children, useEffect, useId, useState, type ReactNode } from "react";
import Icon from "@/components/ui/icons";

const PARAM = "show";

function readSections(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const raw = new URLSearchParams(window.location.search).get(PARAM) ?? "";
  return new Set(
    raw
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
}

function writeSections(sections: Set<string>) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const list = [...sections].sort();
  if (list.length > 0) params.set(PARAM, list.join(","));
  else params.delete(PARAM);
  const query = params.toString();
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
  );
}

export default function ShowMore({
  children,
  initial,
  noun,
  section,
  gridClassName = "",
  className = "",
}: {
  children: ReactNode;
  initial: number;
  noun: string;
  section: string;
  gridClassName?: string;
  className?: string;
}) {
  const items = Children.toArray(children);
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (readSections().has(section.toLowerCase())) setExpanded(true);
  }, [section]);

  const hidden = items.length - initial;
  if (hidden <= 0) {
    return <div className={`${className} ${gridClassName}`}>{items}</div>;
  }

  const visible = expanded ? items : items.slice(0, initial);

  return (
    <div className={className}>
      <div
        id={panelId}
        className={`${gridClassName} ${expanded ? "card-settle" : ""}`}
      >
        {visible}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => {
            const next = !expanded;
            const sections = readSections();
            if (next) sections.add(section.toLowerCase());
            else sections.delete(section.toLowerCase());
            writeSections(sections);
            setExpanded(next);
          }}
          className="group inline-flex items-center gap-2 rounded-xl border border-mocha-surface bg-mocha-base px-5 py-2.5 font-mono text-xs tracking-widest uppercase text-mocha-subtext transition-colors duration-300 hover:border-mocha-mauve hover:text-mocha-text"
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors duration-300 ${
              expanded
                ? "border-mocha-overlay0/40 text-mocha-overlay1"
                : "border-mocha-mauve/30 bg-mocha-mauve/10 text-mocha-mauve"
            }`}
          >
            <Icon name={expanded ? "minus" : "plus"} className="h-3.5 w-3.5" />
          </span>
          {expanded ? `show fewer ${noun}` : `show ${hidden} more ${noun}`}
        </button>
        <span className="h-px flex-1 bg-gradient-to-r from-mocha-mauve/35 to-transparent" />
        <span className="font-mono text-[10px] tracking-widest text-mocha-overlay0 uppercase">
          {visible.length} / {items.length}
        </span>
      </div>
    </div>
  );
}
