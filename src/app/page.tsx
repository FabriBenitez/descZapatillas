export const revalidate = 86400; // Cachear estáticamente en CDN por 24 horas (se actualiza automáticamente en cada deploy del scraper)

import { ComparadorHome } from "@/components/ComparadorHome";
import {
  obtenerOpcionesFiltros,
  obtenerProductosDestacados,
} from "@/lib/comparador";
import { obtenerProductosSinHistorial } from "@/lib/productos";

export default async function Home() {
  const productos = await obtenerProductosSinHistorial();
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
