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

## Hero: four-stop video (2026-10-23)
The hero is rendered offline (60 fps) from the live 3D scene and shipped as eight short H.264 clips per device class in `assets/hero/desktop|phone/` (`f0..f3` play forward from one stop to the next, `r0..r3` are the same frames in reverse order, so going back is a clip played forward, never reverse playback or seeking). `js/hero-video.js` plays them on one canvas in exactly four scroll gestures: each wheel notch / swipe / arrow key / dot plays the next clip by itself and stops on its last frame; a gesture in the same direction mid-clip speeds it up and chains, the opposite direction continues from the same frame in the mirrored clip. Clips are loaded as blobs (forward ones in the background, the reverse one when a stop is reached), at most three video elements exist at a time, and everything is released from memory when the hero is far away. The live 3D scene stays in the files and the earlier live-3D versions of the changed files are in `_live3d_version/`; `?live3d` or a video failure falls back to the live hero. Re-render with `_hero_video_tools/capture.py` + `encode_site_clips.py`.
