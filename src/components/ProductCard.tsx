import Image from "next/image";
import Link from "next/link";

import {
  calcularAhorro,
  formatearFecha,
  formatearPorcentaje,
  formatearPrecio,
} from "@/lib/formato";
import type { Producto } from "@/types/producto";

interface ProductCardProps {
  producto: Producto;
  prioridadImagen?: boolean;
  vista?: "grid" | "lista";
}

export function ProductCard({
  producto,
  prioridadImagen = false,
  vista = "grid",
}: ProductCardProps) {
  const esLista = vista === "lista";

  return (
    <article
      className={`tarjeta-producto group overflow-hidden border border-[var(--color-linea)] bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-linea-fuerte)] hover:shadow-[var(--sombra-media)] ${
        esLista
          ? "grid rounded-[18px] sm:grid-cols-[220px_minmax(0,1fr)]"
          : "flex h-full flex-col rounded-[18px]"
      }`}
    >
      <Link
        href={`/producto/${producto.id}`}
        className={`relative block overflow-hidden bg-[#edf0e9] ${
          esLista ? "aspect-[4/3] sm:aspect-auto" : "aspect-[1.08/1]"
        }`}
      >
        <Image
          src={producto.imageUrl}
          alt={producto.name}
          fill
          priority={prioridadImagen}
          sizes={
            esLista
              ? "(max-width: 640px) 100vw, 220px"
              : "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          }
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-[12px] bg-[var(--color-alerta)] px-3 py-2 text-lg font-black text-white shadow-lg">
          -{formatearPorcentaje(producto.discount)}
        </span>
        {producto.freeShipping ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/92 px-3 py-1.5 text-xs font-black text-[var(--color-tinta)] shadow-sm">
            Envio gratis
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-[var(--color-muted)]">
              {producto.brand}
            </p>
            <Link href={`/producto/${producto.id}`}>
              <h3 className="mt-1 line-clamp-2 text-lg font-black leading-tight text-[var(--color-tinta)] transition group-hover:text-[var(--color-acento-profundo)]">
                {producto.name}
              </h3>
            </Link>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[0.68rem] font-black ${
              producto.available
                ? "bg-[#eef8f2] text-[var(--color-acento-profundo)]"
                : "bg-[#fff0ee] text-[#b42318]"
            }`}
          >
            {producto.available ? "Stock" : "Sin stock"}
          </span>
        </div>

        <div className="mt-auto">
          <div className="flex items-end gap-2">
            <p className="text-[1.85rem] font-black leading-none text-[var(--color-tinta)]">
              {formatearPrecio(producto.price)}
            </p>
            <p className="text-sm font-bold text-[var(--color-muted)] line-through">
              {formatearPrecio(producto.listPrice)}
            </p>
          </div>
          <p className="mt-2 text-sm font-bold text-[var(--color-acento-profundo)]">
            Ahorras {formatearPrecio(calcularAhorro(producto))}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-[12px] bg-[#f5f6f1] px-3 py-2">
            <p className="text-xs font-bold text-[var(--color-muted)]">Tienda</p>
            <p className="mt-0.5 truncate font-black text-[var(--color-tinta)]">
              {producto.storeName}
            </p>
          </div>
          <div className="rounded-[12px] bg-[#f5f6f1] px-3 py-2">
            <p className="text-xs font-bold text-[var(--color-muted)]">Talle</p>
            <p className="mt-0.5 font-black text-[var(--color-tinta)]">
              {producto.size ?? "Consultar"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--color-linea)] pt-4">
          <p className="text-xs font-semibold text-[var(--color-muted)]">
            {producto.province} · {formatearFecha(producto.updatedAt)}
          </p>
          <Link
            href={`/producto/${producto.id}`}
            className="rounded-[12px] bg-[var(--color-tinta)] px-4 py-2 text-sm font-black text-white transition hover:bg-[#222821]"
          >
            Ver
          </Link>
        </div>
      </div>
    </article>
  );
}
