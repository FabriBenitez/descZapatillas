import { obtenerProductosConectoresSinCache } from "../lib/productos";

async function test() {
  console.log("Iniciando prueba rápida del bot de Vercel...");
  const inicio = Date.now();
  
  try {
    const productos = await obtenerProductosConectoresSinCache();
    const duracion = ((Date.now() - inicio) / 1000).toFixed(1);
    
    console.log(`✅ Prueba completada en ${duracion} segundos.`);
    console.log(`👟 Se encontraron ${productos.length} ofertas frescas.`);
    
    if (productos.length > 0) {
      console.log("\nEjemplos encontrados:");
      for (let i = 0; i < Math.min(5, productos.length); i++) {
        console.log(`- [${productos[i].storeName}] ${productos[i].brand} ${productos[i].name} ($${productos[i].price})`);
      }
    }
  } catch (error) {
    console.error("Error durante la prueba:", error);
  }
}

test();
