async function run() {
  const encodings = [
    "puma%20180",
    "puma 180",
    "puma-180",
    "puma+180",
  ];
  
  for (const enc of encodings) {
    const url = `https://www.grid.com.ar/api/catalog_system/pub/products/search?ft=${enc}&_from=0&_to=4&O=OrderByBestDiscountDESC`;
    try {
      console.log(`\nFetching URL: ${url}`);
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124"
        }
      });
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`Success: Found ${data.length} products`);
        if (data.length > 0) {
          console.log(`First product: ${data[0].productName}`);
        }
      }
    } catch (err) {
      console.error(`Error:`, err.message);
    }
  }
}

run();
