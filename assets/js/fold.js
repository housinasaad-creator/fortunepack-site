(function () {
const FP = (window.FP = window.FP || {});
/*
  هيرو الطيّ: لوح كرتون مسطح بخطوط القص (أحمر) والطيّ (متقطع) يتحوّل مع التمرير إلى علبة سوداء مطبوعة.
  كل شيء CSS ثلاثي الأبعاد خفيف (بدون WebGL). التقدّم p (0..1) دالة حتمية، فيعمل للأمام والخلف.
  الوجه الأمامي لكل لوح (كرتون خام) هو ما يُرى وهو مسطح؛ الوجه الخلفي (المطبوع) يصبح الوجه الخارجي للعلبة عند الطيّ.
*/
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1), ss = (t) => t * t * (3 - 2 * t), lerp = (a, b, t) => a + (b - a) * t;

function createFold(host, opts = {}) {
  const W = 250, D = 176, H = 122, LT = 34;      // أبعاد العلبة: العرض × العمق × الارتفاع، ولسان الإغلاق
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  host.innerHTML = '';
  const scene = el('div', 'fold-scene'), net = el('div', 'fold-net'); scene.appendChild(net); host.appendChild(scene);

  /* لوح بوجهين: front = كرتون خام (داخل)، back = مطبوع (خارج) */
  function panel(w, h, cls, print) {
    const p = el('div', 'fp ' + cls); p.style.width = w + 'px'; p.style.height = h + 'px';
    const f = el('div', 'fp-f'), b = el('div', 'fp-b ' + (print || '')); p.append(f, b); return { p, f, b };
  }
  const bottom = panel(W, D, 'fp-bottom', 'pr-bottom'), front = panel(W, H, 'fp-front', 'pr-front'), back = panel(W, H, 'fp-back', 'pr-back');
  const left = panel(H, D, 'fp-left', 'pr-side'), right = panel(H, D, 'fp-right', 'pr-side'), lid = panel(W, D, 'fp-lid', 'pr-lid'), tuck = panel(W - 18, LT, 'fp-tuck', 'pr-tuck');
  // شعار على الجدران المطبوعة: داخل الوجه الخلفي
  const wrap = (html) => `<div class="pr-in">${html}</div>`;
  front.b.innerHTML = wrap('<img src="assets/img/logo-light.svg" alt="" class="pr-logo">'); lid.b.innerHTML = wrap('<img src="assets/img/logo-mark.svg" alt="" class="pr-mark">'); left.b.innerHTML = right.b.innerHTML = wrap('<img src="assets/img/logo-mark.svg" alt="" class="pr-mark s">');
  back.b.innerHTML = wrap('<span class="pr-stripe"></span>'); bottom.b.innerHTML = wrap('<img src="assets/img/logo-mark.svg" alt="" class="pr-mark s">');

  // التسلسل الهرمي للمفاصل (المركز = منتصف القاعدة)
  bottom.p.style.left = (-W / 2) + 'px'; bottom.p.style.top = (-D / 2) + 'px'; net.appendChild(bottom.p);
  front.p.style.left = '0'; front.p.style.top = D + 'px'; front.p.style.transformOrigin = '50% 0'; bottom.p.appendChild(front.p);
  back.p.style.left = '0'; back.p.style.top = (-H) + 'px'; back.p.style.transformOrigin = '50% 100%'; bottom.p.appendChild(back.p);
  left.p.style.left = (-H) + 'px'; left.p.style.top = '0'; left.p.style.transformOrigin = '100% 50%'; bottom.p.appendChild(left.p);
  right.p.style.left = W + 'px'; right.p.style.top = '0'; right.p.style.transformOrigin = '0 50%'; bottom.p.appendChild(right.p);
  lid.p.style.left = '0'; lid.p.style.top = (-D) + 'px'; lid.p.style.transformOrigin = '50% 100%'; back.p.appendChild(lid.p);
  tuck.p.style.left = '9px'; tuck.p.style.top = (-LT) + 'px'; tuck.p.style.transformOrigin = '50% 100%'; lid.p.appendChild(tuck.p);

  // مخطط القص (SVG) فوق اللوح المسطح: يُرسم بحركة "راسم" ثم يتلاشى عند الطيّ
  const NS = 'http://www.w3.org/2000/svg', totalW = W + 2 * H + 0, totalH = D + H + D + H + LT;
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'fold-outline'); svg.setAttribute('viewBox', `${-W / 2 - H - 6} ${-D / 2 - H - D - LT - 6} ${W + 2 * H + 12} ${totalH + 12}`);
  const cx = 0, cy = 0, x0 = -W / 2, x1 = W / 2, y0 = -D / 2, y1 = D / 2;
  const cut = `M${x0} ${y0 - H} H${x1} V${y0 - H - D + 12} L${x1 - 9} ${y0 - H - D} H${x0 + 9} L${x0} ${y0 - H - D + 12} Z`;   // غطاء + جدار خلفي (مبسّط): نرسم المحيط الكامل أدناه
  const outline = [
    `M${x0 + 9} ${y0 - H - D - LT} H${x1 - 9} V${y0 - H - D} H${x1} V${y0 - H} H${x1 + 0} V${y0}`,                          // أعلى: لسان + غطاء + جدار خلفي إلى القاعدة (يمين)
    `M${x1} ${y0} H${x1 + H} V${y1} H${x1}`,                                                                            // الجدار الأيمن
    `M${x1} ${y1} V${y1 + H} H${x0} V${y1}`,                                                                            // الجدار الأمامي
    `M${x0} ${y1} H${x0 - H} V${y0} H${x0}`,                                                                            // الجدار الأيسر
    `M${x0} ${y0} V${y0 - H} H${x0} V${y0 - H - D} H${x0 + 9} V${y0 - H - D - LT}`                                      // يسار أعلى
  ];
  const creases = [`M${x0} ${y0} H${x1}`, `M${x0} ${y1} H${x1}`, `M${x0} ${y0} V${y1}`, `M${x1} ${y0} V${y1}`, `M${x0} ${y0 - H} H${x1}`, `M${x0} ${y0 - H - D} H${x1}`];
  svg.innerHTML = `<g class="cut">${outline.map((d) => `<path d="${d}"/>`).join('')}</g><g class="crease">${creases.map((d) => `<path d="${d}"/>`).join('')}</g><g class="head" style="opacity:0"><g class="hd-rot"><use href="#ladybug" x="-15" y="-15" width="30" height="30"/></g></g>`;
  svg.style.width = (W + 2 * H + 12) + 'px'; svg.style.height = (totalH + 12) + 'px'; svg.style.left = (-W / 2 - H - 6) + 'px'; svg.style.top = (-D / 2 - H - D - LT - 6) + 'px'; net.appendChild(svg);
  const cutPaths = [...svg.querySelectorAll('.cut path')], crPaths = [...svg.querySelectorAll('.crease path')], head = svg.querySelector('.head');
  const lens = cutPaths.map((p) => p.getTotalLength()); cutPaths.forEach((p, i) => { p.style.strokeDasharray = lens[i]; p.style.strokeDashoffset = lens[i]; });
  crPaths.forEach((p) => { p.style.opacity = 0; });

  let drawT = reduced ? 1 : 0, started = false;   // زمن الرسم الافتتاحي 0..1
  /* مرحلة "الراسم": يرسم الرأس خطوط القص واحداً بعد الآخر ثم تظهر خطوط الطيّ */
  function plotFrame(t) {
    const n = cutPaths.length, per = 1 / n; let lastPt = null, lastAng = 0;
    cutPaths.forEach((p, i) => { const k = ss(seg(t, i * per * .78, i * per * .78 + per * .9)); p.style.strokeDashoffset = lens[i] * (1 - k); if (k > 0 && k < 1) { lastPt = p.getPointAtLength(lens[i] * k); const q = p.getPointAtLength(Math.min(lens[i], lens[i] * k + 3)); lastAng = Math.atan2(q.y - lastPt.y, q.x - lastPt.x) * 180 / Math.PI + 90; } });
    crPaths.forEach((p, i) => { p.style.opacity = ss(seg(t, .72 + i * .03, .86 + i * .03)); });
    if (lastPt) { head.setAttribute('transform', `translate(${lastPt.x} ${lastPt.y}) rotate(${lastAng.toFixed(1)})`); head.style.opacity = 1; } else head.style.opacity = t >= 1 ? 0 : head.style.opacity;
    net.style.setProperty('--fill', ss(seg(t, .8, 1)).toFixed(3));
  }
  plotFrame(drawT);

  let p = 0, lastScale = 1;
  function scale() {
    const r = host.getBoundingClientRect(), s = Math.min(r.width / (W + 2 * H + 60), r.height / (totalH + 70)) * (opts.zoom || 1);
    lastScale = Math.max(.35, s);
  }
  scale(); const ro = new ResizeObserver(scale); ro.observe(host); let dead = false;

  /* التقدم p: يضبط طيّ كل جدار + دوران المشهد */
  function apply(t, time) {
    p = t;
    const wallsA = ss(seg(p, .12, .42)), wallsB = ss(seg(p, .26, .56)), lidK = ss(seg(p, .56, .8)), tuckK = ss(seg(p, .78, .9)), flatK = 1 - ss(seg(p, .08, .5));
    front.p.style.transform = `rotateX(${90 * wallsA}deg)`;
    back.p.style.transform = `rotateX(${-90 * wallsA}deg)`;
    left.p.style.transform = `rotateY(${90 * wallsB}deg)`;
    right.p.style.transform = `rotateY(${-90 * wallsB}deg)`;
    lid.p.style.transform = `rotateX(${-90 * lidK}deg)`;
    tuck.p.style.transform = `rotateX(${-100 * tuckK}deg)`;
    const tilt = lerp(0, 58, ss(seg(p, .05, .5))), spinBase = lerp(0, -38, ss(seg(p, .05, .55))), spin = spinBase + (p > .86 ? (time * 9) % 360 * 0 : 0) + Math.sin(time * .5) * (p > .8 ? 7 : 0) + (p > .8 ? ss(seg(p, .8, 1)) * 40 : 0);
    const zoomK = lerp(1, 1.5, ss(seg(p, .25, .85))), ty = lerp(105 * lastScale, -4 * lastScale, ss(seg(p, .04, .55)));
    net.style.transform = `translate3d(0, ${ty}px, 0) scale(${lastScale * zoomK}) rotateX(${tilt}deg) rotateZ(${spin}deg)`;
    net.style.setProperty('--out', (1 - ss(seg(p, .1, .3))).toFixed(3));
    net.style.setProperty('--hinge', flatK.toFixed(3));
    host.dataset.p = p.toFixed(3);
  }
  return {
    apply, plotFrame, setDraw(t) { drawT = t; plotFrame(t); },
    play(cb) { if (started) return; started = true; if (reduced) { plotFrame(1); cb && cb(); return; } const t0 = performance.now(), dur = 3400; (function f(n) { if (dead) return; const k = clamp((n - t0) / dur, 0, 1); plotFrame(k); if (k < 1) requestAnimationFrame(f); else { drawT = 1; cb && cb(); } })(t0); },
    dispose() { dead = true; ro.disconnect(); host.innerHTML = ''; }
  };
}
function el(tag, cls) { const e = document.createElement(tag); if (cls) e.className = cls; return e; }

FP.createFold = createFold;
})();
