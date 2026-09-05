"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-5 py-2.5 font-mono text-xs tracking-widest uppercase text-white/70 transition-all duration-300 hover:border-cyan/40 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_0_24px_-6px_rgba(46,223,229,0.5)]"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
      >
        <path d="M6 9V2h12v7" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      lp -d printer
      <span className="terminal-caret inline-block h-3 w-1.5 bg-cyan" />
    </button>
  );
}
