import "server-only";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
export const emailValido = (e: string) => /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(e) && e.length <= 120;

export function proveedor(): "resend" | "script" | null {
  if (process.env.RESEND_API_KEY && process.env.MAIL_FROM) return "resend";
  if (process.env.MAIL_SCRIPT_URL && process.env.MAIL_SCRIPT_SECRET) return "script";
  return null;
}

type Datos = { nombre: string; receptor: string | null; presupuesto: string; fecha: string; nota: string; sustituye: boolean };

export function construirCorreo(d: Datos) {
  const receptor = d.receptor === null ? "▒▒▒▒▒ (oculto en el ensayo)" : esc(d.receptor);
  const linea = (t: string) => `<p style="margin:6px 0;color:#fff4dc">${t}</p>`;
  return `<!doctype html><html lang="es"><body style="margin:0;background:#14060a;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:520px;margin:0 auto;padding:28px 16px">
<div style="border:2px solid #f4c25b;border-radius:24px;background:#1d0910;padding:28px 22px;text-align:center">
<p style="margin:0;color:#f4c25b;letter-spacing:3px;font-size:12px;text-transform:uppercase">Familia Martinez Flores</p>
<h1 style="margin:10px 0 4px;color:#fff4dc;font-family:Georgia,serif;font-size:32px">Amigo <span style="color:#f4c25b">Invisible</span> 🎁</h1>
<p style="color:#fff4dc;font-size:18px">¡Hola, ${esc(d.nombre)}!</p>
${d.sustituye ? `<p style="background:#7a1a14;color:#fff4dc;border-radius:12px;padding:8px 12px;font-size:14px">⚠️ Este correo sustituye al anterior. Ignora el que recibiste antes.</p>` : ""}
<p style="color:#fff4dc;font-size:16px;margin:18px 0 6px">Te ha tocado regalar a:</p>
<p style="margin:0 0 18px;color:#f4c25b;font-family:Georgia,serif;font-size:34px;font-weight:bold">${receptor}</p>
${d.presupuesto ? linea(`💶 Presupuesto: <b>${esc(d.presupuesto)}</b>`) : ""}
${d.fecha ? linea(`📅 Entrega: <b>${esc(d.fecha)}</b>`) : ""}
${d.nota ? linea(esc(d.nota)) : ""}
<p style="margin:20px 0 0;color:#c9b99a;font-size:13px">Es un secreto: ¡que lo trae Papá Noel! 🎅 Feliz Navidad desde Córdoba.</p>
</div></div></body></html>`;
}

async function intentar(to: string, subject: string, html: string): Promise<boolean> {
  try {
    if (proveedor() === "resend") {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.MAIL_FROM, to: [to], subject, html }),
      });
      return r.ok;
    }
    if (proveedor() === "script") {
      const r = await fetch(process.env.MAIL_SCRIPT_URL!, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ secret: process.env.MAIL_SCRIPT_SECRET, to, subject, html }),
      });
      const j = await r.json().catch(() => null);
      return r.ok && j?.ok === true;
    }
  } catch {
    // sin detalles: el contenido del correo no debe acabar en logs
  }
  return false;
}

// Hasta 3 intentos con espera creciente; devuelve solo éxito/fallo.
export async function enviarCorreo(to: string, subject: string, html: string) {
  for (let i = 0; i < 3; i++) {
    if (await intentar(to, subject, html)) return true;
    await new Promise((r) => setTimeout(r, 800 * (i + 1)));
  }
  return false;
}

export const pausa = () => new Promise((r) => setTimeout(r, 700));
export const ASUNTO = "🎁 Tu amigo invisible Martinez Flores";
