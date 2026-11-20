export function Snow() {
  const flakes = Array.from({ length: 34 }, (_, i) => {
    const r = (k: number) => ((Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1 + 1) % 1;
    return {
      left: `${(r(1) * 100).toFixed(1)}%`,
      size: `${(3 + r(2) * 6).toFixed(1)}px`,
      dur: `${(11 + r(3) * 14).toFixed(1)}s`,
      delay: `${(-r(4) * 25).toFixed(1)}s`,
      drift: `${((r(5) - 0.5) * 120).toFixed(0)}px`,
      op: (0.35 + r(6) * 0.5).toFixed(2),
    };
  });
  return (
    <div className="snow" aria-hidden="true">
      {flakes.map((f, i) => (
        <i
          key={i}
          style={{ left: f.left, width: f.size, height: f.size, animationDuration: f.dur, animationDelay: f.delay, opacity: f.op, ["--drift" as string]: f.drift }}
        />
      ))}
    </div>
  );
}
