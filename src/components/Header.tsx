"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";



const categoriasRapidas = ["Nike", "Adidas", "Puma", "Running"];

interface HeaderProps {
  terminoBusqueda?: string;
  alCambiarBusqueda?: (valor: string) => void;
  alEnviarBusqueda?: () => void;
  ocultarBuscador?: boolean;
}

export function Header({
  terminoBusqueda = "",
  alCambiarBusqueda,
  alEnviarBusqueda,
  ocultarBuscador = false,
}: HeaderProps) {
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [terminoLocal, setTerminoLocal] = useState(terminoBusqueda);
  const valorBusqueda = alCambiarBusqueda ? terminoBusqueda : terminoLocal;

  function navegarAlComparador(valor: string) {
    const parametros = new URLSearchParams();

    if (valor.trim()) {
      parametros.set("q", valor.trim());
    }

    if (typeof window !== "undefined") {
      sessionStorage.removeItem("comparadorState");
    }

    router.push(`/comparador${parametros.toString() ? `?${parametros}` : ""}`);
  }

  function enviarBusqueda(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (alEnviarBusqueda) {
      alEnviarBusqueda();
    } else {
      navegarAlComparador(valorBusqueda);
    }

    setMenuAbierto(false);
  }

  function buscarCategoria(categoria: string) {
    if (alCambiarBusqueda && alEnviarBusqueda) {
      alCambiarBusqueda(categoria);
      alEnviarBusqueda();
    } else {
      setTerminoLocal(categoria);
      navegarAlComparador(categoria);
    }

    setMenuAbierto(false);
  }

  return (
    <header className="encabezado sticky top-0 z-50 border-b-4 border-[#111] bg-[#f0f3f1] text-[#111] transition-all duration-300">
      <div className="contenedor grid gap-4 py-4 lg:grid-cols-[auto_minmax(300px,1fr)_auto] lg:items-center">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="encabezado__marca flex items-center gap-3 group"
            onClick={() => setMenuAbierto(false)}
          >
            <div className="relative h-14 w-14 overflow-hidden rounded-md transition-all duration-300 hover:scale-110 hover:rotate-6">
              <img 
                src="/img/mascota-default.png" 
                alt="Logo Pisando Ofertas" 
                className="h-full w-full object-contain"
              />
            </div>
            <span className="flex flex-col leading-none">
              <span className="text-xl font-black tracking-tight font-titulos text-[#111] group-hover:text-[#FF4500] transition-colors uppercase">
                Pisando Ofertas
              </span>
              <span className="mt-1 text-xs font-bold text-[#111]/60 tracking-widest uppercase font-cuerpo">
                Deals Tracker
              </span>
            </span>
          </Link>
        </div>

        {!ocultarBuscador && (
          <form
            className="encabezado__busqueda relative order-3 lg:order-none flex w-full"
            onSubmit={enviarBusqueda}
          >
            <label htmlFor="busqueda-header" className="sr-only">
              Buscar zapatillas
            </label>
            <div className="flex w-full border-2 border-[#111] bg-white shadow-[4px_4px_0px_#111] focus-within:translate-x-[2px] focus-within:translate-y-[2px] focus-within:shadow-[2px_2px_0px_#111] transition-all duration-200">
              <div className="flex items-center pl-4">
                <svg
                  className="h-5 w-5 text-[#111]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                id="busqueda-header"
                type="search"
                value={valorBusqueda}
                onChange={(evento) => {
                  if (alCambiarBusqueda) {
                    alCambiarBusqueda(evento.target.value);
                  } else {
                    setTerminoLocal(evento.target.value);
                  }
                }}
                placeholder="BUSCAR MARCAS, MODELOS..."
                className="w-full bg-transparent py-3 pl-3 pr-4 text-sm font-bold uppercase text-[#111] outline-none placeholder:text-[#111]/40"
              />
              <button
                type="submit"
                className="border-l-2 border-[#111] bg-[#111] px-6 text-sm font-black uppercase text-white transition-colors duration-200 hover:bg-[#FF4500] hover:text-[#111]"
              >
                Buscar
              </button>
            </div>
          </form>
        )}

        <div className="hidden items-center justify-end gap-6 lg:flex">
          <Link
            href="/comparador"
            className="flex h-12 items-center justify-center border-2 border-[#111] bg-[#10b981] px-6 text-sm font-black uppercase tracking-widest text-[#111] shadow-[4px_4px_0px_#111] transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#111]"
          >
            Ver ofertas
          </Link>
        </div>
      </div>
    </header>
  );
}
