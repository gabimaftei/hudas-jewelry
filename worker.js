/* ═══════════════════════════════════════════════════════════════
   Punctul de intrare al Worker-ului
   ───────────────────────────────────────────────────────────────
   Site-ul e static: fişierele din repo sunt servite ca atare, iar
   Worker-ul nu se atinge de ele. Singurul lucru care are nevoie de
   cod pe server e /api/publish — salvările din panoul Hudei.

   Cererile care nimeresc un fişier existent (/, /admin/, pozele)
   sunt servite direct din CDN, fără să treacă pe aici. Worker-ul
   primeşte doar ce nu există ca fişier.
   ═══════════════════════════════════════════════════════════════ */
import { onRequestPost } from './functions/api/publish.js';

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/publish') {
      if (request.method !== 'POST') return json({ error: 'Metodă nepermisă.' }, 405);
      return onRequestPost({ request, env });
    }

    /* orice altceva: fişierele site-ului */
    return env.ASSETS.fetch(request);
  },
};
