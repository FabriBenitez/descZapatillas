import Link from "next/link";

export function Footer() {
  return (
    <footer className="pie-pagina mt-8 sm:mt-14 border-t-3 border-[#111] bg-[#F7F5F0] pt-8 pb-24 sm:py-14 text-[#111]">
      <div className="contenedor grid gap-6 sm:gap-10 lg:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,0.8fr))]">
        <div className="space-y-4 sm:space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-[8px] border-2 border-[#111] bg-[#fbbf24] text-base sm:text-lg font-black text-[#111] shadow-[2px_2px_0px_#111]">
              PO
            </span>
            <div>
              <p className="text-lg sm:text-xl font-black font-titulos uppercase text-[#111]">Pisando Ofertas</p>
              <p className="text-xs sm:text-sm font-bold text-black/50 font-cuerpo uppercase tracking-wider">
                Sneaker Deals Tracker
              </p>
            </div>
          </div>
          <p className="max-w-md text-xs sm:text-sm font-bold leading-relaxed text-black/70 font-cuerpo">
            Buscamos, filtramos y ordenamos las mejores ofertas de zapatillas en tiendas oficiales de Argentina con talles verificados.
          </p>
          <div className="inline-block rounded-[6px] border-2 border-[#111] bg-[#FFF0EB] px-3 py-2 text-[11px] sm:text-xs font-black text-[#FF4500] shadow-[2px_2px_0px_#111]">
            Los precios y el stock pueden variar en tiempo real según cada tienda oficial.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:contents">
          <div className="space-y-2.5 sm:space-y-4 lg:justify-self-center">
            <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#111] font-titulos">Navegación</p>
            <div className="space-y-2 sm:space-y-3">
              <Link href="/" className="block text-xs sm:text-sm font-bold text-black/60 transition-colors hover:text-[#FF4500]">
                Inicio
              </Link>
              <Link href="/comparador" className="block text-xs sm:text-sm font-bold text-black/60 transition-colors hover:text-[#FF4500]">
                Comparador de precios
              </Link>
              <Link href="/#ofertas" className="block text-xs sm:text-sm font-bold text-black/60 transition-colors hover:text-[#FF4500]">
                Ofertas destacadas
              </Link>
            </div>
          </div>

          <div className="space-y-2.5 sm:space-y-4 lg:justify-self-end">
            <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#111] font-titulos">Contacto</p>
            <div className="space-y-2 sm:space-y-3">
              <a href="mailto:hola@pisandoofertas.com" className="block text-xs sm:text-sm font-bold text-black/60 transition-colors hover:text-[#FF4500] truncate">
                hola@pisandoofertas.com
              </a>
              <p className="block text-xs sm:text-sm font-bold text-black/60">
                Buenos Aires, Argentina
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="contenedor mt-8 sm:mt-12 pt-5 sm:pt-8 border-t-2 border-[#111]/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <p className="text-[11px] sm:text-xs font-bold text-black/50">
          © {new Date().getFullYear()} Pisando Ofertas. Todos los derechos reservados.
        </p>
        <p className="text-[11px] sm:text-xs font-bold text-black/40">
          Construido para sneakerheads de Argentina.
        </p>
      </div>
    </footer>
  );
}
