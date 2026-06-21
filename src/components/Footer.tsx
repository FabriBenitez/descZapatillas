import Link from "next/link";

export function Footer() {
  return (
    <footer className="pie-pagina mt-14 border-t border-black/5 bg-[#F7F5F0] py-16 text-[#111]">
      <div className="contenedor grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,0.8fr))]">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-black text-lg font-black text-white shadow-sm">
              PO
            </span>
            <div>
              <p className="text-xl font-black font-titulos text-[#111]">Pisando Ofertas</p>
              <p className="text-sm font-bold text-black/40 font-cuerpo">
                Sneaker Deals Tracker
              </p>
            </div>
          </div>
          <p className="max-w-md text-base font-medium leading-relaxed text-black/60 font-cuerpo">
            Buscamos, filtramos y ordenamos las mejores ofertas de zapatillas para que encuentres tu par ideal al mejor precio, sin esfuerzo.
          </p>
          <div className="inline-block rounded-[16px] border border-[#FF4500]/20 bg-[#FF4500]/5 px-4 py-3 text-xs font-bold leading-6 text-[#FF4500]">
            Los precios y descuentos son informativos y pueden cambiar en la tienda oficial.
          </div>
        </div>

        <div className="space-y-4 pt-2 lg:justify-self-center">
          <p className="text-sm font-black uppercase tracking-widest text-[#111] font-titulos">Navegación</p>
          <div className="space-y-3">
            <Link href="/" className="block text-sm font-bold text-black/50 transition-colors hover:text-[#FF4500]">
              Inicio
            </Link>
            <Link href="/comparador" className="block text-sm font-bold text-black/50 transition-colors hover:text-[#FF4500]">
              Comparador de precios
            </Link>
            <Link href="/#ofertas" className="block text-sm font-bold text-black/50 transition-colors hover:text-[#FF4500]">
              Ofertas destacadas
            </Link>
          </div>
        </div>

        <div className="space-y-4 pt-2 lg:justify-self-end">
          <p className="text-sm font-black uppercase tracking-widest text-[#111] font-titulos">Contacto</p>
          <div className="space-y-3">
            <a href="mailto:hola@pisandoofertas.com" className="block text-sm font-bold text-black/50 transition-colors hover:text-[#FF4500]">
              hola@pisandoofertas.com
            </a>
            <p className="block text-sm font-bold text-black/50">
              Buenos Aires, Argentina
            </p>
          </div>
        </div>
      </div>
      <div className="contenedor mt-16 pt-8 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs font-bold text-black/40">
          © {new Date().getFullYear()} Pisando Ofertas. Todos los derechos reservados.
        </p>
        <p className="text-xs font-bold text-black/30">
          Construido con dedicación para los sneakerheads.
        </p>
      </div>
    </footer>
  );
}
