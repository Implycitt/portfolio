import type { ReactNode } from "react";

interface TerminalCardProps {
  path?: string;
  title?: string;
  children: ReactNode;
  className?: string;
  accent?: "cyan" | "violet" | "mauve";
}

const ACCENT_RINGS: Record<NonNullable<TerminalCardProps["accent"]>, string> = {
  cyan: "hover:border-cyan/40 hover:shadow-[0_0_30px_-8px_rgba(46,223,229,0.45)]",
  violet:
    "hover:border-violet/40 hover:shadow-[0_0_30px_-8px_rgba(123,44,191,0.5)]",
  mauve:
    "hover:border-mauve/40 hover:shadow-[0_0_30px_-8px_rgba(199,125,255,0.45)]",
};

export default function TerminalCard({
  path,
  title,
  children,
  className = "",
  accent = "cyan",
}: TerminalCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm transition-all duration-300 hover-lift ${ACCENT_RINGS[accent]} ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent px-4 py-2.5 font-mono text-[11px] text-white/50">
        <span className="truncate tracking-wider">
          <span className="text-white/35">~/$ </span>
          <span className="text-white/80">
            {path ? path : (title ?? "terminal")}
          </span>
        </span>
        <span className="terminal-caret ml-1 inline-block h-3 w-1.5 bg-cyan/80" />
        <span className="ml-auto hidden shrink-0 text-white/25 sm:inline">
          bash — tty1
        </span>
      </div>

      <div className="relative p-5 sm:p-6">{children}</div>

      <div className="scan-line pointer-events-none absolute inset-x-0 top-0 h-24 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}
