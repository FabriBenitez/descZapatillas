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
  if (m.includes("nike")) return "bg-[#FFEBE5]";
  if (m.includes("adidas")) return "bg-[#E6F0FA]";
  if (m.includes("puma")) return "bg-[#E6FAF0]";
  if (m.includes("under") || m.includes("armour")) return "bg-[#FCF6E5]";
  if (m.includes("topper")) return "bg-[#FFF0F5]";
  if (m.includes("reebok")) return "bg-[#F3E8FF]";
  if (m.includes("fila")) return "bg-[#ECFDF5]";
  if (m.includes("converse")) return "bg-[#FEF2F2]";
  return "bg-[#F5F7F6]";
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

  const hrefProducto = producto.isFresh 
    ? `/producto/${producto.id}?f=${encodeURIComponent(JSON.stringify(producto))}`
    : `/producto/${producto.id}`;

  return (
    <Link
      href={hrefProducto}
      prefetch={false}
      className={`tarjeta-producto group relative overflow-hidden border-2 border-[#111] bg-white transition-all duration-300 ease-out hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[5px_5px_0px_#111] min-w-0 ${
        esLista
          ? "grid grid-cols-[120px_minmax(0,1fr)] sm:grid-cols-[220px_minmax(0,1fr)] rounded-[8px]"
          : "flex h-full flex-col rounded-[8px]"
      } ${esMejorOferta ? "ring-3 sm:ring-4 ring-[#FF4500] ring-offset-1 sm:ring-offset-2" : ""}`}
    >
      {esMejorOferta && (
        <div className="absolute top-0 left-0 right-0 bg-[#FF4500] text-white text-[9px] sm:text-xs font-black uppercase tracking-widest text-center py-0.5 sm:py-1 z-20 border-b-2 border-[#111]">
          ¡Mejor Descuento!
        </div>
      )}
      <div
        className={`relative block overflow-hidden ${colorFondoMarca} ${
          esMejorOferta && !esLista ? "mt-5 sm:mt-6" : ""
        } ${
          esLista
            ? "aspect-square sm:aspect-auto border-r-2 border-[#111]"
            : "aspect-square border-b-2 border-[#111]"
        }`}
      >
        <ProductImage
          src={producto.imageUrl}
          alt={producto.name}
          priority={prioridadImagen}
          sizes={
            esLista
              ? "(max-width: 640px) 120px, 220px"
              : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          }
          className="object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <span className={`absolute left-2 top-2 rounded-[4px] px-2 py-0.5 text-[11px] font-black sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-sm transition-transform group-hover:scale-105 ${badgeClase}`}>
          -{formatearPorcentaje(producto.discount)}
        </span>
        {producto.freeShipping ? (
          <span className="absolute bottom-2 left-2 rounded-[4px] bg-white border border-[#111] sm:border-2 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-[#111] shadow-[1px_1px_0px_#111] inline-flex">
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
            className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white text-[#111] p-1.5 rounded border border-[#111] sm:border-2 shadow-[1px_1px_0px_#111] sm:shadow-[2px_2px_0px_#111] hover:bg-[#FF4500] hover:text-white transition-all z-10 cursor-pointer"
            title="Ir a la tienda"
            aria-label="Ir a la tienda"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:gap-2 sm:p-4 min-w-0">
        {/* Fila superior: Marca + Tienda en todos los breakpoints para evitar desbordes */}
        <div className="flex items-center justify-between gap-1.5 min-w-0">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#111] bg-[#fbbf24] border border-[#111] sm:border-2 px-1.5 sm:px-2 py-0.5 rounded-[4px] truncate shadow-[1px_1px_0px_#111] shrink-0 max-w-[50%]">
            {producto.brand}
          </span>

          <div className="flex items-center justify-end h-5 px-1.5 py-0.5 rounded-[4px] bg-white border border-[#111] shadow-[1px_1px_0px_#111] max-w-[50%] overflow-hidden shrink-0">
            <StoreLogo storeName={producto.storeName} />
          </div>
        </div>

        <h3 className="line-clamp-2 text-xs sm:text-sm font-black font-titulos leading-snug text-[#111] transition duration-200 group-hover:text-[#FF4500] uppercase tracking-tighter">
          {producto.name}
        </h3>

        <div className="mt-auto pt-1.5 sm:pt-2.5 border-t-2 border-[#111]/10">
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <p className="text-base sm:text-xl xl:text-2xl font-black font-mono leading-none tracking-tighter text-[#111]">
              {formatearPrecio(producto.price)}
            </p>
            <p className="text-[10px] sm:text-xs font-bold font-mono text-black/45 line-through shrink-0">
              {formatearPrecio(producto.listPrice)}
            </p>
          </div>
          <span className={`inline-flex rounded-[4px] px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-black mt-1 sm:mt-1.5 border border-[#111] shadow-[1px_1px_0px_#111] ${
            esSuperAhorro
              ? "bg-[#FF4500] text-white"
              : "bg-[#FEF2F2] text-[#FF4500]"
          }`}>
            Ahorrás {formatearPrecio(calcularAhorro(producto))}
          </span>
        </div>

        {/* Fila de talles a ancho 100% en todos los breakpoints: nunca se aprieta en mobile, tablet ni desktop */}
        <div className="pt-1.5 mt-1 border-t-2 border-[#111]/10">
          <div className="flex flex-col justify-center rounded-[4px] bg-[#EBF6FF] border border-[#111] sm:border-2 px-2 py-1.5 shadow-[1px_1px_0px_#111]">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[8px] sm:text-[9px] font-black text-black/60 uppercase tracking-widest leading-none">
                Talles (AR)
              </p>
              {producto.sizes && producto.sizes.length > 0 && (
                <span className="text-[8px] sm:text-[9px] font-black text-[#111]/60 leading-none">
                  {producto.sizes.length} disp.
                </span>
              )}
            </div>
            {producto.sizes && producto.sizes.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {producto.sizes.slice(0, 5).map((t: string) => (
                  <span
                    key={t}
                    className="bg-white border border-[#111] rounded-[3px] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black leading-none text-[#111]"
                  >
                    {t}
                  </span>
                ))}
                {producto.sizes.length > 5 && (
                  <span className="bg-[#111] text-white border border-[#111] rounded-[3px] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black leading-none">
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
      </div>
    </Link>
  );
}
