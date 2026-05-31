import fs from "node:fs/promises";
import path from "node:path";

async function run() {
  const dbPath = path.join(process.cwd(), "src", "data", "productos-db.json");
  const content = await fs.readFile(dbPath, "utf-8");
  const products = JSON.parse(content);
  
  console.log(`Total products in DB: ${products.length}`);
  
  const nonZapas = products.filter(p => {
    const name = p.name.toLowerCase();
    return !name.includes("zapatilla") && !name.includes("sneaker");
  });
  
  console.log(`Products without 'zapatilla' or 'sneaker' in title: ${nonZapas.length}`);
  nonZapas.slice(0, 20).forEach(p => {
    console.log(` - ID: ${p.id} | Store: ${p.storeName} | Name: ${p.name} | Cat: ${p.category}`);
  });
}

run();
