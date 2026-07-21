const cheerio = require("cheerio");

async function run() {
  const url = "https://www.solodeportes.com.ar/ofertas/calzado.html";
  const resp = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
    }
  });
  const html = await resp.text();
  const $ = cheerio.load(html);
  
  const items = $(".product-item-info");
  console.log("Items found:", items.length);
  
  if (items.length === 0) {
    console.log("Maybe they use something else?");
    console.log("Status:", resp.status);
    console.log("Html snapshot:", html.substring(0, 500));
  }
}
run();
