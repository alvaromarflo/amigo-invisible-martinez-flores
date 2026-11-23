import { NextResponse, type NextRequest } from "next/server";
import { esAdmin } from "@/lib/gestion/admin";
import { cargar, guardar, vistaPublica, type Estado } from "@/lib/gestion/store";
import { ASUNTO, construirCorreo, emailValido, enviarCorreo, pausa, proveedor } from "@/lib/gestion/mail";
import { cifrar, claveValida, descifrar } from "@/lib/gestion/cifrado";
import { barajar, construirProhibidos, sortear, validar } from "@/lib/sorteo";

export const maxDuration = 60;

const err = (m: string, s = 400, extra: object = {}) => NextResponse.json({ ok: false, error: m, ...extra }, { status: s });
// Solo se devuelve el estado de envío: jamás receptores.
const ok = (e: Estado, extra: object = {}) => NextResponse.json({ ok: true, estado: vistaPublica(e), ...extra });

async function enviarA(e: Estado, id: string, receptorId: string | null) {
  const p = e.participantes.find((x) => x.id === id)!;
  const r = receptorId ? e.participantes.find((x) => x.id === receptorId)?.nombre ?? null : null;
  const html = construirCorreo({ nombre: p.nombre, receptor: r, ...e.config, sustituye: e.sorteo.ronda > 1 });
  return enviarCorreo(p.email, ASUNTO, html);
}

export async function POST(req: NextRequest) {
  if (!(await esAdmin(req))) return err("No autorizado.", 401);
  const b = await req.json().catch(() => ({}));
  try {
    const e = await cargar();
    const ids = e.participantes.map((p) => p.id);
    const nombre = (id: string) => e.participantes.find((p) => p.id === id)?.nombre ?? "?";
    const motivos = validar(ids, construirProhibidos(e.parejas, e.pasado), nombre);
    for (const p of e.participantes) {
      if (!p.email) motivos.push(`${p.nombre} no tiene correo.`);
      else if (!emailValido(p.email)) motivos.push(`El correo de ${p.nombre} no es válido.`);
    }
    if (!proveedor()) motivos.push("El envío de correo no está configurado en el servidor.");
    if (motivos.length) return err("No se puede sortear todavía.", 422, { motivos });

    // Ensayo: prueba la maquinaria con el receptor oculto; no sortea ni cambia el estado.
    if (b.ensayo) {
      const to = typeof b.ensayo.to === "string" ? b.ensayo.to.trim() : "";
      if (!emailValido(to)) return err("Indica un correo de prueba válido.");
      let enviados = 0, errores = 0;
      for (const p of barajar(e.participantes)) {
        const html = construirCorreo({ nombre: p.nombre, receptor: null, ...e.config, sustituye: false });
        if (await enviarCorreo(to, `[ENSAYO] ${ASUNTO}`, html)) enviados++;
        else errores++;
        await pausa();
      }
      return ok(e, { ensayo: { enviados, errores } });
    }

    if (!claveValida()) return err("Falta ASSIGN_KEY (32 bytes en base64) en el servidor.", 500);
    const repetir = e.sorteo.hecho;
    if (!repetir && b.confirmar !== "SORTEAR") return err("Confirmación necesaria: escribe SORTEAR.");
    if (repetir && (b.confirmar !== "REPETIR" || b.entiendo !== true)) return err("El sorteo ya se hizo. Para repetirlo hace falta la doble confirmación.", 409);

    const asign = sortear(ids, construirProhibidos(e.parejas, e.pasado));
    if (!asign) return err("No se pudo encontrar una combinación válida.", 422);

    // Se guarda cifrado todo antes de enviar, así un corte a mitad no pierde ni mezcla nada.
    e.sorteo = { hecho: true, ronda: e.sorteo.ronda + 1, estados: {}, pend: {} };
    for (const id of ids) {
      e.sorteo.estados[id] = "pendiente";
      e.sorteo.pend[id] = cifrar(asign[id], id);
    }
    await guardar(e);

    for (const id of barajar(ids)) {
      const enviado = await enviarA(e, id, asign[id]);
      e.sorteo.estados[id] = enviado ? "enviado" : "error";
      if (enviado) delete e.sorteo.pend[id];
      await guardar(e);
      await pausa();
    }
    return ok(e);
  } catch {
    return err("Error interno.", 500);
  }
}

// Reintenta solo los envíos fallidos o pendientes (opcionalmente uno concreto).
export async function PUT(req: NextRequest) {
  if (!(await esAdmin(req))) return err("No autorizado.", 401);
  const b = await req.json().catch(() => ({}));
  try {
    const e = await cargar();
    if (!e.sorteo.hecho || !claveValida() || !proveedor()) return err("Nada que reintentar.", 409);
    const objetivo = Object.keys(e.sorteo.pend).filter((id) => e.sorteo.estados[id] !== "enviado" && (!b.id || b.id === id));
    for (const id of barajar(objetivo)) {
      let receptor: string;
      try { receptor = descifrar(e.sorteo.pend[id], id); } catch { e.sorteo.estados[id] = "error"; continue; }
      const enviado = await enviarA(e, id, receptor);
      e.sorteo.estados[id] = enviado ? "enviado" : "error";
      if (enviado) delete e.sorteo.pend[id];
      await guardar(e);
      await pausa();
    }
    return ok(e);
  } catch {
    return err("Error interno.", 500);
  }
}
