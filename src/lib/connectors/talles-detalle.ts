import * as cheerio from "cheerio";

import type { Producto } from "@/types/producto";

const FETCH_TIMEOUT_MS = 8000;

export type PlataformaDetalleTalles =
  | "demandware"
  | "magento"
  | "digitalsport";

function limpiarTexto(valor: string | undefined) {
  return (valor ?? "").replace(/\s+/g, " ").trim();
}

function absolutizarUrl(url: string) {
  return url;
}

function normalizarTalles(talles: string[]) {
  return Array.from(
    new Set(
      talles
        .map((talle) => limpiarTexto(talle.replace(",", ".")))
        .filter(Boolean),
    ),
  );
}

export function extraerTallesDemandware(html: string) {
  const $ = cheerio.load(html);
  const talles: string[] = [];

  $(".variation-attribute-size").each((_, elemento) => {
    const item = $(elemento);
    const valor = limpiarTexto(item.attr("value"));
    const estaDisponible =
      !item.hasClass("disabled") &&
      valor !== "null" &&
      valor.length > 0;

    if (!estaDisponible) {
      return;
    }

    talles.push(
      limpiarTexto(item.attr("data-attr-value")) ||
        limpiarTexto(item.find(".variationID").first().text()),
    );
  });

  return normalizarTalles(talles);
}

export function extraerTallesDigitalSport(html: string) {
  const $ = cheerio.load(html);
  const talles: string[] = [];

  $("#sizes label.sizeLbl, .sizes label.sizeLbl").each((_, elemento) => {
    const item = $(elemento);

    if (item.hasClass("nostock") || item.hasClass("disabled")) {
      return;
    }

    const copia = item.clone();
    copia.children().remove();
    let texto = copia.text().replace(/sin stock/gi, "").trim().replace(",", ".");
    if (texto.endsWith(".0")) texto = texto.substring(0, texto.length - 2);
    if (texto && /^\d+(\.\d+)?$/.test(texto)) {
      talles.push(texto);
    }
  });

  return normalizarTalles(talles);
}

export function extraerTallesMagento(html: string) {
  const talles = new Set<string>();

  // 1. Parser de JSON-LD Schema.org FAQ (Solo Deportes)
  const faqMatch = html.match(/Los talles disponibles de [^:]+ son:\s*([^.<"'\n]+)/i);
  if (faqMatch && faqMatch[1]) {
    faqMatch[1].split(/[,/]/).forEach((t) => {
      let limpio = t.trim().replace(",", ".");
      if (limpio.endsWith(".0")) limpio = limpio.substring(0, limpio.length - 2);
      if (limpio && /^\d+(\.\d+)?$/.test(limpio)) {
        talles.add(limpio);
      }
    });
  }

  // 2. Parser de jsonConfig de Magento (Trip Store, OpenSports, etc.)
  const jsonConfigMatches =
    html.match(/jsonConfig["']?\s*:\s*(\{[\s\S]*?\})\s*,\s*["']template/i) ||
    html.match(/"Magento_Swatches\/js\/swatch-renderer"\s*:\s*\{[\s\S]*?"jsonConfig"\s*:\s*(\{[\s\S]*?\})\s*\}\s*\}/i);

  if (jsonConfigMatches && jsonConfigMatches[1]) {
    try {
      const config = JSON.parse(jsonConfigMatches[1]);
      const attributes = config.attributes || {};
      for (const attrId in attributes) {
        const attr = attributes[attrId];
        const code = (attr.code || "").toLowerCase();
        const label = (attr.label || "").toLowerCase();
        if (code.includes("talle") || code.includes("size") || label.includes("talle") || label.includes("size")) {
          const options = attr.options || [];
          for (const opt of options) {
            if (opt.label && Array.isArray(opt.products) && opt.products.length > 0) {
              let val = String(opt.label).trim().replace(",", ".");
              if (val.endsWith(".0")) val = val.substring(0, val.length - 2);
              talles.add(val);
            }
          }
        }
      }
    } catch {}
  }

  // 3. Fallback regex sobre "options":[{...}] dentro de attributes
  if (talles.size === 0) {
    const regexOptions = /"options"\s*:\s*(\[\s*\{[\s\S]*?\}\s*\])/g;
    let match;
    while ((match = regexOptions.exec(html)) !== null) {
      try {
        const opts = JSON.parse(match[1]);
        if (Array.isArray(opts)) {
          opts.forEach((o: any) => {
            if (o.label && o.products && o.products.length > 0) {
              let val = String(o.label).trim().replace(",", ".");
              if (val.endsWith(".0")) val = val.substring(0, val.length - 2);
              if (/^\d+(\.\d+)?$/.test(val)) {
                talles.add(val);
              }
            }
          });
        }
      } catch {}
    }
  }

  return normalizarTalles(Array.from(talles));
}

export function extraerTallesDesdeDetalle(
  html: string,
  plataforma: PlataformaDetalleTalles,
) {
  if (plataforma === "demandware") {
    return extraerTallesDemandware(html);
  }

  if (plataforma === "magento") {
    return extraerTallesMagento(html);
  }

  return extraerTallesDigitalSport(html);
}

export async function obtenerTallesDesdeDetalle(
  productUrl: string,
  plataforma: PlataformaDetalleTalles,
) {
  const respuesta = await fetch(absolutizarUrl(productUrl), {
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
    return [];
  }

  return extraerTallesDesdeDetalle(await respuesta.text(), plataforma);
}

export async function enriquecerProductosConTalles(
  productos: Producto[],
  plataforma: PlataformaDetalleTalles,
  limite = 50,
) {
  const productosPriorizados = productos.slice(0, limite);
  const productosSinDetalle = productos.slice(limite);
  const enriquecidos: Producto[] = [];
  const tamanoLote = 6; // Procesamiento paralelo de a 6 productos

  for (let indice = 0; indice < productosPriorizados.length; indice += tamanoLote) {
    const lote = productosPriorizados.slice(indice, indice + tamanoLote);
    const resultados = await Promise.all(
      lote.map(async (producto) => {
        try {
          const talles = await obtenerTallesDesdeDetalle(
            producto.productUrl,
            plataforma,
          );

          return {
            ...producto,
            size: talles[0],
            sizes: talles.length > 0 ? talles : undefined,
            available: talles.length > 0 ? true : producto.available,
          };
        } catch {
          return producto;
        }
      }),
    );

    enriquecidos.push(...resultados);
  }

  return [...enriquecidos, ...productosSinDetalle];
}

export async function enriquecerProductoConTalles(
  producto: Producto,
  plataforma: PlataformaDetalleTalles,
) {
  try {
    const talles = await obtenerTallesDesdeDetalle(
      producto.productUrl,
      plataforma,
    );

    if (talles.length === 0) {
      return producto;
    }

    return {
      ...producto,
      size: talles[0],
      sizes: talles,
      available: true,
    };
  } catch {
    return producto;
  }
}
