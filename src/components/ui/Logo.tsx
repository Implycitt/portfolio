'use client';

export const Logo = ({ className = "w-24 h-24", isAnimating = true }: { className?: string; isAnimating?: boolean }) => {
  return (
    <>
      <style>{`
        @keyframes fadeInCircle {
          from { opacity: 0; transform: scale(0.94); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes slideQTail {
          from { transform: translate(40px, 40px); opacity: 0; }
          to { transform: translate(0, 0); opacity: 1; }
        }

        @keyframes slideBStem {
          from { transform: translateY(-60px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .animate-circle {
          transform-origin: center;
          animation: fadeInCircle 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.1s;
        }

        .animate-q {
          animation: slideQTail 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.6s;
          opacity: 0;
        }

        .animate-b {
          animation: slideBStem 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 1.2s;
          opacity: 0;
        }
      `}</style>

      <svg
        viewBox="0 0 100 100"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="white-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g filter="url(#white-glow)">
          <circle 
            cx="50" 
            cy="50" 
            r="22" 
            stroke="#ffffff" 
            strokeWidth="7.5"
            className={isAnimating ? "animate-circle" : ""}
          />
          
          <line 
            x1="68" 
            y1="68" 
            x2="80" 
            y2="80" 
            stroke="#ffffff" 
            strokeWidth="8.5" 
            strokeLinecap="butt"
            className={isAnimating ? "animate-q" : ""}
          />

          <line 
            x1="28" 
            y1="6" 
            x2="28" 
            y2="55" 
            stroke="#ffffff" 
            strokeWidth="7.5" 
            strokeLinecap="butt"
            className={isAnimating ? "animate-b" : ""}
          />
        </g>
      </svg>
    </>
  );
};