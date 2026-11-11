import fs from "node:fs/promises";
import path from "node:path";
import { obtenerProductosSinHistorial } from "../lib/productos";

async function main() {
  const t0 = performance.now();
  const productos = await obtenerProductosSinHistorial();

  // Eliminar propiedades internas que no se usan en la UI del comparador para reducir el peso del JSON
  const catalogoCompacto = productos.map((p) => {
    const copia = { ...p } as Record<string, unknown>;
    delete copia.normalizedName;
    delete copia.priceHistory;
    return copia;
  });

  const publicDir = path.join(process.cwd(), "public");
  await fs.mkdir(publicDir, { recursive: true });
  const outPath = path.join(publicDir, "productos-comparador.json");
  const jsonStr = JSON.stringify(catalogoCompacto);
  await fs.writeFile(outPath, jsonStr, "utf-8");

  const t1 = performance.now();
  const mb = (Buffer.byteLength(jsonStr, "utf-8") / 1024 / 1024).toFixed(2);
  console.log(
    `✅ Catálogo estático generado en public/productos-comparador.json: ${catalogoCompacto.length} productos (${mb} MB) en ${(t1 - t0).toFixed(0)} ms`,
  );
}

main().catch((err) => {
  console.error("❌ Error generando catálogo estático:", err);
  process.exit(1);
});
