import Link from "next/link";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function ProductNotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 py-16">
        <div className="contenedor">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_55px_rgba(15,23,42,0.05)]">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
              Producto no encontrado
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
              Ese producto ya no esta disponible en el comparador
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Puede haber cambiado de URL, haberse dado de baja o todavia no
              estar sincronizado con Firestore.
            </p>
            <Link href="/comparador" className="boton mt-8 justify-center">
              Volver al comparador
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
