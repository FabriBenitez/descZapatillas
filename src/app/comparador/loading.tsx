import { ProductListSkeleton } from "@/components/ProductSkeleton";

// Este archivo es manejado automáticamente por Next.js.
// Se muestra INSTANTÁNEAMENTE mientras /comparador carga los datos del servidor.
export default function Loading() {
  return (
    <section className="comparador py-4 sm:py-10">
      <div className="contenedor grid gap-4 sm:gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">

        {/* Skeleton del panel de filtros (desktop) */}
        <div className="hidden lg:block">
          <div className="panel-premium p-5 rounded-[24px] space-y-5">
            {/* Título filtros */}
            <div className="h-4 w-24 rounded-full bg-[#e8edea] relative overflow-hidden">
              <div className="absolute inset-0 skeleton-shine" />
            </div>
            {/* Grupos de filtro */}
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

        {/* Contenido principal */}
        <div className="space-y-4 sm:space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <div className="h-9 w-64 rounded-full bg-[#e8edea] relative overflow-hidden">
              <div className="absolute inset-0 skeleton-shine" />
            </div>
          </div>

          {/* Grid de tarjetas skeleton */}
          <ProductListSkeleton cantidad={9} />
        </div>

      </div>
    </section>
  );
}
