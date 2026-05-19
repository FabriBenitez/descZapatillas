"use client";

import { startTransition, useDeferredValue, useState } from "react";

import { FiltersSidebar } from "@/components/FiltersSidebar";
import { ProductList } from "@/components/ProductList";
import { SortSelect } from "@/components/SortSelect";
import {
  filtrarProductos,
  hayFiltrosActivos,
  obtenerOpcionesFiltros,
  ordenarProductos,
} from "@/lib/comparador";
import {
  filtrosIniciales,
  type FiltrosProductos,
  type OrdenProductos,
  type Producto,
} from "@/types/producto";

interface ComparadorResultadosProps {
  productos: Producto[];
  busquedaInicial?: string;
}

function construirResumenFiltros(filtros: FiltrosProductos) {
  const etiquetas: string[] = [];

  if (filtros.marca) etiquetas.push(`Marca: ${filtros.marca}`);
  if (filtros.tienda) etiquetas.push(`Tienda: ${filtros.tienda}`);
  if (filtros.provincia) etiquetas.push(`Provincia: ${filtros.provincia}`);
  if (filtros.categoria) etiquetas.push(`Categoria: ${filtros.categoria}`);
  if (filtros.color) etiquetas.push(`Color: ${filtros.color}`);
  if (filtros.talle) etiquetas.push(`Talle: ${filtros.talle}`);
  if (filtros.genero) etiquetas.push(`Genero: ${filtros.genero}`);
  if (filtros.descuentoMinimo) {
    etiquetas.push(`Desde ${filtros.descuentoMinimo}% off`);
  }
  if (filtros.soloStock) etiquetas.push("Solo stock");
  if (filtros.envioGratis) etiquetas.push("Envio gratis");

  return etiquetas;
}

export function ComparadorResultados({
  productos,
  busquedaInicial = "",
}: ComparadorResultadosProps) {
  const [terminoBusqueda, setTerminoBusqueda] = useState(busquedaInicial);
  const [ordenSeleccionado, setOrdenSeleccionado] =
    useState<OrdenProductos>("descuento-desc");
  const [vistaResultados, setVistaResultados] = useState<"grid" | "lista">(
    "grid",
  );
  const [filtros, setFiltros] = useState<FiltrosProductos>(filtrosIniciales);
  const [estaActualizando, setEstaActualizando] = useState(false);

  const terminoDiferido = useDeferredValue(terminoBusqueda);
  const opciones = obtenerOpcionesFiltros(productos);
  const resumenFiltros = construirResumenFiltros(filtros);

  const productosFiltrados = ordenarProductos(
    filtrarProductos(productos, terminoDiferido, filtros),
    ordenSeleccionado,
  );

  function actualizarFiltro(
    nombre: keyof FiltrosProductos,
    valor: string | boolean,
  ) {
    setEstaActualizando(true);
    startTransition(() => {
      setFiltros((estadoActual) => ({
        ...estadoActual,
        [nombre]: valor,
      }));
      setEstaActualizando(false);
    });
  }

  function cambiarOrden(valor: OrdenProductos) {
    setEstaActualizando(true);
    startTransition(() => {
      setOrdenSeleccionado(valor);
      setEstaActualizando(false);
    });
  }

  return (
    <section id="comparador" className="comparador py-4 sm:py-10">
      <div className="contenedor grid gap-4 sm:gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <FiltersSidebar
            filtros={filtros}
            opciones={opciones}
            totalResultados={productosFiltrados.length}
            totalProductos={productos.length}
            estaActualizando={estaActualizando}
            alCambiarFiltro={actualizarFiltro}
            alLimpiarFiltros={() => setFiltros(filtrosIniciales)}
          />
        </div>

        <div className="comparador__contenido space-y-4 sm:space-y-5">
          <div className="z-30 rounded-[16px] border border-[var(--color-linea)] bg-white/92 p-3 shadow-sm backdrop-blur sm:sticky sm:top-[105px] sm:rounded-[18px] sm:p-4 lg:top-[116px]">
            <div className="flex flex-col gap-3 sm:gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-1 sm:space-y-2">
                <p className="hidden text-xs font-black uppercase text-[var(--color-muted)] sm:block">
                  Resultados
                </p>
                <h1 className="text-[1.8rem] font-black leading-[0.95] tracking-[-0.04em] text-[var(--color-tinta)] sm:text-3xl sm:leading-tight">
                  Resultado de la busqueda
                </h1>
                <p className="text-xs font-semibold text-[var(--color-muted)] sm:hidden">
                  {productosFiltrados.length} resultados
                  {terminoDiferido ? ` para "${terminoDiferido}"` : ""}
                </p>
                <p className="hidden text-sm text-[var(--color-muted)] sm:block">
                  Filtra por marca, tienda, talle o rango de precio y compara
                  rapido.
                </p>
              </div>

              <div className="grid gap-2 sm:gap-3 sm:grid-cols-[minmax(0,1fr)_220px_auto]">
                <label className="flex flex-col gap-2 text-sm text-[var(--color-muted)]">
                  <span className="hidden font-bold sm:block">
                    Buscar en resultados
                  </span>
                  <input
                    type="search"
                    value={terminoBusqueda}
                    onChange={(evento) => setTerminoBusqueda(evento.target.value)}
                    placeholder="Nike, Campus, Dexter..."
                    className="input-base h-10 text-sm font-semibold sm:h-11"
                  />
                </label>
                <SortSelect valor={ordenSeleccionado} alCambiar={cambiarOrden} />
                <div className="hidden flex-col gap-2 text-sm text-[var(--color-muted)] sm:flex">
                  <span className="font-bold">Vista</span>
                  <div className="grid h-11 grid-cols-2 rounded-[12px] border border-[var(--color-linea)] bg-[#f5f6f1] p-1">
                    <button
                      type="button"
                      className={`rounded-[9px] px-3 text-sm font-black transition ${
                        vistaResultados === "grid"
                          ? "bg-white text-[var(--color-tinta)] shadow-sm"
                          : "text-[var(--color-muted)]"
                      }`}
                      onClick={() => setVistaResultados("grid")}
                    >
                      Grid
                    </button>
                    <button
                      type="button"
                      className={`rounded-[9px] px-3 text-sm font-black transition ${
                        vistaResultados === "lista"
                          ? "bg-white text-[var(--color-tinta)] shadow-sm"
                          : "text-[var(--color-muted)]"
                      }`}
                      onClick={() => setVistaResultados("lista")}
                    >
                      Lista
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 hidden flex-wrap items-center gap-2 text-sm sm:flex">
              <span className="rounded-full bg-[var(--color-tinta)] px-3 py-1.5 font-black text-white">
                {productosFiltrados.length} resultados
              </span>
              {hayFiltrosActivos(filtros) ? (
                resumenFiltros.map((resumen) => (
                  <span key={resumen} className="chip min-h-8 px-3 py-1 text-xs">
                    {resumen}
                  </span>
                ))
              ) : (
                <span className="chip min-h-8 px-3 py-1 text-xs">
                  Sin filtros extra activos
                </span>
              )}
            </div>
          </div>

          <div className="lg:hidden">
            <FiltersSidebar
              filtros={filtros}
              opciones={opciones}
              totalResultados={productosFiltrados.length}
              totalProductos={productos.length}
              estaActualizando={estaActualizando}
              alCambiarFiltro={actualizarFiltro}
              alLimpiarFiltros={() => setFiltros(filtrosIniciales)}
            />
          </div>

          <ProductList
            productos={productosFiltrados}
            mensajeVacio="Proba cambiando la busqueda, ampliando el rango de precio o quitando algun filtro puntual."
            cantidadPrioritaria={3}
            vista={vistaResultados}
            cargando={estaActualizando}
          />
        </div>
      </div>
    </section>
  );
}
