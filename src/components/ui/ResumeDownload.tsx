import { existsSync } from "fs";
import path from "path";
import PrintButton from "@/components/ui/PrintButton";

const RESUME_FILE = "Quentin-Bordelon-Resume.pdf";
const RESUME_PATH = path.join(process.cwd(), "public", "resume", RESUME_FILE);

export default function ResumeDownload() {
  const hasResume = existsSync(RESUME_PATH);

  if (!hasResume) {
    return (
      <div className="flex flex-col items-end gap-2">
        <PrintButton />
        <p className="font-mono text-[10px] text-white/30">
          // drop {RESUME_FILE} into public/resume/ to enable download
        </p>
      </div>
    );
  }

  return (
    <a
      href={`/resume/${RESUME_FILE}`}
      download={RESUME_FILE}
      className="group inline-flex items-center gap-2 rounded-lg border border-cyan/30 bg-cyan/5 px-5 py-2.5 font-mono text-xs tracking-widest uppercase text-white transition-all duration-300 hover:border-cyan/60 hover:bg-cyan/10 hover:text-white hover:shadow-[0_0_24px_-6px_rgba(46,223,229,0.5)]"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="m7 10 5 5 5-5" />
        <path d="M12 15V3" />
      </svg>
      wget ./resume/{RESUME_FILE}
      <span className="terminal-caret inline-block h-3 w-1.5 bg-cyan" />
    </a>
  );
}
