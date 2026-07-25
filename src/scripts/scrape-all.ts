import fs from "node:fs/promises";
import path from "node:path";
import { obtenerFirestoreAdmin } from "../lib/firebase-admin";
import { obtenerTodasLasOfertasMoov } from "../lib/connectors/moov";
import { obtenerTodasLasOfertasGrid } from "../lib/connectors/grid";
import { obtenerTodasLasOfertasDexter } from "../lib/connectors/dexter";
import { obtenerTodasLasOfertasTiendasExternas } from "../lib/connectors/tiendas-externas";
import type { Producto } from "../types/producto";
import { normalizarMarca, normalizarTallesArray, normalizarTalleUnico, normalizarCategoria, normalizarColor, normalizarGenero, inferirSubcategoria } from "../lib/formato";

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
  { query: "zapatillas nike", paginas: 100 },
  { query: "zapatillas adidas", paginas: 100 },
  { query: "zapatillas puma", paginas: 100 },
  { query: "zapatillas new balance", paginas: 50 },
  { query: "zapatillas reebok", paginas: 50 },
  { query: "zapatillas under armour", paginas: 50 },
  { query: "zapatillas fila", paginas: 50 },
  { query: "zapatillas vans", paginas: 30 },
  { query: "zapatillas converse", paginas: 30 },
  { query: "zapatillas skechers", paginas: 30 },
  { query: "zapatillas asics", paginas: 30 },
  { query: "zapatillas mizuno", paginas: 30 },
  { query: "zapatillas salomon", paginas: 30 },
  { query: "zapatillas hoka", paginas: 30 },
  { query: "zapatillas saucony", paginas: 30 },
  { query: "zapatillas jordan", paginas: 30 },
  { query: "zapatillas lacoste", paginas: 30 },
  { query: "zapatillas umbro", paginas: 30 },
  { query: "zapatillas topper", paginas: 30 },
  { query: "zapatillas diadora", paginas: 30 },
  { query: "zapatillas lotto", paginas: 30 },
  { query: "zapatillas penalty", paginas: 30 },
  { query: "zapatillas olympikus", paginas: 30 },
  // Botines por marca — igual de importante
  { query: "botines adidas", paginas: 50 },
  { query: "botines nike", paginas: 50 },
  { query: "botines puma", paginas: 50 },
  { query: "botines umbro", paginas: 30 },
  { query: "botines mizuno", paginas: 30 },
  { query: "botines penalty", paginas: 30 },
  { query: "botines diadora", paginas: 30 },
  { query: "botines under armour", paginas: 30 },
  { query: "botines new balance", paginas: 20 },
  { query: "botines lotto", paginas: 20 },
];

// Búsquedas por deporte/actividad
const BUSQUEDAS_CATEGORIAS = [
  { query: "zapatillas running", paginas: 100 },
  { query: "zapatillas training", paginas: 50 },
  { query: "zapatillas futbol", paginas: 50 },
  { query: "zapatillas basketball", paginas: 50 },
  { query: "zapatillas tenis", paginas: 30 },
  { query: "zapatillas outdoor", paginas: 30 },
  { query: "zapatillas skateboarding", paginas: 30 },
  { query: "zapatillas urbano", paginas: 30 },
  { query: "zapatillas lifestyle", paginas: 30 },
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
        // Extraemos talles SOLO en la primera búsqueda principal ("zapatillas")
        // para mantener el scraper en un tiempo razonable (~2 horas) y 
        // no exceder el límite de 6 horas de GitHub Actions.
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
    .map((p) => {
      const catNorm = normalizarCategoria(p.category ?? "");
      return {
        ...p,
        brand: normalizarMarca(p.brand),
        sizes: normalizarTallesArray(p.sizes || []),
        size: p.size ? normalizarTalleUnico(p.size) : undefined,
        category: catNorm,
        subcategory: inferirSubcategoria(p.name, catNorm),
        color: normalizarColor(p.color),
        gender: normalizarGenero(p.gender),
      };
    });

  console.log(`\n📊 Se encontraron ${productosFrescos.length} ofertas frescas en total.`);

  if (productosFrescos.length === 0) {
    console.log("No se obtuvieron ofertas nuevas. Saliendo...");
    return;
  }

  // 2. Obtener base de datos actual
  const firestore = obtenerFirestoreAdmin();
  const productosExistentes = new Map<string, Producto>();

  if (firestore) {
    console.log("🔌 Conectado a Firebase. Obteniendo productos existentes...");
    try {
      const docs = await firestore.collection("products").get();
      docs.forEach((d) => {
        productosExistentes.set(d.id, d.data() as Producto);
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
  const operacionesEscritura: (() => Promise<unknown>)[] = [];

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

      todosLosProductos.set(fresh.id, fresh);
      creados++;
      if (firestore) {
        operacionesEscritura.push(() => firestore.collection("products").doc(fresh.id).set(fresh));
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
          operacionesEscritura.push(() => firestore.collection("products").doc(fresh.id).set(existing));
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
          operacionesEscritura.push(() => firestore.collection("products").doc(fresh.id).set(existing));
        }
      } else {
        existing.updatedAt = fechaActualizacion;
        todosLosProductos.set(fresh.id, existing);
        actualizadosMeta++;
        if (firestore) {
          operacionesEscritura.push(() => firestore.collection("products").doc(fresh.id).set(existing));
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
        operacionesEscritura.push(() => firestore.collection("products").doc(id).delete());
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
  }
  
  // SIEMPRE guardar en el JSON local para que el frontend pueda consumirlo sin gastar cuota de Firebase
  console.log(`💾 Guardando en productos-db.json localmente...`);
  const dbPath = path.join(process.cwd(), "src", "data", "productos-db.json");
  await fs.writeFile(
    dbPath,
    JSON.stringify(Array.from(todosLosProductos.values()), null, 2),
    "utf-8",
  );

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
