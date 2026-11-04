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
  esMejorOferta?: boolean;
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
  esMejorOferta = false,
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
      } ${esMejorOferta ? "ring-3 sm:ring-4 ring-[#FF4500] ring-offset-1 sm:ring-offset-2" : ""}`}
    >
      {esMejorOferta && (
        <div className="absolute top-0 left-0 right-0 bg-[#FF4500] text-white text-[9px] sm:text-xs font-black uppercase tracking-widest text-center py-0.5 sm:py-1 z-20 border-b-2 border-[#111]">
          ¡Mejor Descuento!
        </div>
      )}
      <div
        className={`relative block overflow-hidden ${colorFondoMarca} border-b-2 border-[#111] ${
          esMejorOferta && !esLista ? "mt-5 sm:mt-7" : ""
        } ${
          esLista
            ? "aspect-[4/3] sm:aspect-auto sm:border-b-0 sm:border-r-2"
            : "aspect-square"
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
        <span className={`absolute left-2 top-2 rounded-[4px] px-2 py-1 text-[11px] font-black sm:left-4 sm:top-4 sm:px-3.5 sm:py-2 sm:text-base transition-transform group-hover:scale-105 ${badgeClase}`}>
          -{formatearPorcentaje(producto.discount)}
        </span>
        {producto.freeShipping ? (
          <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 rounded-[4px] bg-white border border-[#111] sm:border-2 px-2 py-0.5 sm:px-3 sm:py-1.5 text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-[#111] shadow-[1px_1px_0px_#111] sm:shadow-[2px_2px_0px_#111] inline-flex">
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
            className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white text-[#111] p-1.5 sm:p-2 rounded border border-[#111] sm:border-2 shadow-[1px_1px_0px_#111] sm:shadow-[2px_2px_0px_#111] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#111] hover:bg-[#FF4500] hover:text-white transition-all z-10 cursor-pointer"
            title="Ir a la tienda"
            aria-label="Ir a la tienda"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:gap-2 sm:p-5">
        {/* Cabecera: Marca + Tienda (en mobile) / Stock (en desktop) */}
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#111] bg-[#fbbf24] border sm:border-2 border-[#111] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-[4px] truncate shadow-[1px_1px_0px_#111]">
            {producto.brand}
          </span>

          {/* En mobile mostramos la tienda arriba para dejar el 100% del pie a los talles */}
          <span className="sm:hidden text-[9px] font-black uppercase tracking-wider text-[#111]/80 bg-[#f0f3f1] border border-[#111] px-1.5 py-0.5 rounded-[4px] truncate max-w-[55%]">
            {producto.storeName}
          </span>

          <span
            className={`hidden sm:inline-block shrink-0 rounded-[4px] px-2 py-1 text-[9px] font-black uppercase tracking-widest border-2 border-[#111] shadow-[2px_2px_0px_#111] ${
              producto.available
                ? "bg-[#10b981] text-white"
                : "bg-[#f43f5e] text-white"
            }`}
          >
            {producto.available ? "Stock" : "Sin"}
          </span>
        </div>

        <h3 className="line-clamp-2 text-xs sm:text-sm font-black font-titulos leading-snug text-[#111] transition duration-200 group-hover:text-[#FF4500] uppercase tracking-tighter">
          {producto.name}
        </h3>

        <div className="mt-auto pt-2 sm:pt-3 border-t-2 border-[#111]/10">
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <p className="text-lg sm:text-3xl font-black font-mono leading-none tracking-tighter text-[#111]">
              {formatearPrecio(producto.price)}
            </p>
            <p className="text-[10px] sm:text-xs font-bold font-mono text-black/45 line-through shrink-0">
              {formatearPrecio(producto.listPrice)}
            </p>
          </div>
          <span className={`inline-flex rounded-[4px] px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-black mt-1 sm:mt-2 border sm:border-2 border-[#111] shadow-[1px_1px_0px_#111] sm:shadow-[2px_2px_0px_#111] ${
            esSuperAhorro
              ? "bg-[#FF4500] text-white"
              : "bg-[#FEF2F2] text-[#FF4500]"
          }`}>
            Ahorrás {formatearPrecio(calcularAhorro(producto))}
          </span>
        </div>

        {/* Pie Mobile: fila de talles a ancho completo (entran hasta 5 talles legibles) */}
        <div className="sm:hidden pt-1.5 mt-1 border-t-2 border-[#111]/10">
          <div className="flex flex-col justify-center rounded-[4px] bg-[#EBF6FF] border border-[#111] px-2 py-1.5 shadow-[1px_1px_0px_#111]">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[8px] font-black text-black/60 uppercase tracking-widest leading-none">
                Talles disponibles
              </p>
              {producto.sizes && producto.sizes.length > 0 && (
                <span className="text-[8px] font-black text-[#111]/60 leading-none">
                  {producto.sizes.length} {producto.sizes.length === 1 ? "talle" : "talles"}
                </span>
              )}
            </div>
            {producto.sizes && producto.sizes.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {producto.sizes.slice(0, 5).map((t: string) => (
                  <span
                    key={t}
                    className="bg-white border border-[#111] rounded-[3px] px-1.5 py-0.5 text-[9px] font-black leading-none text-[#111]"
                  >
                    {t}
                  </span>
                ))}
                {producto.sizes.length > 5 && (
                  <span className="bg-[#111] text-white border border-[#111] rounded-[3px] px-1.5 py-0.5 text-[9px] font-black leading-none">
                    +{producto.sizes.length - 5}
                  </span>
                )}
              </div>
            ) : (
              <span className="bg-[#FEF08A] text-[#111] border border-[#111] rounded-[2px] px-1.5 py-0.5 text-[8px] font-black leading-none inline-block truncate">
                {producto.size ?? "Ver en tienda"}
              </span>
            )}
          </div>
        </div>

        {/* Pie Desktop: Logo Tienda + Talles lado a lado */}
        <div className="hidden sm:grid sm:grid-cols-[1fr_1.5fr] gap-2 text-[11px] pt-3 mt-3 border-t-2 border-[#111]/10">
          <div className="flex items-center justify-center rounded-[4px] bg-white border-2 border-[#111] p-2 shadow-[2px_2px_0px_#111] overflow-hidden min-w-0">
            <StoreLogo storeName={producto.storeName} />
          </div>
          <div className="flex flex-col justify-center rounded-[4px] bg-[#EBF6FF] border-2 border-[#111] px-2 py-1 shadow-[2px_2px_0px_#111] overflow-hidden">
            <p className="text-[8px] font-black text-black/50 uppercase tracking-widest mb-0.5 shrink-0">Talles</p>
            {producto.sizes && producto.sizes.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {producto.sizes.slice(0, 4).map((t: string) => (
                  <span key={t} className="bg-white border border-[#111] rounded-[2px] px-1 py-0.5 text-[9px] font-black leading-none">{t}</span>
                ))}
                {producto.sizes.length > 4 && (
                  <span className="bg-[#111] text-white border border-[#111] rounded-[2px] px-1 py-0.5 text-[9px] font-black leading-none">+{producto.sizes.length - 4}</span>
                )}
              </div>
            ) : (
              <span className="bg-[#FEF08A] text-[#111] border border-[#111] rounded-[2px] px-1.5 py-0.5 text-[8px] font-black leading-none inline-block truncate max-w-full">
                {producto.size ?? "Ver en tienda"}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
