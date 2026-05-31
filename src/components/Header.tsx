"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

const enlacesNavegacion = [
  { href: "/", etiqueta: "Inicio" },
  { href: "/#ofertas", etiqueta: "Ofertas" },
  { href: "/comparador", etiqueta: "Comparador" },
];

const categoriasRapidas = ["Nike", "Adidas", "Puma", "Running"];

interface HeaderProps {
  terminoBusqueda?: string;
  alCambiarBusqueda?: (valor: string) => void;
  alEnviarBusqueda?: () => void;
}

export function Header({
  terminoBusqueda = "",
  alCambiarBusqueda,
  alEnviarBusqueda,
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
    <header className="encabezado sticky top-0 z-50 border-b border-[#10b981]/15 bg-[#0f1311]/90 text-white backdrop-blur-xl transition-all duration-300">
      <div className="contenedor grid gap-3 py-3 lg:grid-cols-[auto_minmax(240px,1fr)_auto] lg:items-center">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="encabezado__marca flex items-center gap-3 group"
            onClick={() => setMenuAbierto(false)}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#10b981] to-[#059669] text-sm font-black text-[#0f1311] shadow-lg shadow-[#10b981]/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[#10b981]/40">
              PO
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-base font-black tracking-tight font-titulos bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent group-hover:text-[#10b981] transition-colors">
                Pisando Ofertas
              </span>
              <span className="mt-1 text-[10px] font-semibold text-white/50 tracking-wider uppercase font-cuerpo">
                Sneaker deals tracker
              </span>
            </span>
          </Link>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/10 bg-white/5 transition-all duration-200 hover:bg-white/10 hover:border-white/20 active:scale-95 lg:hidden"
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
            aria-label="Abrir menu"
            onClick={() => setMenuAbierto((valorActual) => !valorActual)}
          >
            <span className="flex flex-col gap-1.5">
              <span className={`h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ${menuAbierto ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`h-0.5 w-5 rounded-full bg-current transition-opacity duration-300 ${menuAbierto ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ${menuAbierto ? "-rotate-45 -translate-y-2" : ""}`} />
            </span>
          </button>
        </div>

        <form
          className="encabezado__busqueda relative order-3 lg:order-none"
          onSubmit={enviarBusqueda}
        >
          <label htmlFor="busqueda-header" className="sr-only">
            Buscar zapatillas
          </label>
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
            placeholder="Buscar modelo, marca o tienda"
            className="h-11 w-full rounded-[14px] border border-white/10 bg-white/[0.06] px-4 pr-24 text-sm text-white outline-none transition-all duration-250 placeholder:text-white/40 focus:border-[#10b981]/50 focus:bg-[#0f1311] focus:ring-4 focus:ring-[#10b981]/10"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 h-8 rounded-[10px] bg-white px-4 text-xs font-black text-[#0f1311] transition-all duration-200 hover:bg-[#10b981] hover:text-white active:scale-95"
          >
            Buscar
          </button>
        </form>

        <div className="hidden items-center justify-end gap-6 lg:flex">
          <nav
            className="flex items-center gap-6 text-sm font-bold text-white/70"
            aria-label="Navegacion principal"
          >
            {enlacesNavegacion.map((enlace) => (
              <Link
                key={enlace.etiqueta}
                href={enlace.href}
                className="relative py-1 transition-colors duration-200 hover:text-white group"
              >
                {enlace.etiqueta}
                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#10b981] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>
          <Link href="/comparador" className="boton boton--acento min-h-10 px-5 py-2 text-xs uppercase tracking-wider font-extrabold rounded-[12px]">
            Ver ofertas
          </Link>
        </div>
      </div>



      {menuAbierto ? (
        <div id="menu-movil" className="border-t border-white/5 bg-[#0f1311] lg:hidden animate-fade-in">
          <div className="contenedor grid gap-2 py-3">
            {enlacesNavegacion.map((enlace) => (
              <Link
                key={enlace.etiqueta}
                href={enlace.href}
                className="rounded-[12px] border border-white/5 bg-white/[0.02] px-4 py-3.5 text-sm font-bold text-white/80 transition-all duration-200 hover:bg-[#10b981]/10 hover:text-[#10b981] hover:border-[#10b981]/20"
                onClick={() => setMenuAbierto(false)}
              >
                {enlace.etiqueta}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
