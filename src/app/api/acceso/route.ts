import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, MAX_AGE, safeEqual, tokenFor } from "@/lib/auth";

const intentos = new Map<string, { n: number; hasta: number }>();
const MAX = 5;
const VENTANA = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const now = Date.now();
  const e = intentos.get(ip);
  if (e && e.hasta > now && e.n >= MAX) {
    return NextResponse.redirect(new URL("/acceso?error=espera", req.url), 303);
  }

  const form = await req.formData();
  const given = String(form.get("password") ?? "");
  const password = process.env.SITE_PASSWORD;

  if (!password || !safeEqual(await tokenFor(given), await tokenFor(password))) {
    const cur = e && e.hasta > now ? e : { n: 0, hasta: now + VENTANA };
    intentos.set(ip, { n: cur.n + 1, hasta: cur.hasta });
    return NextResponse.redirect(new URL("/acceso?error=1", req.url), 303);
  }

  intentos.delete(ip);
  const res = NextResponse.redirect(new URL("/", req.url), 303);
  res.cookies.set(COOKIE, await tokenFor(password), {
    httpOnly: true, secure: req.nextUrl.protocol === "https:", sameSite: "lax", path: "/", maxAge: MAX_AGE,
  });
  return res;
}
