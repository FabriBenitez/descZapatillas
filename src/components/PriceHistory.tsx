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
      <section className="p-6 rounded-[8px] border-2 border-[#111] bg-[#f9f9f9] shadow-[6px_6px_0px_#e2e7e4]">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-[#111]">Historial de precios</h2>
        <p className="mt-2 text-sm font-bold text-black/50">
          Todavía no hay suficientes registros históricos para este producto.
        </p>
      </section>
    );
  }

  const precioMayor = Math.max(...historial.map((registro) => registro.precio));
  const precioMenor = Math.min(...historial.map((registro) => registro.precio));

  return (
    <section className="p-6 sm:p-8 rounded-[8px] border-2 border-[#111] bg-white shadow-[8px_8px_0px_#e2e7e4]">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-[#111]">Historial de precios</h2>
          <p className="max-w-2xl text-xs font-bold leading-relaxed text-black/50 mt-2 uppercase tracking-wide">
            Evolución reciente para validar si el descuento representa una oportunidad.
          </p>
        </div>
        <div className="rounded-[4px] bg-[#E5F529] border-2 border-[#111] px-5 py-3 shadow-[4px_4px_0px_#111] min-w-[180px]">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#111]">
            Piso detectado
          </p>
          <p className="mt-1 text-3xl font-black font-mono text-[#111]">
            {formatearPrecio(precioMenor)}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <div className="rounded-[4px] border-2 border-[#111] bg-[#f9f9f9] p-5 shadow-[4px_4px_0px_#111]">
          <div className="space-y-5">
            {historial.map((registro) => {
              const esPrecioMinimo = registro.precio === precioMenor;
              const esPrecioMaximo = registro.precio === precioMayor;

              let claseBarra = "h-full bg-black/80 transition-all duration-500";
              if (esPrecioMinimo) {
                claseBarra = "h-full bg-[#10b981] transition-all duration-500";
              } else if (esPrecioMaximo) {
                claseBarra = "h-full bg-black/20 transition-all duration-500";
              }

              return (
                <div key={registro.fecha} className="grid gap-2 group">
                  <div className="flex items-center justify-between gap-4 text-xs font-bold font-mono">
                    <span className="text-[#111] uppercase" suppressHydrationWarning>
                      {formatearFecha(registro.fecha)}
                    </span>
                    <span className={esPrecioMinimo ? "text-[#10b981] font-black" : "text-black/60"}>
                      {formatearPrecio(registro.precio)}
                      {esPrecioMinimo ? " (MÍN)" : ""}
                    </span>
                  </div>
                  <div className="h-4 bg-white border-2 border-[#111] overflow-hidden">
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

        <div className="overflow-x-auto rounded-[4px] border-2 border-[#111] bg-white shadow-[4px_4px_0px_#111]">
          <table className="min-w-full text-left text-xs">
            <thead className="border-b-2 border-[#111] bg-[#f5f5f5] text-[#111]">
              <tr>
                <th className="px-4 py-3 font-black uppercase tracking-widest border-r-2 border-[#111]">Fecha</th>
                <th className="px-4 py-3 font-black uppercase tracking-widest border-r-2 border-[#111]">Precio</th>
                <th className="px-4 py-3 font-black uppercase tracking-widest border-r-2 border-[#111]">Anterior</th>
                <th className="px-4 py-3 font-black uppercase tracking-widest">Desc.</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#111] text-[#111] font-mono">
              {historial.map((registro) => {
                const esPrecioMinimo = registro.precio === precioMenor;
                return (
                  <tr key={registro.fecha} className={esPrecioMinimo ? "bg-[#10b981]/10 font-black" : "font-bold"}>
                    <td className="px-4 py-3 whitespace-nowrap border-r-2 border-[#111]" suppressHydrationWarning>
                      {formatearFecha(registro.fecha)}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap border-r-2 border-[#111] ${esPrecioMinimo ? "text-[#10b981]" : ""}`}>
                      {formatearPrecio(registro.precio)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-black/50 border-r-2 border-[#111]">
                      {formatearPrecio(registro.precioAnterior)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {registro.descuento > 0 ? (
                        <span className="text-[#10b981] font-black">
                          {formatearPorcentaje(registro.descuento)}
                        </span>
                      ) : (
                        <span className="text-black/30">-</span>
                      )}
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
