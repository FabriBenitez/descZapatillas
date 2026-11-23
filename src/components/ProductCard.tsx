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

  const hrefProducto = producto.isFresh 
    ? `/producto/${producto.id}?f=${encodeURIComponent(JSON.stringify(producto))}`
    : `/producto/${producto.id}`;

  return (
    <Link
      href={hrefProducto}
      prefetch={false}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white transition-all duration-250 ease-out hover:-translate-y-1 hover:border-black/25 hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] active:scale-[0.985] min-w-0 touch-manipulation ${
        esLista
          ? "sm:grid sm:grid-cols-[200px_minmax(0,1fr)]"
          : "h-full"
      } ${esMejorOferta ? "ring-2 ring-[#FF4500]" : ""}`}
    >
      {esMejorOferta && (
        <div className="bg-[#FF4500] text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-center py-0.5 z-20">
          🔥 Mejor Descuento
        </div>
      )}

      {/* Contenedor de Imagen */}
      <div
        className={`relative block overflow-hidden ${colorFondoMarca} ${
          esLista
            ? "aspect-[4/3] sm:aspect-auto sm:border-r border-b sm:border-b-0 border-black/8"
            : "aspect-square border-b border-black/8"
        }`}
      >
        <ProductImage
          src={producto.imageUrl}
          alt={producto.name}
          priority={prioridadImagen}
          sizes={
            esLista
              ? "(max-width: 640px) 100vw, 220px"
              : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          }
          className="object-cover mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105 p-2 sm:p-3"
        />

        {/* Badge de Descuento Flotante (Limpio y llamativo) */}
        <span
          className={`absolute left-2 top-2 rounded-lg px-2 py-0.5 text-[11px] sm:text-xs font-black tabular-nums shadow-sm transition-transform group-hover:scale-105 ${
            esSuperAhorro
              ? "bg-[#FF4500] text-white"
              : "bg-[#10b981] text-white"
          }`}
        >
          -{formatearPorcentaje(producto.discount)}
        </span>

        {/* Tienda en esquina superior derecha */}
        <div className="absolute top-2 right-2 z-10 scale-90 origin-top-right">
          <StoreLogo storeName={producto.storeName} />
        </div>

        {producto.freeShipping && (
          <span className="absolute bottom-2 left-2 rounded-md bg-white/90 backdrop-blur-xs border border-black/10 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-[#111]">
            Envío gratis
          </span>
        )}
      </div>

      {/* Información del Producto */}
      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3.5 gap-2 min-w-0">
        <div className="space-y-1">
          <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-black/50 truncate">
            {producto.brand}
          </p>

          <h3 className="line-clamp-2 text-xs sm:text-[13px] font-bold leading-snug text-[#111] group-hover:text-[#FF4500] transition-colors">
            {producto.name}
          </h3>
        </div>

        <div className="pt-1.5 border-t border-black/6 space-y-1">
          {/* Precios con tipografía tabular legible */}
          <div className="flex flex-wrap items-baseline gap-x-1.5 tabular-nums">
            <p className="text-base sm:text-lg font-black tracking-tight text-[#111]">
              {formatearPrecio(producto.price)}
            </p>
            <p className="text-[11px] sm:text-xs font-semibold text-black/40 line-through">
              {formatearPrecio(producto.listPrice)}
            </p>
          </div>

          <p className="text-[10px] sm:text-[11px] font-bold text-[#059669] tabular-nums truncate">
            Ahorrás {formatearPrecio(calcularAhorro(producto))}
          </p>
        </div>

        {/* Fila de Talles compacta y moderna */}
        <div className="pt-1 border-t border-dashed border-black/8 flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-black/60 min-w-0">
          <span className="shrink-0 font-bold text-black/45 mr-1">Talles AR:</span>
          {producto.sizes && producto.sizes.length > 0 ? (
            <span className="font-semibold text-black/80 truncate tabular-nums">
              {producto.sizes.slice(0, 4).join(", ")}
              {producto.sizes.length > 4 ? ` (+${producto.sizes.length - 4})` : ""}
            </span>
          ) : (
            <span className="text-[9px] text-black/40 truncate">
              {producto.size ?? "Ver en tienda"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
