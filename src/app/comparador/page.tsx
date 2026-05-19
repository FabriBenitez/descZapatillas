import type { Metadata } from "next";

import { ComparadorResultados } from "@/components/ComparadorResultados";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
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
  const [{ q }, productos] = await Promise.all([
    searchParams,
    obtenerProductos(),
  ]);

  return (
    <>
      <Header />
      <main className="pagina flex-1">
        <section className="bg-[#111713] py-8 text-white">
          <div className="contenedor">
            <p className="text-sm font-black uppercase text-white/55">
              Busqueda dedicada
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-none sm:text-6xl">
              Resultados enfocados para comparar mejor.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62 sm:text-base">
              Una vista limpia para buscar, filtrar, ordenar y decidir rapido
              que oferta conviene abrir.
            </p>
          </div>
        </section>
        <ComparadorResultados productos={productos} busquedaInicial={q ?? ""} />
      </main>
      <Footer />
    </>
  );
}
