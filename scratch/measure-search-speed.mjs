import { buscarProductosEnTiendasEnTiempoReal } from "../src/lib/productos.ts";

async function run() {
  const query = "Adizero sl2";
  console.log(`Running real-time search speed test for "${query}"...`);
  
  const start = Date.now();
  try {
    const products = await buscarProductosEnTiendasEnTiempoReal(query);
    const duration = Date.now() - start;
    console.log(`\nSearch finished in ${duration}ms!`);
    console.log(`Total new products found: ${products.length}`);
  } catch (err) {
    console.error("Search failed:", err);
  }
}

run();
