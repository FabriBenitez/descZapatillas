import { normalizarTexto } from "../src/lib/formato.ts";

function esZapatilla(nombre, categoria) {
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
    const regex = new RegExp(`\\b${termino}\\b`, 'i');
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

const testCases = [
  { name: "Zapatillas adidas Adizero Sl2 W Mujer", cat: "Calzado", expected: true },
  { name: "Zapatillas adidas Adizero Aruku", cat: "Calzado", expected: true },
  { name: "Buzo Puma Unisex Downtown 180 Half-Zip", cat: "Buzos", expected: false },
  { name: "Camiseta Puma Borussia Dortmund Suplente 25/26 Hombre", cat: "Remeras", expected: false },
  { name: "Short Puma Essentials 4\" Sweat Tr", cat: "Pantalones", expected: false },
  { name: "Calza Entrenamiento Puma Animal Remix 7/8 Mujer", cat: "Calzas", expected: false },
  { name: "Top Puma Lemlem Low Impact Mujer", cat: "Tops", expected: false },
  { name: "Zapatillas Puma -180 Unisex Marron", cat: "Calzado", expected: true },
  { name: "Zapatillas Puma 180 Unisex", cat: "Calzado", expected: true },
  { name: "Botines Puma Future Z 3.4 FG/AG Infantil", cat: "Calzado", expected: true }, // Should be allowed now!
  { name: "Ojotas Puma Popcat 20", cat: "Calzado", expected: false },
  { name: "adidas Adizero SL2", cat: "Calzado", expected: false },
  { name: "Zapatillas adidas Adizero SL2", cat: "Calzado", expected: true },
  { name: "BERMUDA RUSTICA KAANAPALI", cat: "Zapatillas", expected: false },
  { name: "CHEWS 60gr STRAWBERRY", cat: "Zapatillas", expected: false },
];

testCases.forEach(tc => {
  const result = esZapatilla(tc.name, tc.cat);
  console.log(`Name: ${tc.name.padEnd(55)} | Cat: ${tc.cat.padEnd(10)} | Expected: ${tc.expected ? 'YES' : 'NO '} | Got: ${result ? 'YES' : 'NO '} | ${result === tc.expected ? '✅' : '❌'}`);
});
