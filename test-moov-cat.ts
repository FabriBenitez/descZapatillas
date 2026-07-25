import * as cheerio from "cheerio";

async function run() {
  const res = await fetch("https://www.moov.com.ar/sale?q=nike");
  const html = await res.text();
  const $ = cheerio.load(html);
  
  let count = 0;
  $(".product-tile").each((_, el) => {
    if (count > 5) return;
    const gtmAttr = $(el).attr("data-gtm");
    if (gtmAttr) {
      try {
        const gtm = JSON.parse(gtmAttr);
        console.log(gtm[0]?.item_name);
        console.log("  Category:", gtm[0]?.item_category);
        console.log("  Category2:", gtm[0]?.item_category2);
        console.log("  List Name:", gtm[0]?.item_list_name);
      } catch (e) {}
    }
    count++;
  });
}
run();
