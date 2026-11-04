"use client";

import Link from "next/link";

import { ProductImage } from "@/components/ProductImage";
import { StoreLogo } from "@/components/StoreLogo";
import {
  calcularAhorro,
  formatearPorcentaje,
  formatearPrecio,
} from "@/lib/formato";
import type { Producto } from "@/types/producto";

interface HeroSearchProps {
  terminoBusqueda: string;
  alCambiarBusqueda: (valor: string) => void;
  alEnviarBusqueda: (terminoOverride?: string) => void;
  cantidadProductos: number;
  cantidadMarcas: number;
  cantidadTiendas: number;
  ofertaDestacada: Producto | null;
}

const busquedasSugeridas = ["Air Force", "Campus", "Suede", "Dunk", "Gel", "Forum", "574"];

export function HeroSearch({
  terminoBusqueda,
  alCambiarBusqueda,
  alEnviarBusqueda,
  cantidadProductos,
  cantidadMarcas,
  cantidadTiendas,
  ofertaDestacada,
}: HeroSearchProps) {
  function buscarSugerencia(valor: string) {
    alCambiarBusqueda(valor);
    alEnviarBusqueda(valor);
  }

  const esSuperAhorro = ofertaDestacada && ofertaDestacada.discount >= 50;

  return (
    <section className="hero relative overflow-hidden border-b-2 border-[#111] bg-[#FF4500] pt-6 pb-8 text-white sm:pt-14 sm:pb-18 lg:pt-20 lg:pb-24">
      <div className="contenedor grid gap-6 sm:gap-10 lg:grid-cols-[1fr_400px] lg:items-center">
        <div className="hero__contenido max-w-5xl space-y-5 sm:space-y-9 min-w-0">
          <div className="inline-flex items-center gap-2 border-2 border-[#111] bg-white px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#111] shadow-[3px_3px_0px_#111] sm:shadow-[4px_4px_0px_#111]">
            <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4500] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-[#FF4500] border border-[#111]"></span>
            </span>
            Tracker de Ofertas en Vivo
          </div>

          <h1 className="max-w-4xl text-[2.4rem] font-black leading-[0.9] sm:text-[4.8rem] lg:text-[6.5rem] font-titulos tracking-tighter text-white uppercase">
            Cazá las mejores{" "}
            <span className="text-[#111] bg-[#fbbf24] sm:bg-white px-2 py-0.5 inline-block -rotate-1 sm:-rotate-2 border-2 border-[#111] shadow-[4px_4px_0px_#111] sm:shadow-[8px_8px_0px_#111] mt-1">
              ofertas.
            </span>
          </h1>

          <p className="max-w-2xl text-sm sm:text-xl font-black leading-snug sm:leading-relaxed text-white/95 font-cuerpo uppercase tracking-tight">
            Buscá tu modelo, filtrá por tu talle real y compará precios en {cantidadTiendas} tiendas oficiales al instante.
          </p>

          {/* Buscador unificado en 1 fila en mobile y desktop */}
          <form
            className="border-2 border-[#111] bg-white p-1.5 sm:p-2.5 shadow-[5px_5px_0px_#111] sm:shadow-[8px_8px_0px_#111] rounded-[6px]"
            onSubmit={(evento) => {
              evento.preventDefault();
              alEnviarBusqueda();
            }}
          >
            <label htmlFor="busqueda-hero" className="sr-only">
              Buscar zapatillas
            </label>
            <div className="flex items-stretch gap-1.5 sm:gap-2.5">
              <input
                id="busqueda-hero"
                type="search"
                value={terminoBusqueda}
                onChange={(evento) => alCambiarBusqueda(evento.target.value)}
                placeholder="Ej: NIKE AIR FORCE, SAMBA..."
                className="min-h-12 sm:min-h-15 border-2 border-[#111] bg-[#f9f9f9] px-3 sm:px-5 text-xs sm:text-lg font-black text-[#111] outline-none placeholder:text-black/35 focus:bg-white transition-all w-full uppercase rounded-[4px]"
              />
              <button
                type="submit"
                className="min-h-12 sm:min-h-15 px-4 sm:px-8 border-2 border-[#111] text-xs sm:text-base font-black uppercase tracking-wider sm:tracking-widest bg-[#111] text-white shadow-[2px_2px_0px_#FF4500] sm:shadow-[4px_4px_0px_#FF4500] active:translate-y-0.5 transition-all shrink-0 rounded-[4px]"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Riel horizontal deslizable de búsquedas populares */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/90 shrink-0">
              Populares:
            </span>
            {busquedasSugeridas.map((sugerencia) => (
              <button
                key={sugerencia}
                type="button"
                className="shrink-0 border-2 border-[#111] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#111] transition-all hover:bg-[#111] hover:text-white shadow-[2px_2px_0px_#111] active:translate-y-0.5 rounded-[4px] cursor-pointer"
                onClick={() => buscarSugerencia(sugerencia)}
              >
                {sugerencia}
              </button>
            ))}
          </div>

          {/* Contadores unificados sin desborde en pantallas de 360px */}
          <div className="grid max-w-2xl grid-cols-3 divide-x-2 divide-[#111] border-2 border-[#111] bg-white shadow-[4px_4px_0px_#111] sm:shadow-[6px_6px_0px_#111] rounded-[6px] overflow-hidden">
            <div className="px-2 py-2.5 sm:p-4 text-center sm:text-left sm:pl-5 group">
              <p className="text-xl sm:text-4xl font-black font-mono text-[#111] leading-none tracking-tighter">
                {cantidadProductos.toLocaleString("es-AR")}
              </p>
              <p className="mt-1 sm:mt-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest text-black/55">
                Ofertas
              </p>
            </div>
            <div className="px-2 py-2.5 sm:p-4 text-center sm:text-left sm:pl-5 group">
              <p className="text-xl sm:text-4xl font-black font-mono text-[#111] leading-none tracking-tighter">
                {cantidadMarcas}
              </p>
              <p className="mt-1 sm:mt-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest text-black/55">
                Marcas
              </p>
            </div>
            <div className="px-2 py-2.5 sm:p-4 text-center sm:text-left sm:pl-5 group">
              <p className="text-xl sm:text-4xl font-black font-mono text-[#111] leading-none tracking-tighter">
                {cantidadTiendas}
              </p>
              <p className="mt-1 sm:mt-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest text-black/55">
                Tiendas
              </p>
            </div>
          </div>
        </div>

        {/* Oferta Destacada: Compacta horizontal en mobile, tarjeta vertical en desktop, 100% Neo-Brutalista */}
        {ofertaDestacada ? (
          <div className="relative">
            <Link
              href={`/producto/${ofertaDestacada.id}`}
              className="hero__oferta relative grid grid-cols-[125px_minmax(0,1fr)] sm:block overflow-hidden rounded-[8px] border-2 border-[#111] bg-white text-[#111] shadow-[5px_5px_0px_#111] sm:shadow-[8px_8px_0px_#111] transition-all duration-300 hover:-translate-y-1.5"
            >
              <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden bg-[#F5F7F6] border-r-2 sm:border-r-0 sm:border-b-2 border-[#111]">
                <ProductImage
                  src={ofertaDestacada.imageUrl}
                  alt={ofertaDestacada.name}
                  priority
                  sizes="(max-width: 640px) 130px, 400px"
                  className="object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <span
                  className={`absolute left-2 top-2 sm:left-3 sm:top-3 rounded-[4px] border-2 border-[#111] px-2 py-0.5 sm:px-3 sm:py-1.5 text-xs sm:text-lg font-black shadow-[2px_2px_0px_#111] ${
                    esSuperAhorro
                      ? "bg-[#FF4500] text-white"
                      : "bg-[#10b981] text-white"
                  }`}
                >
                  -{formatearPorcentaje(ofertaDestacada.discount)}
                </span>
              </div>

              <div className="p-3 sm:p-5 flex flex-col justify-between gap-1.5 sm:gap-3 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="bg-[#fbbf24] border border-[#111] text-[#111] text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-1.5 sm:px-2.5 py-0.5 rounded-[4px] shadow-[1px_1px_0px_#111] truncate">
                    ⚡ Oferta Bomba
                  </span>
                  <div className="h-4 sm:h-5 max-w-[75px] shrink-0">
                    <StoreLogo storeName={ofertaDestacada.storeName} />
                  </div>
                </div>

                <h2 className="line-clamp-2 text-xs sm:text-base font-black font-titulos uppercase leading-tight text-[#111]">
                  {ofertaDestacada.name}
                </h2>

                <div className="pt-1.5 sm:pt-2.5 flex flex-wrap items-baseline justify-between gap-1 border-t-2 border-[#111]/10">
                  <div>
                    <p className="text-lg sm:text-2xl font-black font-mono leading-none text-[#111]">
                      {formatearPrecio(ofertaDestacada.price)}
                    </p>
                    <p className="text-[10px] sm:text-xs font-bold font-mono text-black/40 line-through">
                      {formatearPrecio(ofertaDestacada.listPrice)}
                    </p>
                  </div>
                  <span className="rounded-[4px] border border-[#111] bg-[#FEF2F2] text-[#FF4500] px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-black shadow-[1px_1px_0px_#111]">
                    Ahorrás {formatearPrecio(calcularAhorro(ofertaDestacada))}
                  </span>
                </div>

                {ofertaDestacada.sizes && ofertaDestacada.sizes.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap pt-1">
                    <span className="text-[8px] font-black uppercase text-black/50 mr-0.5">
                      Talles:
                    </span>
                    {ofertaDestacada.sizes.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="bg-[#EBF6FF] border border-[#111] rounded-[2px] px-1 py-0.5 text-[8px] sm:text-[9px] font-black leading-none text-[#111]"
                      >
                        {t}
                      </span>
                    ))}
                    {ofertaDestacada.sizes.length > 4 && (
                      <span className="bg-[#111] text-white rounded-[2px] px-1 py-0.5 text-[8px] sm:text-[9px] font-black leading-none">
                        +{ofertaDestacada.sizes.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
