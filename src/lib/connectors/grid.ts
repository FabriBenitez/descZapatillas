import { esZapatilla, normalizarTexto } from "@/lib/formato";
import type { Producto, TipoOferta } from "@/types/producto";

const GRID_BASE_URL = "https://www.grid.com.ar";
const GRID_SEARCH_PATH = "/api/catalog_system/pub/products/search";
const GRID_PAGE_SIZE = 50;
const FETCH_TIMEOUT_MS = 8000;

interface VtexOffer {
  Price?: number;
  ListPrice?: number;
  AvailableQuantity?: number;
  IsAvailable?: boolean;
}

interface VtexSeller {
  sellerName?: string;
  commertialOffer?: VtexOffer;
}

interface VtexImage {
  imageUrl?: string;
}

interface VtexSku {
  itemId?: string;
  name?: string;
  Talle?: string[];
  images?: VtexImage[];
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

interface ObtenerOfertasGridOpciones {
  from?: number;
  size?: number;
  query?: string;
  order?: string;
  evitarTalles?: boolean;
}

interface SkuConOferta {
  sku: VtexSku;
  offer: VtexOffer;
}

function leerNumero(valor: unknown) {
  return typeof valor === "number" && Number.isFinite(valor) ? valor : 0;
}

function limpiarTexto(valor: string | undefined) {
  return (valor ?? "").replace(/\s+/g, " ").trim();
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

function inferirGenero(producto: VtexProduct, nombre: string) {
  const genero = producto["Género"]?.[0] || producto.Genero?.[0];

  if (genero) {
    return genero;
  }

  const texto = normalizarTexto(nombre);

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

function obtenerCategoria(producto: VtexProduct) {
  const categoriaZapatillas = producto.categories?.find((categoria) =>
    normalizarTexto(categoria).includes("zapatillas"),
  );

  if (categoriaZapatillas) {
    return "Zapatillas";
  }

  return limpiarTexto(producto.categories?.[0]?.replace(/\//g, " ")) || "Zapatillas";
}

function tieneStock(oferta: VtexOffer | undefined) {
  return Boolean(oferta?.IsAvailable) || leerNumero(oferta?.AvailableQuantity) > 0;
}

function obtenerTallesDisponibles(items: VtexSku[] = []) {
  const talles = new Set<string>();

  items.forEach((item) => {
    const oferta = item.sellers?.[0]?.commertialOffer;

    if (!tieneStock(oferta)) {
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

function obtenerOferta(item: VtexSku): VtexOffer | null {
  const oferta = item.sellers?.[0]?.commertialOffer;
  const precio = leerNumero(oferta?.Price);

  if (!oferta || !precio) {
    return null;
  }

  return oferta;
}

function elegirSkuConOferta(items: VtexSku[] = []): SkuConOferta | null {
  const candidatos = items
    .map((sku) => {
      const offer = obtenerOferta(sku);

      return offer ? { sku, offer } : null;
    })
    .filter((item): item is SkuConOferta => Boolean(item));

  if (candidatos.length === 0) {
    return null;
  }

  return candidatos.sort((a, b) => {
    const aDisponible =
      tieneStock(a.offer);
    const bDisponible =
      tieneStock(b.offer);
    const descuentoA = calcularDescuento(
      leerNumero(a.offer.Price),
      leerNumero(a.offer.ListPrice),
    );
    const descuentoB = calcularDescuento(
      leerNumero(b.offer.Price),
      leerNumero(b.offer.ListPrice),
    );

    if (aDisponible !== bDisponible) {
      return aDisponible ? -1 : 1;
    }

    return descuentoB - descuentoA;
  })[0];
}

export function construirUrlGridSale({
  from = 0,
  size = GRID_PAGE_SIZE,
  query = "zapatillas",
  order = "OrderByBestDiscountDESC",
}: ObtenerOfertasGridOpciones = {}) {
  const to = Math.max(from, from + size - 1);
  const parametros = new URLSearchParams({
    _from: String(from),
    _to: String(to),
    O: order,
  });

  return `${GRID_BASE_URL}${GRID_SEARCH_PATH}?ft=${encodeURIComponent(query)}&${parametros}`;
}

export function normalizarProductosGrid(productosVtex: VtexProduct[]) {
  const fechaActualizacion = new Date().toISOString();
  const productos = new Map<string, Producto>();

  productosVtex.forEach((producto) => {
    const idBase = limpiarTexto(producto.productId);
    const nombre = limpiarTexto(producto.productName);
    const skuConOferta = elegirSkuConOferta(producto.items);

    if (!idBase || !nombre || !skuConOferta) {
      return;
    }

    const { sku, offer } = skuConOferta;
    const precio = leerNumero(offer.Price);
    const precioLista = leerNumero(offer.ListPrice) || precio;
    const descuento = calcularDescuento(precio, precioLista);
    const imagen = sku.images?.find((image) => image.imageUrl)?.imageUrl;
    const talles = obtenerTallesDisponibles(producto.items);
    const disponible = talles.length > 0 || tieneStock(offer);
    const categoria = obtenerCategoria(producto);

    if (!precio || !imagen || !producto.link || !esZapatilla(nombre, categoria)) {
      return;
    }

    productos.set(idBase, {
      id: `grid-${idBase}`,
      storeSlug: "grid",
      storeName: "Grid",
      name: nombre,
      normalizedName: normalizarTexto(nombre),
      brand: limpiarTexto(producto.brand),
      category: categoria,
      gender: inferirGenero(producto, nombre),
      color: limpiarTexto(producto.Color?.[0]),
      size: talles[0],
      sizes: talles,
      price: precio,
      listPrice: precioLista,
      discount: descuento,
      imageUrl: imagen,
      productUrl: producto.link,
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

export async function obtenerOfertasGrid(
  opciones: ObtenerOfertasGridOpciones = {},
) {
  const url = construirUrlGridSale(opciones);
  const respuesta = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
    },
    next: {
      revalidate: 60 * 60,
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!respuesta.ok) {
    throw new Error(`Grid respondio ${respuesta.status} al consultar ofertas`);
  }

  const productos = (await respuesta.json()) as VtexProduct[];

  return normalizarProductosGrid(productos);
}

export async function obtenerTodasLasOfertasGrid({
  paginas = 2,
  size = GRID_PAGE_SIZE,
  query = "zapatillas",
  order = "OrderByBestDiscountDESC",
}: ObtenerOfertasGridOpciones & { paginas?: number } = {}) {
  const promesas = Array.from({ length: paginas }, (_, indice) => () =>
    obtenerOfertasGrid({
      from: indice * size,
      size,
      query,
      order,
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
