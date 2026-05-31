import fs from "node:fs/promises";
import path from "node:path";

async function run() {
  const dbPath = path.join(process.cwd(), "src", "data", "productos-db.json");
  const content = await fs.readFile(dbPath, "utf-8");
  const products = JSON.parse(content);
  
  const adidasProducts = products.filter(p => p.brand.toLowerCase() === "adidas");
  
  console.log(`Total products in database: ${products.length}`);
  console.log(`Total Adidas products in database: ${adidasProducts.length}`);
  
  // Show breakdown by store
  const storeCounts = {};
  adidasProducts.forEach(p => {
    storeCounts[p.storeName] = (storeCounts[p.storeName] || 0) + 1;
  });
  console.log("Adidas products by store:", storeCounts);
  
  // Show a few samples
  console.log("\nSamples:");
  adidasProducts.slice(0, 10).forEach(p => {
    console.log(` - ${p.name} | Store: ${p.storeName} | Price: $${p.price} | ListPrice: $${p.listPrice} | Discount: ${p.discount}%`);
  });
}

run();
