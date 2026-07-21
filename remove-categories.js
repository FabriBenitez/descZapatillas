const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "src/data/productos-db.json");
const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));

const eliminados = data.filter(p => p.category === "Sandalias y Ojotas" || p.category === "Trajes De BañO" || p.category === "Sandalias" || p.category === "Ojotas");
const filtrados = data.filter(p => !(p.category === "Sandalias y Ojotas" || p.category === "Trajes De BañO" || p.category === "Sandalias" || p.category === "Ojotas"));

console.log(`Eliminados: ${eliminados.length}`);
console.log(`Quedan: ${filtrados.length}`);

fs.writeFileSync(dbPath, JSON.stringify(filtrados, null, 2), "utf8");
