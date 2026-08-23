import Link from "next/link";

import { ProductImage } from "@/components/ProductImage";
import { StoreLogo } from "@/components/StoreLogo";
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

function obtenerColorMarca(marca: string): string {
  const m = marca.toLowerCase();
  if (m.includes("nike")) return "bg-[#FFEBE5]"; // light red-orange
  if (m.includes("adidas")) return "bg-[#E6F0FA]"; // light blue
  if (m.includes("puma")) return "bg-[#E6FAF0]"; // light mint
  if (m.includes("under") || m.includes("armour")) return "bg-[#FCF6E5]"; // light cream/yellow
  if (m.includes("topper")) return "bg-[#FFF0F5]"; // light pink
  if (m.includes("reebok")) return "bg-[#F3E8FF]"; // light lavender
  if (m.includes("fila")) return "bg-[#ECFDF5]"; // light teal
  if (m.includes("converse")) return "bg-[#FEF2F2]"; // light red
  return "bg-[#F5F7F6]"; // default soft gray
}

export function ProductCard({
  producto,
  prioridadImagen = false,
  vista = "grid",
}: ProductCardProps) {
  const esLista = vista === "lista";
  const esSuperAhorro = producto.discount >= 50;

  const colorFondoMarca = obtenerColorMarca(producto.brand);

  let badgeClase = "bg-[#10b981] text-white border-2 border-[#111] shadow-[2px_2px_0px_#111]";
  if (esSuperAhorro) {
    badgeClase = "bg-[#FF4500] text-white border-2 border-[#111] shadow-[2px_2px_0px_#111]";
  }

  // Si es un producto "fresco" (recien scrapeado y no guardado), pasamos su data por URL
  const hrefProducto = producto.isFresh 
    ? `/producto/${producto.id}?f=${encodeURIComponent(JSON.stringify(producto))}`
    : `/producto/${producto.id}`;

  return (
    <Link
      href={hrefProducto}
      className={`tarjeta-producto group relative overflow-hidden border-2 border-[#111] bg-white transition-all duration-300 ease-out hover:-translate-y-1.5 hover:-translate-x-1.5 hover:shadow-[6px_6px_0px_#111] ${
        esLista
          ? "grid rounded-[8px] sm:grid-cols-[240px_minmax(0,1fr)]"
          : "flex h-full flex-col rounded-[8px]"
      }`}
    >
      <div
        className={`relative block overflow-hidden ${colorFondoMarca} border-b-2 border-[#111] ${
          esLista
            ? "aspect-[4/3] sm:aspect-auto sm:border-b-0 sm:border-r-2"
            : "aspect-[4/3] sm:aspect-square"
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
          className="object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <span className={`absolute left-3 top-3 rounded-[4px] px-3 py-1.5 text-xs font-black sm:left-4 sm:top-4 sm:px-3.5 sm:py-2 sm:text-base transition-transform group-hover:scale-105 ${badgeClase}`}>
          -{formatearPorcentaje(producto.discount)}
        </span>
        {producto.freeShipping ? (
          <span className="absolute bottom-3 left-3 rounded-[4px] bg-white border-2 border-[#111] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#111] shadow-[2px_2px_0px_#111] sm:inline-flex">
            Envío gratis
          </span>
        ) : null}
        
        {producto.productUrl && (
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(producto.productUrl, "_blank", "noopener,noreferrer");
            }}
            className="absolute top-3 right-3 bg-white text-[#111] p-1.5 sm:p-2 rounded border-2 border-[#111] shadow-[2px_2px_0px_#111] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#111] hover:bg-[#FF4500] hover:text-white transition-all z-10 cursor-pointer"
            title="Ir a la tienda"
            aria-label="Ir a la tienda"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-2 sm:gap-2 sm:p-5">
        <div className="flex items-start justify-between gap-1.5 sm:gap-3">
          <div className="min-w-0">
            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-[#111] bg-[#fbbf24] border sm:border-2 border-[#111] px-1 sm:px-2 py-0.5 sm:py-1 rounded-[4px] inline-block mb-1 sm:mb-2 max-w-full truncate shadow-[1px_1px_0px_#111]">
              {producto.brand}
            </p>
            <h3 className="line-clamp-2 text-[11px] sm:text-sm font-black font-titulos leading-snug text-[#111] transition duration-200 group-hover:text-[#FF4500] uppercase tracking-tighter">
              {producto.name}
            </h3>
          </div>
          <span
            className={`shrink-0 rounded-[4px] px-1 sm:px-2 py-0.5 sm:py-1 text-[7px] sm:text-[9px] font-black uppercase tracking-widest border sm:border-2 border-[#111] shadow-[1px_1px_0px_#111] sm:shadow-[2px_2px_0px_#111] ${
              producto.available
                ? "bg-[#10b981] text-white"
                : "bg-[#f43f5e] text-white"
            }`}
          >
            {producto.available ? "Stock" : "Sin"}
          </span>
        </div>

        <div className="mt-auto pt-2 sm:pt-3 border-t-2 border-[#111]/10">
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-baseline sm:gap-2">
            <p className="text-lg sm:text-2xl font-black font-mono leading-none tracking-tighter text-[#111]">
              {formatearPrecio(producto.price)}
            </p>
            <p className="text-[9px] sm:text-[11px] font-bold font-mono text-black/50 line-through shrink-0 mt-0.5 sm:mt-0">
              {formatearPrecio(producto.listPrice)}
            </p>
          </div>
          <span className={`inline-flex rounded-[4px] px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-black mt-1.5 sm:mt-2 border sm:border-2 border-[#111] shadow-[1px_1px_0px_#111] sm:shadow-[2px_2px_0px_#111] ${
            esSuperAhorro
              ? "bg-[#FF4500] text-white"
              : "bg-[#FEF2F2] text-[#FF4500]"
          }`}>
            Ahorras {formatearPrecio(calcularAhorro(producto))}
          </span>
        </div>

        <div className="grid grid-cols-[1fr_1.2fr] sm:grid-cols-[1fr_1.5fr] gap-1 sm:gap-2 text-[11px] pt-2 sm:pt-3 mt-2 sm:mt-3 border-t-2 border-[#111]/10">
          <div className="flex items-center justify-center rounded-[4px] bg-white border sm:border-2 border-[#111] p-1 sm:p-2 shadow-[1px_1px_0px_#111] sm:shadow-[2px_2px_0px_#111] overflow-hidden min-w-0">
            <StoreLogo storeName={producto.storeName} />
          </div>
          <div className="flex flex-col justify-center rounded-[4px] bg-[#EBF6FF] border sm:border-2 border-[#111] px-1.5 sm:px-3 py-0.5 sm:py-1 shadow-[1px_1px_0px_#111] sm:shadow-[2px_2px_0px_#111] overflow-hidden">
            <p className="text-[7px] sm:text-[8px] font-black text-black/50 uppercase tracking-widest mb-0.5 shrink-0">Talle</p>
            <p className="font-black text-[#111] text-[9px] sm:text-xs line-clamp-1 sm:line-clamp-2">
              {producto.size ?? "Consultar"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
