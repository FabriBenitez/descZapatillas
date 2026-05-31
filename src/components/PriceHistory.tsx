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
      <section className="panel-premium p-6 rounded-[24px] border-[#e2e7e4]">
        <h2 className="titulo-seccion font-titulos text-[#0f1311]">Historial de precios</h2>
        <p className="mt-2 text-sm text-black/40">
          Todavía no hay suficientes registros históricos para este producto.
        </p>
      </section>
    );
  }

  const precioMayor = Math.max(...historial.map((registro) => registro.precio));
  const precioMenor = Math.min(...historial.map((registro) => registro.precio));

  return (
    <section className="historial-precios panel-premium p-6 sm:p-8 rounded-[24px] border-[#e2e7e4]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="seccion-cabecera">
          <h2 className="titulo-seccion font-titulos text-[#0f1311] tracking-tight">Historial de precios</h2>
          <p className="max-w-2xl text-xs font-semibold leading-relaxed text-black/40 mt-1">
            Evolución reciente del precio para validar si el descuento actual realmente representa una oportunidad.
          </p>
        </div>
        <div className="rounded-[18px] bg-[#10b981]/8 border border-[#10b981]/25 px-5 py-3 shadow-sm shadow-[#10b981]/5 min-w-[180px]">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#047857]">
            Piso detectado
          </p>
          <p className="mt-0.5 text-2xl font-black font-titulos text-[#0f1311]">
            {formatearPrecio(precioMenor)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <div className="rounded-[22px] border border-[#e2e7e4]/60 bg-[#f0f3f1] p-5 shadow-inner">
          <div className="space-y-4">
            {historial.map((registro) => {
              const esPrecioMinimo = registro.precio === precioMenor;
              const esPrecioMaximo = registro.precio === precioMayor;

              let claseBarra = "h-full rounded-full bg-gradient-to-r from-[#10b981] to-[#059669] transition-all duration-500";
              if (esPrecioMinimo) {
                claseBarra = "h-full rounded-full bg-gradient-to-r from-[#10b981] to-[#00f59b] shadow-md shadow-[#10b981]/20 transition-all duration-500";
              } else if (esPrecioMaximo) {
                claseBarra = "h-full rounded-full bg-black/25 transition-all duration-500";
              }

              return (
                <div key={registro.fecha} className="grid gap-1.5 group">
                  <div className="flex items-center justify-between gap-4 text-xs font-bold">
                    <span className="text-[#0f1311] group-hover:text-[#10b981] transition-colors" suppressHydrationWarning>
                      {formatearFecha(registro.fecha)}
                    </span>
                    <span className={esPrecioMinimo ? "text-[#047857] font-black" : "text-black/60"}>
                      {formatearPrecio(registro.precio)}
                      {esPrecioMinimo ? " (Mínimo)" : ""}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-white border border-[#e2e7e4]/30 overflow-hidden p-[2px]">
                    <div
                      className={claseBarra}
                      style={{ width: obtenerAnchoBarra(registro, precioMayor) }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto rounded-[22px] border border-[#e2e7e4]/60 bg-white">
          <table className="min-w-full text-left text-xs">
            <thead className="border-b border-[#e2e7e4]/80 bg-[#f0f3f1] text-black/50">
              <tr>
                <th className="px-4 py-3 font-extrabold uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-wider">Precio</th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-wider">Anterior</th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-wider">Desc.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e7e4]/60 text-black/80">
              {historial.map((registro) => {
                const esPrecioMinimo = registro.precio === precioMenor;

                return (
                  <tr key={registro.fecha} className="transition duration-150 hover:bg-[#10b981]/5">
                    <td className="px-4 py-3.5 font-bold" suppressHydrationWarning>
                      {formatearFecha(registro.fecha)}
                    </td>
                    <td className={`px-4 py-3.5 font-black ${esPrecioMinimo ? "text-[#047857]" : ""}`}>
                      {formatearPrecio(registro.precio)}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-black/40">
                      {formatearPrecio(registro.precioAnterior)}
                    </td>
                    <td className="px-4 py-3.5 font-black text-[#10b981]">
                      {formatearPorcentaje(registro.descuento)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
