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

const busquedasSugeridas = ["Air Force", "Samba", "Campus", "Dunk", "Suede", "Gel", "574"];
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

  const esSuperAhorro = ofertaDestacada && ofertaDestacada.discount >= 50;

  return (
    <section className="hero relative overflow-hidden border-b-2 border-[#111] bg-[#FF4500] pt-4 pb-5 text-white sm:pt-12 sm:pb-16 lg:pt-18 lg:pb-22">
      <div className="contenedor grid gap-4 sm:gap-10 lg:grid-cols-[1fr_400px] lg:items-center">
        <div className="hero__contenido max-w-5xl space-y-3.5 sm:space-y-8 min-w-0">
          {/* Pill superior: en mobile incluye las métricas en vivo para ahorrar espacio vertical */}
          <div className="inline-flex items-center gap-2 border-2 border-[#111] bg-white px-2.5 py-1 sm:px-3.5 sm:py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest text-[#111] shadow-[3px_3px_0px_#111] rounded-[4px]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10b981] border border-[#111]"></span>
            </span>
            <span>
              {cantidadProductos.toLocaleString("es-AR")} ofertas · {cantidadTiendas} tiendas
            </span>
          </div>

          {/* Título compacto en mobile (2 líneas en vez de 4) */}
          <div className="space-y-1.5 sm:space-y-3">
            <h1 className="max-w-4xl text-[2.15rem] font-black leading-[0.92] sm:text-[4.5rem] lg:text-[6.2rem] font-titulos tracking-tighter text-white uppercase">
              Cazá las mejores{" "}
              <span className="text-[#111] bg-[#fbbf24] sm:bg-white px-2 py-0.5 inline-block -rotate-1 border-2 border-[#111] shadow-[3px_3px_0px_#111] sm:shadow-[6px_6px_0px_#111]">
                ofertas.
              </span>
            </h1>

            <p className="max-w-2xl text-xs sm:text-xl font-extrabold leading-snug text-white/95 font-cuerpo uppercase tracking-tight">
              Buscá tu modelo, elegí tu talle y compará precios al instante.
            </p>
          </div>

          {/* Buscador en 1 sola fila horizontal (reemplaza el bloque gigante de 2 pisos en mobile) */}
          <form
            className="border-2 border-[#111] bg-white p-1.5 sm:p-2.5 shadow-[4px_4px_0px_#111] sm:shadow-[8px_8px_0px_#111] rounded-[6px]"
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
                placeholder="Ej: Air Force, Samba, Campus..."
                className="h-11 sm:min-h-15 border-2 border-[#111] bg-[#f9f9f9] px-3 sm:px-5 text-xs sm:text-lg font-black text-[#111] outline-none placeholder:text-black/40 focus:bg-white transition-all w-full uppercase rounded-[4px]"
              />
              <button
                type="submit"
                className="h-11 sm:min-h-15 px-4 sm:px-8 border-2 border-[#111] text-xs sm:text-base font-black uppercase tracking-wider bg-[#111] text-white hover:bg-[#fbbf24] hover:text-[#111] active:translate-y-0.5 transition-all shrink-0 rounded-[4px] cursor-pointer"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Riel de búsquedas populares en 1 sola línea deslizable */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/90 shrink-0 mr-0.5">
              Top:
            </span>
            {busquedasSugeridas.map((sugerencia) => (
              <button
                key={sugerencia}
                type="button"
                className="shrink-0 border-2 border-[#111] bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#111] transition-all hover:bg-[#111] hover:text-white shadow-[2px_2px_0px_#111] active:translate-y-0.5 rounded-[4px] cursor-pointer"
                onClick={() => buscarSugerencia(sugerencia)}
              >
                {sugerencia}
              </button>
            ))}
          </div>

          {/* Selector rápido de Talles integrado en el primer pantallazo mobile */}
          {irConFiltroDirecto && (
            <div className="bg-white border-2 border-[#111] p-2.5 sm:p-3.5 rounded-[6px] shadow-[4px_4px_0px_#111] text-[#111]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#111]">
                  👟 Entrá directo con tu talle (AR):
                </span>
                <Link
                  href="/comparador"
                  className="text-[10px] font-black uppercase text-[#FF4500] hover:underline"
                >
                  Todos →
                </Link>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {TALLES_HERO.map((talle) => (
                  <button
                    key={talle}
                    type="button"
                    onClick={() => irConFiltroDirecto("talle", talle)}
                    className="h-8 sm:h-9 rounded-[4px] border-2 border-[#111] bg-[#f5f7f6] hover:bg-[#FF4500] hover:text-white text-xs font-black text-[#111] shadow-[1px_1px_0px_#111] active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    {talle}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Contadores grandes solo en Desktop (en mobile ya están en el badge superior) */}
          <div className="hidden sm:grid max-w-2xl grid-cols-3 divide-x-2 divide-[#111] border-2 border-[#111] bg-white shadow-[6px_6px_0px_#111] rounded-[6px] overflow-hidden">
            <div className="p-4 pl-5 group">
              <p className="text-4xl font-black font-mono text-[#111] leading-none tracking-tighter">
                {cantidadProductos.toLocaleString("es-AR")}
              </p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-black/55">
                Zapatillas en oferta
              </p>
            </div>
            <div className="p-4 pl-5 group">
              <p className="text-4xl font-black font-mono text-[#111] leading-none tracking-tighter">
                {cantidadMarcas}
              </p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-black/55">
                Marcas
              </p>
            </div>
            <div className="p-4 pl-5 group">
              <p className="text-4xl font-black font-mono text-[#111] leading-none tracking-tighter">
                {cantidadTiendas}
              </p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-black/55">
                Tiendas oficiales
              </p>
            </div>
          </div>
        </div>

        {/* Oferta Destacada: Compacta horizontal en mobile y tablet, vertical en desktop (lg+) */}
        {ofertaDestacada ? (
          <div className="relative min-w-0">
            <Link
              href={`/producto/${ofertaDestacada.id}`}
              prefetch={false}
              className="hero__oferta relative grid grid-cols-[110px_minmax(0,1fr)] sm:grid-cols-[160px_minmax(0,1fr)] lg:block overflow-hidden rounded-[8px] border-2 border-[#111] bg-white text-[#111] shadow-[4px_4px_0px_#111] sm:shadow-[6px_6px_0px_#111] lg:shadow-[8px_8px_0px_#111] transition-all duration-300 hover:-translate-y-1.5"
            >
              <div className="relative aspect-square lg:aspect-[4/3] overflow-hidden bg-[#F5F7F6] border-r-2 lg:border-r-0 lg:border-b-2 border-[#111]">
                <ProductImage
                  src={ofertaDestacada.imageUrl}
                  alt={ofertaDestacada.name}
                  priority
                  sizes="(max-width: 640px) 120px, 400px"
                  className="object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <span
                  className={`absolute left-1.5 top-1.5 sm:left-3 sm:top-3 rounded-[4px] border-2 border-[#111] px-1.5 py-0.5 sm:px-3 sm:py-1.5 text-[11px] sm:text-lg font-black shadow-[1px_1px_0px_#111] sm:shadow-[2px_2px_0px_#111] ${
                    esSuperAhorro
                      ? "bg-[#FF4500] text-white"
                      : "bg-[#10b981] text-white"
                  }`}
                >
                  -{formatearPorcentaje(ofertaDestacada.discount)}
                </span>
              </div>

              <div className="p-2.5 sm:p-5 flex flex-col justify-between gap-1 sm:gap-3 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="bg-[#fbbf24] border border-[#111] text-[#111] text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-1.5 sm:px-2.5 py-0.5 rounded-[4px] shadow-[1px_1px_0px_#111] truncate">
                    ⚡ Oferta Bomba
                  </span>
                  <div className="h-4 sm:h-5 max-w-[70px] shrink-0">
                    <StoreLogo storeName={ofertaDestacada.storeName} />
                  </div>
                </div>

                <h2 className="line-clamp-1 sm:line-clamp-2 text-xs sm:text-base font-black font-titulos uppercase leading-tight text-[#111]">
                  {ofertaDestacada.name}
                </h2>

                <div className="pt-1 sm:pt-2.5 flex flex-wrap items-baseline justify-between gap-1 border-t border-[#111]/10">
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-base sm:text-2xl font-black font-mono leading-none text-[#111]">
                      {formatearPrecio(ofertaDestacada.price)}
                    </p>
                    <p className="text-[10px] sm:text-xs font-bold font-mono text-black/40 line-through">
                      {formatearPrecio(ofertaDestacada.listPrice)}
                    </p>
                  </div>
                  <span className="rounded-[4px] border border-[#111] bg-[#FEF2F2] text-[#FF4500] px-1.5 py-0.5 text-[8px] sm:text-[10px] font-black">
                    Ahorrás {formatearPrecio(calcularAhorro(ofertaDestacada))}
                  </span>
                </div>

                {ofertaDestacada.sizes && ofertaDestacada.sizes.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[8px] font-black uppercase text-black/50">
                      Talles:
                    </span>
                    {ofertaDestacada.sizes.slice(0, 5).map((t) => (
                      <span
                        key={t}
                        className="bg-[#EBF6FF] border border-[#111] rounded-[2px] px-1 py-0.5 text-[8px] sm:text-[9px] font-black leading-none text-[#111]"
                      >
                        {t}
                      </span>
                    ))}
                    {ofertaDestacada.sizes.length > 5 && (
                      <span className="bg-[#111] text-white rounded-[2px] px-1 py-0.5 text-[8px] sm:text-[9px] font-black leading-none">
                        +{ofertaDestacada.sizes.length - 5}
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
