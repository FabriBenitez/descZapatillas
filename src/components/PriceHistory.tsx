import {
  formatearFecha,
  formatearPorcentaje,
  formatearPrecio,
} from "@/lib/formato";
import type { Producto, RegistroPrecio } from "@/types/producto";

interface PriceHistoryProps {
  producto: Producto;
}

function obtenerAnchoBarra(registro: RegistroPrecio, precioMayor: number) {
  return `${Math.max(18, (registro.precio / precioMayor) * 100)}%`;
}

export function PriceHistory({ producto }: PriceHistoryProps) {
  const historial = producto.priceHistory ?? [];

  if (historial.length === 0) {
    return (
      <section className="panel-premium p-6">
        <h2 className="titulo-seccion">Historial de precios</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Todavia no hay suficientes registros historicos para este producto.
        </p>
      </section>
    );
  }

  const precioMayor = Math.max(...historial.map((registro) => registro.precio));
  const precioMenor = Math.min(...historial.map((registro) => registro.precio));

  return (
    <section className="historial-precios panel-premium p-5 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="seccion-cabecera">
          <h2 className="titulo-seccion">Historial de precios</h2>
          <p className="max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
            Evolucion reciente del precio para validar si el descuento actual
            realmente esta en buen punto.
          </p>
        </div>
        <div className="rounded-[16px] bg-[#eef8f2] px-4 py-3">
          <p className="text-xs font-black uppercase text-[var(--color-acento-profundo)]">
            Piso detectado
          </p>
          <p className="mt-1 text-2xl font-black text-[var(--color-tinta)]">
            {formatearPrecio(precioMenor)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <div className="rounded-[18px] border border-[var(--color-linea)] bg-[#f8f9f5] p-4">
          <div className="space-y-4">
            {historial.map((registro) => (
              <div key={registro.fecha} className="grid gap-2">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-black text-[var(--color-tinta)]">
                    {formatearFecha(registro.fecha)}
                  </span>
                  <span className="font-bold text-[var(--color-muted)]">
                    {formatearPrecio(registro.precio)}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-[var(--color-acento)]"
                    style={{ width: obtenerAnchoBarra(registro, precioMayor) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-[18px] border border-[var(--color-linea)] bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--color-linea)] bg-[#f8f9f5] text-[var(--color-muted)]">
              <tr>
                <th className="px-4 py-3 font-black">Fecha</th>
                <th className="px-4 py-3 font-black">Precio</th>
                <th className="px-4 py-3 font-black">Anterior</th>
                <th className="px-4 py-3 font-black">Desc.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-linea)] text-[var(--color-texto)]">
              {historial.map((registro) => (
                <tr key={registro.fecha} className="transition hover:bg-[#fbfcf8]">
                  <td className="px-4 py-4 font-semibold">
                    {formatearFecha(registro.fecha)}
                  </td>
                  <td className="px-4 py-4 font-black">
                    {formatearPrecio(registro.precio)}
                  </td>
                  <td className="px-4 py-4 font-semibold text-[var(--color-muted)]">
                    {formatearPrecio(registro.precioAnterior)}
                  </td>
                  <td className="px-4 py-4 font-black text-[var(--color-acento-profundo)]">
                    {formatearPorcentaje(registro.descuento)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
