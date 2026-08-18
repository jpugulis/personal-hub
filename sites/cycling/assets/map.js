/* Interactive expedition map, drawn from window.CYCLING into #map.
   Overview page  : one colour per expedition.
   Article page   : one colour per riding day (data-only="<slug>"). */
(function () {
  var D = window.CYCLING;
  var host = document.getElementById('map');
  if (!D || !host) return;

  var NS = 'http://www.w3.org/2000/svg';
  var TOUR_COL = {
    '2026-kurzeme': 'var(--c2026)', '2025-melnsils': 'var(--c2025b)', '2025-latgale': 'var(--c2025)',
    '2024-gauja': 'var(--c2024)', '2023-estonia': 'var(--c2023)'
  };
  var DAY_COL = ['var(--d1)', 'var(--d2)', 'var(--d3)', 'var(--d4)', 'var(--d5)'];

  var solo = host.getAttribute('data-only') || null;
  var tours = solo ? D.tours.filter(function (t) { return t.slug === solo; }) : D.tours;
  if (!tours.length) return;
  var byRegion = {};
  /* first tour in the archive keeps the land-region click; a later tour
     sharing the same region (e.g. 2025-melnsils sharing "kurzeme" with
     2026-kurzeme) relies on its own route hit-line below instead. */
  tours.forEach(function (t) { if (!byRegion[t.region]) byRegion[t.region] = t; });

  function el(n, a, parent) {
    var e = document.createElementNS(NS, n);
    for (var k in a) e.setAttribute(k, a[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  host.setAttribute('viewBox', D.viewBox);
  host.setAttribute('role', 'img');
  host.setAttribute('aria-label', solo
    ? tours[0].title + ' — maršruts caur reģionu ' + D.regionNames[tours[0].region]
    : 'Latvijas un Dienvidigaunijas karte ar četriem velo ekspedīciju maršrutiem');

  /* ---------- defs: ink wobble + paper shadow ---------- */
  var defs = el('defs', {}, host);
  var seed = solo ? 11 : 5;
  var rough = el('filter', {
    id: 'rough', x: '-5%', y: '-5%', width: '110%', height: '110%',
    filterUnits: 'objectBoundingBox'
  }, defs);
  el('feTurbulence', {
    type: 'fractalNoise', baseFrequency: '0.014', numOctaves: '3', seed: seed, result: 'n'
  }, rough);
  el('feDisplacementMap', {
    in: 'SourceGraphic', in2: 'n', scale: '7',
    xChannelSelector: 'R', yChannelSelector: 'G'
  }, rough);

  var soft = el('filter', { id: 'rough2', x: '-5%', y: '-5%', width: '110%', height: '110%' }, defs);
  el('feTurbulence', {
    type: 'fractalNoise', baseFrequency: '0.02', numOctaves: '2', seed: seed + 3, result: 'n2'
  }, soft);
  el('feDisplacementMap', {
    in: 'SourceGraphic', in2: 'n2', scale: '4',
    xChannelSelector: 'R', yChannelSelector: 'G'
  }, soft);

  var sh = el('filter', { id: 'landshadow', x: '-8%', y: '-8%', width: '116%', height: '116%' }, defs);
  el('feDropShadow', {
    dx: 0, dy: 2, stdDeviation: 5, 'flood-color': '#1a1712', 'flood-opacity': 0.07
  }, sh);

  /* watercolour terrain plate — static artwork from tours.js */
  var gArt    = el('g', { class: 'art' }, host);
  if (D.art) gArt.innerHTML = D.art;
  var gLand   = el('g', { class: 'land',  filter: 'url(#rough)' }, host);
  var gInk    = el('g', { class: 'ink',   filter: 'url(#rough)' }, host);
  var gWater  = el('g', { class: 'water', filter: 'url(#rough2)' }, host);
  var gRoutes = el('g', { class: 'routes' }, host);
  var gMark   = el('g', { class: 'marks' }, host);
  var gTowns  = el('g', { class: 'towns' }, host);
  var gLabels = el('g', { class: 'labels' }, host);

  /* region hit targets (transparent, light up on hover) */
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

  /* pen outline drawn over the fills */
  Object.keys(D.regions).forEach(function (k) {
    el('path', { d: D.regions[k], class: 'inkline' + (byRegion[k] ? ' live' : '') }, gInk);
  });

  D.rivers.forEach(function (d) { el('path', { d: d, class: 'river' }, gWater); });
  D.lakes.forEach(function (d) { el('path', { d: d, class: 'lake' }, gWater); });

  /* ---------- routes ---------- */
  var DAY_OFFSET = 3.4; /* px separation for out-and-back days that retrace
                            the same road, so both day colours stay visible
                            instead of the later day painting over the first */

  function parsePts(s) {
    return s.trim().split(/\s+/).map(function (p) {
      var xy = p.split(','); return [parseFloat(xy[0]), parseFloat(xy[1])];
    });
  }

  function offsetPolyline(pointsStr, offsetPx) {
    if (!offsetPx) return pointsStr;
    var pts = parsePts(pointsStr);
    if (pts.length < 2) return pointsStr;
    return pts.map(function (p, i) {
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      var dx = b[0] - a[0], dy = b[1] - a[1];
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      return (p[0] - dy / len * offsetPx).toFixed(1) + ',' + (p[1] + dx / len * offsetPx).toFixed(1);
    }).join(' ');
  }

  /* start->end direction of a route, used to tell an outbound day from a
     return day that retraces the same road: its tangent (and so its local
     normal) is flipped, so the naive alternating offset below would push
     both days to the same physical side instead of separating them. */
  function overallDir(pointsStr) {
    var pts = parsePts(pointsStr);
    var a = pts[0], b = pts[pts.length - 1];
    return [b[0] - a[0], b[1] - a[1]];
  }

  tours.forEach(function (t) {
    var refDir = solo && t.routes.length > 1 ? overallDir(t.routes[0]) : null;
    t.routes.forEach(function (pts, i) {
      var off = 0;
      if (solo && t.routes.length > 1) {
        var base = (i - (t.routes.length - 1) / 2) * DAY_OFFSET;
        var dir = overallDir(pts);
        var dot = dir[0] * refDir[0] + dir[1] * refDir[1];
        off = dot < 0 ? -base : base;
      }
      el('polyline', {
        points: offsetPolyline(pts, off),
        class: 'route' + (solo ? ' on' : ''),
        stroke: solo ? DAY_COL[i % DAY_COL.length] : TOUR_COL[t.slug],
        'data-slug': t.slug
      }, gRoutes);

      /* on the overview map, the route itself is a click target too —
         needed for any tour whose region is already claimed above,
         and a nicer hit area everywhere else (you click the seashore
         you actually see the line follow, not just the land behind it) */
      if (!solo) {
        var hit = el('polyline', { points: pts, class: 'routehit' }, gRoutes);
        hit.setAttribute('data-slug', t.slug);
        el('title', {}, hit).textContent = t.title + ' — ' + t.dates;
        hit.addEventListener('click', function () { go(t.slug); });
        hit.addEventListener('mouseenter', function () { hi(t.slug, true); });
        hit.addEventListener('mouseleave', function () { hi(t.slug, false); });
      }
    });
  });

  /* start / finish markers on the article map */
  if (solo) {
    var rs = tours[0].routes;
    var first = rs[0].split(' ')[0].split(',');
    var lastPts = rs[rs.length - 1].split(' ');
    var last = lastPts[lastPts.length - 1].split(',');
    el('circle', { cx: first[0], cy: first[1], r: 7, class: 'mk start' }, gMark);
    el('circle', { cx: last[0], cy: last[1], r: 8, class: 'mk end' }, gMark);
    el('circle', { cx: last[0], cy: last[1], r: 3.2, class: 'mk enddot' }, gMark);
  }

  /* ---------- towns ---------- */
  D.towns.forEach(function (t) {
    var g = el('g', { class: 'town t' + t.t }, gTowns);
    el('circle', { cx: t.x, cy: t.y, r: t.t === 1 ? 3.6 : t.t === 2 ? 2.8 : 2.1 }, g);
    if (t.t <= 2 || solo) {
      var left = t.s === 'L';
      el('text', {
        x: t.x + (left ? -7 : 7), y: t.y + (t.dy == null ? 4 : t.dy),
        'text-anchor': left ? 'end' : 'start'
      }, g).textContent = t.n;
    }
  });

  Object.keys(D.labelPos).forEach(function (k) {
    if (solo && !byRegion[k]) return;
    var p = D.labelPos[k];
    el('text', { x: p[0], y: p[1], class: 'rlabel' + (byRegion[k] ? ' live' : '') }, gLabels)
      .textContent = D.regionNames[k];
  });

  function go(slug) { window.location.href = '/' + slug + '/'; }

  function hi(slug, on) {
    host.querySelectorAll('[data-slug]').forEach(function (n) {
      n.classList.toggle('on', on && n.getAttribute('data-slug') === slug);
      n.classList.toggle('dim', on && n.getAttribute('data-slug') !== slug);
    });
    var card = document.querySelector('a.t[data-slug="' + slug + '"]');
    if (card) card.classList.toggle('hot', on);
  }

  /* ---------- expedition rows ----------
     Numbered as atlas sheets: territory 03, in the order each expedition
     was added to the archive (t.sheetOrder), so 03-01 is the first ever
     written up and a number never shifts when a new tour is added later
     — even one whose ride date falls earlier than an existing sheet, as
     with 2025-melnsils (Oct 2025, sheet 05) written up after 2026-kurzeme
     (Jul 2026, sheet 04). Display order stays newest-ride-first. */
  function sheetNo(t) {
    return '03-' + ('0' + t.sheetOrder).slice(-2);
  }

  var list = document.getElementById('tourlist');
  if (list) {
    D.tours.forEach(function (t) {
      var a = document.createElement('a');
      a.className = 't'; a.href = '/' + t.slug + '/'; a.setAttribute('data-slug', t.slug);
      a.innerHTML =
        '<div class="ic" style="--k:' + TOUR_COL[t.slug] + '">Nr. ' + sheetNo(t) + '</div>' +
        '<div><b>' + t.title + '</b><span>' + t.sub + ' · ' + t.dates + '</span>' +
        '<span class="meta">' + t.dist.toFixed(1).replace('.', ',') + ' km · ' +
        t.climb.toLocaleString('lv-LV') + ' m kāpuma · ' + t.days + ' dienas</span></div>' +
        '<div class="arw">→</div>';
      a.addEventListener('mouseenter', function () { hi(t.slug, true); });
      a.addEventListener('mouseleave', function () { hi(t.slug, false); });
      list.appendChild(a);
    });
  }

  /* ---------- legend ---------- */
  var lg = document.getElementById('legend');
  if (lg && !solo) {
    D.tours.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'lgi'; b.setAttribute('data-slug', t.slug);
      b.innerHTML = '<i class="swatch" style="background:' + TOUR_COL[t.slug] + '"></i>' + t.year;
      b.addEventListener('click', function () { go(t.slug); });
      b.addEventListener('mouseenter', function () { hi(t.slug, true); });
      b.addEventListener('mouseleave', function () { hi(t.slug, false); });
      lg.appendChild(b);
    });
  } else if (lg && solo) {
    var names = (tours[0].dayNames || []);
    tours[0].routes.forEach(function (_, i) {
      var s = document.createElement('span');
      s.className = 'lgi static';
      s.innerHTML = '<i class="swatch" style="background:' + DAY_COL[i % DAY_COL.length] + '"></i>' +
        (names[i] || (i + 1) + '. diena');
      lg.appendChild(s);
    });
  }
})();
