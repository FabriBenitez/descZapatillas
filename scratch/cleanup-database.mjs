import fs from "node:fs/promises";
import path from "node:path";
import { esZapatilla } from "../src/lib/formato.ts";

async function run() {
  const dbPath = path.join(process.cwd(), "src", "data", "productos-db.json");
  const content = await fs.readFile(dbPath, "utf-8");
  const products = JSON.parse(content);
  
  console.log(`Initial products in DB: ${products.length}`);
  
  const cleanProducts = products.filter(p => {
    const isZapa = esZapatilla(p.name, p.category);
    if (!isZapa) {
      console.log(` Removing: ID: ${p.id} | Name: ${p.name} | Cat: ${p.category}`);
    }
    return isZapa;
  });
  
  console.log(`Final products in DB: ${cleanProducts.length}`);
  
  await fs.writeFile(dbPath, JSON.stringify(cleanProducts, null, 2), "utf-8");
  console.log("Database cleaned and saved!");
}

run();
