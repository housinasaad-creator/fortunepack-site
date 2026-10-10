/*
  رسم المنتجات: SVG أيزومتري مولَّد بالكود (2D). كل منتج = shape + style.
  لا صور ولا نص مرسوم؛ الأشكال فقط. يُستدعى: FP.art(slug) أو FP.artSvg(shape, style, opts)
*/
(function () {
  const FP = (window.FP = window.FP || {});
  const C = Math.cos(Math.PI / 6), S2 = 0.5;
  const f1 = (n) => (Math.round(n * 10) / 10).toString();

  /* لوحات الألوان: t=أعلى، l=وجه أيسر، r=وجه أيمن (أغمق)، ink=حبر الطباعة، ln=خط الحافة */
  const PAL = {
    kraft: { t: '#dcb27d', l: '#c99c64', r: '#a97f4c', ink: '#2b1c0e', ln: 'rgba(60,35,10,.35)', in: '#8d6a3f', in2: '#7a5a34' },
    white: { t: '#ffffff', l: '#ecebe7', r: '#d2d0ca', ink: '#0b0b0c', ln: 'rgba(0,0,0,.22)', in: '#bdbab3', in2: '#a9a69f' },
    black: { t: '#34343a', l: '#1c1c20', r: '#0e0e10', ink: '#ffffff', ln: 'rgba(255,255,255,.14)', in: '#09090a', in2: '#050506' },
    red: { t: '#f6474d', l: '#ed1c24', r: '#b4121a', ink: '#ffffff', ln: 'rgba(0,0,0,.25)', in: '#7d0c11', in2: '#650a0e' },
    metal: { t: '#e9eef2', l: '#a9b3bb', r: '#6e7880', ink: '#0b0b0c', ln: 'rgba(0,0,0,.3)', in: '#59626a', in2: '#3f464c' },
    clear: { t: '#f1f7fb', l: '#d4e3ee', r: '#b6cddd', ink: '#0b0b0c', ln: 'rgba(50,90,125,.38)', in: '#8fa8bb', in2: '#7a93a6' }
  };
  /* style => [قاعدة، لون التمييز] */
  const STYLES = {
    'white-red': ['white', 'red'], 'black-red': ['black', 'red'], 'kraft-black': ['kraft', 'black'], 'white-black': ['white', 'black'],
    'kraft-red': ['kraft', 'red'], 'red-white': ['red', 'white'], 'kraft-plain': ['kraft', null], 'red-print': ['red', 'white'],
    'black-uv': ['black', 'uv'], 'black-foil': ['black', 'foil'], 'metal': ['metal', 'red'], 'red-black': ['red', 'black'], 'clear-red': ['clear', 'red']
  };
  const ACC = { red: '#ed1c24', black: '#0b0b0c', white: '#ffffff', uv: '#ffffff', foil: 'url(#g-foil)' };

  function mk() {
    const B = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 };
    const P = (x, y, z) => {
      const sx = (x - y) * C, sy = (x + y) * S2 - z;
      if (sx < B.x0) B.x0 = sx; if (sx > B.x1) B.x1 = sx; if (sy < B.y0) B.y0 = sy; if (sy > B.y1) B.y1 = sy;
      return [sx, sy];
    };
    return { B, P };
  }
  const pts = (a) => a.map((p) => f1(p[0]) + ',' + f1(p[1])).join(' ');
  const poly = (a, fill, extra) => `<polygon points="${pts(a)}" fill="${fill}"${extra ? ' ' + extra : ''}/>`;

  /* صندوق مصمت: يرجع svg + نقاط الزوايا. o = { top:false لفتح الأعلى, t: سُمك الجدار } */
  function box(ctx, x0, y0, z0, w, d, h, pal, o) {
    o = o || {};
    const P = ctx.P, id = o.id || '';
    const A = P(x0, y0 + d, z0), Bp = P(x0 + w, y0 + d, z0), Cp = P(x0 + w, y0, z0), Ht = P(x0, y0 + d, z0 + h), Ih = P(x0 + w, y0 + d, z0 + h), Jh = P(x0 + w, y0, z0 + h), Kh = P(x0, y0, z0 + h);
    let s = '';
    s += poly([A, Bp, Ih, Ht], o.fillL || pal.l, `stroke="${pal.ln}" stroke-width=".8" data-f="l"`);
    s += poly([Bp, Cp, Jh, Ih], o.fillR || pal.r, `stroke="${pal.ln}" stroke-width=".8" data-f="r"`);
    if (o.open) {
      const t = o.t || 3.2;
      const a2 = P(x0 + t, y0 + t, z0 + h), b2 = P(x0 + w - t, y0 + t, z0 + h), c2 = P(x0 + w - t, y0 + d - t, z0 + h), d2 = P(x0 + t, y0 + d - t, z0 + h);
      const zb = z0 + (o.floor == null ? 4 : o.floor);
      const fa = P(x0 + t, y0 + t, zb), fb = P(x0 + w - t, y0 + t, zb), fc = P(x0 + w - t, y0 + d - t, zb), fd = P(x0 + t, y0 + d - t, zb);
      s += poly([Kh, Jh, Ih, Ht], pal.t, `stroke="${pal.ln}" stroke-width=".8"`);                     // الحافة العليا (تُغطّى بالتجويف)
      s += poly([a2, b2, c2, d2], pal.in2);                                                           // تجويف
      s += poly([a2, b2, fb, fa], pal.in, 'opacity=".95"');                                            // جدار داخلي خلفي (y)
      s += poly([a2, d2, fd, fa], pal.in2, 'opacity=".95"');                                           // جدار داخلي (x)
      s += poly([fa, fb, fc, fd], pal.in2, 'opacity=".85"');                                           // قاع
    } else {
      s += poly([Ht, Ih, Jh, Kh], o.fillT || pal.t, `stroke="${pal.ln}" stroke-width=".8" data-f="t"`);
    }
    return { svg: s, A, Bp, Cp, Ht, Ih, Jh, Kh };
  }

  /* مصفوفة وجه: l = الوجه الأيسر (y=d)، r = الأيمن (x=w)، t = العلوي. الإحداثيات: u أفقي، v لأسفل */
  function faceMat(ctx, kind, x0, y0, z0, w, d, h) {
    const P = ctx.P;
    if (kind === 'l') { const o = P(x0, y0 + d, z0 + h); return `matrix(${f1(C)} ${f1(S2)} 0 1 ${f1(o[0])} ${f1(o[1])})`; }
    if (kind === 'r') { const o = P(x0 + w, y0 + d, z0 + h); return `matrix(${f1(C)} ${f1(-S2)} 0 1 ${f1(o[0])} ${f1(o[1])})`; }
    const o = P(x0, y0, z0 + h); return `matrix(${f1(C)} ${f1(S2)} ${f1(-C)} ${f1(S2)} ${f1(o[0])} ${f1(o[1])})`;   // t: u عبر x، v عبر y
  }
  const g = (m, inner, extra) => `<g transform="${m}"${extra ? ' ' + extra : ''}>${inner}</g>`;
  const markUse = (x, y, w, fill, op) => `<use href="#fp-mark-c" x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(w * 634 / 560)}" style="color:${fill}"${op ? ` opacity="${op}"` : ''}/>`;
  const bar = (x, y, w, h, fill, op) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(Math.min(h / 2, 1.6))}" fill="${fill}"${op ? ` opacity="${op}"` : ''}/>`;

  /* طباعة وجه أيسر: شعار + سطرا نص + شريط (موضع الشريط حسب o.band) */
  function printL(ctx, x0, y0, z0, w, d, h, pal, accName, o) {
    o = o || {};
    const m = faceMat(ctx, 'l', x0, y0, z0, w, d, h), band = o.band || 'bottom';
    let s = '';
    const mw = Math.min(h * .34, w * .24), mx = w * .12, my = band === 'top' ? h * .27 : band === 'mid' ? h * .07 : h * .18;
    const inkc = accName === 'uv' ? '#ffffff' : accName === 'foil' ? 'url(#g-foil)' : pal.ink;
    const markc = accName === 'foil' ? '#e3bb62' : accName === 'uv' ? '#ffffff' : (pal === PAL.red ? '#ffffff' : '#ed1c24');
    s += markUse(mx, my, mw, markc, accName === 'uv' ? .9 : null);
    s += bar(mx + mw + w * .05, my + mw * .22, w * .36, Math.max(2.4, h * .045), inkc, .9);
    s += bar(mx + mw + w * .05, my + mw * .5, w * .24, Math.max(2, h * .035), inkc, .5);
    const bandFill = accName === 'foil' ? 'url(#g-foil)' : accName === 'white' ? '#ffffff' : accName === 'black' ? '#0b0b0c' : '#ed1c24';
    if (accName && accName !== 'uv' && band !== 'none') {
      if (band === 'diag') s += `<polygon points="0,${f1(h * .66)} ${f1(w)},${f1(h * .44)} ${f1(w)},${f1(h * .58)} 0,${f1(h * .8)}" fill="${bandFill}"/>`;
      else s += bar(0, band === 'top' ? h * .06 : band === 'mid' ? h * .48 : h * .74, w, h * .1, bandFill, accName === 'white' ? .92 : 1);
    }
    if (accName === 'uv') { s += `<path d="M${f1(mx)} ${f1(h * .74)}H${f1(w - mx)}" stroke="rgba(255,255,255,.7)" stroke-width="${f1(h * .03)}"/><rect x="${f1(w * .08)}" y="${f1(h * .42)}" width="${f1(w * .84)}" height="${f1(h * .07)}" fill="url(#g-gloss)"/>`; }
    if (o.dots) s += glueDots(w, h, o.dots, pal);
    if (o.seam) s += `<rect x="${f1(w * .9)}" y="0" width="${f1(w * .04)}" height="${f1(h)}" fill="rgba(255,255,255,.18)"/><path d="M${f1(w * .9)} 0V${f1(h)}" stroke="${pal.ln}" stroke-width="1"/>`;
    return g(m, s, 'class="pr"');
  }
  /* نقاط الغراء: دوائر بيضاء بحلقة حمراء */
  const DOTS = { 1: [[.5, .5]], 2: [[.22, .5], [.78, .5]], 4: [[.1, .18], [.9, .18], [.1, .82], [.9, .82]], 6: [[.14, .2], [.5, .2], [.86, .2], [.14, .8], [.5, .8], [.86, .8]], 8: [[.1, .2], [.37, .2], [.63, .2], [.9, .2], [.1, .8], [.37, .8], [.63, .8], [.9, .8]] };
  function glueDots(w, h, n, pal) {
    return (DOTS[n] || []).map((q) => `<circle cx="${f1(w * q[0])}" cy="${f1(h * q[1])}" r="${f1(Math.max(2.6, Math.min(w, h) * .05))}" fill="#fff" stroke="#ed1c24" stroke-width="1.6"/>`).join('');
  }
  function printR(ctx, x0, y0, z0, w, d, h, pal, accName, o) {
    o = o || {}; const band = o.band || 'bottom';
    const m = faceMat(ctx, 'r', x0, y0, z0, w, d, h);
    let s = '';
    const acc = accName === 'foil' ? 'url(#g-foil)' : (ACC[accName] || pal.ink);
    s += bar(d * .12, h * .2, d * .32, Math.max(2.2, h * .04), pal.ink, .55) + bar(d * .12, h * .2 + h * .1, d * .2, Math.max(2, h * .03), pal.ink, .35);
    if (accName && accName !== 'uv' && band !== 'none') s += bar(0, band === 'top' ? h * .06 : band === 'mid' ? h * .48 : band === 'diag' ? h * .6 : h * .74, d, h * .1, acc === pal.ink ? '#ed1c24' : acc, accName === 'white' ? .92 : 1);
    s += markUse(d * .62, h * .12, Math.min(h * .26, d * .22), accName === 'foil' ? '#e3bb62' : (pal === PAL.red ? '#ffffff' : '#ed1c24'), .9);
    return g(m, s);
  }
  /* خطوط شريط لاصق/ التقاء الغطاء على السطح العلوي */
  function topLines(ctx, x0, y0, z0, w, d, h, pal, o) {
    const m = faceMat(ctx, 't', x0, y0, z0, w, d, h); let s = '';
    const ln = pal === PAL.black ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.28)';
    if (o.seam) s += `<path d="M0 ${f1(d / 2)}H${f1(w)}" stroke="${ln}" stroke-width="1.2"/><path d="M${f1(w * .08)} ${f1(d * .5)}V0M${f1(w * .08)} ${f1(d * .5)}V${f1(d)}M${f1(w * .92)} ${f1(d * .5)}V0M${f1(w * .92)} ${f1(d * .5)}V${f1(d)}" stroke="${ln}" stroke-width=".9"/>`;
    if (o.tape) s += `<rect x="0" y="${f1(d / 2 - d * .09)}" width="${f1(w)}" height="${f1(d * .18)}" fill="rgba(255,255,255,.34)"/>`;
    if (o.tuck) s += `<path d="M0 ${f1(d * .72)}H${f1(w)}" stroke="${ln}" stroke-width="1.2"/><path d="M${f1(w * .4)} ${f1(d * .72)}a${f1(w * .1)} ${f1(d * .1)} 0 0 0 ${f1(w * .2)} 0" fill="none" stroke="${ln}" stroke-width="1"/>`;
    if (o.mark) s += markUse(w * .36, d * .26, Math.min(w, d) * .28, o.mark);
    return g(m, s);
  }
  function shadow(ctx, cx, cy, rx, ry) { return `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="url(#g-sh)"/>`; }

  /* بلاستيك: أدوات مساعدة */
  const pal_l = (p) => p.l;
  const CUT = '#0c0c0e', noTop = (x) => x.replace(/<polygon[^>]+data-f="t"\/>/, '');
  function clearBag(ctx, pal, kind) {       // كيس شفاف (يظهر المحتوى خلفه)
    const w = 100, d = 9, h = 132, m = faceMat(ctx, 'l', 0, 0, 0, w, d, h);
    const items = [['#ed1c24', .12, .58, .2, .3], ['#f4f2ee', .38, .5, .22, .38], ['#0b0b0c', .66, .62, .2, .26]]
      .map((q) => `<rect x="${f1(w * q[1])}" y="${f1(h * q[2])}" width="${f1(w * q[3])}" height="${f1(h * q[4])}" rx="3" fill="${q[0]}" opacity=".92"/>`).join('');
    let s = g(m, items);
    s += box(ctx, 0, 0, 0, w, d, h, pal, { fillL: 'rgba(214,230,242,.5)', fillR: 'rgba(150,182,206,.72)', fillT: 'rgba(240,248,253,.85)' }).svg;
    let det = `<path d="M${f1(w * .12)} ${f1(h * .2)}L${f1(w * .19)} ${f1(h * .9)}" stroke="#fff" stroke-width="3.4" opacity=".6"/><path d="M0 ${f1(h * .95)}H${w}" stroke="rgba(30,70,110,.45)" stroke-width="1.2" stroke-dasharray="2 2"/>`;
    if (kind === 'flap') det += `<rect x="0" y="0" width="${w}" height="${f1(h * .11)}" fill="rgba(255,255,255,.72)"/><path d="M0 ${f1(h * .11)}H${w}" stroke="rgba(30,70,110,.5)" stroke-width="1"/><path d="M${f1(w * .78)} ${f1(h * .11)}h${f1(w * .1)}l${f1(-w * .05)} ${f1(h * .06)}z" fill="#ed1c24"/>`;
    else if (kind === 'zip') det += `<rect x="0" y="${f1(h * .1)}" width="${w}" height="${f1(h * .04)}" fill="rgba(255,255,255,.62)"/><path d="M0 ${f1(h * .1)}H${w}M0 ${f1(h * .14)}H${w}" stroke="rgba(30,70,110,.55)" stroke-width="1.1"/><rect x="${f1(w * .68)}" y="${f1(h * .085)}" width="${f1(w * .09)}" height="${f1(h * .07)}" rx="2" fill="#ed1c24"/><circle cx="${f1(w * .5)}" cy="${f1(h * .045)}" r="3.2" fill="${CUT}"/>`;
    else det += `<path d="M0 ${f1(h * .07)}H${w}" stroke="rgba(30,70,110,.4)" stroke-width="1" stroke-dasharray="3 3"/>`;
    return s + g(m, det);
  }

  /* ------- الأشكال ------- */
  const SHAPES = {
    carton(ctx, pal, acc, o) {
      o = o || {};
      const w = o.w || 92, d = o.d || 62, h = o.h || 128, b = box(ctx, 0, 0, 0, w, d, h, pal);
      let s = b.svg;
      if (o.tabs) {
        const m = faceMat(ctx, 't', 0, 0, 0, w, d, h), ln = pal === PAL.black ? 'rgba(255,255,255,.28)' : 'rgba(0,0,0,.3)';
        s += g(m, `<path d="M0 ${f1(d * .7)}H${f1(w)}" stroke="${ln}" stroke-width="1.2"/>` + [.16, .56].map((u) => `<path d="M${f1(w * u)} ${f1(d * .7)}l${f1(w * .03)} ${f1(d * .12)}h${f1(w * .2)}l${f1(w * .03)} ${f1(-d * .12)}" fill="rgba(0,0,0,.08)" stroke="${ln}" stroke-width="1"/>`).join(''));
      } else if (o.cross) {
        const m = faceMat(ctx, 't', 0, 0, 0, w, d, h), ln = pal === PAL.black ? 'rgba(255,255,255,.26)' : 'rgba(0,0,0,.3)';
        s += g(m, `<path d="M0 0L${f1(w)} ${f1(d)}M${f1(w)} 0L0 ${f1(d)}M0 ${f1(d / 2)}H${f1(w)}" stroke="${ln}" stroke-width="1.1"/>`);
      } else s += topLines(ctx, 0, 0, 0, w, d, h, pal, { tuck: 1 });
      return s + printL(ctx, 0, 0, 0, w, d, h, pal, acc, o) + printR(ctx, 0, 0, 0, w, d, h, pal, acc, o);
    },
    tray(ctx, pal, acc, o) {
      const w = 150, d = 104, h = 46, b = box(ctx, 0, 0, 0, w, d, h, pal, { open: 1, t: 3, floor: 3 });
      return b.svg + printL(ctx, 0, 0, 0, w, d, h, pal, acc, o) + printR(ctx, 0, 0, 0, w, d, h, pal, acc, o);
    },
    fry(ctx, pal, acc) {
      const w = 84, d = 40, h = 96;
      const P = ctx.P; let s = '';
      // أعواد البطاطا
      const sticks = [[10, 8, 48], [18, 22, 58], [28, 10, 64], [36, 28, 54], [44, 14, 70], [52, 26, 60], [62, 12, 52], [70, 24, 62], [24, 18, 44], [58, 20, 46]];
      let st = '';
      sticks.forEach((q, i) => {
        const x = q[0], y = q[1], hh = q[2], wd = 6.4, c = i % 3 ? '#f4c542' : '#e9b231';
        const a = P(x, y, h - 18), b2 = P(x + wd, y, h - 18), c2 = P(x + wd, y, h - 18 + hh * .62), d2 = P(x, y, h - 18 + hh * .62);
        st += poly([a, b2, c2, d2], c, 'stroke="rgba(120,70,0,.35)" stroke-width=".5"');
        const t0 = P(x, y, h - 18 + hh * .62), t1 = P(x + wd, y, h - 18 + hh * .62), t2 = P(x + wd, y + wd, h - 18 + hh * .62), t3 = P(x, y + wd, h - 18 + hh * .62);
        st += poly([t0, t1, t2, t3], '#ffd966');
      });
      // المقدّمة المنخفضة (فتحة): نرسم الوجه الأيسر ثم نقصّه بمنحنى
      const A = P(0, d, 0), Bp = P(w, d, 0), Ih = P(w, d, h), Ht = P(0, d, h);
      const dip = P(w / 2, d, h * .58), cA = P(w * .16, d, h), cB = P(w * .84, d, h);
      s = box(ctx, 0, 0, 0, w, d, h, pal, { open: 1, t: 2.6, floor: 6 }).svg;
      s += st;
      s += `<path d="M${f1(A[0])} ${f1(A[1])}L${f1(Bp[0])} ${f1(Bp[1])}L${f1(Ih[0])} ${f1(Ih[1])}L${f1(cB[0])} ${f1(cB[1])}Q${f1(dip[0])} ${f1(dip[1] + 16)} ${f1(cA[0])} ${f1(cA[1])}L${f1(Ht[0])} ${f1(Ht[1])}Z" fill="${pal.l}" stroke="${pal.ln}" stroke-width=".8"/>`;
      return s + printL(ctx, 0, 0, 0, w, d, h * .62, pal, acc) + printR(ctx, 0, 0, 0, w, d, h, pal, acc);
    },
    rsc(ctx, pal, acc, o) {
      o = o || {};
      const w = 132, d = 96, h = 92, b = box(ctx, 0, 0, 0, w, d, h, pal);
      let s = b.svg + topLines(ctx, 0, 0, 0, w, d, h, pal, { seam: 1, tape: !o.noTape });
      // شريط لاصق ينزل على الوجه الأيسر والأيمن
      if (!o.noTape) {
        const m = faceMat(ctx, 'l', 0, 0, 0, w, d, h);
        s += g(m, `<rect x="${f1(w * .5 - 7)}" y="0" width="14" height="${f1(h * .24)}" fill="rgba(255,255,255,.32)"/>`);
      }
      if (acc) s += printL(ctx, 0, 0, 0, w, d, h * (o.big ? 1 : .96), pal, acc); else s += g(faceMat(ctx, 'l', 0, 0, 0, w, d, h), markUse(w * .15, h * .5, h * .3, 'rgba(60,35,10,.55)') + bar(w * .15 + h * .36, h * .56, w * .34, 3, 'rgba(60,35,10,.5)') + bar(w * .15 + h * .36, h * .56 + 8, w * .22, 2.4, 'rgba(60,35,10,.32)'));
      s += printR(ctx, 0, 0, 0, w, d, h, pal, acc ? 'x' : null);
      return s;
    },
    telescope(ctx, pal, acc) {
      const w = 138, d = 98, h = 40, lz = 56;
      let s = box(ctx, 2, 2, 0, w - 4, d - 4, h, pal).svg;
      const b2 = box(ctx, -3, -3, lz, w + 6, d + 6, 46, pal);
      s += b2.svg + printL(ctx, -3, -3, lz, w + 6, d + 6, 46, pal, acc) + printR(ctx, -3, -3, lz, w + 6, d + 6, 46, pal, acc);
      s += topLines(ctx, -3, -3, lz, w + 6, d + 6, 46, pal, { mark: pal === PAL.black ? '#ed1c24' : '#ed1c24' });
      return s;
    },
    window(ctx, pal, acc, o) {
      o = o || {};
      const w = 120, d = 66, h = 116, b = box(ctx, 0, 0, 0, w, d, h, pal);
      let s = b.svg + topLines(ctx, 0, 0, 0, w, d, h, pal, { tuck: 1 });
      const m = faceMat(ctx, 'l', 0, 0, 0, w, d, h), ww = w * .62, wh = h * .42, wx = w * .19, wy = h * .2;
      s += g(m, `<rect x="${f1(wx - 3)}" y="${f1(wy - 3)}" width="${f1(ww + 6)}" height="${f1(wh + 6)}" rx="6" fill="${pal.ink}" opacity=".18"/>` +
        `<rect x="${f1(wx)}" y="${f1(wy)}" width="${f1(ww)}" height="${f1(wh)}" rx="5" fill="${o.open ? '#0e0e10' : '#cfe3ea'}" opacity="${o.open ? 1 : .55}" stroke="${pal.ink}" stroke-opacity=".5" stroke-width=".9"/>` +
        // منتج داخل النافذة (أرغفة/ملبّسات)
        `<g>${['#e4572e', '#f4c542', '#7bb661', '#ed1c24', '#f4c542', '#d33'].map((c, i) => `<circle cx="${f1(wx + ww * (.18 + (i % 3) * .32))}" cy="${f1(wy + wh * (i < 3 ? .34 : .72))}" r="${f1(wh * .17)}" fill="${c}"/>`).join('')}</g>` +
        (o.open ? '' : `<path d="M${f1(wx + ww * .12)} ${f1(wy + wh)}L${f1(wx + ww * .52)} ${f1(wy)}" stroke="#fff" stroke-opacity=".5" stroke-width="5"/>`) +
        bar(w * .19, h * .7, w * .34, 3.4, pal.ink, .85) + bar(w * .19, h * .7 + 9, w * .22, 2.6, pal.ink, .5) + markUse(w * .74, h * .66, h * .16, '#ed1c24'));
      s += printR(ctx, 0, 0, 0, w, d, h, pal, acc);
      return s;
    },
    windowopen(ctx, pal, acc) { return SHAPES.window(ctx, pal, acc, { open: 1 }); },
    carry(ctx, pal, acc) {
      const w = 132, d = 92, h = 88, b = box(ctx, 0, 0, 0, w, d, h, pal);
      let s = b.svg + topLines(ctx, 0, 0, 0, w, d, h, pal, { seam: 1 });
      s += printL(ctx, 0, 0, 0, w, d, h, pal, acc);
      s += printR(ctx, 0, 0, 0, w, d, h, pal, acc);
      // فتحة المقبض على الوجه الأيمن (مقطوعة)
      const m = faceMat(ctx, 'r', 0, 0, 0, w, d, h);
      s += g(m, `<rect x="${f1(d * .28)}" y="${f1(h * .12)}" width="${f1(d * .44)}" height="${f1(h * .13)}" rx="${f1(h * .065)}" fill="#0c0c0e" stroke="rgba(0,0,0,.4)" stroke-width="1"/><rect x="${f1(d * .28)}" y="${f1(h * .12 + h * .1)}" width="${f1(d * .44)}" height="${f1(h * .035)}" rx="${f1(h * .018)}" fill="${pal.r}" opacity=".95"/>`);
      return s;
    },
    pizza(ctx, pal, acc) {
      const w = 168, d = 168, h = 20, b = box(ctx, 0, 0, 0, w, d, h, pal);
      let s = b.svg;
      const m = faceMat(ctx, 't', 0, 0, 0, w, d, h), cx = w / 2, cy = d / 2, ink = pal === PAL.kraft ? 'rgba(43,28,14,.6)' : pal.ink;
      let pz = `<circle cx="${cx}" cy="${cy}" r="${f1(w * .38)}" fill="none" stroke="${ink}" stroke-width="2.2"/><circle cx="${cx}" cy="${cy}" r="${f1(w * .32)}" fill="${pal === PAL.kraft ? 'rgba(237,28,36,.16)' : 'rgba(237,28,36,.25)'}" stroke="${ink}" stroke-opacity=".5" stroke-width="1"/>`;
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; pz += `<path d="M${cx} ${cy}L${f1(cx + Math.cos(a) * w * .32)} ${f1(cy + Math.sin(a) * w * .32)}" stroke="${ink}" stroke-opacity=".5" stroke-width="1.2"/>`; }
      [[.12, .1], [-.14, .06], [.04, -.16], [-.06, .17], [.2, -.1], [-.2, -.08]].forEach((q) => { pz += `<circle cx="${f1(cx + q[0] * w)}" cy="${f1(cy + q[1] * w)}" r="${f1(w * .034)}" fill="#ed1c24" opacity=".85"/>`; });
      pz += `<rect x="${f1(w * .1)}" y="${f1(d * .06)}" width="${f1(w * .3)}" height="5" rx="2.5" fill="${ink}" opacity=".5"/>`;
      s += g(m, pz);
      s += g(faceMat(ctx, 'l', 0, 0, 0, w, d, h), bar(w * .12, h * .3, w * .28, 3, ink, .5) + markUse(w * .8, h * .22, h * .5, '#ed1c24'));
      return s;
    },
    cosmetic(ctx, pal, acc) {
      // علبتان جنباً إلى جنب: طويلة رفيعة + صغيرة
      const w = 62, d = 44, h = 138, b = box(ctx, 0, 0, 0, w, d, h, pal);
      let s = b.svg + topLines(ctx, 0, 0, 0, w, d, h, pal, { tuck: 1 }) + printL(ctx, 0, 0, 0, w, d, h, pal, acc) + printR(ctx, 0, 0, 0, w, d, h, pal, acc);
      const sp = pal === PAL.white ? PAL.red : PAL.white, x0 = 76, y0 = 2, sw = 54, sd = 40, sh = 72;
      s += box(ctx, x0, y0, 0, sw, sd, sh, sp).svg + g(faceMat(ctx, 'l', x0, y0, 0, sw, sd, sh), markUse(sw * .3, sh * .3, 18, pal === PAL.white ? '#ffffff' : '#ed1c24')) + printR(ctx, x0, y0, 0, sw, sd, sh, sp, null);
      return s;
    },
    display(ctx, pal, acc) {
      const w = 128, d = 92; let s = '';
      // ظهر الستاند + لوحة العنوان
      const back = box(ctx, 0, 0, 0, w, 8, 178, PAL.kraft); s += back.svg;
      s += g(faceMat(ctx, 'l', 0, 0, 0, w, 8, 178), `<rect x="0" y="0" width="${w}" height="46" fill="#ed1c24"/>` + markUse(w * .08, 6, 34, '#ffffff') + bar(w * .08 + 44, 14, w * .38, 5, '#ffffff', .95) + bar(w * .08 + 44, 26, w * .24, 3.4, '#ffffff', .7));
      const tiers = [[0, 92, 34], [0, 70, 76], [0, 48, 118]];
      tiers.forEach((q, i) => {
        const z = q[2] - 34 + 0, dd = q[1];
        const pl = box(ctx, 0, 8, z, w, dd - 8, 6, PAL.kraft); s += pl.svg;
        const pr = box(ctx, 0, 8 + (dd - 8) - 8, z + 6, w, 8, 14, PAL.kraft); s += pr.svg;
        // علب صغيرة على الرف
        const cols = [pal, PAL.white, PAL.red];
        for (let k = 0; k < 3; k++) { const bx = 8 + k * 40, bd = Math.min(26, dd - 24); const bb = box(ctx, bx, 14, z + 6, 30, bd, 26 + (k % 2) * 6, cols[(k + i) % 3] || PAL.white); s += bb.svg + g(faceMat(ctx, 'l', bx, 14, z + 6, 30, bd, 26 + (k % 2) * 6), markUse(7, 6, 11, (cols[(k + i) % 3] === PAL.red) ? '#fff' : '#ed1c24')); }
      });
      s += box(ctx, 0, 0, -0.2, w, d, 0.4, PAL.kraft).svg.replace(/<polygon[^>]+data-f="t"\/>/, '');
      return s;
    },
    /* ---- بلاستيك ونايلون (ثخانة رقيقة) ---- */
    bag(ctx, pal, acc) {      // كيس نايلون مسطّح
      const w = 98, d = 9, h = 134, b = box(ctx, 0, 0, 0, w, d, h, pal);
      return b.svg + g(faceMat(ctx, 'l', 0, 0, 0, w, d, h),
        `<path d="M0 ${f1(h * .1)}H${w}" stroke="rgba(30,70,110,.5)" stroke-width="1.5" stroke-dasharray="4 3"/>` +
        markUse(w * .3, h * .34, w * .4, '#ed1c24') + bar(w * .2, h * .78, w * .6, 3.4, '#0b0b0c', .85) + bar(w * .3, h * .78 + 9, w * .4, 2.6, '#0b0b0c', .45) +
        `<path d="M${f1(w * .13)} ${f1(h * .2)}L${f1(w * .2)} ${f1(h * .9)}" stroke="#fff" stroke-width="3.4" opacity=".6"/>`);
    },
    carrier(ctx, pal, acc) {  // كيس حمل بمقبض
      const w = 112, d = 34, h = 132, b = box(ctx, 0, 0, 0, w, d, h, pal);
      return b.svg + g(faceMat(ctx, 'l', 0, 0, 0, w, d, h),
        `<rect x="${f1(w * .3)}" y="${f1(h * .06)}" width="${f1(w * .4)}" height="${f1(h * .13)}" rx="${f1(h * .065)}" fill="#0c0c0e" stroke="rgba(0,0,0,.4)" stroke-width="1"/>` +
        markUse(w * .12, h * .42, w * .22, '#ffffff') + bar(w * .42, h * .5, w * .42, 3.6, '#ffffff', .95) + bar(w * .42, h * .5 + 10, w * .28, 2.8, '#ffffff', .6)) + printR(ctx, 0, 0, 0, w, d, h, pal, null);
    },
    pouch(ctx, pal, acc) {    // كيس مضلّع (بطن) مع رباط
      const w = 86, d = 54, h = 118, b = box(ctx, 0, 0, 0, w, d, h, pal), P = ctx.P;
      let s = b.svg + g(faceMat(ctx, 'l', 0, 0, 0, w, d, h),
        `<path d="M0 ${f1(h * .1)}H${w}" stroke="rgba(255,255,255,.28)" stroke-width="1.2"/>` +
        markUse(w * .14, h * .34, w * .3, '#ed1c24') + bar(w * .52, h * .42, w * .34, 3.4, '#ffffff', .9) + bar(w * .52, h * .42 + 9, w * .22, 2.6, '#ffffff', .5) + bar(0, h * .74, w, h * .1, '#ed1c24', 1));
      const a = P(w * .4, d, h * .96), c = P(w * .6, d, h * .96);
      s += `<path d="M${f1(a[0])} ${f1(a[1])}Q${f1((a[0] + c[0]) / 2)} ${f1(a[1] + 16)} ${f1(c[0])} ${f1(c[1])}" fill="none" stroke="#ed1c24" stroke-width="2.2" stroke-linecap="round"/>`;
      return s;
    },
    sack(ctx, pal, acc) {     // جوال منسوج
      const w = 112, d = 50, h = 150, b = box(ctx, 0, 0, 0, w, d, h, pal);
      let wl = '', wr2 = '';
      for (let i = 0; i < w; i += 5) wl += `M${i} 0V${h}`;
      for (let j = 0; j < h; j += 5) wl += `M0 ${j}H${w}`;
      for (let i = 0; i < d; i += 5) wr2 += `M${i} 0V${h}`;
      for (let j = 0; j < h; j += 5) wr2 += `M0 ${j}H${d}`;
      return b.svg + g(faceMat(ctx, 'l', 0, 0, 0, w, d, h),
        `<path d="${wl}" stroke="rgba(0,0,0,.09)" stroke-width=".8" fill="none"/><path d="M0 ${f1(h * .05)}H${w}" stroke="#ed1c24" stroke-width="2" stroke-dasharray="3 2.5"/>` +
        markUse(w * .14, h * .22, w * .3, '#ed1c24') + bar(w * .52, h * .3, w * .34, 3.8, '#0b0b0c', .85) + bar(w * .52, h * .3 + 10, w * .22, 2.8, '#0b0b0c', .45) + bar(0, h * .66, w, h * .12, '#ed1c24', 1)) +
        g(faceMat(ctx, 'r', 0, 0, 0, w, d, h), `<path d="${wr2}" stroke="rgba(0,0,0,.12)" stroke-width=".8" fill="none"/><path d="M0 ${f1(h * .05)}H${d}" stroke="#ed1c24" stroke-width="2" stroke-dasharray="3 2.5"/>`);
    },
    bagplain(ctx, pal) { return clearBag(ctx, pal, 'plain'); },
    bagflap(ctx, pal) { return clearBag(ctx, pal, 'flap'); },
    bagzip(ctx, pal) { return clearBag(ctx, pal, 'zip'); },
    roll(ctx, pal) {          // رول أكياس قمامة
      const r = 40, h = 66, RX = 1.2247 * r, RY = .7071 * r, top = ctx.P(r, r, h), bot = ctx.P(r, r, 0), B = ctx.B, tx = top[0], ty = top[1], bx = bot[0], by = bot[1];
      B.x0 = Math.min(B.x0, tx - RX); B.x1 = Math.max(B.x1, tx + RX); B.y0 = Math.min(B.y0, ty - RY); B.y1 = Math.max(B.y1, by + RY);
      const body = `M${f1(tx - RX)} ${f1(ty)}L${f1(bx - RX)} ${f1(by)}A${f1(RX)} ${f1(RY)} 0 0 0 ${f1(bx + RX)} ${f1(by)}L${f1(tx + RX)} ${f1(ty)}Z`;
      const half = `M${f1(tx)} ${f1(ty)}L${f1(bx)} ${f1(by)}A${f1(RX)} ${f1(RY)} 0 0 0 ${f1(bx + RX)} ${f1(by)}L${f1(tx + RX)} ${f1(ty)}Z`;
      const band = (z, c, wd) => `<path d="M${f1(bx - RX)} ${f1(by - z)}A${f1(RX)} ${f1(RY)} 0 0 0 ${f1(bx + RX)} ${f1(by - z)}" fill="none" stroke="${c}" stroke-width="${wd}"/>`;
      return `<path d="${body}" fill="${pal_l(pal)}" stroke="${pal.ln}" stroke-width=".8"/><path d="${half}" fill="rgba(0,0,0,.32)"/>` + band(h * .3, '#ed1c24', 4) + band(h * .66, '#ed1c24', 4) + band(h * .92, 'rgba(255,255,255,.55)', 1.2).replace('fill="none"', 'fill="none" stroke-dasharray="3 3"') +
        `<ellipse cx="${f1(tx)}" cy="${f1(ty)}" rx="${f1(RX)}" ry="${f1(RY)}" fill="${pal.t}" stroke="${pal.ln}" stroke-width=".8"/><ellipse cx="${f1(tx)}" cy="${f1(ty)}" rx="${f1(RX * .36)}" ry="${f1(RY * .36)}" fill="#050506"/>` +
        markUse(bx - 11, by - h * .62 + RY * .35, 22, '#ed1c24');
    },
    tee(ctx, pal) {           // كيس حمل بحمّالات (أتلت)
      const w = 104, d = 10, h = 136, bh = h * .8, sw = w * .17;
      let s = noTop(box(ctx, 0, 0, 0, w, d, bh, pal).svg) + box(ctx, w * .13, 0, bh, sw, d, h - bh, pal).svg + box(ctx, w * .7, 0, bh, sw, d, h - bh, pal).svg;
      const m = faceMat(ctx, 'l', 0, 0, 0, w, d, bh);
      return s + g(m, `<path d="M${f1(w * .3)} 0C${f1(w * .3)} ${f1(bh * .17)} ${f1(w * .7)} ${f1(bh * .17)} ${f1(w * .7)} 0Z" fill="${CUT}"/>` +
        markUse(w * .16, bh * .3, w * .26, '#ed1c24') + bar(w * .5, bh * .36, w * .34, 3.4, pal.ink, .85) + bar(w * .5, bh * .36 + 9, w * .22, 2.6, pal.ink, .45) + bar(0, bh * .78, w, bh * .1, '#ed1c24', 1));
    },
    drawstring(ctx, pal) {    // كيس بحبل شدّ
      const w = 86, d = 44, h = 120, m = faceMat(ctx, 'l', 0, 0, 0, w, d, h), cord = pal === PAL.red ? '#ffffff' : '#ed1c24';
      return noTop(box(ctx, 0, 0, 0, w, d, h, pal).svg) + g(m,
        `<path d="M0 0H${f1(w * .3)}C${f1(w * .3)} ${f1(h * .1)} ${f1(w * .12)} ${f1(h * .12)} 0 ${f1(h * .22)}Z" fill="${CUT}"/><path d="M${w} 0H${f1(w * .7)}C${f1(w * .7)} ${f1(h * .1)} ${f1(w * .88)} ${f1(h * .12)} ${w} ${f1(h * .22)}Z" fill="${CUT}"/>` +
        `<path d="M${f1(w * .3)} ${f1(h * .05)}Q${f1(w * .5)} ${f1(h * .2)} ${f1(w * .7)} ${f1(h * .05)}" fill="none" stroke="${cord}" stroke-width="2.4" stroke-linecap="round"/><path d="M${f1(w * .46)} ${f1(h * .13)}q${f1(-w * .06)} ${f1(h * .12)} ${f1(-w * .02)} ${f1(h * .2)}M${f1(w * .54)} ${f1(h * .13)}q${f1(w * .06)} ${f1(h * .12)} ${f1(w * .02)} ${f1(h * .2)}" fill="none" stroke="${cord}" stroke-width="2.2" stroke-linecap="round"/>` +
        markUse(w * .3, h * .4, w * .4, pal === PAL.red ? '#ffffff' : '#ed1c24') + bar(w * .22, h * .78, w * .56, 3.4, pal.ink, .85) + bar(w * .32, h * .78 + 9, w * .36, 2.6, pal.ink, .45));
    },
    bigbag(ctx, pal) {        // بيغ باغ (جوال كبير بعراوي)
      const w = 104, d = 104, h = 112, P = ctx.P;
      let wl = '', wr2 = '';
      for (let i = 0; i < w; i += 6) wl += `M${i} 0V${h}`;
      for (let j = 0; j < h; j += 6) wl += `M0 ${j}H${w}`;
      for (let i = 0; i < d; i += 6) wr2 += `M${i} 0V${h}`;
      for (let j = 0; j < h; j += 6) wr2 += `M0 ${j}H${d}`;
      let s = box(ctx, 0, 0, 0, w, d, h, pal).svg + g(faceMat(ctx, 'l', 0, 0, 0, w, d, h),
        `<path d="${wl}" stroke="rgba(0,0,0,.08)" stroke-width=".8" fill="none"/>` + markUse(w * .12, h * .2, w * .26, '#ed1c24') + bar(w * .46, h * .28, w * .4, 3.8, pal.ink, .85) + bar(w * .46, h * .28 + 10, w * .26, 2.8, pal.ink, .45) + bar(0, h * .62, w, h * .12, '#ed1c24', 1)) +
        g(faceMat(ctx, 'r', 0, 0, 0, w, d, h), `<path d="${wr2}" stroke="rgba(0,0,0,.12)" stroke-width=".8" fill="none"/>`);
      [[0, 0], [0, d], [w, 0], [w, d]].forEach((c) => {
        const a = P(c[0], c[1], h), t = P(c[0], c[1], h + 36);
        s += `<path d="M${f1(a[0] - 8)} ${f1(a[1])}L${f1(a[0] - 8)} ${f1(t[1] + 8)}Q${f1(a[0] - 8)} ${f1(t[1])} ${f1(a[0])} ${f1(t[1])}Q${f1(a[0] + 8)} ${f1(t[1])} ${f1(a[0] + 8)} ${f1(t[1] + 8)}L${f1(a[0] + 8)} ${f1(a[1])}" fill="none" stroke="#dcd9d2" stroke-width="5" stroke-linejoin="round"/>`;
      });
      return s;
    },
    mailer(ctx, pal, acc) {
      const w = 146, d = 102, h = 34, P = ctx.P;
      // غطاء مفتوح للخلف
      const A = P(0, 0, h), Bp = P(w, 0, h), Cc = P(w, -36, h + 62), Dd = P(0, -36, h + 62);
      let s = poly([A, Bp, Cc, Dd], pal === PAL.kraft ? PAL.kraft.in : pal.l, `stroke="${pal.ln}" stroke-width=".8"`);
      s += `<polygon points="${pts([A, Bp, Cc, Dd])}" fill="url(#g-sh2)" opacity=".5"/>`;
      const b = box(ctx, 0, 0, 0, w, d, h, pal, { open: 1, t: 3, floor: 2 });
      s += b.svg;
      s += printL(ctx, 0, 0, 0, w, d, h, pal, acc);
      s += printR(ctx, 0, 0, 0, w, d, h, pal, acc);
      // لسان الإغلاق الأمامي
      const m = faceMat(ctx, 'l', 0, 0, 0, w, d, h);
      s += g(m, `<path d="M${f1(w * .36)} 0v-5q${f1(w * .14)} -7 ${f1(w * .28)} 0v5" fill="none" stroke="${pal.ln}" stroke-width="1"/>`);
      return s;
    }
  };

  /* تنويعات حسب المنتج: أبعاد + شريط + نقاط غراء */
  const VAR = {
    'katlanir-karton': { w: 92, d: 62, h: 128 },
    'tek-nokta-yapistirmali': { w: 66, d: 48, h: 152, seam: 1, dots: 1, band: 'top' },
    'iki-nokta-yandan-yapistirmali': { w: 108, d: 84, h: 96, dots: 2, band: 'none' },
    'crash-lock-otomatik-taban': { w: 126, d: 72, h: 78, cross: 1, band: 'mid' },
    'alti-nokta-yapistirmali': { w: 124, d: 98, h: 112, dots: 6, band: 'diag' },
    'sekiz-nokta-yapistirmali': { w: 146, d: 104, h: 100, dots: 8, band: 'bottom' },
    'yapistirmasiz-katlanir': { w: 100, d: 70, h: 114, tabs: 1, band: 'none' },
    'dort-kose-yapistirmali': { dots: 4, band: 'mid' },
    'spot-uv-kutular': { w: 100, d: 60, h: 138 },
    'sicak-yaldiz': { w: 86, d: 86, h: 86, band: 'none' },
    'metalize-selefon': { w: 112, d: 72, h: 126, band: 'diag' }
  };
  const DEFS = '<defs><linearGradient id="g-foil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f5d98b"/><stop offset=".5" stop-color="#c79a3b"/><stop offset="1" stop-color="#f1d279"/></linearGradient>' +
    '<linearGradient id="g-gloss" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
    '<radialGradient id="g-sh"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="g-sh2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>' +
    '<linearGradient id="g-met" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f9fb"/><stop offset=".45" stop-color="#9ea9b1"/><stop offset="1" stop-color="#e3e9ee"/></linearGradient></defs>';

  function artSvg(shape, style, o) {
    o = o || {};
    const fn = SHAPES[shape] || SHAPES.carton, st = STYLES[style] || STYLES['white-red'];
    const ctx = mk(); const pal = PAL[st[0]];
    let body = fn(ctx, pal, st[1], Object.assign({ big: 1 }, o.v || {}));
    if (st[0] === 'metal') body = body.replace(new RegExp(pal.l.replace('#', '#'), 'g'), 'url(#g-met)');
    const B = ctx.B, pad = 22, cx = (B.x0 + B.x1) / 2;
    const vx = B.x0 - pad, vy = B.y0 - pad, vw = B.x1 - B.x0 + pad * 2, vh = B.y1 - B.y0 + pad * 2 + 22;
    const sh = shadow(ctx, cx, B.y1 - 6, (B.x1 - B.x0) * .56, 14);
    return `<svg class="art-svg" viewBox="${f1(vx)} ${f1(vy)} ${f1(vw)} ${f1(vh)}" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">${DEFS}${sh}<g class="art-g">${body}</g></svg>`;
  }

  FP.artSvg = artSvg;
  FP.art = function (slug, o) {
    const p = (FP_DATA.products || []).find((q) => q.slug === slug); if (!p) return '';
    return artSvg(p.shape, p.style, Object.assign({ v: VAR[slug] }, o || {}));
  };
  /* الرسوم تُركَّب عند اقتراب البطاقة من الشاشة وتُفرَّغ عند ابتعادها (توفير ذاكرة) */
  const artIO = new IntersectionObserver((en) => en.forEach((x) => {
    const e = x.target;
    if (x.isIntersecting) { if (!e.firstChild) e.innerHTML = e.dataset.shape ? FP.artSvg(e.dataset.shape, e.dataset.style) : FP.art(e.dataset.art); }
    else if (e.firstChild) e.innerHTML = '';
  }), { rootMargin: '1300px 0px' });
  FP.mountArt = function (root) {
    (root || document).querySelectorAll('[data-art],[data-shape]').forEach((e) => { if (!e._ao) { e._ao = 1; artIO.observe(e); } });
  };
})();
