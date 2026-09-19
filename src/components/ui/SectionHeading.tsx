import type { ReactNode } from "react";

interface SectionHeadingProps {
  title: string;
  align?: "left" | "center";
  icon?: ReactNode;
  className?: string;
}

export default function SectionHeading({
  title,
  align = "left",
  icon,
  className = "",
}: SectionHeadingProps) {
  return (
    <div
      className={`flex items-center gap-4 font-mono ${
        align === "center" ? "justify-center" : ""
      } ${className}`}
    >
      {icon && (
        <span className="interest-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-mocha-mauve/25 bg-mocha-mauve/10 text-mocha-mauve">
          {icon}
        </span>
      )}
      <h2 className="drop-shadow-[0_0_20px_rgba(203,166,247,0.28)]">
        <span className="text-3xl sm:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-mocha-lavender via-mocha-mauve to-mocha-pink [-webkit-text-fill-color:transparent]">
          {title}
        </span>
      </h2>
    </div>
  );
}
