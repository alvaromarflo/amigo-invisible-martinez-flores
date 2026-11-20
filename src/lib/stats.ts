import familiaJson from "@/data/familia.json";
import sorteosJson from "@/data/sorteos.json";

export type Persona = {
  id: string;
  nombre: string;
  apodo: string;
  familia: string | null;
  rol: string;
  foto: string;
  nacido2026: boolean;
};
export type Familia = { id: string; nombre: string; fotoPareja?: string };

// Los sorteos usan ids numéricos; este mapa los une con familia.json.
const SORTEO_A_PERSONA: Record<number, string> = {
  1: "pepe", 2: "carmen", 3: "belen", 4: "jose-maria", 5: "mari-carmen",
  6: "cesar", 7: "jose-luis", 8: "lola", 9: "lourdes", 10: "alvaro",
};

export const personas = familiaJson.personas as Persona[];
export const familias = familiaJson.familias as Familia[];
const byId = new Map(personas.map((p) => [p.id, p]));
export const persona = (id: string) => byId.get(id)!;

export const GRUPOS = [
  { id: "abuelos", nombre: "Abuelos" },
  ...familias.map((f) => ({ id: f.id, nombre: f.nombre })),
];
const grupoDe = (id: string) => persona(id).familia ?? "abuelos";

export type Gift = { year: number; from: string; to: string | null };
export type PairRepeat = { from: string; to: string; years: number[] };
export type YearInfo = {
  year: number;
  gifts: Gift[];
  missingGivers: string[];
  missingReceivers: string[];
  posibles: number;
};
export type PersonStats = {
  id: string;
  gave: { year: number; to: string | null }[];
  received: { year: number; from: string }[];
  repeatsGiven: PairRepeat[];
  yearsWithoutKnownGiver: number[];
  knownGiven: number;
  knownReceived: number;
};
export type Record_ = { id: string; icon: string; titulo: string; valor: string; texto: string };

function parejaDe(sid: number) {
  return SORTEO_A_PERSONA[sorteosJson.sorteos.find((s) => s.id === sid)!.noPuedeRegalarA];
}

// Cuenta asignaciones válidas (nadie a sí mismo ni a su pareja) que encajan con los huecos.
function contarPosibles(missingGivers: string[], missingReceivers: string[]) {
  const partner = new Map<string, string>();
  for (const s of sorteosJson.sorteos) partner.set(SORTEO_A_PERSONA[s.id], parejaDe(s.id));
  let count = 0;
  const used = new Set<string>();
  const go = (i: number) => {
    if (i === missingGivers.length) { count++; return; }
    for (const r of missingReceivers) {
      if (used.has(r) || r === missingGivers[i] || partner.get(missingGivers[i]) === r) continue;
      used.add(r); go(i + 1); used.delete(r);
    }
  };
  go(0);
  return count;
}

const lista = (xs: string[]) =>
  xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}`;
const n = (id: string) => persona(id).nombre;

export function computeStats() {
  const participantes = sorteosJson.sorteos.map((s) => SORTEO_A_PERSONA[s.id]);
  const years = Object.keys(sorteosJson.sorteos[0].regalos).map(Number).sort((a, b) => a - b);
  const gifts: Gift[] = [];
  for (const s of sorteosJson.sorteos) {
    for (const y of years) {
      const to = (s.regalos as Record<string, number | null>)[String(y)];
      gifts.push({ year: y, from: SORTEO_A_PERSONA[s.id], to: to == null ? null : SORTEO_A_PERSONA[to] });
    }
  }
  const known = gifts.filter((g) => g.to);
  const yearInfo: YearInfo[] = years.map((year) => {
    const gs = gifts.filter((g) => g.year === year);
    const got = new Set(gs.filter((g) => g.to).map((g) => g.to!));
    const missingGivers = gs.filter((g) => !g.to).map((g) => g.from);
    const missingReceivers = participantes.filter((p) => !got.has(p));
    return { year, gifts: gs, missingGivers, missingReceivers, posibles: missingGivers.length ? contarPosibles(missingGivers, missingReceivers) : 1 };
  });

  // Parejas dador→receptor repetidas
  const pairMap = new Map<string, PairRepeat>();
  for (const g of known) {
    const k = `${g.from}>${g.to}`;
    const e = pairMap.get(k) ?? { from: g.from, to: g.to!, years: [] };
    e.years.push(g.year); pairMap.set(k, e);
  }
  const pairs = [...pairMap.values()];
  const repeats = pairs.filter((p) => p.years.length > 1);
  const consecutive = repeats.filter((p) => p.years.some((y, i) => i > 0 && y - p.years[i - 1] === 1));

  const persons: Record<string, PersonStats> = {};
  for (const id of participantes) {
    const received = known.filter((g) => g.to === id).map((g) => ({ year: g.year, from: g.from }));
    persons[id] = {
      id,
      gave: gifts.filter((g) => g.from === id).map((g) => ({ year: g.year, to: g.to })),
      received,
      repeatsGiven: repeats.filter((r) => r.from === id),
      yearsWithoutKnownGiver: years.filter((y) => !received.some((r) => r.year === y)),
      knownGiven: known.filter((g) => g.from === id).length,
      knownReceived: received.length,
    };
  }

  // Matriz de flujo entre ramas
  const matrix: Record<string, Record<string, number>> = {};
  for (const a of GRUPOS) { matrix[a.id] = {}; for (const b of GRUPOS) matrix[a.id][b.id] = 0; }
  for (const g of known) matrix[grupoDe(g.from)][grupoDe(g.to!)]++;
  const dentroRama = known.filter((g) => grupoDe(g.from) === grupoDe(g.to!)).length;

  // Récords
  const byReceived = [...participantes].sort((a, b) => persons[b].knownReceived - persons[a].knownReceived);
  const maxR = persons[byReceived[0]].knownReceived;
  const topR = byReceived.filter((p) => persons[p].knownReceived === maxR);
  const minR = persons[byReceived[byReceived.length - 1]].knownReceived;
  const lowR = byReceived.filter((p) => persons[p].knownReceived === minR);
  const everyYear = participantes.filter((p) => persons[p].yearsWithoutKnownGiver.length === 0);
  const posiblesParejas = participantes.length * (participantes.length - 2);
  const estrenadas = pairs.length;
  const abuelos = personas.filter((p) => p.rol === "abuelo").map((p) => p.id);
  const aAbuelos = participantes
    .map((p) => ({ p, c: known.filter((g) => g.from === p && abuelos.includes(g.to!)).length }))
    .sort((a, b) => b.c - a.c);
  const nuncaAbuelo = aAbuelos.filter((x) => x.c === 0 && !abuelos.includes(x.p)).map((x) => x.p);
  const topAbuelo = aAbuelos[0];
  const yearMissing = [...yearInfo].sort((a, b) => b.missingGivers.length - a.missingGivers.length)[0];
  const conHuecos = participantes.filter((p) => persons[p].gave.some((g) => !g.to));
  const sinHuecos = participantes.filter((p) => persons[p].gave.every((g) => g.to));

  const records: Record_[] = [];
  records.push({
    id: "mas-regalado", icon: "gift",
    titulo: `${lista(topR.map(n))}, ${topR.length > 1 ? "los más regalados" : "el más regalado"}`,
    valor: `${maxR}`,
    texto: `${maxR} regalos conocidos recibidos${topR.length > 1 ? " cada uno" : ""}. Si el amigo invisible fuera un concurso de popularidad, ya sabemos a quién votar.`,
  });
  if (repeats.length) {
    records.push({
      id: "repetidos", icon: "repeat",
      titulo: "Déjà vu navideño",
      valor: `${repeats.length}`,
      texto: `Casos en que alguien regaló a la misma persona en años distintos: ${lista(repeats.map((r) => `${n(r.from)} → ${n(r.to)} (${r.years.join(" y ")})`))}. El azar también tiene manías.`,
    });
  }
  if (consecutive.length) {
    records.push({
      id: "rachas", icon: "streak",
      titulo: "Rachas seguidas",
      valor: `${consecutive.length}`,
      texto: `Mismo receptor en años consecutivos: ${lista(consecutive.map((r) => `${n(r.from)} → ${n(r.to)} (${r.years.join("–")})`))}. Si te toca dos veces, ya sabes sus gustos.`,
    });
  }
  if (everyYear.length) {
    records.push({
      id: "todos-los-anos", icon: "star",
      titulo: "Con regalo todos los años",
      valor: `${everyYear.length}`,
      texto: `${lista(everyYear.map(n))} ${everyYear.length > 1 ? "han tenido" : "ha tenido"} un regalo conocido en cada sorteo. Cero años de carbón.`,
    });
  }
  if (lowR.length && minR < maxR) {
    records.push({
      id: "menos-regalado", icon: "ghost",
      titulo: `Menos regalos conocidos: ${lista(lowR.map(n))}`,
      valor: `${minR}`,
      texto: `Con ${minR} regalo${minR === 1 ? "" : "s"} registrado${minR === 1 ? "" : "s"}. Ojo: puede que el regalo llegara y el dato no. Lo investigamos en el Acto 7.`,
    });
  }
  records.push({
    id: "combinaciones", icon: "puzzle",
    titulo: "Combinaciones estrenadas",
    valor: `${estrenadas}/${posiblesParejas}`,
    texto: `De ${posiblesParejas} posibles “quién regala a quién” (sin uno mismo ni pareja), ya hemos visto ${estrenadas}. Aún quedan ${posiblesParejas - estrenadas} por descubrir.`,
  });
  if (nuncaAbuelo.length) {
    records.push({
      id: "abuelos", icon: "elder",
      titulo: "Con los abuelos, ni mu",
      valor: `${nuncaAbuelo.length}`,
      texto: `${lista(nuncaAbuelo.map(n))} todavía no ${nuncaAbuelo.length > 1 ? "han" : "ha"} regalado a Carmen ni a Pepe en los sorteos conocidos. Los abuelos esperan con paciencia (y con turrón).`,
    });
  } else if (topAbuelo) {
    records.push({ id: "abuelos", icon: "elder", titulo: "Fans de los abuelos", valor: `${topAbuelo.c}`, texto: `${n(topAbuelo.p)} es quien más ha regalado a los abuelos.` });
  }
  records.push({
    id: "entre-ramas", icon: "heart",
    titulo: "Cero regalos dentro de la propia rama",
    valor: `${dentroRama}`,
    texto: dentroRama === 0 ? "Todos los regalos cruzan fronteras familiares: nadie se ha regalado a sí mismo ni a su pareja. Las normas se cumplen, aquí hay disciplina." : `${dentroRama} regalos se quedaron en casa.`,
  });
  if (sinHuecos.length) {
    records.push({
      id: "constancia", icon: "check",
      titulo: "Historial impecable",
      valor: `${sinHuecos.length}`,
      texto: `${lista(sinHuecos.map(n))} ${sinHuecos.length > 1 ? "tienen" : "tiene"} registrados todos sus regalos. Notarios de la Navidad.`,
    });
  }

  return {
    years, participantes, gifts, yearInfo, persons, matrix, dentroRama, records,
    totals: {
      sorteos: years.length,
      registrados: known.length,
      posibles: gifts.length,
      perdidos: gifts.length - known.length,
      participantes: participantes.length,
      adultos: personas.filter((p) => p.rol === "adulto").length,
      ninos: personas.filter((p) => p.rol === "niño").length,
      familiares: personas.length,
    },
    peorAno: yearMissing.year,
    conHuecos,
  };
}
export type Stats = ReturnType<typeof computeStats>;
