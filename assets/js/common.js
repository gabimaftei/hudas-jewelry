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
    lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) { /* nimic de făcut */ }
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
