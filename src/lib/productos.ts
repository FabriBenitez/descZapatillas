import { collection, getDocs } from "firebase/firestore/lite";
import { unstable_cache } from "next/cache";

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
import { normalizarTexto } from "@/lib/formato";
import type { Producto, RegistroPrecio, TipoOferta } from "@/types/producto";

const COLECCION_PRODUCTOS = "products";
const REVALIDACION_PRODUCTOS_SEGUNDOS = 60 * 60;

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

async function obtenerProductosConectoresSinCache() {
  const respuestas = await Promise.allSettled([
    obtenerTodasLasOfertasMoov({
      paginas: 2,
    }),
    obtenerTodasLasOfertasGrid({
      paginas: 2,
    }),
    obtenerTodasLasOfertasDexter({
      paginas: 2,
    }),
    obtenerTodasLasOfertasTiendasExternas({
      paginas: 1,
    }),
  ]);

  return respuestas.flatMap((respuesta) =>
    respuesta.status === "fulfilled" ? respuesta.value : [],
  );
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
  const tiendasDemandware = new Set(["moov", "dexter", "stockcenter"]);
  const tiendasMagento = new Set(["opensports", "solodeportes", "solourbano"]);
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

export async function obtenerProductos(): Promise<Producto[]> {
  const firestore = obtenerFirestoreCliente();

  if (!firestore) {
    const productosConectores = await obtenerProductosConectores();

    return combinarProductos(productosConectores, productosMock);
  }

  try {
    const referenciaColeccion = collection(firestore, COLECCION_PRODUCTOS);
    const respuesta = await getDocs(referenciaColeccion);

    if (respuesta.empty) {
      const productosConectores = await obtenerProductosConectores();

      return combinarProductos(productosConectores, productosMock);
    }

    const productos = respuesta.docs
      .map((documento) =>
        normalizarProductoFirestore(documento.id, documento.data()),
      )
      .filter((producto): producto is Producto => Boolean(producto));

    if (productos.length > 0) {
      return ordenarPorActualizacion(productos);
    }

    const productosConectores = await obtenerProductosConectores();

    return combinarProductos(productosConectores, productosMock);
  } catch {
    const productosConectores = await obtenerProductosConectores();

    return combinarProductos(productosConectores, productosMock);
  }
}

export async function obtenerProductoPorId(id: string) {
  const productos = await obtenerProductos();
  const producto = productos.find((item) => item.id === id) ?? null;

  if (!producto || producto.sizes?.length) {
    return producto;
  }

  const plataforma = obtenerPlataformaTalles(producto);

  if (!plataforma) {
    return producto;
  }

  return enriquecerProductoConTalles(producto, plataforma);
}
