import { obtenerTodasLasOfertasMoov } from "../src/lib/connectors/moov.ts";

async function run() {
  console.log("Scraping 5 pages of Moov sale...");
  try {
    const products = await obtenerTodasLasOfertasMoov({
      paginas: 5,
    });
    console.log(`Moov returned a total of ${products.length} products on sale.`);
    
    const suede = products.filter(p => p.name.toLowerCase().includes("suede"));
    console.log(`\n--- Suede products found in Moov Sale (${suede.length}) ---`);
    suede.forEach(p => {
      console.log(`ID: ${p.id} | Name: ${p.name} | Price: $${p.price} | Disc: ${p.discount}%`);
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
