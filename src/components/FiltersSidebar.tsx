"use client";

import { type ReactNode, useState } from "react";

import type { OpcionesFiltros } from "@/lib/comparador";
import type { FiltrosProductos, OrdenProductos } from "@/types/producto";
import { SortSelect } from "@/components/SortSelect";

interface FiltersSidebarProps {
  filtros: FiltrosProductos;
  opciones: OpcionesFiltros;
  totalResultados?: never;
  totalProductos?: never;
  estaActualizando: boolean;
  alCambiarFiltro: (
    nombre: keyof FiltrosProductos,
    valor: string | boolean,
  ) => void;
  alLimpiarFiltros: () => void;
  ordenSeleccionado: OrdenProductos;
  alCambiarOrden: (valor: OrdenProductos) => void;
}

interface GrupoSelectProps {
  id: keyof FiltrosProductos;
  etiqueta: string;
  valor: string;
  opciones: string[];
  placeholder: string;
  alCambiarFiltro: (
    nombre: keyof FiltrosProductos,
    valor: string | boolean,
  ) => void;
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={`h-4 w-4 transition-transform duration-250 ${className}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function GrupoSelect({
  id,
  etiqueta,
  valor,
  opciones,
  placeholder,
  alCambiarFiltro,
}: GrupoSelectProps) {
  return (
    <label className="grid gap-1.5 text-xs font-bold text-black/50">
      <span className="uppercase tracking-wider">{etiqueta}</span>
      <select
        value={valor}
        onChange={(evento) => alCambiarFiltro(id, evento.target.value)}
        className="select-base text-sm font-bold text-[#0f1311] border-[#e2e7e4] bg-[#f0f3f1] focus:bg-white transition-all duration-200"
      >
        <option value="">{placeholder}</option>
        {opciones.map((opcion) => (
          <option key={opcion} value={opcion}>
            {opcion}
          </option>
        ))}
      </select>
    </label>
  );
}

function GrupoPlegable({
  titulo,
  children,
  abiertoInicial = true,
}: {
  titulo: string;
  children: ReactNode;
  abiertoInicial?: boolean;
}) {
  const [abierto, setAbierto] = useState(abiertoInicial);

  return (
    <section className="border-t border-[#e2e7e4] py-4 first:border-t-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left group"
        onClick={() => setAbierto((valorActual) => !valorActual)}
      >
        <span className="text-sm font-extrabold uppercase tracking-wider text-[#0f1311] group-hover:text-[#10b981] transition-colors duration-200">
          {titulo}
        </span>
        <ChevronIcon className={`text-black/40 group-hover:text-black ${abierto ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid gap-3 transition-all duration-300 ${abierto ? "mt-4 opacity-100 h-auto visible" : "h-0 opacity-0 invisible overflow-hidden"}`}>
        {children}
      </div>
    </section>
  );
}

export function FiltersSidebar({
  filtros,
  opciones,
  estaActualizando,
  alCambiarFiltro,
  alLimpiarFiltros,
  ordenSeleccionado,
  alCambiarOrden,
}: FiltersSidebarProps) {
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  const contenidoFiltros = (
    <>
        <div className="hidden items-start justify-end gap-4 md:flex pb-4">
        <button
          type="button"
          className="text-xs font-extrabold uppercase tracking-wider text-black/40 transition hover:text-[#f43f5e]"
          onClick={alLimpiarFiltros}
        >
          Limpiar todo
        </button>
      </div>

      <div className="border-b border-[#e2e7e4] pb-4 mb-4">
        <SortSelect valor={ordenSeleccionado} alCambiar={alCambiarOrden} />
      </div>

      <GrupoPlegable titulo="Marca y tienda">
        <GrupoSelect
          id="marca"
          etiqueta="Marca"
          valor={filtros.marca}
          opciones={opciones.marcas}
          placeholder="Todas las marcas"
          alCambiarFiltro={alCambiarFiltro}
        />
        <GrupoSelect
          id="tienda"
          etiqueta="Tienda"
          valor={filtros.tienda}
          opciones={opciones.tiendas}
          placeholder="Todas las tiendas"
          alCambiarFiltro={alCambiarFiltro}
        />

      </GrupoPlegable>

      <GrupoPlegable titulo="Precio y descuento">
        <div className="grid grid-cols-2 gap-2">
          <label className="grid gap-1.5 text-xs font-bold text-black/50">
            <span className="uppercase tracking-wider">Mínimo</span>
            <input
              type="number"
              value={filtros.precioMinimo}
              onChange={(evento) =>
                alCambiarFiltro("precioMinimo", evento.target.value)
              }
              placeholder="Min ($)"
              className="input-base text-sm font-bold text-[#0f1311] border-[#e2e7e4] bg-[#f0f3f1] focus:bg-white transition-all duration-200"
            />
          </label>
          <label className="grid gap-1.5 text-xs font-bold text-black/50">
            <span className="uppercase tracking-wider">Máximo</span>
            <input
              type="number"
              value={filtros.precioMaximo}
              onChange={(evento) =>
                alCambiarFiltro("precioMaximo", evento.target.value)
              }
              placeholder="Max ($)"
              className="input-base text-sm font-bold text-[#0f1311] border-[#e2e7e4] bg-[#f0f3f1] focus:bg-white transition-all duration-200"
            />
          </label>
        </div>
        <label className="grid gap-1.5 text-xs font-bold text-black/50">
          <span className="uppercase tracking-wider">Descuento mínimo (%)</span>
          <input
            type="number"
            value={filtros.descuentoMinimo}
            onChange={(evento) =>
              alCambiarFiltro("descuentoMinimo", evento.target.value)
            }
            placeholder="Ej. 20%"
            className="input-base text-sm font-bold text-[#0f1311] border-[#e2e7e4] bg-[#f0f3f1] focus:bg-white transition-all duration-200"
          />
        </label>
      </GrupoPlegable>

      <GrupoPlegable titulo="Producto">
        <GrupoSelect
          id="talle"
          etiqueta="Talle"
          valor={filtros.talle}
          opciones={opciones.talles}
          placeholder="Todos los talles"
          alCambiarFiltro={alCambiarFiltro}
        />
        <GrupoSelect
          id="categoria"
          etiqueta="Categoría"
          valor={filtros.categoria}
          opciones={opciones.categorias}
          placeholder="Todas las categorías"
          alCambiarFiltro={alCambiarFiltro}
        />
        <GrupoSelect
          id="color"
          etiqueta="Color"
          valor={filtros.color}
          opciones={opciones.colores}
          placeholder="Todos los colores"
          alCambiarFiltro={alCambiarFiltro}
        />
        <GrupoSelect
          id="genero"
          etiqueta="Género"
          valor={filtros.genero}
          opciones={opciones.generos}
          placeholder="Cualquier género"
          alCambiarFiltro={alCambiarFiltro}
        />
      </GrupoPlegable>




    </>
  );

  return (
    <aside className="filtros lg:sticky lg:top-[116px] lg:self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="panel-premium p-5 rounded-[24px]">
        <div className="flex items-center justify-between gap-3 md:hidden">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-black/40">
              Filtros
            </p>
          <button
            type="button"
            className="boton boton--fantasma min-h-10 px-4 py-2 text-xs font-bold rounded-[12px] uppercase tracking-wider"
            onClick={() => setFiltrosAbiertos((valorActual) => !valorActual)}
          >
            {filtrosAbiertos ? "Cerrar" : "Filtrar"}
          </button>
        </div>

        <div className={`${filtrosAbiertos ? "mt-4 block animate-fade-in" : "hidden"} md:block`}>
          {contenidoFiltros}
          <button
            type="button"
            className="mt-4 w-full rounded-[14px] border border-[#e2e7e4] px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-black/40 transition hover:text-black hover:border-black md:hidden"
            onClick={alLimpiarFiltros}
          >
            Restablecer filtros
          </button>
        </div>
      </div>
    </aside>
  );
}
