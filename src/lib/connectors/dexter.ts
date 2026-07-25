import * as cheerio from "cheerio";

import { enriquecerProductosConTalles } from "@/lib/connectors/talles-detalle";
import { esZapatilla, normalizarTexto } from "@/lib/formato";
import type { Producto, TipoOferta } from "@/types/producto";

const DEXTER_BASE_URL = "https://www.dexter.com.ar";
const DEXTER_SEARCH_PATH =
  "/on/demandware.store/Sites-Dexter-Site/default/Search-UpdateGrid";
const DEXTER_PAGE_SIZE = 36;
const FETCH_TIMEOUT_MS = 8000;

interface DexterGtmProduct {
  item_id?: string;
  item_name?: string;
  item_brand?: string;
  item_list_id?: string;
  item_list_name?: string;
  item_variant?: string;
  price?: number;
}

interface ObtenerOfertasDexterOpciones {
  start?: number;
  size?: number;
  query?: string;
  sortRule?: string;
  categoryId?: string;
  evitarTalles?: boolean;
}

function limpiarTexto(valor: string | undefined) {
  return (valor ?? "").replace(/\s+/g, " ").trim();
}

function leerNumero(valor: string | undefined) {
  if (!valor) {
    return 0;
  }

  const limpio = valor.replace(/[^\d,.-]/g, "");
  const normalizado = /^\d+\.\d{1,2}$/.test(limpio)
    ? limpio
    : limpio.replace(/\./g, "").replace(",", ".");
  const numero = Number(normalizado);

  return Number.isFinite(numero) ? numero : 0;
}

function leerDescuento(valor: string | undefined) {
  const descuento = Number((valor ?? "").replace(/[^\d]/g, ""));

  return Number.isFinite(descuento) ? descuento : 0;
}

function calcularDescuento(precio: number, precioLista: number) {
  if (!precioLista || precioLista <= precio) {
    return 0;
  }

  return Math.round(((precioLista - precio) / precioLista) * 100);
}

function absolutizarUrl(url: string | undefined) {
  if (!url) {
    return "";
  }

  if (url.startsWith("http")) {
    return url;
  }

  return `${DEXTER_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function inferirGenero(itemListId: string | undefined, nombre: string) {
  const texto = normalizarTexto(`${itemListId ?? ""} ${nombre}`);

  if (texto.includes("unisex")) {
    return "Unisex";
  }

  if (texto.includes("mujer")) {
    return "Mujer";
  }

  if (texto.includes("hombre")) {
    return "Hombre";
  }

  if (texto.includes("nino") || texto.includes("kids")) {
    return "Ninos";
  }

  return "Unisex";
}

function inferirTipoOferta(descuento: number): TipoOferta {
  if (descuento >= 50) {
    return "liquidacion";
  }

  if (descuento >= 30) {
    return "outlet";
  }

  return "temporada";
}

function leerGtmProducto(valor: string | undefined): DexterGtmProduct | null {
  if (!valor) {
    return null;
  }

  try {
    const datos = JSON.parse(valor) as unknown;

    if (!Array.isArray(datos) || !datos[0] || typeof datos[0] !== "object") {
      return null;
    }

    return datos[0] as DexterGtmProduct;
  } catch {
    return null;
  }
}

export function construirUrlDexterSale({
  start = 0,
  size = DEXTER_PAGE_SIZE,
  query = "zapatillas",
  sortRule = "product-discount",
  categoryId = "hot-sale",
}: ObtenerOfertasDexterOpciones = {}) {
  const parametros = new URLSearchParams({
    q: query,
    srule: sortRule,
    start: String(start),
    sz: String(size),
  });

  // Forzar siempre la categoría elegida para no traer productos a precio completo
  parametros.set("cgid", categoryId);

  return `${DEXTER_BASE_URL}${DEXTER_SEARCH_PATH}?${parametros}`;
}

export function parsearProductosDexter(html: string): Producto[] {
  const $ = cheerio.load(html);
  const fechaActualizacion = new Date().toISOString();
  const productos = new Map<string, Producto>();

  $(".product[data-pid]").each((_, elemento) => {
    const producto = $(elemento);
    const idBase = limpiarTexto(producto.attr("data-pid"));
    const gtm = leerGtmProducto(producto.find("input.productGtmData").attr("value"));
    const nombre =
      limpiarTexto(producto.find(".pdp-link .link").first().text()) ||
      limpiarTexto(gtm?.item_name);
    const id = idBase || limpiarTexto(gtm?.item_id);

    if (!id || !nombre) {
      return;
    }

    const enlace = producto.find(".pdp-link .link").first().attr("href");
    const imagen = producto.find("img.primary-image").first().attr("src");
    const precio =
      leerNumero(producto.find(".sales .value").first().attr("content")) ||
      leerNumero(producto.find(".sales").first().text()) ||
      gtm?.price ||
      0;
    const precioLista =
      leerNumero(producto.find(".strike-through .value").first().attr("content")) ||
      precio;
    const descuento =
      leerDescuento(producto.find(".discount-percentage").first().text()) ||
      leerDescuento(producto.find("fieldset legend").first().text()) ||
      calcularDescuento(precio, precioLista);
    const marca = limpiarTexto(gtm?.item_brand) || nombre.split(" ")[1] || "";
    const categoria = limpiarTexto(gtm?.item_list_name) || "Zapatillas";
    const disponible = producto.find(".stock-info").length > 0;

    if (!precio || !imagen || !enlace || !esZapatilla(nombre, categoria)) {
      return;
    }

    productos.set(id, {
      id: `dexter-${id}`,
      storeSlug: "dexter",
      storeName: "Dexter",
      name: nombre,
      normalizedName: normalizarTexto(nombre),
      brand: marca,
      category: categoria,
      gender: inferirGenero(gtm?.item_list_id, nombre),
      color: "",
      price: precio,
      listPrice: precioLista,
      discount: descuento,
      imageUrl: absolutizarUrl(imagen),
      productUrl: absolutizarUrl(enlace),
      province: "Buenos Aires",
      available: disponible,
      updatedAt: fechaActualizacion,
      freeShipping: false,
      offerType: inferirTipoOferta(descuento),
      historicalBestPrice: precio,
      priceHistory: [
        {
          fecha: fechaActualizacion,
          precio,
          precioAnterior: precioLista,
          descuento,
        },
      ],
    });
  });

  return Array.from(productos.values());
}

export async function obtenerOfertasDexter(
  opciones: ObtenerOfertasDexterOpciones = {},
) {
  const url = construirUrlDexterSale(opciones);
  const respuesta = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
    },
    next: {
      revalidate: 60 * 60,
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!respuesta.ok) {
    throw new Error(`Dexter respondio ${respuesta.status} al consultar ofertas`);
  }

  const html = await respuesta.text();

  return enriquecerProductosConTalles(
    parsearProductosDexter(html),
    "demandware",
    opciones.evitarTalles ? 0 : 6
  );
}

export async function obtenerTodasLasOfertasDexter({
  paginas = 2,
  size = DEXTER_PAGE_SIZE,
  query = "zapatillas",
  sortRule = "product-discount",
  categoryId = "hot-sale",
  evitarTalles = false,
}: ObtenerOfertasDexterOpciones & { paginas?: number } = {}) {
  const promesas = Array.from({ length: paginas }, (_, indice) => () =>
    obtenerOfertasDexter({
      start: indice * size,
      size,
      query,
      sortRule,
      categoryId,
      evitarTalles,
    }),
  );

  const chunkSize = 10;
  const respuestas = [];
  for (let i = 0; i < promesas.length; i += chunkSize) {
    const chunk = promesas.slice(i, i + chunkSize);
    const chunkRespuestas = await Promise.allSettled(chunk.map(fn => fn()));
    respuestas.push(...chunkRespuestas);
  }

  const productos = new Map<string, Producto>();

  respuestas.forEach((respuesta) => {
    if (respuesta.status !== "fulfilled") {
      return;
    }

    respuesta.value.forEach((producto) => {
      productos.set(producto.id, producto);
    });
  });

  return Array.from(productos.values());
}
