/* الرئيسية: هيرو الطيّ المربوط بالتمرير + فصول الشرح */
(function () {
  const FP = window.FP, $ = FP.$, $$ = FP.$$;
  const hero = $('#hero'); if (!hero || !FP.createFold) return;
  const host = $('#fold-host'), fold = FP.createFold(host, { zoom: .8 });
  const chs = $$('.ch', hero), bar = $('.chap-bar i', hero), floor = $('.floor', hero), hint = $('.hero-hint', hero), stage = $('.hero-stage', hero);
  const ss = (t) => t * t * (3 - 2 * t);
  let cur = 0, vis = true, raf = 0, ci = -1, last = -1;
  function target() { const r = hero.getBoundingClientRect(), max = Math.max(1, r.height - innerHeight); return Math.min(1, Math.max(0, -r.top / max)); }
  function frame(now) {
    raf = 0; if (!vis) return;
    const t = target(); cur += (t - cur) * (FP.reduced ? 1 : .14); if (Math.abs(t - cur) < .0005) cur = t;
    if (cur !== last || cur > .78) { fold.apply(cur, now / 1000); last = cur; }
    const i = cur < .3 ? 0 : cur < .64 ? 1 : 2;
    if (i !== ci) { ci = i; chs.forEach((c, k) => c.classList.toggle('on', k === i)); }
    bar.style.transform = `scaleX(${cur.toFixed(3)})`;
    floor.style.opacity = (ss(Math.min(1, Math.max(0, (cur - .35) / .5))) * .9).toFixed(3);
    hint.style.opacity = Math.max(0, 1 - cur * 6).toFixed(2);
    raf = requestAnimationFrame(frame);
  }
  new IntersectionObserver((en) => { vis = en[0].isIntersecting; if (vis && !raf) raf = requestAnimationFrame(frame); }, { rootMargin: '10% 0px' }).observe(hero);
  raf = requestAnimationFrame(frame);
  // الرسم الافتتاحي بعد المحمِّل
  if (FP.went) setTimeout(() => fold.play(), 150); else document.addEventListener('fp:go', () => setTimeout(() => fold.play(), 150), { once: true });
})();
