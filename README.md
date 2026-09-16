# HUDA'S JEWELRY — website

Site-ul bijuteriilor Hudei Mahdi, [@hudasjewelry](https://www.instagram.com/hudasjewelry/):
pagina principală cu piesele, un blog și un panou de administrare la `/admin`.
HTML, CSS și JavaScript simplu, fără build și fără dependențe. Singurul cod de
server e cel al panoului.

```
index.html              ← pagina principală (părți din ea le regenerează panoul)
blog/                   ← GENERAT de panou: lista articolelor şi câte o pagină pe articol
admin/                  ← panoul: core.js + câte un modul pe tab (pieces, texts, blog)
assets/
  css/styles.css        ← tot aspectul
  js/content.js         ← GENERAT: textele site-ului şi cronologia expoziţiilor
  js/products.js        ← GENERAT: piesele şi lista de expoziţii
  js/common.js          ← limba, meniul — comune tuturor paginilor
  js/app.js             ← galeria şi fereastra piesei (doar pe pagina principală)
  images/               ← pozele pieselor
  blog/<articol>/       ← pozele articolelor
data/posts.json         ← GENERAT: articolele (nu se serveşte pe site)
server/                 ← rutele panoului: api.js, render.js (paginile), github.js
worker.js               ← punctul de intrare al Worker-ului Cloudflare
tools/                  ← discul de rotire şi pregătirea cadrelor
```

**Fişierele marcate GENERAT se rescriu la fiecare salvare din panou.** Orice
modificare făcută de mână în ele se pierde. Pentru conţinut, foloseşte panoul;
pentru structură, vezi secţiunea 8.

---

## 1. Ce trebuie verificat înainte de publicare

Site-ul e construit **din capturi de ecran de pe Instagram**, nu din fișe de produs.
Trei lucruri au fost scrise după fotografii și au nevoie de confirmarea Hudei:

**a) Materialele și pietrele.** În `products.js`, fiecare piesă are un câmp
`materials`. Ele descriu ce se *vede* — „piatră verde cu incluziuni roz”, „metal
auriu” — și evită intenționat să numească mineralul sau puritatea metalului.
Nimic nu spune „argint 925”, „placat cu aur” sau numele vreunei pietre, pentru că
nimic din materialul disponibil nu confirma asta. **Huda trebuie să le
înlocuiască cu denumirile reale.** Pentru bijuterii contează: cine are pielea
sensibilă chiar filtrează după metal.

**b) Numele pieselor.** Sunt descriptive („Inel cupolă”, „Colier cu trei pietre”),
puse ca să se poată vorbi despre ele. Dacă piesele au nume adevărate, ele trebuie
folosite — schimbă `name` în `products.js`.

**c) Anii din secțiunea „Expoziții”.** Instagram nu arată anul la postările mai
noi de douăsprezece luni, așa că cele două intrări din martie sunt marcate 2026
prin deducție. Merită verificate.

Textul din „Despre Huda” e scris din ce arătau postările — Irak/România,
Assamblage, München, Ljubljana, București. E corect, dar e sărac: nu se știe
de când lucrează, ce a făcut înainte, de ce a început. Un paragraf scris de ea
ar schimba secțiunea complet.

---

## 2. Fotografiile

Toate cele 18 imagini sunt decupate din capturi de ecran de pe Instagram. Din
fiecare captură s-a păstrat doar bijuteria: bara de stare a telefonului, antetul
Instagram, butonul de Follow, bara de like-uri și siglele suprapuse de
organizatori (Romanian Jewelry Week, Assamblage, Handwerk & Design) au fost
tăiate. Marginea fiecărei piese a fost găsită automat, pe fundalul alb.

**Sunt capturi de ecran, nu originale.** Arată bine la dimensiunea la care le
pune site-ul, dar au trecut printr-o captură de telefon și o recompresie.
**Înlocuirea lor cu fotografiile originale e cel mai mare salt de calitate
disponibil și nu cere nicio modificare de cod** — se suprascriu fișierele,
păstrând aceleași nume.

Fotografiile pieselor stau pe alb, iar fundalul paginii e un alb cald: de aceea
decupajele par așezate direct în pagină, fără chenar. **Dacă vin fotografii pe
alt fundal, efectul ăsta dispare** și plăcile galeriei vor arăta ca niște cutii.

### Cum se adaugă fotografii

Se numesc `<id>-<număr>.jpg` și se pun în `assets/images/`, apoi se ridică
`photos` pentru piesa aceea în `products.js`. `-1.jpg` e cea de pe card, deci
ar trebui să fie cea mai bună vedere a piesei întregi.

Doar *Inel sculptural* are trei fotografii; restul au câte una. Dacă apar și
alte unghiuri, galeria din fereastra piesei le arată automat cu miniaturi.

Dimensiune bună: în jur de 1200–1400 px pe latura lungă, sub ~150 KB.

---

## 3. Cum se adaugă sau se modifică o piesă

**În mod normal, din panoul de la `/admin`** — vezi secțiunea 8. Ce urmează e
pentru cazul în care vrei să umbli direct în fișier.

Se deschide `assets/js/products.js` și se copiază un bloc. Fișierul e generat:
formatul trebuie păstrat exact (`const PRODUCTS = <JSON>;`), fiindcă serverul îl
citește la fiecare salvare.

```js
{
  id: 'piesa-noua',       // fără spații — e și prefixul fotografiilor
  photos: 1,
  kind: 'inel',           // inel | colier | pandantiv | cercei | bratara
  sold: false,
  exhibited: null,        // 'rjw26' | 'sijw' | 'handwerk' | null
  ro: { name: '…', tagline: '…', description: '…', materials: '…' },
  en: { name: '…', tagline: '…', description: '…', materials: '…' },
}
```

`kind` alimentează filtrele de deasupra galeriei — un tip nou apare acolo singur,
dar trebuie să primească și o traducere (`f.<kind>`) în `app.js`.

Când o piesă pleacă, `sold: false` devine `sold: true`. Rămâne pe site ca
portofoliu, cu mențiunea „Piesă plecată”, iar butonul de comandă se stinge.

Titlul secțiunii nu conține un număr, intenționat: „Treisprezece piese" ar fi
rămas în urmă la prima piesă adăugată din panou.

### Rotirea din fotografii

O piesă poate avea, pe lângă fotografii, o **rotire**: 36 de cadre făcute din
10 în 10 grade, pe care vizitatorul le derulează trăgând cu degetul. Nu e 3D —
sunt fotografii, de asta argintul rămâne argint.

Cadrele stau în `assets/spins/<id>/01.jpg … 36.jpg`, iar piesa primeşte
`"spin": 36` în catalog. Dacă se roteşte în sensul greşit, se adaugă
`"spinReverse": true` — se întâmplă când discul a fost rotit invers la
fotografiere.

Cum se fotografiază, cu ce ai prin casă: [FOTOGRAFIERE.md](FOTOGRAFIERE.md).
Discul de printat, care ţine locul platformei rotative, e în
`tools/disc-rotire.png` (regenerabil cu `tools/disc-rotire.py`).

Cadrele se încarcă întreţesut — întâi din şase în şase, apoi se îndesesc —
deci piesa se poate roti după prima jumătate de secundă, chiar dacă restul
mai vin din urmă. Se încarcă doar când vizitatorul deschide piesa şi apasă
pe rotire, niciodată în galerie.

**Rotirea nu se editează din panou**, dar panoul o duce mai departe: fără
asta, prima salvare a Hudei ar şterge câmpul, fiindcă el rescrie catalogul
întreg.

---

## 4. Cum se comandă

**O apăsare.** Butonul *Întreabă de piesa asta* deschide direct conversația cu
`@hudasjewelry` (`https://ig.me/m/hudasjewelry`). Nu e coș, nu e checkout, nu se
procesează plăți, nu se colectează nimic.

Instagram nu permite pre-completarea textului unui mesaj dintr-un link, așa că
site-ul nu poate strecura numele piesei în conversație. În schimb, rândul de sub
buton îi spune cumpărătorului ce să scrie:

> Se deschide conversația cu @hudasjewelry. Spune-i că e vorba de „Inel cupolă”
> și îți răspunde cu prețul și cu detaliile.

Prețul, măsura și livrarea se stabilesc în conversație. Nu există prețuri pe site
— a fost o alegere, nu o scăpare: nu e nimic de ținut la zi.

### Linkuri către o piesă anume

Fiecare piesă are adresa ei: `…/#piesa-inel-sculptural`. Deschizi piesa, copiezi
adresa din bara browserului și o trimiți — celălalt vede exact piesa aia. E util
tocmai în conversațiile de pe Instagram.

---

## 5. Cum se vede local

```bash
cd ~/Desktop/HudasJewlery && python3 -m http.server 4322
```

Apoi <http://localhost:4322>.

Folosește asta, nu dublu-click pe `index.html`: deschis ca pagină `file://`,
Content-Security-Policy se poartă altfel și unele lucruri par stricate degeaba.

---

## 6. E online

**Live la <https://hudas-jewelry.mafteigabriele.workers.dev/>**

Găzduit gratuit pe **Cloudflare Workers**, legat de
<https://github.com/gabimaftei/hudas-jewelry> (branch-ul `main`).

Site-ul e static: fișierele din repo se servesc ca atare, de pe CDN, fără
build. Worker-ul nu se atinge de ele — primește doar cererile care nu
nimeresc un fișier, adică exclusiv `/api/publish`, salvările din panou.
Configurarea e în `wrangler.jsonc`, punctul de intrare în `worker.js`, iar
`.assetsignore` ține codul și documentația în afara domeniului public.

> **De schimbat când cumperi domeniul.** Cele trei adrese absolute din
> `index.html` — `og:image`, `og:url`, `canonical` — arată către adresa
> `workers.dev` de mai sus. Dacă rămân aşa după ce legi domeniul, site-ul
> merge, dar previzualizarea linkului pe Instagram şi WhatsApp arată adresa
> veche.

### Cum se publică o modificare

Orice ajunge pe `main` se vede online cam într-un minut:

```bash
git add -A && git commit -m "Adaugă o piesă nouă" && git push
```

Cele trei adrese absolute din `index.html` — `og:image`, `og:url` și
`<link rel="canonical">` — arată deja către adresa asta. **Dacă repo-ul se
redenumește vreodată, ele trebuie schimbate**, altfel site-ul merge, dar
previzualizarea linkului pe Instagram și WhatsApp nu.

Un domeniu propriu (`hudasjewelry.ro`, ~10–15 €/an) ar arăta mult mai bine în bio.
Se adaugă patru înregistrări `A` către `185.199.108.153`, `.109.153`, `.110.153`,
`.111.153` și un `CNAME` pentru `www`, apoi se trece domeniul la Settings → Pages
și se bifează **Enforce HTTPS**. Vechea adresă `github.io` redirecționează, deci
nu se strică nimic.

### Când modifici ceva

CSS-ul și JS-ul sunt legate cu un marcaj de versiune, `?v=1`. **Dacă schimbi
`products.js`, `app.js` sau `styles.css`, ridică numărul în `index.html`**
(`?v=2` ș.a.m.d.). Fără asta, cine a intrat înainte poate vedea ore bune
versiunea veche, din cache.

---

## 7. Cum e construit și de ce e sigur

Nu prea are ce să meargă prost: fără server, fără bază de date, fără formulare,
fără conturi, fără plăți, fără cookie-uri, fără analytics. Nu se colectează nimic
de la nimeni. În plus:

- **Nicio cerere către alt server.** Fonturile sunt descărcate și servite din
  `assets/fonts/`, nu luate de la Google. Nicio informație despre vizitator nu
  pleacă nicăieri, ceea ce ocolește și problemele de GDPR pe care le-a creat
  folosirea directă a Google Fonts. Licențele sunt în `assets/fonts/OFL.txt`.
  Verificat: la o încărcare completă, toate cele 95 de cereri merg către site.
- **Content-Security-Policy** în `<head>` restrânge totul la `'self'`, iar
  `connect-src 'none'` interzice orice cerere de rețea din JavaScript. Dacă
  cineva ar reuși vreodată să injecteze un script sau un pixel de urmărire,
  browserul ar refuza să-l ruleze.
- **Niciun stil scris din JavaScript.** `style-src 'self'` ar bloca orice valoare
  pusă în atributul `style` dintr-un script, așa că tot ce e dinamic (meniul,
  filtrele, blocarea scroll-ului) se face prin clase definite în `styles.css`.
- **Fiecare link extern** are `rel="noopener noreferrer"`.
- **Accesibilitate**: textul trece de WCAG AA (cea mai slabă pereche e 5.28:1,
  față de 4.5 cerut), țintele de atins au cel puțin 44px, fereastra piesei ține
  focusul înăuntru, se închide cu Escape și face restul paginii inertă cât e
  deschisă, iar animațiile se opresc la `prefers-reduced-motion`.

**Paginile de blog sunt HTML static**, generat de server la fiecare salvare, nu
construit din JavaScript. Previzualizarea unui link pe WhatsApp sau Instagram nu
rulează JavaScript, iar aşa arată poza şi titlul articolului.

**Un compromis de știut:** galeria de piese e construită din JavaScript, deci cu
JS oprit pagina se vede, dar fără piese. Motoarele de căutare rulează JS, așa că nu e o
problemă pentru Google — dar e bine de știut.

---

## 8. Panoul de la /admin

Huda schimbă singură tot conţinutul site-ului, la `adresa-site-ului/admin`. Intră
cu o parolă — n-are cont de GitHub, nu vede niciun commit. Ghidul scris pentru ea
e în [GHID.md](GHID.md).

Panoul are trei taburi:

| Tab | Ce schimbă |
|---|---|
| **Piese** | piesele, pozele lor (tăiate automat pe fundal alb), lista de expoziţii |
| **Texte** | toate textele site-ului, pe secţiuni, plus cronologia „Unde a fost văzută munca ei" |
| **Blog** | articole cu titlu, dată, text şi poze; româna obligatorie, engleza opţională |

### Cum funcționează

```
                    /api/data     citeşte starea DIN REPO
  /admin  ─parola─▶ /api/blob     urcă o poză, una câte una     ─token GitHub─▶  repo
 (browser)          /api/publish  un singur commit cu tot               │
                     (worker.js → server/api.js)                         ▼
                                                                redeploy automat
```

Tokenul de GitHub stă **numai** pe server, ca secret. Panoul din browser trimite
doar parola şi conţinutul.

**Panoul citeşte datele din repo, nu de pe site.** Dacă le-ar citi de pe site, o
reîncărcare făcută înainte să se termine deploy-ul — sau o versiune rămasă în
cache — ar porni de la datele vechi, iar următoarea salvare ar şterge modificarea
de dinainte.

**O salvare nu poate suprascrie alta.** Panoul trimite commit-ul de la care a
pornit. Dacă între timp s-a publicat altceva (de exemplu dintr-un alt tab),
serverul refuză cu 409 şi un mesaj clar, în loc să scrie peste. Actualizarea
ramurii nu e forţată nici ea.

**Pozele pleacă una câte una**, prin `/api/blob`, iar publicarea le referă doar
prin amprentă. Nicio cerere nu devine destul de mare cât să atingă limita de
procesor a planului gratuit. O poză doar mutată (reordonată) nu se mai urcă deloc:
serverul refoloseşte fişierul existent din repo.

### Ce generează serverul la fiecare salvare

- `assets/js/products.js`, `assets/js/content.js`, `data/posts.json`
- în `index.html`: textul românesc din fiecare element cu `data-i18n`, descrierea
  meta, cronologia, secţiunea de blog de pe prima pagină şi linkul „Blog" din
  meniu (ultimele două doar dacă există articole), plus o amprentă a datelor în
  adresa scripturilor, ca browserul să nu ţină o versiune veche în cache
- `blog/index.html` şi `blog/<id>/index.html` pentru fiecare articol

Părţile regenerate din `index.html` stau între marcaje:
`<!-- timeline:start -->…<!-- timeline:end -->`, `blog`, `navblog`, `footblog`.
**Nu le şterge.** Fără ele, serverul refuză salvarea în loc să strice pagina.

Toate textele venite din panou trec prin escapare HTML (`esc()` din
`server/render.js`). Nicăieri nu se pune text de-al ei ca HTML.

### Ce verifică serverul

Nimic din ce vine din browser nu e crezut pe cuvânt: chei de text doar dintre cele
existente în `content.js`, identificatori fără caractere de cale, poze doar JPEG şi
doar în `assets/images/<piesă>-N.jpg` sau `assets/blog/<articol>/N.jpg` — portretele
şi `og.jpg` nu pot fi atinse —, date calendaristice reale, lungimi maxime, şi că
fiecare poză de care are nevoie o piesă sau un articol există după commit.
Pozele şi paginile articolelor şterse le calculează serverul din ce era în repo.

### Cum adaugi un text nou pe site

1. În `index.html`, pune elementul cu `data-i18n="sectiune.cheie"`.
2. În `assets/js/content.js`, adaugă cheia în `CONTENT.ro` şi `CONTENT.en`.
3. În `admin/texts.js`, adaug-o în `GROUPS`, cu o etichetă omenească. Dacă uiţi
   pasul ăsta, nu se pierde nimic: apare singură în secţiunea „Altele".

Un text lăsat gol în română nu se mai afişează (`[data-i18n]:empty`). În engleză,
un text gol afişează varianta românească.

### Lista de expoziții

Etichetele de pe piese vin din `EXHIBITIONS`. Fiecare expoziție are o cheie fixă,
născută din numele românesc; piesele se leagă de cheie, deci o corectură de nume
nu rupe nimic. Lista asta e separată de **cronologie** (tabul „Texte"), care e ce
apare în secţiunea „Unde a fost văzută munca ei".

### Ce ai de făcut o dată, la început

**1. Un token de GitHub.** github.com → Settings → Developer settings →
Fine-grained tokens → Generate new token → Only select repositories →
`hudas-jewelry` → Repository permissions → **Contents: Read and write**. Atât.

**2. Site-ul pe Cloudflare.** Workers & Pages → Create → importă repo-ul. Interfaţa
creează un **Worker**, nu un proiect Pages — de aceea rutarea e explicită, în
`worker.js`.

**3. Cele două secrete**, din terminal, în folderul proiectului:

```bash
npx wrangler@3 secret put ADMIN_PASSWORD
```

```bash
npx wrangler@3 secret put GITHUB_TOKEN
```

Fiecare comandă cere valoarea şi n-o afişează. **Porneşte comanda înainte să
generezi tokenul**, ca să-l lipeşti pe loc. Tokenul nu trebuie să ajungă nicăieri
altundeva — nici în fişiere, nici în conversaţii. Dacă ajunge, se şterge de pe
GitHub şi se face altul.

Wrangler 4 cere Node 22; pe Node 20 merge `npx wrangler@3`.

**4. Domeniul.** În Cloudflare, la Worker → Settings → Domains & Routes. După ce
e legat, schimbă adresele absolute din `index.html` (`og:image`, `og:url`,
`canonical`). Paginile de blog iau adresa site-ului din `canonical`, deci se
actualizează singure la următoarea salvare din panou.

### Cum se testează local, fără să atingi site-ul real

Serverul vorbeşte cu GitHub prin `server/github.js`, iar adresa API-ului se poate
suprascrie cu variabila `GITHUB_API`. Pentru teste, `wrangler dev` rulează
Worker-ul adevărat faţă de un GitHub simulat care scrie într-o copie a site-ului.
În `.dev.vars` (ignorat de git):

```
ADMIN_PASSWORD="o-parola-de-test"
GITHUB_TOKEN="fals"
GITHUB_API="http://127.0.0.1:4390"
```

**Nu seta niciodată `GITHUB_API` pe Worker-ul de producţie.**

### Dacă ceva nu merge

- **„Parolă greșită" deși e corectă** → `ADMIN_PASSWORD` are un spaţiu la capăt,
  sau a fost pusă pe alt Worker.
- **„Panoul nu e configurat complet"** → lipseşte un secret. Verifică cu
  `npx wrangler@3 secret list`.
- **„GitHub … 401 Bad credentials"** → tokenul e greşit, trunchiat sau şters.
- **„GitHub … 403"** → tokenul a expirat sau n-are Contents: Read and write.
- **„Între timp s-a publicat altceva"** → s-a salvat din alt tab. Se copiază
  textul, se reîncarcă panoul, se publică din nou.
- **„index.html nu mai are marcajul…"** → cineva a şters un marcaj din pagină;
  se pune la loc şi se salvează din nou.
- **A salvat, dar nu se vede pe site** → Cloudflare → Deployments. Commit-ul e
  deja în repo, deci nimic nu s-a pierdut.

### Dacă strică ceva

Fiecare salvare e un commit separat, semnat „Salvat de Huda din panoul de la
/admin". Orice greşeală se dă înapoi cu `git revert <commit>` şi un push —
inclusiv o piesă sau un articol şters din greşeală, cu poze cu tot.

---

## 9. De făcut mai departe

- **Verificat materialele, numele și anii** (secțiunea 1). E primul lucru.
- **Fotografiile originale** în locul capturilor (secțiunea 2).
- **Un paragraf scris de Huda** pentru „Despre Huda”.
- **`og.jpg`** e generat automat din trei piese. O fotografie făcută anume pentru
  previzualizarea linkului ar arăta mai bine.
- Marcat piesele care au plecat deja (din panou, „Piesa a plecat").
- **Schimbă parola panoului** dacă ajunge pe unde nu trebuie: se schimbă
  într-un singur loc, `ADMIN_PASSWORD` în Cloudflare, și intră în vigoare
  imediat.
- Prețuri pe carduri, dacă se răzgândește vreodată.
- Instrucțiuni de îngrijire — argintul se oxidează, iar cine cumpără prima lui
  bijuterie lucrată manual nu știe asta.
