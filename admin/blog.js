/* ═══════════════════════════════════════════════════════════════
   Panoul Hudei — tabul „Blog"
   ───────────────────────────────────────────────────────────────
   Articole cu titlu, dată, text şi poze. Româna e obligatorie,
   engleza opţională: un articol netradus apare în engleză cu textul
   românesc şi o notă. Prima poză e coperta.

   Pozele NU se taie (sunt din expoziţii, din atelier, cu oameni) —
   doar se micşorează la cel mult 1600px şi se comprimă.
   Fiecare articol devine o pagină a lui, /blog/<id>/, generată pe
   server ca HTML static — vezi server/render.js.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $ = HJA.$;

  var posts = [];
  var current = null;
  var baseline = '';
  var tokenSeq = 0;
  var bound = false;

  function touch() { HJA.touch(); }

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function validDate(s) {
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(s || '')) return false;
    var d = new Date(s + 'T00:00:00Z');
    return !isNaN(d) && d.toISOString().slice(0, 10) === s;
  }

  var MONTHS = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  function shortDate(s) {
    if (!validDate(s)) return 'fără dată';
    var p = s.split('-');
    return Number(p[2]) + ' ' + MONTHS[Number(p[1]) - 1] + ' ' + p[0];
  }

  function sorted() {
    return posts.slice().sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
  }

  function snapshot() {
    return JSON.stringify(posts.map(function (p) {
      return {
        id: p.id, date: p.date, ro: p.ro, en: p.en,
        shots: p.shots.map(function (s) { return s.kind === 'have' ? s.file : 'nou:' + s.token; }),
      };
    }));
  }

  function freeId(base, exceptFor) {
    var id = base, n = 2;
    var taken = function (v) { return posts.some(function (p) { return p !== exceptFor && p.id === v; }); };
    while (taken(id)) id = base + '-' + (n++);
    return id;
  }

  /* ─────────────── lista ─────────────── */
  function drawList() {
    var ol = $('#post-list');
    ol.textContent = '';
    sorted().forEach(function (p) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pitem' + (p === current ? ' is-on' : '');
      var im = document.createElement('img');
      im.className = 'pitem__thumb pitem__thumb--cover';
      im.alt = '';
      if (p.shots[0]) im.src = p.shots[0].url;
      var text = document.createElement('span');
      text.className = 'pitem__text';
      var name = document.createElement('span');
      name.className = 'pitem__name';
      name.textContent = p.ro.title || '(fără titlu)';
      var meta = document.createElement('span');
      meta.className = 'pitem__meta';
      meta.textContent = shortDate(p.date) + (p.fresh ? ' · nepublicat' : '');
      text.appendChild(name); text.appendChild(meta);
      b.appendChild(im); b.appendChild(text);
      b.addEventListener('click', function () { select(p); });
      li.appendChild(b);
      ol.appendChild(li);
    });
  }

  /* ─────────────── editorul ─────────────── */
  function select(p) {
    current = p || null;
    $('#post-empty').hidden = !!current;
    $('#post-body').hidden = !current;
    if (!current) { drawList(); return; }
    $('#post-title').textContent = current.ro.title || '(fără titlu)';
    $('#post-date').value = current.date;
    $('#post-ro-title').value = current.ro.title;
    $('#post-en-title').value = current.en.title;
    $('#post-ro-body').value = current.ro.body;
    $('#post-en-body').value = current.en.body;
    var view = $('#post-view');
    view.hidden = !!current.fresh;
    view.href = '/blog/' + current.id + '/';
    drawShots();
    drawList();
  }

  async function addFiles(files) {
    var p = current;
    if (!p) return;
    var list = Array.prototype.slice.call(files).filter(function (f) { return /^image\//.test(f.type); });
    if (!list.length) return;
    if (p.shots.length + list.length > 30) {
      HJA.say('Un articol poate avea cel mult 30 de poze.', 'err');
      list = list.slice(0, Math.max(0, 30 - p.shots.length));
    }
    HJA.say('Pregătesc ' + list.length + (list.length === 1 ? ' poză…' : ' poze…'), 'busy');
    for (var i = 0; i < list.length; i++) {
      try {
        var out = await HJA.processImage(list[i], { autoCrop: false, maxSide: 1600, quality: 0.84 });
        p.shots.push({
          kind: 'new', token: String(++tokenSeq), blob: out.blob, url: URL.createObjectURL(out.blob),
          w: out.w, h: out.h, bytes: out.blob.size,
        });
      } catch (e) {
        HJA.say('N-am putut citi ' + list[i].name, 'err');
      }
    }
    HJA.say('');
    if (p === current) drawShots();
    drawList(); touch();
  }

  function drawShots() {
    var p = current;
    var ul = $('#post-shots');
    ul.textContent = '';
    if (!p) return;
    p.shots.forEach(function (s, i) {
      var li = document.createElement('li');
      li.className = 'shot shot--photo';
      var fr = document.createElement('div');
      fr.className = 'shot__frame';
      var im = document.createElement('img');
      im.src = s.url; im.alt = '';
      fr.appendChild(im);
      var badge = document.createElement('span');
      badge.className = 'shot__badge' + (s.kind === 'new' ? ' shot__new' : '');
      badge.textContent = i === 0 ? 'Copertă' : String(i + 1);
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
      size.textContent = s.kind === 'new' ? Math.round(s.bytes / 1024) + ' KB' : 'pe site';
      li.appendChild(size);
      ul.appendChild(li);
    });
  }

  function moveShot(i, d) {
    var p = current, j = i + d;
    if (j < 0 || j >= p.shots.length) return;
    var t = p.shots[i]; p.shots[i] = p.shots[j]; p.shots[j] = t;
    drawShots(); drawList(); touch();
  }

  function dropShot(i) {
    var s = current.shots.splice(i, 1)[0];
    if (s.kind === 'new') URL.revokeObjectURL(s.url);
    drawShots(); drawList(); touch();
  }

  function bind() {
    if (bound) return;
    bound = true;

    function onText(sel, lang, fieldName) {
      $(sel).addEventListener('input', function () {
        if (!current) return;
        current[lang][fieldName] = this.value;
        if (lang === 'ro' && fieldName === 'title') {
          /* cât articolul e nepublicat, adresa lui urmează titlul;
             după publicare rămâne fixă, ca linkurile trimise să nu se strice */
          if (current.fresh) current.id = freeId(HJA.slug(this.value, 'articol'), current);
          $('#post-title').textContent = this.value || '(fără titlu)';
          drawList();
        }
        touch();
      });
    }
    onText('#post-ro-title', 'ro', 'title');
    onText('#post-en-title', 'en', 'title');
    onText('#post-ro-body', 'ro', 'body');
    onText('#post-en-body', 'en', 'body');

    $('#post-date').addEventListener('input', function () {
      if (!current) return;
      current.date = this.value;
      drawList(); touch();
    });

    $('#post-add').addEventListener('click', function () {
      var p = {
        id: freeId('articol-nou'), fresh: true, date: today(),
        ro: { title: '', body: '' }, en: { title: '', body: '' }, shots: [],
      };
      posts.push(p);
      select(p);
      touch();
      $('#post-ro-title').focus();
    });

    $('#post-del').addEventListener('click', function () {
      if (!current) return;
      var msg = current.fresh
        ? 'Renunți la articolul ăsta?'
        : 'Ștergi articolul „' + (current.ro.title || 'fără titlu') + '"?\n\nDispare de pe site la următoarea publicare, cu pozele lui. Linkurile trimise către el nu vor mai merge.';
      if (!confirm(msg)) return;
      posts.splice(posts.indexOf(current), 1);
      select(sorted()[0] || null);
      touch();
    });

    HJA.wireDrop($('#post-drop'), $('#post-pick'), $('#post-file'), addFiles);
  }

  /* ─────────────── modulul ─────────────── */
  HJA.register({
    id: 'blog',

    load: function (data) {
      posts = data.posts.map(function (p) {
        return {
          id: p.id, fresh: false, date: p.date,
          ro: { title: p.ro.title, body: p.ro.body },
          en: { title: (p.en && p.en.title) || '', body: (p.en && p.en.body) || '' },
          shots: p.photos.map(function (ph, i) {
            var file = 'assets/blog/' + p.id + '/' + (i + 1) + '.jpg';
            return { kind: 'have', file: file, url: '/' + file, w: ph.w, h: ph.h };
          }),
        };
      });
      baseline = snapshot();
      bind();
      select(sorted()[0] || null);
    },

    dirty: function () { return snapshot() !== baseline; },

    problems: function () {
      var bad = [];
      posts.forEach(function (p) {
        var n = p.ro.title || 'articolul fără titlu';
        if (!p.ro.title.trim()) bad.push('Un articol n-are titlu în română.');
        if (!p.shots.length) bad.push('Articolul „' + n + '" n-are nicio poză — prima e coperta.');
        if (!validDate(p.date)) bad.push('Articolul „' + n + '" n-are o dată validă.');
      });
      return bad;
    },

    summary: function () {
      var before = JSON.parse(baseline), byId = {}, out = [];
      before.forEach(function (p) { byId[p.id] = p; });
      posts.forEach(function (p) {
        var old = byId[p.id], name = p.ro.title || '(fără titlu)';
        if (!old) { out.push({ tag: 'add', text: 'Articol nou: ' + name }); return; }
        var shots = p.shots.map(function (s) { return s.kind === 'have' ? s.file : 'nou:' + s.token; });
        var parts = [];
        if (JSON.stringify([p.ro, p.en]) !== JSON.stringify([old.ro, old.en])) parts.push('text');
        if (p.date !== old.date) parts.push('data');
        if (JSON.stringify(shots) !== JSON.stringify(old.shots)) parts.push('poze');
        if (parts.length) out.push({ tag: 'edit', text: 'Articolul ' + name + ' — ' + parts.join(', ') });
      });
      var ids = posts.map(function (p) { return p.id; });
      before.forEach(function (p) {
        if (ids.indexOf(p.id) === -1) out.push({ tag: 'del', text: 'Articol șters: ' + (p.ro.title || p.id) });
      });
      return out;
    },

    prepare: function () {
      var uploads = [];
      var out = sorted().map(function (p) {
        p.shots.forEach(function (s, n) {
          var target = 'assets/blog/' + p.id + '/' + (n + 1) + '.jpg';
          if (s.kind === 'new') uploads.push({ path: target, blob: s.blob });
          else if (s.file !== target) uploads.push({ path: target, from: s.file });
        });
        return {
          id: p.id, date: p.date,
          photos: p.shots.map(function (s) { return { w: s.w, h: s.h }; }),
          ro: { title: p.ro.title.trim(), body: p.ro.body },
          en: { title: p.en.title.trim(), body: p.en.body },
        };
      });
      return { uploads: uploads, payload: { posts: out } };
    },

    published: function () {
      posts.forEach(function (p) {
        p.fresh = false;
        p.shots = p.shots.map(function (s, n) {
          return { kind: 'have', file: 'assets/blog/' + p.id + '/' + (n + 1) + '.jpg', url: s.url, w: s.w, h: s.h };
        });
      });
      baseline = snapshot();
      select(current);
    },
  });
})();
