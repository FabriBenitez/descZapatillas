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

export function ComparadorHome({
  productosDestacados,
  cantidadProductos,
  cantidadMarcas,
  cantidadTiendas,
}: ComparadorHomeProps) {
  const router = useRouter();
  const [terminoBusqueda, setTerminoBusqueda] = useState("");

  const ofertaDestacada = productosDestacados[0] ?? null;

  function irAPaginaComparador() {
    const parametros = new URLSearchParams();

    if (terminoBusqueda.trim()) {
      parametros.set("q", terminoBusqueda.trim());
    }

    if (typeof window !== "undefined") {
      sessionStorage.removeItem("comparadorState");
    }

    router.push(`/comparador${parametros.toString() ? `?${parametros}` : ""}`);
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

        <section id="ofertas" className="pb-12 pt-8 sm:pt-12">
          <div className="contenedor space-y-8">
            <ProductList
              titulo="Ofertas que conviene mirar primero"
              descripcion="Mayores descuentos activos, priorizados para escanear rápido precio, ahorro y tienda."
              productos={productosDestacados}
              cantidadPrioritaria={4}
            />

            <div className="flex justify-center pt-4">
              <Link
                href="/comparador"
                className="boton boton-primario text-base sm:text-lg font-black uppercase tracking-wider px-8 py-4 shadow-[4px_4px_0px_#111] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#111] transition-all inline-flex items-center gap-3"
              >
                <span>Explorar las +{cantidadProductos.toLocaleString("es-AR")} ofertas</span>
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
