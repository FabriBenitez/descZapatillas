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

    router.push(`/comparador${parametros.toString() ? `?${parametros}` : ""}`);
  }

  return (
    <Header
      terminoBusqueda={terminoBusqueda}
      alCambiarBusqueda={setTerminoBusqueda}
      alEnviarBusqueda={enviarBusqueda}
    />
  );
}
