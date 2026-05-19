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
    <section className="productos-similares">
      <ProductList
        titulo="Zapatillas similares"
        descripcion="Relacionadas por marca, rango de precio, categoria y afinidad general del modelo."
        productos={productos}
        cantidadPrioritaria={2}
      />
    </section>
  );
}
