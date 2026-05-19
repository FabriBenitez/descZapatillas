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
    <section id="comparador" className="comparador py-8 sm:py-10">
      <div className="contenedor grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <FiltersSidebar
          filtros={filtros}
          opciones={opciones}
          totalResultados={productosFiltrados.length}
          totalProductos={productos.length}
          estaActualizando={estaActualizando}
          alCambiarFiltro={actualizarFiltro}
          alLimpiarFiltros={() => setFiltros(filtrosIniciales)}
        />

        <div className="comparador__contenido space-y-5">
          <div className="sticky top-[105px] z-30 rounded-[18px] border border-[var(--color-linea)] bg-white/92 p-4 shadow-sm backdrop-blur lg:top-[116px]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-black uppercase text-[var(--color-muted)]">
                  Resultados
                </p>
                <h1 className="text-3xl font-black leading-tight text-[var(--color-tinta)]">
                  Comparador de ofertas
                </h1>
                <p className="text-sm text-[var(--color-muted)]">
                  Filtra por marca, tienda, talle o rango de precio y compara
                  rapido.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px_auto]">
                <label className="flex flex-col gap-2 text-sm text-[var(--color-muted)]">
                  <span className="font-bold">Buscar en resultados</span>
                  <input
                    type="search"
                    value={terminoBusqueda}
                    onChange={(evento) => setTerminoBusqueda(evento.target.value)}
                    placeholder="Nike, Campus, Dexter..."
                    className="input-base h-11 text-sm font-semibold"
                  />
                </label>
                <SortSelect valor={ordenSeleccionado} alCambiar={cambiarOrden} />
                <div className="flex flex-col gap-2 text-sm text-[var(--color-muted)]">
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

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
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
