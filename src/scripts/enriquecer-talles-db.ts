import fs from "node:fs/promises";
import path from "node:path";
import { obtenerTallesDesdeDetalle, type PlataformaDetalleTalles } from "../lib/connectors/talles-detalle";
import { normalizarTallesArray, normalizarTalleUnico } from "../lib/formato";
import { obtenerFirestoreAdmin } from "../lib/firebase-admin";
import type { Producto } from "../types/producto";

// Mapeo de tiendas a plataforma de talles
const PLATAFORMAS_POR_TIENDA: Record<string, PlataformaDetalleTalles> = {
  solodeportes: "magento",
  opensports: "magento",
  tripstore: "magento",
  dexter: "demandware",
  stockcenter: "demandware",
  moov: "demandware",
  underarmour: "demandware",
  newbalance: "demandware",
  dionysos: "digitalsport",
  vans: "grimoldi",
};

interface OpcionesWorker {
  tienda?: string;
  limite?: number;
  concurrencia?: number;
  delayMs?: number;
  forzarTodos?: boolean;
}

function parseCliArgs(): OpcionesWorker {
  const args = process.argv.slice(2);
  const opciones: OpcionesWorker = {
    concurrencia: 5,
    delayMs: 200,
  };

  for (const arg of args) {
    if (arg.startsWith("--tienda=")) {
      opciones.tienda = arg.replace("--tienda=", "").trim().toLowerCase();
    } else if (arg.startsWith("--limite=")) {
      opciones.limite = parseInt(arg.replace("--limite=", "").trim(), 10);
    } else if (arg.startsWith("--concurrencia=")) {
      opciones.concurrencia = parseInt(arg.replace("--concurrencia=", "").trim(), 10);
    } else if (arg.startsWith("--delay=")) {
      opciones.delayMs = parseInt(arg.replace("--delay=", "").trim(), 10);
    } else if (arg === "--forzar") {
      opciones.forzarTodos = true;
    }
  }

  return opciones;
}

async function dormir(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const opciones = parseCliArgs();
  console.log("==========================================================");
  console.log("       WORKER DE ENRIQUECIMIENTO DE TALLES EN BACKGROUND   ");
  console.log("==========================================================");
  console.log(`Configuración:`, {
    tienda: opciones.tienda ?? "todas las compatibles",
    limite: opciones.limite ?? "sin límite",
    concurrencia: opciones.concurrencia,
    delayMs: opciones.delayMs,
    forzarTodos: Boolean(opciones.forzarTodos),
  });

  const dbPath = path.join(process.cwd(), "src", "data", "productos-db.json");
  const rawDb = await fs.readFile(dbPath, "utf-8");
  const productos: Producto[] = JSON.parse(rawDb);
  console.log(`\n📦 Total de productos en DB local: ${productos.length}`);

  // Filtrar productos candidatos a enriquecer
  const candidatos: { index: number; producto: Producto; plataforma: PlataformaDetalleTalles }[] = [];

  productos.forEach((p, index) => {
    const slug = p.storeSlug?.toLowerCase();
    const plataforma = PLATAFORMAS_POR_TIENDA[slug];
    if (!plataforma) return;

    if (opciones.tienda && slug !== opciones.tienda) return;

    const tieneTallesCompletos = Array.isArray(p.sizes) && p.sizes.length > 1;
    if (!tieneTallesCompletos || opciones.forzarTodos) {
      candidatos.push({ index, producto: p, plataforma });
    }
  });

  console.log(`🎯 Candidatos a enriquecer encontrados: ${candidatos.length}`);
  if (candidatos.length === 0) {
    console.log("✅ No hay productos pendientes de talles para la configuración seleccionada.");
    return;
  }

  const aProcesar = opciones.limite ? candidatos.slice(0, opciones.limite) : candidatos;
  console.log(`🚀 Procesando ${aProcesar.length} productos con concurrencia ${opciones.concurrencia} y stagger de ${opciones.delayMs}ms...\n`);

  let exitosos = 0;
  let conTallesEncontrados = 0;
  let totalTallesSumados = 0;
  const t0 = Date.now();

  const concurrencia = opciones.concurrencia ?? 3;
  const delayMs = opciones.delayMs ?? 200;
  let itemsGuardados = 0;

  async function guardarParcial() {
    try {
      await fs.writeFile(dbPath, JSON.stringify(productos, null, 2), "utf-8");
    } catch {}
  }

  async function procesarItem(
    item: { index: number; producto: Producto; plataforma: PlataformaDetalleTalles },
    idx: number,
  ) {
    try {
      const tallesRaw = await obtenerTallesDesdeDetalle(
        item.producto.productUrl,
        item.plataforma,
      );

      if (tallesRaw && tallesRaw.length > 0) {
        const tallesNorm = normalizarTallesArray(tallesRaw);
        item.producto.sizes = tallesNorm;
        item.producto.size = normalizarTalleUnico(tallesNorm[0]);
        item.producto.available = true;
        conTallesEncontrados++;
        totalTallesSumados += tallesNorm.length;
      }
      exitosos++;
    } catch (err: any) {
      // Ignorar errores puntuales de una PDP
    } finally {
      itemsGuardados++;
      const pct = ((itemsGuardados / aProcesar.length) * 100).toFixed(1);
      process.stdout.write(
        `\rProgreso: ${itemsGuardados}/${aProcesar.length} (${pct}%) | Con talles: ${conTallesEncontrados}`,
      );

      if (itemsGuardados % 25 === 0) {
        await guardarParcial();
      }
    }
  }

  // Pool concurrente determinista
  let poolIndex = 0;
  async function worker() {
    while (poolIndex < aProcesar.length) {
      const current = poolIndex++;
      await procesarItem(aProcesar[current], current);
      if (delayMs > 0) {
        await dormir(delayMs);
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrencia, aProcesar.length) },
    () => worker(),
  );
  await Promise.all(workers);

  const duracionSeg = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n\n✨ Proceso completado en ${duracionSeg}s.`);
  console.log(`- Solicitudes completadas: ${exitosos}`);
  console.log(`- Productos actualizados con talles: ${conTallesEncontrados}`);
  console.log(`- Promedio de talles por producto: ${(totalTallesSumados / (conTallesEncontrados || 1)).toFixed(1)}`);

  // Guardar final en productos-db.json
  console.log(`\n💾 Guardando cambios finales en ${dbPath}...`);
  await fs.writeFile(dbPath, JSON.stringify(productos, null, 2), "utf-8");
  console.log("✅ Archivo JSON actualizado correctamente.");

  // Guardar en Firestore si está disponible
  const firestore = obtenerFirestoreAdmin();
  if (firestore && conTallesEncontrados > 0) {
    console.log("🔌 Sincronizando productos actualizados en Firestore...");
    const batchSize = 400;
    const modificados = aProcesar.filter((item) => item.producto.sizes && item.producto.sizes.length > 0);
    for (let b = 0; b < modificados.length; b += batchSize) {
      const batchDocs = modificados.slice(b, b + batchSize);
      const batch = firestore.batch();
      for (const item of batchDocs) {
        const docRef = firestore.collection("products").doc(item.producto.id);
        batch.update(docRef, {
          sizes: item.producto.sizes,
          size: item.producto.size,
          available: item.producto.available,
        });
      }
      await batch.commit();
    }
    console.log(`✅ Sincronizados ${modificados.length} productos en Firestore.`);
  }

  // Verificación específica de Solo Deportes y talle 43.5 tras el enriquecimiento
  const solodeportesCon43_5 = productos.filter((p) => {
    if (p.storeSlug !== "solodeportes") return false;
    const talles = (p.sizes || []).map((t) => String(t).trim().replace(",", "."));
    return talles.includes("43.5");
  }).length;

  const solodeportesConTalles = productos.filter(
    (p) => p.storeSlug === "solodeportes" && p.sizes && p.sizes.length > 0,
  ).length;

  console.log("\n==========================================================");
  console.log(`ESTADO ACTUALIZADO DE SOLO DEPORTES EN LA DB:`);
  console.log(`- Total productos: ${productos.filter((p) => p.storeSlug === "solodeportes").length}`);
  console.log(`- Productos con talles cargados: ${solodeportesConTalles}`);
  console.log(`- Productos disponibles en talle 43.5: ${solodeportesCon43_5}`);
  console.log("==========================================================");
}

main().catch((err) => {
  console.error("❌ Error en worker de talles:", err);
  process.exit(1);
});
