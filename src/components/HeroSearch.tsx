"use client";

import Link from "next/link";

import { ProductImage } from "@/components/ProductImage";
import {
  calcularAhorro,
  formatearPorcentaje,
  formatearPrecio,
} from "@/lib/formato";
import type { Producto } from "@/types/producto";

interface HeroSearchProps {
  terminoBusqueda: string;
  alCambiarBusqueda: (valor: string) => void;
  alEnviarBusqueda: () => void;
  cantidadProductos: number;
  cantidadMarcas: number;
  cantidadTiendas: number;
  ofertaDestacada: Producto | null;
}

const busquedasSugeridas = ["Air Force", "Campus", "Suede", "Dunk", "Gel"];

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
    alEnviarBusqueda();
  }

  const esSuperAhorro = ofertaDestacada && ofertaDestacada.discount >= 50;

  return (
    <section className="hero relative overflow-hidden border-b border-white/10 bg-[#070b08] pt-12 pb-14 text-white sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
      {/* Brillos ambientales de fondo premium */}
      <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#10b981]/15 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#059669]/8 to-transparent blur-[110px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -z-10 h-[300px] w-[300px] rounded-full bg-[#34d399]/5 blur-[90px] pointer-events-none" />

      <div className="contenedor grid gap-10 lg:grid-cols-[1fr_400px] lg:items-center">
        <div className="hero__contenido max-w-4xl space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#10b981]/30 bg-[#10b981]/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#34d399]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34d399] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
            </span>
            Comparador de ofertas en tiempo real
          </div>

          <h1 className="max-w-3xl text-[2.85rem] font-black leading-[0.92] sm:text-6xl lg:text-7xl font-titulos tracking-tight bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
            Encontrar la mejor oferta tiene que ser{" "}
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#059669] filter drop-shadow-[0_2px_10px_rgba(16,185,129,0.15)]">
              rápido.
              <span className="absolute bottom-1 left-0 -z-10 h-[8px] w-full -skew-x-12 rounded-full bg-[#10b981]/25"></span>
            </span>
          </h1>

          <p className="max-w-2xl text-base font-medium leading-relaxed text-white/70 sm:text-lg font-cuerpo">
            Busca tu modelo preferido, filtra por marca o talle y compara precios al instante sin abrir decenas de pestañas. Encuentra zapatillas en oferta al mejor precio del mercado.
          </p>

          <form
            className="rounded-[24px] border border-white/10 bg-white/[0.02] p-2 backdrop-blur-xl shadow-[0_24px_50px_rgba(0,0,0,0.6)] focus-within:border-[#10b981]/50 focus-within:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-300"
            onSubmit={(evento) => {
              evento.preventDefault();
              alEnviarBusqueda();
            }}
          >
            <label htmlFor="busqueda-hero" className="sr-only">
              Buscar zapatillas
            </label>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="relative flex items-center w-full">
                <svg
                  className="absolute left-4.5 h-5 w-5 text-white/30"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
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
                  placeholder="Nike Air Force, Adidas Campus, Puma Suede..."
                  className="min-h-14 rounded-[18px] border-0 bg-white/[0.03] pl-12 pr-5 text-base font-semibold text-white outline-none placeholder:text-white/40 focus:bg-white/[0.06] transition-all duration-250 w-full"
                />
              </div>
              <button
                type="submit"
                className="boton boton--acento min-h-14 px-8 rounded-[18px] font-black uppercase tracking-wider shadow-lg shadow-[#10b981]/15 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
              >
                Buscar ofertas
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-2 items-center text-sm">
            <span className="font-bold text-white/40 mr-1">Sugerencias:</span>
            {busquedasSugeridas.map((sugerencia) => (
              <button
                key={sugerencia}
                type="button"
                className="shrink-0 rounded-full border border-white/5 bg-white/[0.03] px-4 py-1.5 text-xs font-bold text-white/70 transition-all duration-200 hover:bg-[#10b981]/10 hover:border-[#10b981]/30 hover:text-[#34d399] active:scale-95 cursor-pointer"
                onClick={() => buscarSugerencia(sugerencia)}
              >
                {sugerencia}
              </button>
            ))}
          </div>

          <div className="grid max-w-2xl grid-cols-3 divide-x divide-white/5 rounded-[24px] border border-white/10 bg-white/[0.01] backdrop-blur-md py-2 shadow-inner">
            <div className="p-4 text-center sm:text-left sm:pl-6 group">
              <p className="text-3xl font-black font-titulos text-white group-hover:text-[#34d399] transition-colors duration-300">
                {cantidadProductos}
              </p>
              <p className="mt-1 text-[10px] font-extrabold uppercase tracking-widest text-white/40">Zapatillas</p>
            </div>
            <div className="p-4 text-center sm:text-left sm:pl-6 group">
              <p className="text-3xl font-black font-titulos text-white group-hover:text-[#34d399] transition-colors duration-300">
                {cantidadMarcas}
              </p>
              <p className="mt-1 text-[10px] font-extrabold uppercase tracking-widest text-white/40">Marcas</p>
            </div>
            <div className="p-4 text-center sm:text-left sm:pl-6 group">
              <p className="text-3xl font-black font-titulos text-white group-hover:text-[#34d399] transition-colors duration-300">
                {cantidadTiendas}
              </p>
              <p className="mt-1 text-[10px] font-extrabold uppercase tracking-widest text-white/40">Tiendas</p>
            </div>
          </div>
        </div>

        {ofertaDestacada ? (
          <Link
            href={`/producto/${ofertaDestacada.id}`}
            className={`hero__oferta group relative block overflow-hidden rounded-[30px] border bg-[#0d120f]/80 text-white transition-all duration-300 hover:-translate-y-2.5 ${
              esSuperAhorro
                ? "border-[#d4af37]/25 hover:border-[#d4af37]/65 hover:shadow-[0_30px_60px_-15px_rgba(212,175,55,0.22)]"
                : "border-white/10 hover:border-[#10b981]/50 hover:shadow-[0_30px_60px_-15px_rgba(16,185,129,0.25)]"
            }`}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[#121915]">
              <ProductImage
                src={ofertaDestacada.imageUrl}
                alt={ofertaDestacada.name}
                priority
                sizes="(max-width: 1024px) 100vw, 400px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <span
                className={`absolute left-4 top-4 rounded-[16px] px-3.5 py-2 text-xl font-black shadow-lg animate-pulse ${
                  esSuperAhorro
                    ? "bg-gradient-to-br from-[#d4af37] to-[#b45309] text-white"
                    : "bg-gradient-to-br from-[#f43f5e] to-[#be123c] text-white"
                }`}
              >
                -{formatearPorcentaje(ofertaDestacada.discount)}
              </span>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                    esSuperAhorro
                      ? "bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20"
                      : "bg-[#10b981]/10 text-[#34d399] border border-[#10b981]/20"
                  }`}
                >
                  {esSuperAhorro ? "Súper ahorro destacado" : "Oferta destacada"}
                </span>
                <span className="text-xs font-bold text-white/50 bg-white/5 px-2.5 py-1 rounded-md">
                  {ofertaDestacada.storeName}
                </span>
              </div>
              <h2 className="line-clamp-2 text-lg font-bold font-titulos leading-tight group-hover:text-[#34d399] transition-colors duration-200">
                {ofertaDestacada.name}
              </h2>
              <div className="pt-2 flex items-end justify-between gap-3 border-t border-white/5">
                <div>
                  <p className="text-3xl font-black font-titulos text-white">
                    {formatearPrecio(ofertaDestacada.price)}
                  </p>
                  <p className="text-sm font-semibold text-white/40 line-through">
                    {formatearPrecio(ofertaDestacada.listPrice)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold shadow ${
                    esSuperAhorro
                      ? "bg-[#d4af37]/10 text-[#d4af37]"
                      : "bg-[#10b981]/10 text-[#34d399]"
                  }`}
                >
                  Ahorra {formatearPrecio(calcularAhorro(ofertaDestacada))}
                </span>
              </div>
            </div>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
