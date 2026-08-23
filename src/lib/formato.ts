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

export function normalizarMarca(marca: string, nombreProducto?: string) {
  if (!marca || marca.toLowerCase() === "sin marca") {
    if (nombreProducto) {
      const n = nombreProducto.toLowerCase();
      if (n.includes("new balance")) return "New Balance";
      if (n.includes("under armour")) return "Under Armour";
      if (n.includes("le coq")) return "Le Coq Sportif";
      if (n.includes("dc ")) return "DC Shoes";
      if (n.includes("nike")) return "Nike";
      if (n.includes("adidas")) return "Adidas";
      if (n.includes("puma")) return "Puma";
      if (n.includes("topper")) return "Topper";
      if (n.includes("asics")) return "Asics";
      if (n.includes("vans")) return "Vans";
      if (n.includes("reebok")) return "Reebok";
      if (n.includes("fila")) return "Fila";
    }
    return "Sin Marca";
  }
  
  const m = marca.trim().toLowerCase();

  // Si vino truncada (ej. "New" o "Under" o "Le") y el nombre tiene la marca completa:
  if (m === "new" && (!nombreProducto || nombreProducto.toLowerCase().includes("balance"))) return "New Balance";
  if (m === "under" && (!nombreProducto || nombreProducto.toLowerCase().includes("armour"))) return "Under Armour";
  if (m === "le" && (!nombreProducto || nombreProducto.toLowerCase().includes("coq"))) return "Le Coq Sportif";
  if (m === "dc") return "DC Shoes";

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
  if (m === "under armour" || m === "underarmour") return "Under Armour";
  if (m === "new balance" || m === "newbalance") return "New Balance";
  if (m === "converse") return "Converse";
  if (m === "vans") return "Vans";
  if (m === "reebok") return "Reebok";
  if (m === "topper") return "Topper";
  if (m === "salomon") return "Salomon";
  if (m === "le coq sportif" || m === "le coq") return "Le Coq Sportif";
  if (m === "dc shoes") return "DC Shoes";

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

export function normalizarCategoria(categoria?: string | null, nombre?: string): string {
  const c = normalizarTexto(categoria ?? "");
  const n = normalizarTexto(nombre ?? "");
  const texto = `${c} ${n}`;

  if (
    texto.includes("botin") ||
    texto.includes("botines") ||
    texto.includes("futbol") ||
    texto.includes("futsal") ||
    texto.includes("football")
  ) {
    return "Botines";
  }

  return "Zapatillas";
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
  if (texto.includes(" tenis") || texto.includes("tennis") || texto.includes(" clay")) return "Tenis";
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

// Calzado no permitido (chanclas, ojotas, sandalias, slides, crocs, pantuflas, ballerinas, mocasines, tacos)
const CALZADO_NO_PERMITIDO_RE = /\b(ojota|ojotas|sandalia|sandalias|slide|slides|crocs|croc|pantufla|pantuflas|zueco|zuecos|flip flop|flip-flop|ballerina|ballerinas|chancleta|chancletas|alpargata|alpargatas|taco|tacos|stiletto|stilettos|mocasin|mocasines)\b/i;

// Accesorios de calzado / cuidado
const ACCESORIOS_CALZADO_RE = /\b(botinero|botineros|cordon|cordones|plantilla|plantillas|shampoo|limpiador|impermeabilizante|pomada|cepillo)\b/i;

// Categorías prohibidas que descartan de plano
const CATEGORIAS_PROHIBIDAS_RE = /\b(indumentaria|ropa|ropa deportiva|remera|remeras|camisa|camisas|camiseta|camisetas|top|tops|buzo|buzos|hoodie|hoodies|sweater|sweaters|campera|camperas|chaleco|chalecos|pantalon|pantalones|short|shorts|calza|calzas|bermuda|bermudas|jogger|joggers|pollera|polleras|vestido|vestidos|malla|mallas|bikini|bikinis|ropa interior|underwear|media|medias|calcetines|gorra|gorras|gorro|gorros|visera|viseras|mochila|mochilas|bolso|bolsos|bolsa|bolsas|rinonera|rinoneras|morral|morrales|accesorios|accesorio|equipamiento|pelota|pelotas|balon|balones|guante|guantes|antiparra|antiparras|luz|luces|grip|grips|herramienta|herramientas|soporte|soportes|cinta|cintas|munequera|munequeras|ciclismo|bicicleta|natacion|padel|tenis accesorios|hockey|boxeo|fitness|gimnasio|ballerina|ballerinas|ojota|ojotas|sandalia|sandalias|slide|slides|crocs|pantufla|pantuflas|zueco|zuecos)\b/i;

// Palabras de indumentaria / equipamiento / accesorios para descartar productos que no son calzado
const ARTICULOS_NO_CALZADO_RE = /\b(remera|remeras|remeron|remerones|camiseta|camisetas|chomba|chombas|musculosa|musculosas|camisa|camisas|blusa|blusas|campera|camperas|camperon|camperones|chaleco|chalecos|jacket|jackets|parka|parkas|rompeviento|rompevientos|anorak|anoraks|windbreaker|windbreakers|abrigo|abrigos|buzo|buzos|hoodie|hoodies|sweater|sweaters|sueter|sueteres|pullover|pullovers|sudadera|sudaderas|cardigan|cardigans|tank|t-shirt|tshirt|t-shirts|tshirts|tee|tees|pantalon|pantalones|pants|pant|short|shorts|calza|calzas|bermuda|bermudas|jogger|joggers|legging|leggings|tights|pollera|polleras|falda|faldas|vestido|vestidos|pantaloneta|pantalonetas|babucha|babuchas|boxer|boxers|slip|slips|calzoncillo|calzoncillos|tanga|tangas|bombacha|bombachas|underwear|bikini|bikinis|malla|mallas|sunga|sungas|traje de bano|trajes de bano|enterito|enteritos|body|bodys|bodysuit|media|medias|calcetin|calcetines|soquete|soquetes|pantorrillera|pantorrilleras|canillera|canilleras|rodillera|rodilleras|tobillera|tobilleras|codera|coderas|muslera|musleras|faja|fajas|venda|vendas|protector bucal|cabezal|pechera|pecheras|gorra|gorras|gorro|gorros|visera|viseras|piluso|pilusos|cap|caps|hat|hats|beanie|beanies|sombrero|sombreros|vincha|vinchas|bandana|bandanas|cuello|cuellos|bufanda|bufandas|mochila|mochilas|bolso|bolsos|bag|bags|backpack|backpacks|rinonera|rinoneras|morral|morrales|cartera|carteras|bandolera|bandoleras|billetera|billeteras|cartuchera|cartucheras|neceser|neceseres|funda|fundas|valija|valijas|monedero|monederos|totebag|tote bag|sacochila|llavero|llaveros|pin|pins|sticker|stickers|toalla|toallas|reloj|perfume|colonia|fragancia|pelota|pelotas|balon|balones|guante|guantes|glove|gloves|miton|mitones|antiparra|antiparras|goggle|goggles|lente|lentes|anteojo|anteojos|gafas|sunglasses|snorkel|botella|botellas|termo|termos|vaso|vasos|caramanhola|caramañola|shaker|shakers|raqueta|raquetas|paleta|paletas|pala|palas|stick|sticks|palo de hockey|bocha|bochas|overgrip|overgrips|pesa|pesas|mancuerna|mancuernas|kettlebell|kettlebells|colchoneta|colchonetas|mat|soga para saltar|soga|sogas|banda elastica|bandas elasticas|cono|conos|silbato|silbatos|cronometro|inflador|infladores|red de tenis|red de voley|arco de futbol|aro de basquet|baston|bastones|bastones de trekking|bicicleta|bicicletas|bike|bici|luz|luces|cadena|cadenas|cable|cables|caja pedalera|pedal|pedales|eje pasante|plato|descarrilador|ducto|maza|cartucho|llanta|llantas|cubierta|cubiertas|camara|casco|cascos|soporte|soportes|herramienta|herramientas|manubrio|asiento|top|tops|crop|bra|bras|corpino|corpinos|sosten|sostenes)\b/i;

/** Determina de forma estricta si un producto es calzado permitido (zapatillas O botines).
 *  Excluye indumentaria (remeras, camperas, buzos, tops, etc.), accesorios y equipamiento de otros deportes. */
export function esCalzadoPermitido(nombre: string, categoria?: string | null): boolean {
  if (!nombre) return false;
  const nombreNorm = normalizarTexto(nombre);
  const catNorm = normalizarTexto(categoria || "");

  // 1. Descartar si la categoría proviene de indumentaria o accesorios no calzado
  if (catNorm && CATEGORIAS_PROHIBIDAS_RE.test(catNorm)) {
    return false;
  }

  // 2. Descartar calzado no permitido (chanclas, ojotas, sandalias, ballerinas, crocs, pantuflas, etc.)
  if (CALZADO_NO_PERMITIDO_RE.test(nombreNorm) || (catNorm && CALZADO_NO_PERMITIDO_RE.test(catNorm))) {
    return false;
  }

  // 3. Descartar accesorios de calzado (botineros, cordones, plantillas, limpiadores)
  if (ACCESORIOS_CALZADO_RE.test(nombreNorm)) {
    return false;
  }

  // 4. Si el nombre comienza o tiene como tipo de artículo una prenda o accesorio no calzado (ej. "Top Deportivo", "Remera...", "Bicicleta...")
  const primerPalabra = nombreNorm.split(/\s+/)[0];
  const dosPrimerasPalabras = nombreNorm.split(/\s+/).slice(0, 2).join(" ");
  if (ARTICULOS_NO_CALZADO_RE.test(primerPalabra) || ARTICULOS_NO_CALZADO_RE.test(dosPrimerasPalabras)) {
    return false;
  }

  // 5. Si el nombre contiene palabra explícita de calzado (zapatilla, zapatillas, botin, botines, sneakers, etc.)
  const tienePalabraCalzado = /\b(zapatilla|zapatillas|zapa|zapas|zapatilas|zapatilllas|zapatiilas|sneaker|sneakers|botin|botines|calzado|footwear)\b/i.test(nombreNorm);

  if (tienePalabraCalzado) {
    // Si contiene palabra de calzado pero es ropa/accesorio (ej. "Remera con estampa zapatillas")
    if (ARTICULOS_NO_CALZADO_RE.test(nombreNorm)) {
      // Si la palabra de no calzado aparece antes que la de calzado, se descarta
      const posNoCalzado = nombreNorm.search(ARTICULOS_NO_CALZADO_RE);
      const posCalzado = nombreNorm.search(/\b(zapatilla|zapatillas|zapa|zapas|sneaker|sneakers|botin|botines|calzado|footwear)\b/i);
      if (posNoCalzado !== -1 && posCalzado !== -1 && posNoCalzado < posCalzado) {
        return false;
      }
    }
    return true;
  }

  // 6. Botas de marcas deportivas/urbanas reconocidas (ej. Solo Deportes calzado mid/high-top "Botas Adidas Hoops", "Botas Puma Rebound", "Botas Converse Chuck Taylor", etc.)
  if (/\b(bota|botas)\b/i.test(nombreNorm)) {
    const esBotaDeportiva = /\b(adidas|puma|nike|reebok|converse|topper|kappa|atomik|47 street|montagne|vans|fila|asics|salomon|under armour|umbro|lotto|fila|diadora)\b/i.test(nombreNorm);
    if (esBotaDeportiva && !ARTICULOS_NO_CALZADO_RE.test(nombreNorm)) {
      return true;
    }
  }

  // 7. Si no tiene palabra calzado en el título, pero la categoría es zapatillas/botines/calzado y no tiene palabras prohibidas
  const esCategoriaCalzado = catNorm === "zapatillas" || catNorm === "botines" || catNorm === "calzado";
  if (esCategoriaCalzado && !ARTICULOS_NO_CALZADO_RE.test(nombreNorm)) {
    return true;
  }

  // Cualquier otro producto queda DESCARTADO
  return false;
}

/** Alias de compatibilidad — preferir esCalzadoPermitido en código nuevo */
export const esZapatilla = esCalzadoPermitido;
