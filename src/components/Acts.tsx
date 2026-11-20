"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Layer, Reveal, Scene } from "./Parallax";
import { Counter } from "./Counter";
import { Avatar, useWrapped } from "./Wrapped";
import { Garland, Note, Palmas, Pandereta, Poinsettia, Skyline, Star, Sun, Zambomba } from "./Art";
import { GRUPOS, familias, persona, personas } from "@/lib/stats";

const ICONS: Record<string, string> = {
  gift: "🎁", repeat: "🔁", streak: "🔥", star: "⭐", ghost: "👻", puzzle: "🧩", elder: "🧓", heart: "💞", check: "✅",
};

export const ACTOS = [
  { id: "portada", label: "Portada" },
  { id: "familia", label: "La familia" },
  { id: "numeros", label: "Los números" },
  { id: "rotacion", label: "Rotación" },
  { id: "records", label: "Récords" },
  { id: "cruces", label: "Cruces" },
  { id: "misterio", label: "Misterio" },
  { id: "dos-mil-veintiseis", label: "2026" },
];

export function Chrome() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return (
    <>
      <motion.div className="progress" style={{ scaleX: x }} aria-hidden="true" />
      <nav className="dots" aria-label="Actos">
        {ACTOS.map((a, i) => (
          <a key={a.id} href={`#${a.id}`} aria-label={`Acto ${i + 1}: ${a.label}`}>
            <span>{a.label}</span>
          </a>
        ))}
      </nav>
    </>
  );
}

const rango = (ys: number[]) => `${ys[0]}–${ys[ys.length - 1]}`;

export function Cover() {
  const { stats } = useWrapped();
  return (
    <Scene id="portada" label="Portada" className="cover">
      <Layer speed={0.1} className="abs sun-wrap"><Sun className="sun" /></Layer>
      <Layer speed={0.05} className="abs garland-wrap"><Garland className="garland" /></Layer>
      <Layer speed={0.35} rotate={6} className="abs pos-a"><Poinsettia className="art w-poin" /></Layer>
      <Layer speed={0.5} rotate={-8} className="abs pos-b"><Pandereta className="art w-pand float" /></Layer>
      <Layer speed={0.28} rotate={5} className="abs pos-c"><Zambomba className="art w-zamb" /></Layer>
      <Layer speed={0.6} rotate={-10} className="abs pos-d"><Note className="note n1" /></Layer>
      <Layer speed={0.8} rotate={12} className="abs pos-e"><Note double className="note n2" /></Layer>
      <Layer speed={0.4} className="abs pos-f"><Star className="star s1" /></Layer>
      <Layer speed={-0.1} className="abs skyline-wrap"><Skyline className="skyline" /></Layer>
      <div className="content center">
        <motion.p className="eyebrow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>Familia</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}>
          Martinez<br /><span className="gold">Flores</span>
        </motion.h1>
        <motion.p className="lead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 1 }}>
          Amigo Invisible <strong>{rango(stats.years)}</strong>
        </motion.p>
        <motion.p className="tag" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1 }}>
          Tu Wrapped navideño, directo desde Córdoba
        </motion.p>
        <a className="cue" href="#familia">Desliza<span aria-hidden="true">↓</span></a>
      </div>
    </Scene>
  );
}

function PersonCard({ id }: { id: string }) {
  const p = persona(id);
  return (
    <div className={`pcard ${p.nacido2026 ? "newbie" : ""}`}>
      <Avatar id={id} size="md" />
      <h4>{p.nombre}</h4>
      {p.apodo && <p>{p.apodo}</p>}
      {p.nacido2026 && <span className="badge">Nueva incorporación 2026</span>}
    </div>
  );
}

export function Familia() {
  const { stats } = useWrapped();
  const abuelos = personas.filter((p) => p.rol === "abuelo");
  const ramas = familias.map((f) => ({ f, miembros: personas.filter((p) => p.familia === f.id) }));
  return (
    <Scene id="familia" label="La familia" className="act familia">
      <Layer speed={0.5} rotate={10} className="abs fam-a"><Poinsettia className="art w-poin" /></Layer>
      <Layer speed={0.7} rotate={-12} className="abs fam-b"><Pandereta className="art w-pand" /></Layer>
      <Layer speed={0.4} className="abs fam-c"><Zambomba className="art w-zamb" /></Layer>
      <Layer speed={0.9} rotate={8} className="abs fam-d"><Note className="note n1" /></Layer>
      <div className="content">
        <Reveal as="p" className="eyebrow">Acto 2 · La familia</Reveal>
        <Reveal as="h2">Los que hacen<br />la <span className="gold">Navidad</span></Reveal>
        <Reveal as="p" className="lead">Toca una foto para abrir su Wrapped personal.</Reveal>
        <Reveal className="abuelos">
          {abuelos.map((p) => <PersonCard key={p.id} id={p.id} />)}
          <p className="role">Los abuelos · donde empieza todo</p>
        </Reveal>
        <div className="ramas">
          {ramas.map(({ f, miembros }, i) => (
            <Reveal key={f.id} delay={(i % 2) * 0.1} className="rama">
              <h3>{f.nombre}</h3>
              <div className="rama-grid">
                {miembros.map((p) => <PersonCard key={p.id} id={p.id} />)}
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="aviso">
          <p><strong>Ojo:</strong> los niños no participan en el sorteo. Entran los {stats.totals.participantes} mayores (abuelos incluidos), y los pequeños se llevan lo suyo igualmente de Papá Noel (casi siempre) o de los Reyes Magos.</p>
        </Reveal>
      </div>
    </Scene>
  );
}

export function Numeros() {
  const { stats } = useWrapped();
  const t = stats.totals;
  const items = [
    { n: t.sorteos, l: "sorteos", s: `${rango(stats.years)}, uno cada Navidad` },
    { n: t.registrados, l: "regalos registrados", s: `de ${t.posibles} posibles · ${t.perdidos} se perdieron por el camino` },
    { n: t.participantes, l: "participantes", s: `${t.participantes} mayores en el bombo, ${t.ninos} peques mirando con ojos grandes` },
  ];
  return (
    <Scene id="numeros" label="Los números" className="act numeros">
      <Layer speed={0.3} className="abs num-sun"><Sun className="sun" /></Layer>
      <Layer speed={0.6} rotate={-15} className="abs num-a"><Pandereta className="art w-pand" /></Layer>
      <Layer speed={0.5} rotate={10} className="abs num-b"><Palmas className="art w-palm" /></Layer>
      <Layer speed={0.8} className="abs num-c"><Note double className="note n2" /></Layer>
      <div className="content center">
        <Reveal as="p" className="eyebrow">Acto 3 · Los números</Reveal>
        <Reveal as="h2">Esto es lo que<br />ha dado <span className="gold">de sí</span></Reveal>
        <div className="bignums">
          {items.map((it, i) => (
            <Reveal key={it.l} delay={i * 0.12} className="bignum">
              <b><Counter to={it.n} /></b>
              <strong>{it.l}</strong>
              <span>{it.s}</span>
            </Reveal>
          ))}
        </div>
        <Reveal as="p" className="lead">Y todo con palmas, panderetas y alguna que otra zambomba de fondo.</Reveal>
      </div>
    </Scene>
  );
}

const ORDEN = ["pepe", "carmen", "jose-luis", "lola", "mari-carmen", "cesar", "belen", "jose-maria", "lourdes", "alvaro"];
const COLORES: Record<string, string> = {
  abuelos: "#f4c25b", "jose-luis-y-lola": "#ff6b6b", "mari-carmen-y-cesar": "#ff9a3c", "belen-y-jose-maria": "#ffd9a0", "lourdes-y-alvaro": "#e0343f",
};

function pos(i: number, r = 40) {
  const a = (i / ORDEN.length) * Math.PI * 2 - Math.PI / 2;
  return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
}

export function Rotacion() {
  const { stats } = useWrapped();
  const [year, setYear] = useState(stats.years[0]);
  const [auto, setAuto] = useState(true);
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-30% 0px" });
  useEffect(() => {
    if (!auto || !inView || reduced) return;
    const t = setInterval(() => setYear((y) => {
      const i = stats.years.indexOf(y);
      return stats.years[(i + 1) % stats.years.length];
    }), 3200);
    return () => clearInterval(t);
  }, [auto, inView, reduced, stats.years]);

  const info = stats.yearInfo.find((y) => y.year === year)!;
  const idx = (id: string) => ORDEN.indexOf(id);
  return (
    <Scene id="rotacion" label="Rotación" className="act rotacion">
      <Layer speed={0.4} rotate={8} className="abs rot-a"><Poinsettia className="art w-poin" /></Layer>
      <Layer speed={0.6} className="abs rot-b"><Zambomba className="art w-zamb" /></Layer>
      <Layer speed={0.9} rotate={10} className="abs rot-c"><Note className="note n1" /></Layer>
      <div className="content center">
        <Reveal as="p" className="eyebrow">Acto 4 · La rotación</Reveal>
        <Reveal as="h2">¿Quién le regaló<br />a <span className="gold">quién</span>?</Reveal>
        <div role="tablist" aria-label="Año del sorteo" className="years">
          {stats.years.map((y) => (
            <button key={y} role="tab" aria-selected={y === year} className={y === year ? "on" : ""} onClick={() => { setAuto(false); setYear(y); }}>{y}</button>
          ))}
        </div>
        <div className="ring" ref={ref}>
          <svg viewBox="0 0 100 100" className="arcs" aria-hidden="true">
            <defs>
              {Object.entries(COLORES).map(([k, c]) => (
                <marker key={k} id={`ah-${k}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                  <path d="M0 0 L10 5 L0 10z" fill={c} />
                </marker>
              ))}
            </defs>
            {info.gifts.filter((g) => g.to).map((g, i) => {
              const a = pos(idx(g.from)), b = pos(idx(g.to!));
              const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
              const s = { x: a.x + (dx / d) * 8, y: a.y + (dy / d) * 8 };
              const e = { x: b.x - (dx / d) * 9, y: b.y - (dy / d) * 9 };
              const c = { x: 50 + ((a.x + b.x) / 2 - 50) * 0.3, y: 50 + ((a.y + b.y) / 2 - 50) * 0.3 };
              const gid = persona(g.from).familia ?? "abuelos";
              return (
                <motion.path
                  key={`${year}-${g.from}`}
                  d={`M${s.x} ${s.y} Q${c.x} ${c.y} ${e.x} ${e.y}`}
                  fill="none" stroke={COLORES[gid]} strokeWidth="0.7" strokeLinecap="round" markerEnd={`url(#ah-${gid})`}
                  initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.9 }}
                  transition={{ duration: 0.9, delay: 0.1 + i * 0.12 }}
                />
              );
            })}
          </svg>
          {ORDEN.map((id, i) => {
            const p = pos(i);
            const miss = info.missingGivers.includes(id);
            return (
              <div key={id} className="node" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                <Avatar id={id} size="sm" />
                {miss && <span className="qmark" title="Dato perdido">?</span>}
                <span className="nname">{persona(id).nombre}</span>
              </div>
            );
          })}
          <div className="ring-center">
            <b>{year}</b>
            <span>{info.gifts.filter((g) => g.to).length}/{info.gifts.length} regalos</span>
          </div>
        </div>
        <p className="lead small" aria-live="polite">
          {info.missingGivers.length === 0
            ? `${year}: sorteo completo, 10 flechas y ni un hueco.`
            : `${year}: faltan ${info.missingGivers.length} regalos (los “?”). Más en el Acto 7.`}
        </p>
        <details className="textlist">
          <summary>Ver {year} en texto</summary>
          <ul>
            {info.gifts.map((g) => (
              <li key={g.from}>{persona(g.from).nombre} → {g.to ? persona(g.to).nombre : "dato perdido"}</li>
            ))}
          </ul>
        </details>
      </div>
    </Scene>
  );
}

export function Records() {
  const { stats } = useWrapped();
  return (
    <Scene id="records" label="Récords y curiosidades" className="act records">
      <Layer speed={0.5} rotate={-10} className="abs rec-a"><Palmas className="art w-palm" /></Layer>
      <Layer speed={0.4} rotate={8} className="abs rec-b"><Poinsettia className="art w-poin" /></Layer>
      <Layer speed={0.8} className="abs rec-c"><Star className="star s1" /></Layer>
      <div className="content">
        <Reveal as="p" className="eyebrow">Acto 5 · Récords y curiosidades</Reveal>
        <Reveal as="h2">Lo que <span className="gold">no sabías</span><br />que querías saber</Reveal>
        <div className="cards">
          {stats.records.map((r, i) => (
            <Reveal key={r.id} delay={(i % 2) * 0.1} className="rcard">
              <span className="ric" aria-hidden="true">{ICONS[r.icon]}</span>
              <b>{r.valor}</b>
              <h3>{r.titulo}</h3>
              <p>{r.texto}</p>
            </Reveal>
          ))}
        </div>
        <Reveal as="p" className="foot">* Calculado solo con los regalos que sí quedaron registrados.</Reveal>
      </div>
    </Scene>
  );
}

const SHORT: Record<string, string> = {
  abuelos: "Abuelos", "jose-luis-y-lola": "Jose Luis y Lola", "mari-carmen-y-cesar": "Mari Carmen y Cesar", "belen-y-jose-maria": "Belén y J. María", "lourdes-y-alvaro": "Lourdes y Alvaro",
};

export function Cruces() {
  const { stats } = useWrapped();
  const m = stats.matrix;
  const max = Math.max(...GRUPOS.flatMap((a) => GRUPOS.map((b) => m[a.id][b.id])));
  let best = { a: "", b: "", n: 0 };
  for (const a of GRUPOS) for (const b of GRUPOS) if (m[a.id][b.id] > best.n) best = { a: a.id, b: b.id, n: m[a.id][b.id] };
  const rowTotal = (a: string) => GRUPOS.reduce((s, b) => s + m[a][b.id], 0);
  const colTotal = (b: string) => GRUPOS.reduce((s, a) => s + m[a.id][b], 0);
  return (
    <Scene id="cruces" label="Cruces entre familias" className="act cruces">
      <Layer speed={0.5} rotate={-6} className="abs cru-a"><Pandereta className="art w-pand" /></Layer>
      <Layer speed={0.3} className="abs cru-b"><Zambomba className="art w-zamb" /></Layer>
      <Layer speed={0.7} rotate={9} className="abs cru-c"><Note className="note n1" /></Layer>
      <div className="content center">
        <Reveal as="p" className="eyebrow">Acto 6 · Cruces entre familias</Reveal>
        <Reveal as="h2">Regalos que<br />cruzan <span className="gold">fronteras</span></Reveal>
        <Reveal as="p" className="lead small">Filas: quien regala. Columnas: quien recibe.</Reveal>
        <Reveal className="matrix-wrap">
          <table className="matrix">
            <caption className="sr-only">Regalos entre ramas de la familia</caption>
            <thead>
              <tr><th scope="col"><span className="sr-only">Regala ↓ / Recibe →</span></th>
                {GRUPOS.map((g) => <th key={g.id} scope="col"><span>{SHORT[g.id]}</span></th>)}
              </tr>
            </thead>
            <tbody>
              {GRUPOS.map((a, ri) => (
                <tr key={a.id}>
                  <th scope="row">{SHORT[a.id]}</th>
                  {GRUPOS.map((b, ci) => {
                    const v = m[a.id][b.id];
                    return (
                      <td key={b.id} className={a.id === b.id ? "diag" : ""}>
                        <motion.span
                          style={{ background: v ? `rgba(244,194,91,${0.18 + 0.8 * (v / max)})` : "transparent", color: v / max > 0.55 ? "#2a0a10" : "#fff4dc" }}
                          initial={{ scale: 0.4, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}
                          transition={{ delay: 0.05 * (ri + ci), type: "spring", stiffness: 180, damping: 14 }}
                        >{v || "·"}</motion.span>
                      </td>
                    );
                  })}
                  <td className="tot">{rowTotal(a.id)}</td>
                </tr>
              ))}
              <tr className="totrow"><th scope="row">Reciben</th>
                {GRUPOS.map((b) => <td key={b.id} className="tot">{colTotal(b.id)}</td>)}<td />
              </tr>
            </tbody>
          </table>
        </Reveal>
        <Reveal as="p" className="lead">
          La ruta más transitada: <strong>{SHORT[best.a]} → {SHORT[best.b]}</strong> con {best.n} regalos.
          {stats.dentroRama === 0 && " Y la diagonal vacía lo confirma: nadie se regala dentro de su propia casa."}
        </Reveal>
      </div>
    </Scene>
  );
}

export function Misterio() {
  const { stats } = useWrapped();
  const conHuecos = stats.yearInfo.filter((y) => y.missingGivers.length > 0);
  const lbl = conHuecos.map((y) => y.year).join("–");
  const total = conHuecos.reduce((s, y) => s + y.missingGivers.length, 0);
  return (
    <Scene id="misterio" label="El misterio" className="act misterio">
      <Layer speed={0.3} rotate={-8} className="abs mis-a"><Star className="star s1" /></Layer>
      <Layer speed={0.6} rotate={6} className="abs mis-b"><Poinsettia className="art w-poin" /></Layer>
      <Layer speed={0.5} className="abs mis-c"><Pandereta className="art w-pand" /></Layer>
      <div className="content center">
        <Reveal as="p" className="eyebrow">Acto 7 · Caso abierto</Reveal>
        <Reveal as="h2">El misterio de<br /><span className="gold">{lbl}</span></Reveal>
        <Reveal as="p" className="lead">
          {total} regalos se esfumaron del registro. No es que no se hicieran: es que nadie lo apuntó. Se buscan testigos (y sospechamos de Papá Noel).
        </Reveal>
        <Reveal className="mystery-grid">
          <div className="mg-head" aria-hidden="true"><span />{stats.years.map((y) => <span key={y}>{y}</span>)}</div>
          {stats.participantes.map((id) => (
            <div key={id} className="mg-row">
              <span className="mg-name">{persona(id).nombre}</span>
              {stats.years.map((y) => {
                const g = stats.yearInfo.find((x) => x.year === y)!.gifts.find((x) => x.from === id)!;
                return (
                  <span key={y} className={`mg-cell ${g.to ? "" : "lost"}`}>
                    {g.to ? <Avatar id={g.to} size="xs" /> : <b title="Dato perdido" aria-label="dato perdido">?</b>}
                  </span>
                );
              })}
            </div>
          ))}
        </Reveal>
        <div className="clues">
          {conHuecos.map((y, i) => (
            <Reveal key={y.year} delay={i * 0.1} className="clue">
              <b>{y.year}</b>
              <p>Faltan {y.missingGivers.length} regalos de {y.missingGivers.map((x) => persona(x).nombre).join(", ")}. Quedan sin regalo conocido {y.missingReceivers.map((x) => persona(x).nombre).join(", ")}.</p>
              <p className="muted">Con las reglas del sorteo caben <strong>{y.posibles}</strong> maneras posibles de resolverlo. Nos toca confesar.</p>
            </Reveal>
          ))}
        </div>
      </div>
    </Scene>
  );
}

export function Teaser() {
  const [days, setDays] = useState<number | null>(null);
  const nuevos = personas.filter((p) => p.nacido2026);
  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear();
    let nav = new Date(y, 11, 24);
    if (now > nav) nav = new Date(y + 1, 11, 24);
    const id = requestAnimationFrame(() => setDays(Math.ceil((nav.getTime() - now.getTime()) / 86400000)));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <Scene id="dos-mil-veintiseis" label="2026" className="act teaser">
      <Layer speed={0.2} className="abs tea-sun"><Sun className="sun" /></Layer>
      <Layer speed={0.5} rotate={-8} className="abs tea-a"><Poinsettia className="art w-poin" /></Layer>
      <Layer speed={0.6} rotate={8} className="abs tea-b"><Pandereta className="art w-pand" /></Layer>
      <Layer speed={0.4} className="abs tea-c"><Zambomba className="art w-zamb" /></Layer>
      <Layer speed={0.9} className="abs tea-d"><Note double className="note n2" /></Layer>
      <Layer speed={-0.1} className="abs skyline-wrap"><Skyline className="skyline" /></Layer>
      <div className="content center">
        <Reveal as="p" className="eyebrow">Acto 8 · Lo que viene</Reveal>
        <Reveal as="h2">2026<br /><span className="gold">se agranda la familia</span></Reveal>
        <Reveal className="newcomers">
          {nuevos.map((p) => (
            <div key={p.id} className="pcard newbie">
              <Avatar id={p.id} size="lg" />
              <h4>{p.nombre}</h4>
              <span className="badge">Nueva incorporación</span>
            </div>
          ))}
        </Reveal>
        <Reveal as="p" className="lead">Joana y Elías llegan en 2026 y ya tienen a toda la familia cantando villancicos a su alrededor.</Reveal>
        <Reveal className="next">
          <p className="eyebrow">Próximo sorteo</p>
          <b>Navidad 2026</b>
          <p>El regalo lo trae Papá Noel (normalmente) o los Reyes Magos, y la fiesta, como siempre, en Córdoba: con zambomba, panderetas y palmas.</p>
          {days !== null && <p className="count"><Counter to={days} /> días para Nochebuena</p>}
        </Reveal>
        <a className="cue" href="#portada">Volver arriba<span aria-hidden="true">↑</span></a>
        <p className="foot">Hecho con cariño para la familia Martinez Flores · Feliz Navidad</p>
      </div>
    </Scene>
  );
}
