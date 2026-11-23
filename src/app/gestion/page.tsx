import type { Metadata } from "next";
import { Gestion } from "@/components/Gestion";

export const metadata: Metadata = {
  title: "Gestión · Amigo Invisible Martinez Flores",
  robots: { index: false, follow: false, nocache: true },
};

export default function Page() {
  return <Gestion />;
}
