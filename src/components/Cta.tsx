"use client";
import { useEffect, useRef, useState } from "react";
import { personas } from "@/lib/stats";

const NIVELES = [
  { v: 1, e: "😴", t: "Pocas ganas" },
  { v: 2, e: "🙂", t: "Algo de ganas" },
  { v: 3, e: "😄", t: "Con ganas" },
  { v: 4, e: "🤩", t: "Muchas ganas" },
  { v: 5, e: "🎉", t: "¡Ganas locas!" },
];
const participantes = personas.filter((p) => p.rol !== "niño");

export function CtaButton({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event("abrir-ganas"))}>
      {children}
    </button>
  );
}

export function FloatingCta() {
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const [quien, setQuien] = useState("");
  const [ganas, setGanas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [web, setWeb] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">("idle");
  const dlg = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.8);
    const onOpen = () => { setEstado("idle"); setOpen(true); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("abrir-ganas", onOpen);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("abrir-ganas", onOpen); };
  }, []);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!quien || !ganas) return;
    setEstado("enviando");
    try {
      const r = await fetch("/api/ganas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quien, ganas, comentario, web }),
      });
      setEstado(r.ok ? "ok" : "error");
      if (r.ok) { setGanas(0); setComentario(""); }
    } catch { setEstado("error"); }
  }

  return (
    <>
      {show && !open && (
        <button type="button" className="fab" onClick={() => setOpen(true)} aria-label="Cuéntanos tus ganas de este año">
          <span aria-hidden="true">🎁</span> ¿Qué ganas tienes?
        </button>
      )}
      <dialog ref={dlg} className="ganas" onClose={() => setOpen(false)} onClick={(e) => e.target === dlg.current && setOpen(false)} aria-labelledby="ganas-t">
        {estado === "ok" ? (
          <div className="ganas-ok" role="status">
            <div className="ganas-pop" aria-hidden="true">🎁✨</div>
            <h3 id="ganas-t">¡Recibido!</h3>
            <p>Papá Noel (o los Reyes) ya han tomado nota. ¡Feliz Navidad!</p>
            <button type="button" className="ganas-send" onClick={() => setOpen(false)}>Cerrar</button>
          </div>
        ) : (
          <form onSubmit={enviar}>
            <h3 id="ganas-t">¿Qué ganas tienes este año?</h3>
            <label htmlFor="g-quien">¿Quién eres?</label>
            <select id="g-quien" value={quien} onChange={(e) => setQuien(e.target.value)} required>
              <option value="">Elige tu nombre…</option>
              {participantes.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <fieldset>
              <legend>Tus ganas del amigo invisible</legend>
              <div className="ganas-niveles">
                {NIVELES.map((n) => (
                  <label key={n.v} className={ganas === n.v ? "on" : ""}>
                    <input type="radio" name="ganas" value={n.v} checked={ganas === n.v} onChange={() => setGanas(n.v)} required />
                    <span aria-hidden="true">{n.e}</span>
                    <small>{n.t}</small>
                  </label>
                ))}
              </div>
            </fieldset>
            <label htmlFor="g-com">Un comentario sobre los Reyes Magos / Papá Noel de este año (opcional)</label>
            <textarea id="g-com" rows={3} maxLength={600} value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Carta, deseos, pistas…" />
            <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="web" value={web} onChange={(e) => setWeb(e.target.value)} />
            {estado === "error" && <p role="alert" className="gate-error">No se ha podido enviar. Inténtalo de nuevo en un rato.</p>}
            <div className="ganas-actions">
              <button type="button" className="ganas-cancel" onClick={() => setOpen(false)}>Cancelar</button>
              <button type="submit" className="ganas-send" disabled={estado === "enviando"}>{estado === "enviando" ? "Enviando…" : "Enviar 🎁"}</button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
