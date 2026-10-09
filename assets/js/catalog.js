/* الكتالوج: تصفية بالتصنيف + بحث (بكل اللغات) + عرض شبكة/قائمة */
(function () {
  const FP = window.FP, $ = FP.$, $$ = FP.$$;
  const grid = $('#pc-grid'); if (!grid) return;
  const cards = $$('.pc', grid), chips = $$('.chip'), q = $('#ct-q'), none = $('#ct-none'), cnt = $('#ct-count b');
  const D = window.FP_DATA.i18n;
  const norm = (s) => String(s).toLowerCase().replace(/ı/g, 'i').replace(/İ/g, 'i').normalize('NFD').replace(/[̀-ͯ]/g, '');
  const idx = new Map(cards.map((c) => { const s = c.dataset.slug; return [c, norm(['tr', 'en', 'ar'].map((l) => (D[l]['p.' + s + '.t'] || '') + ' ' + (D[l]['p.' + s + '.lead'] || '')).join(' '))]; }));
  const st = { cat: new URLSearchParams(location.search).get('cat') || 'all', q: '' };
  if (!chips.some((c) => c.dataset.cat === st.cat)) st.cat = 'all';
  function run(anim) {
    const nq = norm(st.q.trim()); let n = 0;
    cards.forEach((c) => {
      const ok = (st.cat === 'all' || c.dataset.cat === st.cat) && (!nq || idx.get(c).includes(nq));
      c.hidden = !ok;
      if (ok) { c.style.setProperty('--pi', Math.min(n, 11)); n++; if (anim) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); } }
    });
    cnt.textContent = n; none.hidden = n > 0;
    chips.forEach((c) => { c.classList.toggle('on', c.dataset.cat === st.cat); c.setAttribute('aria-pressed', c.dataset.cat === st.cat); });
    const u = new URL(location.href); if (st.cat === 'all') u.searchParams.delete('cat'); else u.searchParams.set('cat', st.cat);
    history.replaceState(null, '', u);
  }
  chips.forEach((c) => c.addEventListener('click', () => { st.cat = c.dataset.cat; run(true); }));
  q.addEventListener('input', () => { st.q = q.value; run(true); });
  $$('.view button').forEach((b) => b.addEventListener('click', () => { $$('.view button').forEach((x) => x.classList.toggle('on', x === b)); grid.classList.toggle('is-list', b.dataset.view === 'list'); }));
  run(false);
})();
