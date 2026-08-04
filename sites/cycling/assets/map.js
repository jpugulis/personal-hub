/* Interactive expedition map. Renders from window.CYCLING into #map. */
(function () {
  var D = window.CYCLING;
  var host = document.getElementById('map');
  if (!D || !host) return;

  var NS = 'http://www.w3.org/2000/svg';
  var COL = {
    '2026-kurzeme': 'var(--c2026)', '2025-latgale': 'var(--c2025)',
    '2024-gauja': 'var(--c2024)', '2023-estonia': 'var(--c2023)'
  };
  var solo = host.getAttribute('data-only') || null;   // article pages show one tour
  var tours = solo ? D.tours.filter(function (t) { return t.slug === solo; }) : D.tours;
  var byRegion = {};
  tours.forEach(function (t) { byRegion[t.region] = t; });

  function el(n, a, parent) {
    var e = document.createElementNS(NS, n);
    for (var k in a) e.setAttribute(k, a[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  host.setAttribute('viewBox', D.viewBox);
  host.setAttribute('role', 'img');
  host.setAttribute('aria-label', solo
    ? tours[0].title + ' route across ' + D.regionNames[tours[0].region]
    : 'Map of Latvia and southern Estonia with four cycling expedition routes');

  /* --- defs: soft shadow under the landmass --- */
  var defs = el('defs', {}, host);
  var f = el('filter', { id: 'landshadow', x: '-6%', y: '-6%', width: '112%', height: '112%' }, defs);
  el('feDropShadow', {
    dx: 0, dy: 3, stdDeviation: 5,
    'flood-color': '#6b6255', 'flood-opacity': 0.16
  }, f);

  var gHalo = el('g', { class: 'halo' }, host);
  var gLand = el('g', { filter: 'url(#landshadow)' }, host);
  var gWater = el('g', { class: 'water' }, host);
  var gRoutes = el('g', { class: 'routes' }, host);
  var gTowns = el('g', { class: 'towns' }, host);
  var gLabels = el('g', { class: 'labels' }, host);

  /* --- coastline halo: makes the sea read as sea --- */
  Object.keys(D.regions).forEach(function (k) {
    el('path', { d: D.regions[k], class: 'halo-p' }, gHalo);
  });

  /* --- regions --- */
  Object.keys(D.regions).forEach(function (key) {
    var tour = byRegion[key];
    var cls = 'region' + (tour ? ' live' : ' inert') + (solo && tour ? ' on' : '');
    var p = el('path', { d: D.regions[key], class: cls }, gLand);
    if (tour && !solo) {
      p.setAttribute('data-slug', tour.slug);
      p.setAttribute('tabindex', '0');
      p.setAttribute('role', 'link');
      el('title', {}, p).textContent = tour.title + ' — ' + tour.dates;
      p.addEventListener('click', function () { go(tour.slug); });
      p.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(tour.slug); }
      });
      ['mouseenter', 'focus'].forEach(function (ev) {
        p.addEventListener(ev, function () { hi(tour.slug, true); });
      });
      ['mouseleave', 'blur'].forEach(function (ev) {
        p.addEventListener(ev, function () { hi(tour.slug, false); });
      });
    }
  });

  /* --- rivers + lakes --- */
  D.rivers.forEach(function (d) { el('path', { d: d, class: 'river' }, gWater); });
  D.lakes.forEach(function (d) { el('path', { d: d, class: 'lake' }, gWater); });

  /* --- routes --- */
  tours.forEach(function (t) {
    t.routes.forEach(function (pts) {
      el('polyline', {
        points: pts, class: 'route' + (solo ? ' on' : ''),
        stroke: COL[t.slug], 'data-slug': t.slug
      }, gRoutes);
    });
  });

  /* --- towns --- */
  D.towns.forEach(function (t) {
    var g = el('g', { class: 'town t' + t.t }, gTowns);
    el('circle', { cx: t.x, cy: t.y, r: t.t === 1 ? 3.6 : t.t === 2 ? 2.8 : 2.1 }, g);
    if (t.t <= 2 || solo) {
      var tx = el('text', { x: t.x + 7, y: t.y + 4 }, g);
      tx.textContent = t.n;
    }
  });

  /* --- region names --- */
  Object.keys(D.labelPos).forEach(function (k) {
    if (solo && !byRegion[k]) return;
    var p = D.labelPos[k];
    var t = el('text', { x: p[0], y: p[1], class: 'rlabel' + (byRegion[k] ? ' live' : '') }, gLabels);
    t.textContent = D.regionNames[k];
  });

  function go(slug) { window.location.href = '/' + slug + '/'; }

  function hi(slug, on) {
    host.classList.toggle('focused', on);
    host.querySelectorAll('[data-slug]').forEach(function (n) {
      n.classList.toggle('on', on && n.getAttribute('data-slug') === slug);
      n.classList.toggle('dim', on && n.getAttribute('data-slug') !== slug);
    });
    var card = document.querySelector('a.t[data-slug="' + slug + '"]');
    if (card) card.classList.toggle('hot', on);
  }

  /* --- cards --- */
  var list = document.getElementById('tourlist');
  if (list) {
    D.tours.forEach(function (t) {
      var a = document.createElement('a');
      a.className = 't'; a.href = '/' + t.slug + '/'; a.setAttribute('data-slug', t.slug);
      a.innerHTML =
        '<div class="ic" style="--k:' + COL[t.slug] + '">' + t.year + '</div>' +
        '<div><b>' + t.title + '</b><span>' + t.sub + ' · ' + t.dates + '</span>' +
        '<span class="meta">' + t.dist.toFixed(1) + ' km · ' +
        t.climb.toLocaleString('en-GB') + ' m climbing · ' + t.days + ' days</span></div>' +
        '<div class="arw">→</div>';
      a.addEventListener('mouseenter', function () { hi(t.slug, true); });
      a.addEventListener('mouseleave', function () { hi(t.slug, false); });
      list.appendChild(a);
    });
  }

  var lg = document.getElementById('legend');
  if (lg) {
    D.tours.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'lgi'; b.setAttribute('data-slug', t.slug);
      b.innerHTML = '<i class="swatch" style="background:' + COL[t.slug] + '"></i>' + t.year;
      b.addEventListener('click', function () { go(t.slug); });
      b.addEventListener('mouseenter', function () { hi(t.slug, true); });
      b.addEventListener('mouseleave', function () { hi(t.slug, false); });
      lg.appendChild(b);
    });
  }
})();
