import * as cheerio from "cheerio";

import type { Producto } from "@/types/producto";

const FETCH_TIMEOUT_MS = 15000;

export type PlataformaDetalleTalles =
  | "demandware"
  | "magento"
  | "digitalsport"
  | "grimoldi"
  | "puma";

function limpiarTexto(valor: string | undefined) {
  return (valor ?? "").replace(/\s+/g, " ").trim();
}

function absolutizarUrl(url: string) {
  return url;
}

const US_A_AR_MAP: Record<string, string> = {
  "4": "35", "4.5": "35.5", "5": "36", "5.5": "36.5",
  "6": "37", "6.5": "37.5", "7": "39", "7.5": "39.5",
  "8": "40", "8.5": "40.5", "9": "41", "9.5": "41.5",
  "10": "42", "10.5": "42.5", "11": "43", "11.5": "43.5",
  "12": "44", "12.5": "44.5", "13": "45", "13.5": "45.5",
  "14": "46", "15": "47", "16": "48"
};

export function convertirUsAAr(usValor: string): string | null {
  const limpio = usValor.trim().replace(",", ".");
  if (US_A_AR_MAP[limpio]) return US_A_AR_MAP[limpio];
  const num = parseFloat(limpio);
  if (!isNaN(num) && num >= 4 && num <= 16) {
    return String(Math.round(num + 32));
  }
  return null;
}

export function esTalleValido(valor: string): boolean {
  const v = valor.trim().replace(",", ".");
  const num = parseFloat(v);
  return !isNaN(num) && num >= 18 && num <= 52;
}

function normalizarTalles(talles: string[]) {
  return Array.from(
    new Set(
      talles
        .map((talle) => {
          let t = limpiarTexto(talle.replace(",", "."));
          if (t.endsWith(".0")) t = t.substring(0, t.length - 2);
          const num = parseFloat(t);
          if (!isNaN(num) && num >= 4 && num <= 16) {
            const ar = convertirUsAAr(t);
            if (ar) return ar;
          }
          return t;
        })
        .filter((t) => esTalleValido(t)),
    ),
  );
}

export function extraerTallesGrimoldi(html: string) {
  const $ = cheerio.load(html);
  const talles: string[] = [];

  $(".talles li:not(.sin-stock):not(.disabled), .product-size, select[name='talle'] option, .sizes li:not(.disabled)").each((_, elemento) => {
    const texto = $(elemento).text().trim();
    if (texto.toLowerCase().includes("seleccionar") || texto.toLowerCase().includes("elegir")) {
      return;
    }
    const match = texto.match(/^(\d+(?:\.\d+)?)/);
    if (match) {
      talles.push(match[1]);
    }
  });

  return normalizarTalles(talles);
}

export function extraerTallesDemandware(html: string) {
  const $ = cheerio.load(html);
  const talles: string[] = [];

  // 1. Dexter, StockCenter, Moov (.variation-attribute-size)
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

  // 2. Under Armour, New Balance (.size-attribute, etc.)
  if (talles.length === 0) {
    $(".size-attribute, [data-attr='size'] button, .select-size option").each((_, elemento) => {
      const item = $(elemento);
      if (item.hasClass("disabled") || item.attr("disabled")) {
        return;
      }

      const rawText = limpiarTexto(item.text());
      if (!rawText || rawText.toLowerCase().includes("seleccionar") || rawText.toLowerCase().includes("guía")) {
        return;
      }

      // Si es formato New Balance unisex tipo "M4 / W5.5" o "M10 / W11.5"
      const matchM = rawText.match(/M\s*(\d+(?:\.\d+)?)/i);
      if (matchM) {
        const ar = convertirUsAAr(matchM[1]);
        if (ar) talles.push(ar);
      } else {
        const matchNum = rawText.match(/^(\d+(?:\.\d+)?)/);
        if (matchNum) {
          const num = parseFloat(matchNum[1]);
          if (num >= 4 && num <= 16) {
            const ar = convertirUsAAr(matchNum[1]);
            if (ar) talles.push(ar);
          } else if (esTalleValido(matchNum[1])) {
            talles.push(matchNum[1]);
          }
        }
      }
    });
  }

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
  const faqMatch = html.match(/Los talles disponibles de [^:]+ son:\s*([\d.,\s/]+)(?:\.|\"|<)/i);
  if (faqMatch && faqMatch[1]) {
    faqMatch[1].split(/[,/]/).forEach((t) => {
      let limpio = t.trim().replace(",", ".");
      if (limpio.endsWith(".")) limpio = limpio.slice(0, -1);
      if (limpio.endsWith(".0")) limpio = limpio.substring(0, limpio.length - 2);
      if (limpio && /^\d+(\.\d+)?$/.test(limpio)) {
        talles.add(limpio);
      }
    });
  }

  // 2. Parser de jsonConfig / spConfig de Magento (Trip Store, OpenSports, etc.)
  const jsonConfigMatches =
    html.match(/jsonConfig["']?\s*:\s*(\{[\s\S]*?\})\s*,\s*["']template/i) ||
    html.match(/"Magento_Swatches\/js\/swatch-renderer"\s*:\s*\{[\s\S]*?"jsonConfig"\s*:\s*(\{[\s\S]*?\})\s*\}\s*\}/i) ||
    html.match(/"\[data-role=swatch-options\]"\s*:\s*\{[\s\S]*?"jsonConfig"\s*:\s*(\{[\s\S]*?\})\s*\}\s*\}/i);

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

  // 3. Parser de opciones de atributos con stock (products: [...])
  const regexOptions = /"options"\s*:\s*(\[\s*\{[\s\S]*?\}\s*\])/g;
  let match;
  while ((match = regexOptions.exec(html)) !== null) {
    try {
      const opts = JSON.parse(match[1]);
      if (Array.isArray(opts)) {
        opts.forEach((o: any) => {
          if (o.label && Array.isArray(o.products) && o.products.length > 0) {
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

  return normalizarTalles(Array.from(talles));
}

export function extraerTallesPuma(html: string) {
  const talles: string[] = [];

  // 1. Parser SSR de mobify-data (Puma Commerce Cloud PWA)
  const mobifyMatch = html.match(/<script id="mobify-data"[^>]*>([\s\S]*?)<\/script>/i);
  if (mobifyMatch && mobifyMatch[1]) {
    try {
      const mobifyJson = JSON.parse(mobifyMatch[1]);
      const queries = mobifyJson.__PRELOADED_STATE__?.__reactQuery?.queries || [];
      for (const q of queries) {
        const data = q.state?.data;
        if (data?.variationAttributes) {
          const sizeAttr = data.variationAttributes.find((attr: any) => attr.id === "size");
          if (sizeAttr && Array.isArray(sizeAttr.values)) {
            for (const val of sizeAttr.values) {
              if (val.orderable !== false && val.name) {
                const match = String(val.name).trim().match(/^(\d+(?:\.\d+)?)/);
                if (match) {
                  talles.push(match[1]);
                } else {
                  talles.push(String(val.name).trim());
                }
              }
            }
          }
        }
      }
    } catch {}
  }

  // 2. Fallback selector DOM
  if (talles.length === 0) {
    const $ = cheerio.load(html);
    $("[data-ui-id='size-button'], .size-button, button[data-attr-value], [data-size-value], .product-size, select[name='size'] option").each((_, el) => {
      const item = $(el);
      if (item.hasClass("disabled") || item.attr("disabled") || item.attr("data-available") === "false" || item.is(":disabled")) {
        return;
      }
      const val = item.attr("data-attr-value") || item.attr("data-size-value") || item.text().trim();
      if (!val || val.toLowerCase().includes("seleccionar") || val.toLowerCase().includes("guía")) return;
      const match = val.match(/^(\d+(?:\.\d+)?)/);
      if (match) {
        talles.push(match[1]);
      }
    });
  }

  return normalizarTalles(talles);
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

  if (plataforma === "grimoldi") {
    return extraerTallesGrimoldi(html);
  }

  if (plataforma === "puma") {
    return extraerTallesPuma(html);
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
