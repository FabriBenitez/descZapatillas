import fs from "node:fs/promises";
import path from "node:path";
import { obtenerTodasLasOfertasMoov } from "../lib/connectors/moov";
import { obtenerTodasLasOfertasGrid } from "../lib/connectors/grid";
import { obtenerTodasLasOfertasDexter } from "../lib/connectors/dexter";
import { obtenerTodasLasOfertasTiendasExternas } from "../lib/connectors/tiendas-externas";
import type { Producto } from "../types/producto";
import { normalizarMarca, normalizarTalle, normalizarCategoria, normalizarColor, normalizarGenero } from "../lib/formato";

async function runScrape() {
  const inicio = Date.now();
  console.log("Iniciando scraping masivo (hasta 50 páginas por tienda)...");

  // 1. Obtener productos frescos con un límite muy alto
  const promesas = await Promise.allSettled([
    obtenerTodasLasOfertasMoov({ paginas: 100 }),
    obtenerTodasLasOfertasGrid({ paginas: 100 }),
    obtenerTodasLasOfertasDexter({ paginas: 100, categoryId: "sale" }),
    obtenerTodasLasOfertasTiendasExternas({ paginas: 100 }),
  ]);

  const todosLosFrescos = promesas.flatMap((respuesta) =>
    respuesta.status === "fulfilled" ? respuesta.value : [],
  );

  const productosFrescos = todosLosFrescos
    .filter((p) => p.discount >= 1 && p.discount <= 100)
    .map((p) => ({
      ...p,
      brand: normalizarMarca(p.brand),
      sizes: p.sizes?.map(normalizarTalle).filter(Boolean) || [],
      size: p.size ? normalizarTalle(p.size) : undefined,
      category: normalizarCategoria(p.category),
      color: normalizarColor(p.color),
      gender: normalizarGenero(p.gender)
    }));

  console.log(`Se encontraron ${productosFrescos.length} ofertas frescas.`);

  if (productosFrescos.length === 0) {
    console.log("No se obtuvieron ofertas nuevas. Saliendo...");
    return;
  }

  // 2. Obtener base de datos actual
  const dbPath = path.join(process.cwd(), "src", "data", "productos-db.json");
  const productosExistentes = new Map<string, Producto>();

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

  // 3. Emparejar y procesar actualizaciones
  let creados = 0;
  let actualizadosPrecio = 0;
  let actualizadosMeta = 0;

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
      } else {
        existing.updatedAt = fechaActualizacion;
        todosLosProductos.set(fresh.id, existing);
        actualizadosMeta++;
      }
    }
  }

  // 4. Limpieza de obsoletos
  const tiendasExitosas = new Set(productosFrescos.map((p) => p.storeSlug));
  const idsFrescos = new Set(productosFrescos.map((p) => p.id));
  let eliminadosNoVistos = 0;
  let eliminadosObsoletos = 0;

  const HORA_EN_MS = 60 * 60 * 1000;
  const umbralObsoleto = Date.now() - 24 * HORA_EN_MS;

  for (const [id, prod] of todosLosProductos.entries()) {
    let eliminar = false;

    if (!idsFrescos.has(id)) {
      if (tiendasExitosas.has(prod.storeSlug)) {
        eliminar = true;
        eliminadosNoVistos++;
      }
    }

    if (!eliminar) {
      const fechaActualizacionMs = new Date(prod.updatedAt).getTime();
      if (fechaActualizacionMs < umbralObsoleto) {
        eliminar = true;
        eliminadosObsoletos++;
      }
    }

    if (eliminar) {
      todosLosProductos.delete(id);
    }
  }

  // 5. Guardar base de datos
  await fs.writeFile(
    dbPath,
    JSON.stringify(Array.from(todosLosProductos.values()), null, 2),
    "utf-8",
  );

  console.log("====================================");
  console.log(`⏱️ Tiempo total: ${((Date.now() - inicio) / 1000).toFixed(1)}s`);
  console.log(`✅ Creados: ${creados}`);
  console.log(`💵 Actualizados (Precio): ${actualizadosPrecio}`);
  console.log(`🔄 Actualizados (Stock/Talles): ${actualizadosMeta}`);
  console.log(`🗑️ Eliminados (Ya no en oferta): ${eliminadosNoVistos}`);
  console.log(`🗑️ Eliminados (Obsoletos): ${eliminadosObsoletos}`);
  console.log(`👟 Total en Base de Datos: ${todosLosProductos.size}`);
  console.log("====================================");
}

runScrape().catch((err) => {
  console.error("Error catastrófico en el scraping:", err);
  process.exit(1);
});
