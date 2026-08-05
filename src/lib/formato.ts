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

export function normalizarTallesArray(talles: (string | number)[]): string[] {
  if (!talles) return [];
  const procesados = talles.flatMap(t => {
    if (t === null || t === undefined) return [];
    // Separamos por cualquier tipo de guión o barra (ej: "36-36.5", "36/37")
    return String(t).split(/[-–—/]/).map(parte => {
      let limpio = parte.trim().replace(",", ".").toUpperCase();
      if (limpio.endsWith(".0")) limpio = limpio.substring(0, limpio.length - 2);
      return limpio;
    });
  });
  return Array.from(new Set(procesados)).filter(Boolean);
}

export function normalizarTalleUnico(talle: string | number): string {
  if (talle === null || talle === undefined) return "";
  let t = String(talle).split(/[-–—/]/)[0].trim().replace(",", ".").toUpperCase();
  if (t.endsWith(".0")) t = t.substring(0, t.length - 2);
  return t;
}

export function normalizarCategoria(categoria: string): string | null {
  if (!categoria) return null;
  const c = normalizarTexto(categoria);

  // Categorías a excluir directamente (calzado que NO queremos)
  if (
    c.includes("zueco") ||
    c.includes("zapato") ||
    c.includes("traje de bano") ||
    c.includes("ojota") ||
    c.includes("sandalia") ||
    c.includes("crocs") ||
    c.includes("newsport") ||
    c === "category" ||
    c === "general" ||
    // bota sola → excluir, pero botin → permitir (ver abajo)
    (c.includes("bota") && !c.includes("botin"))
  ) return null;

  // Botines (fútbol) — categoría permitida
  if (c.includes("botin") || c === "futbol" || c === "football") return "Botines";

  // Zapatillas — categoría permitida
  if (c.includes("zapatilla") || c.includes("sneaker") || c.includes("calzado")
      || c.includes("running") || c.includes("training") || c.includes("basketball")
      || c.includes("tenis") || c.includes("outdoor") || c.includes("skate")
      || c.includes("lifestyle") || c.includes("urbano") || c.includes("indoor")
      || c.includes("futsal") || c.includes("sala")) return "Zapatillas";

  return capitalizarTexto(categoria.trim().toLowerCase());
}

/** Infiere la subcategoría de un producto (Running, Training, Basketball, etc.)
 *  a partir del nombre del producto y/o su categoría. */
export function inferirSubcategoria(nombre: string, categoria?: string | null): string | null {
  const n = normalizarTexto(nombre);
  const c = normalizarTexto(categoria ?? "");
  const texto = `${n} ${c}`;

  // ── Botines: subcategorías de fútbol ──────────────────────────────────
  if (c === "botines" || n.includes("botin")) {
    if (texto.includes("sala") || texto.includes("futsal") || texto.includes(" ic ") || texto.includes(" in ")) return "Sala";
    if (texto.includes("sintetico") || texto.includes("artificial") || texto.includes(" ag ") || texto.includes(" tf ")) return "Sintético";
    return "Campo";
  }

  // ── Zapatillas: subcategorías por deporte / uso ───────────────────────
  if (texto.includes("running") || texto.includes("correr") || texto.includes(" run ") || texto.endsWith(" run")) return "Running";
  if (texto.includes("training") || texto.includes("crossfit") || texto.includes("cross") || texto.includes("entrenamiento")) return "Training";
  if (texto.includes("basketball") || texto.includes("basquet") || texto.includes("nba")) return "Basketball";
  if (texto.includes(" tenis") || texto.includes("tennis") || texto.includes(" clay") || texto.includes(" clay")) return "Tenis";
  if (texto.includes("futsal") || texto.includes("futbol sala") || texto.includes("indoor soccer")) return "Fútbol Sala";
  if (texto.includes("outdoor") || texto.includes("trail") || texto.includes("hiking") || texto.includes("hike")) return "Outdoor";
  if (texto.includes("skate") || texto.includes("skateboarding")) return "Skate";
  if (texto.includes("lifestyle") || texto.includes("urbano") || texto.includes("casual") || texto.includes("street")) return "Lifestyle";

  return null; // Sin subcategoría específica detectada
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

/** Determina si un producto es calzado permitido (zapatillas O botines).
 *  Los botines de fútbol también son bienvenidos ahora. */
export function esCalzadoPermitido(nombre: string, categoria?: string): boolean {
  const nombreNormalizado = normalizarTexto(nombre);

  // 1. Excluir si contiene términos prohibidos en el nombre
  const terminosExcluidos = [
    // Accesorios de calzado / bolsos / protecciones que contienen la palabra "botin" o "zapatilla"
    "botinero", "botineros", "canillera", "canilleras", "pantorrillera", "pantorrilleras",
    "rodillera", "rodilleras", "tobillera", "tobilleras", "venda", "vendas", "codera", "coderas",
    "media", "medias", "socks", "plantilla", "plantillas", "cordon", "cordones",

    // Ropa superior
    "buzo", "remera", "camiseta", "campera", "chaleco", "musculosa", "chomba", "polera",
    "hoodie", "jacket", "sweater", "sueter", "pulover", "abrigo", "parka",
    "rompeviento", "t-shirt", "shirt", "jersey", "sweatshirt", "pullover", "cardigan",
    "corpino", "bra", "sosten", "camperon",

    // Ropa inferior
    "pantalon", "pantalones", "short", "shorts", "calza", "calzas", "bermuda", "bermudas",
    "jogger", "calzoncillo", "boxer", "tanga", "slip", "malla", "sunga", "bikini",
    "gabardina", "cargo", "chino", "pantaloneta", "bombacha",
    "vestido", "pollera", "conjunto", "traje", "bano",

    // Calzado NO permitido (chanclas, ojotas, crocs, pantuflas, etc.)
    "sandalia", "sandalias", "ojota", "ojotas", "crocs", "pantufla",
    "pantuflas", "borcego", "borcegos", "clava", "clavas", "taco", "zueco", "zuecos",

    // Accesorios y equipamiento
    "mochila", "bolso", "bolsos", "rinonera", "cartera",
    "bandolera", "morral", "billetera", "gorra", "gorro", "gorras", "visera",
    "sombrero", "anteojos", "lentes", "reloj", "perfume", "fragancia", "botella", "termo",
    "llavero", "munequera", "cinturon", "toalla", "vincha",
    "cuello", "bufanda", "guantes", "mitones", "bandana",

    // Deportes / Hardware
    "pelota", "balon", "ball", "hoop", "inflador",
    "tiza", "pala", "paleta", "raqueta", "palo", "stick", "bocha", "disco", "pesa",
    "mancuerna", "colchoneta", "mat", "soga", "arco", "aro", "casco",

    // Materiales / tecnologías de ropa
    "fleece", "terry", "climalite", "climacool", "heatgear",
    "coldgear", "algodon", "poliester", "spandex", "lycra", "elastano", "microfibra",
  ];

  for (const termino of terminosExcluidos) {
    if (new RegExp(`\\b${termino}\\b`, "i").test(nombreNormalizado)) {
      return false;
    }
  }

  // 2. Excluir si la categoría es claramente de ropa o accesorios
  if (categoria) {
    const catNorm = normalizarTexto(categoria);
    const catExcluidas = [
      "indumentaria", "accesorios", "ropa", "remeras", "buzos", "pantalones",
      "shorts", "medias", "gorras", "pelotas", "equipamiento", "lifestyle ropa",
    ];
    for (const catExcl of catExcluidas) {
      if (catNorm.includes(catExcl)) return false;
    }
  }

  // 3. Si el nombre contiene botin, botines, zapatilla, calzado, etc. → permitido
  if (
    nombreNormalizado.includes("botin") ||
    nombreNormalizado.includes("botines") ||
    nombreNormalizado.includes("zapatilla") ||
    nombreNormalizado.includes("zapatillas") ||
    nombreNormalizado.includes("sneaker") ||
    nombreNormalizado.includes("calzado")
  ) {
    return true;
  }

  // 4. Si no tiene palabras de calzado pero tampoco términos excluidos (ej. "Nike Air Max 90"),
  // lo consideramos calzado
  return true;
}

/** Alias de compatibilidad — preferir esCalzadoPermitido en código nuevo */
export const esZapatilla = esCalzadoPermitido;
