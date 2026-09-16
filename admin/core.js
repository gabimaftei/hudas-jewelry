/* ═══════════════════════════════════════════════════════════════
   Panoul Hudei — nucleul
   ───────────────────────────────────────────────────────────────
   Intrarea, taburile, pozele şi publicarea. Fiecare tab (piese,
   texte, blog) e un modul în fişierul lui şi se înscrie aici cu:

     HJA.register({
       id,                 'pieces' | 'texts' | 'blog'
       load(data),         primeşte ce e acum în repo
       dirty(),            are modificări nepublicate?
       problems(),         ce lipseşte, ca listă de propoziţii
       summary(),          ce se schimbă, [{ tag, text }]
       prepare(),          { uploads: [...], payload: {...} }
       published(),        publicarea a reuşit
     })

   Datele vin din /api/data — adică direct din repo, nu de pe site —
   ca panoul să nu pornească niciodată de la o versiune veche. Iar la
   publicare trimitem şi commit-ul de la care am pornit: dacă între
   timp s-a publicat altceva, serverul refuză în loc să suprascrie.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var pass = '';
  var head = '';
  var modules = [];

  function say(msg, tone) {
    var el = $('#status');
    el.textContent = msg || '';
    el.className = 'bar__status' + (tone ? ' is-' + tone : '');
  }

  async function api(path, body) {
    var res = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(Object.assign({ password: pass }, body || {})),
    });
    var data;
    try { data = await res.json(); } catch (e) {
      throw new Error('Serverul n-a răspuns cum trebuie (' + res.status + '). Încearcă din nou peste un minut.');
    }
    if (!res.ok) throw new Error(data.error || 'Ceva n-a mers.');
    return data;
  }

  function slug(text, fallback) {
    var s = (text || '').toLowerCase()
      .replace(/ă|â/g, 'a').replace(/î/g, 'i').replace(/ș|ş/g, 's').replace(/ț|ţ/g, 't')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    /* adresa se taie la un cuvânt întreg, nu în mijlocul lui — o vede
       oricine primeşte linkul */
    if (s.length > 46) {
      s = s.slice(0, 46);
      var cut = s.lastIndexOf('-');
      if (cut > 20) s = s.slice(0, cut);
    }
    return s || fallback;
  }

  function blobToBase64(blob) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () { res(String(fr.result).split(',')[1]); };
      fr.onerror = rej;
      fr.readAsDataURL(blob);
    });
  }

  /* ─────────────── pozele ───────────────
     Se prelucrează aici, în browser, înainte să plece nicăieri. La piese:
     se caută marginea bijuteriei pe fundal alb, se lasă 10% aer, iar
     latura lungă ajunge la cel mult 1400px. La blog nu se taie nimic —
     sunt poze din expoziţii şi din atelier — doar se micşorează. */
  var SCAN_SIDE = 700;
  var WHITE = 244;
  var PAD = 0.10;

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
        if (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2] < WHITE) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return null;
    if (((maxX - minX + 1) * (maxY - minY + 1)) / (w * h) > 0.94) return null;   // n-are fundal alb de tăiat
    var pad = Math.round(Math.max(maxX - minX, maxY - minY) * PAD);
    var x0 = Math.max(0, minX - pad), y0 = Math.max(0, minY - pad);
    var x1 = Math.min(w - 1, maxX + pad), y1 = Math.min(h - 1, maxY + pad);
    return { x: Math.round(x0 / s), y: Math.round(y0 / s), w: Math.round((x1 - x0 + 1) / s), h: Math.round((y1 - y0 + 1) / s) };
  }

  async function processImage(file, opts) {
    var bitmap = await createImageBitmap(file);
    var box = { x: 0, y: 0, w: bitmap.width, h: bitmap.height };
    var cropped = false;
    if (opts.autoCrop) {
      var found = findPiece(bitmap);
      if (found) { box = found; cropped = true; }
    }
    var scale = Math.min(1, opts.maxSide / Math.max(box.w, box.h));
    var cw = Math.max(1, Math.round(box.w * scale));
    var ch = Math.max(1, Math.round(box.h * scale));
    var c = document.createElement('canvas');
    c.width = cw; c.height = ch;
    var ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(bitmap, box.x, box.y, box.w, box.h, 0, 0, cw, ch);
    if (bitmap.close) bitmap.close();
    var blob = await new Promise(function (r) { c.toBlob(r, 'image/jpeg', opts.quality); });
    return { blob: blob, w: cw, h: ch, cropped: cropped };
  }

  /* zona în care se trag pozele: acelaşi comportament în piese şi în blog */
  function wireDrop(drop, pickBtn, input, onFiles) {
    pickBtn.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () { onFiles(input.files); input.value = ''; });
    ['dragenter', 'dragover'].forEach(function (e) {
      drop.addEventListener(e, function (ev) { ev.preventDefault(); drop.classList.add('is-over'); });
    });
    ['dragleave', 'drop'].forEach(function (e) {
      drop.addEventListener(e, function (ev) { ev.preventDefault(); drop.classList.remove('is-over'); });
    });
    drop.addEventListener('drop', function (ev) { onFiles(ev.dataTransfer.files); });
  }

  /* ─────────────── starea generală ─────────────── */
  function anyDirty() {
    return modules.some(function (m) { return m.dirty(); });
  }

  function touch() {
    modules.forEach(function (m) {
      var dot = $('#tab-' + m.id + ' .tab__dot');
      if (dot) dot.hidden = !m.dirty();
    });
    $('#save').disabled = !anyDirty();
  }

  function showView(id) {
    $$('.tab').forEach(function (t) {
      var on = t.getAttribute('data-view') === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $('#view-' + t.getAttribute('data-view')).hidden = !on;
    });
  }

  /* ─────────────── confirmarea ─────────────── */
  function row(ul, tag, cls, text) {
    var li = document.createElement('li');
    var t = document.createElement('span');
    t.className = 'tag tag--' + cls;
    t.textContent = tag;
    var s = document.createElement('span');
    s.textContent = text;
    li.appendChild(t); li.appendChild(s);
    ul.appendChild(li);
  }

  function openConfirm() {
    var bad = [];
    modules.forEach(function (m) { bad = bad.concat(m.problems()); });
    var ul = $('#changes');
    ul.textContent = '';
    $('#cf-err').hidden = true;

    if (bad.length) {
      $('#cf-title').textContent = 'Mai lipsește ceva';
      bad.slice(0, 10).forEach(function (t) { row(ul, 'de completat', 'del', t); });
      if (bad.length > 10) row(ul, 'și', 'del', 'încă ' + (bad.length - 10) + ' lucruri');
      $('#cf-go').disabled = true;
    } else {
      $('#cf-title').textContent = 'Gata de publicat';
      modules.forEach(function (m) {
        m.summary().forEach(function (c) {
          row(ul, c.tag === 'add' ? 'nou' : c.tag === 'del' ? 'șters' : 'schimbat', c.tag, c.text);
        });
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
      var uploads = [];
      var payload = {};
      modules.forEach(function (m) {
        var p = m.prepare();
        uploads = uploads.concat(p.uploads || []);
        Object.assign(payload, p.payload || {});
      });

      /* pozele noi pleacă una câte una; cele doar mutate nu mai pleacă deloc */
      var images = {};
      var fresh = uploads.filter(function (u) { return u.blob; }).length;
      var n = 0;
      for (var i = 0; i < uploads.length; i++) {
        var u = uploads[i];
        if (u.from) { images[u.path] = { from: u.from }; continue; }
        n++;
        say('Urc poza ' + n + ' din ' + fresh + '…', 'busy');
        var r = await api('/api/blob', { data: await blobToBase64(u.blob) });
        images[u.path] = r.sha;
      }

      say('Public…', 'busy');
      var res = await api('/api/publish', Object.assign(payload, {
        base: head, images: images, message: $('#cf-msg').value.trim(),
      }));
      head = res.commit;
      modules.forEach(function (m) { m.published(); });
      touch();
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
      pass = $('#gate-pass').value;
      var data = await api('/api/data');
      head = data.head;
      modules.forEach(function (m) { m.load(data); });
      $('#gate').hidden = true;
      $('#app').hidden = false;
      showView('pieces');
      touch();
    } catch (ex) {
      pass = '';
      err.textContent = ex.message;
      err.hidden = false;
    }
    btn.disabled = false;
    btn.textContent = 'Intră';
  });

  $$('.tab').forEach(function (t) {
    t.addEventListener('click', function () { showView(t.getAttribute('data-view')); });
    t.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var tabs = $$('.tab');
      var i = tabs.indexOf(t) + (e.key === 'ArrowRight' ? 1 : -1);
      var next = tabs[(i + tabs.length) % tabs.length];
      showView(next.getAttribute('data-view'));
      next.focus();
    });
  });

  $('#save').addEventListener('click', openConfirm);
  $('#cf-go').addEventListener('click', publish);
  $$('[data-close]', $('#confirm')).forEach(function (el) { el.addEventListener('click', closeConfirm); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$('#confirm').hidden) closeConfirm();
  });
  window.addEventListener('beforeunload', function (e) {
    if (anyDirty()) { e.preventDefault(); e.returnValue = ''; }
  });

  window.HJA = {
    $: $, $$: $$,
    register: function (m) { modules.push(m); },
    touch: touch, say: say, slug: slug,
    processImage: processImage, wireDrop: wireDrop,
  };
})();
