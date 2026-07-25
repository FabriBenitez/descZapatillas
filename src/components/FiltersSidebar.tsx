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
    <label className="grid gap-2 text-[10px] font-black text-black/50 uppercase tracking-widest">
      <span>{etiqueta}</span>
      <select
        value={valor}
        onChange={(evento) => alCambiarFiltro(id, evento.target.value)}
        className={`w-full text-xs font-black text-[#111] border-2 border-[#111] px-3 py-2 rounded-[4px] shadow-[2px_2px_0px_#111] focus:outline-none focus:ring-0 focus:border-[#FF4500] focus:shadow-[2px_2px_0px_#FF4500] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[4px_4px_0px_#111] focus:-translate-y-0.5 focus:-translate-x-0.5 transition-all cursor-pointer appearance-none ${
          valor ? "bg-[#bbf7d0] border-[#10b981] shadow-[2px_2px_0px_#10b981]" : "bg-white"
        }`}
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
    <section className="border-t-2 border-[#111]/10 py-4 first:border-t-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left group"
        onClick={() => setAbierto((valorActual) => !valorActual)}
      >
        <span className="text-sm font-black uppercase tracking-widest text-[#111] group-hover:text-[#FF4500] transition-colors duration-200">
          {titulo}
        </span>
        <ChevronIcon className={`text-[#111] transition-transform duration-300 ${abierto ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid gap-4 transition-all duration-300 ${abierto ? "mt-4 opacity-100 h-auto visible" : "h-0 opacity-0 invisible overflow-hidden"}`}>
        {children}
      </div>
    </section>
  );
}

// Subcategorías disponibles para cada categoría principal
const SUBCATS_ZAPATILLAS = ["Running", "Training", "Basketball", "Tenis", "Fútbol Sala", "Outdoor", "Skate", "Lifestyle"];
const SUBCATS_BOTINES = ["Campo", "Sala", "Sintético"];

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

  const subcatsDisponibles =
    filtros.categoria === "Botines" ? SUBCATS_BOTINES :
    filtros.categoria === "Zapatillas" ? SUBCATS_ZAPATILLAS :
    // Sin categoría seleccionada → mostrar las que existen en DB
    opciones.subcategorias;

  const handleCategoriaToggle = (cat: string) => {
    if (filtros.categoria === cat) {
      // Deseleccionar: limpiar categoría y subcategoría
      alCambiarFiltro("categoria", "");
      alCambiarFiltro("subcategoria", "");
    } else {
      alCambiarFiltro("categoria", cat);
      alCambiarFiltro("subcategoria", ""); // Resetear subcategoría al cambiar categoría
    }
  };

  const handleSubcatToggle = (subcat: string) => {
    if (filtros.subcategoria === subcat) {
      alCambiarFiltro("subcategoria", "");
    } else {
      alCambiarFiltro("subcategoria", subcat);
    }
  };

  const contenidoFiltros = (
    <>
      <div className="border-2 border-[#111] bg-[#fbbf24] px-4 py-2.5 mb-5 shadow-[2px_2px_0px_#111] flex justify-between items-center">
        <span className="text-xs font-black uppercase tracking-wider text-[#111]">Filtros de búsqueda</span>
        <button
          type="button"
          className="text-[9px] font-black uppercase tracking-widest text-[#111] hover:underline"
          onClick={alLimpiarFiltros}
        >
          Limpiar todo
        </button>
      </div>

      <div className="hidden pb-6 md:block">
        <SortSelect valor={ordenSeleccionado} alCambiar={alCambiarOrden} />
      </div>

      <div className="grid gap-4">

        {/* ── CATEGORÍA: Zapatillas / Botines ── */}
        <GrupoPlegable titulo="Categoría">
          <div className="grid grid-cols-2 gap-2">
            {["Zapatillas", "Botines"].map((cat) => {
              const activa = filtros.categoria === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoriaToggle(cat)}
                  className={`py-2.5 px-3 text-xs font-black uppercase tracking-widest rounded-[4px] border-2 transition-all duration-200 shadow-[2px_2px_0px_#111] active:translate-y-0.5 active:shadow-[0px_0px_0px_#111] ${
                    activa
                      ? "bg-[#FF4500] text-white border-[#FF4500] shadow-[2px_2px_0px_#c43500]"
                      : "bg-white text-[#111] border-[#111] hover:bg-[#111] hover:text-white"
                  }`}
                >
                  {cat === "Zapatillas" ? "👟 Zapatillas" : "⚽ Botines"}
                </button>
              );
            })}
          </div>

          {/* Subcategorías — aparecen solo cuando hay una categoría seleccionada o hay opciones */}
          {subcatsDisponibles.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-black/50 uppercase tracking-widest mb-2">
                {filtros.categoria === "Botines" ? "Tipo de terreno" : "Deporte / Uso"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {subcatsDisponibles.map((sub) => {
                  const activa = filtros.subcategoria === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => handleSubcatToggle(sub)}
                      className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border-2 transition-all duration-150 ${
                        activa
                          ? "bg-[#111] text-white border-[#111]"
                          : "bg-white text-[#111] border-[#111]/40 hover:border-[#111]"
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </GrupoPlegable>

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
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-2 text-[10px] font-black text-black/50 uppercase tracking-widest">
              <span>Mínimo</span>
              <input
                type="number"
                value={filtros.precioMinimo}
                onChange={(evento) =>
                  alCambiarFiltro("precioMinimo", evento.target.value)
                }
                placeholder="Min ($)"
                className={`w-full text-xs font-black text-[#111] border-2 border-[#111] px-3 py-2 rounded-[4px] shadow-[2px_2px_0px_#111] focus:outline-none focus:ring-0 focus:border-[#FF4500] focus:shadow-[2px_2px_0px_#FF4500] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[4px_4px_0px_#111] focus:-translate-y-0.5 focus:-translate-x-0.5 transition-all ${
                  filtros.precioMinimo ? "bg-[#bbf7d0] border-[#10b981] shadow-[2px_2px_0px_#10b981]" : "bg-white"
                }`}
              />
            </label>
            <label className="grid gap-2 text-[10px] font-black text-black/50 uppercase tracking-widest">
              <span>Máximo</span>
              <input
                type="number"
                value={filtros.precioMaximo}
                onChange={(evento) =>
                  alCambiarFiltro("precioMaximo", evento.target.value)
                }
                placeholder="Max ($)"
                className={`w-full text-xs font-black text-[#111] border-2 border-[#111] px-3 py-2 rounded-[4px] shadow-[2px_2px_0px_#111] focus:outline-none focus:ring-0 focus:border-[#FF4500] focus:shadow-[2px_2px_0px_#FF4500] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[4px_4px_0px_#111] focus:-translate-y-0.5 focus:-translate-x-0.5 transition-all ${
                  filtros.precioMaximo ? "bg-[#bbf7d0] border-[#10b981] shadow-[2px_2px_0px_#10b981]" : "bg-white"
                }`}
              />
            </label>
          </div>
          <label className="grid gap-2 text-[10px] font-black text-black/50 uppercase tracking-widest mt-4">
            <span>Descuento mínimo (%)</span>
            <input
              type="number"
              value={filtros.descuentoMinimo}
              onChange={(evento) =>
                alCambiarFiltro("descuentoMinimo", evento.target.value)
              }
              placeholder="Ej. 20%"
              className={`w-full text-xs font-black text-[#111] border-2 border-[#111] px-3 py-2 rounded-[4px] shadow-[2px_2px_0px_#111] focus:outline-none focus:ring-0 focus:border-[#FF4500] focus:shadow-[2px_2px_0px_#FF4500] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[4px_4px_0px_#111] focus:-translate-y-0.5 focus:-translate-x-0.5 transition-all ${
                filtros.descuentoMinimo ? "bg-[#bbf7d0] border-[#10b981] shadow-[2px_2px_0px_#10b981]" : "bg-white"
              }`}
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
      </div>
    </>
  );

  return (
    <aside className="filtros lg:sticky lg:top-[116px] lg:self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="bg-white border-2 border-[#111] p-5 sm:p-6 rounded-[8px] shadow-[6px_6px_0px_#111]">
        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            className="bg-white border-2 border-[#111] min-h-10 px-4 py-2 text-xs font-black rounded-[4px] uppercase tracking-widest whitespace-nowrap shadow-[2px_2px_0px_#111] active:translate-y-0.5 active:translate-x-0.5 active:shadow-[0px_0px_0px_#111] transition-all"
            onClick={() => setFiltrosAbiertos((valorActual) => !valorActual)}
          >
            {filtrosAbiertos ? "Cerrar" : "Filtrar"}
          </button>
          <div className="flex-1 min-w-0">
            <SortSelect valor={ordenSeleccionado} alCambiar={alCambiarOrden} ocultarEtiqueta={true} />
          </div>
        </div>

        <div className={`${filtrosAbiertos ? "mt-6 block animate-fade-in" : "hidden"} md:block`}>
          {contenidoFiltros}
          <button
            type="button"
            className="mt-6 w-full rounded-[4px] border-2 border-[#111] bg-white px-4 py-3.5 text-xs font-black uppercase tracking-widest text-[#111] transition hover:bg-[#111] hover:text-white md:hidden shadow-[2px_2px_0px_#111]"
            onClick={alLimpiarFiltros}
          >
            Restablecer filtros
          </button>
        </div>
      </div>
    </aside>
  );
}
