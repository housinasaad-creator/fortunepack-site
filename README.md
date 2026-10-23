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

## Hero: looping video (2026-10-23)
The hero is one light looping video per device class (`assets/hero/loop-desktop.mp4` 1920x1080, `assets/hero/loop-phone.mp4` 720 wide, about 1-6 MB each), rendered offline from the live 3D scene: the journey plays forward and then back in reverse, so the loop wraps with no cut. It has nothing to do with scrolling: `js/hero-video.js` just sets it to `loop`, plays it while the hero is on screen, pauses it as soon as the hero leaves the viewport, and removes the source (frees the memory) when the visitor is far from the hero. Scrolling is plain native scrolling; the text chapters follow the scroll position as before. The poster stays until the first frame plays (and on browsers that block autoplay, such as iPhone Low Power Mode, until the first touch). `?hero=off`, data-saver and reduced motion keep the still poster. Earlier versions: four-stop clips (`_clips_four_stop_version/`), image sequence, live 3D (`_live3d_version/`, git history). Re-render with `_hero_video_tools/capture.py` then `encode_loop.py`.
