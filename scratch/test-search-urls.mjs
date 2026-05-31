import { obtenerOfertasTiendaExterna } from "../src/lib/connectors/tiendas-externas.ts";

const mockTiendas = [
  {
    slug: "solodeportes",
    nombre: "Solo Deportes",
    baseUrl: "https://www.solodeportes.com.ar",
    plataforma: "magento",
    urlProductos: "https://www.solodeportes.com.ar/catalogsearch/result/?q=zapatillas",
  },
  {
    slug: "dionysos",
    nombre: "Dionysos",
    baseUrl: "https://www.digitalsport.com.ar",
    plataforma: "digitalsport",
    urlProductos: "https://www.digitalsport.com.ar/dionysos/",
  },
  {
    slug: "blast",
    nombre: "Blast",
    baseUrl: "https://www.digitalsport.com.ar",
    plataforma: "digitalsport",
    urlProductos: "https://www.blast.com.ar/?mobile-app=true&theme=falseCampfire",
  }
];

// Mock construirUrlTienda to test
function construirUrlTienda(
  tienda,
  { query = "zapatillas", size = 50, pagina = 0 } = {},
) {
  const esBusquedaEspecifica = query !== "zapatillas";

  if (tienda.plataforma === "magento") {
    if (!esBusquedaEspecifica && tienda.urlProductos) {
      return tienda.urlProductos;
    }
    const params = new URLSearchParams({ q: query });
    return `${tienda.baseUrl}/catalogsearch/result/?${params}`;
  }

  if (tienda.plataforma === "digitalsport") {
    if (!esBusquedaEspecifica && tienda.urlProductos) {
      return tienda.urlProductos;
    }
    const params = new URLSearchParams({ q: query });
    let path = "/search/";
    if (tienda.slug === "dionysos") {
      path = "/dionysos/search/";
    } else if (tienda.slug === "blast") {
      path = "/blast/search/";
    }
    return `${tienda.baseUrl}${path}?${params}`;
  }
  return "";
}

async function test() {
  const query = "Puma -180";
  console.log(`Testing search for: "${query}"`);
  
  for (const tienda of mockTiendas) {
    const url = construirUrlTienda(tienda, { query });
    console.log(`\nStore: ${tienda.nombre} | Platform: ${tienda.plataforma}`);
    console.log(`Generated URL: ${url}`);
    
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124"
        }
      });
      console.log(`Response Status: ${res.status}`);
      if (res.ok) {
        const html = await res.text();
        console.log(`HTML Length: ${html.length}`);
        
        // Let's see if we can find any products in the HTML to verify search page structure
        const hasProducts = html.includes("product-item") || html.includes("productid") || html.includes("product-item-info");
        console.log(`Looks like it has product indicators: ${hasProducts}`);
      }
    } catch (err) {
      console.error(`Error fetching:`, err);
    }
  }
}

test();
