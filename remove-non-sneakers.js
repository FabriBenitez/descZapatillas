const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "src/data/productos-db.json");
const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));

const terminosSospechosos = ["pantorrillera", "venda", "canillera", "botinero", "rodillera", "tobillera", "cinta", "muñequera", "cinturon", "balon"];

const filtrados = data.filter(p => {
  const nombre = p.name.toLowerCase();
  
  // Un producto es sospechoso si no tiene zapatilla, zapa, sneaker ni botin
  const esZapaOBotin = nombre.includes("zapatilla") || nombre.includes("zapa") || nombre.includes("sneaker") || nombre.includes("botin") || nombre.includes("botín") || nombre.includes("zapato") || nombre.includes("calzado") || nombre.includes("tenis");
  
  if (!esZapaOBotin) {
    return false; // remover
  }
  return true;
});

console.log(`Quedan: ${filtrados.length}`);

fs.writeFileSync(dbPath, JSON.stringify(filtrados, null, 2), "utf8");
