const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "src/data/productos-db.json");
const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));

const terminosSospechosos = ["pantorrillera", "venda", "canillera", "media", "botinero", "rodillera", "tobillera", "cinta", "muñequera", "cinturon", "balon"];

let noZapatillas = 0;
data.forEach(p => {
  const nombre = p.name.toLowerCase();
  
  // Un producto es sospechoso si no tiene zapatilla, zapa, sneaker ni botin
  const esZapaOBotin = nombre.includes("zapatilla") || nombre.includes("zapa") || nombre.includes("sneaker") || nombre.includes("botin") || nombre.includes("botín") || nombre.includes("zapato") || nombre.includes("calzado") || nombre.includes("tenis");
  
  if (!esZapaOBotin) {
    noZapatillas++;
    // console.log(p.name);
  }
});

console.log(`Posibles NO zapatillas/botines: ${noZapatillas}`);
