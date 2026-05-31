import * as cheerio from "cheerio";

const products = [
  {
    id: "nike-air-force-1-07-blanco-dexter",
    name: "Nike Air Force 1 '07 Blanco",
    productUrl: "https://www.dexter.com.ar/nike-air-force-1-07-blanco/p",
  },
  {
    id: "adidas-campus-00s-grid",
    name: "Adidas Campus 00s Core Black",
    productUrl: "https://www.grid.com.ar/adidas-campus-00s-core-black/p",
  },
  {
    id: "puma-suede-xl-moov",
    name: "Puma Suede XL Classic Green",
    productUrl: "https://www.moov.com.ar/puma-suede-xl-classic-green/p",
  },
  {
    id: "new-balance-530-stockcenter",
    name: "New Balance 530 Silver Navy",
    productUrl: "https://www.stockcenter.com.ar/new-balance-530-silver-navy/p",
  },
  {
    id: "converse-chuck-70-plus-open-sports",
    name: "Converse Chuck 70 Plus Canvas",
    productUrl: "https://www.opensports.com.ar/converse-chuck-70-plus-canvas/p",
  },
  {
    id: "asics-gel-1130-digital-sport",
    name: "Asics Gel-1130 White Pure Silver",
    productUrl: "https://www.digitalsport.com.ar/asics-gel-1130-white-pure-silver/p",
  },
  {
    id: "nike-dunk-low-retro-nike-factory",
    name: "Nike Dunk Low Retro Panda",
    productUrl: "https://www.nike.com/ar/t/dunk-low-retro-panda-zapatillas/p",
  },
  {
    id: "adidas-response-cl-adidas",
    name: "Adidas Response CL Sand Strata",
    productUrl: "https://www.adidas.com.ar/response-cl-sand-strata/p",
  },
  {
    id: "vans-knu-skool-dionysos",
    name: "Vans Knu Skool Black White",
    productUrl: "https://www.dionysos.com.ar/vans-knu-skool-black-white/p",
  },
  {
    id: "reebok-club-c-85-sportline",
    name: "Reebok Club C 85 Vintage",
    productUrl: "https://www.sportline.com.ar/reebok-club-c-85-vintage/p",
  },
  {
    id: "under-armour-phantom-solo-deportes",
    name: "Under Armour Phantom 4 Knit",
    productUrl: "https://www.solodeportes.com.ar/under-armour-phantom-4-knit/p",
  },
  {
    id: "fila-disruptor-feria-sneakers",
    name: "Fila Disruptor II Premium",
    productUrl: "https://www.feriasneakers.com.ar/fila-disruptor-ii-premium/p",
  },
];

async function getRealImage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!res.ok) {
      console.log(`Failed to fetch ${url}: Status ${res.status}`);
      return null;
    }
    
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Try og:image first
    let image = $('meta[property="og:image"]').attr('content') || 
                $('meta[name="og:image"]').attr('content') ||
                $('meta[property="og:image:secure_url"]').attr('content');
                
    if (image) return image;
    
    // Fallbacks
    image = $('.product-image-photo').first().attr('src') || 
            $('.product-image-photo').first().attr('data-src') || 
            $('img.primary-image').first().attr('src') ||
            $('img.img').first().attr('src') ||
            $('img.img').first().attr('data-src');
            
    return image || null;
  } catch (err) {
    console.log(`Error fetching ${url}:`, err.message);
    return null;
  }
}

async function main() {
  console.log("Starting to fetch real images for mock products...");
  const results = {};
  for (const prod of products) {
    console.log(`Fetching image for: ${prod.name} from ${prod.productUrl}...`);
    const imgUrl = await getRealImage(prod.productUrl);
    console.log(`Result: ${imgUrl}`);
    results[prod.id] = imgUrl;
  }
  console.log("\nDone! Results JSON:");
  console.log(JSON.stringify(results, null, 2));
}

main();
