/*
  خريطة الموقع: مُحرِّك بلاطات (slippy map) خفيف بلا مكتبات. البلاطات من OpenStreetMap وتُحمَّل فقط في صفحة التواصل،
  عند اقتراب الخريطة من الشاشة (وفي وضع Ultra عند الضغط على الزر). السحب بالفأرة/اللمس الأفقي، أزرار التكبير، أسهم لوحة المفاتيح.
*/
(function () {
  const box = document.getElementById('cmap'); if (!box) return;
  const FP = (window.FP = window.FP || {});
  const layer = box.querySelector('.cmap-tiles'), pin = box.querySelector('.cmap-pin'), loadBtn = box.querySelector('.cmap-load');
  const LAT = parseFloat(box.dataset.lat), LNG = parseFloat(box.dataset.lng), Z0 = parseInt(box.dataset.z, 10) || 16;
  const TS = 256, ZMIN = 5, ZMAX = 18;
  const URL = (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  let z = Z0, cx = 0, cy = 0, live = false, W = 0, H = 0; const tiles = new Map();

  const world = (lat, lng, zz) => {
    const s = TS * Math.pow(2, zz), sn = Math.sin(lat * Math.PI / 180);
    return [(lng + 180) / 360 * s, (0.5 - Math.log((1 + sn) / (1 - sn)) / (4 * Math.PI)) * s];
  };
  const home = () => { const p = world(LAT, LNG, z); cx = p[0]; cy = p[1]; };

  function render() {
    W = box.clientWidth; H = box.clientHeight;
    const left = cx - W / 2, top = cy - H / 2, n = Math.pow(2, z), keep = new Set();
    if (live) {
      for (let ty = Math.floor(top / TS); ty <= Math.floor((top + H) / TS); ty++) {
        if (ty < 0 || ty >= n) continue;
        for (let tx = Math.floor(left / TS); tx <= Math.floor((left + W) / TS); tx++) {
          const wx = ((tx % n) + n) % n, key = z + '/' + tx + '/' + ty; keep.add(key);
          let im = tiles.get(key);
          if (!im) {
            im = new Image(); im.alt = ''; im.decoding = 'async'; im.draggable = false; im.referrerPolicy = 'origin';
            im.onload = () => im.classList.add('on'); im.src = URL(z, wx, ty); layer.appendChild(im); tiles.set(key, im);
          }
          im.style.transform = `translate(${Math.round(tx * TS - left)}px,${Math.round(ty * TS - top)}px)`;
        }
      }
      tiles.forEach((im, key) => { if (!keep.has(key)) { im.remove(); tiles.delete(key); } });
    }
    const pp = world(LAT, LNG, z);
    pin.style.transform = `translate(${Math.round(pp[0] - left)}px,${Math.round(pp[1] - top)}px)`;
  }

  function zoom(d) {
    const nz = Math.max(ZMIN, Math.min(ZMAX, z + d)); if (nz === z) return;
    const k = Math.pow(2, nz - z); cx *= k; cy *= k; z = nz;
    tiles.forEach((im) => im.remove()); tiles.clear(); render();
  }

  function start() {
    if (live) return; live = true; box.classList.add('live'); if (loadBtn) loadBtn.hidden = true; render();
  }

  /* السحب */
  let dr = null;
  box.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.cmap-ctl, .cmap-attr, .cmap-load')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dr = { x: e.clientX, y: e.clientY }; box.classList.add('drag'); try { box.setPointerCapture(e.pointerId); } catch (_) { /* */ }
  });
  box.addEventListener('pointermove', (e) => { if (!dr) return; cx -= e.clientX - dr.x; cy -= e.clientY - dr.y; dr.x = e.clientX; dr.y = e.clientY; render(); });
  const end = () => { dr = null; box.classList.remove('drag'); };
  box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
  box.addEventListener('wheel', (e) => { if (!(e.ctrlKey || e.metaKey)) return; e.preventDefault(); if (!live) return; zoom(e.deltaY < 0 ? 1 : -1); }, { passive: false });
  box.addEventListener('dblclick', (e) => { if (e.target.closest('.cmap-ctl, .cmap-attr')) return; zoom(1); });
  box.addEventListener('keydown', (e) => {
    const k = e.key, s = 70;
    if (k === 'ArrowLeft') cx -= s; else if (k === 'ArrowRight') cx += s; else if (k === 'ArrowUp') cy -= s; else if (k === 'ArrowDown') cy += s;
    else if (k === '+' || k === '=') { zoom(1); e.preventDefault(); return; } else if (k === '-' || k === '_') { zoom(-1); e.preventDefault(); return; } else return;
    e.preventDefault(); render();
  });
  box.querySelectorAll('[data-zm]').forEach((b) => b.addEventListener('click', () => { start(); zoom(parseInt(b.dataset.zm, 10)); }));
  const hb = box.querySelector('[data-home]'); if (hb) hb.addEventListener('click', () => { start(); if (z !== Z0) { tiles.forEach((im) => im.remove()); tiles.clear(); z = Z0; } home(); render(); });
  if (loadBtn) loadBtn.addEventListener('click', start);
  window.addEventListener('resize', render);

  home(); render();
  const ultra = () => document.documentElement.dataset.perf === 'ultra' || (navigator.connection && navigator.connection.saveData);
  if (ultra()) { if (loadBtn) loadBtn.hidden = false; }
  else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((en) => { if (en.some((x) => x.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: '300px 0px' }); io.observe(box);
  } else start();
})();
