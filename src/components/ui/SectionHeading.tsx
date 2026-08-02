interface SectionHeadingProps {
  prompt: string;
  title: string;
  className?: string;
}

export default function SectionHeading({ prompt, title, className = "" }: SectionHeadingProps) {
  return (
    <div className={`font-mono ${className}`}>
      <p className="mb-2 flex items-center gap-2 text-xs sm:text-sm tracking-[0.2em] uppercase text-white/45">
        <span className="text-cyan">$</span>
        <span className="text-white/60">{prompt}</span>
        <span className="terminal-caret inline-block h-3.5 w-2 bg-white/70" />
      </p>
      <h2 className="drop-shadow-[0_0_18px_rgba(123,44,191,0.35)]">
        <span className="text-3xl sm:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan via-violet to-mauve [-webkit-text-fill-color:transparent]">
          {title}
        </span>
      </h2>
    </div>
  );
}
