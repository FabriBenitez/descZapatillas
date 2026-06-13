export const dynamic = "force-dynamic";

import { ComparadorHome } from "@/components/ComparadorHome";
import {
  obtenerOpcionesFiltros,
  obtenerProductosDestacados,
} from "@/lib/comparador";
import { obtenerProductos } from "@/lib/productos";

export default async function Home() {
  const productos = await obtenerProductos();
  const opciones = obtenerOpcionesFiltros(productos);
  const productosDestacados = obtenerProductosDestacados(productos);

  return (
    <ComparadorHome
      productosDestacados={productosDestacados}
      cantidadProductos={productos.length}
      cantidadMarcas={opciones.marcas.length}
      cantidadTiendas={opciones.tiendas.length}
    />
  );
}
