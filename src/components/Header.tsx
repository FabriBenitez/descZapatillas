"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

const categoriasRapidas = [
  { label: "🔥 +50% OFF", href: "/comparador?descuento=50" },
  { label: "👟 Zapatillas", href: "/comparador?categoria=Zapatillas" },
  { label: "⚽ Botines", href: "/comparador?categoria=Botines" },
  { label: "Nike", href: "/comparador?marca=Nike" },
  { label: "Adidas", href: "/comparador?marca=Adidas" },
  { label: "Puma", href: "/comparador?marca=Puma" },
  { label: "New Balance", href: "/comparador?marca=New+Balance" },
];

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

  function limpiarBusqueda() {
    if (alCambiarBusqueda) {
      alCambiarBusqueda("");
    } else {
      setTerminoLocal("");
      if (typeof window !== "undefined" && window.location.pathname === "/comparador") {
        window.dispatchEvent(new CustomEvent("nuevaBusqueda", { detail: "" }));
      }
    }
  }

  return (
    <header className="encabezado sticky top-0 z-50 border-b-2 sm:border-b-3 border-[#111] bg-[#f5f7f6]/95 backdrop-blur-md text-[#111]">
      <div className="contenedor grid gap-2.5 py-2 sm:gap-4 sm:py-3 lg:grid-cols-[auto_minmax(300px,1fr)_auto] lg:items-center">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <Link
            href="/"
            className="encabezado__marca flex items-center gap-2.5 sm:gap-3 group min-w-0 touch-manipulation active:scale-[0.98] transition-transform"
            onClick={() => setMenuAbierto(false)}
          >
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-[8px] border-2 border-[#111] bg-white p-0.5 shadow-[2px_2px_0px_#111] transition-transform duration-200 group-hover:-rotate-3 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/mascota-default.png"
                alt="Logo Pisando Ofertas"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="flex flex-col leading-none min-w-0">
              <span className="text-[15px] sm:text-xl font-black tracking-tight font-titulos text-[#111] group-hover:text-[#FF4500] transition-colors uppercase truncate">
                Pisando Ofertas
              </span>
              <span className="mt-1 inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-[#111]/65 tracking-wider uppercase font-cuerpo truncate">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                Comparador en vivo
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden shrink-0">
            <Link
              href="/comparador"
              className="inline-flex h-10 items-center justify-center border-2 border-[#111] bg-[#10b981] px-3 text-[11px] font-black uppercase tracking-wider text-[#111] shadow-[2px_2px_0px_#111] rounded-[6px] touch-manipulation active:scale-[0.97] active:translate-y-0.5 transition-all"
            >
              Ver ofertas
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center text-[#111] border-2 border-[#111] shadow-[2px_2px_0px_#111] rounded-[6px] bg-white hover:bg-[#FF4500] hover:text-white touch-manipulation active:scale-[0.96] transition-all"
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-expanded={menuAbierto}
              aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.75}
                  d={menuAbierto ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {!ocultarBuscador && (
          <form
            className="encabezado__busqueda relative order-3 lg:order-none flex w-full"
            onSubmit={enviarBusqueda}
          >
            <label htmlFor="busqueda-header" className="sr-only">
              Buscar zapatillas
            </label>
            <div className="flex w-full border-2 border-[#111] bg-white shadow-[3px_3px_0px_#111] sm:shadow-[4px_4px_0px_#111] focus-within:translate-x-[1px] focus-within:translate-y-[1px] focus-within:shadow-[2px_2px_0px_#111] transition-all duration-150 rounded-[8px] overflow-hidden">
              <div className="flex items-center pl-3 sm:pl-4 text-[#111]/60">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.75}
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
                placeholder="Buscar modelo, marca o talle..."
                className="w-full bg-transparent py-2.5 sm:py-3 pl-2.5 sm:pl-3 pr-2 text-base sm:text-sm font-bold text-[#111] outline-none placeholder:text-[#111]/45"
              />
              {valorBusqueda && (
                <button
                  type="button"
                  onClick={limpiarBusqueda}
                  aria-label="Limpiar búsqueda"
                  className="px-2.5 text-sm font-black text-black/50 hover:text-[#111] touch-manipulation"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="border-l-2 border-[#111] bg-[#111] px-4 sm:px-6 text-xs sm:text-sm font-black uppercase tracking-wider text-white transition-all duration-150 hover:bg-[#FF4500] hover:text-white active:scale-[0.98] touch-manipulation"
              >
                Buscar
              </button>
            </div>
          </form>
        )}

        <div className="hidden items-center justify-end gap-4 lg:flex">
          <Link
            href="/comparador"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border-2 border-[#111] bg-[#10b981] px-5 text-xs font-black uppercase tracking-widest text-[#111] shadow-[4px_4px_0px_#111] transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#111] active:scale-[0.97]"
          >
            <span>Ver ofertas</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* Menú Mobile */}
      {menuAbierto && (
        <div className="lg:hidden border-t-2 border-[#111] bg-white px-4 py-4 space-y-3.5 shadow-lg">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-black/55">
              Accesos directos
            </span>
            <div className="flex flex-wrap gap-2">
              {categoriasRapidas.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      sessionStorage.removeItem("comparadorState");
                    }
                    setMenuAbierto(false);
                  }}
                  className="inline-flex min-h-[38px] items-center rounded-[6px] border-2 border-[#111] bg-[#f5f7f6] px-3 py-1.5 text-xs font-black text-[#111] shadow-[2px_2px_0px_#111] touch-manipulation active:scale-[0.97]"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
          <Link
            href="/comparador"
            onClick={() => setMenuAbierto(false)}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-[8px] border-2 border-[#111] bg-[#10b981] px-6 text-xs font-black uppercase tracking-widest text-[#111] shadow-[3px_3px_0px_#111] touch-manipulation active:scale-[0.98]"
          >
            <span>Explorar todo el catálogo</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </header>
  );
}
