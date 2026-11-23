import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, ADMIN_MAX_AGE, crearSesion, passwordCorrecta } from "@/lib/gestion/admin";

const intentos = new Map<string, { n: number; hasta: number }>();

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const now = Date.now();
  const e = intentos.get(ip);
  if (e && e.hasta > now && e.n >= 5) return NextResponse.json({ ok: false, error: "espera" }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const dada = typeof body?.password === "string" ? body.password : "";
  if (!(await passwordCorrecta(dada))) {
    const vivo = e && e.hasta > now;
    intentos.set(ip, { n: (vivo ? e.n : 0) + 1, hasta: vivo ? e.hasta : now + 10 * 60 * 1000 });
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  intentos.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, await crearSesion(), {
    httpOnly: true, secure: req.nextUrl.protocol === "https:", sameSite: "strict", path: "/", maxAge: ADMIN_MAX_AGE,
  });
  return res;
}
