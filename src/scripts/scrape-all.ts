import fs from "node:fs/promises";
import path from "node:path";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore/lite";
import { obtenerFirestoreCliente } from "../lib/firebase";
import { obtenerTodasLasOfertasMoov } from "../lib/connectors/moov";
import { obtenerTodasLasOfertasGrid } from "../lib/connectors/grid";
import { obtenerTodasLasOfertasDexter } from "../lib/connectors/dexter";
import { obtenerTodasLasOfertasTiendasExternas } from "../lib/connectors/tiendas-externas";
import type { Producto } from "../types/producto";
import { normalizarMarca, normalizarTallesArray, normalizarTalleUnico, normalizarCategoria, normalizarColor, normalizarGenero } from "../lib/formato";

// =============================================
// Configuración de búsquedas masivas
// =============================================

// Búsquedas principales por categoría (con muchas páginas para ser exhaustivos)
const BUSQUEDAS_PRINCIPALES = [
  { query: "zapatillas", paginas: 200 },
  { query: "botines", paginas: 80 },
  { query: "calzado", paginas: 50 },
  { query: "sneakers", paginas: 30 },
];

// Búsquedas por marca (para capturar productos que no aparecen en categorías genéricas)
const BUSQUEDAS_MARCAS = [
  { query: "nike", paginas: 100 },
  { query: "adidas", paginas: 100 },
  { query: "puma", paginas: 100 },
  { query: "new balance", paginas: 50 },
  { query: "reebok", paginas: 50 },
  { query: "under armour", paginas: 50 },
  { query: "fila", paginas: 50 },
  { query: "vans", paginas: 30 },
  { query: "converse", paginas: 30 },
  { query: "skechers", paginas: 30 },
  { query: "asics", paginas: 30 },
  { query: "mizuno", paginas: 30 },
  { query: "salomon", paginas: 30 },
  { query: "hoka", paginas: 30 },
  { query: "saucony", paginas: 30 },
  { query: "jordan", paginas: 30 },
  { query: "lacoste", paginas: 30 },
  { query: "umbro", paginas: 30 },
  { query: "topper", paginas: 30 },
  { query: "diadora", paginas: 30 },
  { query: "lotto", paginas: 30 },
  { query: "penalty", paginas: 30 },
  { query: "olympikus", paginas: 30 },
];

// Búsquedas por deporte/actividad
const BUSQUEDAS_CATEGORIAS = [
  { query: "running", paginas: 100 },
  { query: "training", paginas: 50 },
  { query: "futbol", paginas: 50 },
  { query: "basketball", paginas: 50 },
  { query: "tenis", paginas: 30 },
  { query: "outdoor", paginas: 30 },
  { query: "skateboarding", paginas: 30 },
  { query: "urbano", paginas: 30 },
  { query: "lifestyle", paginas: 30 },
];

const TODAS_LAS_BUSQUEDAS = [
  ...BUSQUEDAS_PRINCIPALES,
  ...BUSQUEDAS_MARCAS,
  ...BUSQUEDAS_CATEGORIAS,
];

// =============================================
// Helper de scraping multi-query
// =============================================

async function scrapeTiendaMultiQuery(
  nombre: string,
  fn: (opts: Record<string, unknown>) => Promise<Producto[]>,
  busquedas: { query: string; paginas: number }[],
  opcionesExtra: Record<string, unknown> = {},
): Promise<Producto[]> {
  const productos = new Map<string, Producto>();
  let esPrimeraBusqueda = true;

  for (const { query, paginas } of busquedas) {
    console.log(`  → ${nombre}: buscando "${query}" (${paginas} pág)...`);
    try {
      const resultados = await fn({
        ...opcionesExtra,
        paginas,
        query,
        // Solo enriquecer talles (scraping de detalle) en la primera búsqueda
        // para no sobrecargar con requests de detalle en cada query
        evitarTalles: !esPrimeraBusqueda,
      });

      let nuevos = 0;
      for (const p of resultados) {
        if (!productos.has(p.id)) {
          productos.set(p.id, p);
          nuevos++;
        }
      }
      console.log(`    ✓ ${resultados.length} encontrados, ${nuevos} nuevos (${productos.size} total acumulado)`);
    } catch (err) {
      console.error(`    ✗ Error en ${nombre} con query "${query}":`, err instanceof Error ? err.message : err);
    }
    esPrimeraBusqueda = false;
  }

  return Array.from(productos.values());
}

// =============================================
// Función principal
// =============================================

async function runScrape() {
  const inicio = Date.now();
  console.log("====================================");
  console.log("🚀 Iniciando scraping MASIVO multi-query");
  console.log(`📋 ${TODAS_LAS_BUSQUEDAS.length} términos de búsqueda por tienda`);
  console.log(`🏪 7 tiendas (Moov, Grid, Dexter, StockCenter, SoloDeportes, SevenSport, TiendaFuencarral)`);
  console.log("====================================\n");

  // 1. Obtener productos frescos con múltiples queries por tienda
  // Ejecutamos cada tienda en paralelo, pero las queries dentro de cada tienda van en secuencia
  const promesas = await Promise.allSettled([
    scrapeTiendaMultiQuery(
      "Moov",
      (opts) => obtenerTodasLasOfertasMoov(opts as Parameters<typeof obtenerTodasLasOfertasMoov>[0]),
      TODAS_LAS_BUSQUEDAS,
    ),
    scrapeTiendaMultiQuery(
      "Grid",
      (opts) => obtenerTodasLasOfertasGrid(opts as Parameters<typeof obtenerTodasLasOfertasGrid>[0]),
      TODAS_LAS_BUSQUEDAS,
    ),
    scrapeTiendaMultiQuery(
      "Dexter",
      (opts) => obtenerTodasLasOfertasDexter(opts as Parameters<typeof obtenerTodasLasOfertasDexter>[0]),
      TODAS_LAS_BUSQUEDAS,
      { categoryId: "sale" },
    ),
    scrapeTiendaMultiQuery(
      "Tiendas Externas",
      (opts) => obtenerTodasLasOfertasTiendasExternas(opts as Parameters<typeof obtenerTodasLasOfertasTiendasExternas>[0]),
      TODAS_LAS_BUSQUEDAS,
    ),
  ]);

  const todosLosFrescos = promesas.flatMap((respuesta) =>
    respuesta.status === "fulfilled" ? respuesta.value : [],
  );

  const productosFrescos = todosLosFrescos
    .filter((p) => p.discount >= 1 && p.discount <= 100)
    .map((p) => ({
      ...p,
      brand: normalizarMarca(p.brand),
      sizes: normalizarTallesArray(p.sizes || []),
      size: p.size ? normalizarTalleUnico(p.size) : undefined,
      category: normalizarCategoria(p.category ?? ""),
      color: normalizarColor(p.color),
      gender: normalizarGenero(p.gender)
    }));

  console.log(`\n📊 Se encontraron ${productosFrescos.length} ofertas frescas en total.`);

  if (productosFrescos.length === 0) {
    console.log("No se obtuvieron ofertas nuevas. Saliendo...");
    return;
  }

  // 2. Obtener base de datos actual
  const firestore = obtenerFirestoreCliente();
  const productosExistentes = new Map<string, Producto>();

  if (firestore) {
    console.log("🔌 Conectado a Firebase. Obteniendo productos existentes...");
    try {
      const refColeccion = collection(firestore, "products");
      const querySnapshot = await getDocs(refColeccion);
      querySnapshot.forEach((docSnapshot) => {
        productosExistentes.set(docSnapshot.id, docSnapshot.data() as Producto);
      });
    } catch (error) {
      console.error("❌ Error leyendo Firebase:", error);
    }
  } else {
    console.log("⚠️ No hay configuración de Firebase. Usando JSON local fallback.");
    const dbPath = path.join(process.cwd(), "src", "data", "productos-db.json");
    try {
      const dbContent = await fs.readFile(dbPath, "utf-8");
      const productosLocales = JSON.parse(dbContent) as Producto[];
      if (Array.isArray(productosLocales)) {
        productosLocales.forEach((prod) => {
          productosExistentes.set(prod.id, prod);
        });
      }
    } catch (err) {
      console.log("No se encontró base de datos previa o está corrupta. Empezando de cero.");
    }
  }

  console.log(`📦 Base de datos actual: ${productosExistentes.size} productos`);

  // 3. Emparejar y procesar actualizaciones
  let creados = 0;
  let actualizadosPrecio = 0;
  let actualizadosMeta = 0;
  const operacionesEscritura: (() => Promise<void>)[] = [];

  const fechaActualizacion = new Date().toISOString();
  const todosLosProductos = new Map<string, Producto>(productosExistentes);

  for (const fresh of productosFrescos) {
    const existing = productosExistentes.get(fresh.id);

    if (!existing) {
      // Inicializar producto nuevo
      fresh.historicalBestPrice = fresh.price;
      fresh.priceHistory = [
        {
          fecha: fechaActualizacion,
          precio: fresh.price,
          precioAnterior: fresh.listPrice,
          descuento: fresh.discount,
        },
      ];
      fresh.updatedAt = fechaActualizacion;

      creados++;
      todosLosProductos.set(fresh.id, fresh);
      if (firestore) {
        operacionesEscritura.push(() => setDoc(doc(firestore, "products", fresh.id), fresh));
      }
    } else {
      // Producto existente
      const precioCambio = existing.price !== fresh.price;
      const disponibleCambio = existing.available !== fresh.available;

      const historial = existing.priceHistory ?? [];

      if (precioCambio) {
        historial.push({
          fecha: fechaActualizacion,
          precio: fresh.price,
          precioAnterior: fresh.listPrice,
          descuento: fresh.discount,
        });

        if (historial.length > 15) {
          historial.shift();
        }

        existing.price = fresh.price;
        existing.listPrice = fresh.listPrice;
        existing.discount = fresh.discount;
        existing.offerType = fresh.offerType;
        existing.historicalBestPrice = Math.min(
          existing.historicalBestPrice ?? existing.price,
          fresh.price,
        );
        existing.priceHistory = historial;
        existing.updatedAt = fechaActualizacion;
        existing.available = fresh.available;

        if (fresh.sizes && fresh.sizes.length > 0) {
          existing.sizes = fresh.sizes;
          existing.size = fresh.size;
        }

        actualizadosPrecio++;
        todosLosProductos.set(fresh.id, existing);
        if (firestore) {
          operacionesEscritura.push(() => setDoc(doc(firestore, "products", fresh.id), existing));
        }
      } else if (
        disponibleCambio ||
        fresh.sizes?.length !== existing.sizes?.length
      ) {
        existing.available = fresh.available;
        existing.updatedAt = fechaActualizacion;
        if (fresh.sizes && fresh.sizes.length > 0) {
          existing.sizes = fresh.sizes;
          existing.size = fresh.size;
        }

        actualizadosMeta++;
        todosLosProductos.set(fresh.id, existing);
        if (firestore) {
          operacionesEscritura.push(() => setDoc(doc(firestore, "products", fresh.id), existing));
        }
      } else {
        existing.updatedAt = fechaActualizacion;
        todosLosProductos.set(fresh.id, existing);
        actualizadosMeta++;
        if (firestore) {
          operacionesEscritura.push(() => setDoc(doc(firestore, "products", fresh.id), existing));
        }
      }
    }
  }

  // 4. Limpieza agresiva de obsoletos
  const tiendasExitosas = new Set(productosFrescos.map((p) => p.storeSlug));
  const idsFrescos = new Set(productosFrescos.map((p) => p.id));
  let eliminadosNoVistos = 0;
  let eliminadosObsoletos = 0;

  const HORA_EN_MS = 60 * 60 * 1000;
  // Limpieza agresiva: eliminar productos no actualizados en 24 horas
  const umbralObsoleto = Date.now() - (24 * HORA_EN_MS);

  for (const [id, prod] of todosLosProductos.entries()) {
    let eliminarDefinitivamente = false;

    // Si no lo vimos en la pasada fresca, pero la tienda respondió bien
    if (!idsFrescos.has(id)) {
      if (tiendasExitosas.has(prod.storeSlug)) {
        eliminarDefinitivamente = true;
        eliminadosNoVistos++;
      }
    }

    // Evaluamos si es tan viejo que ya hay que borrarlo del todo
    if (!eliminarDefinitivamente) {
      const fechaActualizacionMs = new Date(prod.updatedAt).getTime();
      if (fechaActualizacionMs < umbralObsoleto) {
        eliminarDefinitivamente = true;
        eliminadosObsoletos++;
      }
    }

    if (eliminarDefinitivamente) {
      todosLosProductos.delete(id);
      if (firestore) {
        operacionesEscritura.push(() => deleteDoc(doc(firestore, "products", id)));
      }
    }
  }

  // 5. Ejecutar todas las escrituras en lotes
  if (firestore) {
    console.log(`💾 Guardando ${operacionesEscritura.length} operaciones en Firebase (en lotes)...`);
    const BATCH_SIZE = 50;
    for (let i = 0; i < operacionesEscritura.length; i += BATCH_SIZE) {
      const batchFns = operacionesEscritura.slice(i, i + BATCH_SIZE);
      await Promise.all(batchFns.map(fn => fn()));
    }
  } else {
    const dbPath = path.join(process.cwd(), "src", "data", "productos-db.json");
    await fs.writeFile(
      dbPath,
      JSON.stringify(Array.from(todosLosProductos.values()), null, 2),
      "utf-8",
    );
  }

  const duracion = ((Date.now() - inicio) / 1000).toFixed(1);
  console.log("\n====================================");
  console.log(`⏱️  Tiempo total: ${duracion}s`);
  console.log(`✅ Creados: ${creados}`);
  console.log(`💵 Actualizados (Precio): ${actualizadosPrecio}`);
  console.log(`🔄 Actualizados (Stock/Talles): ${actualizadosMeta}`);
  console.log(`🗑️  Eliminados (Ya no en oferta): ${eliminadosNoVistos}`);
  console.log(`🗑️  Eliminados (Obsoletos >24h): ${eliminadosObsoletos}`);
  console.log(`👟 Total en Base de Datos: ${todosLosProductos.size}`);
  console.log("====================================");
}

runScrape().catch((err) => {
  console.error("Error catastrófico en el scraping:", err);
  process.exit(1);
});
