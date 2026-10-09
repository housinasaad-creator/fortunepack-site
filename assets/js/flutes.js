/* تشريح الفلوت: مقطع كرتون مضلّع متحرك، E / B / C / BC مع انتقال سلس بين المعاملات */
(function () {
  const FP = window.FP, $ = FP.$, $$ = FP.$$;
  const svg = $('#fl-svg'); if (!svg) return;
  const NS = 'http://www.w3.org/2000/svg';
  const SPEC = { E: { a1: 12, p1: 24, k: 0, th: 'fl.E.t', u: 'fl.E.u' }, B: { a1: 26, p1: 50, k: 0, th: 'fl.B.t', u: 'fl.B.u' }, C: { a1: 34, p1: 66, k: 0, th: 'fl.C.t', u: 'fl.C.u' },
    EB: { a1: 12, p1: 24, a2: 26, p2: 50, k: 1, th: 'fl.EB.t', u: 'fl.EB.u' }, BB: { a1: 26, p1: 50, a2: 26, p2: 50, k: 1, th: 'fl.BB.t', u: 'fl.BB.u' }, BC: { a1: 26, p1: 50, a2: 34, p2: 66, k: 1, th: 'fl.BC.t', u: 'fl.BC.u' } };
  const W = 640, H = 380, X0 = 118, X1 = 556, LIN = 17;
  let cur = Object.assign({ a2: 34, p2: 66 }, SPEC.B), key = 'B', raf = 0;
  svg.innerHTML = `<defs><clipPath id="flc"><rect x="${X0}" y="0" width="${X1 - X0}" height="${H}"/></clipPath>
<pattern id="flp" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0V6" stroke="rgba(0,0,0,.18)" stroke-width="1"/></pattern></defs>
<g clip-path="url(#flc)"><g id="fl-w1" class="flw"></g><g id="fl-w2" class="flw flw--r"></g></g><g id="fl-lin"></g><g id="fl-dim"></g>`;
  const g1 = $('#fl-w1', svg), g2 = $('#fl-w2', svg), gl = $('#fl-lin', svg), gd = $('#fl-dim', svg);
  const wave = (a, per, yTop, yBot, x0, x1) => {
    const h = per / 2; let d = `M${x0} ${yTop}`, x = x0, up = false;
    while (x < x1 + per) { const nx = x + h; d += `C${x + h * .5} ${up ? yBot : yTop} ${x + h * .5} ${up ? yTop : yBot} ${nx} ${up ? yTop : yBot}`; x = nx; up = !up; if (up && false) break; }
    return d;
  };
  // الموجة تبدأ من الأعلى: نقطتان متتاليتان (أعلى→أسفل→أعلى)
  function wavePath(per, yTop, yBot, x0, x1) {
    const h = per / 2; let d = `M${x0} ${yTop}`, x = x0, down = true;
    while (x < x1 + per * 2) { d += `C${x + h * .55} ${down ? yTop : yBot} ${x + h * .45} ${down ? yBot : yTop} ${x + h} ${down ? yBot : yTop}`; x += h; down = !down; }
    return d;
  }
  function render() {
    const K = 2, a1 = cur.a1 * K, p1 = cur.p1 * K, a2 = cur.a2 * K, p2 = cur.p2 * K, k = cur.k;
    const h1 = a1 * 2, h2 = a2 * 2 * k, lm = LIN * k, T = LIN + h1 + lm + h2 + LIN, y0 = (H - T) / 2 + 6;
    const yT1 = y0 + LIN, yB1 = yT1 + h1, yM = yB1, yT2 = yM + lm, yB2 = yT2 + h2, yBot = yB2;
    const kraft = '#c99c64', kraftD = '#8e6a3d';
    g1.innerHTML = `<path d="${wavePath(p1, yT1, yB1, X0 - p1 * 2, X1)}" fill="none" stroke="${kraftD}" stroke-width="5" stroke-linejoin="round"/>`;
    g1.style.setProperty('--per', p1 + 'px'); g1.style.animationDuration = (p1 / 26).toFixed(2) + 's';
    g2.innerHTML = k > .02 ? `<path d="${wavePath(p2, yT2, yB2, X0 - p2 * 2 + p2 / 2, X1)}" fill="none" stroke="${kraftD}" stroke-width="5" stroke-opacity="${Math.min(1, k)}"/>` : '';
    g2.style.setProperty('--per', p2 + 'px'); g2.style.animationDuration = (p2 / 26).toFixed(2) + 's';
    const rect = (y, hh, op) => `<rect x="${X0}" y="${y}" width="${X1 - X0}" height="${hh}" fill="${kraft}" fill-opacity="${op == null ? 1 : op}"/><rect x="${X0}" y="${y}" width="${X1 - X0}" height="${hh}" fill="url(#flp)" fill-opacity="${op == null ? 1 : op}"/><path d="M${X0} ${y}H${X1}M${X0} ${y + hh}H${X1}" stroke="rgba(60,35,10,.45)" stroke-width="1"/>`;
    gl.innerHTML = rect(y0, LIN) + (lm > .5 ? rect(yM, lm, Math.min(1, k)) : '') + rect(yBot, LIN);
    // مقاييس السماكة
    const xd = X1 + 18, yTop = y0, yEnd = yBot + LIN;
    gd.innerHTML = `<path d="M${xd} ${yTop}V${yEnd}M${xd - 6} ${yTop}H${xd + 6}M${xd - 6} ${yEnd}H${xd + 6}" stroke="#ed1c24" stroke-width="1.4" fill="none"/><text x="${xd + 10}" y="${(yTop + yEnd) / 2 + 4}" fill="#ed1c24" font-family="JetBrains Mono,monospace" font-size="12">${FP.t(SPEC[key].th).split('(')[0].trim()}</text>`;
    const pct = (y) => (y / H * 100).toFixed(1) + '%';
    const lt = $('.fl-lab--t'), lmid = $('.fl-lab--m'), lb = $('.fl-lab--b');
    const lm2 = $('.fl-lab--m2');
    if (lt) { lt.style.top = pct(y0 + LIN / 2); lmid.style.top = pct((yT1 + yB1) / 2); lb.style.top = pct(yBot + LIN / 2); }
    if (lm2) { lm2.style.top = pct((yT2 + yB2) / 2); lm2.style.opacity = Math.max(0, (k - .4) / .6).toFixed(2); }
  }
  function tween(to) {
    const from = Object.assign({}, cur), t0 = performance.now(), dur = FP.reduced ? 1 : 750;
    cancelAnimationFrame(raf);
    (function f(n) { const t = Math.min(1, (n - t0) / dur), e = 1 - Math.pow(1 - t, 3); for (const k of ['a1', 'p1', 'a2', 'p2', 'k']) cur[k] = from[k] + ((to[k] != null ? to[k] : from[k]) - from[k]) * e; render(); if (t < 1) raf = requestAnimationFrame(f); })(t0);
  }
  function set(f) {
    key = f; $$('.ft').forEach((b) => { b.classList.toggle('on', b.dataset.f === f); b.setAttribute('aria-selected', b.dataset.f === f); });
    const th = $('#fl-th'), us = $('#fl-use'); th.dataset.i18n = SPEC[f].th; us.dataset.i18n = SPEC[f].u; th.textContent = FP.t(SPEC[f].th); us.textContent = FP.t(SPEC[f].u);
    tween(SPEC[f]);
  }
  $$('.ft').forEach((b) => b.addEventListener('click', () => set(b.dataset.f)));
  document.addEventListener('fp:lang', () => set(key));
  render();
  // أول ظهور: انتقال من E إلى B ليلفت الانتباه
  new IntersectionObserver((en, o) => { if (en[0].isIntersecting) { o.disconnect(); cur = Object.assign({}, cur, SPEC.E, { a2: 34, p2: 66 }); set('B'); } }, { threshold: .4 }).observe(svg);
})();
