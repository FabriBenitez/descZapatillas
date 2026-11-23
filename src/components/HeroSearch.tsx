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
  irConFiltroDirecto?: (param: string, valor: string) => void;
  cantidadProductos: number;
  cantidadMarcas: number;
  cantidadTiendas: number;
  ofertaDestacada: Producto | null;
}

const busquedasSugeridas = [
  "Air Force",
  "Samba",
  "Campus",
  "Dunk",
  "Suede",
  "Gel",
  "574",
];
const TALLES_HERO = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];

export function HeroSearch({
  terminoBusqueda,
  alCambiarBusqueda,
  alEnviarBusqueda,
  irConFiltroDirecto,
  cantidadProductos,
  cantidadMarcas,
  cantidadTiendas,
  ofertaDestacada,
}: HeroSearchProps) {
  function buscarSugerencia(valor: string) {
    alCambiarBusqueda(valor);
    alEnviarBusqueda(valor);
  }

  const esSuperAhorro = Boolean(ofertaDestacada && ofertaDestacada.discount >= 50);

  return (
    <section className="relative bg-[#FAFAFA] text-[#0A0A0A] pt-5 pb-8 sm:pt-12 sm:pb-16 border-b border-black/10">
      <div className="contenedor grid gap-6 sm:gap-10 lg:grid-cols-[minmax(0,1.25fr)_380px] xl:grid-cols-[minmax(0,1.25fr)_420px] items-start">
        
        <div className="space-y-4 sm:space-y-6 min-w-0">
          
          {/* Status Tracker: Streetwear metadata style */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono tracking-tight text-black/60">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-black text-white font-bold text-[10px] uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
              LIVE FEED
            </span>
            <span>{cantidadProductos.toLocaleString("es-AR")} DROPS</span>
            <span>/</span>
            <span>{cantidadMarcas} MARCAS</span>
            <span>/</span>
            <span>{cantidadTiendas} TIENDAS</span>
          </div>

          {/* Titular Streetwear Editorial: Tipografía masiva y directa */}
          <div className="space-y-2">
            <h1 className="text-3xl min-[400px]:text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-[-0.04em] leading-[0.92] text-[#0A0A0A]">
              CAZÁ OFERTAS DE <br className="hidden sm:inline" />
              <span className="underline decoration-4 sm:decoration-8 decoration-[#FF5500] underline-offset-3">
                ZAPATILLAS.
              </span>
            </h1>

            <p className="max-w-lg text-sm sm:text-base font-medium text-black/70 leading-snug">
              Comparamos stock en tiempo real y descuentos de tiendas oficiales en Argentina para que nunca pagues de más.
            </p>
          </div>

          {/* Consola Minimalista: Input limpio + Botón sólido negro */}
          <div className="space-y-3">
            <form
              onSubmit={(evento) => {
                evento.preventDefault();
                alEnviarBusqueda();
              }}
              className="flex items-stretch gap-1.5 sm:gap-2"
            >
              <label htmlFor="busqueda-hero" className="sr-only">
                Buscar zapatillas
              </label>
              <div className="relative flex-1 min-w-0">
                <svg
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-black/40"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  id="busqueda-hero"
                  type="search"
                  value={terminoBusqueda}
                  onChange={(evento) => alCambiarBusqueda(evento.target.value)}
                  placeholder="Buscá: Samba, Air Force, Dunk, Forum, 41..."
                  className="h-12 sm:h-14 w-full bg-white border-2 border-black rounded-lg pl-10 sm:pl-11 pr-8 text-sm sm:text-base font-bold text-black placeholder:text-black/40 placeholder:font-normal outline-none focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 transition-all shadow-[2px_2px_0px_#0A0A0A]"
                />
                {terminoBusqueda && (
                  <button
                    type="button"
                    onClick={() => alCambiarBusqueda("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-black/40 hover:text-black"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="h-12 sm:h-14 px-5 sm:px-8 bg-black hover:bg-[#FF5500] text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-lg border-2 border-black transition-all active:translate-y-0.5 shadow-[2px_2px_0px_#0A0A0A] shrink-0 cursor-pointer touch-manipulation"
              >
                Buscar
              </button>
            </form>

            {/* Tags de Siluetas Tendencia */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden text-xs">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-black/40 shrink-0">
                TOP:
              </span>
              {busquedasSugeridas.map((sugerencia) => (
                <button
                  key={sugerencia}
                  type="button"
                  onClick={() => buscarSugerencia(sugerencia)}
                  className="shrink-0 px-2.5 py-1 rounded border border-black/20 bg-white hover:bg-black hover:text-white text-xs font-bold text-black/80 transition-colors touch-manipulation cursor-pointer"
                >
                  {sugerencia}
                </button>
              ))}
            </div>

            {/* Selector de Talle en 1 sola fila con scroll snap */}
            {irConFiltroDirecto && (
              <div className="flex items-center gap-2 pt-1 border-t border-black/8">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-black/40 shrink-0">
                  TALLE (AR):
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-1">
                  {TALLES_HERO.map((talle) => (
                    <button
                      key={talle}
                      type="button"
                      onClick={() => irConFiltroDirecto("talle", talle)}
                      className="h-7 min-w-8 px-1.5 rounded border border-black/20 bg-white hover:bg-black hover:text-white text-xs font-black text-black transition-colors tabular-nums shrink-0 touch-manipulation"
                    >
                      {talle}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Accesos Rápidos al Catálogo: Botones con estilo punchy */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Link
              href="/comparador"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-black text-white hover:bg-[#FF5500] text-xs sm:text-sm font-black uppercase tracking-wider transition-colors active:scale-95 touch-manipulation shadow-[2px_2px_0px_rgba(0,0,0,0.2)]"
            >
              <span>Ver Catálogo Completo</span>
              <span aria-hidden="true">→</span>
            </Link>

            <Link
              href="/comparador?descuento=50"
              className="inline-flex items-center gap-1 px-3.5 py-3 rounded-lg border-2 border-[#FF5500] bg-[#FF5500]/10 text-[#FF5500] hover:bg-[#FF5500] hover:text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-colors active:scale-95 touch-manipulation"
            >
              <span>🔥 +50% OFF</span>
            </Link>

            <Link
              href="/comparador?categoria=Zapatillas"
              className="inline-flex items-center gap-1 px-3.5 py-3 rounded-lg border-2 border-black/15 bg-white hover:border-black text-xs sm:text-sm font-black uppercase tracking-wider text-black transition-colors active:scale-95 touch-manipulation"
            >
              <span>👟 Zapatillas</span>
            </Link>

            <Link
              href="/comparador?categoria=Botines"
              className="inline-flex items-center gap-1 px-3.5 py-3 rounded-lg border-2 border-black/15 bg-white hover:border-black text-xs sm:text-sm font-black uppercase tracking-wider text-black transition-colors active:scale-95 touch-manipulation"
            >
              <span>⚽ Botines</span>
            </Link>
          </div>
        </div>

        {/* Tarjeta Oferta Destacada (Estilo Sneaker Drop Card) */}
        {ofertaDestacada && (
          <div className="relative min-w-0 w-full">
            <Link
              href={`/producto/${ofertaDestacada.id}`}
              prefetch={false}
              className="group block overflow-hidden rounded-xl border-2 border-black bg-white text-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] transition-all hover:-translate-y-0.5 active:translate-y-0.5 touch-manipulation"
            >
              <div className="flex items-center justify-between gap-2 bg-black px-3.5 py-2 border-b border-black text-white">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5500]">
                  ⚡ OFERTA BOMBA
                </span>
                <div className="h-4 shrink-0 scale-90">
                  <StoreLogo storeName={ofertaDestacada.storeName} />
                </div>
              </div>

              <div className="grid grid-cols-[130px_minmax(0,1fr)] sm:grid-cols-[150px_minmax(0,1fr)] lg:block">
                <div className="relative aspect-square lg:aspect-[4/3] bg-[#F2F2F2] border-r-2 lg:border-r-0 lg:border-b-2 border-black overflow-hidden">
                  <ProductImage
                    src={ofertaDestacada.imageUrl}
                    alt={ofertaDestacada.name}
                    priority
                    sizes="(max-width: 640px) 140px, 420px"
                    className="object-cover mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105 p-3"
                  />
                  <span
                    className={`absolute left-2 top-2 rounded px-2 py-0.5 text-xs font-black tabular-nums border border-black ${
                      esSuperAhorro
                        ? "bg-[#FF5500] text-white"
                        : "bg-[#10b981] text-white"
                    }`}
                  >
                    -{formatearPorcentaje(ofertaDestacada.discount)}
                  </span>
                </div>

                <div className="p-3 sm:p-4 flex flex-col justify-between gap-2 min-w-0">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-black/50">
                      {ofertaDestacada.brand}
                    </span>
                    <h2 className="line-clamp-2 text-xs sm:text-sm font-black uppercase leading-snug text-black group-hover:text-[#FF5500] transition-colors">
                      {ofertaDestacada.name}
                    </h2>
                  </div>

                  <div className="space-y-0.5 pt-1 border-t border-black/10">
                    <div className="flex flex-wrap items-baseline gap-x-2 tabular-nums">
                      <p className="text-lg sm:text-2xl font-black text-black">
                        {formatearPrecio(ofertaDestacada.price)}
                      </p>
                      <p className="text-xs font-bold text-black/40 line-through">
                        {formatearPrecio(ofertaDestacada.listPrice)}
                      </p>
                    </div>

                    <p className="text-[11px] font-bold text-[#059669] tabular-nums">
                      Ahorrás {formatearPrecio(calcularAhorro(ofertaDestacada))}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-dashed border-black/10">
                    <span className="text-[10px] font-bold text-black/60 truncate">
                      {ofertaDestacada.sizes?.length ? `Talles: ${ofertaDestacada.sizes.slice(0, 3).join(", ")}...` : "Stock disponible"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-black text-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider group-hover:bg-[#FF5500] transition-colors shrink-0">
                      Ver →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
