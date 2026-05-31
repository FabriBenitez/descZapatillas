import type { Producto } from "@/types/producto";

const formateadorMoneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const formateadorFecha = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatearPrecio(valor: number) {
  return formateadorMoneda.format(valor);
}

export function formatearFecha(valor: string) {
  return formateadorFecha.format(new Date(valor));
}

export function formatearPorcentaje(valor: number) {
  return `${Math.round(valor)}%`;
}

export function normalizarTexto(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function calcularAhorro(producto: Producto) {
  return Math.max(producto.listPrice - producto.price, 0);
}

export function calcularMejorPrecioHistorico(producto: Producto) {
  if (typeof producto.historicalBestPrice === "number") {
    return producto.historicalBestPrice;
  }

  const preciosHistoricos =
    producto.priceHistory?.map((registro) => registro.precio) ?? [];

  return Math.min(producto.price, ...preciosHistoricos);
}

export function obtenerHorasDesdeActualizacion(valor: string) {
  const fechaActualizacion = new Date(valor).getTime();
  const diferencia = Date.now() - fechaActualizacion;

  return Math.max(0, Math.round(diferencia / (1000 * 60 * 60)));
}

export function capitalizarTexto(texto: string) {
  return texto.replace(/\b\w/g, (letra) => letra.toUpperCase());
}

export function esZapatilla(nombre: string, categoria?: string): boolean {
  const nombreNormalizado = normalizarTexto(nombre);

  const tienePalabraClave = 
    nombreNormalizado.includes("zapatilla") || 
    nombreNormalizado.includes("sneaker") || 
    nombreNormalizado.includes("zapa") ||
    nombreNormalizado.includes("zapato") ||
    nombreNormalizado.includes("botin");
    
  if (!tienePalabraClave) {
    return false;
  }

  const terminosExcluidos = [
    "buzo", "remera", "camiseta", "pantalon", "short", "media", "mochila", "gorra", "gorro",
    "calza", "top", "pelota", "campera", "chaleco", "vestido", "pollera", "conjunto", "bolso",
    "rinonera", "anteojos", "medias", "hoop", "ball", "cap", "socks", "hoodie", "jacket",
    "t-shirt", "bra", "sosten", "corpino", "calzoncillo", "boxer", "tanga", "slip", "perfume",
    "fragancia", "botella", "termo", "llavero", "munequera", "pantaloneta", "pantalon",
    "camperas", "buzos", "remeras", "camisetas", "calzas", "shorts", "bolsos", "gorras",
    "chalecos", "conjuntos", "sandalia", "ojota", "ojotas", "crocs", "pantufla", "pantuflas",
    "bota", "botas", "accesorios", "indumentaria", "tiza", "inflador",
    "antidoping", "gorra", "visera", "medias", "cordones", "plantillas", "bermuda", "bermudas",
    "chews", "gummy", "caramelo"
  ];

  for (const termino of terminosExcluidos) {
    const regex = new RegExp(`\\b${termino}\\b`, "i");
    if (regex.test(nombreNormalizado)) {
      return false;
    }
  }

  if (categoria) {
    const catNormalizada = normalizarTexto(categoria);
    if (
      catNormalizada.includes("indumentaria") ||
      catNormalizada.includes("accesorios") ||
      catNormalizada.includes("ropa") ||
      catNormalizada.includes("remeras") ||
      catNormalizada.includes("buzos")
    ) {
      return false;
    }
  }

  return true;
}
