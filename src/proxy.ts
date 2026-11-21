import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, safeEqual, tokenFor } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/acceso" || pathname === "/acceso/" || pathname === "/api/acceso") return NextResponse.next();

  const password = process.env.SITE_PASSWORD;
  const cookie = req.cookies.get(COOKIE)?.value;
  // Sin SITE_PASSWORD no se deja pasar a nadie.
  if (password && cookie && safeEqual(cookie, await tokenFor(password))) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/acceso";
  url.search = "";
  return NextResponse.redirect(url, 307);
}

// Cubre todo (incluidas las fotos de /people); solo se excluyen los assets de build de Next.
export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
