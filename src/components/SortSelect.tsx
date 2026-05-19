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
  { valor: "recientes", etiqueta: "Mas recientes" },
  { valor: "historico", etiqueta: "Mejor precio historico" },
];

export function SortSelect({ valor, alCambiar }: SortSelectProps) {
  return (
    <label className="ordenador flex flex-col gap-2 text-sm text-[var(--color-muted)]">
      <span className="font-bold">Ordenar por</span>
      <select
        value={valor}
        onChange={(evento) => alCambiar(evento.target.value as OrdenProductos)}
        className="select-base h-11 text-sm font-bold"
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
