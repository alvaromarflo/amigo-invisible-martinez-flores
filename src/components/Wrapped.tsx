"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import Image from "next/image";
import type { Stats } from "@/lib/stats";
import { persona, familias } from "@/lib/stats";

const Ctx = createContext<{ open: (id: string) => void; stats: Stats } | null>(null);
export const useWrapped = () => useContext(Ctx)!;

export function Avatar({
  id, size = "md", interactive = true, className = "",
}: { id: string; size?: "xs" | "sm" | "md" | "lg"; interactive?: boolean; className?: string }) {
  const { open } = useWrapped();
  const p = persona(id);
  const img = <Image src={p.foto} alt={interactive ? "" : p.nombre} width={160} height={160} className="avatar-img" />;
  if (!interactive) return <span className={`avatar ${size} ${className}`}>{img}</span>;
  return (
    <button type="button" className={`avatar ${size} ${className}`} onClick={() => open(id)} aria-label={`Ver el Wrapped de ${p.nombre}`}>
      {img}
    </button>
  );
}

export function WrappedProvider({ stats, children }: { stats: Stats; children: ReactNode }) {
  const [sel, setSel] = useState<string | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const open = useCallback((id: string) => setSel(id), []);
  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (sel && !d.open) d.showModal();
    if (!sel && d.open) d.close();
  }, [sel]);
  return (
    <Ctx.Provider value={{ open, stats }}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
      <dialog
        ref={dlg}
        className="wrapped-dialog"
        aria-label="Tu Wrapped"
        onClose={() => setSel(null)}
        onClick={(e) => { if (e.target === dlg.current) setSel(null); }}
      >
        {sel && <Card id={sel} stats={stats} onClose={() => setSel(null)} />}
      </dialog>
    </Ctx.Provider>
  );
}

function Card({ id, stats, onClose }: { id: string; stats: Stats; onClose: () => void }) {
  const p = persona(id);
  const ps = stats.persons[id];
  const fam = familias.find((f) => f.id === p.familia);
  const y0 = stats.years[0], y1 = stats.years[stats.years.length - 1];
  const nm = (x: string) => persona(x).nombre;
  return (
    <div className="wcard">
      <button type="button" className="wclose" onClick={onClose} aria-label="Cerrar">×</button>
      <p className="eyebrow">Tu Wrapped · {y0}–{y1}</p>
      <div className="wcard-head">
        <Avatar id={id} size="lg" interactive={false} />
        <div>
          <h3>{p.nombre}</h3>
          <p className="muted">{p.apodo || (fam ? `Rama ${fam.nombre}` : "")}</p>
        </div>
      </div>
      {!ps ? (
        <div className="wnote">
          {p.nacido2026 ? (
            <p><strong>Nueva incorporación 2026.</strong> Todavía no sabe lo que es un amigo invisible, pero ya tiene a toda la familia pendiente de su primer regalo.</p>
          ) : (
            <p><strong>Pequeño de la casa.</strong> Los niños no participan en el sorteo: de momento reciben regalos de Papá Noel y de todos los que les quieren.</p>
          )}
          {fam && <p className="muted">Rama {fam.nombre}</p>}
        </div>
      ) : (
        <>
          <div className="wstats">
            <div><b>{ps.knownGiven}</b><span>regalos conocidos que hiciste</span></div>
            <div><b>{ps.knownReceived}</b><span>regalos conocidos que recibiste</span></div>
          </div>
          <h4>Tú regalaste a…</h4>
          <ul className="wlist">
            {ps.gave.map((g) => (
              <li key={g.year}><em>{g.year}</em>{g.to ? (<><Avatar id={g.to} size="xs" interactive={false} /> {nm(g.to)}</>) : <span className="q">? dato perdido</span>}</li>
            ))}
          </ul>
          <h4>Te regaló…</h4>
          <ul className="wlist">
            {stats.years.map((y) => {
              const r = ps.received.find((x) => x.year === y);
              return <li key={y}><em>{y}</em>{r ? (<><Avatar id={r.from} size="xs" interactive={false} /> {nm(r.from)}</>) : <span className="q">? misterio</span>}</li>;
            })}
          </ul>
          <div className="wnote">
            {ps.repeatsGiven.length > 0 && <p>Repetiste con {ps.repeatsGiven.map((r) => `${nm(r.to)} (${r.years.join(" y ")})`).join(", ")}. ¡Debe de gustarte acertar!</p>}
            {ps.yearsWithoutKnownGiver.length > 0 && <p>En {ps.yearsWithoutKnownGiver.join(" y ")} no sabemos quién te hizo el regalo. Sospechamos de Papá Noel.</p>}
            {ps.repeatsGiven.length === 0 && ps.yearsWithoutKnownGiver.length === 0 && <p>Historial limpio: cada regalo, bien apuntado.</p>}
          </div>
        </>
      )}
    </div>
  );
}
