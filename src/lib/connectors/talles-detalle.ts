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

  $("#sizes label.sizeLbl").each((_, elemento) => {
    const item = $(elemento);

    if (item.hasClass("nostock")) {
      return;
    }

    const copia = item.clone();
    copia.children().remove();
    talles.push(limpiarTexto(copia.text()));
  });

  return normalizarTalles(talles);
}

export function extraerTallesMagento(html: string) {
  const talles = new Set<string>();
  const regexOpciones =
    /"code":"(?:talle_calzado|talle|size)"[\s\S]*?"options":(\[[\s\S]*?\])[,}]/g;
  let coincidencia: RegExpExecArray | null;

  while ((coincidencia = regexOpciones.exec(html))) {
    try {
      const opciones = JSON.parse(coincidencia[1]) as Array<{
        label?: string;
        products?: string[];
      }>;

      opciones.forEach((opcion) => {
        if (opcion.label && opcion.products?.length) {
          talles.add(opcion.label);
        }
      });
    } catch {
      continue;
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
  limite = 6,
) {
  const productosPriorizados = productos.slice(0, limite);
  const productosSinDetalle = productos.slice(limite);
  const enriquecidos: Producto[] = [];
  const tamanoLote = 4;

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
