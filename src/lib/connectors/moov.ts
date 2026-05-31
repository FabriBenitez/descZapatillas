import * as cheerio from "cheerio";

import { enriquecerProductosConTalles } from "@/lib/connectors/talles-detalle";
import { esZapatilla, normalizarTexto } from "@/lib/formato";
import type { Producto, TipoOferta } from "@/types/producto";

const MOOV_BASE_URL = "https://www.moov.com.ar";
const MOOV_SEARCH_PATH =
  "/on/demandware.store/Sites-Moov-Site/default/Search-UpdateGrid";
const MOOV_PAGE_SIZE = 36;
const FETCH_TIMEOUT_MS = 8000;

interface MoovGtmProduct {
  item_id?: string;
  item_name?: string;
  item_brand?: string;
  item_list_id?: string;
  item_list_name?: string;
  item_variant?: string;
  price?: number;
}

interface ObtenerOfertasMoovOpciones {
  start?: number;
  size?: number;
  query?: string;
  sortRule?: string;
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

  return `${MOOV_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
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
    return "Niños";
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

function leerGtmProducto(valor: string | undefined): MoovGtmProduct | null {
  if (!valor) {
    return null;
  }

  try {
    const datos = JSON.parse(valor) as unknown;

    if (!Array.isArray(datos) || !datos[0] || typeof datos[0] !== "object") {
      return null;
    }

    return datos[0] as MoovGtmProduct;
  } catch {
    return null;
  }
}

export function construirUrlMoovSale({
  start = 0,
  size = MOOV_PAGE_SIZE,
  query = "zapatillas",
  sortRule = "product-discount",
}: ObtenerOfertasMoovOpciones = {}) {
  const parametros = new URLSearchParams({
    q: query,
    srule: sortRule,
    start: String(start),
    sz: String(size),
  });

  if (query === "zapatillas") {
    parametros.set("cgid", "sale");
  }

  return `${MOOV_BASE_URL}${MOOV_SEARCH_PATH}?${parametros}`;
}

export function parsearProductosMoov(html: string): Producto[] {
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
      id: `moov-${id}`,
      storeSlug: "moov",
      storeName: "Moov",
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

export async function obtenerOfertasMoov(
  opciones: ObtenerOfertasMoovOpciones = {},
) {
  const url = construirUrlMoovSale(opciones);
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
    throw new Error(`Moov respondio ${respuesta.status} al consultar ofertas`);
  }

  const html = await respuesta.text();

  return enriquecerProductosConTalles(
    parsearProductosMoov(html),
    "demandware",
    opciones.evitarTalles ? 0 : 6
  );
}

export async function obtenerTodasLasOfertasMoov({
  paginas = 3,
  size = MOOV_PAGE_SIZE,
  query = "zapatillas",
  sortRule = "product-discount",
  evitarTalles = false,
}: ObtenerOfertasMoovOpciones & { paginas?: number } = {}) {
  const resultados = await Promise.all(
    Array.from({ length: paginas }, (_, indice) =>
      obtenerOfertasMoov({
        start: indice * size,
        size,
        query,
        sortRule,
        evitarTalles,
      }),
    ),
  );

  const productos = new Map<string, Producto>();

  resultados.flat().forEach((producto) => {
    productos.set(producto.id, producto);
  });

  return Array.from(productos.values());
}
