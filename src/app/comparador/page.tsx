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

  const productosBase = await obtenerProductos();
  let productosFinales = [...productosBase];

  // Si hay término de búsqueda (min 3 caracteres), raspamos en tiempo real y los unimos en memoria
  if (busquedaInicial.trim().length >= 3) {
    try {
      const productosFrescos = await buscarProductosEnTiendasEnTiempoReal(busquedaInicial);
      if (productosFrescos.length > 0) {
        // Unimos los productos frescos con la base (sobrescribiendo duplicados)
        const mapa = new Map(productosBase.map((p) => [p.id, p]));
        productosFrescos.forEach((p) => mapa.set(p.id, p));
        productosFinales = Array.from(mapa.values());
      }
    } catch (err) {
      console.error("Error en búsqueda en tiempo real:", err);
    }
  }

  return (
    <>
      <ComparadorHeader busquedaInicial={busquedaInicial} />
      <main className="pagina flex-1">
        <ComparadorResultados
          key={busquedaInicial}
          productos={productosFinales}
          busquedaInicial={busquedaInicial}
        />
      </main>
      <Footer />
    </>
  );
}
