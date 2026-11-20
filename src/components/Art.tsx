import type { CSSProperties } from "react";

type P = { className?: string; style?: CSSProperties };

export function Poinsettia({ className, style }: P) {
  const rot = (i: number, n = 8) => i * (360 / n);
  return (
    <svg viewBox="0 0 200 200" className={className} style={style} aria-hidden="true" focusable="false">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <ellipse key={`l${i}`} cx="100" cy="52" rx="13" ry="44" fill="#1f5a3a" transform={`rotate(${rot(i, 6) + 30} 100 100)`} />
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path key={`a${i}`} d="M100 100 C70 70 76 28 100 8 C124 28 130 70 100 100Z" fill="#a50f25" transform={`rotate(${rot(i)} 100 100)`} />
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path key={`b${i}`} d="M100 100 C78 78 82 44 100 28 C118 44 122 78 100 100Z" fill="#e0343f" transform={`rotate(${rot(i) + 22.5} 100 100)`} />
      ))}
      <circle cx="100" cy="100" r="14" fill="#c98a1b" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <circle key={i} cx={100 + 8 * Math.cos((i * Math.PI * 2) / 7)} cy={100 + 8 * Math.sin((i * Math.PI * 2) / 7)} r="3.6" fill="#f4c25b" />
      ))}
    </svg>
  );
}

export function Pandereta({ className, style }: P) {
  return (
    <svg viewBox="0 0 200 200" className={className} style={style} aria-hidden="true" focusable="false">
      <circle cx="100" cy="100" r="88" fill="#8a4a1d" />
      <circle cx="100" cy="100" r="74" fill="#f6dfb0" />
      <circle cx="100" cy="100" r="74" fill="none" stroke="#c8102e" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
      <circle cx="100" cy="100" r="52" fill="none" stroke="#c98a1b" strokeWidth="2" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path key={i} d="M100 100 L100 48" stroke="#c8102e" strokeWidth="2.4" strokeLinecap="round" transform={`rotate(${i * 45} 100 100)`} />
      ))}
      <circle cx="100" cy="100" r="10" fill="#c8102e" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i} transform={`rotate(${i * 60 + 30} 100 100)`}>
          <circle cx="100" cy="21" r="9" fill="#f4c25b" stroke="#a86f0b" strokeWidth="2" />
          <circle cx="100" cy="21" r="3" fill="#a86f0b" />
        </g>
      ))}
      <path d="M150 28 q14 -4 18 12 q-12 0 -18 -12z M160 36 q16 10 8 26" fill="#e0343f" stroke="#e0343f" strokeWidth="3" />
    </svg>
  );
}

export function Zambomba({ className, style }: P) {
  return (
    <svg viewBox="0 0 160 240" className={className} style={style} aria-hidden="true" focusable="false">
      <rect x="76" y="8" width="8" height="120" rx="4" fill="#6b3a17" />
      <rect x="76" y="8" width="3" height="120" rx="1.5" fill="#9a5a28" />
      <path d="M32 96 Q28 220 80 228 Q132 220 128 96Z" fill="#b8571f" />
      <path d="M32 96 Q28 220 80 228 Q60 200 58 96Z" fill="#cf6d2e" opacity=".7" />
      <path d="M40 150 H120 M38 180 H122" stroke="#f4c25b" strokeWidth="4" strokeDasharray="8 6" />
      <ellipse cx="80" cy="96" rx="52" ry="16" fill="#8a4a1d" />
      <ellipse cx="80" cy="94" rx="46" ry="12" fill="#f6dfb0" />
      <circle cx="80" cy="94" r="5" fill="#6b3a17" />
      <path d="M28 100 q52 22 104 0" fill="none" stroke="#c8102e" strokeWidth="6" />
    </svg>
  );
}

export function Palmas({ className, style }: P) {
  const hand = (flip: boolean) => (
    <g transform={flip ? "translate(200 0) scale(-1 1)" : undefined}>
      <g transform="rotate(-28 70 130)">
        <rect x="40" y="70" width="58" height="84" rx="26" fill="#f5c9a0" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={42 + i * 13.5} y={14 + (i === 1 || i === 2 ? -8 : 4)} width="11" height="70" rx="5.5" fill="#f5c9a0" stroke="#d99a6a" strokeWidth="1.5" />
        ))}
        <rect x="88" y="92" width="34" height="14" rx="7" fill="#f5c9a0" transform="rotate(-32 90 98)" />
      </g>
    </g>
  );
  return (
    <svg viewBox="0 0 200 200" className={className} style={style} aria-hidden="true" focusable="false">
      <g stroke="#f4c25b" strokeWidth="5" strokeLinecap="round">
        <path d="M100 6 V30" /><path d="M48 18 L62 38" /><path d="M152 18 L138 38" /><path d="M16 56 L38 66" /><path d="M184 56 L162 66" />
      </g>
      {hand(false)}
      {hand(true)}
    </svg>
  );
}

export function Note({ className, style, double }: P & { double?: boolean }) {
  return (
    <svg viewBox="0 0 60 80" className={className} style={style} aria-hidden="true" focusable="false">
      {double ? (
        <>
          <ellipse cx="14" cy="62" rx="12" ry="9" fill="currentColor" transform="rotate(-18 14 62)" />
          <ellipse cx="46" cy="54" rx="12" ry="9" fill="currentColor" transform="rotate(-18 46 54)" />
          <path d="M23 60 V12 L55 4 V52" stroke="currentColor" strokeWidth="5" fill="none" />
          <path d="M23 20 L55 12" stroke="currentColor" strokeWidth="9" />
        </>
      ) : (
        <>
          <ellipse cx="22" cy="62" rx="15" ry="11" fill="currentColor" transform="rotate(-18 22 62)" />
          <path d="M34 58 V8 C34 24 54 24 50 44 C48 32 38 30 34 26" fill="currentColor" stroke="currentColor" strokeWidth="5" />
        </>
      )}
    </svg>
  );
}

export function Sun({ className, style }: P) {
  return (
    <svg viewBox="0 0 400 400" className={className} style={style} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="sunG" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffe9a8" />
          <stop offset=".55" stopColor="#f4a93a" />
          <stop offset="1" stopColor="#e0562f" />
        </radialGradient>
      </defs>
      <g className="spin-slow" style={{ transformOrigin: "200px 200px" }}>
        {Array.from({ length: 24 }, (_, i) => (
          <path key={i} d="M200 8 L210 56 L190 56Z" fill="#f4c25b" opacity=".75" transform={`rotate(${i * 15} 200 200)`} />
        ))}
      </g>
      <circle cx="200" cy="200" r="120" fill="url(#sunG)" />
    </svg>
  );
}

export function Star({ className, style }: P) {
  return (
    <svg viewBox="0 0 40 40" className={className} style={style} aria-hidden="true" focusable="false">
      <path d="M20 0 L24 16 L40 20 L24 24 L20 40 L16 24 L0 20 L16 16Z" fill="currentColor" />
    </svg>
  );
}

export function Garland({ className, style, bulbs = 14 }: P & { bulbs?: number }) {
  const colors = ["#e0343f", "#f4c25b", "#fff4dc", "#ff9a3c"];
  const pts = Array.from({ length: bulbs }, (_, i) => {
    const t = i / (bulbs - 1);
    return { x: 10 + t * 980, y: 14 + Math.sin(t * Math.PI * 4) * 10 + (t < 0.5 ? 0 : 0) };
  });
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ");
  return (
    <svg viewBox="0 0 1000 60" preserveAspectRatio="none" className={className} style={style} aria-hidden="true" focusable="false">
      <path d={d} fill="none" stroke="#5b2a16" strokeWidth="2" />
      {pts.map((p, i) => (
        <g key={i} className="bulb" style={{ animationDelay: `${(i % 5) * 0.45}s`, color: colors[i % 4] }}>
          <rect x={p.x - 3} y={p.y} width="6" height="7" fill="#5b2a16" />
          <ellipse cx={p.x} cy={p.y + 15} rx="8" ry="11" fill="currentColor" />
          <ellipse cx={p.x} cy={p.y + 15} rx="20" ry="22" fill="currentColor" opacity=".16" />
        </g>
      ))}
    </svg>
  );
}

// Silueta de arcos de herradura (guiño a la Mezquita de Córdoba) con palmeras y abetos.
export function Skyline({ className, style }: P) {
  const arch = "M8 120 V62 A32 32 0 1 1 72 62 V120";
  return (
    <svg viewBox="0 0 800 160" preserveAspectRatio="xMidYMax slice" className={className} style={style} aria-hidden="true" focusable="false">
      <defs>
        <pattern id="arcos" width="80" height="160" patternUnits="userSpaceOnUse" x="0" y="40">
          <rect width="80" height="120" fill="#1b080c" />
          <path d={arch} fill="#0e0406" stroke="#fff4dc" strokeWidth="9" />
          <path d={arch} fill="none" stroke="#c8102e" strokeWidth="9" strokeDasharray="7 7" />
        </pattern>
      </defs>
      <rect y="40" width="800" height="120" fill="url(#arcos)" />
      <rect y="34" width="800" height="8" fill="#c98a1b" />
      {[60, 330, 610, 740].map((x, i) => (
        <g key={x} transform={`translate(${x} ${i % 2 ? 30 : 10})`} fill="#0e0406">
          <rect x="-3" y="30" width="6" height="110" />
          {[-70, -40, -10, 20, 50, 80, 110].map((a) => (
            <path key={a} d="M0 30 Q22 -4 52 20 Q22 6 0 30Z" transform={`rotate(${a} 0 30)`} />
          ))}
        </g>
      ))}
      {[200, 470].map((x) => (
        <g key={x} transform={`translate(${x} 30)`} fill="#0f2a1c">
          <path d="M0 0 L26 50 H10 L34 90 H-34 L-10 50 H-26Z" />
          <rect x="-4" y="90" width="8" height="30" />
        </g>
      ))}
    </svg>
  );
}
