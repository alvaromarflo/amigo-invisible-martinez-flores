// Lógica pura del sorteo: sin dependencias ni efectos, para poder probarla con datos ficticios.
export type Prohibidos = Set<string>;
export const clave = (dador: string, receptor: string) => `${dador}>${receptor}`;

// Entero uniforme en [0, n) con aleatoriedad criptográfica (rechazo para evitar sesgo).
export function aleatorio(n: number): number {
  const limite = Math.floor(0x100000000 / n) * n;
  const buf = new Uint32Array(1);
  do globalThis.crypto.getRandomValues(buf);
  while (buf[0] >= limite);
  return buf[0] % n;
}

export function barajar<T>(items: T[], rnd: (n: number) => number = aleatorio): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function construirProhibidos(parejas: [string, string][], pasado: [string, string][]): Prohibidos {
  const s: Prohibidos = new Set();
  for (const [a, b] of parejas) {
    s.add(clave(a, b));
    s.add(clave(b, a));
  }
  for (const [a, b] of pasado) s.add(clave(a, b));
  return s;
}

// Backtracking con orden aleatorio y comprobación hacia delante. Devuelve dador -> receptor o null.
export function sortear(ids: string[], prohibidos: Prohibidos, rnd: (n: number) => number = aleatorio): Record<string, string> | null {
  const dadores = barajar(ids, rnd);
  const usados = new Set<string>();
  const resultado: Record<string, string> = {};
  const permitido = (d: string, r: string) => d !== r && !prohibidos.has(clave(d, r));

  function resolver(i: number): boolean {
    if (i === dadores.length) return true;
    const d = dadores[i];
    for (const r of barajar(ids, rnd)) {
      if (usados.has(r) || !permitido(d, r)) continue;
      usados.add(r);
      resultado[d] = r;
      const viable = dadores.slice(i + 1).every((x) => ids.some((y) => !usados.has(y) && permitido(x, y)));
      if (viable && resolver(i + 1)) return true;
      usados.delete(r);
      delete resultado[d];
    }
    return false;
  }
  return resolver(0) ? resultado : null;
}

// Devuelve los motivos (en lenguaje claro) por los que no se puede sortear; vacío si es posible.
export function validar(ids: string[], prohibidos: Prohibidos, nombre: (id: string) => string): string[] {
  if (ids.length < 3) return ["Hacen falta al menos 3 participantes."];
  const motivos: string[] = [];
  for (const id of ids) {
    if (!ids.some((o) => o !== id && !prohibidos.has(clave(id, o)))) motivos.push(`${nombre(id)} no tiene ningún receptor posible.`);
    if (!ids.some((o) => o !== id && !prohibidos.has(clave(o, id)))) motivos.push(`Nadie puede regalar a ${nombre(id)}.`);
  }
  if (motivos.length === 0 && !sortear(ids, prohibidos)) {
    motivos.push("Cada persona tiene opciones, pero juntas las exclusiones no dejan ninguna combinación posible. Quita alguna exclusión.");
  }
  return motivos;
}
