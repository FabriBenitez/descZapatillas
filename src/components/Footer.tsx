import Link from "next/link";

export function Footer() {
  return (
    <footer className="pie-pagina mt-14 border-t border-white/10 bg-[#111713] py-10 text-white">
      <div className="contenedor grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.7fr))]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white text-sm font-black text-[#111713]">
              PO
            </span>
            <div>
              <p className="text-lg font-black">Pisando Ofertas</p>
              <p className="text-sm font-semibold text-white/50">
                Comparador premium de sneakers
              </p>
            </div>
          </div>
          <p className="max-w-md text-sm leading-6 text-white/58">
            Ofertas ordenadas para comparar precio, descuento, stock e historial
            con la menor friccion posible.
          </p>
          <p className="rounded-[16px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-white/62">
            Los precios y descuentos son informativos y pueden cambiar en la
            tienda oficial.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-black uppercase text-white">Navegacion</p>
          <Link href="/" className="block text-sm font-semibold text-white/55 transition hover:text-white">
            Inicio
          </Link>
          <Link href="/comparador" className="block text-sm font-semibold text-white/55 transition hover:text-white">
            Comparador
          </Link>
          <Link href="/#ofertas" className="block text-sm font-semibold text-white/55 transition hover:text-white">
            Ofertas destacadas
          </Link>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-black uppercase text-white">Utiles</p>
          <a className="block text-sm font-semibold text-white/55 transition hover:text-white" href="/sitemap.xml">
            Sitemap
          </a>
          <a className="block text-sm font-semibold text-white/55 transition hover:text-white" href="/robots.txt">
            Robots
          </a>
          <a className="block text-sm font-semibold text-white/55 transition hover:text-white" href="mailto:hola@pisandoofertas.com">
            Contacto
          </a>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-black uppercase text-white">Contacto</p>
          <p className="text-sm font-semibold text-white/55">hola@pisandoofertas.com</p>
          <p className="text-sm font-semibold text-white/55">Buenos Aires, Argentina</p>
          <p className="text-sm font-semibold text-white/55">
            Preparado para escalar a muchas tiendas
          </p>
        </div>
      </div>
    </footer>
  );
}
