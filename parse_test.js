const cheerio = require('cheerio');
const fs = require('fs');
const html = fs.readFileSync('test.html', 'utf-8');
const $ = cheerio.load(html);
let found = 0;
$('li.product-item').each((_, el) => {
  found++;
  const p = $(el);
  const name = p.find('.product-item-link').first().text().trim();
  const price = p.find('[data-price-type="finalPrice"]').first().attr('data-price-amount') || p.find('.special-price .price').first().text().trim();
  const oldPrice = p.find('[data-price-type="oldPrice"]').first().attr('data-price-amount') || p.find('.old-price .price').first().text().trim();
  console.log(name, '|', price, '|', oldPrice);
});
console.log('Items found:', found);
