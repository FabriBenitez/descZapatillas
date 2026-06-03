"use client";

import { startTransition, useDeferredValue, useState } from "react";

import { FiltersSidebar } from "@/components/FiltersSidebar";
import { ProductList } from "@/components/ProductList";
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
            ordenSeleccionado={ordenSeleccionado}
            alCambiarOrden={cambiarOrden}
          />
        </div>

        <div className="comparador__contenido space-y-4 sm:space-y-6">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-[1.8rem] font-black leading-[0.95] tracking-[-0.04em] text-[var(--color-tinta)] sm:text-3xl">
              {terminoDiferido ? `Resultados para "${terminoDiferido}"` : "Comparador de ofertas"}
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Mostrando <span className="font-extrabold text-[var(--color-tinta)]">{productosFiltrados.length}</span> ofertas de zapatillas de entre <span className="font-semibold">{productos.length}</span> modelos en el catálogo.
            </p>
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
              ordenSeleccionado={ordenSeleccionado}
              alCambiarOrden={cambiarOrden}
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
