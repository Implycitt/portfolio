"use client";

interface LogoProps {
  className?: string;
  isAnimating: boolean;
}

export default function Logo({
  className = "w-24 h-24",
  isAnimating,
}: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="qb-white-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <g filter="url(#qb-white-glow)">
        <circle
          cx="50"
          cy="50"
          r="22"
          stroke="#ffffff"
          strokeWidth="7.5"
          className={isAnimating ? "qb-anim-circle" : ""}
        />

        <line
          x1="68"
          y1="68"
          x2="80"
          y2="80"
          stroke="#ffffff"
          strokeWidth="8.5"
          strokeLinecap="butt"
          className={isAnimating ? "qb-anim-q" : ""}
        />

        <line
          x1="28"
          y1="6"
          x2="28"
          y2="55"
          stroke="#ffffff"
          strokeWidth="7.5"
          strokeLinecap="butt"
          className={isAnimating ? "qb-anim-b" : ""}
        />
      </g>
    </svg>
  );
}
