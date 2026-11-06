// Regenerează local ce regenerează /api/publish (server/api.js), fără GitHub:
// pagini de articole, blog, pagini de piese, prima pagină, 404 şi sitemap.
// Foloseşte aceleaşi funcţii de randare ca panoul. Rulare: node tools/build-site.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseConsts, renderProductsJs, renderContentJs, renderPostsJson, renderIndex, renderBlogIndex,
  renderPost, translated, renderNotFound, renderSitemap, siteInfo, sortPosts, hash,
} from '../server/render.js';
import { renderProductPage } from '../server/render-products.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const put = (p, c) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), c); };

const { PRODUCTS: products, EXHIBITIONS: exhibitions } = parseConsts(read('assets/js/products.js'), ['PRODUCTS', 'EXHIBITIONS']);
const { CONTENT: content, TIMELINE: timeline } = parseConsts(read('assets/js/content.js'), ['CONTENT', 'TIMELINE']);
const posts = sortPosts(JSON.parse(read('data/posts.json')).posts);
const indexHtml = read('index.html');
const productsJs = renderProductsJs(products, exhibitions);
const contentJs = renderContentJs(content, timeline);
const { site, ver } = siteInfo(indexHtml);

put('assets/js/products.js', productsJs);
put('assets/js/content.js', contentJs);
put('data/posts.json', renderPostsJson(posts));
put('index.html', renderIndex(indexHtml, { content, timeline, posts, productsJs, contentJs }));
put('en/index.html', renderIndex(indexHtml, { content, timeline, posts, productsJs, contentJs, lang: 'en' }));
put('blog/index.html', renderBlogIndex({ content, posts, site, ver, contentJs }));
for (const post of posts) {
  put(`blog/${post.id}/index.html`, renderPost({ content, post, site, ver, contentJs }));
  if (translated(post)) put(`en/blog/${post.id}/index.html`, renderPost({ content, post, site, ver, contentJs, lang: 'en' }));
}
for (const product of products) {
  put(`piese/${product.id}/index.html`, renderProductPage({ content, product, products, exhibitions, posts, site, ver, contentJs }));
  put(`en/piese/${product.id}/index.html`, renderProductPage({ content, product, products, exhibitions, posts, site, ver, contentJs, lang: 'en' }));
}
put('404.html', renderNotFound({ content, posts, site, ver, contentJs }));
put('sitemap.xml', renderSitemap({ posts, products, site }));
console.log(`Gata: ${posts.length} articole, ${products.length} piese.`);
