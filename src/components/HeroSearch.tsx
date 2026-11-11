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
    <section
      className="hero relative overflow-hidden border-b-2 sm:border-b-3 border-[#111] bg-[#FF4500] pt-4 pb-6 text-white sm:pt-10 sm:pb-14 lg:pt-14 lg:pb-16"
      style={{
        backgroundImage:
          "radial-gradient(rgba(17, 17, 17, 0.14) 1.25px, transparent 1.25px)",
        backgroundSize: "18px 18px",
      }}
    >
      <div className="contenedor grid gap-4 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <div className="hero__contenido space-y-3.5 sm:space-y-6 min-w-0">
          {/* 1. Pill de estado en vivo con números tabulares */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 border-2 border-[#111] bg-white px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#111] shadow-[3px_3px_0px_#111] rounded-[6px] tabular-nums">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10b981] border border-[#111]"></span>
              </span>
              <span>
                {cantidadProductos.toLocaleString("es-AR")} ofertas · {cantidadTiendas} tiendas
              </span>
            </div>

            <span className="hidden sm:inline-flex items-center border-2 border-[#111] bg-[#111] px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-[#fbbf24] rounded-[6px] tabular-nums">
              {cantidadMarcas} marcas oficiales
            </span>
          </div>

          {/* 2. Titular de alto impacto + subtítulo en sentence-case legible */}
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-[2.15rem] min-[390px]:text-[2.45rem] sm:text-[4.25rem] lg:text-[5.25rem] font-black leading-[0.94] font-titulos tracking-[-0.035em] text-white uppercase">
              Cazá las mejores{" "}
              <span className="text-[#111] bg-[#fbbf24] sm:bg-white px-2.5 py-0.5 inline-block -rotate-1 border-2 border-[#111] shadow-[3px_3px_0px_#111] sm:shadow-[5px_5px_0px_#111] rounded-[4px]">
                ofertas.
              </span>
            </h1>

            <p className="max-w-[52ch] text-[13px] sm:text-lg font-bold leading-snug text-white/95 font-cuerpo">
              Buscá tu modelo, filtrá por tu talle argentino y compará precios reales al instante en las mejores tiendas del país.
            </p>
          </div>

          {/* 3. Consola Unificada: Buscador + Tendencias + Selector de Talles AR */}
          <div className="border-2 border-[#111] bg-white p-3 sm:p-4.5 shadow-[5px_5px_0px_#111] sm:shadow-[8px_8px_0px_#111] rounded-[12px] text-[#111] space-y-3 sm:space-y-4">
            <form
              onSubmit={(evento) => {
                evento.preventDefault();
                alEnviarBusqueda();
              }}
            >
              <label htmlFor="busqueda-hero" className="sr-only">
                Buscar zapatillas por modelo, marca o talle
              </label>
              <div className="flex items-stretch gap-1.5 sm:gap-2.5">
                <div className="relative flex flex-1 items-center min-w-0">
                  <svg
                    className="pointer-events-none absolute left-3 sm:left-3.5 h-4 w-4 sm:h-5 sm:w-5 text-[#111]/45"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.75}
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
                    placeholder="Ej: Air Force, Samba, Campus, 41..."
                    className="h-11 sm:h-13 w-full border-2 border-[#111] bg-[#f5f7f6] pl-9 sm:pl-11 pr-8 text-base sm:text-base font-bold text-[#111] outline-none placeholder:text-[#111]/45 focus:bg-white focus:ring-2 focus:ring-[#FF4500]/25 transition-all rounded-[8px]"
                  />
                  {terminoBusqueda && (
                    <button
                      type="button"
                      onClick={() => alCambiarBusqueda("")}
                      aria-label="Limpiar búsqueda"
                      className="absolute right-2.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/10 text-xs font-black text-[#111] hover:bg-black/20 touch-manipulation"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="h-11 sm:h-13 px-4 sm:px-7 border-2 border-[#111] text-xs sm:text-sm font-black uppercase tracking-wider bg-[#111] text-white hover:bg-[#fbbf24] hover:text-[#111] shadow-[2px_2px_0px_#FF4500] sm:shadow-[3px_3px_0px_#FF4500] active:scale-[0.97] active:translate-y-0.5 transition-all shrink-0 rounded-[8px] touch-manipulation cursor-pointer"
                >
                  Buscar
                </button>
              </div>
            </form>

            {/* Riel de búsquedas populares integrado dentro de la consola */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#111]/55 shrink-0 mr-0.5">
                🔥 Top:
              </span>
              {busquedasSugeridas.map((sugerencia) => (
                <button
                  key={sugerencia}
                  type="button"
                  onClick={() => buscarSugerencia(sugerencia)}
                  className="shrink-0 min-h-[30px] sm:min-h-[32px] border border-[#111]/80 bg-[#f5f7f6] px-2.5 py-1 text-[11px] font-extrabold text-[#111] transition-all hover:bg-[#111] hover:text-white active:scale-[0.96] rounded-[6px] touch-manipulation cursor-pointer"
                >
                  {sugerencia}
                </button>
              ))}
            </div>

            {/* Selector rápido de Talles AR con targets táctiles de 40px */}
            {irConFiltroDirecto && (
              <div className="border-t-2 border-dashed border-[#111]/15 pt-2.5 sm:pt-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#111]">
                    👟 Entrá directo con tu talle (AR)
                  </span>
                  <Link
                    href="/comparador"
                    className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-[#FF4500] hover:underline touch-manipulation"
                  >
                    <span>Ver todos</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
                  {TALLES_HERO.map((talle) => (
                    <button
                      key={talle}
                      type="button"
                      onClick={() => irConFiltroDirecto("talle", talle)}
                      className="h-10 sm:h-10 rounded-[6px] border-2 border-[#111] bg-[#f5f7f6] hover:bg-[#FF4500] hover:text-white active:bg-[#FF4500] active:text-white text-xs sm:text-sm font-black text-[#111] shadow-[2px_2px_0px_#111] active:scale-[0.96] active:translate-y-0.5 transition-all tabular-nums touch-manipulation cursor-pointer"
                    >
                      {talle}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Tarjeta "Oferta Bomba": rediseñada para mobile y desktop sin logos rotos */}
        {ofertaDestacada ? (
          <div className="relative min-w-0 lg:mt-1">
            <Link
              href={`/producto/${ofertaDestacada.id}`}
              prefetch={false}
              className="hero__oferta group block overflow-hidden rounded-[12px] border-2 border-[#111] bg-white text-[#111] shadow-[5px_5px_0px_#111] sm:shadow-[8px_8px_0px_#111] transition-all duration-200 hover:-translate-y-1 active:scale-[0.99] touch-manipulation"
            >
              {/* Barra superior dedicada: evita que el badge y la tienda choquen en mobile */}
              <div className="flex items-center justify-between gap-2 bg-[#111] px-3 py-2 sm:px-4 sm:py-2.5 border-b-2 border-[#111]">
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#fbbf24]">
                  <span>⚡ Oferta Bomba</span>
                </span>
                <div className="h-5 shrink-0">
                  <StoreLogo storeName={ofertaDestacada.storeName} />
                </div>
              </div>

              <div className="grid grid-cols-[120px_minmax(0,1fr)] sm:grid-cols-[165px_minmax(0,1fr)] lg:block">
                <div className="relative aspect-square lg:aspect-[4/3] overflow-hidden bg-[#F5F7F6] border-r-2 lg:border-r-0 lg:border-b-2 border-[#111]">
                  <ProductImage
                    src={ofertaDestacada.imageUrl}
                    alt={ofertaDestacada.name}
                    priority
                    sizes="(max-width: 640px) 130px, 420px"
                    className="object-cover mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105 p-2"
                  />
                  <span
                    className={`absolute left-2 top-2 sm:left-3 sm:top-3 rounded-[6px] border-2 border-[#111] px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs sm:text-base font-black shadow-[2px_2px_0px_#111] tabular-nums ${
                      esSuperAhorro
                        ? "bg-[#FF4500] text-white"
                        : "bg-[#10b981] text-white"
                    }`}
                  >
                    -{formatearPorcentaje(ofertaDestacada.discount)}
                  </span>
                </div>

                <div className="p-3 sm:p-4.5 flex flex-col justify-between gap-2 sm:gap-3 min-w-0">
                  <h2 className="line-clamp-2 text-[13px] sm:text-base font-black font-titulos uppercase leading-snug text-[#111] group-hover:text-[#FF4500] transition-colors">
                    {ofertaDestacada.name}
                  </h2>

                  <div className="space-y-1.5 pt-1 border-t border-[#111]/10">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 tabular-nums">
                      <p className="text-lg sm:text-2xl font-black font-mono leading-none text-[#111]">
                        {formatearPrecio(ofertaDestacada.price)}
                      </p>
                      <p className="text-[11px] sm:text-xs font-bold font-mono text-black/45 line-through">
                        {formatearPrecio(ofertaDestacada.listPrice)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="inline-flex items-center rounded-[4px] border border-[#111] bg-[#ECFDF5] text-[#047857] px-1.5 py-0.5 text-[10px] sm:text-[11px] font-black tabular-nums">
                        Ahorrás {formatearPrecio(calcularAhorro(ofertaDestacada))}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    {ofertaDestacada.sizes && ofertaDestacada.sizes.length > 0 ? (
                      <div className="flex items-center gap-1 flex-wrap min-w-0">
                        <span className="text-[9px] font-black uppercase text-black/55">
                          Talles:
                        </span>
                        {ofertaDestacada.sizes.slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="bg-[#f5f7f6] border border-[#111] rounded-[4px] px-1.5 py-0.5 text-[10px] font-black leading-none text-[#111] tabular-nums"
                          >
                            {t}
                          </span>
                        ))}
                        {ofertaDestacada.sizes.length > 4 && (
                          <span className="bg-[#111] text-white rounded-[4px] px-1.5 py-0.5 text-[9px] font-black leading-none tabular-nums">
                            +{ofertaDestacada.sizes.length - 4}
                          </span>
                        )}
                      </div>
                    ) : <span />}

                    <span className="inline-flex items-center gap-1 rounded-[6px] border border-[#111] bg-[#fbbf24] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[#111] shadow-[1px_1px_0px_#111] shrink-0 group-hover:bg-[#FF4500] group-hover:text-white transition-colors">
                      <span>Ver</span>
                      <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
