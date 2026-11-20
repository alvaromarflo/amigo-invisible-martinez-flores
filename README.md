# Amigo invisible · Familia Martinez Flores

Landing tipo "Spotify Wrapped" con scroll parallax (Next.js App Router + TypeScript + Framer Motion, CSS plano). Estática y exportable. Todas las estadísticas se calculan en build desde `src/data/sorteos.json` (`src/lib/stats.ts`) y toleran huecos de datos.

## Cómo ejecutar

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build    # exporta el sitio estático a ./out
npx serve out    # previsualizar el export
```

- Actos: portada, familia, números, rotación (selector de año), récords, cruces entre ramas, misterio de datos perdidos y 2026. Al pulsar una foto se abre su "Tu Wrapped".
- Respeta `prefers-reduced-motion` (sin nieve ni parallax).
- Las fotos se referencian solo por la ruta de `familia.json`; para cambiar un recorte basta con reemplazar el `.webp`.
- `screenshots/` contiene capturas de cada acto (desktop y móvil).

## Recursos base

- `public/people/<id>.webp|jpg` – retratos cuadrados 800x800 centrados en la cara, mismo zoom (aplicar círculo con CSS). `mari-carmen-y-cesar` es el recorte de pareja.
- `contact-sheet.png` – hoja de contactos para verificar uniformidad.
- `src/data/familia.json` – personas, familias, apodos, roles (sin emails).
- `src/data/sorteos.json` – sorteos 2022–2025 (`null` = dato no disponible).
- `INFORME-DATOS.md` – validación y anomalías de los sorteos.
- `scripts/` – script de recorte (Pillow + OpenCV).
