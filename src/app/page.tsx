import { ComparadorHome } from "@/components/ComparadorHome";
import { obtenerProductos } from "@/lib/productos";

export default async function Home() {
  const productos = await obtenerProductos();

  return <ComparadorHome productos={productos} />;
}
