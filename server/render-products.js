/* ═══════════════════════════════════════════════════════════════
   Paginile pieselor: /piese/<id>/
   ───────────────────────────────────────────────────────────────
   Fiecare piesă din catalog primeşte o pagină HTML statică a ei,
   generată la fiecare salvare din panou, la fel ca articolele de blog.
   Pe prima pagină piesele se deschid într-o fereastră construită din
   JavaScript; asta e bine pentru vizitator, dar Google n-are ce să
   claseze acolo, iar o previzualizare pe WhatsApp n-are ce să arate.

   Aceeaşi regulă ca în render.js: ORICE text venit din panou trece
   prin esc() (direct sau prin both() / paragraphs()).
   ═══════════════════════════════════════════════════════════════ */
import { esc, encJson, page, both, paragraphs, excerpt } from './render.js';

const IG_DM = 'https://ig.me/m/hudasjewelry';

/* Tipurile de piesă, la singular. Pluralul lor e în app.js (filtrele). */
const KIND = {
  inel:      { ro: 'Inel',      en: 'Ring' },
  colier:    { ro: 'Colier',    en: 'Necklace' },
  pandantiv: { ro: 'Pandantiv', en: 'Pendant' },
  cercei:    { ro: 'Cercei',    en: 'Earrings' },
  bratara:   { ro: 'Brățară',   en: 'Bracelet' },
};

/* Aceleaşi texte ca în fereastra piesei (COPY din assets/js/app.js).
   Dacă se schimbă acolo, se schimbă şi aici. */
const COPY = {
  ro: {
    back: 'Înapoi la colecție',
    sold: 'Piesă plecată',
    kind: 'Tip',
    materials: 'Materiale',
    exhibited: 'Expusă la',
    oneoff: 'Serie',
    oneoffVal: 'Piesă unicat, nu se repetă',
    order: 'Întreabă de piesa asta',
    orderSold: 'Piesa asta a plecat',
    note: 'Se deschide conversația cu @hudasjewelry. Spune-i că e vorba de „{name}” și îți răspunde cu prețul și cu detaliile.',
    noteSold: 'Piesa asta nu mai e disponibilă, dar rămâne aici. Scrie-i dacă vrei ceva pornit de la ea.',
    photo: 'fotografia {n}',
    more: 'Alte piese',
    all: 'Toată colecția',
  },
  en: {
    back: 'Back to the collection',
    sold: 'Gone',
    kind: 'Kind',
    materials: 'Materials',
    exhibited: 'Shown at',
    oneoff: 'Edition',
    oneoffVal: 'One of a kind, never repeated',
    order: 'Ask about this piece',
    orderSold: 'This piece is gone',
    note: 'This opens a chat with @hudasjewelry. Tell her it is about “{name}” and she will come back with the price and the details.',
    noteSold: 'This one has found its person, but it stays here. Message her if you would like something built from it.',
    photo: 'photo {n}',
    more: 'More pieces',
    all: 'The whole collection',
  },
};

/* un text de interfaţă, în ambele limbi */
const ui = (k) => both(COPY.ro[k], COPY.en[k]);
const fill = (s, vals) => s.replace(/\{(\w+)\}/g, (m, k) => (vals[k] !== undefined ? String(vals[k]) : ''));

export function productUrl(p, lang = 'ro') { return `${lang === 'en' ? '/en' : ''}/piese/${p.id}/`; }
function photo(p, n) { return `/assets/images/${p.id}-${n}.jpg`; }
/* <picture> cu varianta WebP (panoul urcă .webp lângă fiecare .jpg) şi rezerva
   JPG; aceeaşi structură o face şi picture() din assets/js/app.js. Dacă .webp
   lipseşte, assets/js/common.js trece singur pe JPG. */
function pic(src, imgAttrs) {
  return `<picture><source srcset="${src.replace(/\.jpg$/, '.webp')}" type="image/webp"><img src="${src}" ${imgAttrs}></picture>`;
}

/* Engleza goală cade pe română, câmp cu câmp. */
function locOf(p, lang) {
  const ro = p.ro || {};
  const src = p[lang] || {};
  const out = {};
  for (const k of ['name', 'tagline', 'description', 'materials']) out[k] = (src[k] || '').trim() ? src[k] : (ro[k] || '');
  return out;
}

/* JSON-LD stă într-un <script>: un "<" din textul Hudei (de pildă
   "</script>") ar închide blocul. Îl scriem ca secvenţă de escape JSON. */
function ldJson(v) {
  const BS = String.fromCharCode(92);
  return encJson(v).split('<').join(BS + 'u003c');
}

/* Până la patru alte piese: întâi cele de acelaşi tip, apoi restul,
   în ordinea din catalog, începând de după piesa curentă. */
function related(product, products, max = 4) {
  const i = products.findIndex((p) => p.id === product.id);
  const rest = products.slice(i + 1).concat(products.slice(0, Math.max(i, 0))).filter((p) => p.id !== product.id);
  const same = rest.filter((p) => p.kind === product.kind);
  const other = rest.filter((p) => p.kind !== product.kind);
  return same.concat(other).slice(0, max);
}

function card(p, lang = 'ro') {
  const ro = locOf(p, 'ro');
  const en = locOf(p, 'en');
  return `<a class="card" href="${productUrl(p, lang)}">
          <span class="card__frame">${pic(photo(p, 1), `alt="${esc((lang === 'en' ? en : ro).name)} — ${esc((lang === 'en' ? en : ro).tagline)}" loading="lazy" decoding="async"`)}${p.sold ? `<span class="card__sold">${ui('sold')}</span>` : ''}</span>
          <span class="card__body">
            <span class="card__name">${both(ro.name, en.name)}</span>
            <span class="card__tag">${both(ro.tagline, en.tagline)}</span>
          </span>
        </a>`;
}

function infoBlock(lang, p) {
  const l = locOf(p, lang);
  const hidden = lang === 'ro' ? '' : ' hidden';
  return `<div data-l="${lang}"${hidden}>
          <p class="eyebrow">${esc(l.tagline)}</p>
          <h1 class="piece__title">${esc(l.name)}</h1>
        </div>`;
}

function descBlock(lang, p) {
  const l = locOf(p, lang);
  const hidden = lang === 'ro' ? '' : ' hidden';
  return `<div class="piece__desc" data-l="${lang}"${hidden}>
          ${paragraphs(l.description)}
        </div>`;
}

function specs(p, exhibitions) {
  const ro = locOf(p, 'ro');
  const en = locOf(p, 'en');
  const row = (k, v) => `<li><span class="k">${ui(k)}</span><span>${v}</span></li>`;
  const kind = KIND[p.kind] || { ro: p.kind, en: p.kind };
  const ex = p.exhibited && exhibitions && exhibitions[p.exhibited];
  return [
    row('kind', both(kind.ro, kind.en)),
    ro.materials ? row('materials', both(ro.materials, en.materials)) : '',
    ex ? row('exhibited', both(ex.ro, ex.en)) : '',
    row('oneoff', ui('oneoffVal')),
  ].filter(Boolean).join('\n          ');
}

export function renderProductPage({ content, product: p, products = [], exhibitions = {}, posts = [], site, ver, contentJs, lang = 'ro' }) {
  const ro = locOf(p, 'ro');
  const en = locOf(p, 'en');
  const L = lang === 'en' ? en : ro;
  const pre = lang === 'en' ? '/en' : '';
  const path = productUrl(p, lang);
  const url = site + path;
  const photos = [];
  for (let n = 1; n <= p.photos; n++) photos.push(photo(p, n));

  const kind = KIND[p.kind] || { ro: p.kind, en: p.kind };
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': url + '#product',
        name: L.name,
        description: L.description || L.tagline,
        image: photos.map((ph) => site + ph),
        url,
        inLanguage: lang,
        category: kind[lang],
        ...(L.materials ? { material: L.materials } : {}),
        brand: { '@type': 'Brand', name: "HUDA'S JEWELRY" },
        manufacturer: { '@type': 'Organization', '@id': site + '/#organization', name: "HUDA'S JEWELRY", url: site + '/' },
        /* Fără preţ, intenţionat: preţul se spune în conversaţie (README, secţiunea 4). */
        offers: {
          '@type': 'Offer',
          url,
          availability: p.sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@id': site + '/#organization' },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: "HUDA'S JEWELRY", item: site + pre + '/' },
          { '@type': 'ListItem', position: 2, name: L.name, item: url },
        ],
      },
    ],
  };

  const imgs = photos.map((src, i) =>
    pic(src, `alt="${esc(L.name)} — ${esc(fill(COPY[lang].photo, { n: i + 1 }))}" loading="${i === 0 ? 'eager' : 'lazy'}"${i === 0 ? ' fetchpriority="high"' : ''} decoding="async"`));

  const order = p.sold
    ? `<a class="btn btn--primary btn--lg btn--full" aria-disabled="true">${ui('orderSold')}</a>
        <p class="pm__note">${ui('noteSold')}</p>`
    : `<a class="btn btn--primary btn--lg btn--full" href="${IG_DM}" target="_blank" rel="noopener noreferrer">${ui('order')}</a>
        <p class="pm__note">${both(fill(COPY.ro.note, { name: ro.name }), fill(COPY.en.note, { name: en.name }))}</p>`;

  const more = related(p, products);

  return page({
    content, site, ver, contentJs, hasBlog: posts.length > 0, lang,
    alt: { ro: productUrl(p), en: productUrl(p, 'en') },
    title: `${L.name} — ${L.tagline} | HUDA'S JEWELRY`,
    description: excerpt(L.description, 160) || L.tagline,
    image: photos[0],
    path,
    type: 'product',
    extraHead: `\n<meta property="og:image:alt" content="${esc(L.name)} — ${esc(L.tagline)}">
<script type="application/ld+json">
${ldJson(ld)}
</script>`,
    main: `<article class="piece">
    <p class="article__back"><a href="${pre}/#collection">${ui('back')}</a></p>
    <div class="piece__grid">
      <div class="piece__gallery">
        <figure class="piece__stage">${imgs[0]}</figure>${imgs.length > 1 ? `
        <div class="piece__photos">
          ${imgs.slice(1).map((im) => `<figure class="piece__stage">${im}</figure>`).join('\n          ')}
        </div>` : ''}
      </div>
      <div class="piece__info">
        ${infoBlock('ro', p)}
        ${infoBlock('en', p)}${p.sold ? `
        <p class="pm__sold">${ui('sold')}</p>` : ''}
        ${descBlock('ro', p)}
        ${descBlock('en', p)}
        <ul class="pm__specs">
          ${specs(p, exhibitions)}
        </ul>
        ${order}
      </div>
    </div>${more.length ? `
    <section class="piece__more" aria-labelledby="more-title">
      <h2 class="piece__moretitle" id="more-title">${ui('more')}</h2>
      <div class="grid">
        ${more.map((m) => card(m, lang)).join('\n        ')}
      </div>
      <p class="posts__more"><a class="btn btn--ghost" href="${pre}/#collection">${ui('all')}</a></p>
    </section>` : ''}
  </article>`,
  });
}
