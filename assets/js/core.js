/*
  Fortunepack core: i18n (tr/en/ar)، تبديل لغة بانتقال دائري، قائمة، مؤشر تسجيل (registration cursor)، مسطرة/علامات قص،
  نافذة عرض السعر → واتساب، رسومات خلفية متحركة (قوالب)، كشف عند التمرير، محمِّل، دعسوقة.
*/
(function () {
  const FP = (window.FP = window.FP || {}), D = window.FP_DATA;
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  FP.CFG = { wa: '905537410520', insta: 'fortunepack.tr' };       // رقم واتساب مؤقّت للعرض التجريبي
  FP.reduced = reduced; FP.$ = $; FP.$$ = $$;
  FP.lang = root.lang || 'tr';
  FP.t = (k) => { const d = D.i18n[FP.lang]; return (d && d[k] != null ? d[k] : D.i18n.tr[k]) || k; };
  FP.product = (slug) => D.products.find((p) => p.slug === slug);

  /* ------------------------------------------------------------ i18n */
  function apply(scope) {
    const dict = D.i18n[FP.lang] || D.i18n.tr;
    $$('[data-i18n]', scope).forEach((e) => {
      const v = dict[e.dataset.i18n]; if (v == null) return;
      e.textContent = e.tagName === 'TITLE' && e.dataset.i18nSuffix ? v + e.dataset.i18nSuffix : v;
    });
    $$('[data-i18n-attr]', scope).forEach((e) => {
      e.dataset.i18nAttr.split(';').forEach((pair) => { const [a, k] = pair.split(':'); if (dict[k] != null) e.setAttribute(a, dict[k]); });
    });
    if (scope === document) {
      const og = $('meta[property="og:title"]'); if (og) og.content = document.title;
    }
  }
  FP.i18n = { apply };

  const LANGS = ['tr', 'en', 'ar'];
  function syncSwitch() {
    $$('.lang').forEach((s) => { s.dataset.i = LANGS.indexOf(FP.lang); s.style.setProperty('--i', LANGS.indexOf(FP.lang)); $$('button', s).forEach((b) => b.setAttribute('aria-pressed', b.dataset.lang === FP.lang)); });
  }
  function setLang(l, ev) {
    if (l === FP.lang || !D.i18n[l]) return;
    const run = () => {
      FP.lang = l; root.lang = l; try { localStorage.setItem('fp-lang', l); } catch (e) { }
      apply(document); syncSwitch(); wireLinks();
      document.dispatchEvent(new CustomEvent('fp:lang', { detail: l }));
    };
    if (document.startViewTransition && !reduced) {
      const r = ev && ev.currentTarget ? ev.currentTarget.getBoundingClientRect() : null;
      root.style.setProperty('--vx', (r ? r.left + r.width / 2 : innerWidth / 2) + 'px'); root.style.setProperty('--vy', (r ? r.top + r.height / 2 : 40) + 'px');
      root.classList.add('vt-lang');
      const tr = document.startViewTransition(run); tr.finished.finally(() => root.classList.remove('vt-lang'));
    } else run();
  }
  FP.setLang = setLang;
  apply(document); syncSwitch();
  root.classList.remove('pend');
  document.addEventListener('click', (e) => { const b = e.target.closest('.lang button'); if (b) setLang(b.dataset.lang, { currentTarget: b }); });

  /* ------------------------------------------------------------ واتساب */
  FP.waUrl = (lines) => `https://wa.me/${FP.CFG.wa}?text=${encodeURIComponent(lines.filter(Boolean).join('\n'))}`;
  function wireLinks() {
    $$('[data-wa-open]').forEach((a) => { a.href = FP.waUrl([FP.t('wa.hello')]); a.target = '_blank'; a.rel = 'noopener'; });
    const pg = $('.pg-product');
    $$('[data-ask]').forEach((a) => { a.target = '_blank'; a.rel = 'noopener'; a.href = FP.waUrl([FP.t('wa.hello') + ' ' + FP.t('wa.ask'), pg ? FP.t('p.' + pg.dataset.slug + '.t') : '']); });
  }
  wireLinks();

  /* ------------------------------------------------------------ نافذة عرض السعر */
  const qm = $('#qm'), qf = qm && $('form', qm);
  let qmExtra = [], qmKind = 'quote', lastFocus = null;
  FP.openQuote = function (o) {
    o = o || {}; qmExtra = o.extra || []; qmKind = o.kind || 'quote';
    if (!qm) return; lastFocus = document.activeElement;
    qf.reset();
    if (o.product) qf.product.value = o.product; else { const pg = $('.pg-product'); if (pg) qf.product.value = pg.dataset.slug; }
    if (o.dims) qf.dims.value = o.dims;
    if (o.notes) qf.notes.value = o.notes;
    $('.qm-err', qm).hidden = true;
    qm.classList.add('open'); qm.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock');
    setTimeout(() => qf.name.focus({ preventScroll: true }), 120);
  };
  FP.closeQuote = function () { if (!qm) return; qm.classList.remove('open'); qm.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lock'); if (lastFocus) lastFocus.focus({ preventScroll: true }); };
  if (qm) {
    qm.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) FP.closeQuote(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (qm.classList.contains('open')) FP.closeQuote(); closeMenu(); } });
    qf.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!qf.name.value.trim()) { $('.qm-err', qm).hidden = false; qf.name.focus(); return; }
      const L = [FP.t('wa.hello') + ' ' + (qmKind === 'sample' && qf.product.value ? FP.t('wa.sample') + ' ' + FP.t('p.' + qf.product.value + '.t') : FP.t('wa.quote')), `${FP.t('wa.name')}: ${qf.name.value.trim()}`];
      if (qf.company.value.trim()) L.push(`${FP.t('wa.company')}: ${qf.company.value.trim()}`);
      if (qf.phone.value.trim()) L.push(`${FP.t('wa.phone')}: ${qf.phone.value.trim()}`);
      if (qf.product.value && qmKind !== 'sample') L.push(`${FP.t('q.product')}: ${FP.t('p.' + qf.product.value + '.t')}`);
      if (qf.dims.value.trim()) L.push(`${FP.t('wa.dims')}: ${qf.dims.value.trim()}`);
      if (qf.qty.value.trim()) L.push(`${FP.t('wa.qty')}: ${qf.qty.value.trim()}`);
      qmExtra.forEach((x) => { if (x && x[1]) L.push(`${x[0]}: ${x[1]}`); });
      if (qf.notes.value.trim()) L.push(`${FP.t('wa.notes')}: ${qf.notes.value.trim()}`);
      window.open(FP.waUrl(L), '_blank', 'noopener'); FP.closeQuote();
    });
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-quote]')) { e.preventDefault(); FP.openQuote(); }
    else if (e.target.closest('[data-sample]')) { e.preventDefault(); const pg = $('.pg-product'); FP.openQuote({ kind: 'sample', product: pg && pg.dataset.slug, extra: FP.getSelection ? FP.getSelection() : [] }); }
  });

  /* ------------------------------------------------------------ قائمة الجوال + الهيدر */
  const burger = $('.burger'), mnav = $('#mnav');
  function closeMenu() { if (!mnav) return; mnav.classList.remove('open'); mnav.setAttribute('aria-hidden', 'true'); burger.setAttribute('aria-expanded', 'false'); document.body.classList.remove('lock', 'mn-open'); }
  if (burger) {
    burger.addEventListener('click', () => {
      const o = !mnav.classList.contains('open');
      mnav.classList.toggle('open', o); mnav.setAttribute('aria-hidden', !o); burger.setAttribute('aria-expanded', o);
      document.body.classList.toggle('lock', o); document.body.classList.toggle('mn-open', o);
    });
    mnav.addEventListener('click', (e) => { if (e.target.closest('a') || e.target.closest('[data-quote]')) closeMenu(); });
  }
  const hd = $('#site-header');
  /* ------------------------------------------------------------ مسطرة + علامات القص */
  const ruler = $('#ruler'), flag = ruler && $('b', ruler);
  let tick = 0;
  function onScroll() {
    tick = 0; const y = scrollY;
    hd && hd.classList.toggle('scrolled', y > 24);
    if (ruler) { ruler.style.setProperty('--sy', y); flag.textContent = Math.round((y + innerHeight / 2) / 3.7795).toLocaleString('en').replace(/,/g, ' '); }
    parallax();
  }
  addEventListener('scroll', () => { if (!tick) tick = requestAnimationFrame(onScroll); }, { passive: true });

  /* ------------------------------------------------------------ المؤشر */
  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !reduced && $('#cur')) {
    root.classList.add('has-cur');
    const cur = $('#cur'), dot = $('.cur-dot', cur), ring = $('.cur-ring', cur), lab = $('.cur-lab', cur);
    let x = -100, y = -100, rx = -100, ry = -100, on = false;
    addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; if (!on) { on = true; rx = x; ry = y; cur.classList.add('show'); } dot.style.transform = `translate3d(${x}px,${y}px,0)`; }, { passive: true });
    document.addEventListener('mouseleave', () => cur.classList.remove('show')); document.addEventListener('mouseenter', () => on && cur.classList.add('show'));
    (function loop() { rx += (x - rx) * .2; ry += (y - ry) * .2; ring.style.transform = `translate3d(${rx}px,${ry}px,0)`; lab.style.transform = `translate3d(${rx}px,${ry}px,0)`; requestAnimationFrame(loop); })();
    document.addEventListener('pointerover', (e) => {
      const t = e.target; cur.classList.remove('is-link', 'is-card', 'is-text');
      const c = t.closest('[data-cursor]');
      if (c) { lab.textContent = FP.t(c.dataset.cursor); cur.classList.add('is-card'); return; }
      if (t.closest('input,textarea,select')) { cur.classList.add('is-text'); return; }
      if (t.closest('a,button,[role="button"],[role="radio"],[role="checkbox"],[role="tab"],label,summary')) cur.classList.add('is-link');
    });
    addEventListener('pointerdown', () => cur.classList.add('is-down')); addEventListener('pointerup', () => cur.classList.remove('is-down'));
  }

  /* ------------------------------------------------------------ كشف عند التمرير + عدّادات */
  const REV = '.sh,.gc,.pc,.rs,.why-list li,.wk,.stat,.ccard,.sty,.mrow,.ps,.big-p,.lead,.lb-copy,.q-grid>div,.ct-form,.spec,.b-sel,.fl-viz';
  const io = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); if (e.target.dataset.count) count(e.target); e.target.querySelectorAll && $$('[data-count]', e.target).forEach(count); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  function count(el) {
    if (el._c) return; el._c = 1; const to = parseFloat(el.dataset.count); if (isNaN(to) || reduced) { return; }
    const t0 = performance.now(), dur = 1400; (function f(n) { const k = Math.min(1, (n - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(to * e); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  FP.reveal = function (scope) {
    $$(REV, scope).forEach((e, i) => { if (e.classList.contains('rv')) return; e.classList.add('rv'); const sib = e.parentElement ? Array.prototype.indexOf.call(e.parentElement.children, e) : 0; e.style.setProperty('--d', (Math.min(sib, 7) * 70) + 'ms'); io.observe(e); });
    $$('.stat .num', scope).forEach((e) => { if (!e._o) { e._o = 1; io.observe(e); } });
  };

  /* ------------------------------------------------------------ رسومات خلفية متحركة (قوالب) */
  const FX = [];
  function fxLayer(sec, idx) {
    const kind = sec.dataset.fx, dark = sec.classList.contains('dark') || kind === 'hero' || kind === 'dark' || kind === 'cta' || kind === 'page';
    const layer = document.createElement('div'); layer.className = 'fx fx--' + kind; layer.setAttribute('aria-hidden', 'true');
    const sets = [
      [['rsc', 300, 200, 160, '8%', '-6%', 560, -10, .35], ['mailer', 220, 150, 60, '72%', '38%', 460, 8, .6], ['tuck', 90, 60, 140, '36%', '70%', 300, -4, .9]],
      [['mailer', 260, 180, 70, '-4%', '48%', 520, 6, .45], ['rsc', 240, 160, 140, '66%', '-10%', 520, -8, .7], ['tuck', 100, 70, 160, '84%', '62%', 280, 12, .3]],
      [['tuck', 120, 80, 170, '58%', '6%', 360, -8, .5], ['rsc', 360, 240, 200, '-8%', '58%', 640, 5, .8], ['mailer', 200, 140, 50, '78%', '66%', 420, -6, .4]]
    ];
    const set = sets[idx % sets.length], n = kind === 'cta' ? 2 : 3;
    set.slice(0, n).forEach((d, k) => {
      const gm = FP.dieGeom(d[0], d[1], d[2], d[3]), ww = d[6], hh = ww * gm.h / gm.w;
      const el = document.createElement('div'); el.className = 'fx-d'; el.style.cssText = `left:${d[4]};top:${d[5]};width:${ww}px;height:${hh}px;--r:${d[7]}deg;--sp:${d[8]};--dl:${-k * 5}s`;
      el.innerHTML = `<svg viewBox="-12 -12 ${gm.w + 24} ${gm.h + 24}" preserveAspectRatio="xMidYMid meet"><path class="fx-cut" d="${gm.cut[0]}" vector-effect="non-scaling-stroke"/><path class="fx-cr" d="${gm.creases.join('')}" vector-effect="non-scaling-stroke"/></svg>`;
      layer.appendChild(el);
    });
    sec.insertBefore(layer, sec.firstChild); sec.classList.add('has-fx');
    FX.push({ sec, layer, els: $$('.fx-d', layer), vis: false });
  }
  const fxIO = new IntersectionObserver((en) => en.forEach((e) => { const f = FX.find((x) => x.sec === e.target); if (f) f.vis = e.isIntersecting; }), { rootMargin: '10% 0px' });
  function parallax() {
    if (reduced) return;
    for (const f of FX) { if (!f.vis) continue; const r = f.sec.getBoundingClientRect(), c = r.top + r.height / 2 - innerHeight / 2; f.els.forEach((e) => { e.style.setProperty('--py', (-c * parseFloat(e.style.getPropertyValue('--sp') || .5) * .22).toFixed(1) + 'px'); }); }
  }
  $$('[data-fx]').forEach((s, i) => { if (s.classList.contains('hero')) { fxLayer(s.querySelector('.hero-pin'), 0); const pin = s.querySelector('.hero-pin'); FX[FX.length - 1].sec = s; fxIO.observe(s); return; } fxLayer(s, i); fxIO.observe(s); });

  /* ------------------------------------------------------------ إيقاف الحركات خارج الشاشة (أداء) */
  const visIO = new IntersectionObserver((en) => en.forEach((e) => e.target.classList.toggle('vis', e.isIntersecting)), { rootMargin: '140px 0px' });
  $$('main > section, footer.foot').forEach((s) => visIO.observe(s));

  /* ------------------------------------------------------------ دعسوقة التذييل */
  const lb = $('.foot-lb .lb');
  if (lb) lb.addEventListener('click', () => { lb.classList.add('fly'); setTimeout(() => lb.classList.remove('fly'), 2600); });

  /* ------------------------------------------------------------ تهيئة */
  function ready() {
    FP.mountArt(); FP.mountAllDies(); FP.reveal(); onScroll();
    document.dispatchEvent(new CustomEvent('fp:ready'));
  }
  function finishLoader() {
    const ld = $('#loader'); root.classList.remove('ld');
    try { sessionStorage.setItem('fp-seen', '1'); } catch (e) { }
    if (ld) { ld.classList.add('done'); setTimeout(() => ld.remove(), 1200); }
    FP.went = true; document.dispatchEvent(new CustomEvent('fp:go'));
  }
  function start() {
    const ld = $('#loader');
    if (root.classList.contains('ld') && ld) {
      const n = $('.ld-n', ld), bar = $('.ld-bar i', ld); const t0 = performance.now(), dur = 1300;
      ready();
      (function f(now) { const k = Math.min(1, (now - t0) / dur); n.textContent = Math.round(k * 100); bar.style.transform = `scaleX(${k})`; if (k < 1) requestAnimationFrame(f); else setTimeout(finishLoader, 180); })(t0);
    } else { ready(); if (ld) ld.remove(); finishLoader(); }
  }
  // بعد تنفيذ كل سكربتات الصفحة (تسجيل المستمعات)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
