/* Photo grid -> lightbox. Slots with no image on disk remove themselves. */
(function () {
  var grid = document.querySelector('.gallery');
  if (!grid) return;
  var box = document.querySelector('.lb');
  var img = box && box.querySelector('img');
  var idx = 0;

  function shots() { return Array.prototype.slice.call(grid.querySelectorAll('button')); }

  Array.prototype.forEach.call(grid.querySelectorAll('img'), function (th) {
    th.addEventListener('error', function () {
      var b = th.closest('button');
      if (b) b.remove();
      if (!grid.querySelector('button')) grid.remove();
    });
  });

  grid.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b || !box) return;
    idx = shots().indexOf(b);
    show();
  });

  function show() {
    var list = shots();
    if (!list.length) return;
    idx = (idx + list.length) % list.length;
    img.src = list[idx].getAttribute('data-full');
    img.alt = list[idx].querySelector('img').alt || '';
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    box.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (box) {
    box.querySelector('.x').addEventListener('click', close);
    box.querySelector('.p').addEventListener('click', function (e) { e.stopPropagation(); idx--; show(); });
    box.querySelector('.n').addEventListener('click', function (e) { e.stopPropagation(); idx++; show(); });
    box.addEventListener('click', function (e) { if (e.target === box || e.target === img) close(); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') { idx--; show(); }
      if (e.key === 'ArrowRight') { idx++; show(); }
    });
    /* swipe */
    var x0 = null;
    box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) { idx += dx < 0 ? 1 : -1; show(); }
      x0 = null;
    }, { passive: true });
  }
})();
