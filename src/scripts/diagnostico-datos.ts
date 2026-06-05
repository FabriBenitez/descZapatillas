import fs from "node:fs/promises";
import path from "node:path";
import type { Producto } from "../types/producto";

async function diagnosticarDatos() {
  const dbPath = path.join(process.cwd(), "src", "data", "productos-db.json");
  const raw = await fs.readFile(dbPath, "utf-8");
  const prods = JSON.parse(raw) as Producto[];

  const conTalles = prods.filter(p => p.sizes && p.sizes.length > 0);
  const sinTalles = prods.filter(p => !p.sizes || p.sizes.length === 0);
  const talle40 = prods.filter(p => p.sizes && p.sizes.includes("40"));
  const conColor = prods.filter(p => p.color && p.color !== "Varios");
  const sinColor = prods.filter(p => !p.color || p.color === "Varios");
  const disponibles = prods.filter(p => p.available === true);
  const noDisponibles = prods.filter(p => p.available === false);

  console.log("=== DIAGNÓSTICO DE DATOS ===");
  console.log("Total productos:", prods.length);
  console.log("Con talles:", conTalles.length);
  console.log("Sin talles:", sinTalles.length);
  console.log("Con talle 40:", talle40.length);
  console.log("Con color real (no Varios):", conColor.length);
  console.log("Sin color / color=Varios:", sinColor.length);
  console.log("Disponibles (available=true):", disponibles.length);
  console.log("No disponibles:", noDisponibles.length);

  // Muestra de productos con talle 40
  const muestra = talle40.slice(0, 3).map(p => ({
    nombre: p.name,
    talles: p.sizes,
    tienda: p.storeName,
    color: p.color
  }));
  console.log("\nMuestra talle 40:", JSON.stringify(muestra, null, 2));

  // Colores únicos
  const coloresUnicos = Array.from(new Set(prods.map(p => p.color))).slice(0, 20);
  console.log("\nPrimeros 20 colores únicos:", coloresUnicos);
}

diagnosticarDatos().catch(console.error);
