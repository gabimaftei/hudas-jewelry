/* ═══════════════════════════════════════════════════════════════
   Punctul de intrare al Worker-ului
   ───────────────────────────────────────────────────────────────
   Site-ul e static: pozele, CSS-ul, JS-ul şi fonturile se servesc direct
   de pe CDN, fără să treacă pe aici. Worker-ul primeşte rutele panoului
   (/api/…, din server/api.js) şi paginile HTML — vezi run_worker_first în
   wrangler.jsonc — ca să poată hotărî adresa canonică.

   În plus, aici se hotărăşte adresa canonică: orice altă gazdă
   (www., domeniul vechi, scris greşit) şi orice cerere pe http://
   sunt trimise, dintr-un singur salt, pe https://CANONICAL.
   ═══════════════════════════════════════════════════════════════ */
import { handleApi } from './server/api.js';

const CANONICAL = 'hudasjewelry.com';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname !== CANONICAL || url.protocol !== 'https:') {
      url.hostname = CANONICAL;
      url.protocol = 'https:';
      url.port = '';
      /* 301 pentru citit; 308 pentru restul, ca un POST să rămână POST */
      const safe = request.method === 'GET' || request.method === 'HEAD';
      return Response.redirect(url.toString(), safe ? 301 : 308);
    }

    if (url.pathname.startsWith('/api/')) return handleApi(request, env);
    return env.ASSETS.fetch(request);
  },
};
