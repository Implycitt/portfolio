const STARS = [
  [8, 12, 1], [14, 30, 2], [21, 8, 1], [27, 42, 2], [33, 18, 1],
  [40, 5, 2], [46, 34, 1], [52, 14, 3], [58, 45, 1], [64, 9, 2],
  [71, 27, 1], [77, 6, 2], [83, 39, 1], [89, 21, 2], [95, 11, 1],
  [12, 52, 1], [25, 60, 2], [38, 56, 1], [49, 64, 2], [61, 58, 1],
  [73, 62, 2], [85, 54, 1], [93, 66, 2], [5, 65, 1], [57, 24, 2],
  [68, 38, 1], [30, 72, 1], [44, 70, 2], [90, 30, 1], [16, 44, 2],
];

export default function SynthwaveBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden synth-sky">
      {STARS.map(([left, top, size], i) => (
        <span
          key={i}
          className="synth-star absolute rounded-full bg-white"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: size,
            height: size,
            animationDelay: `${(i * 0.37) % 3}s`,
          }}
        />
      ))}

      <div className="absolute inset-x-0 top-[38%] h-64 bg-gradient-to-b from-transparent via-neon-pink/20 to-transparent blur-2xl" />

      <div
        className="synth-grid absolute inset-x-[-30%] bottom-[-4%] h-[55%]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,42,109,0.55) 2px, transparent 2px), linear-gradient(to bottom, rgba(5,217,232,0.5) 2px, transparent 2px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
