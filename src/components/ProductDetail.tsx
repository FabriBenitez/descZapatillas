"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { ProductImage } from "@/components/ProductImage";
import { generarEnlaceAfiliado } from "@/lib/afiliados";
import {
  calcularAhorro,
  formatearPorcentaje,
  formatearPrecio,
} from "@/lib/formato";
import type { Producto } from "@/types/producto";

interface ProductDetailProps {
  producto: Producto;
}

export function ProductDetail({ producto }: ProductDetailProps) {
  const esSuperAhorro = producto.discount >= 50;

  // Badge brutalista
  let badgeClase = "bg-black text-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]";
  if (esSuperAhorro) {
    badgeClase = "bg-[#FF4500] text-white border-2 border-[#FF4500] shadow-[4px_4px_0px_rgba(0,0,0,1)]";
  }

  return (
    <article className="detalle-producto grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] items-start">
      <section className="grid gap-3">
        <div className={`relative aspect-[4/3] overflow-hidden rounded-[8px] border-2 bg-[#f9f9f9] transition-all duration-300 ${
          esSuperAhorro ? "border-[#FF4500]" : "border-[#111]"
        }`}>
          <ProductImage
            src={producto.imageUrl}
            alt={producto.name}
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover mix-blend-multiply"
          />
          <span className={`absolute left-4 top-4 rounded-[4px] px-4 py-2 text-xl font-black ${badgeClase}`}>
            -{formatearPorcentaje(producto.discount)}
          </span>
        </div>
      </section>

      <section className="p-6 sm:p-8 rounded-[8px] border-2 border-[#111] bg-white shadow-[6px_6px_0px_rgba(0,0,0,0.1)] lg:sticky lg:top-[116px] lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-wrap gap-2">
          <span className="bg-white border-2 border-[#111] text-[#111] px-3 py-1.5 rounded-[4px] text-[10px] tracking-widest font-black uppercase">
            {producto.brand}
          </span>
          <span className="bg-[#f5f5f5] border-2 border-[#e5e5e5] text-black/70 px-3 py-1.5 rounded-[4px] text-[10px] tracking-widest font-bold uppercase">
            {producto.category}
          </span>
          <span className="bg-[#E5F529] border-2 border-[#111] text-[#111] px-3 py-1.5 rounded-[4px] text-[10px] tracking-widest font-black uppercase">
            {producto.storeName}
          </span>
        </div>

        <h1 className="mt-6 text-3xl font-black font-titulos leading-none text-[#111] sm:text-4xl tracking-tighter uppercase">
          {producto.name}
        </h1>

        <div className={`mt-8 rounded-[8px] bg-white p-5 sm:p-6 text-[#111] border-2 ${
          esSuperAhorro
            ? "border-[#FF4500] shadow-[6px_6px_0px_#FF4500]"
            : "border-[#111] shadow-[6px_6px_0px_#111]"
        }`}>
          <div className="flex flex-wrap items-baseline gap-3">
            <p className="text-4xl font-black font-mono leading-none sm:text-5xl tracking-tighter text-[#111]">
              {formatearPrecio(producto.price)}
            </p>
            <p className="text-lg font-bold font-mono text-black/40 line-through">
              {formatearPrecio(producto.listPrice)}
            </p>
          </div>
          
          <div className="mt-6 grid gap-0 sm:grid-cols-2 border-t-2 border-[#111] pt-4">
            <div className="flex flex-col justify-center gap-0.5 border-b-2 sm:border-b-0 sm:border-r-2 border-[#111] pb-3 sm:pb-0 sm:pr-4">
              <span className="text-[10px] uppercase tracking-widest text-black/50 font-bold">Ahorro Directo</span>
              <span className={`font-mono text-lg font-black ${esSuperAhorro ? "text-[#FF4500]" : "text-[#111]"}`}>
                {formatearPrecio(calcularAhorro(producto))}
              </span>
            </div>
            <div className="flex flex-col justify-center gap-0.5 pt-3 sm:pt-0 sm:pl-4">
              <span className="text-[10px] uppercase tracking-widest text-black/50 font-bold">Mejor Histórico</span>
              <span className="font-mono text-lg font-black text-[#111]">
                {formatearPrecio(producto.historicalBestPrice ?? producto.price)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t-2 border-black/10 pt-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-black/50">
            Talles disponibles
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {(producto.sizes?.length
              ? producto.sizes
              : [producto.size ?? "Consultar"]
            ).map((talle) => (
              <span key={talle} className="min-h-10 min-w-10 flex items-center justify-center rounded-[4px] bg-white border-2 border-[#111] text-xs font-black px-4 py-2 cursor-default shadow-[2px_2px_0px_#111]">
                {talle}
              </span>
            ))}
          </div>
          {!producto.sizes?.length ? (
            <p className="mt-4 text-xs font-bold leading-relaxed text-black/50">
              Esta tienda no informa talles disponibles en la grilla. Puedes confirmarlo
              al ingresar en el enlace original del producto.
            </p>
          ) : null}
        </div>

        <div className="mt-8">
          <a
            href={generarEnlaceAfiliado(producto)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              sendGAEvent('event', 'click_oferta', { value: producto.storeName });
            }}
            className="flex items-center justify-center bg-[#FF4500] hover:bg-[#e03d00] text-white border-2 border-[#111] shadow-[4px_4px_0px_#111] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#111] transition-all rounded-[6px] min-h-14 w-full text-sm uppercase tracking-widest font-black"
          >
            Ver producto en la tienda
          </a>
        </div>
      </section>
    </article>
  );
}
