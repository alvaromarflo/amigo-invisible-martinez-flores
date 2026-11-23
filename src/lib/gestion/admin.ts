import "server-only";
import type { NextRequest } from "next/server";
import { hmacHex, safeEqual } from "@/lib/auth";

export const ADMIN_COOKIE = "ai_admin";
export const ADMIN_MAX_AGE = 60 * 60 * 8;

const firma = (secret: string, exp: number) => hmacHex(secret, `admin:${exp}`);

export async function crearSesion() {
  const secret = process.env.ADMIN_PASSWORD!;
  const exp = Date.now() + ADMIN_MAX_AGE * 1000;
  return `${exp}.${await firma(secret, exp)}`;
}

export async function passwordCorrecta(dada: string) {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false; // sin ADMIN_PASSWORD nadie entra
  return safeEqual(await hmacHex(secret, "login:" + dada), await hmacHex(secret, "login:" + secret));
}

export async function esAdmin(req: NextRequest) {
  const secret = process.env.ADMIN_PASSWORD;
  const v = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!secret || !v) return false;
  const [exp, sig] = v.split(".");
  if (!sig || !(Number(exp) > Date.now())) return false;
  return safeEqual(sig, await firma(secret, Number(exp)));
}
