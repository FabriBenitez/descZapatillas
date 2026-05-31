import { NextResponse } from "next/server";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore/lite";
import fs from "node:fs/promises";
import path from "node:path";

import { obtenerFirestoreCliente } from "@/lib/firebase";
import { obtenerProductosConectoresSinCache } from "@/lib/productos";
import type { Producto, RegistroPrecio } from "@/types/producto";

export const maxDuration = 60; // Permite hasta 60 segundos de ejecución en Vercel (Hobby/Pro)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get("secret");
  
  // Obtener Authorization Header si existe
  const authHeader = request.headers.get("Authorization");
  const authSecret = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : authHeader;

  const cronSecret = process.env.CRON_SECRET || "default_sync_secret";

  // Validar credenciales
  if (secretParam !== cronSecret && authSecret !== cronSecret) {
    return NextResponse.json(
      { error: "No autorizado. Clave secreta inválida." },
      { status: 401 }
    );
  }

  const firestore = obtenerFirestoreCliente();

  const inicio = Date.now();

  try {
    // 1. Obtener productos de los conectores
    const todosLosFrescos = await obtenerProductosConectoresSinCache();
    const productosFrescos = todosLosFrescos.filter((p) => p.discount >= 1 && p.discount <= 100);
    
    if (productosFrescos.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No se obtuvieron ofertas nuevas de los conectores.",
        count: 0,
        elapsedMs: Date.now() - inicio,
      });
    }

    // 2. Obtener productos actuales
    const productosExistentes = new Map<string, Producto>();

    if (firestore) {
      const refColeccion = collection(firestore, "products");
      const querySnapshot = await getDocs(refColeccion);
      querySnapshot.forEach((docSnapshot) => {
        productosExistentes.set(docSnapshot.id, docSnapshot.data() as Producto);
      });
    } else {
      try {
        const dbPath = path.join(process.cwd(), "src", "data", "productos-db.json");
        const dbContent = await fs.readFile(dbPath, "utf-8");
        const productosLocales = JSON.parse(dbContent) as Producto[];
        if (Array.isArray(productosLocales)) {
          productosLocales.forEach((prod) => {
            productosExistentes.set(prod.id, prod);
          });
        }
      } catch (err) {
        // Archivo no existe o está corrupto, empezamos desde cero
      }
    }

    // 3. Emparejar y procesar actualizaciones
    let creados = 0;
    let actualizadosPrecio = 0;
    let actualizadosMeta = 0;

    const fechaActualizacion = new Date().toISOString();
    const promesasEscritura: Promise<void>[] = [];
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
          promesasEscritura.push(
            setDoc(doc(firestore, "products", fresh.id), fresh)
          );
        }
      } else {
        // Producto existente, verificar si cambió el precio o disponibilidad
        const precioCambio = existing.price !== fresh.price;
        const disponibleCambio = existing.available !== fresh.available;
        
        const historial = existing.priceHistory ?? [];

        if (precioCambio) {
          // Agregar registro de cambio de precio al historial
          historial.push({
            fecha: fechaActualizacion,
            precio: fresh.price,
            precioAnterior: fresh.listPrice,
            descuento: fresh.discount,
          });

          // Limitar historial a los últimos 15 registros para evitar saturar el documento
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
          
          // Mantener o actualizar talles si vinieron talles nuevos
          if (fresh.sizes && fresh.sizes.length > 0) {
            existing.sizes = fresh.sizes;
            existing.size = fresh.size;
          }

          actualizadosPrecio++;
          todosLosProductos.set(fresh.id, existing);
          if (firestore) {
            promesasEscritura.push(
              setDoc(doc(firestore, "products", fresh.id), existing)
            );
          }
        } else if (disponibleCambio || fresh.sizes?.length !== existing.sizes?.length) {
          // Si solo cambió stock o metadatos menores
          existing.available = fresh.available;
          existing.updatedAt = fechaActualizacion;
          if (fresh.sizes && fresh.sizes.length > 0) {
            existing.sizes = fresh.sizes;
            existing.size = fresh.size;
          }

          actualizadosMeta++;
          todosLosProductos.set(fresh.id, existing);
          if (firestore) {
            promesasEscritura.push(
              setDoc(doc(firestore, "products", fresh.id), existing)
            );
          }
        } else {
          // Si no hubo cambios sustanciales, igualmente actualizamos la fecha de vigencia
          // para evitar que los filtros de tiempo lo oculten.
          existing.updatedAt = fechaActualizacion;
          todosLosProductos.set(fresh.id, existing);
          if (firestore) {
            promesasEscritura.push(
              setDoc(doc(firestore, "products", fresh.id), existing)
            );
          }
          actualizadosMeta++;
        }
      }
    }

    // 3.5 Limpiar productos obsoletos o que ya no están en oferta en tiendas exitosas
    const tiendasExitosas = new Set(productosFrescos.map((p) => p.storeSlug));
    const idsFrescos = new Set(productosFrescos.map((p) => p.id));
    let eliminadosNoVistos = 0;
    let eliminadosObsoletos = 0;

    const HORA_EN_MS = 60 * 60 * 1000;
    const umbralObsoleto = Date.now() - (24 * HORA_EN_MS);

    for (const [id, prod] of todosLosProductos.entries()) {
      let eliminar = false;

      // Si el producto no está en las ofertas frescas de esta corrida
      if (!idsFrescos.has(id)) {
        // Y su tienda fue sincronizada exitosamente en esta corrida (obtuvo al menos un producto fresco)
        if (tiendasExitosas.has(prod.storeSlug)) {
          eliminar = true;
          eliminadosNoVistos++;
        }
      }

      // Respaldo por tiempo: si no fue actualizado en las últimas 24 horas, se elimina
      if (!eliminar) {
        const fechaActualizacionMs = new Date(prod.updatedAt).getTime();
        if (fechaActualizacionMs < umbralObsoleto) {
          eliminar = true;
          eliminadosObsoletos++;
        }
      }

      if (eliminar) {
        todosLosProductos.delete(id);
        if (firestore) {
          promesasEscritura.push(
            deleteDoc(doc(firestore, "products", id))
          );
        }
      }
    }

    // 4. Ejecutar todas las promesas en lotes paralelos pequeños
    if (firestore) {
      const BATCH_SIZE = 25;
      for (let i = 0; i < promesasEscritura.length; i += BATCH_SIZE) {
        const batch = promesasEscritura.slice(i, i + BATCH_SIZE);
        await Promise.all(batch);
      }
    } else {
      const dbPath = path.join(process.cwd(), "src", "data", "productos-db.json");
      await fs.writeFile(
        dbPath,
        JSON.stringify(Array.from(todosLosProductos.values()), null, 2),
        "utf-8"
      );
    }

    return NextResponse.json({
      success: true,
      creados,
      actualizadosPrecio,
      actualizadosMeta,
      eliminadosNoVistos,
      eliminadosObsoletos,
      totalProcesados: productosFrescos.length,
      elapsedMs: Date.now() - inicio,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido en la sincronización.",
        elapsedMs: Date.now() - inicio,
      },
      { status: 500 }
    );
  }
}
