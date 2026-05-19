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
      className={`tarjeta-producto group overflow-hidden border border-transparent bg-transparent shadow-none transition duration-200 hover:-translate-y-0.5 sm:border-[var(--color-linea)] sm:bg-white sm:shadow-sm sm:hover:border-[var(--color-linea-fuerte)] sm:hover:shadow-[var(--sombra-media)] ${
        esLista
          ? "grid rounded-[16px] sm:grid-cols-[220px_minmax(0,1fr)] sm:rounded-[18px]"
          : "flex h-full flex-col rounded-[16px] sm:rounded-[18px]"
      }`}
    >
      <Link
        href={`/producto/${producto.id}`}
        className={`relative block overflow-hidden rounded-[16px] bg-[#edf0e9] sm:rounded-none ${
          esLista ? "aspect-[4/3] sm:aspect-auto" : "aspect-square sm:aspect-[1.08/1]"
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
              : "(max-width: 640px) 50vw, (max-width: 1280px) 50vw, 33vw"
          }
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 rounded-[9px] bg-[var(--color-alerta)] px-2 py-1 text-xs font-black text-white shadow-lg sm:left-3 sm:top-3 sm:rounded-[12px] sm:px-3 sm:py-2 sm:text-lg">
          -{formatearPorcentaje(producto.discount)}
        </span>
        {producto.freeShipping ? (
          <span className="absolute bottom-3 left-3 hidden rounded-full bg-white/92 px-3 py-1.5 text-xs font-black text-[var(--color-tinta)] shadow-sm sm:inline-flex">
            Envio gratis
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-2 pt-2 sm:gap-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-[var(--color-muted)]">
              <span className="sm:hidden">{producto.storeName}</span>
              <span className="hidden sm:inline">{producto.brand}</span>
            </p>
            <Link href={`/producto/${producto.id}`}>
              <h3 className="mt-1 line-clamp-2 text-[0.72rem] font-black uppercase leading-[1.15] tracking-[-0.01em] text-[var(--color-tinta)] transition group-hover:text-[var(--color-acento-profundo)] sm:text-lg sm:normal-case sm:leading-tight">
                {producto.name}
              </h3>
            </Link>
          </div>
          <span
            className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[0.68rem] font-black sm:inline-flex ${
              producto.available
                ? "bg-[#eef8f2] text-[var(--color-acento-profundo)]"
                : "bg-[#fff0ee] text-[#b42318]"
            }`}
          >
            {producto.available ? "Stock" : "Sin stock"}
          </span>
        </div>

        <div className="mt-auto">
          <div className="flex flex-col items-start gap-0.5 sm:flex-row sm:items-end sm:gap-2">
            <p className="text-xl font-black leading-none tracking-[-0.03em] text-[var(--color-tinta)] sm:text-[1.85rem]">
              {formatearPrecio(producto.price)}
            </p>
            <p className="hidden text-sm font-bold text-[var(--color-muted)] line-through sm:block">
              {formatearPrecio(producto.listPrice)}
            </p>
          </div>
          <p className="mt-2 hidden text-sm font-bold text-[var(--color-acento-profundo)] sm:block">
            Ahorras {formatearPrecio(calcularAhorro(producto))}
          </p>
        </div>

        <div className="hidden grid-cols-2 gap-2 text-sm sm:grid">
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

        <div className="hidden items-center justify-between gap-3 border-t border-[var(--color-linea)] pt-4 sm:flex">
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
