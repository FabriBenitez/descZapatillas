import { obtenerTodasLasOfertasTiendasExternas } from "./src/lib/connectors/tiendas-externas.js";

async function run() {
  const productos = await obtenerTodasLasOfertasTiendasExternas({ paginas: 1 });
  console.log(`Encontrados: ${productos.length}`);
  const porTienda = {};
  for (const p of productos) {
    porTienda[p.storeName] = (porTienda[p.storeName] || 0) + 1;
  }
  console.log(porTienda);
}
run();
