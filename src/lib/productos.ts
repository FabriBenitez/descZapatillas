import { collection, getDocs } from "firebase/firestore/lite";

import { productosMock } from "@/data/productos-mock";
import { obtenerFirestoreCliente } from "@/lib/firebase";
import { normalizarTexto } from "@/lib/formato";
import type { Producto, RegistroPrecio, TipoOferta } from "@/types/producto";

const COLECCION_PRODUCTOS = "products";

function ordenarPorActualizacion(productos: Producto[]) {
  return [...productos].sort(
    (productoA, productoB) =>
      new Date(productoB.updatedAt).getTime() -
      new Date(productoA.updatedAt).getTime(),
  );
}

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

export async function obtenerProductos(): Promise<Producto[]> {
  const firestore = obtenerFirestoreCliente();

  if (!firestore) {
    return ordenarPorActualizacion(productosMock);
  }

  try {
    const referenciaColeccion = collection(firestore, COLECCION_PRODUCTOS);
    const respuesta = await getDocs(referenciaColeccion);

    if (respuesta.empty) {
      return ordenarPorActualizacion(productosMock);
    }

    const productos = respuesta.docs
      .map((documento) =>
        normalizarProductoFirestore(documento.id, documento.data()),
      )
      .filter((producto): producto is Producto => Boolean(producto));

    return productos.length > 0
      ? ordenarPorActualizacion(productos)
      : ordenarPorActualizacion(productosMock);
  } catch {
    return ordenarPorActualizacion(productosMock);
  }
}

export async function obtenerProductoPorId(id: string) {
  const productos = await obtenerProductos();

  return productos.find((producto) => producto.id === id) ?? null;
}
