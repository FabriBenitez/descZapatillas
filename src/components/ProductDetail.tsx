import Image from "next/image";

import {
  calcularAhorro,
  formatearFecha,
  formatearPorcentaje,
  formatearPrecio,
} from "@/lib/formato";
import type { Producto } from "@/types/producto";

interface ProductDetailProps {
  producto: Producto;
}

export function ProductDetail({ producto }: ProductDetailProps) {
  return (
    <article className="detalle-producto grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
      <section className="grid gap-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] border border-[var(--color-linea)] bg-[#edf0e9] shadow-[var(--sombra-suave)]">
          <Image
            src={producto.imageUrl}
            alt={producto.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover"
          />
          <span className="absolute left-4 top-4 rounded-[14px] bg-[var(--color-alerta)] px-4 py-2 text-2xl font-black text-white shadow-lg">
            -{formatearPorcentaje(producto.discount)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[producto.imageUrl, producto.imageUrl, producto.imageUrl].map(
            (imagen, indice) => (
              <div
                key={`${imagen}-${indice}`}
                className="relative aspect-[4/3] overflow-hidden rounded-[14px] border border-[var(--color-linea)] bg-[#edf0e9]"
              >
                <Image
                  src={imagen}
                  alt={`${producto.name} vista ${indice + 1}`}
                  fill
                  sizes="(max-width: 1024px) 30vw, 180px"
                  className={`object-cover ${indice > 0 ? "opacity-75" : ""}`}
                />
              </div>
            ),
          )}
        </div>
      </section>

      <section className="panel-premium p-5 sm:p-6 lg:sticky lg:top-[116px] lg:self-start">
        <div className="flex flex-wrap gap-2">
          <span className="etiqueta etiqueta--oscura">{producto.brand}</span>
          <span className="etiqueta etiqueta--clara">{producto.category}</span>
          <span className="etiqueta etiqueta--brillo">{producto.storeName}</span>
        </div>

        <h1 className="mt-5 text-3xl font-black leading-tight text-[var(--color-tinta)] sm:text-5xl">
          {producto.name}
        </h1>

        <div className="mt-6 rounded-[18px] bg-[var(--color-tinta)] p-5 text-white">
          <div className="flex flex-wrap items-end gap-3">
            <p className="text-4xl font-black leading-none sm:text-5xl">
              {formatearPrecio(producto.price)}
            </p>
            <p className="text-base font-bold text-white/45 line-through">
              {formatearPrecio(producto.listPrice)}
            </p>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <span className="rounded-[12px] bg-white/8 px-3 py-2 text-sm font-bold text-white/78">
              Ahorro {formatearPrecio(calcularAhorro(producto))}
            </span>
            <span className="rounded-[12px] bg-white/8 px-3 py-2 text-sm font-bold text-white/78">
              Mejor historico {formatearPrecio(producto.historicalBestPrice ?? producto.price)}
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <article className="rounded-[14px] border border-[var(--color-linea)] bg-[#f8f9f5] p-4">
            <p className="text-xs font-black uppercase text-[var(--color-muted)]">
              Ubicacion
            </p>
            <p className="mt-1 font-black text-[var(--color-tinta)]">
              {producto.province}
            </p>
          </article>
          <article className="rounded-[14px] border border-[var(--color-linea)] bg-[#f8f9f5] p-4">
            <p className="text-xs font-black uppercase text-[var(--color-muted)]">
              Estado
            </p>
            <p className="mt-1 font-black text-[var(--color-tinta)]">
              {producto.available ? "Con stock" : "Sin stock confirmado"}
            </p>
          </article>
          <article className="rounded-[14px] border border-[var(--color-linea)] bg-[#f8f9f5] p-4 sm:col-span-2">
            <p className="text-xs font-black uppercase text-[var(--color-muted)]">
              Ultima actualizacion
            </p>
            <p className="mt-1 font-black text-[var(--color-tinta)]">
              {formatearFecha(producto.updatedAt)}
            </p>
          </article>
        </div>

        <div className="mt-5">
          <p className="text-sm font-black uppercase text-[var(--color-muted)]">
            Talles disponibles
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(producto.sizes ?? [producto.size ?? "Consultar"]).map((talle) => (
              <span key={talle} className="chip">
                {talle}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <a
            href={producto.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="boton boton--acento min-h-14 w-full"
          >
            Ver producto en la tienda
          </a>
          <span className="boton boton--fantasma w-full">
            {producto.freeShipping ? "Incluye envio gratis" : "Envio segun tienda"}
          </span>
        </div>

        <p className="mt-5 rounded-[14px] border border-[#ead7a4] bg-[#fff8e7] px-4 py-3 text-sm font-semibold leading-6 text-[#7a5b12]">
          El precio puede cambiar al ingresar a la tienda. Ultima actualizacion:{" "}
          {formatearFecha(producto.updatedAt)}.
        </p>
      </section>
    </article>
  );
}
