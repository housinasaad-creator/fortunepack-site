/* ورشة المقاسات: يقبل ?type=rsc|mailer|tuck */
(function () {
  const FP = window.FP, h = FP.$('#studio'); if (!h) return;
  const t = new URLSearchParams(location.search).get('type');
  if (t && ['rsc', 'mailer', 'tuck'].includes(t)) setTimeout(() => { const b = h.querySelector(`.dw-types [data-t="${t}"]`); b && b.click(); }, 60);
})();
