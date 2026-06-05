import { filtrarProductos } from "../lib/comparador";
import data from "../data/productos-db.json" assert { type: "json" };

async function debugJordan() {
  const prods = data as any[];
  
  // 1. Solo filtro por marca "Jordan"
  const filtroMarca = {
    marca: "Jordan",
    tienda: "", precioMinimo: "", precioMaximo: "", talle: "", genero: "", categoria: "", color: "", descuentoMinimo: "", soloStock: false, tipoOferta: "", envioGratis: false, ultimaActualizacion: ""
  };
  const res1 = filtrarProductos(prods, "", filtroMarca);
  console.log("1. Solo filtro marca='Jordan':", res1.length);
  if (res1.length > 0) {
    console.log("   Producto:", res1[0].name, "| Marca:", res1[0].brand);
  }

  // 2. Solo busqueda "jordan"
  const filtroVacio = { ...filtroMarca, marca: "" };
  const res2 = filtrarProductos(prods, "jordan", filtroVacio);
  console.log("2. Solo busqueda='jordan':", res2.length);

  // 3. Marca "Jordan" + Busqueda "jordan"
  const res3 = filtrarProductos(prods, "jordan", filtroMarca);
  console.log("3. Marca='Jordan' + Busqueda='jordan':", res3.length);
}

debugJordan().catch(console.error);
