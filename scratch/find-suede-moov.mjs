import { obtenerOfertasMoov } from "../src/lib/connectors/moov.ts";

async function check() {
  console.log("Searching Moov for Suede XL...");
  try {
    // We scrape 4 pages of Moov search specifically for 'suede xl'
    const results = [];
    for (let page = 0; page < 4; page++) {
      const pageResult = await obtenerOfertasMoov({
        start: page * 36,
        size: 36,
        query: "suede xl",
        sortRule: "product-discount",
      });
      console.log(`Page ${page + 1}: Found ${pageResult.length} items`);
      results.push(...pageResult);
      if (pageResult.length === 0) break;
    }

    console.log(`Total found: ${results.length}`);
    const unique = new Map();
    results.forEach(p => unique.set(p.id, p));

    console.log("\n--- Unique Suede XL found on Moov ---");
    for (const p of unique.values()) {
      console.log(`ID: ${p.id} | Name: ${p.name} | Price: $${p.price} | Discount: ${p.discount}% | URL: ${p.productUrl}`);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

check();
