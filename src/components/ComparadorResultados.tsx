"use client";

import { startTransition, useDeferredValue, useState, useEffect } from "react";

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

  if (filtros.categoria) etiquetas.push(`Categoría: ${filtros.categoria}`);
  if ((filtros as { subcategoria?: string }).subcategoria) etiquetas.push(`Tipo: ${(filtros as { subcategoria?: string }).subcategoria}`);
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

  // Restaurar estado al volver a la pagina (usamos sessionStorage para que dure mientras la pestaña esté abierta)
  useEffect(() => {
    const savedState = sessionStorage.getItem("comparadorState");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        
        // Ya no restauramos terminoBusqueda de la sesión para evitar
        // que al entrar a "Ver ofertas" se filtre por una busqueda vieja.
        // La fuente de verdad para el término de búsqueda es la URL (busquedaInicial).
        
        if (parsed.ordenSeleccionado) setOrdenSeleccionado(parsed.ordenSeleccionado);
        if (parsed.filtros) setFiltros(parsed.filtros);
        if (parsed.vistaResultados) setVistaResultados(parsed.vistaResultados);
      } catch (e) {
        console.error("Error restaurando estado", e);
      }
    }

    // Escuchar el evento de búsqueda del header para actualizar sin recargar el servidor
    const handleNuevaBusqueda = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setTerminoBusqueda(customEvent.detail);
      setFiltros(filtrosIniciales);
    };
    window.addEventListener("nuevaBusqueda", handleNuevaBusqueda);
    return () => window.removeEventListener("nuevaBusqueda", handleNuevaBusqueda);
  }, [busquedaInicial]);

  // Guardar estado cuando cambia algo
  useEffect(() => {
    const stateToSave = {
      terminoBusqueda,
      ordenSeleccionado,
      filtros,
      vistaResultados
    };
    sessionStorage.setItem("comparadorState", JSON.stringify(stateToSave));
  }, [terminoBusqueda, ordenSeleccionado, filtros, vistaResultados]);

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
            estaActualizando={estaActualizando}
            alCambiarFiltro={actualizarFiltro}
            alLimpiarFiltros={() => setFiltros(filtrosIniciales)}
            ordenSeleccionado={ordenSeleccionado}
            alCambiarOrden={cambiarOrden}
          />
        </div>

        <div className="comparador__contenido space-y-4 sm:space-y-6">
          <div className="border-4 border-[#111] bg-[#10b981] p-6 text-white shadow-[6px_6px_0px_#111] relative overflow-hidden">
            {/* Background decorative neon element */}
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-42 h-42 bg-[#00f59b] opacity-35 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-[#111] leading-none mb-1">
                {terminoDiferido ? `Resultados: "${terminoDiferido}"` : "Comparador de Ofertas"}
              </h1>
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#111]/75">
                {productosFiltrados.length} zapatillas con descuento encontradas
              </p>
            </div>
          </div>

          {resumenFiltros.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center bg-white border-2 border-[#111] p-4 rounded-[8px] shadow-[4px_4px_0px_#111]">
              <span className="text-[9px] font-black uppercase tracking-widest text-black/50">Filtros activos:</span>
              <div className="flex flex-wrap gap-2">
                {resumenFiltros.map((filtro, idx) => {
                  const colors = ["bg-[#E6F0FA]", "bg-[#FFF0EB]", "bg-[#EBF7F0]", "bg-[#FAF5FF]", "bg-[#FEF9C3]"];
                  const color = colors[idx % colors.length];
                  return (
                    <span
                      key={filtro}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-[#111] ${color} text-[10px] font-black text-[#111] shadow-[2px_2px_0px_#111]`}
                    >
                      {filtro}
                    </span>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setFiltros(filtrosIniciales)}
                className="text-[10px] font-black uppercase tracking-widest text-[#FF4500] hover:underline ml-auto"
              >
                Limpiar todo
              </button>
            </div>
          )}

          <div className="lg:hidden">
            <FiltersSidebar
              filtros={filtros}
              opciones={opciones}
              estaActualizando={estaActualizando}
              alCambiarFiltro={actualizarFiltro}
              alLimpiarFiltros={() => setFiltros(filtrosIniciales)}
              ordenSeleccionado={ordenSeleccionado}
              alCambiarOrden={cambiarOrden}
            />
          </div>

          <ProductList
            key={`${terminoDiferido}-${productosFiltrados.length}-${ordenSeleccionado}`}
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
