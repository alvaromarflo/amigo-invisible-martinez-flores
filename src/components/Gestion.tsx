"use client";
import { useCallback, useEffect, useState } from "react";

type P = { id: string; nombre: string; email: string };
type Estado = {
  participantes: P[];
  parejas: [string, string][];
  pasado: [string, string][];
  config: { presupuesto: string; fecha: string; nota: string };
  avisos: string[];
  sorteo: { hecho: boolean; ronda: number; estados: Record<string, "pendiente" | "enviado" | "error"> };
};
type Entorno = { almacenamiento: string; correo: string | null; claveAsignaciones: boolean };

const ETIQ = { pendiente: "Pendiente", enviado: "Enviado ✅", error: "Error al enviar ❌" };
const mismo = (a: [string, string], x: string, y: string) => a[0] === x && a[1] === y;

async function api(url: string, method: string, body?: unknown) {
  const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  return { status: r.status, data: await r.json().catch(() => ({})) };
}

export function Gestion() {
  const [fase, setFase] = useState<"cargando" | "login" | "panel">("cargando");
  const [pw, setPw] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [e, setE] = useState<Estado | null>(null);
  const [env, setEnv] = useState<Entorno | null>(null);
  const [sucio, setSucio] = useState(false);
  const [msg, setMsg] = useState("");
  const [motivos, setMotivos] = useState<string[]>([]);
  const [sel, setSel] = useState("");
  const [csv, setCsv] = useState("");
  const [ensayoTo, setEnsayoTo] = useState("");
  const [confirmar, setConfirmar] = useState<"" | "sortear" | "repetir">("");
  const [texto, setTexto] = useState("");
  const [entiendo, setEntiendo] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  const aplicar = (d: { estado: Estado; entorno?: Entorno }) => {
    setE(d.estado);
    if (d.entorno) setEnv(d.entorno);
    setSel((s) => s || d.estado.participantes[0]?.id || "");
    setSucio(false);
  };

  const cargar = useCallback(async () => {
    const { status, data } = await api("/api/gestion/estado", "GET");
    if (status === 401) return setFase("login");
    if (data.ok) { aplicar(data); setFase("panel"); } else { setMsg(data.error ?? "Error"); setFase("panel"); }
  }, []);
  useEffect(() => {
    const t = setTimeout(cargar, 0);
    return () => clearTimeout(t);
  }, [cargar]);

  async function entrar(ev: React.FormEvent) {
    ev.preventDefault();
    const { status } = await api("/api/gestion/login", "POST", { password: pw });
    setPw("");
    if (status === 200) { setLoginErr(""); cargar(); } else setLoginErr(status === 429 ? "Demasiados intentos. Espera unos minutos." : "Contraseña incorrecta.");
  }

  const editar = (fn: (x: Estado) => Estado) => { setE((x) => (x ? fn(x) : x)); setSucio(true); setMsg(""); };
  const setP = (id: string, campo: "nombre" | "email", v: string) => editar((x) => ({ ...x, participantes: x.participantes.map((p) => (p.id === id ? { ...p, [campo]: v } : p)) }));
  const quitar = (id: string) => editar((x) => ({
    ...x, participantes: x.participantes.filter((p) => p.id !== id),
    parejas: x.parejas.filter((a) => !a.includes(id)), pasado: x.pasado.filter((a) => !a.includes(id)),
  }));
  const anadir = () => editar((x) => ({ ...x, participantes: [...x.participantes, { id: crypto.randomUUID(), nombre: "", email: "" }] }));
  const importar = () => {
    const nuevos: P[] = [];
    for (const l of csv.split(/\r?\n/)) {
      const m = l.split(/[;,\t]/).map((s) => s.trim());
      if (m.length >= 2 && m[0]) nuevos.push({ id: crypto.randomUUID(), nombre: m[0], email: m[1] });
    }
    if (!nuevos.length) return setMsg("No se ha reconocido ninguna línea «nombre, correo».");
    editar((x) => {
      const lista = [...x.participantes];
      for (const n of nuevos) {
        const ya = lista.find((p) => p.nombre.toLowerCase() === n.nombre.toLowerCase());
        if (ya) ya.email = n.email; else lista.push(n);
      }
      return { ...x, participantes: lista };
    });
    setCsv("");
  };
  const togglePareja = (a: string, b: string) => editar((x) => ({
    ...x, parejas: x.parejas.some((p) => mismo(p, a, b) || mismo(p, b, a)) ? x.parejas.filter((p) => !(mismo(p, a, b) || mismo(p, b, a))) : [...x.parejas, [a, b]],
  }));
  const togglePasado = (a: string, b: string) => editar((x) => ({
    ...x, pasado: x.pasado.some((p) => mismo(p, a, b)) ? x.pasado.filter((p) => !mismo(p, a, b)) : [...x.pasado, [a, b]],
  }));

  async function guardar() {
    if (!e) return;
    setOcupado(true);
    const { data } = await api("/api/gestion/estado", "PUT", e);
    setOcupado(false);
    if (data.ok) { aplicar(data); setMsg("Guardado ✅"); } else setMsg(data.error ?? "No se pudo guardar.");
  }

  async function lanzar(cuerpo: object, metodo = "POST") {
    setOcupado(true); setMotivos([]); setMsg("Enviando… no cierres esta página.");
    const { data } = await api("/api/gestion/sorteo", metodo, cuerpo);
    setOcupado(false); setConfirmar(""); setTexto(""); setEntiendo(false);
    if (data.ok) {
      aplicar(data);
      setMsg(data.ensayo ? `Ensayo terminado: ${data.ensayo.enviados} correos enviados, ${data.ensayo.errores} errores.` : "Hecho. Revisa el estado de cada envío.");
    } else { setMsg(data.error ?? "Error"); setMotivos(data.motivos ?? []); }
  }

  if (fase === "cargando") return <main className="gest"><p className="muted">Cargando…</p></main>;
  if (fase === "login") {
    return (
      <main className="gate">
        <form onSubmit={entrar} className="gate-card">
          <p className="eyebrow">Zona de gestión</p>
          <h1>Panel <span className="gold">admin</span></h1>
          <label htmlFor="admin-pw" className="sr-only">Contraseña de administrador</label>
          <input id="admin-pw" type="password" required value={pw} onChange={(x) => setPw(x.target.value)} placeholder="Contraseña de administrador" autoComplete="current-password" />
          <button type="submit">Entrar</button>
          {loginErr && <p role="alert" className="gate-error">{loginErr}</p>}
        </form>
      </main>
    );
  }
  if (!e) return <main className="gest"><p role="alert" className="gate-error">{msg || "Error"}</p></main>;

  const actual = e.participantes.find((p) => p.id === sel);
  const otros = e.participantes.filter((p) => p.id !== sel);
  const hayErrores = Object.values(e.sorteo.estados).some((s) => s !== "enviado");

  return (
    <main className="gest">
      <header className="gest-head">
        <p className="eyebrow">Familia Martinez Flores</p>
        <h1>Gestión del <span className="gold">sorteo</span></h1>
        <button type="button" className="ganas-cancel" onClick={async () => { await api("/api/gestion/logout", "POST"); setFase("login"); setE(null); }}>Salir</button>
      </header>

      {env && (env.almacenamiento !== "redis" || !env.correo || !env.claveAsignaciones) && (
        <section className="gest-card gest-warn" role="status">
          <b>Falta configurar en el servidor:</b>
          <ul>
            {env.almacenamiento !== "redis" && <li>Base de datos (Upstash Redis): {env.almacenamiento === "memoria" ? "ahora solo en memoria (se pierde)" : "no disponible"}.</li>}
            {!env.correo && <li>Envío de correo (Resend o script de Google).</li>}
            {!env.claveAsignaciones && <li>ASSIGN_KEY (clave de cifrado).</li>}
          </ul>
        </section>
      )}

      <section className="gest-card">
        <h2>Participantes</h2>
        {e.participantes.map((p) => (
          <div className="gest-row" key={p.id}>
            <input aria-label="Nombre" value={p.nombre} onChange={(x) => setP(p.id, "nombre", x.target.value)} placeholder="Nombre" maxLength={60} />
            <input aria-label={`Correo de ${p.nombre}`} type="email" inputMode="email" value={p.email} onChange={(x) => setP(p.id, "email", x.target.value)} placeholder="correo@ejemplo.com" maxLength={120} />
            <button type="button" className="gest-x" aria-label={`Borrar a ${p.nombre || "participante"}`} onClick={() => quitar(p.id)}>🗑</button>
          </div>
        ))}
        <button type="button" className="ganas-cancel" onClick={anadir}>+ Añadir participante</button>
        <details>
          <summary>Importar lista o CSV</summary>
          <textarea rows={4} value={csv} onChange={(x) => setCsv(x.target.value)} placeholder={"Nombre, correo\nOtro nombre, otro@correo.com"} />
          <button type="button" className="ganas-cancel" onClick={importar}>Importar</button>
        </details>
      </section>

      <section className="gest-card">
        <h2>Exclusiones</h2>
        <p className="muted">Elige una persona y marca con quién no puede emparejarse. Nadie se toca a sí mismo.</p>
        {e.avisos.length > 0 && <ul className="gest-avisos">{e.avisos.map((a) => <li key={a}>{a}</li>)}</ul>}
        <label htmlFor="g-sel" className="sr-only">Persona</label>
        <select id="g-sel" value={sel} onChange={(x) => setSel(x.target.value)}>
          {e.participantes.map((p) => <option key={p.id} value={p.id}>{p.nombre || "(sin nombre)"}</option>)}
        </select>
        {actual && otros.map((o) => {
          const pareja = e.parejas.some((p) => mismo(p, actual.id, o.id) || mismo(p, o.id, actual.id));
          const pas = e.pasado.some((p) => mismo(p, actual.id, o.id));
          return (
            <div className="gest-excl" key={o.id}>
              <span>{o.nombre || "(sin nombre)"}</span>
              <button type="button" aria-pressed={pareja} className={pareja ? "on" : ""} onClick={() => togglePareja(actual.id, o.id)}>💑 Pareja</button>
              <button type="button" aria-pressed={pas} className={pas ? "on" : ""} onClick={() => togglePasado(actual.id, o.id)}>🎁 Le regaló el año pasado</button>
            </div>
          );
        })}
      </section>

      <section className="gest-card">
        <h2>Detalles del correo</h2>
        <label htmlFor="c-pre">Presupuesto</label>
        <input id="c-pre" value={e.config.presupuesto} maxLength={60} placeholder="p. ej. 20 €" onChange={(x) => editar((s) => ({ ...s, config: { ...s.config, presupuesto: x.target.value } }))} />
        <label htmlFor="c-fec">Fecha de entrega</label>
        <input id="c-fec" value={e.config.fecha} maxLength={60} placeholder="p. ej. 24 de diciembre" onChange={(x) => editar((s) => ({ ...s, config: { ...s.config, fecha: x.target.value } }))} />
        <label htmlFor="c-not">Nota (opcional)</label>
        <textarea id="c-not" rows={2} value={e.config.nota} maxLength={300} onChange={(x) => editar((s) => ({ ...s, config: { ...s.config, nota: x.target.value } }))} />
      </section>

      <div className="gest-save">
        <button type="button" className="ganas-send" disabled={!sucio || ocupado} onClick={guardar}>{sucio ? "Guardar cambios" : "Todo guardado"}</button>
      </div>

      <section className="gest-card">
        <h2>Sorteo</h2>
        <p className="muted">Nadie, tampoco tú, verá quién regala a quién: solo el estado de cada envío.</p>
        <ul className="gest-estados">
          {e.participantes.map((p) => (
            <li key={p.id}><span>{p.nombre}</span><b>{ETIQ[e.sorteo.estados[p.id] ?? "pendiente"]}</b></li>
          ))}
        </ul>

        <h3>Ensayo</h3>
        <p className="muted">Envía todos los correos a una sola dirección con el nombre del regalado oculto. No sortea.</p>
        <input type="email" aria-label="Correo de prueba" placeholder="tu-correo-de-prueba@ejemplo.com" value={ensayoTo} onChange={(x) => setEnsayoTo(x.target.value)} />
        <button type="button" className="ganas-cancel" disabled={sucio || ocupado || !ensayoTo} onClick={() => lanzar({ ensayo: { to: ensayoTo } })}>Hacer ensayo</button>

        {!e.sorteo.hecho ? (
          <button type="button" className="ganas-send gest-big" disabled={sucio || ocupado} onClick={() => setConfirmar("sortear")}>🎁 Hacer sorteo y enviar correos</button>
        ) : (
          <>
            {hayErrores && <button type="button" className="ganas-send" disabled={ocupado} onClick={() => lanzar({}, "PUT")}>Reintentar fallidos</button>}
            <button type="button" className="ganas-cancel" disabled={sucio || ocupado} onClick={() => setConfirmar("repetir")}>Repetir sorteo…</button>
          </>
        )}

        {confirmar && (
          <div className="gest-confirm" role="alertdialog" aria-labelledby="conf-t">
            <p id="conf-t"><b>{confirmar === "sortear" ? "Se hará el sorteo y se enviarán los correos reales." : "Se invalidarán los correos anteriores y se enviarán otros nuevos."}</b></p>
            <label htmlFor="conf-in">Escribe <b>{confirmar === "sortear" ? "SORTEAR" : "REPETIR"}</b> para confirmar</label>
            <input id="conf-in" value={texto} onChange={(x) => setTexto(x.target.value)} autoComplete="off" />
            {confirmar === "repetir" && (
              <label className="gest-check"><input type="checkbox" checked={entiendo} onChange={(x) => setEntiendo(x.target.checked)} /> Entiendo que el sorteo anterior deja de valer</label>
            )}
            <div className="ganas-actions">
              <button type="button" className="ganas-cancel" onClick={() => { setConfirmar(""); setTexto(""); }}>Cancelar</button>
              <button type="button" className="ganas-send" disabled={ocupado || texto !== (confirmar === "sortear" ? "SORTEAR" : "REPETIR") || (confirmar === "repetir" && !entiendo)}
                onClick={() => lanzar({ confirmar: texto, entiendo })}>Confirmar</button>
            </div>
          </div>
        )}
      </section>

      {motivos.length > 0 && <ul className="gest-card gest-warn" role="alert">{motivos.map((m) => <li key={m}>{m}</li>)}</ul>}
      {msg && <p role="status" className="gest-msg">{msg}</p>}
    </main>
  );
}
