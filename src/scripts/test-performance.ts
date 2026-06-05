import { collection, getDocs } from "firebase/firestore/lite";
import fs from "node:fs/promises";
import path from "node:path";
import { obtenerFirestoreCliente } from "../lib/firebase";
import { normalizarMarca, normalizarTallesArray, normalizarTalleUnico, normalizarCategoria, normalizarColor, normalizarGenero } from "../lib/formato";

async function testPerformance() {
  console.log("Iniciando pruebas de rendimiento...");
  
  // 1. Prueba de carga local (JSON)
  console.log("\n--- Prueba 1: Carga desde JSON local ---");
  const dbPath = path.join(process.cwd(), "src", "data", "productos-db.json");
  const startLocal = performance.now();
  let localProducts = [];
  try {
    const dbContent = await fs.readFile(dbPath, "utf-8");
    localProducts = JSON.parse(dbContent);
    const endLocal = performance.now();
    console.log(`✅ JSON local cargado y parseado: ${localProducts.length} productos en ${(endLocal - startLocal).toFixed(2)} ms`);
    
    // Probar tiempo de normalizacion
    const startNorm = performance.now();
    const normalizados = localProducts.map((p: any) => ({
      ...p,
      brand: normalizarMarca(p.brand || ""),
      sizes: normalizarTallesArray(p.sizes || []),
      size: p.size ? normalizarTalleUnico(p.size) : undefined,
      category: normalizarCategoria(p.category ?? ""),
      color: normalizarColor(p.color || ""),
      gender: normalizarGenero(p.gender || "")
    }));
    const endNorm = performance.now();
    console.log(`✅ Normalización local completada en ${(endNorm - startNorm).toFixed(2)} ms`);
  } catch (err) {
    console.error("Error leyendo JSON local:", err);
  }

  // 2. Prueba de Firebase
  console.log("\n--- Prueba 2: Carga desde Firebase (Firestore) ---");
  const firestore = obtenerFirestoreCliente();
  if (!firestore) {
    console.log("❌ Firebase no está configurado (variables de entorno no encontradas).");
  } else {
    const startFb = performance.now();
    try {
      const refColeccion = collection(firestore, "products");
      const respuesta = await getDocs(refColeccion);
      const endFb = performance.now();
      console.log(`✅ Firebase respondió con ${respuesta.docs.length} documentos en ${(endFb - startFb).toFixed(2)} ms`);
      
      const startParse = performance.now();
      const firestoreProducts = respuesta.docs.map(doc => doc.data());
      const endParse = performance.now();
      console.log(`✅ Extracción de datos de Firebase completada en ${(endParse - startParse).toFixed(2)} ms`);
    } catch (err) {
      console.error("Error consultando Firebase:", err);
    }
  }

  // 3. Prueba de carga del componente Comparador (obtenerProductos global)
  console.log("\n--- Prueba 3: obtenerProductos() completo ---");
  const { obtenerProductos } = await import("../lib/productos");
  const startGlobal = performance.now();
  const productosGlobal = await obtenerProductos();
  const endGlobal = performance.now();
  console.log(`✅ obtenerProductos() retornó ${productosGlobal.length} productos en ${(endGlobal - startGlobal).toFixed(2)} ms`);
}

testPerformance().catch(console.error);
