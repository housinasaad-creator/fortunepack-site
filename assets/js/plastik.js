/* صفحة البلاستيك: تصفية العائلات (?cat=bag|carrier|pouch|sack) */
(function () {
  const bar = document.getElementById('pl-chips'), grid = document.getElementById('pl-grid'); if (!bar || !grid) return;
  const FP = window.FP, cards = Array.from(grid.querySelectorAll('.pc')), chips = Array.from(bar.querySelectorAll('.chip'));
  let cat = new URLSearchParams(location.search).get('cat') || 'all'; if (!chips.some((c) => c.dataset.cat === cat)) cat = 'all';
  function run(anim) {
    let n = 0;
    cards.forEach((c) => {
      const ok = cat === 'all' || c.dataset.cat === cat; c.hidden = !ok;
      if (ok) { c.style.setProperty('--pi', Math.min(n, 11)); n++; if (anim) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); } }
    });
    chips.forEach((c) => { c.classList.toggle('on', c.dataset.cat === cat); c.setAttribute('aria-pressed', c.dataset.cat === cat); });
    const u = new URL(location.href); if (cat === 'all') u.searchParams.delete('cat'); else u.searchParams.set('cat', cat); history.replaceState(null, '', u);
    if (FP && FP.mountArt) FP.mountArt();
  }
  chips.forEach((c) => c.addEventListener('click', () => { cat = c.dataset.cat; run(true); }));
  run(false);
})();
