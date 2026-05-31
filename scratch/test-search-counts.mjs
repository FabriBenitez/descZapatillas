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
        const discounted = products.filter(p => p.discount >= 1);
        console.log(`\nStore ${store}: Found ${products.length} products total, ${discounted.length} discounted`);
        discounted.forEach(p => {
          console.log(` - [DISCOUNTED] ID: ${p.id} | Name: ${p.name} | Price: $${p.price} | ListPrice: $${p.listPrice} | Discount: ${p.discount}%`);
        });
        if (products.length > 0 && discounted.length === 0) {
          console.log(` Sample non-discounted: ${products[0].name} | Price: $${products[0].price} | ListPrice: $${products[0].listPrice} | Discount: ${products[0].discount}%`);
        }
      } else {
        console.error("Store failed:", r.reason);
      }
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
