"use client";

import { type ReactNode, useState } from "react";

import type { OpcionesFiltros } from "@/lib/comparador";
import type { FiltrosProductos } from "@/types/producto";

interface FiltersSidebarProps {
  filtros: FiltrosProductos;
  opciones: OpcionesFiltros;
  totalResultados: number;
  totalProductos: number;
  estaActualizando: boolean;
  alCambiarFiltro: (
    nombre: keyof FiltrosProductos,
    valor: string | boolean,
  ) => void;
  alLimpiarFiltros: () => void;
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

function GrupoSelect({
  id,
  etiqueta,
  valor,
  opciones,
  placeholder,
  alCambiarFiltro,
}: GrupoSelectProps) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-bold text-[var(--color-texto)]">{etiqueta}</span>
      <select
        value={valor}
        onChange={(evento) => alCambiarFiltro(id, evento.target.value)}
        className="select-base text-sm font-semibold"
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
    <section className="border-t border-[var(--color-linea)] py-4">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={() => setAbierto((valorActual) => !valorActual)}
      >
        <span className="text-sm font-black text-[var(--color-tinta)]">
          {titulo}
        </span>
        <span className="text-lg font-black text-[var(--color-muted)]">
          {abierto ? "-" : "+"}
        </span>
      </button>
      {abierto ? <div className="mt-4 grid gap-3">{children}</div> : null}
    </section>
  );
}

export function FiltersSidebar({
  filtros,
  opciones,
  totalResultados,
  totalProductos,
  estaActualizando,
  alCambiarFiltro,
  alLimpiarFiltros,
}: FiltersSidebarProps) {
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  const contenidoFiltros = (
    <>
      <div className="hidden items-start justify-between gap-4 md:flex">
        <div>
          <p className="text-xs font-black uppercase text-[var(--color-muted)]">
            Filtros
          </p>
          <p className="mt-1 text-2xl font-black text-[var(--color-tinta)]">
            {totalResultados}
          </p>
          <p className="text-xs font-semibold text-[var(--color-muted)]">
            de {totalProductos} productos
          </p>
        </div>
        <button
          type="button"
          className="text-sm font-black text-[var(--color-muted)] transition hover:text-[var(--color-tinta)]"
          onClick={alLimpiarFiltros}
        >
          Limpiar
        </button>
      </div>

      <GrupoPlegable titulo="Marca y tienda">
        <GrupoSelect
          id="marca"
          etiqueta="Marca"
          valor={filtros.marca}
          opciones={opciones.marcas}
          placeholder="Todas"
          alCambiarFiltro={alCambiarFiltro}
        />
        <GrupoSelect
          id="tienda"
          etiqueta="Tienda"
          valor={filtros.tienda}
          opciones={opciones.tiendas}
          placeholder="Todas"
          alCambiarFiltro={alCambiarFiltro}
        />
        <GrupoSelect
          id="provincia"
          etiqueta="Provincia"
          valor={filtros.provincia}
          opciones={opciones.provincias}
          placeholder="Todas"
          alCambiarFiltro={alCambiarFiltro}
        />
      </GrupoPlegable>

      <GrupoPlegable titulo="Precio y descuento">
        <div className="grid grid-cols-2 gap-2">
          <label className="grid gap-2 text-sm">
            <span className="font-bold text-[var(--color-texto)]">Minimo</span>
            <input
              type="number"
              value={filtros.precioMinimo}
              onChange={(evento) =>
                alCambiarFiltro("precioMinimo", evento.target.value)
              }
              placeholder="80000"
              className="input-base text-sm font-semibold"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-bold text-[var(--color-texto)]">Maximo</span>
            <input
              type="number"
              value={filtros.precioMaximo}
              onChange={(evento) =>
                alCambiarFiltro("precioMaximo", evento.target.value)
              }
              placeholder="240000"
              className="input-base text-sm font-semibold"
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm">
          <span className="font-bold text-[var(--color-texto)]">
            Descuento minimo
          </span>
          <input
            type="number"
            value={filtros.descuentoMinimo}
            onChange={(evento) =>
              alCambiarFiltro("descuentoMinimo", evento.target.value)
            }
            placeholder="20"
            className="input-base text-sm font-semibold"
          />
        </label>
      </GrupoPlegable>

      <GrupoPlegable titulo="Producto">
        <GrupoSelect
          id="talle"
          etiqueta="Talle"
          valor={filtros.talle}
          opciones={opciones.talles}
          placeholder="Todos"
          alCambiarFiltro={alCambiarFiltro}
        />
        <GrupoSelect
          id="categoria"
          etiqueta="Categoria"
          valor={filtros.categoria}
          opciones={opciones.categorias}
          placeholder="Todas"
          alCambiarFiltro={alCambiarFiltro}
        />
        <GrupoSelect
          id="color"
          etiqueta="Color"
          valor={filtros.color}
          opciones={opciones.colores}
          placeholder="Todos"
          alCambiarFiltro={alCambiarFiltro}
        />
        <GrupoSelect
          id="genero"
          etiqueta="Genero"
          valor={filtros.genero}
          opciones={opciones.generos}
          placeholder="Todos"
          alCambiarFiltro={alCambiarFiltro}
        />
      </GrupoPlegable>

      <GrupoPlegable titulo="Disponibilidad" abiertoInicial={false}>
        <GrupoSelect
          id="tipoOferta"
          etiqueta="Tipo de oferta"
          valor={filtros.tipoOferta}
          opciones={opciones.tiposOferta}
          placeholder="Cualquier tipo"
          alCambiarFiltro={alCambiarFiltro}
        />
        <GrupoSelect
          id="ultimaActualizacion"
          etiqueta="Actualizacion"
          valor={filtros.ultimaActualizacion}
          opciones={["24h", "72h", "168h"]}
          placeholder="Cualquier fecha"
          alCambiarFiltro={alCambiarFiltro}
        />
        <label className="flex items-center justify-between rounded-[14px] border border-[var(--color-linea)] bg-[#f8f9f5] px-3 py-3 text-sm font-bold text-[var(--color-texto)]">
          <span>Solo con stock</span>
          <input
            type="checkbox"
            checked={filtros.soloStock}
            onChange={(evento) =>
              alCambiarFiltro("soloStock", evento.target.checked)
            }
            className="h-4 w-4 accent-[var(--color-acento)]"
          />
        </label>
        <label className="flex items-center justify-between rounded-[14px] border border-[var(--color-linea)] bg-[#f8f9f5] px-3 py-3 text-sm font-bold text-[var(--color-texto)]">
          <span>Envio gratis</span>
          <input
            type="checkbox"
            checked={filtros.envioGratis}
            onChange={(evento) =>
              alCambiarFiltro("envioGratis", evento.target.checked)
            }
            className="h-4 w-4 accent-[var(--color-acento)]"
          />
        </label>
      </GrupoPlegable>

      <div className="rounded-[16px] bg-[var(--color-tinta)] p-4 text-white">
        <p className="text-xs font-bold text-white/55">
          {estaActualizando ? "Actualizando resultados" : "Resultados listos"}
        </p>
        <p className="mt-1 text-lg font-black">
          {totalResultados} coincidencias
        </p>
      </div>
    </>
  );

  return (
    <aside className="filtros lg:sticky lg:top-[116px] lg:self-start">
      <div className="panel-premium p-4">
        <div className="flex items-center justify-between gap-3 md:hidden">
          <div>
            <p className="text-xs font-black uppercase text-[var(--color-muted)]">
              Filtros
            </p>
            <p className="text-base font-black text-[var(--color-tinta)]">
              {totalResultados} de {totalProductos}
            </p>
          </div>
          <button
            type="button"
            className="boton boton--fantasma min-h-10 px-4 py-2 text-sm"
            onClick={() => setFiltrosAbiertos((valorActual) => !valorActual)}
          >
            {filtrosAbiertos ? "Cerrar" : "Filtrar"}
          </button>
        </div>

        <div className={`${filtrosAbiertos ? "mt-4 block" : "hidden"} md:block`}>
          {contenidoFiltros}
          <button
            type="button"
            className="mt-3 w-full rounded-[14px] border border-[var(--color-linea)] px-4 py-3 text-sm font-black text-[var(--color-muted)] transition hover:text-[var(--color-tinta)] md:hidden"
            onClick={alLimpiarFiltros}
          >
            Restablecer filtros
          </button>
        </div>
      </div>
    </aside>
  );
}
