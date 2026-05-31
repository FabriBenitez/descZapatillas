import * as cheerio from "cheerio";

async function run() {
    const r = await fetch('https://www.moov.com.ar/on/demandware.store/Sites-Moov-Site/default/Search-UpdateGrid?q=PU395205-49');
    const html = await r.text();
    const $ = cheerio.load(html);
    console.log("Full text of product:", $('.product').first().text().replace(/\s+/g, ' '));
}

run().catch(console.error);
