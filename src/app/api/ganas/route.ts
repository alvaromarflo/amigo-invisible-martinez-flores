import { NextResponse, type NextRequest } from "next/server";
import { personas } from "@/lib/stats";

const envios = new Map<string, { n: number; hasta: number }>();
const MAX = 6;
const VENTANA = 10 * 60 * 1000;
const NIVELES = ["", "Pocas ganas", "Algo de ganas", "Con ganas", "Muchas ganas", "¡Ganas locas!"];

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

  const url = process.env.GOOGLE_SCRIPT_URL;
  const secret = process.env.GOOGLE_SCRIPT_SECRET;
  if (!url || !secret) return NextResponse.json({ ok: false, error: "config" }, { status: 503 });

  try {
    const r = await fetch(url, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ secret, quien: p.nombre, ganas, nivel: NIVELES[ganas], comentario }),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok || !j?.ok) return NextResponse.json({ ok: false, error: "envio" }, { status: 502 });
  } catch {
    return NextResponse.json({ ok: false, error: "envio" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
