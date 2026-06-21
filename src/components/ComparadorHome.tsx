"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

        <section id="ofertas" className="pb-10 pt-8 sm:pt-12">
          <div className="contenedor">
            <ProductList
              titulo="Ofertas que conviene mirar primero"
              descripcion="Mayores descuentos activos, priorizados para escanear rapido precio, ahorro y tienda."
              productos={productosDestacados}
              cantidadPrioritaria={4}
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
