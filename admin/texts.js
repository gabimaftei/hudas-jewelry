/* ═══════════════════════════════════════════════════════════════
   Panoul Hudei — tabul „Texte"
   ───────────────────────────────────────────────────────────────
   Toate textele site-ului, pe secţiuni, plus cronologia expoziţiilor.

   GROUPS spune doar CUM se arată câmpurile: ce etichetă au, dacă sunt
   pe mai multe rânduri, dacă pot rămâne goale. Lista de texte în sine
   vine din content.js. O cheie care apare acolo dar lipseşte de aici
   nu se pierde: apare singură în secţiunea „Altele".

   Câmp: [cheie, etichetă, opţiuni] — opţiuni: 'lung' (textarea),
   'opt' (poate rămâne gol: atunci nu se mai afişează pe site),
   'ro' (doar în română).
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $ = HJA.$;

  var GROUPS = [
    { id: 'nav', title: 'Meniul', hint: 'Bara de sus și linkurile din subsol.', fields: [
      ['nav.est', 'Rândul mic de sub nume', 'opt'],
      ['nav.collection', 'Linkul spre piese'],
      ['nav.story', 'Linkul spre „Despre"'],
      ['nav.recognition', 'Linkul spre expoziții'],
      ['nav.blog', 'Linkul spre blog'],
      ['nav.contact', 'Linkul spre contact'],
    ] },
    { id: 'hero', title: 'Prezentarea de sus', hint: 'Primul lucru pe care îl vede cineva când intră pe site.', fields: [
      ['hero.eyebrow', 'Rândul mic de deasupra titlului', 'opt'],
      ['hero.title1', 'Titlul — prima parte'],
      ['hero.title2', 'Titlul — partea în italic, pe rândul al doilea', 'opt'],
      ['hero.lede', 'Textul de sub titlu', 'lung'],
      ['hero.ctaPrimary', 'Butonul principal'],
      ['hero.ctaSecondary', 'Al doilea buton'],
      ['hero.caption', 'Sub portret, lângă nume', 'opt'],
    ] },
    { id: 'collection', title: 'Piesele', hint: 'Textele din jurul galeriei. Piesele în sine se schimbă din tabul „Piese".', fields: [
      ['collection.eyebrow', 'Rândul mic de deasupra titlului', 'opt'],
      ['collection.title', 'Titlul'],
      ['collection.lede', 'Textul de sub titlu', 'lung opt'],
      ['collection.empty', 'Când un filtru nu are nicio piesă'],
      ['collection.note', 'Nota de sub galerie', 'lung opt'],
      ['collection.noteLink', 'Linkul de după notă (duce la contact)', 'opt'],
    ] },
    { id: 'story', title: 'Despre Huda', hint: 'Un paragraf lăsat gol nu mai apare pe site.', fields: [
      ['story.eyebrow', 'Rândul mic de deasupra titlului', 'opt'],
      ['story.title', 'Titlul'],
      ['story.p1', 'Primul paragraf', 'lung'],
      ['story.p2', 'Al doilea paragraf', 'lung opt'],
      ['story.p3', 'Al treilea paragraf', 'lung opt'],
      ['story.quote', 'Citatul', 'lung opt'],
      ['story.cite', 'Sursa citatului', 'opt'],
    ] },
    { id: 'recognition', title: 'Expoziții și premii', timeline: true,
      hint: 'Titlul secțiunii și, mai jos, lista cu expozițiile și premiile.', fields: [
      ['recognition.eyebrow', 'Rândul mic de deasupra titlului', 'opt'],
      ['recognition.title', 'Titlul'],
      ['recognition.cap', 'Textul de sub fotografia cu diploma', 'lung opt'],
    ] },
    { id: 'blog', title: 'Blogul', hint: 'Textele din jurul articolelor. Articolele se scriu din tabul „Blog".', fields: [
      ['blog.eyebrow', 'Rândul mic de deasupra titlului', 'opt'],
      ['blog.title', 'Titlul'],
      ['blog.lede', 'Textul de sub titlu', 'lung opt'],
      ['blog.all', 'Butonul spre toate articolele'],
      ['blog.back', 'Linkul „înapoi" din articol'],
      ['blog.empty', 'Când nu e încă niciun articol'],
      ['blog.onlyRo', 'Nota pentru articolele netraduse', 'lung'],
    ] },
    { id: 'contact', title: 'Contact', fields: [
      ['contact.eyebrow', 'Rândul mic de deasupra titlului', 'opt'],
      ['contact.title', 'Titlul'],
      ['contact.lede', 'Textul', 'lung'],
      ['contact.dm', 'Butonul de mesaj'],
      ['contact.profile', 'Butonul spre profil'],
      ['contact.small', 'Rândul mic de jos', 'opt'],
    ] },
    { id: 'footer', title: 'Subsolul', fields: [
      ['footer.tag', 'Rândul de sub nume', 'opt'],
    ] },
    { id: 'meta', title: 'Google și previzualizări',
      hint: 'Descrierea pe care o arată Google sub numele site-ului și previzualizarea linkului pe WhatsApp sau Instagram. Două-trei propoziții.', fields: [
      ['meta.description', 'Descrierea site-ului', 'lung ro'],
    ] },
  ];

  var content = { ro: {}, en: {} };
  var timeline = [];
  var baseC = '';
  var baseT = '';
  var groups = [];
  var current = 0;
  var bound = false;

  function touch() { HJA.touch(); drawList(); }
  function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function opt(f, name) { return (' ' + (f[2] || '') + ' ').indexOf(' ' + name + ' ') !== -1; }

  /* grupurile efective: doar cheile care există, plus „Altele" pentru restul */
  function buildGroups() {
    var known = {};
    groups = GROUPS.map(function (g) {
      var fields = g.fields.filter(function (f) { known[f[0]] = true; return has(content.ro, f[0]); });
      return { id: g.id, title: g.title, hint: g.hint, timeline: g.timeline, fields: fields };
    }).filter(function (g) { return g.fields.length || g.timeline; });
    var rest = Object.keys(content.ro).filter(function (k) { return !known[k]; });
    if (rest.length) {
      groups.push({ id: 'other', title: 'Altele', hint: 'Texte adăugate recent, care nu au încă o etichetă proprie.',
        fields: rest.map(function (k) { return [k, k, 'opt']; }) });
    }
  }

  function changed(g) {
    var before = JSON.parse(baseC);
    var n = g.fields.filter(function (f) {
      return content.ro[f[0]] !== before.ro[f[0]] || (content.en[f[0]] || '') !== (before.en[f[0]] || '');
    }).length;
    if (g.timeline && JSON.stringify(timeline) !== baseT) n++;
    return n;
  }

  function drawList() {
    var ol = $('#tlist');
    ol.textContent = '';
    groups.forEach(function (g, i) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pitem' + (i === current ? ' is-on' : '');
      var name = document.createElement('span');
      name.className = 'pitem__name';
      name.textContent = g.title;
      b.appendChild(name);
      if (changed(g)) {
        var f = document.createElement('span');
        f.className = 'pitem__meta'; f.textContent = 'schimbat';
        b.appendChild(f);
      }
      b.addEventListener('click', function () { select(i); });
      li.appendChild(b);
      ol.appendChild(li);
    });
  }

  function field(label, value, long, onInput, placeholder, maxLength) {
    var wrap = document.createElement('label');
    wrap.className = 'field';
    var l = document.createElement('span');
    l.className = 'field__label';
    l.textContent = label;
    var input = document.createElement(long ? 'textarea' : 'input');
    if (!long) input.type = 'text';
    else input.rows = 4;
    input.maxLength = maxLength || 2000;
    input.value = value || '';
    if (placeholder) input.placeholder = placeholder;
    input.addEventListener('input', function () { onInput(input.value); });
    wrap.appendChild(l); wrap.appendChild(input);
    return wrap;
  }

  function select(i) {
    current = i;
    var g = groups[i];
    $('#t-title').textContent = g.title;
    $('#t-hint').textContent = g.hint || '';
    $('#t-hint').hidden = !g.hint;
    var box = $('#t-fields');
    box.textContent = '';

    if (g.fields.length) {
      var head = document.createElement('div');
      head.className = 'pair pair__head';
      head.innerHTML = '<span>Română</span><span>English</span>';
      box.appendChild(head);
    }
    g.fields.forEach(function (f) {
      var key = f[0], long = opt(f, 'lung'), roOnly = opt(f, 'ro');
      var pair = document.createElement('div');
      pair.className = 'pair' + (roOnly ? ' pair--single' : '');
      var label = f[1] + (opt(f, 'opt') ? '' : ' *');
      pair.appendChild(field(label, content.ro[key], long, function (v) { content.ro[key] = v; touch(); }));
      if (!roOnly) {
        pair.appendChild(field(f[1], content.en[key], long, function (v) { content.en[key] = v; touch(); },
          'gol = ca în română'));
      }
      box.appendChild(pair);
    });
    var note = document.createElement('p');
    note.className = 'field__note';
    note.textContent = '* obligatoriu în română. Engleza lăsată goală afișează textul în română.';
    if (g.fields.length) box.appendChild(note);

    $('#tl-block').hidden = !g.timeline;
    if (g.timeline) drawTimeline();
    drawList();
  }

  /* ─────────────── cronologia ─────────────── */
  function drawTimeline() {
    var ol = $('#tl-list');
    ol.textContent = '';
    timeline.forEach(function (e, i) {
      var li = document.createElement('li');
      li.className = 'tl__item';

      var head = document.createElement('div');
      head.className = 'tl__head';
      var num = document.createElement('span');
      num.className = 'tl__num';
      num.textContent = (i + 1) + '. ' + (e.what.ro || 'intrare nouă');
      head.appendChild(num);
      var tools = document.createElement('div');
      tools.className = 'tl__tools';
      [['▲', 'Mută mai sus', i === 0, function () { moveEntry(i, -1); }],
       ['▼', 'Mută mai jos', i === timeline.length - 1, function () { moveEntry(i, 1); }],
       ['✕', 'Scoate intrarea', false, function () { dropEntry(i); }]].forEach(function (b, k) {
        var btn = document.createElement('button');
        btn.type = 'button'; btn.textContent = b[0]; btn.title = b[1];
        btn.setAttribute('aria-label', b[1]);
        btn.disabled = b[2];
        if (k === 2) btn.className = 'is-del';
        btn.addEventListener('click', b[3]);
        tools.appendChild(btn);
      });
      head.appendChild(tools);
      li.appendChild(head);

      [['when', 'Când *', 'ex. Oct 2026', 60], ['what', 'Ce *', 'ex. Romanian Jewelry Week 2026', 200],
       ['where', 'Unde', 'ex. Biblioteca Națională, București', 200]].forEach(function (p) {
        var pair = document.createElement('div');
        pair.className = 'pair';
        pair.appendChild(field(p[1] + ' — română', e[p[0]].ro, false, function (v) {
          e[p[0]].ro = v;
          if (p[0] === 'what') num.textContent = (i + 1) + '. ' + (v || 'intrare nouă');
          touch();
        }, p[2], p[3]));
        pair.appendChild(field(p[1].replace(' *', '') + ' — engleză', e[p[0]].en, false, function (v) {
          e[p[0]].en = v; touch();
        }, 'gol = ca în română', p[3]));
        li.appendChild(pair);
      });
      ol.appendChild(li);
    });
  }

  function moveEntry(i, d) {
    var j = i + d;
    if (j < 0 || j >= timeline.length) return;
    var t = timeline[i]; timeline[i] = timeline[j]; timeline[j] = t;
    drawTimeline(); touch();
  }

  function dropEntry(i) {
    var name = timeline[i].what.ro || 'intrarea asta';
    if (!confirm('Scoți „' + name + '" din cronologie?')) return;
    timeline.splice(i, 1);
    drawTimeline(); touch();
  }

  function bind() {
    if (bound) return;
    bound = true;
    $('#tl-add').addEventListener('click', function () {
      timeline.push({ when: { ro: '', en: '' }, what: { ro: '', en: '' }, where: { ro: '', en: '' } });
      drawTimeline(); touch();
      var items = document.querySelectorAll('#tl-list .tl__item');
      var input = items[items.length - 1].querySelector('input');
      input.focus();
      input.scrollIntoView({ block: 'center' });
    });
  }

  /* ─────────────── modulul ─────────────── */
  HJA.register({
    id: 'texts',

    load: function (data) {
      content = JSON.parse(JSON.stringify(data.content));
      timeline = JSON.parse(JSON.stringify(data.timeline));
      baseC = JSON.stringify(content);
      baseT = JSON.stringify(timeline);
      buildGroups();
      bind();
      select(0);
    },

    dirty: function () {
      return JSON.stringify(content) !== baseC || JSON.stringify(timeline) !== baseT;
    },

    problems: function () {
      var bad = [];
      groups.forEach(function (g) {
        g.fields.forEach(function (f) {
          if (!opt(f, 'opt') && !(content.ro[f[0]] || '').trim()) {
            bad.push('Textul „' + f[1] + '" din „' + g.title + '" e gol.');
          }
        });
      });
      timeline.forEach(function (e, i) {
        if (!(e.when.ro || '').trim() || !(e.what.ro || '').trim()) {
          bad.push('Intrarea ' + (i + 1) + ' din cronologie n-are completat „Când" sau „Ce".');
        }
      });
      return bad;
    },

    summary: function () {
      var out = [];
      var before = JSON.parse(baseC);
      groups.forEach(function (g) {
        var n = g.fields.filter(function (f) {
          return content.ro[f[0]] !== before.ro[f[0]] || (content.en[f[0]] || '') !== (before.en[f[0]] || '');
        }).length;
        if (n) out.push({ tag: 'edit', text: g.title + ' — ' + (n === 1 ? 'un text' : n + ' texte') });
      });
      if (JSON.stringify(timeline) !== baseT) {
        var old = JSON.parse(baseT).length, now = timeline.length;
        out.push({ tag: 'edit', text: 'Cronologia expozițiilor — ' + (now > old
          ? (now - old === 1 ? 'o intrare nouă' : (now - old) + ' intrări noi')
          : now < old ? (old - now === 1 ? 'o intrare scoasă' : (old - now) + ' intrări scoase') : 'modificată') });
      }
      return out;
    },

    prepare: function () {
      return { uploads: [], payload: { content: content, timeline: timeline } };
    },

    published: function () {
      baseC = JSON.stringify(content);
      baseT = JSON.stringify(timeline);
      drawList();
    },
  });
})();
