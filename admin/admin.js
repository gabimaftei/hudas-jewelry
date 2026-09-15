/* ═══════════════════════════════════════════════════════════════
   Panoul de administrare — HUDA'S JEWELRY
   ───────────────────────────────────────────────────────────────
   Citește catalogul din ../assets/js/products.js (același fișier pe
   care îl folosește site-ul), îl lasă modificat în browser, iar la
   final îl trimite la /api/publish, care îl scrie mai departe.

   Pozele sunt tăiate și micșorate aici, în browser, înainte să plece
   nicăieri. E același algoritm cu care au fost pregătite primele 13
   piese: caută marginea bijuteriei pe fundalul alb, lasă 10% aer în
   jur, duce latura lungă la cel mult 1400px și comprimă la JPEG.
   Fără asta, o poză direct din telefon ar ajunge de 4 MB pe site și
   ar fi încadrată altfel decât toate celelalte.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var MAX_SIDE = 1400;
  var JPEG_Q = 0.88;
  var SCAN_SIDE = 700;      // rezoluția la care se caută marginea piesei
  var WHITE = 244;          // peste atât, un pixel trece drept fundal
  var PAD = 0.10;           // aer în jurul piesei

  var pass = '';
  var items = [];           // piesele, cu pozele lor
  var exhibitions = {};
  var current = -1;
  var baseline = '';
  var baselineExh = '';      // lista de expoziţii, aşa cum e pe site

  /* ─────────────── pornire ─────────────── */
  function load() {
    /* products.js declară `const PRODUCTS`, iar un `const` la nivelul unui
       script clasic NU ajunge pe window — trăiește în scope-ul lexical
       global. Deci se citește ca identificator simplu, nu ca window.X. */
    var cat = typeof PRODUCTS !== 'undefined' ? PRODUCTS : [];
    var exh = typeof EXHIBITIONS !== 'undefined' ? EXHIBITIONS : {};
    exhibitions = JSON.parse(JSON.stringify(exh));
    items = cat.map(function (p) {
      var copy = JSON.parse(JSON.stringify(p));
      copy.shots = [];
      for (var i = 1; i <= p.photos; i++) {
        copy.shots.push({ kind: 'have', file: p.id + '-' + i + '.jpg',
                          url: '../assets/images/' + p.id + '-' + i + '.jpg' });
      }
      delete copy.photos;
      return copy;
    });
    baseline = snapshot();
    baselineExh = JSON.stringify(exhibitions);
  }

  function snapshot() {
    return JSON.stringify(items.map(function (p) {
      return {
        id: p.id, kind: p.kind, sold: p.sold, exhibited: p.exhibited,
        ro: p.ro, en: p.en,
        shots: p.shots.map(function (s) { return s.kind === 'have' ? s.file : 'nou:' + s.token; }),
      };
    }));
  }

  function dirty() {
    return snapshot() !== baseline || JSON.stringify(exhibitions) !== baselineExh;
  }

  function slug(s) {
    return (s || '').toLowerCase()
      .replace(/ă|â/g, 'a').replace(/î/g, 'i').replace(/ș|ş/g, 's').replace(/ț|ţ/g, 't')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 46) || 'piesa';
  }

  function freeId(base, exceptFor) {
    var id = base, n = 2;
    var taken = function (v) {
      return items.some(function (p) { return p !== exceptFor && p.id === v; });
    };
    while (taken(id)) id = base + '-' + (n++);
    return id;
  }

  /* ─────────────── pozele ─────────────── */

  /* Caută dreptunghiul în care stă bijuteria, pe fundal alb.
     Întoarce null dacă poza nu pare a fi pe alb — atunci nu se taie
     nimic, ca să nu stricăm o fotografie purtată pe mână. */
  function findPiece(bitmap) {
    var s = Math.min(1, SCAN_SIDE / Math.max(bitmap.width, bitmap.height));
    var w = Math.max(1, Math.round(bitmap.width * s));
    var h = Math.max(1, Math.round(bitmap.height * s));
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    var d = ctx.getImageData(0, 0, w, h).data;

    var minX = w, minY = h, maxX = -1, maxY = -1;
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var i = (y * w + x) * 4;
        var lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        if (lum < WHITE) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return null;
    var cover = ((maxX - minX + 1) * (maxY - minY + 1)) / (w * h);
    if (cover > 0.94) return null;   // ocupă tot cadrul → n-are fundal alb de tăiat

    var pad = Math.round(Math.max(maxX - minX, maxY - minY) * PAD);
    var x0 = Math.max(0, minX - pad), y0 = Math.max(0, minY - pad);
    var x1 = Math.min(w - 1, maxX + pad), y1 = Math.min(h - 1, maxY + pad);
    return {
      x: Math.round(x0 / s), y: Math.round(y0 / s),
      w: Math.round((x1 - x0 + 1) / s), h: Math.round((y1 - y0 + 1) / s),
    };
  }

  async function processImage(file, autoCrop) {
    var bitmap = await createImageBitmap(file);
    var box = { x: 0, y: 0, w: bitmap.width, h: bitmap.height };
    var cropped = false;
    if (autoCrop) {
      var found = findPiece(bitmap);
      if (found) { box = found; cropped = true; }
    }
    var scale = Math.min(1, MAX_SIDE / Math.max(box.w, box.h));
    var cw = Math.max(1, Math.round(box.w * scale));
    var ch = Math.max(1, Math.round(box.h * scale));
    var c = document.createElement('canvas');
    c.width = cw; c.height = ch;
    var ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cw, ch);   // pentru PNG-uri cu transparență
    ctx.drawImage(bitmap, box.x, box.y, box.w, box.h, 0, 0, cw, ch);
    bitmap.close && bitmap.close();
    var blob = await new Promise(function (r) { c.toBlob(r, 'image/jpeg', JPEG_Q); });
    return { blob: blob, w: cw, h: ch, cropped: cropped };
  }

  function blobToBase64(blob) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () { res(String(fr.result).split(',')[1]); };
      fr.onerror = rej;
      fr.readAsDataURL(blob);
    });
  }

  var tokenSeq = 0;
  async function addFiles(files) {
    var p = items[current];
    if (!p) return;
    var autoCrop = $('#autocrop').checked;
    var list = Array.prototype.slice.call(files).filter(function (f) { return /^image\//.test(f.type); });
    if (!list.length) return;

    say('Pregătesc ' + list.length + (list.length === 1 ? ' poză…' : ' poze…'), 'busy');
    for (var i = 0; i < list.length; i++) {
      try {
        var out = await processImage(list[i], autoCrop);
        p.shots.push({
          kind: 'new', token: String(++tokenSeq), blob: out.blob,
          url: URL.createObjectURL(out.blob),
          w: out.w, h: out.h, bytes: out.blob.size, cropped: out.cropped,
        });
      } catch (e) {
        say('N-am putut citi ' + list[i].name, 'err');
      }
    }
    say('');
    drawShots(); drawList(); touch();
  }

  /* ─────────────── lista din stânga ─────────────── */
  function drawList() {
    var ol = $('#plist');
    ol.textContent = '';
    items.forEach(function (p, idx) {
      var li = document.createElement('li');

      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pitem' + (idx === current ? ' is-on' : '');
      var img = document.createElement('img');
      img.className = 'pitem__thumb';
      img.alt = '';
      if (p.shots[0]) img.src = p.shots[0].url;
      var name = document.createElement('span');
      name.className = 'pitem__name';
      name.textContent = p.ro.name || '(fără nume)';
      b.appendChild(img); b.appendChild(name);
      if (p.sold) {
        var f = document.createElement('span');
        f.className = 'pitem__flag'; f.textContent = 'plecată';
        b.appendChild(f);
      }
      b.addEventListener('click', function () { select(idx); });

      var mv = document.createElement('div');
      mv.className = 'pmove';
      var up = document.createElement('button');
      up.type = 'button'; up.textContent = '▲'; up.title = 'Mută mai sus';
      up.disabled = idx === 0;
      up.addEventListener('click', function () { move(idx, -1); });
      var dn = document.createElement('button');
      dn.type = 'button'; dn.textContent = '▼'; dn.title = 'Mută mai jos';
      dn.disabled = idx === items.length - 1;
      dn.addEventListener('click', function () { move(idx, 1); });
      mv.appendChild(up); mv.appendChild(dn);

      li.appendChild(b); li.appendChild(mv);
      ol.appendChild(li);
    });
    $('#count').textContent = items.length + (items.length === 1 ? ' piesă' : ' piese');
  }

  function move(i, d) {
    var j = i + d;
    if (j < 0 || j >= items.length) return;
    var t = items[i]; items[i] = items[j]; items[j] = t;
    if (current === i) current = j; else if (current === j) current = i;
    drawList(); touch();
  }

  /* ─────────────── editorul ─────────────── */
  function select(idx) {
    current = idx;
    var p = items[idx];
    $('#editor-empty').hidden = !!p;
    $('#editor-body').hidden = !p;
    if (!p) { drawList(); return; }

    $('#ed-title').textContent = p.ro.name || '(fără nume)';
    ['ro', 'en'].forEach(function (l) {
      ['name', 'tagline', 'description', 'materials'].forEach(function (f) {
        var el = $('#' + l + '-' + f);
        if (el) el.value = p[l][f] || '';
      });
    });
    $('#kind').value = p.kind;
    $('#sold').checked = !!p.sold;

    fillExhibited(p.exhibited || '');
    drawExhibitions();

    drawShots();
    drawList();
  }

  /* ─────────────── expoziţiile ───────────────
     Lista e comună tuturor pieselor. Cheia (ex. „rjw26") e ce se scrie în
     catalog la fiecare piesă; numele e ce apare ca etichetă pe poză. Cheia
     se naşte o dată, din numele românesc, şi nu se mai schimbă — aşa
     corectarea unui nume nu rupe legătura cu piesele care îl folosesc. */
  function hasExh(k) { return Object.prototype.hasOwnProperty.call(exhibitions, k); }

  function freeExhKey(base) {
    var k = base, n = 2;
    while (hasExh(k)) k = base + '-' + (n++);
    return k;
  }

  function usedBy(k) {
    return items.filter(function (p) { return p.exhibited === k; }).length;
  }

  function fillExhibited(value) {
    var sel = $('#exhibited');
    sel.textContent = '';
    var none = document.createElement('option');
    none.value = ''; none.textContent = 'Nicăieri';
    sel.appendChild(none);
    Object.keys(exhibitions).forEach(function (k) {
      var o = document.createElement('option');
      o.value = k; o.textContent = exhibitions[k].ro || '(fără nume)';
      sel.appendChild(o);
    });
    sel.value = hasExh(value) ? value : '';
  }

  function drawExhibitions() {
    var ul = $('#exh-list');
    ul.textContent = '';
    var keys = Object.keys(exhibitions);
    if (!keys.length) {
      var empty = document.createElement('li');
      empty.className = 'exh__empty';
      empty.textContent = 'Nicio expoziție încă.';
      ul.appendChild(empty);
    }
    keys.forEach(function (k) {
      var li = document.createElement('li');
      li.className = 'exh__row';

      ['ro', 'en'].forEach(function (l) {
        var inp = document.createElement('input');
        inp.type = 'text';
        inp.maxLength = 80;
        inp.value = exhibitions[k][l] || '';
        inp.setAttribute('aria-label', (l === 'ro' ? 'Numele în română' : 'Numele în engleză'));
        if (l === 'en') inp.placeholder = 'la fel ca în română';
        inp.addEventListener('input', function () {
          exhibitions[k][l] = inp.value;
          if (l === 'ro') fillExhibited(items[current] ? (items[current].exhibited || '') : '');
          touch();
        });
        li.appendChild(inp);
      });

      var n = usedBy(k);
      var info = document.createElement('span');
      info.className = 'exh__used';
      info.textContent = n === 0 ? 'nefolosită' : n === 1 ? 'la o piesă' : 'la ' + n + ' piese';
      li.appendChild(info);

      var del = document.createElement('button');
      del.type = 'button';
      del.className = 'exh__del';
      del.textContent = '✕';
      del.setAttribute('aria-label', 'Scoate expoziția din listă');
      del.addEventListener('click', function () {
        var name = exhibitions[k].ro || 'expoziția fără nume';
        var msg = n
          ? 'Scoți „' + name + '" din listă?\n\nE folosită la ' + (n === 1 ? 'o piesă' : n + ' piese')
            + ' — eticheta dispare de pe ' + (n === 1 ? 'ea' : 'ele') + '.'
          : 'Scoți „' + name + '" din listă?';
        if (!confirm(msg)) return;
        items.forEach(function (p) { if (p.exhibited === k) p.exhibited = null; });
        delete exhibitions[k];
        fillExhibited(items[current] ? (items[current].exhibited || '') : '');
        drawExhibitions();
        touch();
      });
      li.appendChild(del);
      ul.appendChild(li);
    });
  }

  function addExhibition() {
    var ro = $('#exh-ro').value.trim();
    var en = $('#exh-en').value.trim();
    if (!ro) { $('#exh-ro').focus(); return; }
    var dup = Object.keys(exhibitions).filter(function (k) {
      return (exhibitions[k].ro || '').trim().toLowerCase() === ro.toLowerCase();
    })[0];
    if (dup) { say('„' + ro + '" e deja în listă.', 'err'); return; }

    var key = freeExhKey(slug(ro));
    exhibitions[key] = { ro: ro, en: en || ro };
    $('#exh-ro').value = '';
    $('#exh-en').value = '';

    /* O punem singuri la piesa deschisă doar dacă n-avea nicio expoziţie —
       altfel am schimba pe tăcute o etichetă pe care ea a ales-o deja. */
    var p = items[current];
    var assigned = false;
    if (p && !p.exhibited) { p.exhibited = key; assigned = true; }
    fillExhibited(p ? (p.exhibited || '') : '');
    drawExhibitions();
    touch();
    say(assigned
      ? '„' + ro + '" a fost adăugată și pusă la piesa asta.'
      : '„' + ro + '" a fost adăugată. Alege-o din listă la piesele unde a fost expusă.', 'ok');
  }

  function drawShots() {
    var p = items[current];
    var ul = $('#shots');
    ul.textContent = '';
    if (!p) return;
    p.shots.forEach(function (s, i) {
      var li = document.createElement('li');
      li.className = 'shot';

      var fr = document.createElement('div');
      fr.className = 'shot__frame';
      var img = document.createElement('img');
      img.src = s.url; img.alt = '';
      fr.appendChild(img);
      var badge = document.createElement('span');
      badge.className = 'shot__badge' + (s.kind === 'new' ? ' shot__new' : '');
      badge.textContent = i === 0 ? 'În galerie' : String(i + 1);
      fr.appendChild(badge);
      li.appendChild(fr);

      var tools = document.createElement('div');
      tools.className = 'shot__tools';
      var l = document.createElement('button');
      l.type = 'button'; l.textContent = '←'; l.title = 'Mai în față';
      l.disabled = i === 0;
      l.addEventListener('click', function () { moveShot(i, -1); });
      var r = document.createElement('button');
      r.type = 'button'; r.textContent = '→'; r.title = 'Mai în spate';
      r.disabled = i === p.shots.length - 1;
      r.addEventListener('click', function () { moveShot(i, 1); });
      var x = document.createElement('button');
      x.type = 'button'; x.textContent = '✕'; x.title = 'Scoate poza';
      x.className = 'is-del';
      x.addEventListener('click', function () { dropShot(i); });
      tools.appendChild(l); tools.appendChild(r); tools.appendChild(x);
      li.appendChild(tools);

      var size = document.createElement('p');
      size.className = 'shot__size';
      size.textContent = s.kind === 'new'
        ? Math.round(s.bytes / 1024) + ' KB' + (s.cropped ? ' · tăiată' : '')
        : 'pe site';
      li.appendChild(size);

      ul.appendChild(li);
    });
  }

  function moveShot(i, d) {
    var p = items[current];
    var j = i + d;
    if (j < 0 || j >= p.shots.length) return;
    var t = p.shots[i]; p.shots[i] = p.shots[j]; p.shots[j] = t;
    drawShots(); drawList(); touch();
  }

  function dropShot(i) {
    var p = items[current];
    if (p.shots.length === 1 && !confirm('Asta e singura poză a piesei. O scoți oricum?')) return;
    var s = p.shots.splice(i, 1)[0];
    if (s.kind === 'new') URL.revokeObjectURL(s.url);
    drawShots(); drawList(); touch();
  }

  /* ─────────────── legarea câmpurilor ─────────────── */
  function bind() {
    ['ro', 'en'].forEach(function (l) {
      ['name', 'tagline', 'description', 'materials'].forEach(function (f) {
        var el = $('#' + l + '-' + f);
        if (!el) return;
        el.addEventListener('input', function () {
          var p = items[current];
          if (!p) return;
          p[l][f] = el.value;
          if (l === 'ro' && f === 'name') {
            /* Cât piesa n-a fost încă publicată, identificatorul (care dă
               numele fişierelor şi linkul direct către piesă) urmează numele.
               După prima publicare rămâne fix, ca să nu se mute pozele. */
            if (p.fresh) p.id = freeId(slug(el.value) || 'piesa', p);
            $('#ed-title').textContent = el.value || '(fără nume)';
            drawList();
          }
          touch();
        });
      });
    });
    $('#kind').addEventListener('change', function () {
      if (items[current]) { items[current].kind = this.value; touch(); }
    });
    $('#sold').addEventListener('change', function () {
      if (items[current]) { items[current].sold = this.checked; drawList(); touch(); }
    });
    $('#exhibited').addEventListener('change', function () {
      if (items[current]) { items[current].exhibited = this.value || null; drawExhibitions(); touch(); }
    });

    $('#exh-add').addEventListener('click', addExhibition);
    ['#exh-ro', '#exh-en'].forEach(function (s) {
      $(s).addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); addExhibition(); }
      });
    });

    $('#add').addEventListener('click', function () {
      items.push({
        id: freeId('piesa-noua'), fresh: true, kind: 'inel', sold: false, exhibited: null,
        ro: { name: '', tagline: '', description: '', materials: '' },
        en: { name: '', tagline: '', description: '', materials: '' },
        shots: [],
      });
      select(items.length - 1);
      touch();
      $('#ro-name').focus();
    });

    $('#del').addEventListener('click', function () {
      var p = items[current];
      if (!p) return;
      if (!confirm('Ștergi „' + (p.ro.name || 'piesa fără nume') + '"?\n\nDispare de pe site la următoarea publicare.')) return;
      items.splice(current, 1);
      select(Math.min(current, items.length - 1));
      touch();
    });

    /* pozele */
    $('#pick').addEventListener('click', function () { $('#file').click(); });
    $('#file').addEventListener('change', function () { addFiles(this.files); this.value = ''; });

    var drop = $('#drop');
    ['dragenter', 'dragover'].forEach(function (e) {
      drop.addEventListener(e, function (ev) { ev.preventDefault(); drop.classList.add('is-over'); });
    });
    ['dragleave', 'drop'].forEach(function (e) {
      drop.addEventListener(e, function (ev) { ev.preventDefault(); drop.classList.remove('is-over'); });
    });
    drop.addEventListener('drop', function (ev) { addFiles(ev.dataTransfer.files); });

    $('#save').addEventListener('click', openConfirm);
    $('#cf-go').addEventListener('click', publish);
    $$('[data-close]', $('#confirm')).forEach(function (el) {
      el.addEventListener('click', closeConfirm);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !$('#confirm').hidden) closeConfirm();
    });

    window.addEventListener('beforeunload', function (e) {
      if (dirty()) { e.preventDefault(); e.returnValue = ''; }
    });
  }

  function touch() {
    $('#save').disabled = !dirty();
  }

  function say(msg, tone) {
    var el = $('#status');
    el.textContent = msg || '';
    el.className = 'bar__status' + (tone ? ' is-' + tone : '');
  }

  /* ─────────────── ce se schimbă ─────────────── */
  function summary() {
    var before = JSON.parse(baseline);
    var byId = {};
    before.forEach(function (p) { byId[p.id] = p; });
    var out = [];

    items.forEach(function (p) {
      var old = byId[p.id];
      var name = p.ro.name || '(fără nume)';
      if (!old) { out.push({ tag: 'add', text: name + ' — piesă nouă' }); return; }
      var nowShots = p.shots.map(function (s) { return s.kind === 'have' ? s.file : 'nou:' + s.token; });
      var changedText = JSON.stringify([p.ro, p.en]) !== JSON.stringify([old.ro, old.en]);
      var changedDetails = JSON.stringify([p.kind, p.sold, p.exhibited]) !==
                           JSON.stringify([old.kind, old.sold, old.exhibited]);
      var changedPics = JSON.stringify(nowShots) !== JSON.stringify(old.shots);
      if (changedText || changedDetails || changedPics) {
        var parts = [];
        if (changedText) parts.push('text');
        if (changedDetails) parts.push('detalii');
        if (changedPics) parts.push('poze');
        out.push({ tag: 'edit', text: name + ' — ' + parts.join(', ') });
      }
    });

    var nowIds = items.map(function (p) { return p.id; });
    before.forEach(function (p) {
      if (nowIds.indexOf(p.id) === -1) {
        out.push({ tag: 'del', text: (p.ro.name || p.id) + ' — ștearsă' });
      }
    });

    var orderBefore = before.map(function (p) { return p.id; }).filter(function (id) { return nowIds.indexOf(id) !== -1; });
    var orderNow = nowIds.filter(function (id) { return byId[id]; });
    if (JSON.stringify(orderBefore) !== JSON.stringify(orderNow)) {
      out.push({ tag: 'edit', text: 'S-a schimbat ordinea pieselor în galerie' });
    }

    var exBefore = JSON.parse(baselineExh || '{}');
    Object.keys(exhibitions).forEach(function (k) {
      var nm = exhibitions[k].ro || '(fără nume)';
      if (!Object.prototype.hasOwnProperty.call(exBefore, k)) {
        out.push({ tag: 'add', text: 'Expoziție nouă în listă: ' + nm });
      } else if (JSON.stringify(exBefore[k]) !== JSON.stringify(exhibitions[k])) {
        out.push({ tag: 'edit', text: 'Expoziție redenumită: ' + nm });
      }
    });
    Object.keys(exBefore).forEach(function (k) {
      if (!hasExh(k)) out.push({ tag: 'del', text: 'Expoziție scoasă din listă: ' + (exBefore[k].ro || k) });
    });
    return out;
  }

  function problems() {
    var bad = [];
    items.forEach(function (p) {
      var n = p.ro.name || p.en.name || 'piesa nouă';
      if (!p.shots.length) bad.push('„' + n + '" nu are nicio poză.');
      if (!p.ro.name || !p.en.name) bad.push('„' + n + '" n-are numele în amândouă limbile.');
      if (!p.ro.tagline || !p.en.tagline) bad.push('„' + n + '" n-are subtitlul în amândouă limbile.');
    });
    Object.keys(exhibitions).forEach(function (k) {
      if (!(exhibitions[k].ro || '').trim()) bad.push('O expoziție din listă n-are nume în română.');
    });
    return bad;
  }

  function openConfirm() {
    var bad = problems();
    var ul = $('#changes');
    ul.textContent = '';
    $('#cf-err').hidden = true;

    if (bad.length) {
      $('#cf-title').textContent = 'Mai lipsește ceva';
      bad.slice(0, 8).forEach(function (t) {
        var li = document.createElement('li');
        var tag = document.createElement('span');
        tag.className = 'tag tag--del'; tag.textContent = 'de completat';
        var s = document.createElement('span'); s.textContent = t;
        li.appendChild(tag); li.appendChild(s);
        ul.appendChild(li);
      });
      $('#cf-go').disabled = true;
    } else {
      $('#cf-title').textContent = 'Gata de publicat';
      summary().forEach(function (c) {
        var li = document.createElement('li');
        var tag = document.createElement('span');
        tag.className = 'tag tag--' + c.tag;
        tag.textContent = c.tag === 'add' ? 'nou' : c.tag === 'del' ? 'șters' : 'schimbat';
        var s = document.createElement('span'); s.textContent = c.text;
        li.appendChild(tag); li.appendChild(s);
        ul.appendChild(li);
      });
      $('#cf-go').disabled = false;
    }
    $('#confirm').hidden = false;
    document.body.classList.add('is-locked');
  }

  function closeConfirm() {
    $('#confirm').hidden = true;
    document.body.classList.remove('is-locked');
  }

  /* ─────────────── publicarea ─────────────── */
  async function publish() {
    $('#cf-go').disabled = true;
    $('#cf-err').hidden = true;
    say('Pregătesc…', 'busy');

    try {
      var images = {};
      var keep = {};
      var products = [];

      for (var i = 0; i < items.length; i++) {
        var p = items[i];
        for (var n = 0; n < p.shots.length; n++) {
          var s = p.shots[n];
          var target = p.id + '-' + (n + 1) + '.jpg';
          keep[target] = true;
          if (s.kind === 'have' && s.file === target) continue;   // deja acolo, sub numele bun
          var blob;
          if (s.kind === 'new') {
            blob = s.blob;
          } else {
            /* poza există, dar îşi schimbă numele (s-a reordonat) —
               o luăm de pe site și o retrimitem sub numele nou */
            var r = await fetch(s.url);
            if (!r.ok) throw new Error('Nu găsesc poza ' + s.file);
            blob = await r.blob();
          }
          images[target] = await blobToBase64(blob);
        }
        var rec = {
          id: p.id, photos: p.shots.length, kind: p.kind,
          sold: !!p.sold, exhibited: p.exhibited || null,
          ro: p.ro, en: p.en,
        };
        /* Rotirea din fotografii nu se editează din panou, dar trebuie dusă
           mai departe: catalogul se rescrie întreg la fiecare salvare, deci
           orice câmp nepurtat aici s-ar pierde tăcut. */
        if (p.spin) rec.spin = p.spin;
        if (p.spinReverse) rec.spinReverse = true;
        products.push(rec);
      }

      /* pozele rămase fără piesă */
      var deletes = [];
      JSON.parse(baseline).forEach(function (old) {
        old.shots.forEach(function (f) {
          if (f.indexOf('nou:') !== 0 && !keep[f]) deletes.push(f);
        });
      });

      /* numele goale în engleză iau numele românesc — la expoziţii e aproape
         mereu un nume propriu, identic în ambele limbi */
      Object.keys(exhibitions).forEach(function (k) {
        exhibitions[k].ro = (exhibitions[k].ro || '').trim();
        exhibitions[k].en = (exhibitions[k].en || '').trim() || exhibitions[k].ro;
      });

      say('Trimit…', 'busy');
      var res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          password: pass, products: products, exhibitions: exhibitions,
          images: images, deletes: deletes, message: $('#cf-msg').value.trim(),
        }),
      });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ceva n-a mers.');

      /* de acum, ce e pe ecran e şi pe site */
      items.forEach(function (p) {
        p.fresh = false;
        p.shots = p.shots.map(function (s, n) {
          if (s.kind === 'new') URL.revokeObjectURL(s.url);
          var file = p.id + '-' + (n + 1) + '.jpg';
          return { kind: 'have', file: file, url: '../assets/images/' + file + '?t=' + Date.now() };
        });
      });
      baseline = snapshot();
      baselineExh = JSON.stringify(exhibitions);
      touch();
      drawExhibitions();
      drawShots();
      drawList();
      closeConfirm();
      $('#cf-msg').value = '';
      say('Publicat. Apare pe site în mai puțin de un minut.', 'ok');
    } catch (err) {
      $('#cf-err').textContent = err.message;
      $('#cf-err').hidden = false;
      $('#cf-go').disabled = false;
      say('Nu s-a publicat.', 'err');
    }
  }

  /* ─────────────── intrarea ─────────────── */
  $('#gate-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    var btn = $('#gate-go');
    var err = $('#gate-err');
    btn.disabled = true;
    err.hidden = true;
    btn.textContent = 'Verific…';
    try {
      var r = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password: $('#gate-pass').value, check: true }),
      });
      var d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Nu merge.');
      pass = $('#gate-pass').value;
      $('#gate').hidden = true;
      $('#app').hidden = false;
      load(); bind(); drawList(); select(items.length ? 0 : -1); touch();
    } catch (ex) {
      err.textContent = ex.message;
      err.hidden = false;
    }
    btn.disabled = false;
    btn.textContent = 'Intră';
  });
})();
