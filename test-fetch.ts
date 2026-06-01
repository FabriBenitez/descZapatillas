import { obtenerProductos } from "./src/lib/productos";

async function test() {
  const prods = await obtenerProductos();
  console.log("Total productos:", prods.length);
  if (prods.length > 0) {
    console.log("Muestra del primero:", prods[0].id);
  }
}

test();
