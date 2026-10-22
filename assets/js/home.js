/* الرئيسية: هيرو الطيّ المربوط بالتمرير + فصول الشرح */
(function () {
  const FP = window.FP, $ = FP.$, $$ = FP.$$;
  const hero = $('#hero'); if (!hero || !FP.createFold) return;
  const host = $('#fold-host'), ultra = () => document.documentElement.dataset.perf === 'ultra';
  /* مستوى الجهاز: weak = معالج 4 أنوية أو أقل أو رام 2 غيغا أو أقل (أو توفير بيانات) → بلا طيّ حيّ: هيرو شاشة واحدة (الرسم الثابت والعنوان الأول) فيُتخطّى من أول سكرول؛ ?hero=on / ?hero=off للتجربة */
  const SKIP = (() => { const q = new URLSearchParams(location.search).get('hero'), c = navigator.hardwareConcurrency || 8, m = navigator.deviceMemory || 8; if (q === 'on') return false; if (q === 'off') return true; if (navigator.connection && navigator.connection.saveData) return true; return c <= 4 || m <= 2; })();
  if (SKIP) document.documentElement.classList.add('hero-weak');
  let fold = (ultra() || SKIP) ? null : FP.createFold(host, { zoom: .8 });
  function staticMode() { if (fold) { fold.dispose(); fold = null; } host.innerHTML = '<div class="hero-static">' + FP.artSvg('mailer', 'black-red') + '</div>'; }
  if (ultra() || SKIP) staticMode();
  document.addEventListener('fp:perf', (e) => { if (e.detail === 'ultra') staticMode(); });
  const chs = $$('.ch', hero), bar = $('.chap-bar i', hero), floor = $('.floor', hero), hint = $('.hero-hint', hero), stage = $('.hero-stage', hero);
  const ss = (t) => t * t * (3 - 2 * t);
  let cur = 0, vis = true, raf = 0, ci = -1, last = -1, bugT = 0;
  const cbug = $('.chap-bug', hero);
  function target() { const r = hero.getBoundingClientRect(), max = Math.max(1, r.height - innerHeight); return Math.min(1, Math.max(0, -r.top / max)); }
  function frame(now) {
    raf = 0; if (!vis || !fold) return;
    const t = target(); cur += (t - cur) * (FP.reduced ? 1 : .14); if (Math.abs(t - cur) < .0005) cur = t;
    if (cur !== last || cur > .78) { fold.apply(cur, now / 1000); last = cur; }
    const i = cur < .3 ? 0 : cur < .64 ? 1 : 2;
    if (i !== ci) { ci = i; chs.forEach((c, k) => c.classList.toggle('on', k === i)); }
    bar.style.transform = `scaleX(${cur.toFixed(3)})`;
    if (cbug) {
      const d = t - cur; cbug.style.left = (cur * 100).toFixed(2) + '%';
      if (Math.abs(d) > .002) { cbug.classList.add('go'); cbug.style.transform = `translateX(-50%) rotate(${d > 0 ? 90 : -90}deg)`; clearTimeout(bugT); bugT = setTimeout(() => cbug.classList.remove('go'), 260); }
    }
    floor.style.opacity = (ss(Math.min(1, Math.max(0, (cur - .35) / .5))) * .9).toFixed(3);
    hint.style.opacity = Math.max(0, 1 - cur * 6).toFixed(2);
    raf = requestAnimationFrame(frame);
  }
  new IntersectionObserver((en) => { vis = en[0].isIntersecting; if (vis && !raf) raf = requestAnimationFrame(frame); }, { rootMargin: '10% 0px' }).observe(hero);
  // بعيد بأكثر من شاشتين: نحذف مشهد الطيّ ثلاثي الأبعاد من الذاكرة ونعيد بناءه عند العودة
  new IntersectionObserver((en) => {
    if (en[0].isIntersecting) { if (!fold && !ultra() && !SKIP) { fold = FP.createFold(host, { zoom: .8 }); fold.setDraw(1); last = -1; if (!raf) raf = requestAnimationFrame(frame); } }
    else if (fold) { fold.dispose(); fold = null; }
  }, { rootMargin: '200% 0px' }).observe(hero);
  raf = requestAnimationFrame(frame);
  // الرسم الافتتاحي بعد المحمِّل
  if (FP.went) setTimeout(() => fold && fold.play(), 150); else document.addEventListener('fp:go', () => setTimeout(() => fold && fold.play(), 150), { once: true });
})();
