import type { Metadata } from "next";

import { ComparadorHeader } from "@/components/ComparadorHeader";
import { ComparadorResultados } from "@/components/ComparadorResultados";
import { Footer } from "@/components/Footer";
import { buscarProductosEnTiendasEnTiempoReal, obtenerProductos } from "@/lib/productos";

interface ComparadorPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Comparador de ofertas",
  description:
    "Busca y filtra zapatillas en oferta por marca, tienda, precio, descuento, talle, categoria y stock.",
  alternates: {
    canonical: "/comparador",
  },
};

export default async function ComparadorPage({
  searchParams,
}: ComparadorPageProps) {
  const { q } = await searchParams;
  const busquedaInicial = q ?? "";

  // Si hay término de búsqueda (min 3 caracteres), raspamos en tiempo real para encontrar todo
  if (busquedaInicial.trim().length >= 3) {
    try {
      await buscarProductosEnTiendasEnTiempoReal(busquedaInicial);
    } catch (err) {
      console.error("Error en búsqueda en tiempo real:", err);
    }
  }

  const productos = await obtenerProductos();

  return (
    <>
      <ComparadorHeader busquedaInicial={busquedaInicial} />
      <main className="pagina flex-1">
        <ComparadorResultados
          key={busquedaInicial}
          productos={productos}
          busquedaInicial={busquedaInicial}
        />
      </main>
      <Footer />
    </>
  );
}
