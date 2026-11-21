import { computeStats } from "@/lib/stats";
import { WrappedProvider } from "@/components/Wrapped";
import { FloatingCta } from "@/components/Cta";
import { Snow } from "@/components/Snow";
import { Chrome, Cover, Familia, Numeros, Rotacion, Records, Cruces, Misterio, Teaser } from "@/components/Acts";

export default function Page() {
  const stats = computeStats();
  return (
    <WrappedProvider stats={stats}>
      <>
        <a className="skip" href="#familia">Saltar a la familia</a>
        <Snow />
        <Chrome />
        <FloatingCta />
        <main>
          <Cover />
          <Familia />
          <Numeros />
          <Rotacion />
          <Records />
          <Cruces />
          <Misterio />
          <Teaser />
        </main>
      </>
    </WrappedProvider>
  );
}
