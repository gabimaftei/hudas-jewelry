/* ═══════════════════════════════════════════════════════════════
   Panoul Hudei — tabul „Piese"
   ───────────────────────────────────────────────────────────────
   Piesele, pozele lor şi lista de expoziţii. Pozele se taie pe
   marginea bijuteriei şi se micşorează în browser (vezi core.js).
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $ = HJA.$;

  var items = [];
  var exhibitions = {};
  var current = -1;
  var baseline = '';
  var baselineExh = '';
  var tokenSeq = 0;
  var bound = false;

  function img(file) { return '/assets/images/' + file; }

  function snapshot() {
    return JSON.stringify(items.map(function (p) {
      return {
        id: p.id, kind: p.kind, sold: p.sold, exhibited: p.exhibited,
        ro: p.ro, en: p.en,
        shots: p.shots.map(function (s) { return s.kind === 'have' ? s.file : 'nou:' + s.token; }),
      };
    }));
  }

  function freeId(base, exceptFor) {
    var id = base, n = 2;
    var taken = function (v) { return items.some(function (p) { return p !== exceptFor && p.id === v; }); };
    while (taken(id)) id = base + '-' + (n++);
    return id;
  }

  function touch() { HJA.touch(); }

  /* ─────────────── pozele ─────────────── */
  async function addFiles(files) {
    var p = items[current];
    if (!p) return;
    var autoCrop = $('#autocrop').checked;
    var list = Array.prototype.slice.call(files).filter(function (f) { return /^image\//.test(f.type); });
    if (!list.length) return;
    HJA.say('Pregătesc ' + list.length + (list.length === 1 ? ' poză…' : ' poze…'), 'busy');
    for (var i = 0; i < list.length; i++) {
      try {
        var out = await HJA.processImage(list[i], { autoCrop: autoCrop, maxSide: 1400, quality: 0.88 });
        p.shots.push({
          kind: 'new', token: String(++tokenSeq), blob: out.blob, url: URL.createObjectURL(out.blob),
          bytes: out.blob.size, cropped: out.cropped,
        });
      } catch (e) {
        HJA.say('N-am putut citi ' + list[i].name, 'err');
      }
    }
    HJA.say('');
    drawShots(); drawList(); touch();
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
      var im = document.createElement('img');
      im.src = s.url; im.alt = '';
      fr.appendChild(im);
      var badge = document.createElement('span');
      badge.className = 'shot__badge' + (s.kind === 'new' ? ' shot__new' : '');
      badge.textContent = i === 0 ? 'În galerie' : String(i + 1);
      fr.appendChild(badge);
      li.appendChild(fr);

      var tools = document.createElement('div');
      tools.className = 'shot__tools';
      [['←', 'Mai în față', i === 0, function () { moveShot(i, -1); }],
       ['→', 'Mai în spate', i === p.shots.length - 1, function () { moveShot(i, 1); }],
       ['✕', 'Scoate poza', false, function () { dropShot(i); }]].forEach(function (b, k) {
        var btn = document.createElement('button');
        btn.type = 'button'; btn.textContent = b[0]; btn.title = b[1];
        btn.setAttribute('aria-label', b[1]);
        btn.disabled = b[2];
        if (k === 2) btn.className = 'is-del';
        btn.addEventListener('click', b[3]);
        tools.appendChild(btn);
      });
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
    var p = items[current], j = i + d;
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

  /* ─────────────── lista din stânga ─────────────── */
  function drawList() {
    var ol = $('#plist');
    ol.textContent = '';
    items.forEach(function (p, idx) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pitem' + (idx === current ? ' is-on' : '');
      var im = document.createElement('img');
      im.className = 'pitem__thumb';
      im.alt = '';
      if (p.shots[0]) im.src = p.shots[0].url;
      var name = document.createElement('span');
      name.className = 'pitem__name';
      name.textContent = p.ro.name || '(fără nume)';
      b.appendChild(im); b.appendChild(name);
      if (p.sold) {
        var f = document.createElement('span');
        f.className = 'pitem__flag'; f.textContent = 'plecată';
        b.appendChild(f);
      }
      b.addEventListener('click', function () { select(idx); });

      var mv = document.createElement('div');
      mv.className = 'pmove';
      [['▲', 'Mută mai sus', idx === 0, -1], ['▼', 'Mută mai jos', idx === items.length - 1, 1]].forEach(function (x) {
        var btn = document.createElement('button');
        btn.type = 'button'; btn.textContent = x[0]; btn.title = x[1];
        btn.setAttribute('aria-label', x[1]);
        btn.disabled = x[2];
        btn.addEventListener('click', function () { move(idx, x[3]); });
        mv.appendChild(btn);
      });
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
        $('#' + l + '-' + f).value = p[l][f] || '';
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
     Lista e comună tuturor pieselor. Piesele se leagă de cheie, nu de
     nume, deci corectarea unui nume nu rupe nicio legătură. */
  function hasExh(k) { return Object.prototype.hasOwnProperty.call(exhibitions, k); }

  function usedBy(k) { return items.filter(function (p) { return p.exhibited === k; }).length; }

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
        inp.type = 'text'; inp.maxLength = 80;
        inp.value = exhibitions[k][l] || '';
        inp.setAttribute('aria-label', l === 'ro' ? 'Numele în română' : 'Numele în engleză');
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
      del.type = 'button'; del.className = 'exh__del'; del.textContent = '✕';
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
        drawExhibitions(); touch();
      });
      li.appendChild(del);
      ul.appendChild(li);
    });
  }

  function addExhibition() {
    var ro = $('#exh-ro').value.trim();
    var en = $('#exh-en').value.trim();
    if (!ro) { $('#exh-ro').focus(); return; }
    var dup = Object.keys(exhibitions).some(function (k) {
      return (exhibitions[k].ro || '').trim().toLowerCase() === ro.toLowerCase();
    });
    if (dup) { HJA.say('„' + ro + '" e deja în listă.', 'err'); return; }
    var key = HJA.slug(ro, 'expozitie'), base = key, n = 2;
    while (hasExh(key)) key = base + '-' + (n++);
    exhibitions[key] = { ro: ro, en: en || ro };
    $('#exh-ro').value = ''; $('#exh-en').value = '';
    /* se pune singură doar la o piesă care n-avea nicio expoziţie — altfel
       am schimba pe tăcute o etichetă aleasă deja */
    var p = items[current], assigned = false;
    if (p && !p.exhibited) { p.exhibited = key; assigned = true; }
    fillExhibited(p ? (p.exhibited || '') : '');
    drawExhibitions(); touch();
    HJA.say(assigned
      ? '„' + ro + '" a fost adăugată și pusă la piesa asta.'
      : '„' + ro + '" a fost adăugată. Alege-o din listă la piesele unde a fost expusă.', 'ok');
  }

  /* ─────────────── legarea câmpurilor ─────────────── */
  function bind() {
    if (bound) return;
    bound = true;
    ['ro', 'en'].forEach(function (l) {
      ['name', 'tagline', 'description', 'materials'].forEach(function (f) {
        var el = $('#' + l + '-' + f);
        el.addEventListener('input', function () {
          var p = items[current];
          if (!p) return;
          p[l][f] = el.value;
          if (l === 'ro' && f === 'name') {
            /* cât piesa e nepublicată, identificatorul urmează numele;
               după prima publicare rămâne fix, ca să nu se mute pozele */
            if (p.fresh) p.id = freeId(HJA.slug(el.value, 'piesa'), p);
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
    HJA.wireDrop($('#drop'), $('#pick'), $('#file'), addFiles);
  }

  /* ─────────────── modulul ─────────────── */
  HJA.register({
    id: 'pieces',

    load: function (data) {
      exhibitions = JSON.parse(JSON.stringify(data.exhibitions));
      items = data.products.map(function (p) {
        var copy = JSON.parse(JSON.stringify(p));
        copy.shots = [];
        for (var i = 1; i <= p.photos; i++) {
          var file = p.id + '-' + i + '.jpg';
          copy.shots.push({ kind: 'have', file: file, url: img(file) });
        }
        delete copy.photos;
        return copy;
      });
      baseline = snapshot();
      baselineExh = JSON.stringify(exhibitions);
      bind();
      select(items.length ? 0 : -1);
    },

    dirty: function () {
      return snapshot() !== baseline || JSON.stringify(exhibitions) !== baselineExh;
    },

    problems: function () {
      var bad = [];
      items.forEach(function (p) {
        var n = p.ro.name || p.en.name || 'piesa nouă';
        if (!p.shots.length) bad.push('Piesa „' + n + '" nu are nicio poză.');
        if (!p.ro.name || !p.en.name) bad.push('Piesa „' + n + '" n-are numele în amândouă limbile.');
        if (!p.ro.tagline || !p.en.tagline) bad.push('Piesa „' + n + '" n-are subtitlul în amândouă limbile.');
      });
      Object.keys(exhibitions).forEach(function (k) {
        if (!(exhibitions[k].ro || '').trim()) bad.push('O expoziție din listă n-are nume în română.');
      });
      return bad;
    },

    summary: function () {
      var before = JSON.parse(baseline), byId = {}, out = [];
      before.forEach(function (p) { byId[p.id] = p; });
      items.forEach(function (p) {
        var old = byId[p.id], name = p.ro.name || '(fără nume)';
        if (!old) { out.push({ tag: 'add', text: 'Piesă nouă: ' + name }); return; }
        var shots = p.shots.map(function (s) { return s.kind === 'have' ? s.file : 'nou:' + s.token; });
        var parts = [];
        if (JSON.stringify([p.ro, p.en]) !== JSON.stringify([old.ro, old.en])) parts.push('text');
        if (JSON.stringify([p.kind, p.sold, p.exhibited]) !== JSON.stringify([old.kind, old.sold, old.exhibited])) parts.push('detalii');
        if (JSON.stringify(shots) !== JSON.stringify(old.shots)) parts.push('poze');
        if (parts.length) out.push({ tag: 'edit', text: 'Piesa ' + name + ' — ' + parts.join(', ') });
      });
      var nowIds = items.map(function (p) { return p.id; });
      before.forEach(function (p) {
        if (nowIds.indexOf(p.id) === -1) out.push({ tag: 'del', text: 'Piesă ștearsă: ' + (p.ro.name || p.id) });
      });
      var orderBefore = before.map(function (p) { return p.id; }).filter(function (id) { return nowIds.indexOf(id) !== -1; });
      var orderNow = nowIds.filter(function (id) { return byId[id]; });
      if (JSON.stringify(orderBefore) !== JSON.stringify(orderNow)) {
        out.push({ tag: 'edit', text: 'S-a schimbat ordinea pieselor în galerie' });
      }
      var exBefore = JSON.parse(baselineExh || '{}');
      Object.keys(exhibitions).forEach(function (k) {
        var nm = exhibitions[k].ro || '(fără nume)';
        if (!Object.prototype.hasOwnProperty.call(exBefore, k)) out.push({ tag: 'add', text: 'Expoziție nouă în listă: ' + nm });
        else if (JSON.stringify(exBefore[k]) !== JSON.stringify(exhibitions[k])) out.push({ tag: 'edit', text: 'Expoziție redenumită: ' + nm });
      });
      Object.keys(exBefore).forEach(function (k) {
        if (!hasExh(k)) out.push({ tag: 'del', text: 'Expoziție scoasă din listă: ' + (exBefore[k].ro || k) });
      });
      return out;
    },

    prepare: function () {
      var uploads = [], keep = {}, products = [];
      items.forEach(function (p) {
        p.shots.forEach(function (s, n) {
          var target = p.id + '-' + (n + 1) + '.jpg';
          keep[target] = true;
          if (s.kind === 'new') uploads.push({ path: 'assets/images/' + target, blob: s.blob });
          else if (s.file !== target) uploads.push({ path: 'assets/images/' + target, from: 'assets/images/' + s.file });
        });
        var rec = {
          id: p.id, photos: p.shots.length, kind: p.kind, sold: !!p.sold,
          exhibited: p.exhibited || null, ro: p.ro, en: p.en,
        };
        /* rotirea nu se editează din panou, dar se duce mai departe —
           catalogul se rescrie întreg, deci altfel s-ar pierde tăcut */
        if (p.spin) rec.spin = p.spin;
        if (p.spinReverse) rec.spinReverse = true;
        products.push(rec);
      });
      var deletes = [];
      JSON.parse(baseline).forEach(function (old) {
        old.shots.forEach(function (f) {
          if (f.indexOf('nou:') !== 0 && !keep[f]) deletes.push('assets/images/' + f);
        });
      });
      Object.keys(exhibitions).forEach(function (k) {
        exhibitions[k].ro = (exhibitions[k].ro || '').trim();
        exhibitions[k].en = (exhibitions[k].en || '').trim() || exhibitions[k].ro;
      });
      return { uploads: uploads, payload: { products: products, exhibitions: exhibitions, deletes: deletes } };
    },

    published: function () {
      items.forEach(function (p) {
        p.fresh = false;
        p.shots = p.shots.map(function (s, n) {
          /* păstrăm previzualizarea de acum: până se termină deploy-ul,
             fişierul nou nu e încă pe site */
          return { kind: 'have', file: p.id + '-' + (n + 1) + '.jpg', url: s.url };
        });
      });
      baseline = snapshot();
      baselineExh = JSON.stringify(exhibitions);
      drawExhibitions(); drawShots(); drawList();
    },
  });
})();
