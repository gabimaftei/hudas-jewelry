/* ═══════════════════════════════════════════════════════════════
   HUDA'S JEWELRY — comportamentul paginii
   ───────────────────────────────────────────────────────────────
   Fără dependențe, fără build. Rulează direct în browser.

   Nu se scrie niciodată în element.style: Content-Security-Policy
   (style-src 'self') ar bloca-o. Tot ce e dinamic trece prin clase.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var IG_USER = 'hudasjewelry';
  var IG_DM   = 'https://ig.me/m/' + IG_USER;

  /* ─────────────── textele ─────────────── */
  var COPY = {
    ro: {
      'skip': 'Sari la piese',
      'nav.est': 'Huda Mahdi · Irak / România',
      'nav.collection': 'Piese',
      'nav.story': 'Despre Huda',
      'nav.recognition': 'Expoziții',
      'nav.contact': 'Scrie-i',

      'hero.eyebrow': 'Bijuterie contemporană · lucrată manual',
      'hero.title1': 'Fiecare piesă',
      'hero.title2': 'există o singură dată',
      'hero.lede': 'Argint, aur, pietre naturale și perle, îndoite și răsucite de mână până ies forme care nu se mai pot repeta. Un design prezentat o dată nu se mai face a doua oară.',
      'hero.ctaPrimary': 'Vezi piesele',
      'hero.ctaSecondary': 'Despre Huda',
      'hero.caption': 'Irak / România',

      'collection.eyebrow': 'Piesele',
      'collection.title': 'Nu există două piese la fel',
      'collection.lede': 'Fiecare e lucrată de mână, de la sârmă la piatră. Când una pleacă, gata — nu se mai face identic nici dacă cineva o cere.',
      'collection.empty': 'Nicio piesă de tipul ăsta deocamdată.',
      'collection.note': 'Ai în cap ceva ce nu e aici? O piatră de la care să pornim, o piesă veche de reînviat? <a href="#contact">Scrie-i</a> — se lucrează și la comandă.',

      'story.eyebrow': 'Despre Huda',
      'story.title': 'Din Irak, la masa de lucru din România',
      'story.p1': 'Huda Mahdi lucrează între Irak și România. A studiat la Assamblage Contemporary Jewelry School din București, iar piesele ei au ajuns de acolo la München, la Ljubljana și înapoi acasă, la București.',
      'story.p2': 'Sârma e materialul ei. O răsucește, o îndoaie și o coase în dantele care nu se repetă niciodată identic, apoi așază în ele pietre naturale și perle. Nimic nu iese dintr-un tipar.',
      'story.p3': 'De aceea colecția nu are stoc și nu are mărimi standard: are piese. Fiecare cu pietrele ei, cu desenul ei, făcută o singură dată.',
      'story.quote': '„Sunt mândră să spun că piesele mele sunt unicate și designul prezentat o dată nu se repetă. Toate lucrările mele sunt făcute din suflet.”',
      'story.cite': 'Huda Mahdi, pentru Revista Atelierul',

      'recognition.eyebrow': 'Expoziții și premii',
      'recognition.title': 'Unde a fost văzută munca ei',
      'recognition.cap': 'Premiul Lost in Jewellery Magazine, Romanian Jewelry Week 2024.',
      'tl.1t': 'Premiul Lost in Jewellery Magazine',
      'tl.1w': 'Romanian Jewelry Week 2024, București',
      'tl.2t': 'Interviu',
      'tl.2w': 'Revista Atelierul',
      'tl.3d': 'Mar 2026',
      'tl.3t': 'Handwerk & Design, Internationale Handwerksmesse',
      'tl.3w': 'München, cu Assamblage School',
      'tl.4d': 'Mar 2026',
      'tl.4t': 'Slovenian Jewelry Week, designer invitat',
      'tl.4w': 'Ljubljana',
      'tl.5d': '30 sept – 4 oct 2026',
      'tl.5t': 'Romanian Jewelry Week 2026, ediția a 7-a',
      'tl.5w': 'Biblioteca Națională a României, București',

      'contact.eyebrow': 'Scrie-i',
      'contact.title': 'Vorbiți direct, pe Instagram',
      'contact.lede': 'Nu e magazin și nu e coș de cumpărături. Îi spui ce piesă îți place, iar prețul, măsura și livrarea le stabiliți în conversație. Îți răspunde chiar ea.',
      'contact.dm': 'Scrie-i pe Instagram',
      'contact.profile': 'Vezi profilul',
      'contact.small': '@hudasjewelry',

      'footer.tag': 'Bijuterii contemporane, lucrate manual',

      /* piese */
      'f.all': 'Toate',
      'f.inel': 'Inele',
      'f.colier': 'Coliere',
      'f.pandantiv': 'Pandantive',
      'f.cercei': 'Cercei',
      'f.bratara': 'Brățări',
      'c.sold': 'Piesă plecată',
      'pm.materials': 'Materiale',
      'pm.exhibited': 'Expusă la',
      'pm.oneoff': 'Serie',
      'pm.oneoffVal': 'Piesă unicat, nu se repetă',
      'pm.order': 'Întreabă de piesa asta',
      'pm.orderSold': 'Piesa asta a plecat',
      'pm.note': 'Se deschide conversația cu @hudasjewelry. Spune-i că e vorba de „{name}” și îți răspunde cu prețul și cu detaliile.',
      'pm.noteSold': 'Piesa asta nu mai e disponibilă, dar rămâne aici. Scrie-i dacă vrei ceva pornit de la ea.',
      'pm.photoOf': 'Fotografia {n} din {total}',
      'pm.spin': 'Rotește piesa',
      'pm.spinHint': 'Trage ca s-o rotești',
      'pm.spinLoading': 'Se încarcă rotirea…',
      'open': 'Vezi piesa',
    },

    en: {
      'skip': 'Skip to the pieces',
      'nav.est': 'Huda Mahdi · Iraq / Romania',
      'nav.collection': 'Pieces',
      'nav.story': 'About Huda',
      'nav.recognition': 'Exhibitions',
      'nav.contact': 'Message her',

      'hero.eyebrow': 'Contemporary jewellery · made by hand',
      'hero.title1': 'Every piece',
      'hero.title2': 'exists only once',
      'hero.lede': 'Silver, gold, natural stones and pearls, bent and twisted by hand into shapes that cannot be made twice. A design shown once is never repeated.',
      'hero.ctaPrimary': 'See the pieces',
      'hero.ctaSecondary': 'About Huda',
      'hero.caption': 'Iraq / Romania',

      'collection.eyebrow': 'The pieces',
      'collection.title': 'No two pieces alike',
      'collection.lede': 'Each one worked by hand, from the wire to the stone. Once a piece is gone it is gone — it will not be remade, even on request.',
      'collection.empty': 'Nothing of that kind yet.',
      'collection.note': 'Have something else in mind? A stone to build around, an old piece to bring back? <a href="#contact">Message her</a> — she takes commissions.',

      'story.eyebrow': 'About Huda',
      'story.title': 'From Iraq to a workbench in Romania',
      'story.p1': 'Huda Mahdi works between Iraq and Romania. She trained at the Assamblage Contemporary Jewelry School in Bucharest, and her work has travelled from there to Munich, to Ljubljana, and back home to Bucharest.',
      'story.p2': 'Wire is her material. She twists it, bends it and stitches it into lace that never repeats the same way twice, then sets natural stones and pearls into it. Nothing comes out of a mould.',
      'story.p3': 'That is why this collection has no stock and no standard sizes — only pieces. Each with its own stones, its own drawing, made once.',
      'story.quote': '“I am proud to say that my pieces are one of a kind, and a design shown once is never repeated. All my work is made from the heart.”',
      'story.cite': 'Huda Mahdi, for Revista Atelierul',

      'recognition.eyebrow': 'Exhibitions and awards',
      'recognition.title': 'Where the work has been seen',
      'recognition.cap': 'The Lost in Jewellery Magazine Award, Romanian Jewelry Week 2024.',
      'tl.1t': 'The Lost in Jewellery Magazine Award',
      'tl.1w': 'Romanian Jewelry Week 2024, Bucharest',
      'tl.2t': 'Interview',
      'tl.2w': 'Revista Atelierul',
      'tl.3d': 'Mar 2026',
      'tl.3t': 'Handwerk & Design, Internationale Handwerksmesse',
      'tl.3w': 'Munich, with Assamblage School',
      'tl.4d': 'Mar 2026',
      'tl.4t': 'Slovenian Jewelry Week, guest designer',
      'tl.4w': 'Ljubljana',
      'tl.5d': '30 Sept – 4 Oct 2026',
      'tl.5t': 'Romanian Jewelry Week 2026, 7th edition',
      'tl.5w': 'The National Library of Romania, Bucharest',

      'contact.eyebrow': 'Message her',
      'contact.title': 'You talk to her directly, on Instagram',
      'contact.lede': 'This is not a shop and there is no basket. You tell her which piece you like, and the price, the size and the delivery get settled in the conversation. She answers herself.',
      'contact.dm': 'Message her on Instagram',
      'contact.profile': 'See the profile',
      'contact.small': '@hudasjewelry',

      'footer.tag': 'Contemporary jewellery, made by hand',

      'f.all': 'All',
      'f.inel': 'Rings',
      'f.colier': 'Necklaces',
      'f.pandantiv': 'Pendants',
      'f.cercei': 'Earrings',
      'f.bratara': 'Bracelets',
      'c.sold': 'Gone',
      'pm.materials': 'Materials',
      'pm.exhibited': 'Shown at',
      'pm.oneoff': 'Edition',
      'pm.oneoffVal': 'One of a kind, never repeated',
      'pm.order': 'Ask about this piece',
      'pm.orderSold': 'This piece is gone',
      'pm.note': 'This opens a chat with @hudasjewelry. Tell her it is about “{name}” and she will come back with the price and the details.',
      'pm.noteSold': 'This one has found its person, but it stays here. Message her if you would like something built from it.',
      'pm.photoOf': 'Photo {n} of {total}',
      'pm.spin': 'Turn the piece',
      'pm.spinHint': 'Drag to turn',
      'pm.spinLoading': 'Loading the turn…',
      'open': 'View piece',
    },
  };

  var lang = 'ro';
  var filter = 'all';

  function t(key) {
    var d = COPY[lang];
    return (d && d[key] !== undefined) ? d[key] : (COPY.ro[key] || '');
  }
  function fill(str, vals) {
    return str.replace(/\{(\w+)\}/g, function (_, k) {
      return vals[k] !== undefined ? vals[k] : '';
    });
  }
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ─────────────── traducerea paginii ─────────────── */
  function applyCopy() {
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = t(key);
      if (!val) return;
      // doar câteva chei conțin un link; restul se pun ca text simplu
      if (key === 'collection.note') el.innerHTML = val;
      else el.textContent = val;
    });
    $$('.langswitch button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
    document.title = lang === 'ro'
      ? "HUDA'S JEWELRY — bijuterii contemporane, lucrate manual"
      : "HUDA'S JEWELRY — contemporary jewellery, made by hand";
  }

  /* ─────────────── filtrele ─────────────── */
  function kindsInUse() {
    var order = ['inel', 'colier', 'pandantiv', 'cercei', 'bratara'];
    return order.filter(function (k) {
      return PRODUCTS.some(function (p) { return p.kind === k; });
    });
  }

  function buildFilters() {
    var box = $('#filters');
    if (!box) return;
    box.textContent = '';
    ['all'].concat(kindsInUse()).forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.kind = k;
      b.textContent = t('f.' + k);
      b.setAttribute('aria-pressed', String(k === filter));
      b.addEventListener('click', function () {
        filter = k;
        $$('#filters button').forEach(function (o) {
          o.setAttribute('aria-pressed', String(o.dataset.kind === filter));
        });
        applyFilter();
      });
      box.appendChild(b);
    });
  }

  function applyFilter() {
    var shown = 0;
    $$('#product-grid .card').forEach(function (card) {
      var ok = filter === 'all' || card.dataset.kind === filter;
      card.classList.toggle('is-hidden', !ok);
      if (ok) shown++;
    });
    var empty = $('#grid-empty');
    if (empty) empty.hidden = shown !== 0;
  }

  /* ─────────────── galeria ─────────────── */
  function photo(p, n) { return 'assets/images/' + p.id + '-' + n + '.jpg'; }

  function buildGrid() {
    var grid = $('#product-grid');
    if (!grid) return;
    grid.textContent = '';

    PRODUCTS.forEach(function (p, i) {
      var loc = p[lang] || p.ro;

      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'card reveal';
      card.dataset.id = p.id;
      card.dataset.kind = p.kind;
      card.setAttribute('aria-label', t('open') + ': ' + loc.name);

      var frame = document.createElement('div');
      frame.className = 'card__frame';

      var img = document.createElement('img');
      img.src = photo(p, 1);
      img.alt = loc.name + ' — ' + loc.tagline;
      img.loading = i < 4 ? 'eager' : 'lazy';
      img.decoding = 'async';
      frame.appendChild(img);

      if (p.exhibited && EXHIBITIONS[p.exhibited]) {
        var flag = document.createElement('span');
        flag.className = 'card__flag';
        flag.textContent = EXHIBITIONS[p.exhibited][lang] || EXHIBITIONS[p.exhibited].ro;
        frame.appendChild(flag);
      }
      if (p.sold) {
        var sold = document.createElement('span');
        sold.className = 'card__sold';
        sold.textContent = t('c.sold');
        frame.appendChild(sold);
      }

      var body = document.createElement('div');
      body.className = 'card__body';
      var h3 = document.createElement('h3');
      h3.className = 'card__name';
      h3.textContent = loc.name;
      var tag = document.createElement('p');
      tag.className = 'card__tag';
      tag.textContent = loc.tagline;
      body.appendChild(h3);
      body.appendChild(tag);

      card.appendChild(frame);
      card.appendChild(body);
      card.addEventListener('click', function () { openModal(p.id); });
      grid.appendChild(card);
    });

    applyFilter();
    observeReveal();
  }

  /* ─────────────── fereastra piesei ─────────────── */
  var modal      = $('#product-modal');
  var lastFocus  = null;
  var currentPid = null;

  /* ─────────────── rotirea din fotografii ───────────────
     Nu e 3D: sunt 36 de fotografii făcute din 10 în 10 grade, pe care
     le derulăm la tras cu degetul. Arată fotorealist fiindcă sunt
     fotografii — argintul rămâne argint.

     Cadrele se încarcă întreţesut, nu în ordine: întâi din şase în şase,
     apoi se îndesesc. Aşa piesa se poate roti după prima jumătate de
     secundă, chiar dacă restul mai vin din urmă. */
  var spin = null;

  function spinFrame(p, i) {
    return 'assets/spins/' + p.id + '/' + String(i + 1).padStart(2, '0') + '.jpg';
  }

  /* ordinea de încărcare: 1, 7, 13… apoi la jumătate, şi tot aşa */
  function loadOrder(n) {
    var order = [], seen = {}, step = Math.max(1, Math.ceil(n / 6)), i;
    while (step >= 1) {
      for (i = 0; i < n; i += step) {
        if (!seen[i]) { seen[i] = 1; order.push(i); }
      }
      if (step === 1) break;
      step = Math.floor(step / 2);
    }
    for (i = 0; i < n; i++) if (!seen[i]) { seen[i] = 1; order.push(i); }
    return order;
  }

  function stopSpin() {
    if (!spin) return;
    if (spin.raf) cancelAnimationFrame(spin.raf);
    spin = null;
  }

  function showSpin(p) {
    stopSpin();
    var stage = $('#pm-stage');
    stage.textContent = '';

    var n = p.spin;
    var box = document.createElement('div');
    box.className = 'spin';
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', (p[lang] || p.ro).name + ' — ' + t('pm.spin'));
    box.tabIndex = 0;

    var frames = [], ready = [];
    for (var i = 0; i < n; i++) {
      var im = document.createElement('img');
      im.className = 'spin__f';
      im.alt = '';
      im.decoding = 'async';
      frames.push(im);
      ready.push(false);
      box.appendChild(im);
    }

    var hint = document.createElement('p');
    hint.className = 'spin__hint';
    hint.textContent = t('pm.spinLoading');
    box.appendChild(hint);

    var bar = document.createElement('span');
    bar.className = 'spin__bar';
    box.appendChild(bar);

    stage.appendChild(box);

    spin = { p: p, n: n, frames: frames, ready: ready, at: 0, box: box, hint: hint, bar: bar,
             loaded: 0, raf: 0, vel: 0 };

    /* arată cadrul cel mai apropiat care chiar s-a încărcat */
    function paint() {
      var want = ((Math.round(spin.at) % n) + n) % n;
      var best = -1;
      for (var d = 0; d < n; d++) {
        if (spin.ready[(want + d) % n]) { best = (want + d) % n; break; }
        if (spin.ready[(want - d + n) % n]) { best = (want - d + n) % n; break; }
      }
      if (best < 0) return;
      for (var k = 0; k < n; k++) frames[k].classList.toggle('is-on', k === best);
    }

    /* încărcarea întreţesută */
    var order = loadOrder(n), oi = 0;
    function pump() {
      if (!spin || oi >= order.length) return;
      var idx = order[oi++];
      var img = frames[idx];
      img.onload = function () {
        if (!spin) return;
        spin.ready[idx] = true;
        spin.loaded++;
        spin.bar.className = 'spin__bar is-at-' + Math.min(10, Math.round(spin.loaded / n * 10));
        if (spin.loaded === 1) { paint(); spin.hint.textContent = t('pm.spinHint'); }
        else paint();
        if (spin.loaded === n) spin.bar.className = 'spin__bar is-done';
        pump();
      };
      img.onerror = function () { if (spin) pump(); };
      img.src = spinFrame(p, idx);
    }
    pump(); pump(); pump();

    /* tragerea */
    var dragging = false, lastX = 0, startAt = 0, moved = 0;

    function turnBy(dx) {
      var w = box.clientWidth || 1;
      /* o tragere cât lăţimea cadrului = o rotaţie completă,
         la fel pe telefon şi pe ecran mare */
      var delta = (dx / w) * n * (p.spinReverse ? 1 : -1);
      spin.at = spin.at + delta;
      paint();
    }

    box.addEventListener('pointerdown', function (e) {
      if (!spin) return;
      dragging = true; moved = 0;
      lastX = e.clientX; startAt = spin.at; spin.vel = 0;
      if (spin.raf) { cancelAnimationFrame(spin.raf); spin.raf = 0; }
      box.classList.add('is-dragging');
      box.setPointerCapture && box.setPointerCapture(e.pointerId);
      hint.classList.add('is-gone');
    });
    box.addEventListener('pointermove', function (e) {
      if (!dragging || !spin) return;
      var dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      spin.vel = dx;
      turnBy(dx);
    });
    function release() {
      if (!dragging || !spin) return;
      dragging = false;
      box.classList.remove('is-dragging');
      /* puţină inerţie, dacă vizitatorul n-a cerut mai puţină mişcare */
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var v = spin.vel;
      (function glide() {
        if (!spin || dragging) return;
        v *= 0.93;
        if (Math.abs(v) < 0.4) { spin.raf = 0; return; }
        turnBy(v);
        spin.raf = requestAnimationFrame(glide);
      })();
    }
    box.addEventListener('pointerup', release);
    box.addEventListener('pointercancel', release);
    box.addEventListener('lostpointercapture', release);

    /* de la tastatură */
    box.addEventListener('keydown', function (e) {
      if (!spin) return;
      if (e.key === 'ArrowLeft') { spin.at -= 1; paint(); e.preventDefault(); }
      if (e.key === 'ArrowRight') { spin.at += 1; paint(); e.preventDefault(); }
    });

    $$('#pm-thumbs button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.spin === '1'));
    });
  }

  function showPhoto(p, n) {
    stopSpin();
    var stage = $('#pm-stage');
    var loc = p[lang] || p.ro;
    stage.textContent = '';
    var img = document.createElement('img');
    img.src = photo(p, n);
    img.alt = loc.name + ' — ' + fill(t('pm.photoOf'), { n: n, total: p.photos });
    stage.appendChild(img);
    $$('#pm-thumbs button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.spin !== '1' && Number(b.dataset.n) === n));
    });
  }

  function openModal(id) {
    var p = PRODUCTS.filter(function (x) { return x.id === id; })[0];
    if (!p || !modal) return;
    currentPid = id;
    var loc = p[lang] || p.ro;

    $('#pm-tagline').textContent = loc.tagline;
    $('#pm-title').textContent   = loc.name;
    $('#pm-desc').textContent    = loc.description;

    var soldEl = $('#pm-sold');
    soldEl.hidden = !p.sold;
    soldEl.textContent = p.sold ? t('c.sold') : '';

    /* miniaturile */
    var thumbs = $('#pm-thumbs');
    thumbs.textContent = '';
    if (p.photos > 1 || p.spin) {
      for (var n = 1; n <= p.photos; n++) {
        (function (n) {
          var b = document.createElement('button');
          b.type = 'button';
          b.dataset.n = n;
          b.setAttribute('aria-label', fill(t('pm.photoOf'), { n: n, total: p.photos }));
          var im = document.createElement('img');
          im.src = photo(p, n);
          im.alt = '';
          b.appendChild(im);
          b.addEventListener('click', function () { showPhoto(p, n); });
          thumbs.appendChild(b);
        })(n);
      }
      /* rotirea, dacă piesa are cadrele fotografiate */
      if (p.spin) {
        var sb = document.createElement('button');
        sb.type = 'button';
        sb.dataset.spin = '1';
        sb.className = 'pm__spinbtn';
        sb.setAttribute('aria-label', t('pm.spin'));
        sb.title = t('pm.spin');
        sb.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">'
          + '<path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"'
          + ' d="M4.5 9.5a8 8 0 0 1 15 2.5M19.5 14.5a8 8 0 0 1-15-2.5"/>'
          + '<path fill="currentColor" d="M3.2 6.2l1.6 3.9 3.9-1.6zM20.8 17.8l-1.6-3.9-3.9 1.6z"/></svg>';
        sb.addEventListener('click', function () { showSpin(p); });
        thumbs.appendChild(sb);
      }
    }
    showPhoto(p, 1);

    /* specificațiile */
    var specs = $('#pm-specs');
    specs.textContent = '';
    function row(k, v) {
      var li = document.createElement('li');
      var key = document.createElement('span');
      key.className = 'k';
      key.textContent = k;
      var val = document.createElement('span');
      val.textContent = v;
      li.appendChild(key);
      li.appendChild(val);
      specs.appendChild(li);
    }
    if (loc.materials) row(t('pm.materials'), loc.materials);
    if (p.exhibited && EXHIBITIONS[p.exhibited]) {
      row(t('pm.exhibited'), EXHIBITIONS[p.exhibited][lang] || EXHIBITIONS[p.exhibited].ro);
    }
    row(t('pm.oneoff'), t('pm.oneoffVal'));

    /* butonul de comandă */
    var order = $('#pm-order');
    $('#pm-order-label').textContent = p.sold ? t('pm.orderSold') : t('pm.order');
    if (p.sold) {
      order.setAttribute('aria-disabled', 'true');
      order.removeAttribute('href');
    } else {
      order.removeAttribute('aria-disabled');
      order.href = IG_DM;
    }
    $('#pm-note').textContent = p.sold
      ? t('pm.noteSold')
      : fill(t('pm.note'), { name: loc.name });

    /* adresa capătă #piesa-<id>, ca să poată fi trimis un link direct
       către o piesă anume — exact ce trebuie într-o conversație pe Instagram */
    if (history.replaceState) history.replaceState(null, '', '#piesa-' + id);

    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('is-locked');
    ['#nav', 'main', '.footer'].forEach(function (s) {
      var el = $(s); if (el) el.inert = true;
    });
    $('.modal__close').focus();
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    stopSpin();
    currentPid = null;
    if (history.replaceState && location.hash.indexOf('#piesa-') === 0) {
      history.replaceState(null, '', location.pathname + location.search);
    }
    document.body.classList.remove('is-locked');
    ['#nav', 'main', '.footer'].forEach(function (s) {
      var el = $(s); if (el) el.inert = false;
    });
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  if (modal) {
    $$('[data-close]', modal).forEach(function (el) {
      el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', function (e) {
      if (modal.hidden) return;
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key !== 'Tab') return;
      /* ținem focusul în fereastră */
      var f = $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', modal)
        .filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ─────────────── navigația ─────────────── */
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

  /* ─────────────── apariția la scroll ─────────────── */
  var io = null;
  function observeReveal() {
    if (!('IntersectionObserver' in window)) {
      $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px' });
    }
    $$('.reveal:not(.is-in)').forEach(function (el) { io.observe(el); });
  }

  /* ─────────────── schimbarea limbii ─────────────── */
  $$('.langswitch button').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.dataset.lang === lang) return;
      lang = b.dataset.lang;
      applyCopy();
      buildFilters();
      buildGrid();
      if (currentPid) openModal(currentPid);   // re-deschide în limba nouă
    });
  });

  /* ─────────────── pornire ─────────────── */
  var y = $('#year');
  if (y) y.textContent = String(new Date().getFullYear());

  applyCopy();
  buildFilters();
  buildGrid();

  /* deschide piesa cerută în adresă, dacă există */
  function openFromHash() {
    var m = /^#piesa-(.+)$/.exec(location.hash);
    if (!m) return;
    var id = decodeURIComponent(m[1]);
    if (PRODUCTS.some(function (p) { return p.id === id; })) openModal(id);
  }
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
})();
