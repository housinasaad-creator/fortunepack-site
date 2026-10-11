/* الفيديو التعريفي: واجهة نقر للتشغيل؛ لا يتصل بيوتيوب قبل الضغط (خصوصية + أداء) */
(function () {
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.vid-play'); if (!b) return;
    const box = b.closest('.vid-box'), id = box && box.dataset.yt; if (!id) return;
    const f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1';
    f.title = 'Fortunepack'; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
    f.referrerPolicy = 'strict-origin-when-cross-origin'; box.innerHTML = ''; box.appendChild(f); box.classList.add('on');
  });
})();
