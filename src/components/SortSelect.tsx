import type { OrdenProductos } from "@/types/producto";

interface SortSelectProps {
  valor: OrdenProductos;
  alCambiar: (valor: OrdenProductos) => void;
  ocultarEtiqueta?: boolean;
}

const opcionesOrdenamiento: Array<{
  valor: OrdenProductos;
  etiqueta: string;
}> = [
  { valor: "precio-asc", etiqueta: "Precio: menor a mayor" },
  { valor: "precio-desc", etiqueta: "Precio: mayor a menor" },
  { valor: "descuento-desc", etiqueta: "Descuento: mayor a menor" },
  { valor: "descuento-asc", etiqueta: "Descuento: menor a mayor" },
  { valor: "recientes", etiqueta: "Más recientes" },
  { valor: "historico", etiqueta: "Mejor precio histórico" },
];

export function SortSelect({ valor, alCambiar, ocultarEtiqueta = false }: SortSelectProps) {
  return (
    <label className={`grid text-[10px] font-black text-black/50 uppercase tracking-widest ${ocultarEtiqueta ? "" : "gap-2"}`}>
      {!ocultarEtiqueta && <span>Ordenar por</span>}
      <select
        value={valor}
        onChange={(evento) => alCambiar(evento.target.value as OrdenProductos)}
        className="w-full text-xs font-black text-[#111] border-2 border-[#111] bg-white px-3 py-2 rounded-[4px] focus:outline-none focus:ring-0 focus:border-[#FF4500] focus:shadow-[2px_2px_0px_#FF4500] transition-all cursor-pointer appearance-none min-h-10 sm:min-h-11"
      >
        {opcionesOrdenamiento.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
    </label>
  );
}
