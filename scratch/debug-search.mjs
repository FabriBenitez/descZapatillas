import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "src", "data", "productos-db.json");
const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

console.log(`Total productos en la DB: ${data.length}`);

// Contar por tienda
const porTienda = {};
data.forEach(p => {
  porTienda[p.storeName] = (porTienda[p.storeName] || 0) + 1;
});
console.log("\nProductos por tienda:");
Object.entries(porTienda)
  .sort((a, b) => b[1] - a[1])
  .forEach(([tienda, count]) => console.log(`  ${tienda}: ${count}`));

// Buscar un modelo específico - simulando lo que haría el usuario
const termino = process.argv[2] || "campus";
const terminoNorm = termino.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const palabras = terminoNorm.split(/\s+/).filter(Boolean);

const resultados = data.filter(p => {
  const texto = [p.name, p.brand, p.storeName, p.storeSlug].join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return palabras.every(palabra => texto.includes(palabra));
});

console.log(`\nBúsqueda "${termino}": ${resultados.length} resultados`);
resultados.forEach(p => {
  console.log(`  [${p.storeName}] ${p.name} | $${p.price} | -${p.discount}%`);
});
