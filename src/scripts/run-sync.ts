import { setDoc, doc, collection, getDocs } from "firebase/firestore/lite";
import fs from "node:fs/promises";
import path from "node:path";
import { obtenerFirestoreCliente } from "../lib/firebase";
import { obtenerProductosConectoresSinCache } from "../lib/productos";
import type { Producto } from "../types/producto";

async function runSyncLocally() {
  console.log("Iniciando sync local para normalizar todos los datos...");
  const inicio = Date.now();

  try {
    // 1. Obtener productos de los conectores
    const todosLosFrescos = await obtenerProductosConectoresSinCache();
    const productosFrescos = todosLosFrescos.filter((p) => p.discount >= 1 && p.discount <= 100);
    
    console.log(`Obtenidos ${productosFrescos.length} productos frescos.`);

    if (productosFrescos.length === 0) {
      console.log("No se obtuvieron ofertas nuevas de los conectores.");
      return;
    }

    // 2. Obtener productos actuales del JSON
    const productosExistentes = new Map<string, Producto>();
    const dbPath = path.join(process.cwd(), "src", "data", "productos-db.json");
    
    try {
      const dbContent = await fs.readFile(dbPath, "utf-8");
      const data = JSON.parse(dbContent) as Producto[];
      data.forEach((p) => productosExistentes.set(p.id, p));
      console.log(`Cargados ${data.length} productos existentes del JSON.`);
    } catch (err) {
      console.log("No se encontró el archivo JSON o está vacío.");
    }

    // 3. Mezclar productos (los frescos sobreescriben a los viejos)
    // PERO como cambiamos la lógica, queremos forzar que TODOS los productos en JSON pasen por la nueva normalización.
    // Dado que el sync solo trae los que están "en oferta" AHORA, no traerá los que ya no están en oferta.
    // Para asegurarnos de que la DB entera quede normalizada, vamos a borrar los viejos y dejar solo los nuevos.
    // PERO eso perdería el historial de precios!
    // Entonces, vamos a normalizar TAMBIÉN los productos existentes!
    
    // Función manual de normalización (copiada para el script)
    const { normalizarMarca, normalizarTalle, normalizarCategoria, normalizarColor, normalizarGenero } = await import("../lib/formato");

    for (const [id, p] of productosExistentes.entries()) {
      productosExistentes.set(id, {
        ...p,
        brand: normalizarMarca(p.brand),
        sizes: p.sizes?.map(normalizarTalle).filter(Boolean) || [],
        size: p.size ? normalizarTalle(p.size) : undefined,
        category: normalizarCategoria(p.category ?? ""),
        color: normalizarColor(p.color),
        gender: normalizarGenero(p.gender)
      });
    }

    const fechaActualizacion = new Date().toISOString();
    const todosLosProductos = new Map<string, Producto>();

    // 4. Procesar frescos
    for (const fresh of productosFrescos) {
      const existing = productosExistentes.get(fresh.id);

      if (!existing) {
        fresh.updatedAt = fechaActualizacion;
        todosLosProductos.set(fresh.id, fresh);
      } else {
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
            fresh.price
          );
          existing.priceHistory = historial;
          existing.updatedAt = fechaActualizacion;
          existing.available = fresh.available;
          
          if (fresh.sizes && fresh.sizes.length > 0) {
            existing.sizes = fresh.sizes;
            existing.size = fresh.size;
          }
        } else if (disponibleCambio) {
          existing.available = fresh.available;
          existing.updatedAt = fechaActualizacion;
        }

        todosLosProductos.set(existing.id, existing);
      }
    }

    // Agregar los que existen en DB pero no vinieron frescos
    for (const [id, existing] of productosExistentes.entries()) {
      if (!todosLosProductos.has(id)) {
        if (existing.available) {
          existing.available = false;
          existing.updatedAt = fechaActualizacion;
        }
        todosLosProductos.set(id, existing);
      }
    }

    // 5. Guardar JSON
    await fs.writeFile(
      dbPath,
      JSON.stringify(Array.from(todosLosProductos.values()), null, 2),
      "utf-8"
    );
    console.log("JSON guardado.");

  } catch (error) {
    console.error("Error crítico durante la sincronización:", error);
  }
}

runSyncLocally();
