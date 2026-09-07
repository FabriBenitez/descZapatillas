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
// Configuración de búsquedas
// =============================================
// En vez de 44 queries por tienda (que traen duplicados),
// usamos 3 queries directas con más páginas para mayor cobertura.
// Cada tienda ya filtra por su sección de sale internamente.
// En vez de buscar solo "zapatillas" y chocar con el límite de 2500 de la API,
// hacemos fragmentación por marcas para traer el 100% del catálogo sin censura.
const TODAS_LAS_BUSQUEDAS = [
  { query: "nike", paginas: 25 },
  { query: "adidas", paginas: 25 },
  { query: "puma", paginas: 25 },
  { query: "reebok", paginas: 15 },
  { query: "under armour", paginas: 15 },
  { query: "asics", paginas: 15 },
  { query: "fila", paginas: 15 },
  { query: "topper", paginas: 15 },
  { query: "converse", paginas: 15 },
  { query: "vans", paginas: 15 },
  { query: "new balance", paginas: 15 },
  { query: "salomon", paginas: 15 },
  { query: "jordan", paginas: 15 },
  // Fallbacks genéricos para marcas menores y catálogos globales
  { query: "zapatillas", paginas: 35 },
  { query: "outlet", paginas: 20 },
  { query: "botines", paginas: 20 },
];

const PALABRAS_PROHIBIDAS_INDUMENTARIA = [
  "remera", "pantalon", "pantalón", "short", "campera", "medias", "calcetines",
  "buzo", "calza", " top ", " top", "jogger", "musculosa", "gorra",
  "mochila", "bolso", "riñonera", "cinta", "guantes", "pelota", "balón", "balon",
  "canillera", "muñequera", "ojota", "sandalia", "gorro", "visera", "sombrero",
  "lentes", "botella", "conjunto", "camis", "chomba", "sudadera",
  "chaleco", "vestido", "falda", "pollera", "body", "traje", "bikini",
  "malla", "sunga", "toalla", "vincha", "bolsa", "cuello",
  "parlante", "auricular", "auriculares", "altavoz", "altavoces"
];

import { esCalzadoPermitido } from "../lib/formato";

function esCalzado(producto: Producto): boolean {
  return esCalzadoPermitido(producto.name, producto.category);
}

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

  for (const { query, paginas } of busquedas) {
    console.log(`  → ${nombre}: buscando "${query}" (${paginas} pág)...`);
    try {
      const resultados = await fn({
        ...opcionesExtra,
        paginas,
        query,
        // Evitamos el scraping síncrono PDP de talles en la ingesta masiva
        // para que el scraper no tarde 6 horas ni sea bloqueado por anti-bot.
        // VTEX y Shopify ya incluyen talles automáticamente en su listado.
        evitarTalles: true,
      });

      let nuevos = 0;
      for (const p of resultados) {
        if (!productos.has(p.id)) {
          // Filtrado estricto para evitar remeras, shorts, accesorios, etc.
          if (esCalzado(p)) {
            productos.set(p.id, p);
            nuevos++;
          }
        }
      }
      console.log(`    ✓ ${resultados.length} encontrados, ${nuevos} guardados tras filtro (${productos.size} total acumulado)`);
    } catch (err) {
      console.error(`    ✗ Error en ${nombre} con query "${query}":`, err instanceof Error ? err.message : err);
    }
  }

  return Array.from(productos.values());
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const params: Record<string, string | boolean> = {};

  for (const arg of args) {
    if (arg.startsWith("--")) {
      const [rawKey, val] = arg.slice(2).split("=");
      const key = rawKey.toLowerCase();
      params[key] = val !== undefined ? val : true;
    }
  }

  return {
    tienda: typeof params.tienda === "string" ? params.tienda.toLowerCase() : undefined,
    quick: Boolean(params.quick || params.rapido || params.fast),
    paginas: typeof params.paginas === "string" ? parseInt(params.paginas, 10) : undefined,
    query: typeof params.query === "string" ? params.query : undefined,
  };
}

// =============================================
// Función principal
// =============================================

async function runScrape() {
  const inicio = Date.now();
  const args = parseCliArgs();

  let busquedasAUsar = TODAS_LAS_BUSQUEDAS;
  if (args.query) {
    busquedasAUsar = [{ query: args.query, paginas: args.paginas ?? 3 }];
  } else if (args.quick) {
    busquedasAUsar = [
      { query: "zapatillas", paginas: 2 },
      { query: "nike", paginas: 2 },
      { query: "adidas", paginas: 2 },
    ];
  } else if (args.paginas) {
    busquedasAUsar = TODAS_LAS_BUSQUEDAS.map((b) => ({ ...b, paginas: args.paginas! }));
  }

  console.log("====================================");
  console.log("🚀 Iniciando Pisando Ofertas Scraper");
  if (args.tienda) console.log(`🎯 Tienda objetivo: ${args.tienda.toUpperCase()}`);
  if (args.quick) console.log("⚡ Modo RÁPIDO activado (2 páginas por query clave)");
  if (args.query) console.log(`🔍 Query personalizada: "${args.query}"`);
  console.log(`📋 ${busquedasAUsar.length} término(s) de búsqueda configurados`);
  console.log("====================================\n");

  const tiendaFiltro = args.tienda;
  const tiendasActivas: Promise<Producto[]>[] = [];

  const ejecutarMoov = !tiendaFiltro || tiendaFiltro === "moov";
  const ejecutarGrid = !tiendaFiltro || tiendaFiltro === "grid";
  const ejecutarDexter = !tiendaFiltro || tiendaFiltro === "dexter";
  const ejecutarExternas = !tiendaFiltro || !["moov", "grid", "dexter"].includes(tiendaFiltro);

  if (ejecutarMoov) {
    tiendasActivas.push(
      scrapeTiendaMultiQuery(
        "Moov",
        (opts) => obtenerTodasLasOfertasMoov(opts as Parameters<typeof obtenerTodasLasOfertasMoov>[0]),
        busquedasAUsar,
      ),
    );
  }

  if (ejecutarGrid) {
    tiendasActivas.push(
      scrapeTiendaMultiQuery(
        "Grid",
        (opts) => obtenerTodasLasOfertasGrid(opts as Parameters<typeof obtenerTodasLasOfertasGrid>[0]),
        busquedasAUsar,
      ),
    );
  }

  if (ejecutarDexter) {
    tiendasActivas.push(
      scrapeTiendaMultiQuery(
        "Dexter",
        (opts) => obtenerTodasLasOfertasDexter(opts as Parameters<typeof obtenerTodasLasOfertasDexter>[0]),
        busquedasAUsar,
      ),
    );
  }

  if (ejecutarExternas) {
    tiendasActivas.push(
      scrapeTiendaMultiQuery(
        tiendaFiltro ? `Tienda (${tiendaFiltro})` : "Tiendas Externas",
        (opts) =>
          obtenerTodasLasOfertasTiendasExternas({
            ...(opts as Parameters<typeof obtenerTodasLasOfertasTiendasExternas>[0]),
            slugTienda:
              tiendaFiltro && !["moov", "grid", "dexter"].includes(tiendaFiltro)
                ? tiendaFiltro
                : undefined,
          }),
        busquedasAUsar,
      ),
    );
  }

  // 1. Obtener productos frescos con múltiples queries por tienda
  const promesas = await Promise.allSettled(tiendasActivas);

  const todosLosFrescos = promesas.flatMap((respuesta) =>
    respuesta.status === "fulfilled" ? respuesta.value : [],
  );

  const productosFrescos = todosLosFrescos
    .filter((p) => p.discount >= 1 && p.discount <= 100 && esCalzadoPermitido(p.name, p.category))
    .map((p) => {
      const catNorm = normalizarCategoria(p.category, p.name);
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
        existing.imageUrl = fresh.imageUrl;
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
        existing.imageUrl = fresh.imageUrl;
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
        existing.imageUrl = fresh.imageUrl;
        todosLosProductos.set(fresh.id, existing);
        actualizadosMeta++;
        if (firestore) {
          operacionesEscritura.push(() => firestore.collection("products").doc(fresh.id).set(existing));
        }
      }
    }
  }

  // 4. Limpieza inteligente:
  // - NO eliminamos productos de tiendas que no fueron parte de esta corrida.
  // - Solo eliminamos productos si:
  //   a) No son calzado permitido
  //   b) Pertenecen a una tienda procesada en esta corrida Y llevan más de 120h sin confirmarse
  let eliminadosNoCalzado = 0;
  let eliminadosObsoletos = 0;

  const HORA_EN_MS = 60 * 60 * 1000;
  // 120h (5 días): margen amplio para proteger datos ante fallos transitorios
  const umbralObsoleto = Date.now() - (120 * HORA_EN_MS);

  const tiendasProcesadas = new Set(
    productosFrescos.filter((p) => p.storeSlug).map((p) => p.storeSlug),
  );

  for (const [id, prod] of todosLosProductos.entries()) {
    let eliminarDefinitivamente = false;

    if (!esCalzadoPermitido(prod.name, prod.category)) {
      eliminarDefinitivamente = true;
      eliminadosNoCalzado++;
    } else if (tiendasProcesadas.has(prod.storeSlug)) {
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
  console.log(`🗑️  Eliminados (No es calzado): ${eliminadosNoCalzado}`);
  console.log(`🗑️  Eliminados (Obsoletos >96h): ${eliminadosObsoletos}`);
  console.log(`👟 Total en Base de Datos: ${todosLosProductos.size}`);
  console.log("====================================");
}

runScrape().catch((err) => {
  console.error("Error catastrófico en el scraping:", err);
  process.exit(1);
});
