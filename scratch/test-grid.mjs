import { obtenerOfertasGrid } from "../src/lib/connectors/grid.ts";

async function run() {
  const queries = ["zapatillas", "puma", "puma 180", "Adizero sl2"];
  for (const query of queries) {
    try {
      console.log(`\nQuerying Grid for: "${query}"`);
      const res = await obtenerOfertasGrid({ query, from: 0, size: 5 });
      console.log(`Grid Success: Found ${res.length} products`);
      if (res.length > 0) {
        console.log(`Sample: ${res[0].name} | Price: ${res[0].price}`);
      }
    } catch (err) {
      console.error(`Grid Failed for "${query}":`, err.message);
    }
  }
}

run();
