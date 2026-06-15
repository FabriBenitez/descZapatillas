import Link from "next/link";

import { ProductImage } from "@/components/ProductImage";
import {
  calcularAhorro,
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
  const esSuperAhorro = producto.discount >= 50;
  const descuentoVal = producto.discount;

  // Determinar color de badge de descuento según el nivel
  let badgeClase = "bg-gradient-to-br from-[#10b981] to-[#047857] text-white shadow-lg shadow-[#10b981]/20";
  if (descuentoVal >= 50) {
    badgeClase = "bg-gradient-to-br from-[#d4af37] to-[#b45309] text-white shadow-lg shadow-[#d4af37]/30 border border-[#d4af37]/20";
  } else if (descuentoVal >= 30) {
    badgeClase = "bg-gradient-to-br from-[#f43f5e] to-[#be123c] text-white shadow-lg shadow-[#f43f5e]/20";
  }

  // Si es un producto "fresco" (recien scrapeado y no guardado), pasamos su data por URL
  const hrefProducto = producto.isFresh 
    ? `/producto/${producto.id}?f=${encodeURIComponent(JSON.stringify(producto))}`
    : `/producto/${producto.id}`;

  return (
    <Link
      href={hrefProducto}
      className={`tarjeta-producto group relative overflow-hidden border border-[#e2e7e4] bg-white transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(15,19,17,0.06)] hover:border-[#c2cbc5] ${
        esLista
          ? "grid rounded-[20px] sm:grid-cols-[240px_minmax(0,1fr)] sm:rounded-[24px]"
          : "flex h-full flex-col rounded-[20px] sm:rounded-[24px]"
      }`}
    >
      <div
        className={`relative block overflow-hidden bg-[#f0f3f1] ${
          esLista
            ? "aspect-[4/3] sm:aspect-auto rounded-t-[20px] sm:rounded-l-[24px] sm:rounded-tr-none"
            : "aspect-[4/3] sm:aspect-square rounded-t-[20px] sm:rounded-t-[24px]"
        }`}
      >
        <ProductImage
          src={producto.imageUrl}
          alt={producto.name}
          priority={prioridadImagen}
          sizes={
            esLista
              ? "(max-width: 640px) 100vw, 240px"
              : "(max-width: 640px) 50vw, (max-width: 1280px) 50vw, 33vw"
          }
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-106 efecteo-imagen-hover"
        />
        <span className={`absolute left-3 top-3 rounded-[12px] px-3 py-1.5 text-xs font-black sm:left-4 sm:top-4 sm:rounded-[14px] sm:px-3.5 sm:py-2 sm:text-base ${badgeClase}`}>
          -{formatearPorcentaje(producto.discount)}
        </span>
        {producto.freeShipping ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/90 border border-white/20 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0f1311] shadow-sm sm:inline-flex">
            Envío gratis
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:gap-2.5 sm:p-4">
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0">
            <p className="text-[9px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-[#10b981] to-[#047857] bg-clip-text text-transparent sm:block">
              {producto.brand}
            </p>
            <h3 className="mt-0.5 line-clamp-2 text-xs font-bold font-titulos leading-snug text-[#0f1311] transition duration-200 group-hover:text-[#10b981] sm:text-sm">
              {producto.name}
            </h3>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
              producto.available
                ? "bg-[#10b981]/8 text-[#047857]"
                : "bg-[#f43f5e]/8 text-[#be123c]"
            }`}
          >
            {producto.available ? "En stock" : "Sin stock"}
          </span>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-1.5">
            <p className="text-lg font-black font-titulos leading-none tracking-tight text-[#0f1311] sm:text-xl">
              {formatearPrecio(producto.price)}
            </p>
            <p className="text-[10px] font-bold text-black/40 line-through">
              {formatearPrecio(producto.listPrice)}
            </p>
          </div>
          <span className={`inline-flex rounded-[8px] px-2 py-0.5 text-[10px] font-extrabold mt-1 ${
            esSuperAhorro
              ? "bg-[#d4af37]/10 text-[#b45309]"
              : "bg-[#10b981]/10 text-[#047857]"
          }`}>
            Ahorras {formatearPrecio(calcularAhorro(producto))}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <div className="rounded-[10px] bg-[#f0f3f1] border border-[#e2e7e4]/40 px-2.5 py-1.5">
            <p className="text-[9px] font-bold text-black/40 uppercase">Tienda</p>
            <p className="mt-0.5 truncate font-extrabold text-[#0f1311]">
              {producto.storeName}
            </p>
          </div>
          <div className="rounded-[10px] bg-[#f0f3f1] border border-[#e2e7e4]/40 px-2.5 py-1.5">
            <p className="text-[9px] font-bold text-black/40 uppercase">Talle</p>
            <p className="mt-0.5 font-extrabold text-[#0f1311]">
              {producto.size ?? "Consultar"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
