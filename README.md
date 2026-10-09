# Fortunepack — website

Static, dependency-free website for **Fortunepack Ambalaj Oluklu Mukavva San. ve Tic. Ltd. Şti.** (corrugated cardboard packaging, Gaziantep).

- 3 languages: Turkish (default), English, Arabic. The layout never mirrors; Arabic text flows RTL inside its own blocks.
- Pages: Home (scroll-driven fold hero), Catalogue (23 products), 23 product pages, About, Production, Box Studio (live die-line generator), Contact, Privacy.
- Pure HTML/CSS/vanilla JS. No build step is needed to *run* the site; `src/build.py` (kept outside this folder) only regenerates the HTML from the content files.

## Editing content

All texts are plain text, one key per string, in `locales/tr.json`, `locales/en.json`, `locales/ar.json`
(the same data is embedded in `assets/js/data.js`, which the pages load). Product data lives in `data/products.json`.
A future admin panel only has to edit these JSON files and re-export `assets/js/data.js`.

## Things to confirm with the client

- WhatsApp number: `FP.CFG.wa` in `assets/js/core.js` (currently a placeholder).
- Full address, phone and e-mail (only the address printed on the client's box photo and Instagram are used for now).
- Product specifications (board weights, minimum order, lead time) are illustrative until confirmed.

## Preview locally

```
python -m http.server 8080
```
then open http://localhost:8080/
