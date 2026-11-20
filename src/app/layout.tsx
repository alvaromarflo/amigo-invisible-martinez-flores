import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display", axes: ["SOFT", "opsz"], style: ["normal", "italic"] });
const body = DM_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Amigo Invisible Martinez Flores · Wrapped 2022–2025",
  description: "El Spotify Wrapped del amigo invisible de la familia Martinez Flores: rotaciones, récords y misterios navideños.",
  openGraph: { title: "Amigo Invisible Martinez Flores · Wrapped", description: "Descubre las tendencias de regalos de la familia, desde Córdoba.", locale: "es_ES", type: "website" },
};
export const viewport: Viewport = { themeColor: "#14060a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
