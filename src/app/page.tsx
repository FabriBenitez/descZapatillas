export const revalidate = 3600; // Cachear estáticamente en CDN por 1 hora (evita Fluid Active CPU en cada visita)

import { ComparadorHome } from "@/components/ComparadorHome";
import {
  obtenerOpcionesFiltros,
  obtenerProductosDestacados,
} from "@/lib/comparador";
import { obtenerProductos } from "@/lib/productos";

export default async function Home() {
  const productos = await obtenerProductos();
  const opciones = obtenerOpcionesFiltros(productos);
  const productosDestacados = obtenerProductosDestacados(productos, 16);

  return (
    <ComparadorHome
      productosDestacados={productosDestacados}
      cantidadProductos={productos.length}
      cantidadMarcas={opciones.marcas.length}
      cantidadTiendas={opciones.tiendas.length}
    />
  );
}
