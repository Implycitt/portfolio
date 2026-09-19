import type { ReactNode } from "react";

export type IconName =
  | "activity"
  | "arrowLeft"
  | "arrowUpRight"
  | "box"
  | "briefcase"
  | "building"
  | "cap"
  | "chart"
  | "clock"
  | "code"
  | "commit"
  | "cpu"
  | "doc"
  | "external"
  | "flask"
  | "fork"
  | "github"
  | "globe"
  | "info"
  | "link"
  | "merge"
  | "minus"
  | "pin"
  | "plus"
  | "sparkle"
  | "star"
  | "terminal"
  | "user"
  | "users";

const PATHS: Record<IconName, ReactNode> = {
  activity: <path d="M2.8 12h4.4l2.6-6.4 4.4 12.8 2.6-6.4h4.4" />,
  arrowLeft: (
    <>
      <path d="M19.2 12H4.8" />
      <path d="M10.8 6 4.8 12l6 6" />
    </>
  ),
  arrowUpRight: (
    <>
      <path d="M6.8 17.2 17.2 6.8" />
      <path d="M9.4 6.8h7.8v7.8" />
    </>
  ),
  box: (
    <>
      <path d="M12 3.4 20 7.7v8.6L12 20.6 4 16.3V7.7Z" />
      <path d="M4 7.7 12 12l8-4.3" />
      <path d="M12 12v8.6" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7.2" width="18" height="12.3" rx="2.4" />
      <path d="M8.8 7.2V6a2 2 0 0 1 2-2h2.4a2 2 0 0 1 2 2v1.2" />
      <path d="M3 12.4h18" />
    </>
  ),
  building: (
    <>
      <path d="M4.2 20.6V5.4A1.6 1.6 0 0 1 5.8 3.8h7a1.6 1.6 0 0 1 1.6 1.6v15.2" />
      <path d="M14.4 9.8h3.8a1.6 1.6 0 0 1 1.6 1.6v9.2" />
      <path d="M2.4 20.6h19.2" />
      <path d="M7.4 7.6h3.8M7.4 11.6h3.8M7.4 15.6h3.8" />
    </>
  ),
  cap: (
    <>
      <path d="M2.6 9 12 4.4 21.4 9 12 13.6Z" />
      <path d="M6.6 11.4v4.4c0 1.6 2.4 2.9 5.4 2.9s5.4-1.3 5.4-2.9v-4.4" />
    </>
  ),
  chart: (
    <>
      <path d="M3.2 19.6h17.6" />
      <path d="M6 16.4l4-5.6 3.4 3 4.9-7" />
      <path d="M15.9 6.8h2.9v3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.2V12l3.2 2.1" />
    </>
  ),
  code: (
    <>
      <path d="M8.8 8.4 5 12l3.8 3.6" />
      <path d="M15.2 8.4 19 12l-3.8 3.6" />
      <path d="M13.4 5.4l-2.8 13.2" />
    </>
  ),
  commit: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M2.6 12h6.2M15.2 12h6.2" />
    </>
  ),
  cpu: (
    <>
      <rect x="6.4" y="6.4" width="11.2" height="11.2" rx="2.2" />
      <path d="M9.8 3.4v3M14.2 3.4v3M9.8 17.6v3M14.2 17.6v3M3.4 9.8h3M3.4 14.2h3M17.6 9.8h3M17.6 14.2h3" />
    </>
  ),
  external: (
    <>
      <path d="M13.8 4.4h5.8v5.8" />
      <path d="M19.6 4.4 11.4 12.6" />
      <path d="M17.6 13.8v4.6a2 2 0 0 1-2 2H5.8a2 2 0 0 1-2-2V8.6a2 2 0 0 1 2-2h4.6" />
    </>
  ),
  doc: (
    <>
      <path d="M14.2 3.4H7.4a2.2 2.2 0 0 0-2.2 2.2v12.8a2.2 2.2 0 0 0 2.2 2.2h9.2a2.2 2.2 0 0 0 2.2-2.2V8" />
      <path d="M14.2 3.4V7a1.6 1.6 0 0 0 1.6 1.6h3.2" />
      <path d="M8.6 12.6h6.2M8.6 16.2h4.2" />
    </>
  ),
  flask: (
    <>
      <path d="M9.4 3.4h5.2" />
      <path d="M10.4 3.4v5.3l-4.9 8.8a2 2 0 0 0 1.7 3.1h9.6a2 2 0 0 0 1.7-3.1l-4.9-8.8V3.4" />
      <path d="M7.4 14.4h9.2" />
    </>
  ),
  fork: (
    <>
      <circle cx="6.8" cy="5.6" r="2.2" />
      <circle cx="17.2" cy="5.6" r="2.2" />
      <circle cx="12" cy="18.4" r="2.2" />
      <path d="M6.8 7.8v1.6a2.6 2.6 0 0 0 2.6 2.6h5.2a2.6 2.6 0 0 0 2.6-2.6V7.8" />
      <path d="M12 12v4.2" />
    </>
  ),
  github: (
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.8 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M3.4 12h17.2" />
      <path d="M12 3.4c2.7 2.9 2.7 14.3 0 17.2M12 3.4c-2.7 2.9-2.7 14.3 0 17.2" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 11v5.4" />
      <circle cx="12" cy="7.9" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  link: (
    <>
      <path d="M10.2 13.8a3.6 3.6 0 0 0 5.1 0l3-3a3.6 3.6 0 0 0-5.1-5.1l-1.1 1.1" />
      <path d="M13.8 10.2a3.6 3.6 0 0 0-5.1 0l-3 3a3.6 3.6 0 0 0 5.1 5.1l1.1-1.1" />
    </>
  ),
  merge: (
    <>
      <circle cx="7" cy="6" r="2.3" />
      <circle cx="7" cy="18" r="2.3" />
      <circle cx="17" cy="14.5" r="2.3" />
      <path d="M7 8.3v7.4" />
      <path d="M9.3 6H13a4 4 0 0 1 4 4v2.2" />
    </>
  ),
  minus: <path d="M5.2 12h13.6" />,
  pin: (
    <>
      <path d="M12 21.2s6.6-5.8 6.6-10.7a6.6 6.6 0 1 0-13.2 0C5.4 15.4 12 21.2 12 21.2Z" />
      <circle cx="12" cy="10.3" r="2.5" />
    </>
  ),
  plus: <path d="M12 5.2v13.6M5.2 12h13.6" />,
  sparkle: (
    <>
      <path d="M11 3.6l1.7 4.5 4.5 1.7-4.5 1.7L11 16l-1.7-4.5L4.8 9.8l4.5-1.7Z" />
      <path d="M18 15.2l.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8Z" />
    </>
  ),
  star: (
    <path d="M12 3.4l2.6 5.3 5.9.86-4.25 4.14 1 5.9L12 16.8l-5.25 2.8 1-5.9L3.5 9.56l5.9-.86Z" />
  ),
  terminal: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M6.5 9.5 9 12l-2.5 2.5" />
      <path d="M12.5 14.5h5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20.2a7.2 7.2 0 0 1 14.4 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.4" r="3.2" />
      <path d="M2.8 19.8a6.2 6.2 0 0 1 12.4 0" />
      <path d="M16.2 5.7a3.2 3.2 0 0 1 0 5.6" />
      <path d="M17.8 14.2a6.2 6.2 0 0 1 3.4 5.6" />
    </>
  ),
};

const FILLED: IconName[] = ["github", "star"];

export default function Icon({
  name,
  className = "h-4 w-4",
  strokeWidth = 1.7,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  const filled = FILLED.includes(name);
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
