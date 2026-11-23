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
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/85 backdrop-blur-md text-[#111] transition-all">
      <div className="contenedor flex items-center justify-between gap-3 py-2.5 sm:py-3.5">
        <Link
          href="/"
          className="flex items-center gap-2.5 group min-w-0 touch-manipulation active:scale-[0.98] transition-transform"
          onClick={() => setMenuAbierto(false)}
        >
          <div className="relative h-9 w-9 sm:h-10 sm:w-10 overflow-hidden rounded-xl border border-black/10 bg-white p-0.5 shadow-xs transition-transform duration-200 group-hover:-rotate-3 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/mascota-default.png"
              alt="Logo Pisando Ofertas"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="flex flex-col leading-none min-w-0">
            <span className="text-base sm:text-lg font-black tracking-tight text-[#111] group-hover:text-[#FF4500] transition-colors uppercase truncate">
              Pisando Ofertas
            </span>
            <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold text-black/50 tracking-wider uppercase truncate">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#10b981]" />
              Comparador de precios
            </span>
          </span>
        </Link>

        {/* Buscador en Header si no está oculto */}
        {!ocultarBuscador && (
          <form
            className="hidden md:flex flex-1 max-w-md mx-4"
            onSubmit={enviarBusqueda}
          >
            <div className="relative flex w-full items-center bg-[#f0f3f1] border border-black/10 rounded-xl overflow-hidden focus-within:bg-white focus-within:border-[#FF4500] focus-within:ring-2 focus-within:ring-[#FF4500]/15 transition-all">
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
                placeholder="Buscá modelo o marca..."
                className="w-full bg-transparent py-2 pl-3 pr-8 text-xs font-semibold text-[#111] outline-none"
              />
              {valorBusqueda && (
                <button
                  type="button"
                  onClick={limpiarBusqueda}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-12 text-xs font-bold text-black/40 hover:text-black"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="h-full px-3.5 bg-[#111] text-white hover:bg-[#FF4500] text-xs font-bold uppercase transition-colors"
              >
                Buscar
              </button>
            </div>
          </form>
        )}

        <div className="flex items-center gap-2">
          <Link
            href="/comparador"
            className="inline-flex h-9 sm:h-10 items-center justify-center gap-1.5 rounded-xl bg-[#111] hover:bg-[#FF4500] text-white px-3.5 sm:px-4 text-xs font-extrabold uppercase tracking-wider transition-all active:scale-95 shadow-xs touch-manipulation"
          >
            <span>Catálogo</span>
            <span aria-hidden="true">→</span>
          </Link>
          <button
            type="button"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/15 bg-white text-[#111] hover:bg-black/5 active:scale-95 transition-all touch-manipulation"
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
                strokeWidth={2}
                d={menuAbierto ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Menú Mobile Desplegable */}
      {menuAbierto && (
        <div className="md:hidden border-t border-black/10 bg-white/95 backdrop-blur-md px-4 py-4 space-y-3 shadow-xl">
          {!ocultarBuscador && (
            <form onSubmit={enviarBusqueda} className="pb-2">
              <input
                type="search"
                value={valorBusqueda}
                onChange={(e) => alCambiarBusqueda ? alCambiarBusqueda(e.target.value) : setTerminoLocal(e.target.value)}
                placeholder="Buscar modelo, marca o talle..."
                className="w-full bg-[#f0f3f1] border border-black/10 rounded-xl py-2 px-3 text-xs font-medium text-[#111] outline-none"
              />
            </form>
          )}

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-black/40">
              Accesos Rápidos
            </span>
            <div className="flex flex-wrap gap-1.5">
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
                  className="inline-flex items-center rounded-lg border border-black/10 bg-[#f5f7f6] px-2.5 py-1.5 text-xs font-bold text-[#111] hover:bg-[#FF4500] hover:text-white transition-colors"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
