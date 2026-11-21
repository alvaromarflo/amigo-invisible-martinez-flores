import { NextResponse, type NextRequest } from "next/server";
import { personas } from "@/lib/stats";

const envios = new Map<string, { n: number; hasta: number }>();
const MAX = 6;
const VENTANA = 10 * 60 * 1000;
const NIVELES = ["", "Pocas ganas", "Algo de ganas", "Con ganas", "Muchas ganas", "¡Ganas locas!"];
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const now = Date.now();
  const e = envios.get(ip);
  if (e && e.hasta > now && e.n >= MAX) return NextResponse.json({ ok: false, error: "espera" }, { status: 429 });
  envios.set(ip, { n: (e && e.hasta > now ? e.n : 0) + 1, hasta: e && e.hasta > now ? e.hasta : now + VENTANA });

  let body: { quien?: unknown; ganas?: unknown; comentario?: unknown; web?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  if (body.web) return NextResponse.json({ ok: true }); // honeypot

  const p = personas.find((x) => x.id === body.quien && x.rol !== "niño");
  const ganas = Number(body.ganas);
  const comentario = typeof body.comentario === "string" ? body.comentario.trim().slice(0, 600) : "";
  if (!p || !Number.isInteger(ganas) || ganas < 1 || ganas > 5) return NextResponse.json({ ok: false }, { status: 400 });

  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return NextResponse.json({ ok: false, error: "config" }, { status: 503 });

  const nivel = NIVELES[ganas];
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.NOTIFY_FROM || "Amigo Invisible <onboarding@resend.dev>",
      to: [to],
      subject: `🎁 ${p.nombre}: ${nivel} (${ganas}/5)`,
      html: `<h2>${esc(p.nombre)} ha respondido</h2><p><b>Ganas:</b> ${"🎁".repeat(ganas)} ${nivel} (${ganas}/5)</p><p><b>Comentario sobre los Reyes Magos / Papá Noel:</b><br>${comentario ? esc(comentario).replace(/\n/g, "<br>") : "<i>Sin comentario</i>"}</p>`,
    }),
  });
  if (!r.ok) return NextResponse.json({ ok: false, error: "envio" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
