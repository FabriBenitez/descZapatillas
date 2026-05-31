import { construirUrlDexterSale, parsearProductosDexter } from "../src/lib/connectors/dexter.ts";
import { construirUrlMoovSale, parsearProductosMoov } from "../src/lib/connectors/moov.ts";

async function fetchAndParse(url, parser) {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124"
      }
    });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const html = await res.text();
    const products = parser(html);
    return { count: products.length, products };
  } catch (err) {
    return { error: err.message };
  }
}

async function run() {
  const query = "Adizero sl2";
  
  console.log(`--- Testing DEXTER search for "${query}" ---`);
  // Case A: With category (hot-sale)
  const urlDexterA = construirUrlDexterSale({ query, categoryId: "hot-sale" });
  // Case B: With category (sale)
  const urlDexterB = construirUrlDexterSale({ query, categoryId: "sale" });
  // Case C: No category at all (delete cgid)
  const urlDexterC = construirUrlDexterSale({ query }).replace(/&cgid=[^&]*/, "").replace(/cgid=[^&]*&?/, "");

  console.log(`Case A (cgid=hot-sale): ${urlDexterA}`);
  const resDexterA = await fetchAndParse(urlDexterA, parsearProductosDexter);
  console.log(` -> Result: ${resDexterA.error ? resDexterA.error : `${resDexterA.count} products`}`);

  console.log(`Case B (cgid=sale): ${urlDexterB}`);
  const resDexterB = await fetchAndParse(urlDexterB, parsearProductosDexter);
  console.log(` -> Result: ${resDexterB.error ? resDexterB.error : `${resDexterB.count} products`}`);

  console.log(`Case C (No cgid): ${urlDexterC}`);
  const resDexterC = await fetchAndParse(urlDexterC, parsearProductosDexter);
  console.log(` -> Result: ${resDexterC.error ? resDexterC.error : `${resDexterC.count} products`}`);
  if (resDexterC.count > 0) {
    console.log(`   Sample: ${resDexterC.products[0].name} | Price: ${resDexterC.products[0].price} | Discount: ${resDexterC.products[0].discount}%`);
  }

  console.log(`\n--- Testing MOOV search for "${query}" ---`);
  // Case A: With category (sale)
  const urlMoovA = construirUrlMoovSale({ query });
  // Case B: No category at all (delete cgid)
  const urlMoovB = construirUrlMoovSale({ query }).replace(/&cgid=[^&]*/, "").replace(/cgid=[^&]*&?/, "");

  console.log(`Case A (cgid=sale): ${urlMoovA}`);
  const resMoovA = await fetchAndParse(urlMoovA, parsearProductosMoov);
  console.log(` -> Result: ${resMoovA.error ? resMoovA.error : `${resMoovA.count} products`}`);

  console.log(`Case B (No cgid): ${urlMoovB}`);
  const resMoovB = await fetchAndParse(urlMoovB, parsearProductosMoov);
  console.log(` -> Result: ${resMoovB.error ? resMoovB.error : `${resMoovB.count} products`}`);
  if (resMoovB.count > 0) {
    console.log(`   Sample: ${resMoovB.products[0].name} | Price: ${resMoovB.products[0].price} | Discount: ${resMoovB.products[0].discount}%`);
  }
}

run();
