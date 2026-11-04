"use client";

import { startTransition, useDeferredValue, useState, useEffect } from "react";

import { FiltersSidebar } from "@/components/FiltersSidebar";
import { ProductList } from "@/components/ProductList";
import {
  filtrarProductos,
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

interface EtiquetaFiltroActivo {
  key: keyof FiltrosProductos;
  label: string;
  resetVal: string | boolean;
}

function construirResumenFiltros(filtros: FiltrosProductos): EtiquetaFiltroActivo[] {
  const etiquetas: EtiquetaFiltroActivo[] = [];

  if (filtros.categoria) {
    etiquetas.push({ key: "categoria", label: `Categoría: ${filtros.categoria}`, resetVal: "" });
  }
  if (filtros.talle) {
    etiquetas.push({ key: "talle", label: `Talle: ${filtros.talle}`, resetVal: "" });
  }
  if (filtros.marca) {
    etiquetas.push({ key: "marca", label: `Marca: ${filtros.marca}`, resetVal: "" });
  }
  if (filtros.tienda) {
    etiquetas.push({ key: "tienda", label: `Tienda: ${filtros.tienda}`, resetVal: "" });
  }
  if (filtros.genero) {
    etiquetas.push({ key: "genero", label: `Género: ${filtros.genero}`, resetVal: "" });
  }
  if (filtros.descuentoMinimo) {
    etiquetas.push({ key: "descuentoMinimo", label: `Desde ${filtros.descuentoMinimo}% OFF`, resetVal: "" });
  }
  if (filtros.precioMinimo) {
    etiquetas.push({ key: "precioMinimo", label: `Mín: $${filtros.precioMinimo}`, resetVal: "" });
  }
  if (filtros.precioMaximo) {
    etiquetas.push({ key: "precioMaximo", label: `Máx: $${filtros.precioMaximo}`, resetVal: "" });
  }
  if (filtros.envioGratis) {
    etiquetas.push({ key: "envioGratis", label: "Envío gratis", resetVal: false });
  }

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

  // Restaurar estado o aplicar parámetros directos desde la URL (?talle=41, ?marca=Nike, ?categoria=Botines, ?descuento=50)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTalle = params.get("talle");
    const urlMarca = params.get("marca");
    const urlCategoria = params.get("categoria");
    const urlDescuento = params.get("descuento");
    const urlTienda = params.get("tienda");
    const urlGenero = params.get("genero");

    const tieneFiltrosUrl = Boolean(
      urlTalle || urlMarca || urlCategoria || urlDescuento || urlTienda || urlGenero,
    );

    if (tieneFiltrosUrl) {
      setFiltros({
        ...filtrosIniciales,
        talle: urlTalle ?? "",
        marca: urlMarca ?? "",
        categoria: urlCategoria ?? "",
        descuentoMinimo: urlDescuento ?? "",
        tienda: urlTienda ?? "",
        genero: urlGenero ?? "",
      });
    } else {
      const savedState = sessionStorage.getItem("comparadorState");
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          const VERSION_ACTUAL = "v8";
          if (parsed._version !== VERSION_ACTUAL) {
            sessionStorage.removeItem("comparadorState");
          } else {
            if (parsed.ordenSeleccionado) setOrdenSeleccionado(parsed.ordenSeleccionado);
            if (parsed.filtros) setFiltros({ ...filtrosIniciales, ...parsed.filtros });
            if (parsed.vistaResultados) setVistaResultados(parsed.vistaResultados);
          }
        } catch (e) {
          console.error("Error restaurando estado", e);
          sessionStorage.removeItem("comparadorState");
        }
      }
    }

    const handleNuevaBusqueda = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setTerminoBusqueda(customEvent.detail);
      setFiltros(filtrosIniciales);
    };
    window.addEventListener("nuevaBusqueda", handleNuevaBusqueda);
    return () => window.removeEventListener("nuevaBusqueda", handleNuevaBusqueda);
  }, [busquedaInicial]);

  useEffect(() => {
    const stateToSave = {
      _version: "v8",
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
    <section id="comparador" className="comparador py-3 sm:py-8">
      <div className="contenedor grid gap-3 sm:gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <FiltersSidebar
            filtros={filtros}
            opciones={opciones}
            totalResultados={productosFiltrados.length}
            estaActualizando={estaActualizando}
            alCambiarFiltro={actualizarFiltro}
            alLimpiarFiltros={() => setFiltros({ ...filtrosIniciales, soloStock: true })}
            ordenSeleccionado={ordenSeleccionado}
            alCambiarOrden={cambiarOrden}
          />
        </div>

        <div className="comparador__contenido space-y-3 sm:space-y-5">
          {/* Cabecera compacta con toggle Grilla/Lista integrado */}
          <div className="border-2 sm:border-4 border-[#111] bg-[#10b981] px-3.5 py-3 sm:p-6 text-white shadow-[4px_4px_0px_#111] sm:shadow-[6px_6px_0px_#111] relative overflow-hidden flex items-center justify-between gap-3 rounded-[6px] sm:rounded-none">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-42 h-42 bg-[#00f59b] opacity-35 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 min-w-0">
              <h1 className="text-lg sm:text-4xl font-black uppercase tracking-tighter text-[#111] leading-none mb-0.5 sm:mb-1 truncate">
                {terminoDiferido ? `Resultados: "${terminoDiferido}"` : "Comparador de Ofertas"}
              </h1>
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#111]/80">
                {productosFiltrados.length} {filtros.categoria ? filtros.categoria.toLowerCase() : "ofertas"} disponibles
              </p>
            </div>

            <div className="relative z-10 flex bg-white border-2 border-[#111] rounded-[4px] shadow-[2px_2px_0px_#111] overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => setVistaResultados("grid")}
                className={`px-2.5 py-1.5 sm:px-3 sm:py-2 text-[#111] transition-colors ${vistaResultados === "grid" ? "bg-[#FF4500] text-white" : "hover:bg-[#f0f3f1]"}`}
                title="Vista Grilla"
                aria-label="Vista Grilla"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <div className="w-[2px] bg-[#111]"></div>
              <button
                type="button"
                onClick={() => setVistaResultados("lista")}
                className={`px-2.5 py-1.5 sm:px-3 sm:py-2 text-[#111] transition-colors ${vistaResultados === "lista" ? "bg-[#FF4500] text-white" : "hover:bg-[#f0f3f1]"}`}
                title="Vista Lista"
                aria-label="Vista Lista"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Barra de filtros mobile + Drawer */}
          <div className="lg:hidden">
            <FiltersSidebar
              filtros={filtros}
              opciones={opciones}
              totalResultados={productosFiltrados.length}
              estaActualizando={estaActualizando}
              alCambiarFiltro={actualizarFiltro}
              alLimpiarFiltros={() => setFiltros({ ...filtrosIniciales, soloStock: true })}
              ordenSeleccionado={ordenSeleccionado}
              alCambiarOrden={cambiarOrden}
            />
          </div>

          {/* Chips interactivos de filtros activos (tocá cualquiera para quitarlo) */}
          {resumenFiltros.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center bg-white border-2 border-[#111] p-2.5 sm:p-3.5 rounded-[8px] shadow-[3px_3px_0px_#111]">
              <div className="flex flex-wrap gap-1.5">
                {resumenFiltros.map((filtro, idx) => {
                  const colors = ["bg-[#E6F0FA]", "bg-[#FFF0EB]", "bg-[#EBF7F0]", "bg-[#FAF5FF]", "bg-[#FEF9C3]"];
                  const color = colors[idx % colors.length];
                  return (
                    <button
                      key={filtro.key}
                      type="button"
                      onClick={() => actualizarFiltro(filtro.key, filtro.resetVal)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 border-[#111] ${color} text-[10px] font-black text-[#111] shadow-[1px_1px_0px_#111] hover:bg-[#FF4500] hover:text-white transition-colors`}
                      title="Quitar filtro"
                    >
                      <span>{filtro.label}</span>
                      <span className="text-[9px] leading-none">✕</span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setFiltros(filtrosIniciales)}
                className="text-[10px] font-black uppercase tracking-widest text-[#FF4500] hover:underline ml-auto px-1"
              >
                Limpiar todo
              </button>
            </div>
          )}

          <ProductList
            key={`${terminoDiferido}-${productosFiltrados.length}-${ordenSeleccionado}`}
            productos={productosFiltrados}
            mensajeVacio="Probá cambiando la búsqueda, ampliando el rango de precio o quitando algún filtro puntual."
            cantidadPrioritaria={4}
            vista={vistaResultados}
            cargando={estaActualizando}
          />
        </div>
      </div>
    </section>
  );
}
