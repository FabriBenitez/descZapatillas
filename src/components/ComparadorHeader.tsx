"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Header } from "@/components/Header";

interface ComparadorHeaderProps {
  busquedaInicial?: string;
}

export function ComparadorHeader({
  busquedaInicial = "",
}: ComparadorHeaderProps) {
  const router = useRouter();
  const [terminoBusqueda, setTerminoBusqueda] = useState(busquedaInicial);

  function enviarBusqueda() {
    const parametros = new URLSearchParams();

    if (terminoBusqueda.trim()) {
      parametros.set("q", terminoBusqueda.trim());
    }

    const url = `/comparador${parametros.toString() ? `?${parametros}` : ""}`;
    
    // Limpiamos los filtros para que sea una búsqueda global limpia
    sessionStorage.removeItem("comparadorState");

    // Si ya estamos en la página del comparador, actualizamos instantáneamente sin recargar
    if (typeof window !== "undefined" && window.location.pathname === "/comparador") {
      window.history.pushState(null, "", url);
      window.dispatchEvent(new CustomEvent("nuevaBusqueda", { detail: terminoBusqueda.trim() }));
    } else {
      router.push(url);
    }
  }

  return (
    <Header
      terminoBusqueda={terminoBusqueda}
      alCambiarBusqueda={setTerminoBusqueda}
      alEnviarBusqueda={enviarBusqueda}
    />
  );
}
