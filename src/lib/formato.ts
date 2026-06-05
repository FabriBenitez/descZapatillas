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

export function normalizarMarca(marca: string) {
  if (!marca) return "Sin Marca";
  
  const m = marca.trim().toLowerCase();

  // Agrupar sub-marcas de Adidas
  if (m.startsWith("adidas")) return "Adidas";
  
  // Agrupar sub-marcas de Puma
  if (m.startsWith("puma")) return "Puma";

  // Excepciones específicas de capitalización
  if (m === "and1") return "AND1";
  if (m === "asics") return "Asics";
  if (m === "addnice" || m === "add nice") return "Addnice";
  if (m === "47 street") return "47 Street";
  if (m === "fila") return "Fila";
  if (m === "nike") return "Nike";
  if (m === "under armour") return "Under Armour";
  if (m === "new balance") return "New Balance";
  if (m === "converse") return "Converse";
  if (m === "vans") return "Vans";
  if (m === "reebok") return "Reebok";
  if (m === "topper") return "Topper";
  if (m === "salomon") return "Salomon";

  return capitalizarTexto(m);
}

export function normalizarTallesArray(talles: string[]): string[] {
  if (!talles) return [];
  const procesados = talles.flatMap(t => {
    if (!t) return [];
    // Si viene "36-36.5", separamos por el guión
    return t.split("-").map(parte => {
      let limpio = parte.trim().replace(",", ".").toUpperCase();
      if (limpio.endsWith(".0")) limpio = limpio.substring(0, limpio.length - 2);
      return limpio;
    });
  });
  return Array.from(new Set(procesados)).filter(Boolean);
}

export function normalizarTalleUnico(talle: string): string {
  if (!talle) return "";
  let t = talle.split("-")[0].trim().replace(",", ".").toUpperCase();
  if (t.endsWith(".0")) t = t.substring(0, t.length - 2);
  return t;
}

export function normalizarCategoria(categoria: string): string | null {
  if (!categoria) return null;
  const c = normalizarTexto(categoria);

  // Categorías a excluir directamente
  if (
    c.includes("zueco") ||
    c.includes("zapato") ||
    c.includes("traje de bano") ||
    c.includes("newsport") ||
    c === "category" ||
    c === "general" ||
    c.includes("bota")
  ) return null;

  if (c.includes("botin")) return "Botines";
  if (c.includes("zapatilla") || c.includes("sneaker")) return "Zapatillas";
  if (c.includes("ojota") || c.includes("sandalia") || c.includes("crocs")) return "Sandalias y Ojotas";

  return capitalizarTexto(categoria.trim().toLowerCase());
}

export function normalizarColor(color: string) {
  if (!color || color === ".") return "Varios";
  const map: Record<string, string> = {
    "amarillo": "Amarillo",
    "azul": "Azul",
    "beige": "Beige",
    "blanco": "Blanco",
    "bordo": "Bordó",
    "celeste": "Celeste",
    "cobre": "Cobre",
    "coral": "Coral",
    "crema": "Crema",
    "crudo": "Crudo",
    "fucsia": "Fucsia",
    "gris": "Gris",
    "marron": "Marrón",
    "naranja": "Naranja",
    "negro": "Negro",
    "plata": "Plata",
    "plateado": "Plata",
    "oro": "Oro",
    "dorado": "Oro",
    "rojo": "Rojo",
    "rosa": "Rosa",
    "rosado": "Rosa",
    "verde": "Verde",
    "violeta": "Violeta",
    "purpura": "Violeta",
    "multicolor": "Multicolor",
    "transparente": "Transparente"
  };
  const c = normalizarTexto(color);
  return map[c] || capitalizarTexto(color.trim().toLowerCase());
}

export function normalizarGenero(genero: string) {
  if (!genero) return "Unisex";
  const g = normalizarTexto(genero);
  
  if (g.includes("nino") || g.includes("nina") || g.includes("bebe")) return "Niños";
  if (g.includes("mujer") || g.includes("femenino")) return "Mujer";
  if (g.includes("hombre") || g.includes("masculino")) return "Hombre";
  
  return "Unisex";
}

export function esZapatilla(nombre: string, categoria?: string): boolean {
  const nombreNormalizado = normalizarTexto(nombre);

  // 1. Excluir si contiene términos prohibidos en el nombre
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

  // 2. Excluir si la categoría es de ropa o accesorios
  if (categoria) {
    const catNormalizada = normalizarTexto(categoria);
    const categoriasExcluidas = [
      "indumentaria", "accesorios", "ropa", "remeras", "buzos", "pantalones",
      "shorts", "medias", "gorras", "pelotas", "equipamiento"
    ];
    for (const catExcl of categoriasExcluidas) {
      if (catNormalizada.includes(catExcl)) {
        return false;
      }
    }
  }

  // 3. Determinar si tiene indicación positiva de calzado en el nombre
  const tienePalabraClaveNombre = 
    nombreNormalizado.includes("zapatilla") || 
    nombreNormalizado.includes("sneaker") || 
    nombreNormalizado.includes("zapa") ||
    nombreNormalizado.includes("zapato") ||
    nombreNormalizado.includes("botin");

  // 4. Determinar si la categoría indica que es calzado
  let tieneCategoriaCalzado = false;
  if (categoria) {
    const catNormalizada = normalizarTexto(categoria);
    tieneCategoriaCalzado =
      catNormalizada.includes("zapatilla") ||
      catNormalizada.includes("calzado") ||
      catNormalizada.includes("botin") ||
      catNormalizada.includes("sneaker") ||
      catNormalizada.includes("zapas") ||
      catNormalizada.includes("footwear") ||
      catNormalizada.includes("running") ||
      catNormalizada.includes("training") ||
      catNormalizada.includes("tenis") ||
      catNormalizada.includes("futbol") ||
      catNormalizada.includes("basquet");
  }

  // Si no tiene indicación de calzado en el nombre ni en la categoría, se descarta
  if (!tienePalabraClaveNombre && !tieneCategoriaCalzado) {
    return false;
  }

  return true;
}
