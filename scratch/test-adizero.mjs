import { obtenerTodasLasOfertasMoov } from "../src/lib/connectors/moov.ts";
import { obtenerTodasLasOfertasGrid } from "../src/lib/connectors/grid.ts";
import { obtenerTodasLasOfertasDexter } from "../src/lib/connectors/dexter.ts";
import { obtenerTodasLasOfertasTiendasExternas } from "../src/lib/connectors/tiendas-externas.ts";

async function run() {
  const query = "Adizero sl2";
  console.log(`Searching for "${query}" across all stores...`);
  
  try {
    const responses = await Promise.allSettled([
      obtenerTodasLasOfertasMoov({ paginas: 1, query }).then(res => ({ store: "Moov", products: res })),
      obtenerTodasLasOfertasGrid({ paginas: 1, query }).then(res => ({ store: "Grid", products: res })),
      obtenerTodasLasOfertasDexter({ paginas: 1, query, categoryId: "sale" }).then(res => ({ store: "Dexter", products: res })),
      obtenerTodasLasOfertasTiendasExternas({ paginas: 1, query }).then(res => ({ store: "Externas", products: res })),
    ]);

    responses.forEach(r => {
      if (r.status === "fulfilled") {
        const { store, products } = r.value;
        console.log(`\nStore ${store}: Found ${products.length} products`);
        products.forEach(p => {
          console.log(` - ID: ${p.id} | Name: ${p.name} | Price: $${p.price} | ListPrice: $${p.listPrice} | Discount: ${p.discount}%`);
        });
      } else {
        console.error("Store failed:", r.reason);
      }
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
