import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-white">
      <section className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-acento)]">
          404
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight">
          La pagina que buscaste no existe
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-300">
          Volve al inicio para seguir explorando ofertas de zapatillas y comparar
          precios entre tiendas.
        </p>
        <Link href="/" className="boton mt-8 justify-center">
          Ir al inicio
        </Link>
      </section>
    </main>
  );
}
