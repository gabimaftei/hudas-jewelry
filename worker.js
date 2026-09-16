/* ═══════════════════════════════════════════════════════════════
   Punctul de intrare al Worker-ului
   ───────────────────────────────────────────────────────────────
   Site-ul e static: fişierele din repo sunt servite ca atare, direct
   de pe CDN, fără să treacă pe aici. Worker-ul primeşte doar ce nu
   există ca fişier — adică rutele panoului, /api/…, din server/api.js.
   ═══════════════════════════════════════════════════════════════ */
import { handleApi } from './server/api.js';

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname.startsWith('/api/')) return handleApi(request, env);
    return env.ASSETS.fetch(request);
  },
};
