import { ProductImage } from "@/components/ProductImage";
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
  const esSuperAhorro = producto.discount >= 0.5;
  const descuentoVal = producto.discount;

  // Determinar color de badge de descuento según el nivel
  let badgeClase = "bg-gradient-to-br from-[#10b981] to-[#047857] text-white shadow-lg shadow-[#10b981]/20";
  if (descuentoVal >= 0.5) {
    badgeClase = "bg-gradient-to-br from-[#d4af37] to-[#b45309] text-white shadow-lg shadow-[#d4af37]/30 border border-[#d4af37]/20";
  } else if (descuentoVal >= 0.3) {
    badgeClase = "bg-gradient-to-br from-[#f43f5e] to-[#be123c] text-white shadow-lg shadow-[#f43f5e]/20";
  }

  return (
    <article className="detalle-producto grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
      <section className="grid gap-3">
        <div className={`relative aspect-[4/3] overflow-hidden rounded-[24px] border bg-[#f0f3f1] shadow-md transition-all duration-300 ${
          esSuperAhorro ? "border-[#d4af37]/25 shadow-[#d4af37]/5" : "border-[#e2e7e4]/80 shadow-[#10b981]/5"
        }`}>
          <ProductImage
            src={producto.imageUrl}
            alt={producto.name}
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover"
          />
          <span className={`absolute left-4 top-4 rounded-[16px] px-4.5 py-2.5 text-2xl font-black shadow-xl ${badgeClase}`}>
            -{formatearPorcentaje(producto.discount)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[producto.imageUrl, producto.imageUrl, producto.imageUrl].map(
            (imagen, indice) => (
              <div
                key={`${imagen}-${indice}`}
                className="relative aspect-[4/3] overflow-hidden rounded-[16px] border border-[#e2e7e4] bg-[#f0f3f1] group cursor-pointer"
              >
                <ProductImage
                  src={imagen}
                  alt={`${producto.name} vista ${indice + 1}`}
                  sizes="(max-width: 1024px) 30vw, 180px"
                  className={`object-cover transition-all duration-500 group-hover:scale-105 ${indice > 0 ? "opacity-70 group-hover:opacity-100" : ""}`}
                />
              </div>
            ),
          )}
        </div>
      </section>

      <section className="panel-premium p-6 sm:p-8 rounded-[26px] border-[#e2e7e4] bg-white/80 backdrop-blur-md shadow-lg lg:sticky lg:top-[116px] lg:self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-wrap gap-2">
          <span className="etiqueta etiqueta--oscura bg-[#0f1311] px-3.5 py-2 rounded-[10px] text-[10px] tracking-wider font-extrabold">{producto.brand}</span>
          <span className="etiqueta etiqueta--clara bg-[#f0f3f1] border border-[#e2e7e4]/60 text-black/70 px-3.5 py-2 rounded-[10px] text-[10px] tracking-wider font-extrabold">{producto.category}</span>
          <span className="etiqueta etiqueta--brillo bg-[#10b981]/8 border border-[#10b981]/20 text-[#047857] px-3.5 py-2 rounded-[10px] text-[10px] tracking-wider font-extrabold">{producto.storeName}</span>
        </div>

        <h1 className="mt-5 text-2xl font-bold font-titulos leading-tight text-[#0f1311] sm:text-4xl tracking-tight">
          {producto.name}
        </h1>

        <div className={`mt-6 rounded-[22px] bg-[#0f1311] p-5 sm:p-6 text-white shadow-xl ${
          esSuperAhorro
            ? "border border-[#d4af37]/35 shadow-[#d4af37]/10"
            : "border border-white/5 shadow-black/30"
        }`}>
          <div className="flex flex-wrap items-baseline gap-3">
            <p className="text-4xl font-black font-titulos leading-none sm:text-5xl tracking-tight text-white">
              {formatearPrecio(producto.price)}
            </p>
            <p className="text-base font-bold text-white/40 line-through">
              {formatearPrecio(producto.listPrice)}
            </p>
          </div>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            <span className={`rounded-[14px] border px-4.5 py-2.5 text-xs font-extrabold flex flex-col justify-center gap-0.5 ${
              esSuperAhorro
                ? "bg-[#d4af37]/10 border-[#d4af37]/20 text-[#d4af37]"
                : "bg-[#10b981]/10 border-[#10b981]/20 text-[#00f59b]"
            }`}>
              <span className="text-[9px] uppercase tracking-wider text-white/50 font-normal">Ahorro Directo</span>
              {formatearPrecio(calcularAhorro(producto))}
            </span>
            <span className="rounded-[14px] border border-white/10 bg-white/5 px-4.5 py-2.5 text-xs font-extrabold text-white/90 flex flex-col justify-center gap-0.5">
              <span className="text-[9px] uppercase tracking-wider text-white/50 font-normal">Mejor Histórico</span>
              {formatearPrecio(producto.historicalBestPrice ?? producto.price)}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <article className="rounded-[16px] border border-[#e2e7e4]/60 bg-[#f0f3f1] p-4 transition-all duration-200 hover:border-[#10b981]/25">
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-black/40">
              Ubicación
            </p>
            <p className="mt-1 text-sm font-extrabold text-[#0f1311]">
              {producto.province}
            </p>
          </article>
          <article className="rounded-[16px] border border-[#e2e7e4]/60 bg-[#f0f3f1] p-4 transition-all duration-200 hover:border-[#10b981]/25">
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-black/40">
              Disponibilidad
            </p>
            <p className="mt-1 text-sm font-extrabold text-[#0f1311]">
              {producto.available ? "En stock" : "Confirmar stock"}
            </p>
          </article>
          <article className="rounded-[16px] border border-[#e2e7e4]/60 bg-[#f0f3f1] p-4 sm:col-span-2 transition-all duration-200 hover:border-[#10b981]/25">
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-black/40">
              Última actualización
            </p>
            <p className="mt-1 text-sm font-extrabold text-[#0f1311]" suppressHydrationWarning>
              {formatearFecha(producto.updatedAt)}
            </p>
          </article>
        </div>

        <div className="mt-6">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-black/40">
            Talles disponibles
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {(producto.sizes?.length
              ? producto.sizes
              : [producto.size ?? "Consultar en tienda"]
            ).map((talle) => (
              <span key={talle} className="chip min-h-10 min-w-10 rounded-[12px] text-xs font-extrabold border-[#e2e7e4]/80 px-4 py-2 cursor-default">
                {talle}
              </span>
            ))}
          </div>
          {!producto.sizes?.length ? (
            <p className="mt-3 text-xs font-semibold leading-relaxed text-black/40">
              Esta tienda no informa talles disponibles en la grilla. Puedes confirmarlo
              al ingresar en el enlace original del producto.
            </p>
          ) : null}
        </div>

        <div className="mt-6 grid gap-3">
          <a
            href={producto.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`boton ${esSuperAhorro ? "boton--gold" : "boton--acento"} min-h-14 w-full rounded-[16px] text-sm uppercase tracking-widest font-black shadow-lg`}
          >
            Ver producto en la tienda
          </a>
          <span className="boton boton--fantasma w-full min-h-12 border-[#e2e7e4]/80 text-[#0f1311] rounded-[16px] text-xs font-bold pointer-events-none">
            {producto.freeShipping ? "Incluye envío gratis" : "Costo de envío según la tienda"}
          </span>
        </div>

        <p className="mt-5 rounded-[16px] border border-[#ead7a4]/60 bg-[#fff8e7]/80 px-4 py-3.5 text-xs font-medium leading-relaxed text-[#7a5b12]" suppressHydrationWarning>
          <strong>Advertencia:</strong> El precio publicado suele corresponder a un talle específico en liquidación (últimos pares) o a una promoción especial. Al ingresar a la tienda y elegir tu talle, el precio puede volver al valor original si este no entra en la promoción. Última actualización: {formatearFecha(producto.updatedAt)}.
        </p>
      </section>
    </article>
  );
}
