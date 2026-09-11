# HUDA'S JEWELRY — website (v1)

Un site de o pagină pentru [@hudasjewelry](https://www.instagram.com/hudasjewelry/) —
bijuteriile Hudei Mahdi. HTML, CSS și JavaScript simplu: fără build, fără dependențe,
fără cod de server.

```
index.html
assets/
  css/styles.css     ← tot aspectul
  css/fonts.css      ← @font-face pentru fonturile locale
  js/products.js     ← catalogul pieselor (aici se adaugă piese noi)
  js/app.js          ← comportamentul paginii
  images/            ← fotografiile
  fonts/             ← fonturile găzduite local + licența lor
```

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

Se deschide `assets/js/products.js` și se copiază un bloc. Atenție: prima
salvare din panou rescrie fișierul, deci comentariile din el se pierd — datele,
nu.

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

**Live la <https://gabimaftei.github.io/hudas-jewelry/>**

Găzduit gratuit pe GitHub Pages, din
<https://github.com/gabimaftei/hudas-jewelry> (contul `gabimaftei`, branch-ul
`main`). Fără build — Pages servește fișierele așa cum sunt.

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

**Un compromis de știut:** galeria e construită din JavaScript, deci cu JS oprit
pagina se vede, dar fără piese. Motoarele de căutare rulează JS, așa că nu e o
problemă pentru Google — dar e bine de știut.

---

## 8. Panoul de la /admin

Huda își adaugă singură piesele, la `adresa-site-ului/admin`. Intră cu o
parolă — nu are cont de GitHub, nu vede niciun commit, pentru ea e un
formular. Ghidul scris pentru ea e în [GHID.md](GHID.md).

### Cum funcționează

```
  /admin  ──POST cu parola──▶  /api/publish  ──token GitHub──▶  repo
 (browser)                    (funcție pe server)                 │
                                                                  ▼
                                                        redeploy automat
```

Tokenul de GitHub stă **numai** în funcție, ca secret pe server. Panoul din
browserul ei nu-l vede niciodată; el trimite doar parola și conținutul. De
aceea panoul are nevoie de o gazdă care poate rula funcții — GitHub Pages
servește doar fișiere, deci site-ul se mută pe **Cloudflare Pages** (gratuit,
și acolo se leagă și domeniul).

Tot ce se schimbă într-o salvare — texte și poze — intră într-un **singur
commit**, ca să nu existe o clipă în care piesa e scrisă dar poza încă nu.

**Pozele se taie și se micșorează în browserul ei, înainte să plece.** E
același algoritm cu care au fost pregătite primele 13 piese: caută marginea
bijuteriei pe fundal alb, lasă 10% aer, duce latura lungă la maximum 1400px
și comprimă. Fără el, o poză direct din telefon ar ajunge de 4 MB pe site și
încadrată altfel decât toate celelalte. Dacă poza nu e pe alb — una purtată
pe mână, de exemplu — algoritmul își dă seama singur și n-o taie.

### Ce ai de făcut o dată, la început

**1. Un token de GitHub.** github.com → Settings → Developer settings →
Personal access tokens → Fine-grained tokens → Generate new token.
Only select repositories → `hudas-jewelry`. La Permissions → Repository
permissions → **Contents: Read and write**. Atât, nimic altceva.

**2. Site-ul pe Cloudflare Pages.** Cont gratuit pe cloudflare.com →
Workers & Pages → Create → Pages → Connect to Git → alegi `hudas-jewelry`.
Fără build command, output directory `/`. Funcția din `functions/` e găsită
singură.

**3. Cele trei variabile.** În Cloudflare, Settings → Environment variables,
pentru Production:

| Nume | Valoare |
|---|---|
| `ADMIN_PASSWORD` | parola pe care i-o dai ei |
| `GITHUB_TOKEN` | tokenul de la pasul 1 — bifează **Encrypt** |
| `GITHUB_REPO` | `gabimaftei/hudas-jewelry` |

**4. Domeniul.** Tot în Cloudflare, Custom domains. După ce e legat, schimbă
cele trei adrese absolute din `index.html` (`og:image`, `og:url`,
`canonical`), altfel previzualizarea linkului rămâne pe adresa veche.

GitHub Pages poate rămâne pornit ca oglindă, dar **panoul nu merge acolo** —
`/api/publish` întoarce 404, fiindcă Pages nu rulează funcții. Ca să nu existe
două adrese vii cu conținut identic, cel mai curat e să-l oprești după ce
Cloudflare merge.

### Dacă ceva nu merge

- **„Parolă greșită" deși e corectă** → `ADMIN_PASSWORD` nu e setată pe
  Production, sau are un spațiu la capăt.
- **„Panoul nu e configurat complet"** → lipsește una dintre cele trei
  variabile.
- **„Nu s-a putut salva: GitHub … 403"** → tokenul a expirat sau n-are
  Contents: Read and write pe repo-ul ăsta.
- **A salvat, dar nu se vede pe site** → uită-te în Cloudflare la
  Deployments; commit-ul există deja în repo, deci nimic nu s-a pierdut.

### Dacă strică ceva

Fiecare salvare e un commit separat, semnat „Salvat de Huda din panoul de la
/admin". Orice greșeală se dă înapoi cu `git revert <commit>` și un push —
inclusiv o piesă ștearsă din greșeală, cu poze cu tot.

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
