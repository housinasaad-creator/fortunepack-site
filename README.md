# Fortunepack — website

Static, dependency-free website for **Fortunepack Ambalaj Oluklu Mukavva San. ve Tic. Ltd. Şti.** (corrugated cardboard packaging, Gaziantep).

- 3 languages: Turkish (default), English, Arabic. The layout never mirrors; Arabic text flows RTL inside its own blocks.
- Pages: Home (scroll-driven fold hero), Catalogue (23 products), 23 product pages, About, Production, Box Studio (live die-line generator), Contact, Privacy.
- Pure HTML/CSS/vanilla JS. No build step is needed to *run* the site; `src/build.py` (kept outside this folder) only regenerates the HTML from the content files.

## Editing content

All texts are plain text, one key per string, in `locales/tr.json`, `locales/en.json`, `locales/ar.json`
(the same data is embedded in `assets/js/data.js`, which the pages load). Product data lives in `data/products.json`.
A future admin panel only has to edit these JSON files and re-export `assets/js/data.js`.

## Status

- Contact details are real (address from the tax certificate, phone/WhatsApp, e-mail, hours, map).
- This GitHub Pages copy is a **noindex preview**. The launch build (`python src/make_prod.py`, kept outside this folder) produces an indexable `dist/` + ZIP for the client's own hosting.
- Still to confirm with the client: About details (vision, capacity, certificates, references), real product specifications and the plastics range.

## Hero: live 3D again (2026-10-22)
The hero is the live 3D scene again, a little lighter (lower resolution cap, fewer particles, simpler parts) and released from memory when far away. Devices with 4 cores or fewer, or 2 GB of RAM or less, skip the 3D hero: it becomes one still screen so the first scroll leaves it. Add `?hero=on` or `?hero=off` to force either way. The pre-rendered video version of the hero is kept in `_video_hero_version` (not deployed).
