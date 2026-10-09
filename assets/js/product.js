/* صفحة المنتج: بناء المواصفات، تبديل العلبة/الفرد، ميل ثلاثي خفيف للرسم */
(function () {
  const FP = window.FP, $ = FP.$, $$ = FP.$$;
  const pg = $('.pg-product'); if (!pg) return;
  const D = window.FP_DATA, mats = D.mats;
  const sel = { mat: null, lam: null, ext: new Set() };
  const list = $('#sel-list'), none = $('#sel-none');

  function label() {
    const L = [];
    if (sel.mat) { const m = mats[sel.mat]; L.push([FP.t('wa.material'), `${FP.t('mat.' + sel.mat + '.n')} · ${m.gsm} g/m² · ${m.fl}`]); }
    if (sel.lam) L.push([FP.t('wa.lamination'), FP.t(sel.lam)]);
    if (sel.ext.size) L.push([FP.t('wa.extras'), [...sel.ext].map((k) => FP.t(k)).join(', ')]);
    return L;
  }
  FP.getSelection = label;
  function paint() {
    const L = label();
    list.innerHTML = L.map((x) => `<li><small>${x[0]}</small><b>${x[1]}</b></li>`).join('');
    none.hidden = L.length > 0;
  }
  function pick(group, btn, multi) {
    const on = !btn.classList.contains('on');
    if (!multi) $$('.on', group).forEach((b) => { b.classList.remove('on'); b.setAttribute('aria-checked', 'false'); });
    btn.classList.toggle('on', on); btn.setAttribute('aria-checked', on);
  }
  $$('.mtable').forEach((g) => g.addEventListener('click', (e) => { const b = e.target.closest('.mrow'); if (!b) return; pick(g, b); sel.mat = b.classList.contains('on') ? b.dataset.k : null; paint(); }));
  $$('.opts[role="radiogroup"]').forEach((g) => g.addEventListener('click', (e) => { const b = e.target.closest('.opt'); if (!b) return; pick(g, b); sel.lam = b.classList.contains('on') ? b.dataset.k : null; paint(); }));
  $$('.opts[role="group"]').forEach((g) => g.addEventListener('click', (e) => { const b = e.target.closest('.opt'); if (!b) return; pick(g, b, true); b.classList.contains('on') ? sel.ext.add(b.dataset.k) : sel.ext.delete(b.dataset.k); paint(); }));
  document.addEventListener('fp:lang', paint);
  paint();

  // تبديل العلبة / الفرد
  const tog = $$('.stage-tog button'), views = { box: $('.stage-view--box'), die: $('.stage-view--die') };
  tog.forEach((b) => b.addEventListener('click', () => {
    tog.forEach((x) => x.classList.toggle('on', x === b));
    Object.entries(views).forEach(([k, v]) => v.classList.toggle('on', k === b.dataset.pv));
    const ps = $('.ph-stage'); if (ps) ps.dataset.view = b.dataset.pv;
    if (b.dataset.pv === 'die') window.dispatchEvent(new Event('resize'));
  }));

  // ميل خفيف للرسم مع المؤشر
  const card = $('.stage-card'), art = $('.stage-view--box .art');
  if (card && art && !FP.reduced && matchMedia('(hover:hover)').matches) {
    card.addEventListener('pointermove', (e) => { const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; art.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg'); art.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg'); });
    card.addEventListener('pointerleave', () => { art.style.setProperty('--rx', '0deg'); art.style.setProperty('--ry', '0deg'); });
  }
})();
