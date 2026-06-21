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
    <section className="hero relative overflow-hidden border-b-2 border-[#111] bg-[#FF4500] pt-12 pb-14 text-white sm:pt-16 sm:pb-20 lg:pt-24 lg:pb-32">
      <div className="contenedor grid gap-10 lg:grid-cols-[1fr_400px] lg:items-center">
        <div className="hero__contenido max-w-5xl space-y-8 sm:space-y-12">
          <div className="inline-flex items-center gap-2 border-2 border-[#111] bg-white px-3.5 py-1 text-xs font-black uppercase tracking-widest text-[#111] shadow-[4px_4px_0px_#111]">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4500] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF4500] border border-[#111]"></span>
            </span>
            Tracker de Ofertas
          </div>

          <h1 className="max-w-4xl text-[3.5rem] font-black leading-[0.85] sm:text-[5rem] lg:text-[7rem] font-titulos tracking-tighter text-white uppercase">
            Cazá las mejores <br/>
            <span className="text-[#111] bg-white px-2 inline-block -rotate-2 border-2 border-[#111] shadow-[8px_8px_0px_#111]">ofertas.</span>
          </h1>

          <p className="max-w-2xl text-lg font-black leading-relaxed text-white sm:text-2xl font-cuerpo uppercase tracking-tight">
            Busca tu modelo preferido, filtra y compara precios al instante sin abrir decenas de pestañas.
          </p>
          <form
            className="border-2 border-[#111] bg-white p-2 sm:p-3 shadow-[8px_8px_0px_#111] transition-all duration-300"
            onSubmit={(evento) => {
              evento.preventDefault();
              alEnviarBusqueda();
            }}
          >
            <label htmlFor="busqueda-hero" className="sr-only">
              Buscar zapatillas
            </label>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="relative flex items-center w-full">
                <input
                  id="busqueda-hero"
                  type="search"
                  value={terminoBusqueda}
                  onChange={(evento) => alCambiarBusqueda(evento.target.value)}
                  placeholder="Ej: NIKE AIR FORCE..."
                  className="min-h-16 border-2 border-[#111] bg-[#f9f9f9] px-6 text-xl font-black text-[#111] outline-none placeholder:text-black/30 focus:bg-white focus:shadow-[4px_4px_0px_#FF4500] transition-all duration-250 w-full uppercase"
                />
              </div>
              <button
                type="submit"
                className="min-h-16 px-10 border-2 border-[#111] font-black uppercase tracking-widest bg-[#111] text-white shadow-[4px_4px_0px_#FF4500] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#FF4500] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-200"
              >
                Buscar
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-3 items-center text-sm">
            <span className="font-black uppercase tracking-widest text-white/80 mr-1">Populares:</span>
            {busquedasSugeridas.map((sugerencia) => (
              <button
                key={sugerencia}
                type="button"
                className="shrink-0 border-2 border-[#111] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#111] transition-all duration-200 hover:bg-[#111] hover:text-white shadow-[2px_2px_0px_#111] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none cursor-pointer"
                onClick={() => buscarSugerencia(sugerencia)}
              >
                {sugerencia}
              </button>
            ))}
          </div>

          <div className="grid max-w-2xl grid-cols-3 divide-x-2 divide-[#111] border-2 border-[#111] bg-white py-2 shadow-[6px_6px_0px_#111]">
            <div className="p-4 text-center sm:text-left sm:pl-6 group">
              <p className="text-4xl sm:text-5xl font-black font-mono text-[#111] group-hover:text-[#FF4500] transition-colors duration-300 tracking-tighter">
                {cantidadProductos}
              </p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-black/50">Zapatillas</p>
            </div>
            <div className="p-4 text-center sm:text-left sm:pl-6 group">
              <p className="text-4xl sm:text-5xl font-black font-mono text-[#111] group-hover:text-[#FF4500] transition-colors duration-300 tracking-tighter">
                {cantidadMarcas}
              </p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-black/50">Marcas</p>
            </div>
            <div className="p-4 text-center sm:text-left sm:pl-6 group">
              <p className="text-3xl font-black font-titulos text-[#111] group-hover:text-[#FF4500] transition-colors duration-300">
                {cantidadTiendas}
              </p>
              <p className="mt-1 text-[10px] font-extrabold uppercase tracking-widest text-black/40">Tiendas</p>
            </div>
          </div>
        </div>

        {ofertaDestacada ? (
          <div className="relative group perspective-1000">
            {/* Sombra proyectada para efecto 3D */}
            <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-r from-[#FF4500]/20 to-[#0055FF]/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <Link
              href={`/producto/${ofertaDestacada.id}`}
              className={`hero__oferta relative block overflow-hidden rounded-[30px] border bg-white text-[#111] shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-4 hover:rotate-2 hover:scale-[1.02] ${
                esSuperAhorro
                  ? "border-[#FF4500]/20"
                  : "border-black/5"
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F5F0]">
                <ProductImage
                  src={ofertaDestacada.imageUrl}
                  alt={ofertaDestacada.name}
                  priority
                  sizes="(max-width: 1024px) 100vw, 400px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08] group-hover:-rotate-3"
                />
                <span
                  className={`absolute left-4 top-4 rounded-[16px] px-3.5 py-2 text-xl font-black shadow-lg animate-bounce ${
                    esSuperAhorro
                      ? "bg-[#FF4500] text-white"
                      : "bg-[#111111] text-white"
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
                        ? "bg-[#FF4500]/10 text-[#FF4500] border border-[#FF4500]/20"
                        : "bg-black/5 text-black/60 border border-black/10"
                    }`}
                  >
                    {esSuperAhorro ? "Súper ahorro destacado" : "Oferta destacada"}
                  </span>
                  <StoreLogo storeName={ofertaDestacada.storeName} />
                </div>
                <h2 className="line-clamp-2 text-lg font-bold font-titulos leading-tight group-hover:text-[#FF4500] transition-colors duration-200">
                  {ofertaDestacada.name}
                </h2>
                <div className="pt-2 flex items-end justify-between gap-3 border-t border-black/5">
                  <div>
                    <p className="text-3xl font-black font-titulos text-[#111]">
                      {formatearPrecio(ofertaDestacada.price)}
                    </p>
                    <p className="text-sm font-semibold text-black/40 line-through">
                      {formatearPrecio(ofertaDestacada.listPrice)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold shadow-sm ${
                      esSuperAhorro
                        ? "bg-[#FF4500] text-white"
                        : "bg-black text-white"
                    }`}
                  >
                    Ahorra {formatearPrecio(calcularAhorro(ofertaDestacada))}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
