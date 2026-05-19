import { ProductCard } from "@/components/ProductCard";
import type { Producto } from "@/types/producto";

interface ProductListProps {
  titulo?: string;
  descripcion?: string;
  productos: Producto[];
  mensajeVacio?: string;
  cantidadPrioritaria?: number;
  vista?: "grid" | "lista";
  cargando?: boolean;
}

function SkeletonGrid({ vista = "grid" }: { vista?: "grid" | "lista" }) {
  return (
    <div
      className={
        vista === "lista"
          ? "grid gap-3"
          : "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      }
    >
      {Array.from({ length: vista === "lista" ? 4 : 6 }).map((_, indice) => (
        <div
          key={indice}
          className={`overflow-hidden rounded-[18px] border border-[var(--color-linea)] bg-white ${
            vista === "lista" ? "grid sm:grid-cols-[220px_minmax(0,1fr)]" : ""
          }`}
        >
          <div className={`skeleton ${vista === "lista" ? "h-52 sm:h-auto" : "aspect-[1.08/1]"}`} />
          <div className="space-y-3 p-5">
            <div className="skeleton h-4 w-20 rounded-full" />
            <div className="skeleton h-6 w-4/5 rounded-md" />
            <div className="skeleton h-8 w-2/3 rounded-md" />
            <div className="grid grid-cols-2 gap-2">
              <div className="skeleton h-14 rounded-[12px]" />
              <div className="skeleton h-14 rounded-[12px]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductList({
  titulo,
  descripcion,
  productos,
  mensajeVacio = "No encontramos productos para esa combinacion de busqueda y filtros.",
  cantidadPrioritaria = 0,
  vista = "grid",
  cargando = false,
}: ProductListProps) {
  return (
    <section className="lista-productos flex flex-col gap-5">
      {titulo || descripcion ? (
        <div className="seccion-cabecera">
          {titulo ? <h2 className="titulo-seccion">{titulo}</h2> : null}
          {descripcion ? (
            <p className="max-w-2xl text-sm leading-6 text-[var(--color-muted)] sm:text-base">
              {descripcion}
            </p>
          ) : null}
        </div>
      ) : null}

      {cargando ? (
        <SkeletonGrid vista={vista} />
      ) : productos.length > 0 ? (
        <div
          className={
            vista === "lista"
              ? "grid gap-3"
              : "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          }
        >
          {productos.map((producto, indice) => (
            <ProductCard
              key={producto.id}
              producto={producto}
              prioridadImagen={indice < cantidadPrioritaria}
              vista={vista}
            />
          ))}
        </div>
      ) : (
        <article className="estado-vacio p-8 text-center">
          <p className="text-lg font-black text-[var(--color-tinta)]">
            Sin resultados por ahora
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-muted)]">
            {mensajeVacio}
          </p>
        </article>
      )}
    </section>
  );
}
