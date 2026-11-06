/* ═══════════════════════════════════════════════════════════════
   HUDA'S JEWELRY — ce au în comun toate paginile
   ───────────────────────────────────────────────────────────────
   Pagina principală, pagina de blog şi fiecare articol folosesc
   acelaşi meniu, aceeaşi schimbare de limbă şi aceleaşi texte.

   Limba aleasă se ţine minte (localStorage), ca vizitatorul care a
   ales engleza pe pagina principală să rămână în engleză când intră
   pe blog.

   Textele vin din assets/js/content.js (se schimbă din panou).
   Elementele cu data-l="ro" / data-l="en" sunt blocuri scrise în
   ambele limbi direct în pagină: se arată doar cel al limbii alese.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var KEY = 'hj-lang';
  var C = (typeof CONTENT !== 'undefined') ? CONTENT : { ro: {}, en: {} };
  var extra = { ro: {}, en: {} };
  var listeners = [];
  var lang = 'ro';
  try {
    var saved = localStorage.getItem(KEY);
    if (saved === 'ro' || saved === 'en') lang = saved;
  } catch (e) { /* stocare blocată: rămâne româna */ }

  /* Paginile care au o pereche în cealaltă limbă (prima pagină și piesele:
     /x/ şi /en/x/) spun unde e perechea în <html data-alt-ro data-alt-en>.
     Limba lor e cea a adresei, nu cea din localStorage, iar butonul RO/EN
     duce la pagina-pereche. Restul paginilor (blogul) schimbă limba pe loc. */
  var de = document.documentElement;
  var alt = { ro: de.getAttribute('data-alt-ro'), en: de.getAttribute('data-alt-en') };
  var paired = !!(alt.ro && alt.en);
  if (paired) lang = de.lang === 'en' ? 'en' : 'ro';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }

  /* Engleza goală cade pe română. Româna goală înseamnă „nu afişa":
     elementul rămâne gol, iar CSS-ul ([data-i18n]:empty) îl ascunde. */
  function t(key) {
    if (has(C.ro, key)) {
      if (lang === 'en' && has(C.en, key) && C.en[key] !== '') return C.en[key];
      return C.ro[key];
    }
    if (has(extra[lang], key)) return extra[lang][key];
    if (has(extra.ro, key)) return extra.ro[key];
    return undefined;
  }

  function apply() {
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n'));
      if (v !== undefined) el.textContent = v;
    });
    $$('[data-l]').forEach(function (el) { el.hidden = el.getAttribute('data-l') !== lang; });
    $$('.langswitch button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
    });
  }

  function setLang(l) {
    if (l === lang || (l !== 'ro' && l !== 'en')) return;
    try { localStorage.setItem(KEY, l); } catch (e) { /* nimic de făcut */ }
    if (paired) { window.location.href = alt[l]; return; }
    lang = l;
    apply();
    listeners.forEach(function (fn) { fn(lang); });
  }

  window.HJ = {
    t: t,
    lang: function () { return lang; },
    /* o pagină îşi adaugă textele ei de interfaţă (ex. galeria) */
    extend: function (copy) {
      ['ro', 'en'].forEach(function (l) {
        Object.keys(copy[l] || {}).forEach(function (k) { extra[l][k] = copy[l][k]; });
      });
      apply();
    },
    onLang: function (fn) { listeners.push(fn); },
  };

  $$('.langswitch button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });

  /* ─────────────── meniul ─────────────── */
  var nav = $('#nav');
  var burger = $('.nav__burger');
  var links = $('#nav-links');

  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      links.classList.toggle('is-open', !open);
    });
    $$('#nav-links > a').forEach(function (a) {
      a.addEventListener('click', function () {
        burger.setAttribute('aria-expanded', 'false');
        links.classList.remove('is-open');
      });
    });
  }

  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var y = $('#year');
  if (y) y.textContent = String(new Date().getFullYear());

  apply();
})();

/* Poze WebP cu rezervă JPG. Dacă varianta .webp lipseşte (o poză nouă pusă din
   panou de un browser care nu poate crea WebP), <img> din <picture> dă eroare
   şi nu mai încearcă singur JPG-ul. Aici scoatem <source>-urile şi reîncărcăm
   JPG-ul. Evenimentul "error" nu urcă în document, deci ascultăm în faza de
   captură; iar o eroare venită înainte să ruleze acest script o prindem la
   încărcarea paginii, căutând pozele terminate fără lăţime. */
(function () {
  function fallback(img) {
    var pic = img.parentNode;
    if (!pic || pic.tagName !== 'PICTURE') return;
    var sources = pic.querySelectorAll('source');
    if (!sources.length) return;
    Array.prototype.forEach.call(sources, function (s) { s.parentNode.removeChild(s); });
    var src = img.getAttribute('src');
    img.removeAttribute('src');
    img.setAttribute('src', src);
  }
  document.addEventListener('error', function (e) {
    if (e.target && e.target.tagName === 'IMG') fallback(e.target);
  }, true);
  window.addEventListener('load', function () {
    Array.prototype.forEach.call(document.querySelectorAll('picture > img'), function (img) {
      if (img.complete && !img.naturalWidth) fallback(img);
    });
  });
})();
