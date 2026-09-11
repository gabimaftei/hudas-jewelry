/* ═══════════════════════════════════════════════════════════════
   /api/publish — primește ce a salvat Huda din panou și pune în repo
   ───────────────────────────────────────────────────────────────
   Rulează ca Cloudflare Pages Function. Aici — și numai aici — stă
   tokenul de GitHub, ca secret. Panoul din browser nu-l vede
   niciodată; el trimite doar parola și conținutul.

   Are nevoie de două secrete (vezi secțiunea 8 din README):
     ADMIN_PASSWORD  parola cu care intră ea în panou
     GITHUB_TOKEN    token cu drept de scriere pe repo (Contents: RW)

   Repo-ul e scris mai jos, în cod: nu e o informație secretă, și e un
   lucru mai puțin de configurat greșit. Dacă se redenumește vreodată,
   se poate suprascrie cu variabila GITHUB_REPO.

   Tot ce se schimbă intră într-un singur commit — textele și pozele
   deodată — ca să nu existe niciun moment în care site-ul are piesa
   scrisă dar poza încă nelivrată.
   ═══════════════════════════════════════════════════════════════ */

const API = 'https://api.github.com';
const REPO = 'gabimaftei/hudas-jewelry';
const BRANCH = 'main';
const IMG_DIR = 'assets/images/';

/* Comparație în timp constant: fără ea, un atacator poate ghici parola
   caracter cu caracter, măsurând cât durează răspunsul. */
function sameSecret(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  if (ea.length !== eb.length) return false;
  let diff = 0;
  for (let i = 0; i < ea.length; i++) diff |= ea[i] ^ eb[i];
  return diff === 0;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

async function gh(env, path, init = {}) {
  const r = await fetch(API + path, {
    ...init,
    headers: {
      authorization: 'Bearer ' + env.GITHUB_TOKEN,
      accept: 'application/vnd.github+json',
      'user-agent': 'hudas-jewelry-admin',
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`GitHub ${path} → ${r.status}: ${text.slice(0, 300)}`);
  }
  return r.json();
}

/* ---- generatorul de products.js -------------------------------
   Fișierul rămâne JavaScript, nu JSON, exact ca până acum: site-ul
   îl încarcă printr-un <script>, fără nicio cerere de rețea și fără
   să atingem Content-Security-Policy. */
function renderCatalogue(products, exhibitions) {
  const head = `/* ---------------------------------------------------------------
   HUDA'S JEWELRY — catalogul pieselor
   ---------------------------------------------------------------
   FIȘIER GENERAT. Este rescris de fiecare dată când se salvează din
   panoul de la /admin, deci orice modificare făcută de mână aici se
   pierde la următoarea salvare. Pentru schimbări de conținut,
   folosește panoul.
   --------------------------------------------------------------- */

`;
  /* U+2028 și U+2029 trec prin JSON.stringify neescapate. Sunt valide în
     JSON, dar au fost multă vreme interzise într-un literal JavaScript —
     capcana clasică la generarea de JS din JSON. Le escapăm noi. */
  var enc = function (v) {
    return JSON.stringify(v, null, 2)
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
  };
  return head +
    'const PRODUCTS = ' + enc(products) + ';\n\n' +
    'const EXHIBITIONS = ' + enc(exhibitions) + ';\n';
}

/* ---- verificări pe ce vine din browser ------------------------
   Panoul e singurul care ar trebui să trimită aici, dar cererea vine
   totuși de pe internet, deci nimic nu se crede pe cuvânt. */
const KINDS = ['inel', 'colier', 'pandantiv', 'cercei', 'bratara'];
const SAFE_ID = /^[a-z0-9-]{1,60}$/;
const SAFE_IMG = /^[a-z0-9-]{1,60}\.jpg$/;
const MAX_IMG_BYTES = 600 * 1024;
const MAX_IMAGES = 60;

function checkPayload(body) {
  const { products, exhibitions, images, deletes } = body;
  if (!Array.isArray(products) || !products.length) return 'Catalogul e gol.';
  if (products.length > 200) return 'Prea multe piese.';
  if (!exhibitions || typeof exhibitions !== 'object') return 'Lipsesc expozițiile.';

  const seen = new Set();
  for (const p of products) {
    if (!SAFE_ID.test(p.id || '')) return `Identificator nepermis: ${p.id}`;
    if (seen.has(p.id)) return `Două piese au același identificator: ${p.id}`;
    seen.add(p.id);
    if (!KINDS.includes(p.kind)) return `Tip necunoscut la ${p.id}: ${p.kind}`;
    if (!Number.isInteger(p.photos) || p.photos < 1 || p.photos > 12) return `Număr de poze greșit la ${p.id}`;
    if (p.exhibited !== null && !Object.hasOwn(exhibitions, p.exhibited)) return `Expoziție necunoscută la ${p.id}`;
    for (const lang of ['ro', 'en']) {
      const l = p[lang];
      if (!l || !l.name || !l.tagline) return `Lipsește numele sau subtitlul (${lang}) la ${p.id}`;
    }
  }

  const imgs = images || {};
  const names = Object.keys(imgs);
  if (names.length > MAX_IMAGES) return 'Prea multe poze într-o singură salvare.';
  for (const n of names) {
    if (!SAFE_IMG.test(n)) return `Nume de fișier nepermis: ${n}`;
    if (typeof imgs[n] !== 'string') return `Poza ${n} nu e validă.`;
    if (imgs[n].length * 0.75 > MAX_IMG_BYTES) return `Poza ${n} e prea mare.`;
  }
  for (const n of deletes || []) if (!SAFE_IMG.test(n)) return `Nume de fișier nepermis la ștergere: ${n}`;

  /* fiecare piesă trebuie să aibă toate pozele pe care le declară —
     fie deja în repo, fie printre cele trimise acum */
  return null;
}

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD || !env.GITHUB_TOKEN) {
    return json({ error: 'Panoul nu e configurat complet: lipsește ADMIN_PASSWORD sau GITHUB_TOKEN.' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Cerere neînțeleasă.' }, 400);
  }

  if (!sameSecret(body.password || '', env.ADMIN_PASSWORD)) {
    await new Promise((r) => setTimeout(r, 700));   // încetinește încercările repetate
    return json({ error: 'Parolă greșită.' }, 401);
  }

  /* doar verificarea parolei, la intrarea în panou */
  if (body.check) return json({ ok: true });

  const problem = checkPayload(body);
  if (problem) return json({ error: problem }, 400);

  const repo = env.GITHUB_REPO || REPO;
  const branch = env.GITHUB_BRANCH || BRANCH;

  try {
    /* unde suntem acum */
    const ref = await gh(env, `/repos/${repo}/git/ref/heads/${branch}`);
    const headSha = ref.object.sha;
    const headCommit = await gh(env, `/repos/${repo}/git/commits/${headSha}`);

    /* pozele noi devin blob-uri */
    const tree = [];
    for (const [name, b64] of Object.entries(body.images || {})) {
      const blob = await gh(env, `/repos/${repo}/git/blobs`, {
        method: 'POST',
        body: JSON.stringify({ content: b64, encoding: 'base64' }),
      });
      tree.push({ path: IMG_DIR + name, mode: '100644', type: 'blob', sha: blob.sha });
    }

    /* catalogul rescris */
    tree.push({
      path: 'assets/js/products.js',
      mode: '100644',
      type: 'blob',
      content: renderCatalogue(body.products, body.exhibitions),
    });

    /* pozele rămase fără piesă se scot din arbore */
    for (const name of body.deletes || []) {
      tree.push({ path: IMG_DIR + name, mode: '100644', type: 'blob', sha: null });
    }

    const newTree = await gh(env, `/repos/${repo}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({ base_tree: headCommit.tree.sha, tree }),
    });

    const message = (body.message || 'Actualizare din panou').slice(0, 120);
    const commit = await gh(env, `/repos/${repo}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({
        message: message + '\n\nSalvat de Huda din panoul de la /admin.',
        tree: newTree.sha,
        parents: [headSha],
      }),
    });

    await gh(env, `/repos/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha }),
    });

    return json({ ok: true, commit: commit.sha.slice(0, 7), pieces: body.products.length });
  } catch (err) {
    return json({ error: 'Nu s-a putut salva: ' + err.message }, 502);
  }
}

export async function onRequestGet() {
  return json({ error: 'Metodă nepermisă.' }, 405);
}
