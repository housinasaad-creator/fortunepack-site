/* الرئيسية: هيرو الطيّ + فصول الشرح.
   الأساس الآن: الطيّ فيديو مُصوَّر مسبقاً بدقة عالية يتحرك بأربع تمريرات (assets/js/hero-video.js) فيخفّ الهيرو كثيراً.
   مشهد الطيّ الحي (CSS ثلاثي الأبعاد في fold.js) محفوظ كاملاً في startLive(): يعمل بـ ?live3d أو مع حركة أقل/توفير بيانات أو إن فشل الفيديو. */
(function () {
  const FP = window.FP, $ = FP.$, $$ = FP.$$;
  const hero = $('#hero'); if (!hero || !FP.createFold) return;
  const host = $('#fold-host'), ultra = () => document.documentElement.dataset.perf === 'ultra';
  const chs = $$('.ch', hero), bar = $('.chap-bar i', hero), floor = $('.floor', hero), hint = $('.hero-hint', hero), stage = $('.hero-stage', hero), cbug = $('.chap-bug', hero);
  const ss = (t) => t * t * (3 - 2 * t), clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  /* حالة الواجهة عند التقدّم p (0..1) في الهيرو: الفصول وشريط التقدّم والخنفساء والتلميح والظل */
  const ui = { ci: -1, bugT: 0, prev: 0 };
  function paint(p, moving) {
    const i = p < .3 ? 0 : p < .64 ? 1 : 2;
    if (i !== ui.ci) { ui.ci = i; chs.forEach((c, k) => c.classList.toggle('on', k === i)); }
    bar.style.transform = `scaleX(${p.toFixed(3)})`;
    if (cbug) {
      cbug.style.left = (p * 100).toFixed(2) + '%';
      const d = p - ui.prev; ui.prev = p;
      if (moving && Math.abs(d) > .0008) { cbug.classList.add('go'); cbug.style.transform = `translateX(-50%) rotate(${d > 0 ? 90 : -90}deg)`; clearTimeout(ui.bugT); ui.bugT = setTimeout(() => cbug.classList.remove('go'), 260); }
    }
    hint.style.opacity = Math.max(0, 1 - p * 6).toFixed(2);
  }

  /* ---------------------------------------------------------------- الهيرو كفيديو (الأساس) */
  async function startVideo() {
    document.documentElement.classList.add('hv-on');
    const { initHeroVideo } = await import('./hero-video.js');
    const STOPS_P = [0, .30, .56, .80, 1], q5 = (x) => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); };
    /* موضع الفيديو بالمحطات (0..4) → تقدّم الطيّ p بنفس تخفيف اللقطة المصوَّرة */
    const pOf = (pos) => { const k = clamp(Math.floor(pos), 0, 3), u = clamp(pos - k); return STOPS_P[k] + (STOPS_P[k + 1] - STOPS_P[k]) * q5(u); };
    let hv = null;
    paint(0, false);
    hv = initHeroVideo({
      hero, stick: $('.hero-pin', hero), video: $('#hv'), hdr: () => 0, reduced: false, saveData: false,
      stops: [0, 3.6, 7.0, 10.6, 14.0], clips: 'assets/hero/', mobileQuery: '(max-width: 860px)',
      locked: () => document.body.classList.contains('noscroll') || document.documentElement.classList.contains('noscroll'),
      onPos: (pos) => paint(pOf(pos), !Number.isInteger(pos)),
      onFail: () => { document.documentElement.classList.remove('hv-on'); hv = null; startLive(); }
    });
    /* الفيديو يُحمَّل مرة واحدة ويبقى (يتوقف خارج الشاشة فقط)؛ الأجهزة قليلة الذاكرة تُفرِّغه عند الابتعاد */
    const lowMem = (navigator.deviceMemory || 8) <= 2;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { if (hv && !e.isIntersecting) hv.pause(); }, { rootMargin: '80px' }).observe(hero);
      new IntersectionObserver(([e]) => { if (!hv) return; if (e.isIntersecting) hv.load(); else hv.unload(); }, { rootMargin: '250% 0px 250% 0px' }).observe(hero);
    } else hv.load();
  }

  /* ---------------------------------------------------------------- الهيرو الحي القديم (محفوظ كاملاً) */
  function startLive() {
    let fold = ultra() ? null : FP.createFold(host, { zoom: .8 });
    FP.heroFold = () => fold;                                           // للتصوير المسبق لفيديو الهيرو
    function staticMode() { if (fold) { fold.dispose(); fold = null; } host.innerHTML = '<div class="hero-static">' + FP.artSvg('mailer', 'black-red') + '</div>'; }
    if (ultra()) staticMode();
    document.addEventListener('fp:perf', (e) => { if (e.detail === 'ultra') staticMode(); });
    let cur = 0, vis = true, raf = 0, last = -1;
    function target() { const r = hero.getBoundingClientRect(), max = Math.max(1, r.height - innerHeight); return Math.min(1, Math.max(0, -r.top / max)); }
    function frame(now) {
      raf = 0; if (!vis || !fold) return;
      const t = target(); cur += (t - cur) * (FP.reduced ? 1 : .14); if (Math.abs(t - cur) < .0005) cur = t;
      if (cur !== last || cur > .78) { fold.apply(cur, now / 1000); last = cur; }
      paint(cur, Math.abs(t - cur) > .002);
      floor.style.opacity = (ss(Math.min(1, Math.max(0, (cur - .35) / .5))) * .9).toFixed(3);
      raf = requestAnimationFrame(frame);
    }
    new IntersectionObserver((en) => { vis = en[0].isIntersecting; if (vis && !raf) raf = requestAnimationFrame(frame); }, { rootMargin: '10% 0px' }).observe(hero);
    // بعيد بأكثر من شاشتين: نحذف مشهد الطيّ ثلاثي الأبعاد من الذاكرة ونعيد بناءه عند العودة
    new IntersectionObserver((en) => {
      if (en[0].isIntersecting) { if (!fold && !ultra()) { fold = FP.createFold(host, { zoom: .8 }); fold.setDraw(1); last = -1; if (!raf) raf = requestAnimationFrame(frame); } }
      else if (fold) { fold.dispose(); fold = null; }
    }, { rootMargin: '200% 0px' }).observe(hero);
    raf = requestAnimationFrame(frame);
    // الرسم الافتتاحي بعد المحمِّل
    if (FP.went) setTimeout(() => fold && fold.play(), 150); else document.addEventListener('fp:go', () => setTimeout(() => fold && fold.play(), 150), { once: true });
  }

  const saveData = !!(navigator.connection && navigator.connection.saveData);
  if (!FP.reduced && !saveData && !/[?&]live3d\b/.test(location.search) && $('#hv')) startVideo().catch((err) => { console.warn('Video hero unavailable, using the live fold', err); document.documentElement.classList.remove('hv-on'); startLive(); });
  else startLive();
})();
