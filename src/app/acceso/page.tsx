import type { Metadata } from "next";
import { Poinsettia, Pandereta, Garland } from "@/components/Art";

export const metadata: Metadata = { title: "Acceso · Amigo Invisible Martinez Flores", robots: { index: false, follow: false } };

export default async function Acceso({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="gate">
      <Garland className="garland gate-garland" />
      <Poinsettia className="art gate-a" />
      <Pandereta className="art gate-b" />
      <form method="post" action="/api/acceso" className="gate-card">
        <p className="eyebrow">Familia Martinez Flores</p>
        <h1>Amigo <span className="gold">Invisible</span></h1>
        <p className="muted">Esta Navidad es solo para la familia. Introduce la contraseña para entrar.</p>
        <label htmlFor="password" className="sr-only">Contraseña</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" placeholder="Contraseña" autoFocus />
        <button type="submit">Entrar 🎁</button>
        {error && (
          <p role="alert" className="gate-error">
            {error === "espera" ? "Demasiados intentos. Prueba de nuevo en unos minutos." : "Contraseña incorrecta. ¡Pregunta a Papá Noel!"}
          </p>
        )}
      </form>
    </main>
  );
}
