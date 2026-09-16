/* ═══════════════════════════════════════════════════════════════
   Rutele panoului
   ───────────────────────────────────────────────────────────────
   POST /api/data      ce e ACUM în repo: piese, texte, cronologie,
                       articole. Panoul citeşte de aici, nu de pe site,
                       ca să nu pornească niciodată de la o versiune
                       veche (cache, sau un deploy încă neterminat).
   POST /api/blob      urcă O poză şi întoarce amprenta ei. Pozele
                       pleacă una câte una, deci nicio cerere nu devine
                       atât de mare încât să depăşească limita de
                       procesor a planului gratuit.
   POST /api/publish   scrie totul într-un singur commit.

   Toate cer parola. Nimic din ce vine din browser nu e crezut pe
   cuvânt: se verifică tot, iar în fişiere ajung doar câmpurile
   cunoscute, curăţate.
   ═══════════════════════════════════════════════════════════════ */
import { readHead, listFiles, readText, createBlob, commitTree } from './github.js';
import {
  parseConsts, renderProductsJs, renderContentJs, renderPostsJson,
  renderIndex, renderBlogIndex, renderPost, siteInfo, sortPosts,
} from './render.js';

const MAX_BODY = 3 * 1024 * 1024;
const MAX_BLOB = 900 * 1024;

const KINDS = ['inel', 'colier', 'pandantiv', 'cercei', 'bratara'];
const SAFE_ID = /^[a-z0-9-]{1,60}$/;
const PIECE_IMG = /^assets\/images\/[a-z0-9-]{1,60}-[0-9]{1,2}\.jpg$/;
const BLOG_IMG = /^assets\/blog\/[a-z0-9-]{1,60}\/[0-9]{1,2}\.jpg$/;
const SHA = /^[0-9a-f]{40}$/;

const CONFLICT = 'Între timp s-a publicat altceva (poate dintr-un alt tab). Ca să nu se piardă '
  + 'nimic, salvarea a fost oprită. Copiază ce ai scris, reîncarcă panoul și publică din nou.';

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/* O eroare al cărei mesaj e pentru ea, nu pentru programator. */
function fail(message, status = 400) {
  const e = new Error(message);
  e.expose = true;
  e.status = status;
  throw e;
}

/* Comparaţie în timp constant: fără ea, parola s-ar putea ghici caracter
   cu caracter, măsurând cât durează răspunsul. */
function sameSecret(a, b) {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  if (ea.length !== eb.length) return false;
  let diff = 0;
  for (let i = 0; i < ea.length; i++) diff |= ea[i] ^ eb[i];
  return diff === 0;
}

function str(v, max, label) {
  if (v === undefined || v === null) return '';
  if (typeof v !== 'string') fail(`${label} nu e text.`);
  const s = v.replace(/\r\n?/g, '\n').trim();
  if (s.length > max) fail(`${label} e prea lung (maximum ${max} de caractere).`);
  return s;
}

function validDate(s) {
  if (typeof s !== 'string' || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(s)) return false;
  const d = new Date(s + 'T00:00:00Z');
  const y = Number(s.slice(0, 4));
  return !isNaN(d) && d.toISOString().slice(0, 10) === s && y >= 2000 && y <= 2100;
}

/* ─────────────── starea repo-ului ─────────────── */

async function loadState(env, withIndex) {
  const head = await readHead(env);
  const files = await listFiles(env, head.tree);
  const [productsTxt, contentTxt, postsTxt, indexHtml] = await Promise.all([
    readText(env, files, 'assets/js/products.js'),
    readText(env, files, 'assets/js/content.js'),
    readText(env, files, 'data/posts.json'),
    withIndex ? readText(env, files, 'index.html') : null,
  ]);
  if (!productsTxt || !contentTxt) throw new Error('Lipsesc fişierele de date din repo.');
  const { PRODUCTS, EXHIBITIONS } = parseConsts(productsTxt, ['PRODUCTS', 'EXHIBITIONS']);
  const { CONTENT, TIMELINE } = parseConsts(contentTxt, ['CONTENT', 'TIMELINE']);
  return {
    head, files, indexHtml,
    products: PRODUCTS, exhibitions: EXHIBITIONS,
    content: CONTENT, timeline: TIMELINE,
    posts: postsTxt ? (JSON.parse(postsTxt).posts || []) : [],
  };
}

/* ─────────────── verificări ─────────────── */

function checkExhibitions(ex) {
  if (!ex || typeof ex !== 'object' || Array.isArray(ex)) fail('Lipsesc expozițiile.');
  const keys = Object.keys(ex);
  if (keys.length > 100) fail('Prea multe expoziții.');
  const out = {};
  for (const k of keys) {
    if (!SAFE_ID.test(k)) fail(`Identificator de expoziție nepermis: ${k}`);
    const ro = str(ex[k] && ex[k].ro, 80, 'Numele unei expoziții');
    if (!ro) fail('O expoziție n-are nume în română.');
    const en = str(ex[k].en, 80, `Numele în engleză al expoziției „${ro}"`);
    out[k] = { ro, en: en || ro };
  }
  return out;
}

function checkProducts(products, exhibitions) {
  if (!Array.isArray(products) || !products.length) fail('Catalogul e gol.');
  if (products.length > 200) fail('Prea multe piese.');
  const seen = new Set();
  return products.map((p) => {
    if (!p || !SAFE_ID.test(p.id || '')) fail(`Identificator nepermis: ${p && p.id}`);
    if (seen.has(p.id)) fail(`Două piese au același identificator: ${p.id}`);
    seen.add(p.id);
    if (!KINDS.includes(p.kind)) fail(`Tip necunoscut la ${p.id}: ${p.kind}`);
    if (!Number.isInteger(p.photos) || p.photos < 1 || p.photos > 12) fail(`Număr de poze greșit la ${p.id}`);
    if (p.exhibited !== null && !Object.prototype.hasOwnProperty.call(exhibitions, p.exhibited)) {
      fail(`Expoziție necunoscută la ${p.id}`);
    }
    const loc = (l) => ({
      name: str(p[l] && p[l].name, 80, 'Numele piesei'),
      tagline: str(p[l] && p[l].tagline, 120, 'Subtitlul piesei'),
      description: str(p[l] && p[l].description, 1500, 'Descrierea piesei'),
      materials: str(p[l] && p[l].materials, 300, 'Materialele piesei'),
    });
    const rec = { id: p.id, photos: p.photos, kind: p.kind, sold: !!p.sold, exhibited: p.exhibited, ro: loc('ro'), en: loc('en') };
    for (const l of ['ro', 'en']) {
      if (!rec[l].name || !rec[l].tagline) fail(`Lipsește numele sau subtitlul (${l}) la ${p.id}`);
    }
    if (p.spin !== undefined) {
      if (!Number.isInteger(p.spin) || p.spin < 8 || p.spin > 180) fail(`Număr de cadre de rotire greșit la ${p.id}`);
      rec.spin = p.spin;
    }
    if (p.spinReverse) rec.spinReverse = true;
    return rec;
  });
}

/* Cheile permise sunt exact cele care există deja în content.js: panoul
   poate schimba textele, dar nu poate inventa chei noi. */
function checkContent(content, allowed) {
  if (!content || typeof content !== 'object') fail('Lipsesc textele.');
  const out = { ro: {}, en: {} };
  for (const lang of ['ro', 'en']) {
    const src = content[lang];
    if (!src || typeof src !== 'object' || Array.isArray(src)) fail('Lipsesc textele.');
    for (const k of Object.keys(src)) if (!allowed.includes(k)) fail(`Text necunoscut: ${k}`);
    for (const k of allowed) {
      if (lang === 'ro' && src[k] === undefined) fail(`Lipsește textul „${k}".`);
      out[lang][k] = str(src[k], 2000, `Textul „${k}"`);
    }
  }
  return out;
}

function checkTimeline(timeline) {
  if (!Array.isArray(timeline) || timeline.length > 60) fail('Cronologia nu e validă.');
  return timeline.map((e, i) => {
    const part = (x, max, label) => ({
      ro: str(x && x.ro, max, label),
      en: str(x && x.en, max, label),
    });
    const r = {
      when: part(e && e.when, 60, 'Data din cronologie'),
      what: part(e && e.what, 200, 'Titlul din cronologie'),
      where: part(e && e.where, 200, 'Locul din cronologie'),
    };
    if (!r.when.ro || !r.what.ro) fail(`Intrarea ${i + 1} din cronologie n-are dată sau titlu.`);
    return r;
  });
}

function checkPosts(posts) {
  if (!Array.isArray(posts) || posts.length > 300) fail('Lista de articole nu e validă.');
  const seen = new Set();
  return sortPosts(posts.map((p) => {
    if (!p || !SAFE_ID.test(p.id || '')) fail(`Identificator de articol nepermis: ${p && p.id}`);
    if (seen.has(p.id)) fail(`Două articole au același identificator: ${p.id}`);
    seen.add(p.id);
    const ro = { title: str(p.ro && p.ro.title, 160, 'Titlul articolului'), body: str(p.ro && p.ro.body, 20000, 'Textul articolului') };
    const en = { title: str(p.en && p.en.title, 160, 'Titlul în engleză'), body: str(p.en && p.en.body, 20000, 'Textul în engleză') };
    if (!ro.title) fail('Un articol n-are titlu în română.');
    if (!validDate(p.date)) fail(`Data articolului „${ro.title}" nu e validă.`);
    if (!Array.isArray(p.photos) || p.photos.length < 1 || p.photos.length > 30) {
      fail(`Articolul „${ro.title}" trebuie să aibă între 1 și 30 de poze.`);
    }
    const photos = p.photos.map((ph) => {
      const w = ph && ph.w, h = ph && ph.h;
      if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1 || w > 4000 || h > 4000) {
        fail(`O poză din „${ro.title}" are dimensiuni nevalide.`);
      }
      return { w, h };
    });
    return { id: p.id, date: p.date, photos, ro, en };
  }));
}

/* Poza e fie o amprentă întoarsă de /api/blob, fie {from: cale existentă}
   — o poză deja în repo care doar îşi schimbă locul (s-a reordonat). Aşa
   o mutare nu înseamnă să descarci şi să urci din nou fişierul. */
function checkImages(images, files) {
  if (!images || typeof images !== 'object' || Array.isArray(images)) fail('Lista de poze nu e validă.');
  const keys = Object.keys(images);
  if (keys.length > 300) fail('Prea multe poze într-o singură salvare.');
  const out = new Map();
  for (const path of keys) {
    if (!PIECE_IMG.test(path) && !BLOG_IMG.test(path)) fail(`Cale de poză nepermisă: ${path}`);
    const v = images[path];
    if (typeof v === 'string' && SHA.test(v)) out.set(path, v);
    else if (v && typeof v.from === 'string' && (PIECE_IMG.test(v.from) || BLOG_IMG.test(v.from)) && files.has(v.from)) {
      out.set(path, files.get(v.from));
    } else fail(`Poza ${path} nu e validă.`);
  }
  return out;
}

/* ─────────────── rutele ─────────────── */

async function data(body, env) {
  const s = await loadState(env, false);
  return json({
    ok: true, head: s.head.commit,
    products: s.products, exhibitions: s.exhibitions,
    content: s.content, timeline: s.timeline, posts: s.posts,
  });
}

async function blob(body, env) {
  const d = body.data;
  if (typeof d !== 'string' || d.length < 8 || !/^[A-Za-z0-9+/]+=*$/.test(d)) fail('Poza nu e validă.');
  const bytes = Math.floor(d.length * 3 / 4) - (d.endsWith('==') ? 2 : d.endsWith('=') ? 1 : 0);
  if (bytes > MAX_BLOB) fail('Poza e prea mare.', 413);
  const start = atob(d.slice(0, 4));
  if (start.charCodeAt(0) !== 0xFF || start.charCodeAt(1) !== 0xD8 || start.charCodeAt(2) !== 0xFF) {
    fail('Poza trebuie să fie JPEG.');
  }
  return json({ ok: true, sha: await createBlob(env, d) });
}

async function publish(body, env) {
  const s = await loadState(env, true);
  if (typeof body.base === 'string' && body.base !== s.head.commit) fail(CONFLICT, 409);
  if (!s.indexHtml) throw new Error('Lipsește index.html din repo.');

  const exhibitions = checkExhibitions(body.exhibitions);
  const products = checkProducts(body.products, exhibitions);
  const content = checkContent(body.content, Object.keys(s.content.ro));
  const timeline = checkTimeline(body.timeline);
  const posts = checkPosts(body.posts);
  const images = checkImages(body.images, s.files);

  const deletes = new Set();
  for (const path of body.deletes || []) {
    if (typeof path !== 'string' || !PIECE_IMG.test(path)) fail(`Cale nepermisă la ștergere: ${path}`);
    deletes.add(path);
  }
  /* pozele şi paginile articolelor şterse sau micşorate le calculăm aici,
     din ce era în repo, nu le luăm de la browser */
  const now = new Map(posts.map((p) => [p.id, p]));
  for (const old of s.posts) {
    const kept = now.get(old.id);
    for (let n = (kept ? kept.photos.length : 0) + 1; n <= old.photos.length; n++) {
      deletes.add(`assets/blog/${old.id}/${n}.jpg`);
    }
    if (!kept) deletes.add(`blog/${old.id}/index.html`);
  }

  /* fiecare poză de care are nevoie o piesă sau un articol trebuie să
     existe după commit — altfel pe site ar apărea o imagine lipsă */
  const exists = (path) => images.has(path) || (s.files.has(path) && !deletes.has(path));
  for (const p of products) {
    for (let n = 1; n <= p.photos; n++) {
      if (!exists(`assets/images/${p.id}-${n}.jpg`)) fail(`Lipsește poza ${n} a piesei „${p.ro.name}".`);
    }
  }
  for (const p of posts) {
    for (let n = 1; n <= p.photos.length; n++) {
      if (!exists(`assets/blog/${p.id}/${n}.jpg`)) fail(`Lipsește poza ${n} a articolului „${p.ro.title}".`);
    }
  }

  const productsJs = renderProductsJs(products, exhibitions);
  const contentJs = renderContentJs(content, timeline);
  const { site, ver } = siteInfo(s.indexHtml);
  const text = (path, content) => ({ path, mode: '100644', type: 'blob', content });

  const entries = [
    text('assets/js/products.js', productsJs),
    text('assets/js/content.js', contentJs),
    text('data/posts.json', renderPostsJson(posts)),
    text('index.html', renderIndex(s.indexHtml, { content, timeline, posts, productsJs, contentJs })),
    text('blog/index.html', renderBlogIndex({ content, posts, site, ver, contentJs })),
    ...posts.map((post) => text(`blog/${post.id}/index.html`, renderPost({ content, post, site, ver, contentJs }))),
  ];
  for (const [path, sha] of images) entries.push({ path, mode: '100644', type: 'blob', sha });
  for (const path of deletes) {
    if (!images.has(path) && s.files.has(path)) entries.push({ path, mode: '100644', type: 'blob', sha: null });
  }

  const message = (str(body.message, 120, 'Mesajul') || 'Actualizare din panou')
    + '\n\nSalvat de Huda din panoul de la /admin.';
  const sha = await commitTree(env, s.head, entries, message);
  return json({ ok: true, commit: sha, pieces: products.length, posts: posts.length });
}

const ROUTES = { '/api/data': data, '/api/blob': blob, '/api/publish': publish };

export async function handleApi(request, env) {
  const route = ROUTES[new URL(request.url).pathname];
  if (!route) return json({ error: 'Nu există.' }, 404);
  if (request.method !== 'POST') return json({ error: 'Metodă nepermisă.' }, 405);
  if (!env.ADMIN_PASSWORD || !env.GITHUB_TOKEN) {
    return json({ error: 'Panoul nu e configurat complet: lipsește ADMIN_PASSWORD sau GITHUB_TOKEN.' }, 500);
  }

  let body;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY) return json({ error: 'Cererea e prea mare.' }, 413);
    body = JSON.parse(raw);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
  } catch {
    return json({ error: 'Cerere neînțeleasă.' }, 400);
  }

  if (!sameSecret(String(body.password || ''), env.ADMIN_PASSWORD)) {
    await new Promise((r) => setTimeout(r, 700));   // încetineşte încercările repetate
    return json({ error: 'Parolă greșită.' }, 401);
  }
  if (body.check) return json({ ok: true });

  try {
    return await route(body, env);
  } catch (err) {
    if (err.expose) return json({ error: err.message }, err.status);
    if (err.status === 422 && /fast.forward/i.test(err.message)) return json({ error: CONFLICT }, 409);
    return json({ error: 'Nu s-a putut salva: ' + err.message }, 502);
  }
}
