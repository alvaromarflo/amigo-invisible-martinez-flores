import { describe, expect, it } from "vitest";
import { clave, construirProhibidos, sortear, validar } from "./sorteo";

const ids = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
const parejas: [string, string][] = [["a", "b"], ["c", "d"], ["e", "f"]];
const pasado: [string, string][] = [["g", "h"], ["h", "i"], ["i", "g"], ["j", "a"]];
const prohibidos = construirProhibidos(parejas, pasado);

describe("sortear", () => {
  it("cada uno da y recibe exactamente uno, sin autoasignación ni exclusiones (500 sorteos)", () => {
    for (let n = 0; n < 500; n++) {
      const r = sortear(ids, prohibidos)!;
      expect(r).not.toBeNull();
      expect(Object.keys(r).sort()).toEqual(ids);
      expect(Object.values(r).sort()).toEqual(ids);
      for (const [d, x] of Object.entries(r)) {
        expect(d).not.toBe(x);
        expect(prohibidos.has(clave(d, x))).toBe(false);
      }
    }
  });

  it("la exclusión 'regaló el año pasado' es dirigida y la de pareja simétrica", () => {
    expect(prohibidos.has(clave("g", "h"))).toBe(true);
    expect(prohibidos.has(clave("h", "g"))).toBe(false);
    expect(prohibidos.has(clave("a", "b"))).toBe(true);
    expect(prohibidos.has(clave("b", "a"))).toBe(true);
  });

  it("no siempre produce el mismo resultado", () => {
    const vistos = new Set(Array.from({ length: 30 }, () => JSON.stringify(sortear(ids, prohibidos))));
    expect(vistos.size).toBeGreaterThan(1);
  });

  it("devuelve null cuando es imposible", () => {
    const imposible = construirProhibidos([], [["a", "b"], ["a", "c"], ["b", "a"], ["c", "a"]]);
    expect(sortear(["a", "b", "c"], imposible)).toBeNull();
  });
});

describe("validar", () => {
  const nombre = (id: string) => id.toUpperCase();
  it("acepta un caso posible", () => expect(validar(ids, prohibidos, nombre)).toEqual([]));
  it("exige 3 participantes", () => expect(validar(["a", "b"], new Set(), nombre)).toHaveLength(1));
  it("explica quién se queda sin receptor", () => {
    const p = construirProhibidos([], [["a", "b"], ["a", "c"]]);
    expect(validar(["a", "b", "c"], p, nombre)).toContain("A no tiene ningún receptor posible.");
  });
  it("detecta combinaciones imposibles aunque cada uno tenga opciones", () => {
    const p = construirProhibidos([], [["a", "b"], ["b", "a"], ["c", "a"], ["d", "a"]]);
    // a solo puede dar a c o d; b solo a c o d; c y d solo a b (c) / b (d): nadie puede dar a a salvo b
    const m = validar(["a", "b", "c", "d"], p, nombre);
    expect(m.length).toBeGreaterThan(0);
  });
});
