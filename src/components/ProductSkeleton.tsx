// Skeleton animado para una tarjeta de producto
export function ProductCardSkeleton() {
  return (
    <article className="flex h-full flex-col rounded-[20px] sm:rounded-[24px] overflow-hidden border border-[#e2e7e4] bg-white">
      {/* Imagen */}
      <div className="aspect-[4/3] sm:aspect-square bg-[#f0f3f1] relative overflow-hidden">
        <div className="absolute inset-0 skeleton-shine" />
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-2.5 p-2.5 sm:p-4">
        {/* Marca */}
        <div className="h-3 w-16 rounded-full bg-[#e8edea] relative overflow-hidden">
          <div className="absolute inset-0 skeleton-shine" />
        </div>

        {/* Nombre */}
        <div className="space-y-1.5">
          <div className="h-4 w-full rounded-full bg-[#e8edea] relative overflow-hidden">
            <div className="absolute inset-0 skeleton-shine" />
          </div>
          <div className="h-4 w-3/4 rounded-full bg-[#e8edea] relative overflow-hidden">
            <div className="absolute inset-0 skeleton-shine" />
          </div>
        </div>

        {/* Precios */}
        <div className="mt-auto space-y-1.5">
          <div className="h-3 w-20 rounded-full bg-[#e8edea] relative overflow-hidden">
            <div className="absolute inset-0 skeleton-shine" />
          </div>
          <div className="h-6 w-32 rounded-full bg-[#e8edea] relative overflow-hidden">
            <div className="absolute inset-0 skeleton-shine" />
          </div>
        </div>

        {/* Botón */}
        <div className="h-10 w-full rounded-[14px] bg-[#e8edea] relative overflow-hidden">
          <div className="absolute inset-0 skeleton-shine" />
        </div>
      </div>
    </article>
  );
}

// Grid de skeletons que imita el layout real
export function ProductListSkeleton({ cantidad = 9 }: { cantidad?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: cantidad }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
