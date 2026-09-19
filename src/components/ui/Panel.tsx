import type { ReactNode } from "react";
import Spotlight from "@/components/ui/Spotlight";

interface PanelProps {
  title?: string;
  icon?: ReactNode;
  note?: string;
  noteClassName?: string;
  accent?: string;
  children: ReactNode;
  className?: string;
}

export default function Panel({
  title,
  icon,
  note,
  noteClassName = "text-mocha-overlay0",
  accent = "text-mocha-text",
  children,
  className = "",
}: PanelProps) {
  return (
    <Spotlight
      className={`live-card flex flex-col overflow-hidden rounded-xl border border-mocha-surface bg-mocha-base transition-colors duration-300 ${className}`}
    >
      {title && (
        <div className="flex items-center gap-3 border-b-2 border-mocha-mauve/70 bg-mocha-mantle px-5 py-3">
          {icon && (
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-mocha-crust/70 ${accent}`}
            >
              {icon}
            </span>
          )}
          <h3
            className={`font-mono text-xs font-semibold tracking-wide ${accent}`}
          >
            {title}
          </h3>
          {note && (
            <span
              className={`ml-auto shrink-0 font-mono text-[10px] tracking-wide ${noteClassName}`}
            >
              {note}
            </span>
          )}
        </div>
      )}

      <div className="flex-1 p-5 sm:p-6">{children}</div>
    </Spotlight>
  );
}
