/* الإنتاج: رسوم الخطوات الست + خط التقدّم */
(function () {
  const FP = window.FP, $ = FP.$, $$ = FP.$$;
  const S = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  const V = {
    1: `<svg viewBox="0 0 200 120" ${S}><path class="v-dash" d="M30 90H170M30 90V30H170V90" stroke-dasharray="4 5"/><path d="M30 24H170M30 20V28M170 20V28"/><path class="v-pen" d="M150 100l18-34 6 3-18 34z" fill="#ed1c24" stroke="none"/><path d="M60 90V60H110V90M110 60h30"/></svg>`,
    2: `<svg viewBox="0 0 200 120" ${S}><path d="M24 30H176M24 42H176"/><path class="v-wave" d="M24 42c8 0 8 22 16 22s8-22 16 22-0 0 0 0" stroke="none"/><path class="v-w" d="M24 42c9 0 9 24 18 24s9-24 18-24 9 24 18 24 9-24 18-24 9 24 18 24 9-24 18-24 9 24 18 24"/><path d="M24 66H176M24 78H176"/></svg>`,
    3: `<svg viewBox="0 0 200 120" ${S}><rect x="40" y="20" width="120" height="30" rx="15"/><path d="M40 35h120"/><circle class="v-d1" cx="70" cy="76" r="5" fill="#00aeef" stroke="none"/><circle class="v-d2" cx="96" cy="84" r="5" fill="#ec008c" stroke="none"/><circle class="v-d3" cx="122" cy="76" r="5" fill="#fff200" stroke="none"/><circle class="v-d4" cx="148" cy="84" r="5" fill="#ed1c24" stroke="none"/><path d="M60 98H150"/></svg>`,
    4: `<svg viewBox="0 0 200 120" ${S}><rect x="30" y="86" width="140" height="10"/><g class="v-press"><rect x="50" y="22" width="100" height="18"/><path d="M60 40v22M90 40v22M120 40v22M140 40v22" stroke="#ed1c24"/></g><path d="M44 76h112" stroke-dasharray="4 4"/></svg>`,
    5: `<svg viewBox="0 0 200 120" ${S}><path d="M50 86 70 62h60l20 24z"/><path d="M70 62 60 36h80l-10 26"/><circle class="v-g" cx="88" cy="74" r="3.4" fill="#ed1c24" stroke="none"/><circle class="v-g v-g2" cx="112" cy="74" r="3.4" fill="#ed1c24" stroke="none"/></svg>`,
    6: `<svg viewBox="0 0 200 120" ${S}><path d="M44 90 44 56 100 40 156 56V90L100 106z"/><path d="M44 56 100 72 156 56M100 72V106"/><g class="v-lens"><circle cx="138" cy="44" r="18"/><path d="M151 57l16 16"/><path d="M130 44l6 6 11-12" stroke="#ed1c24"/></g></svg>`
  };
  $$('.ps-viz').forEach((e) => { e.innerHTML = V[e.dataset.step] || ''; });
  const list = $('#ps-list'), fill = list && $('.ps-line b', list);
  if (list) {
    let t = 0;
    const bug = $('.ps-bug', list); let lastP = 0, tm = 0;
    const on = () => {
      t = 0; const r = list.getBoundingClientRect(), p = Math.min(1, Math.max(0, (innerHeight * .6 - r.top) / r.height)); fill.style.transform = `scaleY(${p.toFixed(3)})`;
      if (bug) { bug.style.top = (p * 100).toFixed(2) + '%'; const d = p - lastP; if (Math.abs(d) > .0004) { bug.classList.add('go'); bug.style.transform = `translateY(-4px) rotate(${d > 0 ? 180 : 0}deg)`; clearTimeout(tm); tm = setTimeout(() => bug.classList.remove('go'), 260); } lastP = p; }
    };
    addEventListener('scroll', () => { if (!t) t = requestAnimationFrame(on); }, { passive: true }); on();
  }
})();
