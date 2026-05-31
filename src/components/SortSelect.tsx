import type { OrdenProductos } from "@/types/producto";

interface SortSelectProps {
  valor: OrdenProductos;
  alCambiar: (valor: OrdenProductos) => void;
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

export function SortSelect({ valor, alCambiar }: SortSelectProps) {
  return (
    <label className="grid gap-1.5 text-xs font-bold text-black/50">
      <span className="uppercase tracking-wider">Ordenar por</span>
      <select
        value={valor}
        onChange={(evento) => alCambiar(evento.target.value as OrdenProductos)}
        className="select-base h-10 text-sm font-bold sm:h-11 text-[#0f1311] border-[#e2e7e4] bg-[#f0f3f1] focus:bg-white transition-all duration-200"
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
