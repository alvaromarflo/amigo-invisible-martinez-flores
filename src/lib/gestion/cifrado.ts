import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function clave(): Buffer | null {
  const k = process.env.ASSIGN_KEY;
  if (!k) return null;
  const b = Buffer.from(k, "base64");
  return b.length === 32 ? b : null;
}
export const claveValida = () => clave() !== null;

// AES-256-GCM; el id del dador va como dato asociado para que un valor no se pueda mover a otra persona.
export function cifrar(texto: string, dador: string) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", clave()!, iv);
  c.setAAD(Buffer.from(dador));
  const ct = Buffer.concat([c.update(texto, "utf8"), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), ct]).toString("base64");
}

export function descifrar(valor: string, dador: string) {
  const b = Buffer.from(valor, "base64");
  const d = createDecipheriv("aes-256-gcm", clave()!, b.subarray(0, 12));
  d.setAAD(Buffer.from(dador));
  d.setAuthTag(b.subarray(12, 28));
  return Buffer.concat([d.update(b.subarray(28)), d.final()]).toString("utf8");
}
