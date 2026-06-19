import { ProductList } from "@/components/ProductList";
import type { Producto } from "@/types/producto";

interface SimilarProductsProps {
  productos: Producto[];
}

export function SimilarProducts({ productos }: SimilarProductsProps) {
  if (productos.length === 0) {
    return null;
  }

  return (
    <section className="productos-similares mt-4">
      <div className="mb-6">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-[#111]">Zapatillas similares</h2>
        <p className="text-xs font-bold leading-relaxed text-black/50 mt-1 uppercase tracking-wide">
          Relacionadas por marca, rango de precio, categoría y afinidad general del modelo.
        </p>
      </div>
      <ProductList
        productos={productos}
        cantidadPrioritaria={2}
      />
    </section>
  );
}
