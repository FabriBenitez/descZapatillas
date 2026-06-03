import type { Metadata } from "next";

export const maxDuration = 60; // Permitir hasta 60 segundos en Vercel para búsquedas profundas

import { ComparadorHeader } from "@/components/ComparadorHeader";
import { ComparadorResultados } from "@/components/ComparadorResultados";
import { Footer } from "@/components/Footer";
import { obtenerProductos } from "@/lib/productos";

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
