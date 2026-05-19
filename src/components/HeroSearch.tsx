"use client";

import Image from "next/image";
import Link from "next/link";

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

  return (
    <section className="hero border-b border-[var(--color-linea)] bg-[#f5f6f1] pt-7 pb-8 text-[var(--color-tinta)] sm:pt-10 sm:pb-12">
      <div className="contenedor grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end">
        <div className="hero__contenido max-w-4xl">
          <p className="mb-4 text-sm font-black uppercase text-[var(--color-acento-profundo)]">
            Comparador de ofertas en tiempo real
          </p>
          <h1 className="max-w-3xl text-[2.65rem] font-black leading-[0.98] sm:text-6xl lg:text-7xl">
            Encontrar la mejor oferta tiene que ser rapido.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-[var(--color-muted)] sm:text-lg">
            Busca modelo, marca o tienda y compara precio actual, descuento,
            stock e historial sin abrir veinte pestañas.
          </p>

          <form
            className="mt-7 rounded-[22px] border border-white/10 bg-white p-2 shadow-[0_22px_55px_rgba(0,0,0,0.24)]"
            onSubmit={(evento) => {
              evento.preventDefault();
              alEnviarBusqueda();
            }}
          >
            <label htmlFor="busqueda-hero" className="sr-only">
              Buscar zapatillas
            </label>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <input
                id="busqueda-hero"
                type="search"
                value={terminoBusqueda}
                onChange={(evento) => alCambiarBusqueda(evento.target.value)}
                placeholder="Buscar Nike Air Force, Adidas Campus, Puma Suede..."
                className="min-h-14 rounded-[16px] border-0 bg-[#f4f6f1] px-4 text-base font-semibold text-[#101411] outline-none placeholder:text-[#818a82] focus:bg-white"
              />
              <button type="submit" className="boton boton--acento min-h-14 px-6">
                Buscar ofertas
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {busquedasSugeridas.map((sugerencia) => (
              <button
                key={sugerencia}
                type="button"
                className="chip min-h-9 bg-white px-3 py-1.5 text-xs"
                onClick={() => buscarSugerencia(sugerencia)}
              >
                {sugerencia}
              </button>
            ))}
          </div>

          <div className="mt-7 grid max-w-2xl grid-cols-3 divide-x divide-[var(--color-linea)] rounded-[18px] border border-[var(--color-linea)] bg-white shadow-sm">
            <div className="p-4">
              <p className="text-2xl font-black">{cantidadProductos}</p>
              <p className="mt-1 text-xs font-bold text-[var(--color-muted)]">Productos</p>
            </div>
            <div className="p-4">
              <p className="text-2xl font-black">{cantidadMarcas}</p>
              <p className="mt-1 text-xs font-bold text-[var(--color-muted)]">Marcas</p>
            </div>
            <div className="p-4">
              <p className="text-2xl font-black">{cantidadTiendas}</p>
              <p className="mt-1 text-xs font-bold text-[var(--color-muted)]">Tiendas</p>
            </div>
          </div>
        </div>

        {ofertaDestacada ? (
          <Link
            href={`/producto/${ofertaDestacada.id}`}
            className="hero__oferta group overflow-hidden rounded-[22px] border border-white/12 bg-white text-[#101411] shadow-[0_24px_70px_rgba(0,0,0,0.28)] transition duration-200 hover:-translate-y-1"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[#edf0e9]">
              <Image
                src={ofertaDestacada.imageUrl}
                alt={ofertaDestacada.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 390px"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute left-4 top-4 rounded-[12px] bg-[var(--color-alerta)] px-3 py-2 text-xl font-black text-white shadow-lg">
                -{formatearPorcentaje(ofertaDestacada.discount)}
              </span>
            </div>
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-black uppercase text-[var(--color-acento-profundo)]">
                  Oferta destacada
                </span>
                <span className="text-xs font-bold text-[var(--color-muted)]">
                  {ofertaDestacada.storeName}
                </span>
              </div>
              <h2 className="line-clamp-2 text-xl font-black leading-tight">
                {ofertaDestacada.name}
              </h2>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-3xl font-black">
                    {formatearPrecio(ofertaDestacada.price)}
                  </p>
                  <p className="text-sm font-semibold text-[var(--color-muted)] line-through">
                    {formatearPrecio(ofertaDestacada.listPrice)}
                  </p>
                </div>
                <span className="rounded-full bg-[#eef8f2] px-3 py-2 text-xs font-black text-[var(--color-acento-profundo)]">
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
