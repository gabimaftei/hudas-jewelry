/* ═══════════════════════════════════════════════════════════════
   Generarea fişierelor site-ului
   ───────────────────────────────────────────────────────────────
   Tot ce scrie Huda în panou ajunge în pagini de aici. Regula e una
   singură: ORICE text venit din panou trece prin esc() înainte să
   intre în HTML. Nu există nicăieri innerHTML cu text de-al ei.

   Paginile de blog sunt generate ca HTML static, nu construite din
   JavaScript în browser, dintr-un motiv precis: previzualizarea unui
   link pe WhatsApp sau Instagram nu rulează JavaScript. Doar aşa arată
   poza şi titlul articolului, nu doar sigla site-ului.
   ═══════════════════════════════════════════════════════════════ */

export function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* U+2028 şi U+2029 trec prin JSON.stringify neescapate: valide în JSON,
   dar multă vreme interzise într-un literal JavaScript. */
export function encJson(v) {
  const BS = String.fromCharCode(92);
  return JSON.stringify(v, null, 2)
    .split(String.fromCharCode(0x2028)).join(BS + 'u2028')
    .split(String.fromCharCode(0x2029)).join(BS + 'u2029');
}

/* Amprentă scurtă a unui text (FNV-1a). Intră în adresa scripturilor de
   date, ca browserul să nu ţină în cache o versiune veche după o salvare. */
export function hash(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(36);
}

/* Citeşte `const NUME = <json>;` dintr-un fişier generat. */
export function parseConsts(text, names) {
  const out = {};
  for (const name of names) {
    const start = text.indexOf(`const ${name} = `);
    if (start < 0) throw new Error(`Lipseşte ${name} din fişier.`);
    const from = start + `const ${name} = `.length;
    const end = text.indexOf(';\n', from);
    out[name] = JSON.parse(text.slice(from, end < 0 ? undefined : end));
  }
  return out;
}

/* ─────────────── fişierele de date ─────────────── */

export function renderProductsJs(products, exhibitions) {
  return `/* ---------------------------------------------------------------
   HUDA'S JEWELRY — catalogul pieselor
   ---------------------------------------------------------------
   FIȘIER GENERAT. Este rescris de fiecare dată când se salvează din
   panoul de la /admin, deci orice modificare făcută de mână aici se
   pierde la următoarea salvare. Pentru schimbări de conținut,
   folosește panoul.

   Câmpuri care NU se editează din panou, dar sunt duse mai departe:
     spin        câte cadre are rotirea (de obicei 36). Cadrele stau în
                 assets/spins/<id>/01.jpg … Vezi FOTOGRAFIERE.md.
     spinReverse true dacă rotirea merge în sensul greşit.
   --------------------------------------------------------------- */

const PRODUCTS = ${encJson(products)};

const EXHIBITIONS = ${encJson(exhibitions)};
`;
}

export function renderContentJs(content, timeline) {
  return `/* ---------------------------------------------------------------
   HUDA'S JEWELRY — textele site-ului
   ---------------------------------------------------------------
   FIȘIER GENERAT de panoul de la /admin, tabul „Texte". Orice
   modificare făcută de mână aici se pierde la următoarea salvare.

   CONTENT   textele, pe chei, în română şi engleză. O cheie nouă se
             adaugă de mână aici ŞI în index.html (atributul data-i18n);
             panoul o arată abia după ce apare şi în schema din
             admin/texts.js.
   TIMELINE  cronologia expoziţiilor şi premiilor, în ordinea de pe site.
   --------------------------------------------------------------- */

const CONTENT = ${encJson(content)};

const TIMELINE = ${encJson(timeline)};
`;
}

export function renderPostsJson(posts) {
  return JSON.stringify({ posts }, null, 2) + '\n';
}

/* ─────────────── ajutoare de text ─────────────── */

const MONTHS = {
  ro: ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie',
       'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
       'August', 'September', 'October', 'November', 'December'],
};

export function formatDate(iso, lang) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[lang][m - 1]} ${y}`;
}

/* Paragrafele se despart printr-un rând liber; un singur Enter rămâne
   rând nou în acelaşi paragraf. */
export function paragraphs(text) {
  return String(text || '').replace(/\r\n?/g, '\n').split(/\n\s*\n/)
    .map((p) => p.trim()).filter(Boolean)
    .map((p) => '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>')
    .join('\n      ');
}

export function excerpt(text, max = 170) {
  const first = String(text || '').replace(/\r\n?/g, '\n').split(/\n\s*\n/)
    .map((p) => p.trim()).filter(Boolean)[0] || '';
  const flat = first.replace(/\s+/g, ' ');
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ') > 60 ? cut.lastIndexOf(' ') : max).replace(/[\s,.;:—-]+$/, '') + '…';
}

/* Un text în ambele limbi: site-ul arată blocul limbii alese
   (assets/js/common.js). Engleza goală cade pe română. */
function both(ro, en) {
  return `<span data-l="ro">${esc(ro)}</span><span data-l="en" hidden>${esc(en || ro)}</span>`;
}

export function translated(post) {
  const en = post.en || {};
  return !!(en.title && en.title.trim()) && (!!(en.body && en.body.trim()) || !(post.ro.body || '').trim());
}

export function sortPosts(posts) {
  return posts.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/* Adresa site-ului şi versiunea stilurilor, luate din index.html, ca să
   existe un singur loc de schimbat când se leagă domeniul. */
export function siteInfo(indexHtml) {
  const canon = /<link rel="canonical" href="([^"]+)"/.exec(indexHtml);
  const ver = /styles\.css\?v=([0-9]+)/.exec(indexHtml);
  return {
    site: canon ? canon[1].replace(/\/+$/, '') : '',
    ver: ver ? ver[1] : '1',
  };
}

function postUrl(post) { return `/blog/${post.id}/`; }
function postPhoto(post, n) { return `/assets/blog/${post.id}/${n}.jpg`; }

export function postCard(post, heading = 'h3') {
  const cover = post.photos[0];
  const en = translated(post) ? post.en : post.ro;
  return `<a class="post-card" href="${postUrl(post)}">
      <span class="post-card__img"><img src="${postPhoto(post, 1)}" alt="" width="${cover.w}" height="${cover.h}" loading="lazy" decoding="async"></span>
      <span class="post-card__date"><time datetime="${post.date}">${both(formatDate(post.date, 'ro'), formatDate(post.date, 'en'))}</time></span>
      <${heading} class="post-card__title">${both(post.ro.title, en.title)}</${heading}>
      <span class="post-card__excerpt">${both(excerpt(post.ro.body), excerpt(en.body))}</span>
    </a>`;
}

/* ─────────────── pagina principală ─────────────── */

function between(html, name, inner) {
  const re = new RegExp(`(<!-- ${name}:start -->)[\\s\\S]*?(<!-- ${name}:end -->)`);
  if (!re.test(html)) throw new Error(`index.html nu mai are marcajul „${name}".`);
  return html.replace(re, (m, a, b) => a + inner + b);
}

export function renderTimeline(timeline) {
  return timeline.map((e) => `
      <li>
        <span class="timeline__when">${both(e.when.ro, e.when.en)}</span>
        <div>
          <p class="timeline__what">${both(e.what.ro, e.what.en)}</p>${(e.where.ro || '').trim() ? `
          <p class="timeline__where">${both(e.where.ro, e.where.en)}</p>` : ''}
        </div>
      </li>`).join('') + '\n      ';
}

export function renderTeaser(posts) {
  const latest = sortPosts(posts).slice(0, 3);
  if (!latest.length) return '';
  return `
<section class="section section--alt" id="blog" aria-labelledby="blog-title">
  <div class="teaser">
    <div class="section__head">
      <p class="eyebrow" data-i18n="blog.eyebrow"></p>
      <h2 class="section__title" id="blog-title" data-i18n="blog.title"></h2>
      <p class="section__lede" data-i18n="blog.lede"></p>
    </div>
    <div class="posts">
      ${latest.map((p) => postCard(p)).join('\n      ')}
    </div>
    <p class="posts__more"><a class="btn btn--ghost" href="/blog/" data-i18n="blog.all"></a></p>
  </div>
</section>
`;
}

export function renderIndex(html, { content, timeline, posts, productsJs, contentJs }) {
  const ro = content.ro;
  let out = html;

  out = between(out, 'timeline', renderTimeline(timeline));
  out = between(out, 'blog', renderTeaser(posts));
  const blogLink = posts.length ? '<a href="/blog/" data-i18n="nav.blog"></a>' : '';
  out = between(out, 'navblog', blogLink);
  out = between(out, 'footblog', blogLink);

  /* textul românesc din fiecare element cu data-i18n — cel pe care îl văd
     Google, previzualizările şi cine are JavaScript oprit */
  out = out.replace(
    /(<([a-z][a-z0-9]*)\b[^>]*?\sdata-i18n="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g,
    (m, open, tag, key, inner, close) =>
      Object.prototype.hasOwnProperty.call(ro, key) ? open + esc(ro[key]) + close : m,
  );

  if (Object.prototype.hasOwnProperty.call(ro, 'meta.description')) {
    const d = esc(ro['meta.description']);
    out = out.replace(/(<meta name="description" content=")[^"]*(")/, (m, a, b) => a + d + b);
    out = out.replace(/(<meta property="og:description" content=")[^"]*(")/, (m, a, b) => a + d + b);
  }

  out = out.replace(/assets\/js\/products\.js\?[^"]*"/, () => `assets/js/products.js?h=${hash(productsJs)}"`);
  out = out.replace(/assets\/js\/content\.js\?[^"]*"/, () => `assets/js/content.js?h=${hash(contentJs)}"`);
  return out;
}

/* ─────────────── paginile de blog ─────────────── */

const ICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%232b221c'/%3E%3Ctext x='16' y='22' font-family='Georgia,serif' font-size='16' fill='%23c9a57e' text-anchor='middle'%3EH%3C/text%3E%3C/svg%3E`;

const IG_SVG = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.12 1.38C1.35 2.68.94 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.12.66.66 1.33 1.07 2.12 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.12-1.38.66-.66 1.07-1.33 1.38-2.12.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.72-1.46-1.38-2.12C21.32 1.35 20.65.94 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0z"/><path fill="currentColor" d="M12 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zm0 10.16a4 4 0 110-8 4 4 0 010 8z"/><circle fill="currentColor" cx="18.41" cy="5.59" r="1.44"/></svg>`;

function page({ content, site, ver, contentJs, title, description, image, path, type, extraHead, main }) {
  const ro = content.ro;
  const tx = (k) => esc(ro[k] || '');
  const url = site + path;
  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">

<!-- Pagină generată de panoul de la /admin. Orice modificare făcută de mână se pierde la următoarea salvare. -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self'; font-src 'self'; script-src 'self'; connect-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'none'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="theme-color" content="#2b221c">
<meta name="color-scheme" content="light">

<meta property="og:type" content="${type}">
<meta property="og:site_name" content="HUDA'S JEWELRY">
<meta property="og:locale" content="ro_RO">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(site + image)}">
<meta property="og:url" content="${esc(url)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${esc(url)}">${extraHead || ''}

<link rel="icon" href="${ICON}">
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/cormorant-garamond-400-latin.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/jost-300-latin.woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/fonts.css">
<link rel="stylesheet" href="/assets/css/styles.css?v=${ver}">
</head>
<body>

<a class="skip-link" href="#top">${both('Sari la conținut', 'Skip to content')}</a>

<header class="nav" id="nav">
  <div class="nav__inner">
    <a class="nav__brand" href="/">
      <span class="nav__mark">HUDA'S JEWELRY</span>
      <span class="nav__est" data-i18n="nav.est">${tx('nav.est')}</span>
    </a>

    <div class="nav__actions">
      <a class="nav__ig" href="https://www.instagram.com/hudasjewelry/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
        ${IG_SVG}
      </a>
      <button class="nav__burger" type="button" aria-label="Meniu" aria-expanded="false" aria-controls="nav-links">
        <span></span><span></span>
      </button>
    </div>

    <nav class="nav__links" id="nav-links" aria-label="Navigare principală">
      <a href="/#collection" data-i18n="nav.collection">${tx('nav.collection')}</a>
      <a href="/#story" data-i18n="nav.story">${tx('nav.story')}</a>
      <a href="/#recognition" data-i18n="nav.recognition">${tx('nav.recognition')}</a>
      <a href="/blog/" data-i18n="nav.blog">${tx('nav.blog')}</a>
      <a href="/#contact" data-i18n="nav.contact">${tx('nav.contact')}</a>
      <div class="langswitch" role="group" aria-label="Limbă / Language">
        <button type="button" data-lang="ro" aria-pressed="true">RO</button>
        <span class="langswitch__sep" aria-hidden="true">/</span>
        <button type="button" data-lang="en" aria-pressed="false">EN</button>
      </div>
    </nav>
  </div>
</header>

<main id="top">
${main}
</main>

<footer class="footer">
  <div class="footer__inner">
    <div>
      <p class="footer__mark">HUDA'S JEWELRY</p>
      <p class="footer__tag" data-i18n="footer.tag">${tx('footer.tag')}</p>
    </div>
    <nav class="footer__links" aria-label="Navigare secundară">
      <a href="/#collection" data-i18n="nav.collection">${tx('nav.collection')}</a>
      <a href="/#story" data-i18n="nav.story">${tx('nav.story')}</a>
      <a href="/#recognition" data-i18n="nav.recognition">${tx('nav.recognition')}</a>
      <a href="/blog/" data-i18n="nav.blog">${tx('nav.blog')}</a>
      <a href="https://www.instagram.com/hudasjewelry/" target="_blank" rel="noopener noreferrer">Instagram</a>
    </nav>
    <p class="footer__copy">© <span id="year"></span> Huda Mahdi</p>
  </div>
</footer>

<script src="/assets/js/content.js?h=${hash(contentJs)}"></script>
<script src="/assets/js/common.js?v=${ver}"></script>
</body>
</html>
`;
}

export function renderBlogIndex({ content, posts, site, ver, contentJs }) {
  const ro = content.ro;
  const list = sortPosts(posts);
  const body = list.length
    ? `<div class="posts posts--all">
    ${list.map((p) => postCard(p, 'h2')).join('\n    ')}
  </div>`
    : `<p class="posts__empty" data-i18n="blog.empty">${esc(ro['blog.empty'] || '')}</p>`;

  return page({
    content, site, ver, contentJs,
    title: `${ro['nav.blog'] || 'Blog'} — HUDA'S JEWELRY`,
    description: ro['blog.lede'] || ro['meta.description'] || '',
    image: list.length ? postPhoto(list[0], 1) : '/assets/images/og.jpg',
    path: '/blog/',
    type: 'website',
    main: `<section class="section blog-head" aria-labelledby="blog-title">
  <div class="section__head">
    <p class="eyebrow" data-i18n="blog.eyebrow">${esc(ro['blog.eyebrow'] || '')}</p>
    <h1 class="section__title" id="blog-title" data-i18n="blog.title">${esc(ro['blog.title'] || '')}</h1>
    <p class="section__lede" data-i18n="blog.lede">${esc(ro['blog.lede'] || '')}</p>
  </div>
  ${body}
</section>`,
  });
}

function articleBlock(lang, post, content, useRo) {
  const src = useRo ? post.ro : post[lang];
  const hidden = lang === 'ro' ? '' : ' hidden';
  const note = lang === 'en' && useRo
    ? `\n      <p class="article__note">${esc(content.en['blog.onlyRo'] || content.ro['blog.onlyRo'] || '')}</p>` : '';
  return `<div data-l="${lang}"${hidden}>
      <h1 class="article__title">${esc(src.title)}</h1>${note}
    </div>`;
}

function bodyBlock(lang, post, useRo) {
  const src = useRo ? post.ro : post[lang];
  const hidden = lang === 'ro' ? '' : ' hidden';
  return `<div class="article__body" data-l="${lang}"${hidden}>
      ${paragraphs(src.body)}
    </div>`;
}

export function renderPost({ content, post, site, ver, contentJs }) {
  const ro = content.ro;
  const tr = translated(post);
  const photos = post.photos.map((ph, i) =>
    `<img src="${postPhoto(post, i + 1)}" alt="${esc(post.ro.title)} — ${i + 1}" width="${ph.w}" height="${ph.h}" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async">`);

  return page({
    content, site, ver, contentJs,
    title: `${post.ro.title} — HUDA'S JEWELRY`,
    description: excerpt(post.ro.body) || ro['meta.description'] || '',
    image: postPhoto(post, 1),
    path: postUrl(post),
    type: 'article',
    extraHead: `\n<meta property="article:published_time" content="${post.date}">`,
    main: `<article class="article">
    <p class="article__back"><a href="/blog/" data-i18n="blog.back">${esc(ro['blog.back'] || '')}</a></p>
    <p class="eyebrow"><time datetime="${post.date}">${both(formatDate(post.date, 'ro'), formatDate(post.date, 'en'))}</time></p>
    ${articleBlock('ro', post, content, false)}
    ${articleBlock('en', post, content, !tr)}
    <figure class="article__cover">${photos[0]}</figure>
    ${bodyBlock('ro', post, false)}
    ${bodyBlock('en', post, !tr)}${photos.length > 1 ? `
    <div class="article__photos">
      ${photos.slice(1).join('\n      ')}
    </div>` : ''}
    <p class="article__back article__foot"><a href="/blog/" data-i18n="blog.back">${esc(ro['blog.back'] || '')}</a></p>
  </article>`,
  });
}
