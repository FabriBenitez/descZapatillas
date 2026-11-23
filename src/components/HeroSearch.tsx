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
    <section className="relative overflow-hidden bg-gradient-to-b from-[#111111] via-[#161616] to-[#111111] text-white pt-6 pb-8 sm:pt-12 sm:pb-16 border-b border-white/10">
      {/* Glow de acento urbano de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-[#FF4500]/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="contenedor relative z-10 grid gap-6 sm:gap-10 lg:grid-cols-[minmax(0,1.2fr)_380px] xl:grid-cols-[minmax(0,1.2fr)_420px] items-center">
        <div className="space-y-4 sm:space-y-6 min-w-0">
          
          {/* Badge en vivo con números tabulares */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white/90 tabular-nums shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
            </span>
            <span>
              {cantidadProductos.toLocaleString("es-AR")} ofertas · {cantidadMarcas} marcas · {cantidadTiendas} tiendas
            </span>
          </div>

          {/* Titular Moderno Streetwear */}
          <div className="space-y-2">
            <h1 className="text-3xl min-[400px]:text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.95] text-white">
              Cazá zapatillas al{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] via-[#FFAA00] to-[#FF4500]">
                mejor precio.
              </span>
            </h1>

            <p className="max-w-xl text-sm sm:text-base font-normal leading-relaxed text-white/70">
              Comparamos stock, talles argentinos y precios reales de las principales tiendas oficiales para que no pagues de más.
            </p>
          </div>

          {/* Consola de Acceso Rápido: Buscador + Accesos directos al Catálogo */}
          <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl p-3 sm:p-4 shadow-2xl space-y-3">
            {/* Buscador de modelo */}
            <form
              onSubmit={(evento) => {
                evento.preventDefault();
                alEnviarBusqueda();
              }}
            >
              <label htmlFor="busqueda-hero" className="sr-only">
                Buscar zapatillas por modelo, marca o talle
              </label>
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-1.5 focus-within:border-[#FF4500] focus-within:ring-2 focus-within:ring-[#FF4500]/20 transition-all">
                <div className="relative flex flex-1 items-center min-w-0">
                  <svg
                    className="pointer-events-none absolute left-3 h-5 w-5 text-white/40"
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
                    placeholder="Buscá tu modelo: Samba, Dunk, Air Force, 41..."
                    className="h-11 sm:h-12 w-full bg-transparent pl-10 pr-8 text-sm sm:text-base font-medium text-white outline-none placeholder:text-white/40"
                  />
                  {terminoBusqueda && (
                    <button
                      type="button"
                      onClick={() => alCambiarBusqueda("")}
                      aria-label="Limpiar búsqueda"
                      className="absolute right-2.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white hover:bg-white/20 touch-manipulation"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="h-11 sm:h-12 px-5 sm:px-7 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#FF4500] hover:bg-[#e03d00] text-white active:scale-95 transition-all shrink-0 cursor-pointer touch-manipulation shadow-md"
                >
                  Buscar
                </button>
              </div>
            </form>

            {/* Sugerencias populares de un toque */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 shrink-0 mr-1">
                🔥 Tendencias:
              </span>
              {busquedasSugeridas.map((sugerencia) => (
                <button
                  key={sugerencia}
                  type="button"
                  onClick={() => buscarSugerencia(sugerencia)}
                  className="shrink-0 px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-xs font-semibold text-white/80 hover:bg-white/15 hover:text-white active:scale-95 transition-all touch-manipulation cursor-pointer"
                >
                  {sugerencia}
                </button>
              ))}
            </div>

            {/* Riel Horizontal de Talles AR (Limpios y en una sola fila táctil con scroll snap) */}
            {irConFiltroDirecto && (
              <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 shrink-0">
                  👟 Talles (AR):
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-1">
                  {TALLES_HERO.map((talle) => (
                    <button
                      key={talle}
                      type="button"
                      onClick={() => irConFiltroDirecto("talle", talle)}
                      className="h-8 min-w-8 px-2 rounded-md border border-white/15 bg-white/5 hover:bg-[#FF4500] hover:border-[#FF4500] text-xs font-bold text-white transition-all tabular-nums touch-manipulation cursor-pointer shrink-0"
                    >
                      {talle}
                    </button>
                  ))}
                </div>
                <Link
                  href="/comparador"
                  className="text-[11px] font-bold text-[#FF5500] hover:underline shrink-0 ml-1"
                >
                  Ver todo →
                </Link>
              </div>
            )}
          </div>

          {/* Accesos rápidos de alto valor (Explorar Catálogo) */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Link
              href="/comparador"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#111] hover:bg-white/90 text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all active:scale-95 shadow-lg touch-manipulation"
            >
              <span>Ver Catálogo Completo</span>
              <span aria-hidden="true">→</span>
            </Link>

            <Link
              href="/comparador?descuento=50"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all active:scale-95 touch-manipulation"
            >
              <span>🔥 +50% OFF</span>
            </Link>

            <Link
              href="/comparador?categoria=Zapatillas"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all active:scale-95 touch-manipulation"
            >
              <span>👟 Solo Zapatillas</span>
            </Link>

            <Link
              href="/comparador?categoria=Botines"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all active:scale-95 touch-manipulation"
            >
              <span>⚽ Botines</span>
            </Link>
          </div>
        </div>

        {/* Tarjeta Oferta Bomba (Rediseño limpio y editorial) */}
        {ofertaDestacada && (
          <div className="relative min-w-0">
            <Link
              href={`/producto/${ofertaDestacada.id}`}
              prefetch={false}
              className="group block overflow-hidden rounded-2xl border border-white/15 bg-white text-[#111] shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-orange-500/10 active:scale-[0.99] touch-manipulation"
            >
              <div className="flex items-center justify-between gap-2 bg-[#111] px-4 py-2.5 border-b border-black">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#fbbf24]">
                  <span>⚡ OFERTA DESTACADA</span>
                </span>
                <div className="h-5 shrink-0 scale-90">
                  <StoreLogo storeName={ofertaDestacada.storeName} />
                </div>
              </div>

              <div className="grid grid-cols-[130px_minmax(0,1fr)] sm:grid-cols-[160px_minmax(0,1fr)] lg:block">
                <div className="relative aspect-square lg:aspect-[4/3] overflow-hidden bg-[#F5F7F6] border-r lg:border-r-0 lg:border-b border-black/10">
                  <ProductImage
                    src={ofertaDestacada.imageUrl}
                    alt={ofertaDestacada.name}
                    priority
                    sizes="(max-width: 640px) 140px, 420px"
                    className="object-cover mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105 p-3"
                  />
                  <span
                    className={`absolute left-2.5 top-2.5 rounded-lg px-2.5 py-1 text-xs sm:text-sm font-black tabular-nums shadow-sm ${
                      esSuperAhorro
                        ? "bg-[#FF4500] text-white"
                        : "bg-[#10b981] text-white"
                    }`}
                  >
                    -{formatearPorcentaje(ofertaDestacada.discount)}
                  </span>
                </div>

                <div className="p-3 sm:p-4.5 flex flex-col justify-between gap-2.5 min-w-0">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-black/50">
                      {ofertaDestacada.brand}
                    </span>
                    <h2 className="line-clamp-2 text-sm sm:text-base font-extrabold leading-snug text-[#111] group-hover:text-[#FF4500] transition-colors mt-0.5">
                      {ofertaDestacada.name}
                    </h2>
                  </div>

                  <div className="space-y-1 pt-1.5 border-t border-black/8">
                    <div className="flex flex-wrap items-baseline gap-x-2 tabular-nums">
                      <p className="text-xl sm:text-2xl font-black text-[#111]">
                        {formatearPrecio(ofertaDestacada.price)}
                      </p>
                      <p className="text-xs font-semibold text-black/45 line-through">
                        {formatearPrecio(ofertaDestacada.listPrice)}
                      </p>
                    </div>

                    <p className="text-xs font-bold text-[#059669] tabular-nums">
                      Ahorrás {formatearPrecio(calcularAhorro(ofertaDestacada))}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-dashed border-black/8">
                    <span className="text-[11px] font-semibold text-black/60 truncate">
                      {ofertaDestacada.sizes?.length ? `Talles: ${ofertaDestacada.sizes.slice(0, 3).join(", ")}...` : "Stock disponible"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-[#111] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider group-hover:bg-[#FF4500] transition-colors shrink-0">
                      Ver Oferta →
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
