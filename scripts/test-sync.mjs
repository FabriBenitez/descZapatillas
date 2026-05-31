import fs from "fs";
import path from "path";

// Cargar variables de entorno desde .env.local si existe
const envPath = path.resolve(process.cwd(), ".env.local");
let cronSecret = "default_sync_secret";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const match = envContent.match(/^CRON_SECRET\s*=\s*(.+)$/m);
  if (match && match[1]) {
    cronSecret = match[1].trim().replace(/['"]/g, "");
  }
}

const port = process.env.PORT || 3000;
const url = `http://localhost:${port}/api/cron/sync?secret=${cronSecret}`;

console.log("=================================================");
console.log("⚡ Lanzador Local de Sincronización - Pisando Ofertas");
console.log("=================================================\n");
console.log(`Intentando conectar con el servidor Next.js en el puerto ${port}...`);
console.log(`URL de destino: ${url.replace(cronSecret, "****")}\n`);

try {
  const response = await fetch(url);
  const data = await response.json();

  if (response.ok) {
    console.log("✅ Sincronización completada con éxito!");
    console.log("-------------------------------------------------");
    console.log(`📝 Total Procesados : ${data.totalProcesados}`);
    console.log(`➕ Creados           : ${data.creados}`);
    console.log(`🔄 Actualizados (P)  : ${data.actualizadosPrecio} (Precios/Talles)`);
    console.log(`🕒 Actualizados (M)  : ${data.actualizadosMeta} (Vigencia/Stock)`);
    console.log(`🗑️  Eliminados (Obso) : ${data.eliminadosObsoletos ?? 0} (No actualizados en 24h)`);
    console.log(`🗑️  Eliminados (No v.): ${data.eliminadosNoVistos ?? 0} (No encontrados en tienda)`);
    console.log(`⏱️  Tiempo Ejecución : ${(data.elapsedMs / 1000).toFixed(2)} segundos`);
    console.log("-------------------------------------------------");
  } else {
    console.error("❌ El servidor Next.js devolvió un error:");
    console.error(`Estado HTTP : ${response.status}`);
    console.error(`Detalle     : ${JSON.stringify(data, null, 2)}`);
  }
} catch (error) {
  console.error("❌ No se pudo establecer conexión con el servidor Next.js.");
  console.error("\n💡 Asegúrate de que el servidor esté corriendo en otra terminal:");
  console.error("   npm run dev\n");
  console.error(`Detalle del error de red: ${error.message}`);
}
console.log("\n=================================================");
