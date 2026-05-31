import { obtenerOfertasTiendaExterna, tiendasExternas } from "../src/lib/connectors/tiendas-externas.ts";

async function run() {
  const query = "Adizero sl2";
  const vtexStores = tiendasExternas.filter(t => t.plataforma === "vtex");
  
  console.log(`Searching for "${query}" on VTEX stores...`);
  
  for (const store of vtexStores.slice(0, 3)) {
    try {
      console.log(`\nStore: ${store.nombre}`);
      const res = await obtenerOfertasTiendaExterna(store, { query });
      console.log(` -> Found: ${res.length} products`);
      if (res.length > 0) {
        console.log(`    Sample: ${res[0].name} | Price: ${res[0].price} | Discount: ${res[0].discount}%`);
      }
    } catch (err) {
      console.error(` -> Failed:`, err.message);
    }
  }
}

run();
