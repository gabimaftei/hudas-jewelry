# Ghid: site-ul în Google Search Console și Bing

Pentru Huda. Durează cam 15 minute, plus așteptare. Nu trebuie să modifici nimic
pe site: verificarea se face doar din Google și din Cloudflare.

**De ce DNS (record TXT) și nu fișier sau meta tag.** Un TXT în Cloudflare DNS
verifică tot domeniul dintr-o dată (`hudasjewelry.com`, `www`, `http`, `https`), nu
atinge site-ul, nu depinde de `_headers`, `.assetsignore` sau CSP și nu se șterge
când se publică ceva din panou. Fișierul de verificare ar cere un deploy, iar
meta tag-ul ar fi suprascris de panou la prima salvare.

## 1. Adaugă proprietatea în Google

1. Intră la <https://search.google.com/search-console> cu contul Google al Hudei.
2. **Adaugă proprietate** → tipul **Domeniu** (coloana din stânga, nu „Prefix URL”)
   → scrie `hudasjewelry.com` → **Continuă**.
3. Google arată o valoare care începe cu `google-site-verification=`. Copiaz-o.

> **Stare la 6 noiembrie 2026:** în DNS există deja un TXT
> `google-site-verification=oYkYu2…` (îl vezi cu `dig TXT hudasjewelry.com`).
> Dacă Google îți dă aceeași valoare, sari direct la pasul 3 și apasă **Verify**.
> Dacă îți dă alta, adaugă-o pe lângă (pasul 2); pot fi mai multe TXT-uri.

## 2. Pune valoarea în Cloudflare

1. <https://dash.cloudflare.com> → contul Hudei → domeniul `hudasjewelry.com`.
2. **DNS** → **Records** → **Add record**.
3. Type **TXT**, Name `@`, Content = valoarea copiată (întreagă, fără ghilimele),
   TTL Auto → **Save**.

## 3. Verifică

Înapoi în Search Console, apasă **Verify**. Dacă zice că nu găsește recordul,
așteaptă 5–30 de minute și mai încearcă (DNS-ul are nevoie de timp). **Nu șterge
niciodată** recordul TXT după verificare: dacă dispare, Google retrage accesul.

## 4. Trimite harta site-ului

În meniul din stânga: **Sitemaps** → la „Add a new sitemap” scrie `sitemap.xml`
→ **Submit**. Trebuie să apară starea **Success** și 28 de pagini descoperite
(prima pagină, `/en/` și câte două pagini, RO și EN, pentru fiecare dintre cele 13
piese). Fișierul se rescrie singur la fiecare salvare din panou.

## 5. Cere indexarea

Sus, în bara **URL inspection**, lipește o adresă, așteaptă rezultatul, apoi apasă
**Request indexing**. Google acceptă doar câteva cereri pe zi, deci poți face
câte puțin în mai multe zile. În ordinea asta:

1. `https://hudasjewelry.com/`
2. `https://hudasjewelry.com/en/`
3. Cele 13 piese (adaugă la fiecare și varianta `/en/piese/<id>/` dacă ai răbdare;
   oricum sunt în sitemap):

| Piesă | Adresă |
|---|---|
| Inel sculptural | `https://hudasjewelry.com/piese/inel-sculptural/` |
| Colier auriu cu lună | `https://hudasjewelry.com/piese/colier-auriu-luna/` |
| Pandantiv cu perle | `https://hudasjewelry.com/piese/pandantiv-perle/` |
| Cercei lună | `https://hudasjewelry.com/piese/cercei-luna/` |
| Inel bandă cu perle | `https://hudasjewelry.com/piese/inel-banda-perle/` |
| Inel peridot și perle | `https://hudasjewelry.com/piese/inel-peridot-perle/` |
| Inel cub | `https://hudasjewelry.com/piese/inel-cub/` |
| Inel auriu cu smarald | `https://hudasjewelry.com/piese/inel-auriu-smarald/` |
| Inel cu piatră clară | `https://hudasjewelry.com/piese/inel-piatra-clara/` |
| Brățară cu frunze | `https://hudasjewelry.com/piese/bratara-frunze/` |
| Brățară inel | `https://hudasjewelry.com/piese/bratara-inel/` |
| Colier cu trei pietre | `https://hudasjewelry.com/piese/colier-trei-pietre/` |
| Pandantiv zoisit | `https://hudasjewelry.com/piese/pandantiv-zoisit/` |

(Dacă apare vreo piesă nouă, adresa ei e `…/piese/<id>/`, iar lista completă e în
`sitemap.xml`.) Indexarea durează de la câteva ore la câteva săptămâni; „URL is not
on Google” în primele zile e normal.

## 6. Bing

1. <https://www.bing.com/webmasters> → autentifică-te (cont Microsoft, Google sau
   Facebook).
2. **Import your sites from GSC** → permite accesul la contul Google → alege
   `hudasjewelry.com` → **Import**. Bing preia proprietatea și sitemap-ul, fără
   altă verificare.
3. În **Sitemaps**, verifică să apară `https://hudasjewelry.com/sitemap.xml`; dacă nu,
   adaug-o cu **Submit sitemap**.
4. Opțional: la **URL Submission** poți trimite prima pagină. Bing alimentează și
   DuckDuckGo și Ecosia, deci merită.

## 7. Ce rapoarte urmărești (o dată pe lună, nu zilnic)

- **Pages (Indexing)**: câte pagini sunt indexate din 28. Dacă o pagină apare la
  „Not indexed”, deschide motivul și scrie-i lui Gabi.
- **Sitemaps**: rămâne pe Success.
- **Performance → Queries**: cu ce cuvinte ajunge lumea pe site (apar după 2–4
  săptămâni). Tinte realiste: „Huda Mahdi”, „bijuterii argint lucrate manual”,
  „inel cupolă” etc., nu „bijuterii”.
- **Performance → Pages**: ce piese sunt văzute.
- **Experience → Core Web Vitals** și **Enhancements → Breadcrumbs/Product**:
  trebuie să nu apară erori.
- **Links**: cine trimite linkuri spre site (backlinkurile contează cel mai mult).

## Ce poate face cine

| Cine | Ce |
|---|---|
| **Huda / Gabi** (conturi Google, Cloudflare, Microsoft) | Toți pașii de mai sus: nimeni altcineva nu poate adăuga proprietatea sau recordul DNS. |
| **Claude / codul** | Nimic în conturi. Site-ul, `robots.txt` și `sitemap.xml` sunt deja corecte; `sitemap.xml` se actualizează din panou. |
