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
    <header className="encabezado sticky top-0 z-50 border-b border-white/10 bg-[#111713]/92 text-white backdrop-blur-xl">
      <div className="contenedor grid gap-3 py-3 lg:grid-cols-[auto_minmax(240px,1fr)_auto] lg:items-center">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="encabezado__marca flex items-center gap-3"
            onClick={() => setMenuAbierto(false)}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white text-sm font-black text-[#111713] shadow-sm">
              PO
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-base font-black">Pisando Ofertas</span>
              <span className="mt-1 text-xs font-medium text-white/58">
                Sneaker deals tracker
              </span>
            </span>
          </Link>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/10 bg-white/7 transition hover:bg-white/12 lg:hidden"
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
            aria-label="Abrir menu"
            onClick={() => setMenuAbierto((valorActual) => !valorActual)}
          >
            <span className="flex flex-col gap-1.5">
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
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
            className="h-11 w-full rounded-[14px] border border-white/10 bg-white/[0.08] px-4 pr-24 text-sm text-white outline-none transition placeholder:text-white/42 focus:border-white/24 focus:bg-white/[0.12]"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 h-8 rounded-[10px] bg-white px-3 text-xs font-black text-[#111713] transition hover:bg-[#f3f5ef]"
          >
            Buscar
          </button>
        </form>

        <div className="hidden items-center justify-end gap-5 lg:flex">
          <nav
            className="flex items-center gap-5 text-sm font-semibold text-white/68"
            aria-label="Navegacion principal"
          >
            {enlacesNavegacion.map((enlace) => (
              <Link
                key={enlace.etiqueta}
                href={enlace.href}
                className="transition hover:text-white"
              >
                {enlace.etiqueta}
              </Link>
            ))}
          </nav>
          <Link href="/comparador" className="boton boton--acento min-h-10 px-4 py-2">
            Ver ofertas
          </Link>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="contenedor flex gap-2 overflow-x-auto py-2 [scrollbar-width:none]">
          {categoriasRapidas.map((categoria) => (
            <button
              key={categoria}
              type="button"
              className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-white/74 transition hover:bg-white/12 hover:text-white"
              onClick={() => buscarCategoria(categoria)}
            >
              {categoria}
            </button>
          ))}
        </div>
      </div>

      {menuAbierto ? (
        <div id="menu-movil" className="border-t border-white/10 lg:hidden">
          <div className="contenedor grid gap-2 py-3">
            {enlacesNavegacion.map((enlace) => (
              <Link
                key={enlace.etiqueta}
                href={enlace.href}
                className="rounded-[14px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
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
