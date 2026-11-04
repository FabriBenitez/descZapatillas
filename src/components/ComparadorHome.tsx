"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroSearch } from "@/components/HeroSearch";
import { ProductList } from "@/components/ProductList";
import { Marquee } from "@/components/Marquee";
import type { Producto } from "@/types/producto";

interface ComparadorHomeProps {
  productosDestacados: Producto[];
  cantidadProductos: number;
  cantidadMarcas: number;
  cantidadTiendas: number;
}

const TALLES_RAPIDOS = ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];

const ATAJOS_RAPIDOS = [
  { label: "🔥 +50% OFF", param: "descuento", val: "50", bg: "bg-[#FF4500] text-white" },
  { label: "⚡ +40% OFF", param: "descuento", val: "40", bg: "bg-[#fbbf24] text-[#111]" },
  { label: "👟 Zapatillas", param: "categoria", val: "Zapatillas", bg: "bg-white text-[#111]" },
  { label: "⚽ Botines", param: "categoria", val: "Botines", bg: "bg-white text-[#111]" },
  { label: "Nike", param: "marca", val: "Nike", bg: "bg-[#FFEBE5] text-[#111]" },
  { label: "Adidas", param: "marca", val: "Adidas", bg: "bg-[#E6F0FA] text-[#111]" },
  { label: "Puma", param: "marca", val: "Puma", bg: "bg-[#E6FAF0] text-[#111]" },
  { label: "New Balance", param: "marca", val: "New Balance", bg: "bg-[#FCF6E5] text-[#111]" },
  { label: "Vans", param: "marca", val: "Vans", bg: "bg-white text-[#111]" },
  { label: "Topper", param: "marca", val: "Topper", bg: "bg-white text-[#111]" },
];

export function ComparadorHome({
  productosDestacados,
  cantidadProductos,
  cantidadMarcas,
  cantidadTiendas,
}: ComparadorHomeProps) {
  const router = useRouter();
  const [terminoBusqueda, setTerminoBusqueda] = useState("");

  const ofertaDestacada = productosDestacados[0] ?? null;

  function irAPaginaComparador(terminoOverride?: string) {
    const parametros = new URLSearchParams();
    const valorFinal = typeof terminoOverride === "string" ? terminoOverride : terminoBusqueda;

    if (valorFinal.trim()) {
      parametros.set("q", valorFinal.trim());
    }

    if (typeof window !== "undefined") {
      sessionStorage.removeItem("comparadorState");
    }

    router.push(`/comparador${parametros.toString() ? `?${parametros}` : ""}`);
  }

  function irConFiltroDirecto(param: string, valor: string) {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("comparadorState");
    }
    const parametros = new URLSearchParams();
    parametros.set(param, valor);
    router.push(`/comparador?${parametros.toString()}`);
  }

  return (
    <>
      <Header
        terminoBusqueda={terminoBusqueda}
        alCambiarBusqueda={setTerminoBusqueda}
        alEnviarBusqueda={irAPaginaComparador}
        ocultarBuscador={true}
      />

      <main className="pagina flex-1">
        <HeroSearch
          terminoBusqueda={terminoBusqueda}
          alCambiarBusqueda={setTerminoBusqueda}
          alEnviarBusqueda={irAPaginaComparador}
          cantidadProductos={cantidadProductos}
          cantidadMarcas={cantidadMarcas}
          cantidadTiendas={cantidadTiendas}
          ofertaDestacada={ofertaDestacada}
        />
        <Marquee text="ÚLTIMAS OFERTAS DETECTADAS EN TIEMPO REAL" />

        {/* Accesos directos por Talle y Categoría/Marca */}
        <section className="pt-5 sm:pt-8">
          <div className="contenedor space-y-3 sm:space-y-4">
            <div className="border-2 border-[#111] bg-white p-3.5 sm:p-5 rounded-[8px] shadow-[4px_4px_0px_#111]">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#111] flex items-center gap-1.5">
                  <span>👟 Filtrá directo por tu talle (AR)</span>
                </h2>
                <Link
                  href="/comparador"
                  className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#FF4500] hover:underline shrink-0"
                >
                  Ver todos →
                </Link>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5 sm:gap-2">
                {TALLES_RAPIDOS.map((talle) => (
                  <button
                    key={talle}
                    type="button"
                    onClick={() => irConFiltroDirecto("talle", talle)}
                    className="min-h-9 sm:min-h-10 rounded-[4px] border-2 border-[#111] bg-[#f5f7f6] hover:bg-[#FF4500] hover:text-white text-xs sm:text-sm font-black text-[#111] shadow-[2px_2px_0px_#111] active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    {talle}
                  </button>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t-2 border-[#111]/10 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {ATAJOS_RAPIDOS.map((atajo) => (
                  <button
                    key={`${atajo.param}-${atajo.val}`}
                    type="button"
                    onClick={() => irConFiltroDirecto(atajo.param, atajo.val)}
                    className={`shrink-0 px-3 py-1.5 rounded-full border-2 border-[#111] text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#111] active:translate-y-0.5 transition-all cursor-pointer ${atajo.bg}`}
                  >
                    {atajo.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="ofertas" className="pb-10 pt-5 sm:pb-12 sm:pt-8">
          <div className="contenedor space-y-6 sm:space-y-8">
            <ProductList
              titulo="Ofertas que conviene mirar primero"
              descripcion="Mayores descuentos activos con stock y talles verificados."
              productos={productosDestacados}
              cantidadPrioritaria={4}
            />

            <div className="flex justify-center pt-2 sm:pt-4">
              <Link
                href="/comparador"
                className="w-full sm:w-auto justify-center border-2 border-[#111] bg-[#10b981] text-[#111] rounded-[6px] text-sm sm:text-lg font-black uppercase tracking-wider px-6 py-3.5 sm:px-8 sm:py-4 shadow-[4px_4px_0px_#111] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#111] transition-all inline-flex items-center gap-2.5"
              >
                <span>Explorar las {cantidadProductos.toLocaleString("es-AR")} ofertas</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
