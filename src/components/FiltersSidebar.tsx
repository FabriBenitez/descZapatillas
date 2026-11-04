"use client";

import { type ReactNode, useState, useEffect } from "react";

import type { OpcionesFiltros } from "@/lib/comparador";
import type { FiltrosProductos, OrdenProductos } from "@/types/producto";
import { SortSelect } from "@/components/SortSelect";

interface FiltersSidebarProps {
  filtros: FiltrosProductos;
  opciones: OpcionesFiltros;
  totalResultados?: number;
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

const MARCAS_DESTACADAS = [
  "Nike",
  "Adidas",
  "Puma",
  "New Balance",
  "Vans",
  "Topper",
  "Asics",
  "Converse",
];

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
    <label className="grid gap-1.5 text-[10px] font-black text-black/50 uppercase tracking-widest">
      <span>{etiqueta}</span>
      <select
        value={valor}
        onChange={(evento) => alCambiarFiltro(id, evento.target.value)}
        className={`w-full text-xs font-black text-[#111] border-2 border-[#111] px-3 py-2.5 rounded-[4px] shadow-[2px_2px_0px_#111] focus:outline-none focus:ring-0 focus:border-[#FF4500] focus:shadow-[2px_2px_0px_#FF4500] transition-all cursor-pointer appearance-none ${
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
  badge,
  children,
  abiertoInicial = true,
}: {
  titulo: string;
  badge?: string;
  children: ReactNode;
  abiertoInicial?: boolean;
}) {
  const [abierto, setAbierto] = useState(abiertoInicial);

  return (
    <section className="border-t-2 border-[#111]/10 py-3.5 first:border-t-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left group"
        onClick={() => setAbierto((valorActual) => !valorActual)}
      >
        <span className="flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest text-[#111] group-hover:text-[#FF4500] transition-colors duration-200">
          <span>{titulo}</span>
          {badge && (
            <span className="bg-[#FF4500] text-white border border-[#111] rounded px-1.5 py-0.5 text-[9px] font-black leading-none">
              {badge}
            </span>
          )}
        </span>
        <ChevronIcon className={`text-[#111] transition-transform duration-300 ${abierto ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid gap-3.5 transition-all duration-300 ${abierto ? "mt-3.5 opacity-100 h-auto visible" : "h-0 opacity-0 invisible overflow-hidden"}`}>
        {children}
      </div>
    </section>
  );
}

export function FiltersSidebar({
  filtros,
  opciones,
  totalResultados,
  alCambiarFiltro,
  alLimpiarFiltros,
  ordenSeleccionado,
  alCambiarOrden,
}: FiltersSidebarProps) {
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  // Bloquear scroll de fondo cuando el drawer mobile está abierto
  useEffect(() => {
    if (filtrosAbiertos) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [filtrosAbiertos]);

  const handleCategoriaToggle = (cat: string) => {
    if (filtros.categoria === cat) {
      alCambiarFiltro("categoria", "");
    } else {
      alCambiarFiltro("categoria", cat);
    }
  };

  const cantidadFiltrosActivos = Object.entries(filtros).filter(
    ([key, value]) => key !== "soloStock" && value !== "" && value !== false,
  ).length;

  const marcasPopularesDisponibles = MARCAS_DESTACADAS.filter((m) =>
    opciones.marcas.includes(m),
  );

  const contenidoFiltros = (
    <div className="grid gap-1">
      {/* ── CATEGORÍA: Zapatillas / Botines ── */}
      <GrupoPlegable titulo="Categoría" badge={filtros.categoria || undefined}>
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
                    ? "bg-[#FF4500] text-white border-[#111] shadow-[2px_2px_0px_#111]"
                    : "bg-white text-[#111] border-[#111] hover:bg-[#111] hover:text-white"
                }`}
              >
                {cat === "Zapatillas" ? "👟 Zapatillas" : "⚽ Botines"}
              </button>
            );
          })}
        </div>
      </GrupoPlegable>

      {/* ── TALLE (Grilla táctil de botones) ── */}
      <GrupoPlegable titulo="Talle (AR)" badge={filtros.talle || undefined}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-black/50 uppercase tracking-widest">
            Tocá tu talle
          </span>
          {filtros.talle && (
            <button
              type="button"
              onClick={() => alCambiarFiltro("talle", "")}
              className="text-[10px] font-black uppercase text-[#FF4500] hover:underline"
            >
              Quitar talle ({filtros.talle})
            </button>
          )}
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-4 gap-1.5 max-h-52 overflow-y-auto pr-1 py-0.5">
          {opciones.talles.map((talle) => {
            const activo = filtros.talle === talle;
            return (
              <button
                key={talle}
                type="button"
                onClick={() => alCambiarFiltro("talle", activo ? "" : talle)}
                className={`min-h-9 py-1.5 px-1 text-center text-[11px] font-black rounded-[4px] border-2 transition-all cursor-pointer ${
                  activo
                    ? "bg-[#FF4500] text-white border-[#111] shadow-[2px_2px_0px_#111]"
                    : "bg-white text-[#111] border-[#111] hover:bg-[#111] hover:text-white shadow-[1px_1px_0px_#111]"
                }`}
              >
                {talle}
              </button>
            );
          })}
        </div>
      </GrupoPlegable>

      {/* ── MARCA Y TIENDA ── */}
      <GrupoPlegable
        titulo="Marca y tienda"
        badge={filtros.marca || filtros.tienda || undefined}
      >
        {marcasPopularesDisponibles.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {marcasPopularesDisponibles.map((marca) => {
              const activa = filtros.marca === marca;
              return (
                <button
                  key={marca}
                  type="button"
                  onClick={() => alCambiarFiltro("marca", activa ? "" : marca)}
                  className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-[4px] border-2 border-[#111] transition-all ${
                    activa
                      ? "bg-[#fbbf24] text-[#111] shadow-[2px_2px_0px_#111]"
                      : "bg-[#f5f7f6] text-[#111] hover:bg-[#fbbf24]/50"
                  }`}
                >
                  {marca}
                </button>
              );
            })}
          </div>
        )}
        <GrupoSelect
          id="marca"
          etiqueta="Todas las marcas"
          valor={filtros.marca}
          opciones={opciones.marcas}
          placeholder="Ver todas las marcas..."
          alCambiarFiltro={alCambiarFiltro}
        />
        <GrupoSelect
          id="tienda"
          etiqueta="Tienda oficial"
          valor={filtros.tienda}
          opciones={opciones.tiendas}
          placeholder="Todas las tiendas"
          alCambiarFiltro={alCambiarFiltro}
        />
      </GrupoPlegable>

      {/* ── PRECIO Y DESCUENTO ── */}
      <GrupoPlegable
        titulo="Precio y descuento"
        badge={filtros.descuentoMinimo ? `+${filtros.descuentoMinimo}%` : undefined}
      >
        <div className="grid gap-2">
          <span className="text-[10px] font-black text-black/50 uppercase tracking-widest">
            Rebaja destacada
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "🔥 +50% OFF", valor: "50" },
              { label: "⚡ +40% OFF", valor: "40" },
              { label: "✨ +30% OFF", valor: "30" },
              { label: "💥 +20% OFF", valor: "20" },
            ].map((pill) => {
              const activo = filtros.descuentoMinimo === pill.valor;
              return (
                <button
                  key={pill.valor}
                  type="button"
                  onClick={() =>
                    alCambiarFiltro(
                      "descuentoMinimo",
                      activo ? "" : pill.valor,
                    )
                  }
                  className={`py-2 px-2.5 text-center text-[11px] font-black uppercase tracking-wider rounded-[4px] border-2 transition-all duration-200 shadow-[2px_2px_0px_#111] active:translate-y-0.5 active:shadow-[0px_0px_0px_#111] ${
                    activo
                      ? "bg-[#FF4500] text-white border-[#111] shadow-[2px_2px_0px_#111]"
                      : "bg-white text-[#111] border-[#111] hover:bg-[#111] hover:text-white"
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-1">
          <label className="grid gap-1.5 text-[10px] font-black text-black/50 uppercase tracking-widest">
            <span>Mínimo ($)</span>
            <input
              type="number"
              value={filtros.precioMinimo}
              onChange={(evento) =>
                alCambiarFiltro("precioMinimo", evento.target.value)
              }
              placeholder="Min ($)"
              className={`w-full text-xs font-black text-[#111] border-2 border-[#111] px-3 py-2 rounded-[4px] shadow-[2px_2px_0px_#111] focus:outline-none focus:border-[#FF4500] ${
                filtros.precioMinimo ? "bg-[#bbf7d0] border-[#10b981]" : "bg-white"
              }`}
            />
          </label>
          <label className="grid gap-1.5 text-[10px] font-black text-black/50 uppercase tracking-widest">
            <span>Máximo ($)</span>
            <input
              type="number"
              value={filtros.precioMaximo}
              onChange={(evento) =>
                alCambiarFiltro("precioMaximo", evento.target.value)
              }
              placeholder="Max ($)"
              className={`w-full text-xs font-black text-[#111] border-2 border-[#111] px-3 py-2 rounded-[4px] shadow-[2px_2px_0px_#111] focus:outline-none focus:border-[#FF4500] ${
                filtros.precioMaximo ? "bg-[#bbf7d0] border-[#10b981]" : "bg-white"
              }`}
            />
          </label>
        </div>
      </GrupoPlegable>

      {/* ── GÉNERO ── */}
      <GrupoPlegable titulo="Género" badge={filtros.genero || undefined}>
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
  );

  return (
    <aside className="filtros lg:sticky lg:top-[116px] lg:self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* ── BARRA COMPACTA MOBILE / TABLET (< lg) ── */}
      <div className="lg:hidden space-y-2.5">
        <div className="flex items-center gap-2 bg-white border-2 border-[#111] p-2.5 rounded-[8px] shadow-[4px_4px_0px_#111]">
          <button
            type="button"
            className={`flex items-center gap-2 border-2 border-[#111] min-h-10 px-3.5 py-2 text-xs font-black rounded-[4px] uppercase tracking-widest whitespace-nowrap shadow-[2px_2px_0px_#111] active:translate-y-0.5 active:shadow-none transition-all ${
              cantidadFiltrosActivos > 0
                ? "bg-[#fbbf24] text-[#111]"
                : "bg-white text-[#111]"
            }`}
            onClick={() => setFiltrosAbiertos(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filtrar</span>
            {cantidadFiltrosActivos > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-[#FF4500] text-white border border-[#111] text-[10px] font-black leading-none">
                {cantidadFiltrosActivos}
              </span>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <SortSelect valor={ordenSeleccionado} alCambiar={alCambiarOrden} ocultarEtiqueta={true} />
          </div>
        </div>

        {/* Riel horizontal de filtros rápidos táctiles en mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { label: "👟 Zapatillas", key: "categoria" as const, val: "Zapatillas" },
            { label: "⚽ Botines", key: "categoria" as const, val: "Botines" },
            { label: "🔥 +50% OFF", key: "descuentoMinimo" as const, val: "50" },
            { label: "⚡ +40% OFF", key: "descuentoMinimo" as const, val: "40" },
            { label: "Nike", key: "marca" as const, val: "Nike" },
            { label: "Adidas", key: "marca" as const, val: "Adidas" },
            { label: "Puma", key: "marca" as const, val: "Puma" },
          ].map((chip) => {
            const activo = filtros[chip.key] === chip.val;
            return (
              <button
                key={`${chip.key}-${chip.val}`}
                type="button"
                onClick={() => alCambiarFiltro(chip.key, activo ? "" : chip.val)}
                className={`shrink-0 px-3 py-1.5 rounded-full border-2 border-[#111] text-[11px] font-black uppercase tracking-wider transition-all ${
                  activo
                    ? "bg-[#FF4500] text-white shadow-[2px_2px_0px_#111]"
                    : "bg-white text-[#111] shadow-[1px_1px_0px_#111]"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── DRAWER / BOTTOM SHEET FULLSCREEN MOBILE (< lg) ── */}
      {filtrosAbiertos && (
        <div className="fixed inset-0 z-[70] lg:hidden flex flex-col bg-black/60 backdrop-blur-[1px]">
          <div
            className="flex-1"
            onClick={() => setFiltrosAbiertos(false)}
          />
          <div className="bg-white border-t-4 border-[#111] rounded-t-[16px] max-h-[88vh] flex flex-col shadow-[0px_-8px_0px_#111] animate-fade-in">
            {/* Cabecera fija del Drawer */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-[#111] bg-[#fbbf24] rounded-t-[12px]">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black uppercase tracking-wider text-[#111]">
                  Filtros de búsqueda
                </span>
                {cantidadFiltrosActivos > 0 && (
                  <span className="bg-[#111] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {cantidadFiltrosActivos} activos
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setFiltrosAbiertos(false)}
                className="h-8 w-8 flex items-center justify-center rounded-[4px] border-2 border-[#111] bg-white text-sm font-black text-[#111] shadow-[2px_2px_0px_#111] active:translate-y-0.5"
                aria-label="Cerrar filtros"
              >
                ✕
              </button>
            </div>

            {/* Cuerpo scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {contenidoFiltros}
            </div>

            {/* Pie fijo con CTA de resultados en vivo */}
            <div className="p-4 border-t-2 border-[#111] bg-[#f0f3f1] grid grid-cols-[1fr_2fr] gap-3">
              <button
                type="button"
                onClick={alLimpiarFiltros}
                className="rounded-[6px] border-2 border-[#111] bg-white px-3 py-3 text-xs font-black uppercase tracking-widest text-[#111] shadow-[2px_2px_0px_#111] active:translate-y-0.5"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => setFiltrosAbiertos(false)}
                className="rounded-[6px] border-2 border-[#111] bg-[#FF4500] px-4 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[3px_3px_0px_#111] active:translate-y-0.5"
              >
                {typeof totalResultados === "number"
                  ? `Ver ${totalResultados} ofertas`
                  : "Aplicar filtros"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR DESKTOP (lg+) ── */}
      <div className="hidden lg:block bg-white border-2 border-[#111] p-5 sm:p-6 rounded-[8px] shadow-[6px_6px_0px_#111]">
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

        <div className="pb-4">
          <SortSelect valor={ordenSeleccionado} alCambiar={alCambiarOrden} />
        </div>

        {contenidoFiltros}
      </div>
    </aside>
  );
}
