import { NextResponse, type NextRequest } from "next/server";
import { esAdmin } from "@/lib/gestion/admin";
import { cargar, guardar, vistaPublica, almacenamiento, type Estado } from "@/lib/gestion/store";
import { emailValido, proveedor } from "@/lib/gestion/mail";
import { claveValida } from "@/lib/gestion/cifrado";

const no = () => NextResponse.json({ ok: false }, { status: 401 });
const err = (m: string, s = 400) => NextResponse.json({ ok: false, error: m }, { status: s });
const txt = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function respuesta(e: Estado) {
  return NextResponse.json({
    ok: true,
    estado: vistaPublica(e),
    entorno: { almacenamiento, correo: proveedor(), claveAsignaciones: claveValida() },
  });
}

export async function GET(req: NextRequest) {
  if (!(await esAdmin(req))) return no();
  try { return respuesta(await cargar()); } catch { return err("No se puede acceder al almacenamiento.", 500); }
}

export async function PUT(req: NextRequest) {
  if (!(await esAdmin(req))) return no();
  const b = await req.json().catch(() => null);
  if (!b || !Array.isArray(b.participantes) || b.participantes.length > 60) return err("Datos no válidos.");

  const vistos = { id: new Set<string>(), nombre: new Set<string>(), email: new Set<string>() };
  const participantes: Estado["participantes"] = [];
  for (const p of b.participantes) {
    const id = txt(p?.id, 64), nombre = txt(p?.nombre, 60), email = txt(p?.email, 120).toLowerCase();
    if (!id || vistos.id.has(id)) return err("Identificador repetido.");
    if (!nombre) return err("Hay un participante sin nombre.");
    if (vistos.nombre.has(nombre.toLowerCase())) return err(`El nombre "${nombre}" está repetido.`);
    if (email && !emailValido(email)) return err(`El correo de ${nombre} no tiene un formato válido.`);
    if (email && vistos.email.has(email)) return err(`El correo de ${nombre} está repetido.`);
    vistos.id.add(id); vistos.nombre.add(nombre.toLowerCase()); if (email) vistos.email.add(email);
    participantes.push({ id, nombre, email });
  }
  const par = (v: unknown): [string, string][] =>
    Array.isArray(v)
      ? v.filter((x) => Array.isArray(x) && vistos.id.has(x[0]) && vistos.id.has(x[1]) && x[0] !== x[1]).map((x) => [x[0], x[1]] as [string, string])
      : [];

  try {
    const e = await cargar();
    e.participantes = participantes;
    e.parejas = par(b.parejas);
    e.pasado = par(b.pasado);
    e.config = { presupuesto: txt(b.config?.presupuesto, 60), fecha: txt(b.config?.fecha, 60), nota: txt(b.config?.nota, 300) };
    for (const id of Object.keys(e.sorteo.estados)) if (!vistos.id.has(id)) { delete e.sorteo.estados[id]; delete e.sorteo.pend[id]; }
    await guardar(e);
    return respuesta(e);
  } catch { return err("No se pudo guardar.", 500); }
}
