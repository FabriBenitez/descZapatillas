const cheerio = require('cheerio');
fetch('https://www.solodeportes.com.ar/catalogsearch/result/?q=adizero+sl+crudo', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
}).then(r => r.text()).then(html => {
  const $ = cheerio.load(html);
  $('li.product-item').each((_, el) => {
    const p = $(el);
    const name = p.find('.product-item-link').first().text().trim();
    const id = p.find('[data-product-id]').first().attr('data-product-id');
    console.log(name, id);
  });
});
