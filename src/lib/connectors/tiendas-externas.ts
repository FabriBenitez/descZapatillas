import * as cheerio from "cheerio";

import { enriquecerProductosConTalles } from "@/lib/connectors/talles-detalle";
import { esZapatilla, normalizarTexto } from "@/lib/formato";
import type { Producto, TipoOferta } from "@/types/producto";

type PlataformaTienda = "vtex" | "demandware" | "magento" | "digitalsport";

interface ConfiguracionTienda {
  slug: string;
  nombre: string;
  baseUrl: string;
  plataforma: PlataformaTienda;
  provincia?: string;
  siteId?: string;
  categoryId?: string;
  urlProductos?: string;
  /** Cantidad total de páginas a scrapear para esta tienda (override del default) */
  paginasTotales?: number;
}

interface VtexOffer {
  Price?: number;
  ListPrice?: number;
  AvailableQuantity?: number;
  IsAvailable?: boolean;
}

interface VtexSeller {
  commertialOffer?: VtexOffer;
}

interface VtexSku {
  itemId?: string;
  name?: string;
  Talle?: string[];
  images?: { imageUrl?: string }[];
  sellers?: VtexSeller[];
}

interface VtexProduct {
  productId?: string;
  productName?: string;
  brand?: string;
  categories?: string[];
  link?: string;
  items?: VtexSku[];
  Color?: string[];
  Genero?: string[];
  "Género"?: string[];
}

interface GtmProduct {
  item_id?: string;
  item_name?: string;
  item_brand?: string;
  item_list_id?: string;
  item_list_name?: string;
  price?: number;
}

interface OpcionesBusqueda {
  query?: string;
  size?: number;
  pagina?: number;
  evitarTalles?: boolean;
}

const VTEX_PAGE_SIZE = 50;
const DEMANDWARE_PAGE_SIZE = 36;
const FETCH_TIMEOUT_MS = 8000;

export const tiendasExternas: ConfiguracionTienda[] = [
  {
    slug: "stockcenter",
    nombre: "StockCenter",
    baseUrl: "https://www.stockcenter.com.ar",
    plataforma: "demandware",
    siteId: "Sites-StockCenter-Site",
    categoryId: "sale",
  },
  {
    slug: "solodeportes",
    nombre: "Solo Deportes",
    baseUrl: "https://www.solodeportes.com.ar",
    plataforma: "magento",
    urlProductos:
      "https://www.solodeportes.com.ar/ofertas/calzado.html",
    paginasTotales: 220,
  },
  {
    slug: "sevensport",
    nombre: "SevenSport",
    baseUrl: "https://www.sevensport.com.ar",
    plataforma: "vtex",
  },
  {
    slug: "tiendafuencarral",
    nombre: "TiendaFuencarral",
    baseUrl: "https://www.tiendafuencarral.com.ar",
    plataforma: "vtex",
    provincia: "Cordoba",
  },
  {
    slug: "instoreweb",
    nombre: "InstoreWeb",
    baseUrl: "https://www.instoreweb.com.ar",
    plataforma: "vtex",
  },
  {
    slug: "dashdeportes",
    nombre: "Dash Deportes",
    baseUrl: "https://www.dashdeportes.com.ar",
    plataforma: "vtex",
  },
  {
    slug: "templodelfutbol",
    nombre: "Templo del Futbol",
    baseUrl: "https://www.templodelfutbol.com.ar",
    plataforma: "vtex",
  },
  {
    slug: "opensports",
    nombre: "OpenSports",
    baseUrl: "https://www.opensports.com.ar",
    plataforma: "magento",
    urlProductos: "https://www.opensports.com.ar/ofertas.html",
    paginasTotales: 50,
  },
];

function limpiarTexto(valor: string | undefined) {
  return (valor ?? "").replace(/\s+/g, " ").trim();
}

function leerNumero(valor: unknown) {
  if (typeof valor === "number" && Number.isFinite(valor)) {
    return valor;
  }

  if (typeof valor !== "string") {
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

function inferirTipoOferta(descuento: number): TipoOferta {
  if (descuento >= 50) {
    return "liquidacion";
  }

  if (descuento >= 30) {
    return "outlet";
  }

  return "temporada";
}

function inferirGenero(textoBase: string) {
  const texto = normalizarTexto(textoBase);

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

function absolutizarUrl(baseUrl: string, url: string | undefined) {
  if (!url) {
    return "";
  }

  if (url.startsWith("http")) {
    return url;
  }

  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}

function crearProductoBase(
  tienda: ConfiguracionTienda,
  datos: Omit<
    Producto,
    "storeSlug" | "storeName" | "province" | "updatedAt" | "priceHistory"
  >,
): Producto {
  const fechaActualizacion = new Date().toISOString();

  return {
    ...datos,
    storeSlug: tienda.slug,
    storeName: tienda.nombre,
    province: tienda.provincia ?? "Buenos Aires",
    updatedAt: fechaActualizacion,
    priceHistory: [
      {
        fecha: fechaActualizacion,
        precio: datos.price,
        precioAnterior: datos.listPrice,
        descuento: datos.discount,
      },
    ],
  };
}

function tieneStockVtex(oferta: VtexOffer | undefined) {
  return Boolean(oferta?.IsAvailable) || leerNumero(oferta?.AvailableQuantity) > 0;
}

function obtenerTallesDisponiblesVtex(items: VtexSku[] = []) {
  const talles = new Set<string>();

  items.forEach((item) => {
    const oferta = item.sellers?.[0]?.commertialOffer;

    if (!tieneStockVtex(oferta)) {
      return;
    }

    item.Talle?.forEach((talle) => {
      const talleLimpio = limpiarTexto(talle);

      if (talleLimpio) {
        talles.add(talleLimpio);
      }
    });
  });

  return Array.from(talles);
}

function elegirSkuVtex(items: VtexSku[] = []) {
  return items
    .map((sku) => {
      const oferta = sku.sellers?.[0]?.commertialOffer;
      const precio = leerNumero(oferta?.Price);

      return oferta && precio ? { sku, oferta } : null;
    })
    .filter((item): item is { sku: VtexSku; oferta: VtexOffer } =>
      Boolean(item),
    )
    .sort((a, b) => {
      const aDisponible =
        tieneStockVtex(a.oferta);
      const bDisponible =
        tieneStockVtex(b.oferta);

      if (aDisponible !== bDisponible) {
        return aDisponible ? -1 : 1;
      }

      return (
        calcularDescuento(leerNumero(b.oferta.Price), leerNumero(b.oferta.ListPrice)) -
        calcularDescuento(leerNumero(a.oferta.Price), leerNumero(a.oferta.ListPrice))
      );
    })[0];
}

function obtenerCategoriaVtex(producto: VtexProduct) {
  const categoriaZapatillas = producto.categories?.find((categoria) =>
    normalizarTexto(categoria).includes("zapatillas"),
  );

  if (categoriaZapatillas) {
    return "Zapatillas";
  }

  return limpiarTexto(producto.categories?.[0]?.replace(/\//g, " ")) || "Zapatillas";
}

function normalizarVtex(tienda: ConfiguracionTienda, productos: VtexProduct[]) {
  return productos.flatMap((producto): Producto[] => {
    const idBase = limpiarTexto(producto.productId);
    const nombre = limpiarTexto(producto.productName);
    const skuConOferta = elegirSkuVtex(producto.items);

    if (!idBase || !nombre || !skuConOferta) {
      return [];
    }

    const { sku, oferta } = skuConOferta;
    const precio = leerNumero(oferta.Price);
    const precioLista = leerNumero(oferta.ListPrice) || precio;
    const descuento = calcularDescuento(precio, precioLista);
    const imagen = sku.images?.find((image) => image.imageUrl)?.imageUrl;
    const talles = obtenerTallesDisponiblesVtex(producto.items);
    const category = obtenerCategoriaVtex(producto);

    if (!precio || !imagen || !producto.link || !esZapatilla(nombre, category)) {
      return [];
    }

    return [
      crearProductoBase(tienda, {
        id: `${tienda.slug}-${idBase}`,
        name: nombre,
        normalizedName: normalizarTexto(nombre),
        brand: limpiarTexto(producto.brand),
        category: category,
        gender: producto["Género"]?.[0] || producto.Genero?.[0] || inferirGenero(nombre),
        color: limpiarTexto(producto.Color?.[0]),
        size: talles[0],
        sizes: talles,
        price: precio,
        listPrice: precioLista,
        discount: descuento,
        imageUrl: imagen,
        productUrl: producto.link,
        available: talles.length > 0 || tieneStockVtex(oferta),
        freeShipping: false,
        offerType: inferirTipoOferta(descuento),
        historicalBestPrice: precio,
      }),
    ];
  });
}

function leerGtmProducto(valor: string | undefined): GtmProduct | null {
  if (!valor) {
    return null;
  }

  try {
    const datos = JSON.parse(valor) as unknown;

    if (!Array.isArray(datos) || !datos[0] || typeof datos[0] !== "object") {
      return null;
    }

    return datos[0] as GtmProduct;
  } catch {
    return null;
  }
}

function normalizarDemandware(tienda: ConfiguracionTienda, html: string) {
  const $ = cheerio.load(html);
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
      leerNumero(gtm?.price);
    const precioLista =
      leerNumero(producto.find(".strike-through .value").first().attr("content")) ||
      precio;
    const descuento =
      leerDescuento(producto.find(".discount-percentage").first().text()) ||
      leerDescuento(producto.find("fieldset legend").first().text()) ||
      calcularDescuento(precio, precioLista);

    const categoria = limpiarTexto(gtm?.item_list_name) || "Zapatillas";

    if (!precio || !imagen || !enlace || !esZapatilla(nombre, categoria)) {
      return;
    }

    productos.set(
      id,
      crearProductoBase(tienda, {
        id: `${tienda.slug}-${id}`,
        name: nombre,
        normalizedName: normalizarTexto(nombre),
        brand: limpiarTexto(gtm?.item_brand) || nombre.split(" ")[1] || "",
        category: categoria,
        gender: inferirGenero(`${gtm?.item_list_id ?? ""} ${nombre}`),
        color: "",
        price: precio,
        listPrice: precioLista,
        discount: descuento,
        imageUrl: absolutizarUrl(tienda.baseUrl, imagen),
        productUrl: absolutizarUrl(tienda.baseUrl, enlace),
        available: producto.find(".out-of-stock").length === 0,
        freeShipping: false,
        offerType: inferirTipoOferta(descuento),
        historicalBestPrice: precio,
      }),
    );
  });

  return Array.from(productos.values());
}

function normalizarMagento(tienda: ConfiguracionTienda, html: string) {
  const $ = cheerio.load(html);
  const productos = new Map<string, Producto>();

  $("li.product-item").each((_, elemento) => {
    const producto = $(elemento);
    const contenedor = producto.find(".product-item-info").first();
    const idBase =
      limpiarTexto(contenedor.attr("id")?.replace("product-item-info_", "")) ||
      limpiarTexto(
        producto.find("[data-product-id]").first().attr("data-product-id"),
      );
    const nombre = limpiarTexto(producto.find(".product-item-link").first().text());
    const enlace = producto.find(".product-item-link").first().attr("href");
    const imagen =
      producto.find("img.product-image-photo").first().attr("src") ||
      producto.find("img.product-image-photo").first().attr("data-src");
    const precio =
      leerNumero(
        producto
          .find('[data-price-type="finalPrice"]')
          .first()
          .attr("data-price-amount"),
      ) || leerNumero(producto.find(".special-price .price").first().text());
    const precioLista =
      leerNumero(
        producto
          .find('[data-price-type="oldPrice"]')
          .first()
          .attr("data-price-amount"),
      ) ||
      leerNumero(producto.find(".old-price .price").first().text()) ||
      precio;
    const marca =
      limpiarTexto(producto.find(".listing-brands img.brand").first().attr("alt")) ||
      limpiarTexto(producto.find("img.brand").first().attr("alt")) ||
      nombre.split(" ")[1] ||
      "";

    if (!idBase || !nombre || !esZapatilla(nombre, "Calzado") || !precio || !imagen || !enlace) {
      return;
    }

    const descuento = calcularDescuento(precio, precioLista);
    const nombreLower = nombre.toLowerCase();
    const categoriaDetectada = nombreLower.includes("botin") || nombreLower.includes("botín")
      ? "Botines"
      : "Zapatillas";

    productos.set(
      idBase,
      crearProductoBase(tienda, {
        id: `${tienda.slug}-${idBase}`,
        name: nombre,
        normalizedName: normalizarTexto(nombre),
        brand: marca,
        category: categoriaDetectada,
        gender: inferirGenero(nombre),
        color: "",
        price: precio,
        listPrice: precioLista,
        discount: descuento,
        imageUrl: absolutizarUrl(tienda.baseUrl, imagen),
        productUrl: absolutizarUrl(tienda.baseUrl, enlace),
        available: true,
        freeShipping: false,
        offerType: inferirTipoOferta(descuento),
        historicalBestPrice: precio,
      }),
    );
  });

  return Array.from(productos.values());
}

function normalizarDigitalSport(tienda: ConfiguracionTienda, html: string) {
  const $ = cheerio.load(html);
  const productos = new Map<string, Producto>();

  $("a.product[productid]").each((_, elemento) => {
    const producto = $(elemento);
    const idBase = limpiarTexto(producto.attr("productid"));
    const nombre =
      limpiarTexto(producto.attr("data-title")) ||
      limpiarTexto(producto.find("h3").first().text());
    const precio = leerNumero(producto.attr("data-price"));
    const imagen =
      producto.find("img.img").first().attr("data-src") ||
      producto.find("img.img").first().attr("src");
    const enlace = producto.attr("href");
    const marca =
      limpiarTexto(producto.attr("data-brand")) ||
      limpiarTexto(producto.find(".brand").first().text());
    const textoCard = producto.text();
    const precioLista =
      leerNumero(textoCard.match(/antes\s*\$?\s*([\d.,]+)/i)?.[1]) || precio;
    const descuento =
      leerDescuento(textoCard.match(/-\s*(\d+)%/)?.[1]) ||
      calcularDescuento(precio, precioLista);

    const categoryReal =
      limpiarTexto(producto.attr("data-category")) || "Zapatillas";

    if (!idBase || !nombre || !esZapatilla(nombre, categoryReal) || !precio || !imagen || !enlace) {
      return;
    }

    productos.set(
      idBase,
      crearProductoBase(tienda, {
        id: `${tienda.slug}-${idBase}`,
        name: nombre,
        normalizedName: normalizarTexto(nombre),
        brand: marca,
        category: "Zapatillas",
        gender: inferirGenero(nombre),
        color: "",
        price: precio,
        listPrice: precioLista,
        discount: descuento,
        imageUrl: absolutizarUrl(tienda.baseUrl, imagen),
        productUrl: absolutizarUrl(tienda.baseUrl, enlace),
        available: true,
        freeShipping: /envio gratis/i.test(textoCard),
        offerType: inferirTipoOferta(descuento),
        historicalBestPrice: precio,
      }),
    );
  });

  return Array.from(productos.values());
}

function construirUrlTienda(
  tienda: ConfiguracionTienda,
  { query = "zapatillas", size, pagina = 0 }: OpcionesBusqueda = {},
) {
  const esBusquedaEspecifica = query !== "zapatillas";

  if (tienda.plataforma === "vtex") {
    const pageSize = size ?? VTEX_PAGE_SIZE;
    const from = pagina * pageSize;
    // VTEX limita _from a máximo 2500
    if (from >= 2500) {
      return null;
    }

    const parametros = new URLSearchParams({
      _from: String(from),
      _to: String(Math.min(from + pageSize - 1, 2499)),
      O: "OrderByBestDiscountDESC",
    });

    return `${tienda.baseUrl}/api/catalog_system/pub/products/search?ft=${encodeURIComponent(query)}&${parametros}`;
  }

  if (tienda.plataforma === "magento") {
    if (!esBusquedaEspecifica && tienda.urlProductos) {
      // Agregar paginación a la URL de productos (ej: ofertas/calzado.html?p=2)
      const separator = tienda.urlProductos.includes("?") ? "&" : "?";
      return pagina > 0
        ? `${tienda.urlProductos}${separator}p=${pagina + 1}`
        : tienda.urlProductos;
    }
    const params = new URLSearchParams({
      q: query,
    });
    if (pagina > 0) {
      params.set("p", String(pagina + 1));
    }
    return `${tienda.baseUrl}/catalogsearch/result/?${params}`;
  }

  if (tienda.plataforma === "digitalsport") {
    if (!esBusquedaEspecifica && tienda.urlProductos) {
      return tienda.urlProductos;
    }
    const params = new URLSearchParams({
      q: query,
    });
    if (pagina > 0) {
      params.set("p", String(pagina + 1));
    }
    let path = "/search/";
    if (tienda.slug === "dionysos") {
      path = "/dionysos/search/";
    } else if (tienda.slug === "blast") {
      path = "/blast/search/";
    }
    return `${tienda.baseUrl}${path}?${params}`;
  }

  // Demandware
  const pageSize = size ?? DEMANDWARE_PAGE_SIZE;
  const parametros = new URLSearchParams({
    q: query,
    srule: "product-discount",
    start: String(pagina * pageSize),
    sz: String(pageSize),
  });

  // Solo aplicar cgid si la query es "zapatillas" o si es explícitamente configurada,
  // para evitar restringir búsquedas específicas por marca que no estén en esa categoría.
  if (tienda.categoryId && query === "zapatillas") {
    parametros.set("cgid", tienda.categoryId);
  }

  return `${tienda.baseUrl}/on/demandware.store/${tienda.siteId}/default/Search-UpdateGrid?${parametros}`;
}

export function obtenerTiendaExterna(slug: string) {
  return tiendasExternas.find((tienda) => tienda.slug === slug) ?? null;
}

export async function obtenerOfertasTiendaExterna(
  tienda: ConfiguracionTienda,
  opciones: OpcionesBusqueda = {},
) {
  const url = construirUrlTienda(tienda, opciones);
  if (!url) {
    return [];
  }
  const respuesta = await fetch(url, {
    headers: {
      Accept:
        tienda.plataforma === "vtex"
          ? "application/json"
          : "text/html,application/xhtml+xml",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
    },
    next: {
      revalidate: 60 * 60,
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!respuesta.ok) {
    throw new Error(
      `${tienda.nombre} respondio ${respuesta.status} al consultar ofertas`,
    );
  }

  if (tienda.plataforma === "vtex") {
    const productos = (await respuesta.json()) as VtexProduct[];

    return normalizarVtex(tienda, productos);
  }

  const html = await respuesta.text();

  if (tienda.plataforma === "magento") {
    return enriquecerProductosConTalles(
      normalizarMagento(tienda, html),
      "magento",
      opciones.evitarTalles ? 0 : 999
    );
  }

  if (tienda.plataforma === "digitalsport") {
    return enriquecerProductosConTalles(
      normalizarDigitalSport(tienda, html),
      "digitalsport",
      opciones.evitarTalles ? 0 : 999
    );
  }

  return enriquecerProductosConTalles(
    normalizarDemandware(tienda, html),
    "demandware",
    opciones.evitarTalles ? 0 : 999
  );
}

export async function obtenerTodasLasOfertasTiendasExternas({
  paginas = 1,
  query = "zapatillas",
  evitarTalles = false,
}: {
  paginas?: number;
  query?: string;
  evitarTalles?: boolean;
} = {}) {
  const todasLasPromesas = tiendasExternas.flatMap((tienda) => {
    // Si la tienda tiene un catálogo de ofertas fijo (urlProductos), ignoramos las
    // búsquedas por marcas específicas para no spamear su buscador (catalogsearch)
    // repetidamente y de forma ineficiente. Solo la scrapearemos en la pasada "zapatillas".
    if (tienda.urlProductos && query !== "zapatillas") {
      return [];
    }

    // Usar paginasTotales de la tienda si existe, sino el default
    const paginasTienda = tienda.paginasTotales ?? paginas;
    return Array.from({ length: paginasTienda }, (_, pagina) => () =>
      obtenerOfertasTiendaExterna(tienda, {
        pagina,
        query,
        evitarTalles,
      }),
    );
  });

  // Ejecutar en grupos (chunks) para no saturar al servidor.
  // Si evitamos talles, solo bajamos la página de categoría, podemos ir rápido (20).
  // Si extraemos talles, procesamos de a 1 sola página a la vez para máxima seguridad (1).
  const chunkSize = evitarTalles ? 20 : 1;
  const respuestas = [];
  for (let i = 0; i < todasLasPromesas.length; i += chunkSize) {
    const chunk = todasLasPromesas.slice(i, i + chunkSize);
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
