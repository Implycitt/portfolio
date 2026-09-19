"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="group inline-flex items-center gap-2 rounded-xl border border-mocha-surface bg-mocha-base px-5 py-2.5 font-mono text-xs tracking-widest uppercase text-mocha-subtext transition-colors duration-300 hover:border-mocha-mauve hover:text-mocha-text"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4 text-mocha-overlay1 transition-colors group-hover:text-mocha-mauve"
      >
        <path d="M6 9V2h12v7" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      Print
    </button>
  );
}
