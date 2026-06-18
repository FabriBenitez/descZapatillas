import Link from "next/link";

export function Footer() {
  return (
    <footer className="pie-pagina mt-14 border-t border-white/10 bg-[#111713] py-16 text-white">
      <div className="contenedor mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3">
          
          {/* Navegación */}
          <div className="space-y-6 border-b border-white/10 py-8 md:border-b-0 md:border-r md:py-0 md:pr-12 lg:pr-24">
            <h3 className="text-[15px] font-medium text-white">Navegación</h3>
            <div className="flex flex-col space-y-3.5">
              <Link href="/" className="text-[14px] text-white/50 transition hover:text-white">Inicio</Link>
              <Link href="/comparador" className="text-[14px] text-white/50 transition hover:text-white">Comparador</Link>
              <Link href="/#ofertas" className="text-[14px] text-white/50 transition hover:text-white">Ofertas Destacadas</Link>
              <a href="mailto:hola@pisandoofertas.com" className="text-[14px] text-white/50 transition hover:text-white">Contacto</a>
            </div>
          </div>

          {/* Categorías */}
          <div className="space-y-6 border-b border-white/10 py-8 md:border-b-0 md:border-r md:py-0 md:px-12 lg:px-24">
            <h3 className="text-[15px] font-medium text-white">Categorías</h3>
            <div className="flex flex-col space-y-3.5">
              <Link href="/comparador?q=zapatillas" className="text-[14px] text-white/50 transition hover:text-white">Zapatillas</Link>
              <Link href="/comparador?q=botines" className="text-[14px] text-white/50 transition hover:text-white">Botines</Link>
              <Link href="/comparador?q=running" className="text-[14px] text-white/50 transition hover:text-white">Running</Link>
              <Link href="/comparador?q=nike" className="text-[14px] text-white/50 transition hover:text-white">Nike</Link>
              <Link href="/comparador?q=adidas" className="text-[14px] text-white/50 transition hover:text-white">Adidas</Link>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-6 py-8 md:py-0 md:pl-12 lg:pl-24">
            <h3 className="text-[15px] font-medium text-white">Legal</h3>
            <div className="flex flex-col space-y-3.5">
              <Link href="/terminos" className="text-[14px] text-white/50 transition hover:text-white">Términos y Condiciones</Link>
              <Link href="/privacidad" className="text-[14px] text-white/50 transition hover:text-white">Política de Privacidad</Link>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
