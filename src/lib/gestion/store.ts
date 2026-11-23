import "server-only";
import { randomUUID } from "node:crypto";
import familiaJson from "@/data/familia.json";
import sorteosJson from "@/data/sorteos.json";

export type Participante = { id: string; nombre: string; email: string };
export type EstadoEnvio = "pendiente" | "enviado" | "error";
export type Estado = {
  participantes: Participante[];
  parejas: [string, string][];
  pasado: [string, string][];
  config: { presupuesto: string; fecha: string; nota: string };
  avisos: string[];
  sorteo: {
    hecho: boolean;
    ronda: number;
    estados: Record<string, EstadoEnvio>;
    // Receptor cifrado (AES-256-GCM) solo mientras el correo no se ha enviado; se borra al enviarlo.
    pend: Record<string, string>;
  };
};

const KEY = "ai:estado:v1";
const URL = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
export const almacenamiento = URL && TOKEN ? "redis" : process.env.NODE_ENV === "production" ? "ninguno" : "memoria";

const mem = globalThis as unknown as { __aiEstado?: string };

async function redis(args: string[]) {
  const r = await fetch(URL!, { method: "POST", headers: { Authorization: `Bearer ${TOKEN}` }, body: JSON.stringify(args), cache: "no-store" });
  if (!r.ok) throw new Error("almacenamiento");
  return (await r.json()).result as string | null;
}

// Los datos de arranque salen del histórico del repo; no incluyen ningún correo.
function inicial(): Estado {
  const personas = familiaJson.personas.filter((p) => p.rol !== "niño");
  const ids = new Set(personas.map((p) => p.id));
  const sid: Record<number, string> = { 1: "pepe", 2: "carmen", 3: "belen", 4: "jose-maria", 5: "mari-carmen", 6: "cesar", 7: "jose-luis", 8: "lola", 9: "lourdes", 10: "alvaro" };
  const nombre = (id: string) => personas.find((p) => p.id === id)?.nombre ?? id;
  const parejas: [string, string][] = [];
  const pasado: [string, string][] = [];
  const avisos: string[] = [];
  for (const s of sorteosJson.sorteos) {
    const a = sid[s.id];
    const b = sid[s.noPuedeRegalarA];
    if (ids.has(a) && ids.has(b) && !parejas.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) parejas.push([a, b]);
    const regalos = s.regalos as Record<string, number | null>;
    const anios = Object.keys(regalos).sort().reverse();
    const ultimo = anios.find((y) => regalos[y] != null);
    if (!ultimo) { avisos.push(`${nombre(a)}: sin ningún dato de a quién regaló; no se ha precargado exclusión.`); continue; }
    if (ultimo !== anios[0]) avisos.push(`${nombre(a)}: no hay dato de ${anios[0]}; se ha usado ${ultimo} para "regaló el año pasado". Revísalo.`);
    pasado.push([a, sid[regalos[ultimo] as number]]);
  }
  return {
    participantes: personas.map((p) => ({ id: p.id, nombre: p.nombre, email: "" })),
    parejas, pasado,
    config: { presupuesto: "", fecha: "", nota: "" },
    avisos,
    sorteo: { hecho: false, ronda: 0, estados: {}, pend: {} },
  };
}

export async function cargar(): Promise<Estado> {
  if (almacenamiento === "ninguno") throw new Error("almacenamiento");
  const raw = almacenamiento === "redis" ? await redis(["GET", KEY]) : (mem.__aiEstado ?? null);
  if (raw) return JSON.parse(raw) as Estado;
  const e = inicial();
  await guardar(e);
  return e;
}

export async function guardar(e: Estado) {
  const raw = JSON.stringify(e);
  if (almacenamiento === "redis") await redis(["SET", KEY, raw]);
  else if (almacenamiento === "memoria") mem.__aiEstado = raw;
  else throw new Error("almacenamiento");
}

export const nuevoId = () => randomUUID();

// Vista segura para el navegador: nunca incluye los receptores (ni cifrados).
export function vistaPublica(e: Estado) {
  const { pend: _pend, ...sorteo } = e.sorteo;
  void _pend;
  return { ...e, sorteo };
}
