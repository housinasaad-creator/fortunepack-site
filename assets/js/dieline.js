/*
  مولّد القوالب (Die layouts): 3 أنواع، أبعاد بالمليمتر الحقيقي، شبكة ورق بياني، أبعاد، حجم اللوح والمساحة والوزن.
    rsc    صندوق شقّ FEFCO 0201
    mailer علبة بريد FEFCO 0427 (مبسّطة)
    tuck   علبة قابلة للطي straight tuck-end (مبسّطة)
  FP.dieGeom(type, L, W, H) / FP.dieSvg(geom, opts) / FP.mountDie(host, opts)
*/
(function () {
  const FP = (window.FP = window.FP || {});
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const r1 = (n) => Math.round(n * 10) / 10;
  const M = (pts) => 'M' + pts.map((p) => r1(p[0]) + ' ' + r1(p[1])).join('L') + 'Z';
  const FLUTE = { E: { th: 1.5, kg: 1.0 }, B: { th: 3, kg: 1.0 }, C: { th: 4, kg: 1.0 }, BC: { th: 6.5, kg: 1.0 } };
  const GSM_DEFAULT = { E: 340, B: 440, C: 520, BC: 860 };
  FP.FLUTE = FLUTE; FP.GSM_DEFAULT = GSM_DEFAULT;

  /* ------------------------------------------------------------ هندسة */
  function geomRSC(L, W, H, th) {
    const G = 30, F = W / 2, g = Math.max(4, th * 2 + 2), c = Math.min(8, G * .3, H / 4);
    const xs = [0, G, G + L, G + L + W, G + 2 * L + W, G + 2 * L + 2 * W], Wt = xs[5], Ht = H + 2 * F;
    const top = [[0, F + c], [c, F]], bot = [];
    const wd = [L, W, L, W];
    for (let i = 1; i <= 4; i++) {
      const xa = xs[i] + g / 2, xb = i < 4 ? xs[i + 1] - g / 2 : xs[5];
      top.push([xa, F], [xa, 0], [xb, 0]);
      if (i < 4) top.push([xb, F]);
    }
    top.push([Wt, Ht]);
    for (let i = 4; i >= 1; i--) {
      const xa = xs[i] + g / 2, xb = i < 4 ? xs[i + 1] - g / 2 : xs[5];
      if (i === 4) bot.push([xa, Ht], [xa, F + H]);
      else bot.push([xb, F + H], [xb, Ht], [xa, Ht], [xa, F + H]);
    }
    bot.push([c, F + H], [0, F + H - c]);
    const cut = top.concat(bot);
    const cr = [];
    for (let i = 1; i <= 4; i++) cr.push(`M${xs[i]} ${F}V${F + H}`);
    for (let i = 1; i <= 4; i++) {
      const xa = xs[i] + g / 2, xb = i < 4 ? xs[i + 1] - g / 2 : xs[5];
      cr.push(`M${r1(xa)} ${F}H${r1(xb)}`, `M${r1(xa)} ${F + H}H${r1(xb)}`);
    }
    const labels = [[xs[1] + L / 2, F + H / 2, 'L'], [xs[2] + W / 2, F + H / 2, 'W'], [xs[3] + L / 2, F + H / 2, 'L'], [xs[4] + W / 2, F + H / 2, 'W']];
    return { type: 'rsc', cut: [M(cut)], poly: cut, creases: cr, w: Wt, h: Ht, labels, dimsTop: [[0, G, 'G'], [xs[1], xs[2], 'L'], [xs[2], xs[3], 'W'], [xs[3], xs[4], 'L'], [xs[4], xs[5], 'W']], dimsLeft: [[0, F, 'W/2'], [F, F + H, 'H'], [F + H, Ht, 'W/2']] };
  }
  function geomMailer(L, W, H, th) {
    const T = clamp(W * .26, 14, 32), ch = Math.min(8, H * .3), fw = Math.max(8, H * .92), cd = Math.min(10, fw * .5);
    const x0 = fw > H ? fw : H, Wt = L + 2 * x0, X = (v) => v;
    const yT = T, yL = T + W, yB = yL + H, yBe = yB + W, yF = yBe + H;
    const xl = x0, xr = x0 + L;
    const cut = [
      [xl + 8, 0], [xr - 8, 0], [xr, yT], [xr, yT + 5], [xr + fw, yT + 5 + cd], [xr + fw, yL - 5 - cd], [xr, yL - 5], [xr, yB],
      [xr, yB], [xr + H, yB + ch], [xr + H, yBe - ch], [xr, yBe], [xr, yF], [xl, yF], [xl, yBe], [xl - H, yBe - ch], [xl - H, yB + ch], [xl, yB],
      [xl, yL - 5], [xl - fw, yL - 5 - cd], [xl - fw, yT + 5 + cd], [xl, yT + 5], [xl, yT]
    ].map((p) => [p[0] + (x0 - x0), p[1]]);
    const cr = [`M${xl} ${yT}H${xr}`, `M${xl} ${yL}H${xr}`, `M${xl} ${yB}H${xr}`, `M${xl} ${yBe}H${xr}`, `M${xl} ${yB}V${yBe}`, `M${xr} ${yB}V${yBe}`, `M${xl} ${yT + 5}V${yL - 5}`, `M${xr} ${yT + 5}V${yL - 5}`];
    const labels = [[x0 + L / 2, yT + W / 2, 'L×W'], [x0 + L / 2, yL + H / 2, 'L×H'], [x0 + L / 2, yB + W / 2, 'L×W'], [x0 + L / 2, yBe + H / 2, 'L×H'], [xl - H / 2, yB + W / 2, 'W×H'], [xr + H / 2, yB + W / 2, 'W×H']];
    return { type: 'mailer', cut: [M(cut)], poly: cut, creases: cr, w: Wt, h: yF, labels, dimsTop: [[xl - H, xl, 'H'], [xl, xr, 'L'], [xr, xr + H, 'H']], dimsLeft: [[0, yT, 'T'], [yT, yL, 'W'], [yL, yB, 'H'], [yB, yBe, 'W'], [yBe, yF, 'H']] };
  }
  function geomTuck(L, W, H, th) {
    const G = Math.min(16, Math.max(10, L * .2)), Tk = clamp(W * .4, 10, 22), df = W * .55, c = Math.min(6, G * .4), ts = Math.min(6, L * .08), tb = Math.min(6, Tk * .6), bv = Math.min(df * .7, W / 2.6);
    const xs = [0, G, G + L, G + L + W, G + 2 * L + W, G + 2 * L + 2 * W], Wt = xs[5];
    const yb = Tk + W, ye = yb + H, Ht = 2 * Tk + 2 * W + H;
    const flapTop = (xa0, xb0, y, dir) => { const xa = xa0 + 1.5, xb = xb0 - 1.5, yt = y - dir * df; return [[xa, y], [xa + bv, yt], [xb - bv, yt], [xb, y]]; };
    const cut = [[0, yb + c], [c, yb], [xs[1], yb], [xs[2], yb]];
    cut.push(...flapTop(xs[2], xs[3], yb, 1)); cut.push([xs[3], yb], [xs[3], Tk], [xs[3] + ts, Tk], [xs[3] + ts + tb, 0], [xs[4] - ts - tb, 0], [xs[4] - ts, Tk], [xs[4], Tk], [xs[4], yb]);
    cut.push(...flapTop(xs[4], xs[5], yb, 1)); cut.push([xs[5], yb], [xs[5], ye]);
    cut.push(...flapTop(xs[4], xs[5], ye, -1).reverse()); cut.push([xs[4], ye], [xs[3], ye]);
    cut.push(...flapTop(xs[2], xs[3], ye, -1).reverse()); cut.push([xs[2], ye], [xs[2], yb + H + W], [xs[2] - ts, yb + H + W], [xs[2] - ts - tb, Ht], [xs[1] + ts + tb, Ht], [xs[1] + ts, yb + H + W], [xs[1], yb + H + W], [xs[1], ye], [c, ye], [0, ye - c]);
    const cr = [];
    for (let i = 1; i <= 4; i++) cr.push(`M${xs[i]} ${yb}V${ye}`);
    cr.push(`M${xs[3]} ${yb}H${xs[4]}`, `M${xs[3] + ts} ${Tk}H${xs[4] - ts}`, `M${xs[1]} ${ye}H${xs[2]}`, `M${xs[1] + ts} ${yb + H + W}H${xs[2] - ts}`);
    [[xs[2], xs[3]], [xs[4], xs[5]]].forEach((q) => { cr.push(`M${q[0] + 1.5} ${yb}H${q[1] - 1.5}`, `M${q[0] + 1.5} ${ye}H${q[1] - 1.5}`); });
    const labels = [[xs[1] + L / 2, yb + H / 2, 'L'], [xs[2] + W / 2, yb + H / 2, 'W'], [xs[3] + L / 2, yb + H / 2, 'L'], [xs[4] + W / 2, yb + H / 2, 'W']];
    return { type: 'tuck', cut: [M(cut)], poly: cut, creases: cr, w: Wt, h: Ht, labels, dimsTop: [[0, G, 'G'], [xs[1], xs[2], 'L'], [xs[2], xs[3], 'W'], [xs[3], xs[4], 'L'], [xs[4], xs[5], 'W']], dimsLeft: [[0, Tk, 'T'], [Tk, yb, 'W'], [yb, ye, 'H'], [ye, yb + H + W, 'W'], [yb + H + W, Ht, 'T']] };
  }
  function area(poly) { let a = 0; for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; a += p[0] * q[1] - q[0] * p[1]; } return Math.abs(a) / 2; }

  FP.dieGeom = function (type, L, W, H, flute) {
    L = clamp(+L || 100, 20, 1500); W = clamp(+W || 100, 20, 1500); H = clamp(+H || 50, 10, 1500);
    const th = (FLUTE[flute || 'B'] || FLUTE.B).th;
    const gm = type === 'mailer' ? geomMailer(L, W, H, th) : type === 'tuck' ? geomTuck(L, W, H, th) : geomRSC(L, W, H, th);
    gm.L = L; gm.W = W; gm.H = H; gm.areaBox = gm.w * gm.h; gm.areaPoly = area(gm.poly); return gm;
  };

  /* ------------------------------------------------------------ رسم SVG */
  const ESC = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function dimH(x1, x2, y, label, fs, val) {
    const lab = val != null ? `${label} ${Math.round(val)}` : label;
    return `<g class="die-dim"><path d="M${r1(x1)} ${r1(y)}H${r1(x2)}M${r1(x1)} ${r1(y - fs * .45)}V${r1(y + fs * .45)}M${r1(x2)} ${r1(y - fs * .45)}V${r1(y + fs * .45)}"/><text x="${r1((x1 + x2) / 2)}" y="${r1(y - fs * .55)}" text-anchor="middle" style="font-size:${r1(fs)}px">${ESC(lab)}</text></g>`;
  }
  function dimV(x, y1, y2, label, fs, val) {
    const lab = val != null ? `${label} ${Math.round(val)}` : label;
    return `<g class="die-dim"><path d="M${r1(x)} ${r1(y1)}V${r1(y2)}M${r1(x - fs * .45)} ${r1(y1)}H${r1(x + fs * .45)}M${r1(x - fs * .45)} ${r1(y2)}H${r1(x + fs * .45)}"/><text transform="translate(${r1(x - fs * .55)} ${r1((y1 + y2) / 2)}) rotate(-90)" text-anchor="middle" style="font-size:${r1(fs)}px">${ESC(lab)}</text></g>`;
  }
  /* يرجع نص SVG كامل (viewBox بالمليمتر) */
  FP.dieSvg = function (gm, o) {
    o = o || {};
    const mx = Math.max(gm.w, gm.h), fs = mx * (o.mini ? .04 : .03), m = fs * 4.2;
    const vx = -m, vy = -m * .9, vw = gm.w + m * 2, vh = gm.h + m * 1.8;
    const fillId = 'kf' + (o.id || 0);
    const dimT = gm.dimsTop.map((d) => dimH(d[0], d[1], -fs * 1.9, d[2], fs, d[2].length === 1 ? (d[2] === 'L' ? gm.L : d[2] === 'W' ? gm.W : d[2] === 'H' ? gm.H : null) : null)).join('');
    const dimL = gm.dimsLeft.map((d) => dimV(-fs * 1.9, d[0], d[1], d[2], fs, d[2] === 'H' ? gm.H : d[2] === 'W' ? gm.W : null)).join('');
    const tot = `<g class="die-dim die-dim--tot"><path d="M0 ${r1(gm.h + fs * 1.6)}H${r1(gm.w)}M0 ${r1(gm.h + fs * 1.1)}V${r1(gm.h + fs * 2.1)}M${r1(gm.w)} ${r1(gm.h + fs * 1.1)}V${r1(gm.h + fs * 2.1)}"/><text x="${r1(gm.w / 2)}" y="${r1(gm.h + fs * 3.1)}" text-anchor="middle" style="font-size:${r1(fs * 1.1)}px">${Math.round(gm.w)} mm</text>
<path d="M${r1(gm.w + fs * 1.6)} 0V${r1(gm.h)}M${r1(gm.w + fs * 1.1)} 0H${r1(gm.w + fs * 2.1)}M${r1(gm.w + fs * 1.1)} ${r1(gm.h)}H${r1(gm.w + fs * 2.1)}"/><text transform="translate(${r1(gm.w + fs * 3.2)} ${r1(gm.h / 2)}) rotate(90)" text-anchor="middle" style="font-size:${r1(fs * 1.1)}px">${Math.round(gm.h)} mm</text></g>`;
    const lbl = gm.labels.map((l) => `<text class="die-lbl" x="${r1(l[0])}" y="${r1(l[1] + fs * .35)}" text-anchor="middle" style="font-size:${r1(fs * 1.5)}px">${ESC(l[2])}</text>`).join('');
    const gx0 = Math.floor(vx / 10) * 10, gy0 = Math.floor(vy / 10) * 10;
    return `<defs><pattern id="gp${o.id || 0}" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" class="die-gl"/></pattern><pattern id="gP${o.id || 0}" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" class="die-gL"/></pattern></defs>
<rect x="${gx0}" y="${gy0}" width="${vw + 20}" height="${vh + 20}" fill="url(#gp${o.id || 0})"/><rect x="${gx0}" y="${gy0}" width="${vw + 20}" height="${vh + 20}" fill="url(#gP${o.id || 0})"/>
<path class="die-fill" d="${gm.cut[0]}"/>
<g class="die-lbls">${lbl}</g>
<path class="die-crease" d="${gm.creases.join('')}"/>
<path class="die-cut" d="${gm.cut[0]}"/>
${o.mini ? '' : dimT + dimL}${tot}`.replace('<svg', '<svg') + `<!--vb:${r1(vx)} ${r1(vy)} ${r1(vw)} ${r1(vh)}-->`;
  };
  FP.dieViewBox = function (gm, o) {
    const mx = Math.max(gm.w, gm.h), fs = mx * (o && o.mini ? .04 : .03), m = fs * 4.2;
    return `${r1(-m)} ${r1(-m * .9)} ${r1(gm.w + m * 2)} ${r1(gm.h + m * 1.8)}`;
  };

  /* ------------------------------------------------------------ تقديرات */
  FP.dieCalc = function (gm, gsm) {
    const m2 = gm.areaBox / 1e6, g = m2 * gsm;
    return { w: Math.round(gm.w), h: Math.round(gm.h), m2, grams: g, eff: Math.round(gm.areaPoly / gm.areaBox * 100) };
  };
  const fmtW = (g) => (g >= 1000 ? (g / 1000).toFixed(2).replace('.', ',') + ' kg' : Math.round(g) + ' g');
  FP.fmtWeight = fmtW;

  FP.DIE_DEFAULTS = { rsc: [300, 200, 200], mailer: [220, 160, 50], tuck: [90, 60, 130] };
  FP.SHAPE_DIMS = { pizza: [330, 330, 40], fry: [90, 40, 110], cosmetic: [55, 38, 140], display: [240, 160, 300], tray: [160, 110, 45], carton: [90, 60, 130], window: [120, 66, 116], windowopen: [120, 66, 116], telescope: [260, 180, 80], mailer: [220, 160, 50], rsc: [300, 200, 200], carry: [400, 250, 250] };

  /* ------------------------------------------------------------ الودجت */
  let uid = 0;
  FP.mountDie = function (host, opts) {
    opts = Object.assign({ type: host.dataset.die || 'rsc', mini: !!host.dataset.mini, auto: !!host.dataset.auto }, opts || {});
    const id = ++uid, full = host.classList.contains('dl-studio') || opts.full, card = host.classList.contains('dl-host--card');
    const slug = host.closest('[data-slug]') ? host.closest('[data-slug]').dataset.slug : '';
    const prod = (FP_DATA.products || []).find((p) => p.slug === slug);
    let d = (prod && FP.SHAPE_DIMS[prod.shape]) || FP.DIE_DEFAULTS[opts.type] || [200, 150, 100];
    const st = { type: opts.type, L: d[0], W: d[1], H: d[2], flute: 'B', gsm: GSM_DEFAULT.B };
    if (prod) { const mf = (FP_DATA.mats[(FP_DATA.catMats[prod.cat] || [])[0]] || {}).fl; if (mf && FLUTE[mf]) { st.flute = mf; st.gsm = GSM_DEFAULT[mf]; } }
    const inp = (k, key) => `<label class="dwi"><span data-i18n="${key}"></span><div class="dwi-r"><input type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" maxlength="4" data-k="${k}" value="${st[k]}"><em>mm</em></div><input type="range" data-r="${k}" min="${k === 'H' ? 10 : 20}" max="${k === 'H' ? 600 : 800}" value="${Math.min(st[k], 800)}" aria-hidden="true" tabindex="-1"></label>`;
    host.classList.add('dw');
    host.innerHTML = `<div class="dw-view"><svg class="dw-svg" xmlns="http://www.w3.org/2000/svg" role="img"></svg>${opts.mini || card ? '' : `<ul class="dw-leg"><li><i class="lg-cut"></i><span data-i18n="studio.lg.cut"></span></li><li><i class="lg-cr"></i><span data-i18n="studio.lg.crease"></span></li><li><i class="lg-gr"></i><span data-i18n="studio.grid"></span></li></ul>`}</div>
<div class="dw-ctl">${full ? `<div class="dw-types" role="tablist"><button type="button" data-t="rsc" role="tab" data-i18n="studio.s.rsc"></button><button type="button" data-t="mailer" role="tab" data-i18n="studio.s.mailer"></button><button type="button" data-t="tuck" role="tab" data-i18n="studio.s.tuck"></button></div>` : ''}
<div class="dw-in">${inp('L', 'studio.L')}${inp('W', 'studio.W')}${inp('H', 'studio.H')}</div>
${full ? `<div class="dw-pre"><span data-i18n="studio.presets"></span><button type="button" data-p="s" data-i18n="studio.pre.1"></button><button type="button" data-p="m" data-i18n="studio.pre.2"></button><button type="button" data-p="l" data-i18n="studio.pre.3"></button></div>
<div class="dw-fl"><label><span data-i18n="studio.flute"></span><div class="dw-seg" data-seg="flute"><button type="button" data-v="E">E</button><button type="button" data-v="B">B</button><button type="button" data-v="C">C</button><button type="button" data-v="BC">BC</button></div></label>
<label class="dwi dwi--g"><span data-i18n="studio.gsm"></span><div class="dwi-r"><input type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" maxlength="4" data-k="gsm" value="${st.gsm}"><em>g/m²</em></div></label></div>` : ''}
${opts.mini ? '' : `<dl class="dw-res"><div><dt data-i18n="studio.r.sheet"></dt><dd data-o="sheet"></dd></div>${full ? '<div><dt data-i18n="studio.r.area"></dt><dd data-o="area"></dd></div><div><dt data-i18n="studio.r.thick"></dt><dd data-o="th"></dd></div><div><dt data-i18n="studio.r.weight"></dt><dd data-o="wt"></dd></div><div><dt data-i18n="studio.r.efficiency"></dt><dd data-o="eff"></dd></div>' : ''}</dl>
<p class="dw-note" data-i18n="studio.note"></p><button type="button" class="btn btn--primary dw-q"><span data-i18n="btn.quote_dims"></span><svg class="ar"><use href="#i-arrow"/></svg></button>`}</div>`;
    if (FP.i18n) FP.i18n.apply(host);
    const svg = host.querySelector('.dw-svg');
    let first = true, lastType = null;
    function draw(anim) {
      const gm = FP.dieGeom(st.type, st.L, st.W, st.H, st.flute);
      const o = { id, mini: opts.mini || card };
      svg.setAttribute('viewBox', FP.dieViewBox(gm, o));
      svg.innerHTML = FP.dieSvg(gm, o).replace(/<!--vb:[^>]*-->/, '');
      const vb = svg.viewBox.baseVal, px = svg.clientWidth || 600, u = vb.width / px;
      svg.style.setProperty('--sw', r1(u * 1.7 * 100) / 100); svg.style.setProperty('--sw2', r1(u * 1.1 * 100) / 100); svg.style.setProperty('--da', `${r1(u * 7)} ${r1(u * 5)}`);
      host.querySelectorAll('.dw-svg .die-cut, .dw-svg .die-crease').forEach((p) => { p.style.strokeWidth = p.classList.contains('die-cut') ? (u * 1.8) : (u * 1.2); });
      if (anim && svg.getBoundingClientRect().width && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const cp = svg.querySelector('.die-cut'), len = cp.getTotalLength();
        cp.style.strokeDasharray = len; cp.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 1500, easing: 'cubic-bezier(.6,0,.2,1)' }).onfinish = () => { cp.style.strokeDasharray = ''; };
        svg.querySelector('.die-fill').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 900, fill: 'backwards' });
        svg.querySelector('.die-crease').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 1100, fill: 'backwards' });
      }
      const c = FP.dieCalc(gm, st.gsm), th = (FLUTE[st.flute] || FLUTE.B).th;
      const set = (k, v) => { const e = host.querySelector(`[data-o="${k}"]`); if (e) e.textContent = v; };
      set('sheet', `${c.w} × ${c.h} mm`); set('area', c.m2.toFixed(3).replace('.', ',') + ' m²'); set('th', '≈ ' + String(th).replace('.', ',') + ' mm'); set('wt', fmtW(c.grams)); set('eff', c.eff + '%');
      host._gm = gm; host._state = st; host._calc = c; host.dispatchEvent(new CustomEvent('die:change', { detail: { gm, st, c } }));
      lastType = st.type;
    }
    function sync() {
      host.querySelectorAll('[data-k]').forEach((e) => { if (document.activeElement !== e) e.value = st[e.dataset.k]; });
      host.querySelectorAll('[data-r]').forEach((e) => { e.value = Math.min(st[e.dataset.r], +e.max); });
      host.querySelectorAll('.dw-types button').forEach((b) => { b.classList.toggle('on', b.dataset.t === st.type); b.setAttribute('aria-selected', b.dataset.t === st.type); });
      host.querySelectorAll('[data-seg="flute"] button').forEach((b) => b.classList.toggle('on', b.dataset.v === st.flute));
    }
    host.addEventListener('input', (e) => {
      const k = e.target.dataset.k || e.target.dataset.r; if (!k) return;
      const v = +String(e.target.value).replace(/\D/g, ''); if (!(v > 0)) return;
      st[k] = k === 'gsm' ? clamp(v, 100, 1500) : clamp(v, 10, 1500); sync(); draw(false);
    });
    host.addEventListener('click', (e) => {
      const tb = e.target.closest('.dw-types button'); if (tb) { st.type = tb.dataset.t; const dd = FP.DIE_DEFAULTS[st.type]; st.L = dd[0]; st.W = dd[1]; st.H = dd[2]; sync(); draw(true); return; }
      const fb = e.target.closest('[data-seg="flute"] button'); if (fb) { st.flute = fb.dataset.v; st.gsm = GSM_DEFAULT[st.flute]; sync(); draw(false); return; }
      const pb = e.target.closest('[data-p]'); if (pb) { const k = pb.dataset.p, base = FP.DIE_DEFAULTS[st.type], f = k === 's' ? .6 : k === 'l' ? 1.5 : 1; st.L = Math.round(base[0] * f); st.W = Math.round(base[1] * f); st.H = Math.round(base[2] * f); sync(); draw(false); return; }
      if (e.target.closest('.dw-q')) {
        const names = { rsc: 'studio.s.rsc', mailer: 'studio.s.mailer', tuck: 'studio.s.tuck' };
        FP.openQuote && FP.openQuote({ product: slug, dims: `${st.L} × ${st.W} × ${st.H} mm`, extra: [[FP.t('wa.style'), FP.t(names[st.type])], [FP.t('wa.flute'), st.flute], [FP.t('wa.sheet'), `${host._calc.w} × ${host._calc.h} mm`]] });
      }
    });
    new ResizeObserver(() => { if (host._rz) cancelAnimationFrame(host._rz); host._rz = requestAnimationFrame(() => draw(false)); }).observe(svg);
    host.addEventListener('die:set', (e) => { Object.assign(st, e.detail); sync(); draw(false); });
    sync();
    // الرسم الافتتاحي عند الظهور في الشاشة
    const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { io.disconnect(); draw(true); first = false; } }, { threshold: .25 });
    draw(false); io.observe(host);
    // تحريك تلقائي (الصفحة الرئيسية)
    if (opts.auto) {
      const presets = [[260, 180, 140], [420, 280, 220], [180, 120, 90], [340, 240, 300]], tag = document.createElement('div'); tag.className = 'dw-auto'; host.querySelector('.dw-view').appendChild(tag);
      let cur = presets[0].slice(), idx = 0, from = cur.slice(), to = presets[0], t0 = 0, vis = false, raf = 0;
      new IntersectionObserver((en) => { vis = en[0].isIntersecting; if (vis && !raf) raf = requestAnimationFrame(loop); }, { threshold: .1 }).observe(host);
      const ease = (t) => t * t * (3 - 2 * t);
      function loop(now) {
        raf = 0; if (!vis) return;
        if (!t0) t0 = now;
        if (now - (loop.last || 0) < 32) { raf = requestAnimationFrame(loop); return; } loop.last = now;
        const T = 3600, k = (now - t0) / T;
        if (k >= 1) { idx = (idx + 1) % presets.length; from = cur.slice(); to = presets[idx]; t0 = now; }
        const e = ease(Math.min(1, Math.max(0, ((now - t0) / T) * 1.7)));
        cur = [0, 1, 2].map((i) => Math.round(from[i] + (to[i] - from[i]) * e));
        st.L = cur[0]; st.W = cur[1]; st.H = cur[2]; draw(false);
        tag.textContent = `${cur[0]} × ${cur[1]} × ${cur[2]} mm`;
        raf = requestAnimationFrame(loop);
      }
    }
    return { st, draw, sync };
  };

  FP.mountAllDies = function (root) {
    (root || document).querySelectorAll('[data-die]').forEach((h) => { if (h.classList.contains('dl-host') || h.classList.contains('dl-studio')) { if (!h.dataset.mounted && h.offsetParent !== null || !h.dataset.mounted) { h.dataset.mounted = '1'; FP.mountDie(h); } } });
  };
})();
