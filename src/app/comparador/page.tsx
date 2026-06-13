import type { Metadata } from "next";
import { Suspense } from "react";

export const maxDuration = 60;

import { ComparadorHeader } from "@/components/ComparadorHeader";
import { ComparadorResultados } from "@/components/ComparadorResultados";
import { Footer } from "@/components/Footer";
import { obtenerProductos } from "@/lib/productos";
import { ProductListSkeleton } from "@/components/ProductSkeleton";

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

// Componente async separado: permite que Next.js haga streaming
async function ComparadorConDatos({ busquedaInicial }: { busquedaInicial: string }) {
  const productosCrudos = await obtenerProductos();
  
  // Limpiamos datos pesados (historial) para evitar el límite de 4.5MB de Vercel Serverless Functions
  // al momento de serializar las props hacia el Client Component.
  const productosLimpios = productosCrudos.map((p) => {
    const { priceHistory, productUrl, ...resto } = p;
    return resto as Producto;
  });

  return (
    <ComparadorResultados
      key={busquedaInicial}
      productos={productosLimpios}
      busquedaInicial={busquedaInicial}
    />
  );
}

// Skeleton de fallback mientras cargan los datos
function ComparadorSkeleton() {
  return (
    <div className="comparador py-4 sm:py-10">
      <div className="contenedor grid gap-4 sm:gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Skeleton filtros */}
        <div className="hidden lg:block">
          <div className="panel-premium p-5 rounded-[24px] space-y-5">
            <div className="h-4 w-24 rounded-full bg-[#e8edea] relative overflow-hidden">
              <div className="absolute inset-0 skeleton-shine" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-t border-[#e2e7e4] pt-4 space-y-3">
                <div className="h-4 w-32 rounded-full bg-[#e8edea] relative overflow-hidden">
                  <div className="absolute inset-0 skeleton-shine" />
                </div>
                <div className="h-10 w-full rounded-[12px] bg-[#e8edea] relative overflow-hidden">
                  <div className="absolute inset-0 skeleton-shine" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Skeleton grilla de productos */}
        <div className="space-y-4 sm:space-y-6">
          <div className="h-9 w-64 rounded-full bg-[#e8edea] relative overflow-hidden">
            <div className="absolute inset-0 skeleton-shine" />
          </div>
          <ProductListSkeleton cantidad={9} />
        </div>
      </div>
    </div>
  );
}

export default async function ComparadorPage({
  searchParams,
}: ComparadorPageProps) {
  const { q } = await searchParams;
  const busquedaInicial = q ?? "";

  return (
    <>
      {/* El header carga INSTANTÁNEAMENTE, no espera a los productos */}
      <ComparadorHeader busquedaInicial={busquedaInicial} />

      <main className="pagina flex-1">
        {/*
          Suspense hace que Next.js envíe el HTML del skeleton al navegador
          en el primer milisegundo. Cuando obtenerProductos() termina en el
          servidor, Next.js reemplaza el skeleton con el contenido real
          sin que el navegador haga ningún pedido extra (todo pasa en la
          misma conexión HTTP - esto se llama "streaming SSR").
        */}
        <Suspense fallback={<ComparadorSkeleton />}>
          <ComparadorConDatos busquedaInicial={busquedaInicial} />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}
