import fs from "node:fs/promises";
import path from "node:path";

async function run() {
  const dbPath = path.join(process.cwd(), "src", "data", "productos-db.json");
  const content = await fs.readFile(dbPath, "utf-8");
  const products = JSON.parse(content);
  
  const botines = products.filter(p => p.name.toLowerCase().includes("botin"));
  
  console.log(`Total botines in database: ${botines.length}`);
  
  // Show breakdown by store
  const storeCounts = {};
  botines.forEach(p => {
    storeCounts[p.storeName] = (storeCounts[p.storeName] || 0) + 1;
  });
  console.log("Botines by store:", storeCounts);
  
  // Show a few samples
  console.log("\nSamples:");
  botines.slice(0, 10).forEach(p => {
    console.log(` - ${p.name} | Store: ${p.storeName} | Brand: ${p.brand} | Price: $${p.price} | Discount: ${p.discount}%`);
  });
}

run();
