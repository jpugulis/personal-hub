/* Report pages: scroll-spy on the contents list + mobile contents toggle. */
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc a'));
  if (links.length) {
    var targets = links.map(function (a) {
      return document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
    });
    var tick = false;
    function spy() {
      tick = false;
      var best = 0;
      for (var i = 0; i < targets.length; i++) {
        if (targets[i] && targets[i].getBoundingClientRect().top <= 120) best = i;
      }
      links.forEach(function (a, i) { a.classList.toggle('cur', i === best); });
    }
    addEventListener('scroll', function () {
      if (!tick) { tick = true; requestAnimationFrame(spy); }
    }, { passive: true });
    spy();
  }

  var btn = document.querySelector('.tocbtn');
  var toc = document.querySelector('.toc');
  if (btn && toc) {
    btn.addEventListener('click', function () {
      var open = toc.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      if (open) toc.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    toc.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { toc.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });
  }
})();
