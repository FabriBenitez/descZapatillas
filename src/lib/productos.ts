import { collection, getDocs, doc, setDoc } from "firebase/firestore/lite";
import { unstable_cache } from "next/cache";
import fs from "node:fs/promises";
import path from "node:path";

import { productosMock } from "@/data/productos-mock";
import { obtenerTodasLasOfertasDexter } from "@/lib/connectors/dexter";
import { obtenerTodasLasOfertasGrid } from "@/lib/connectors/grid";
import { obtenerTodasLasOfertasMoov } from "@/lib/connectors/moov";
import {
  enriquecerProductoConTalles,
  type PlataformaDetalleTalles,
} from "@/lib/connectors/talles-detalle";
import { obtenerTodasLasOfertasTiendasExternas } from "@/lib/connectors/tiendas-externas";
import { obtenerFirestoreCliente } from "@/lib/firebase";
import { normalizarTexto, normalizarMarca, normalizarTallesArray, normalizarTalleUnico, normalizarCategoria, normalizarColor, normalizarGenero } from "@/lib/formato";
import productosDbRaw from "@/data/productos-db.json";
import type { Producto, RegistroPrecio, TipoOferta } from "@/types/producto";

const COLECCION_PRODUCTOS = "products";
const REVALIDACION_PRODUCTOS_SEGUNDOS = 60 * 60;

// Caché RAM (Plan C) para Vercel Serverless
// Esto guarda las búsquedas en memoria volátil por si Firebase falla y el FileSystem es Read-Only
const cacheVolatilVercel = new Map<string, Producto>();

function ordenarPorActualizacion(productos: Producto[]) {
  return [...productos].sort(
    (productoA, productoB) =>
      new Date(productoB.updatedAt).getTime() -
      new Date(productoA.updatedAt).getTime(),
  );
}

function combinarProductos(...fuentes: Producto[][]) {
  const productos = new Map<string, Producto>();

  fuentes.flat().forEach((producto) => {
    productos.set(producto.id, producto);
  });

  return ordenarPorActualizacion(Array.from(productos.values()));
}

export async function obtenerProductosConectoresSinCache() {
  const queries = [
    "zapatillas nike",
    "zapatillas adidas",
    "zapatillas puma",
    "zapatillas topper",
    "zapatillas under armour",
    "zapatillas asics",
    "zapatillas fila",
    "zapatillas reebok",
    "zapatillas salomon",
    "zapatillas converse",
    "zapatillas vans",
    "zapatillas", // Fallback para marcas menores
  ];

  const crudos = [];
  const chunkSize = 3; // 3 queries * 4 tiendas = 12 promesas en paralelo

  for (let i = 0; i < queries.length; i += chunkSize) {
    const chunkQueries = queries.slice(i, i + chunkSize);
    const promesas = [];

    for (const query of chunkQueries) {
      promesas.push(obtenerTodasLasOfertasMoov({ paginas: 1, query }));
      promesas.push(obtenerTodasLasOfertasGrid({ paginas: 1, query }));
      promesas.push(obtenerTodasLasOfertasDexter({ paginas: 1, query }));
      promesas.push(obtenerTodasLasOfertasTiendasExternas({ paginas: 1, query }));
    }

    const respuestas = await Promise.allSettled(promesas);
    const productosChunk = respuestas.flatMap((respuesta) =>
      respuesta.status === "fulfilled" ? respuesta.value : []
    );
    crudos.push(...productosChunk);
  }

  const productosUnicos = new Map<string, typeof crudos[0]>();

  crudos.forEach((p) => {
    if (!productosUnicos.has(p.id)) {
      productosUnicos.set(p.id, {
        ...p,
        brand: normalizarMarca(p.brand),
        sizes: normalizarTallesArray(p.sizes || []),
        size: p.size ? normalizarTalleUnico(p.size) : undefined,
        category: normalizarCategoria(p.category ?? ""),
        color: normalizarColor(p.color),
        gender: normalizarGenero(p.gender)
      });
    }
  });

  return Array.from(productosUnicos.values());
}

const obtenerProductosConectores = unstable_cache(
  obtenerProductosConectoresSinCache,
  ["productos-conectores"],
  {
    revalidate: REVALIDACION_PRODUCTOS_SEGUNDOS,
    tags: ["productos"],
  },
);

function leerTexto(
  valor: unknown,
  valorPorDefecto = "",
 ): string {
  return typeof valor === "string" ? valor : valorPorDefecto;
}

function leerTextoOpcional(valor: unknown) {
  return typeof valor === "string" && valor.length > 0 ? valor : undefined;
}

function leerTipoOferta(valor: unknown): TipoOferta | undefined {
  if (
    valor === "flash" ||
    valor === "outlet" ||
    valor === "liquidacion" ||
    valor === "temporada"
  ) {
    return valor;
  }

  return undefined;
}

function leerNumero(valor: unknown, valorPorDefecto = 0) {
  return typeof valor === "number" && Number.isFinite(valor)
    ? valor
    : valorPorDefecto;
}

function leerBooleano(valor: unknown, valorPorDefecto = false) {
  return typeof valor === "boolean" ? valor : valorPorDefecto;
}

function leerArregloTexto(valor: unknown) {
  if (!Array.isArray(valor)) {
    return undefined;
  }

  return valor.filter((item): item is string => typeof item === "string");
}

function leerHistorial(valor: unknown): RegistroPrecio[] | undefined {
  if (!Array.isArray(valor)) {
    return undefined;
  }

  return valor
    .map((registro) => {
      if (!registro || typeof registro !== "object") {
        return null;
      }

      const registroPlano = registro as Record<string, unknown>;
      const fecha = leerTexto(registroPlano.fecha);
      const precio = leerNumero(registroPlano.precio);
      const precioAnterior = leerNumero(registroPlano.precioAnterior);

      if (!fecha || !precio) {
        return null;
      }

      return {
        fecha,
        precio,
        precioAnterior,
        descuento: leerNumero(registroPlano.descuento),
      };
    })
    .filter((registro): registro is RegistroPrecio => Boolean(registro));
}

function normalizarProductoFirestore(
  id: string,
  datos: Record<string, unknown>,
): Producto | null {
  const nombre = leerTexto(datos.name);
  const precio = leerNumero(datos.price);
  const precioLista = leerNumero(datos.listPrice);

  if (!nombre || !precio) {
    return null;
  }

  const historial = leerHistorial(datos.priceHistory);

  return {
    id,
    storeSlug: leerTexto(datos.storeSlug),
    storeName: leerTexto(datos.storeName),
    name: nombre,
    normalizedName:
      leerTexto(datos.normalizedName) || normalizarTexto(nombre),
    brand: leerTexto(datos.brand),
    category: leerTexto(datos.category),
    gender: leerTexto(datos.gender),
    color: leerTexto(datos.color),
    size: leerTextoOpcional(datos.size),
    sizes: leerArregloTexto(datos.sizes),
    price: precio,
    listPrice: precioLista,
    discount: leerNumero(datos.discount),
    imageUrl: leerTexto(datos.imageUrl),
    productUrl: leerTexto(datos.productUrl),
    province: leerTexto(datos.province),
    available: leerBooleano(datos.available, true),
    updatedAt: leerTexto(datos.updatedAt),
    freeShipping: leerBooleano(datos.freeShipping),
    offerType: leerTipoOferta(datos.offerType),
    historicalBestPrice: leerNumero(datos.historicalBestPrice, precio),
    priceHistory: historial,
  };
}

function obtenerPlataformaTalles(producto: Producto): PlataformaDetalleTalles | null {
  const tiendasDemandware = new Set(["moov", "dexter", "stockcenter", "underarmour", "newbalance"]);
  const tiendasMagento = new Set(["opensports", "solodeportes", "solourbano", "tripstore"]);
  const tiendasDigitalSport = new Set(["digitalsport", "dionysos", "blast"]);

  if (tiendasDemandware.has(producto.storeSlug)) {
    return "demandware";
  }

  if (tiendasMagento.has(producto.storeSlug)) {
    return "magento";
  }

  if (tiendasDigitalSport.has(producto.storeSlug)) {
    return "digitalsport";
  }

  return null;
}

async function obtenerProductosLocales(): Promise<Producto[]> {
  try {
    const productosDb = productosDbRaw as unknown as Producto[];
    if (Array.isArray(productosDb) && productosDb.length > 0) {
      const productosNormalizados = productosDb.map((p: Producto) => ({
        ...p,
        // Eliminamos las normalizaciones en runtime para mejorar la performance
        // ya que los datos ahora se guardan limpios en el cron job
      }));
      return ordenarPorActualizacion(productosNormalizados);
    }
  } catch (error) {
    console.error("Error cargando productosDb:", error);
  }
  return productosMock;
}

export async function obtenerProductos(): Promise<Producto[]> {
  // ESTRATEGIA: Servir los datos locales (JSON bundleado) de forma INSTANTÁNEA (~35ms).
  // Firebase se usa solo desde el cron job (/api/cron/sync) para actualizar precios,
  // nunca en el critical path del usuario. Esto elimina el bloqueo de 1-2 segundos
  // que causaba la pantalla en blanco/spinner.
  const locales = await obtenerProductosLocales();
  const mapaProductos = new Map<string, Producto>();
  locales.forEach(p => mapaProductos.set(p.id, p));

  // Mezclar con la RAM caché volátil (productos frescos del cron o búsquedas en tiempo real)
  // Estos tienen prioridad por estar más actualizados.
  Array.from(cacheVolatilVercel.values()).forEach(p => mapaProductos.set(p.id, p));

  return ordenarPorActualizacion(Array.from(mapaProductos.values()));
}


export async function obtenerProductoPorId(id: string) {
  const productos = await obtenerProductos();
  // Devolvemos el producto tal cual está en la DB, sin scraping externo en tiempo de render.
  // Los talles se cargan en el cron job (/api/cron/sync) de forma asíncrona.
  // Hacer scraping aquí causaba error 500 en Vercel cuando la tienda tardaba > 10s.
  return productos.find((item) => item.id === id) ?? null;
}

export async function buscarProductosEnTiendasEnTiempoReal(query: string): Promise<Producto[]> {
  if (!query || query.trim().length < 3) {
    return [];
  }

  const inicio = Date.now();
  console.log(`[Búsqueda Tiempo Real] Iniciando búsqueda dirigida para: "${query}"`);

  // Raspado dirigido en tiempo real (Bajado a 1 página por tienda porque la BD ya tiene todo, esto es solo para precios ultra frescos)
  const respuestas = await Promise.allSettled([
    obtenerTodasLasOfertasMoov({ paginas: 1, query, evitarTalles: true }),
    obtenerTodasLasOfertasGrid({ paginas: 1, query, evitarTalles: true }),
    obtenerTodasLasOfertasDexter({ paginas: 1, query, categoryId: "sale", evitarTalles: true }),
    obtenerTodasLasOfertasTiendasExternas({ paginas: 1, query, evitarTalles: true }),
  ]);

  const todosLosNuevos = respuestas.flatMap((respuesta) =>
    respuesta.status === "fulfilled" ? respuesta.value : [],
  );

  const nuevosProductos = todosLosNuevos
    .filter((p) => p.discount >= 1 && p.discount <= 100)
    .map(p => ({
      ...p,
      brand: normalizarMarca(p.brand),
      sizes: normalizarTallesArray(p.sizes || []),
      size: p.size ? normalizarTalleUnico(p.size) : undefined,
      category: normalizarCategoria(p.category ?? ""),
      color: normalizarColor(p.color),
      gender: normalizarGenero(p.gender)
    }));

  console.log(`[Búsqueda Tiempo Real] Encontrados ${nuevosProductos.length} productos en ${Date.now() - inicio}ms`);

  // 0. Guardar en RAM Caché (Plan C)
  nuevosProductos.forEach(p => cacheVolatilVercel.set(p.id, p));

  if (nuevosProductos.length === 0) {
    return [];
  }

  // Guardar/Actualizar en la base de datos (Firestore o archivo local)
  const firestore = obtenerFirestoreCliente();
  const fecha = new Date().toISOString();

  if (firestore) {
    try {
      const promesas = nuevosProductos.map((prod) => {
        prod.updatedAt = fecha;
        return setDoc(doc(firestore, "products", prod.id), prod, { merge: true });
      });
      // Guardar en lotes paralelos
      await Promise.all(promesas);
    } catch (err) {
      console.error("Error guardando en Firestore durante búsqueda en tiempo real:", err);
    }
  } else {
    try {
      const dbPath = path.join(process.cwd(), "src", "data", "productos-db.json");
      let productosExistentes: Producto[] = [];
      try {
        const dbContent = await fs.readFile(dbPath, "utf-8");
        productosExistentes = JSON.parse(dbContent) as Producto[];
      } catch (err) {
        // Si no existe, empezamos vacío
      }

      const mapaProductos = new Map<string, Producto>();
      productosExistentes.forEach((p) => mapaProductos.set(p.id, p));

      nuevosProductos.forEach((p) => {
        const existing = mapaProductos.get(p.id);
        if (existing) {
          existing.price = p.price;
          existing.listPrice = p.listPrice;
          existing.discount = p.discount;
          existing.updatedAt = fecha;
          existing.available = p.available;
          // Actualizar talles si vinieron
          if (p.sizes && p.sizes.length > 0) {
            existing.sizes = p.sizes;
            existing.size = p.size;
          }
          mapaProductos.set(p.id, existing);
        } else {
          p.updatedAt = fecha;
          mapaProductos.set(p.id, p);
        }
      });

      await fs.writeFile(
        dbPath,
        JSON.stringify(Array.from(mapaProductos.values()), null, 2),
        "utf-8"
      );
    } catch (err) {
      console.error("Error guardando en base de datos local durante búsqueda en tiempo real:", err);
    }
  }

  return nuevosProductos;
}
