import type { Metadata } from "next";
import { Suspense } from "react";

export const revalidate = 3600; // Cachear estáticamente en CDN por 1 hora (evita Fluid Active CPU en cada visita)

import { ComparadorHeader } from "@/components/ComparadorHeader";
import { ComparadorResultados } from "@/components/ComparadorResultados";
import { Footer } from "@/components/Footer";
import { obtenerProductosSinHistorial } from "@/lib/productos";
import { ProductListSkeleton } from "@/components/ProductSkeleton";

export const metadata: Metadata = {
  title: "Comparador de ofertas",
  description:
    "Busca y filtra zapatillas en oferta por marca, tienda, precio, descuento, talle, categoria y stock.",
  alternates: {
    canonical: "/comparador",
  },
};

// Componente async separado: permite que Next.js haga streaming y cachee en CDN
async function ComparadorConDatos() {
  const productosLimpios = await obtenerProductosSinHistorial();

  return <ComparadorResultados productos={productosLimpios} />;
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

export default function ComparadorPage() {
  return (
    <>
      <Suspense fallback={null}>
        <ComparadorHeader />
      </Suspense>

      <main className="pagina flex-1">
        <Suspense fallback={<ComparadorSkeleton />}>
          <ComparadorConDatos />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}
