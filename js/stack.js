/* Stacking scroll: each .page-block pins, the next slides over it. */
(function () {
  'use strict';
  var main = document.querySelector('main');
  if (!main) return;
  var blocks = Array.prototype.slice.call(main.querySelectorAll(':scope > .page-block'));
  if (!blocks.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* keyword tags (edit freely) */
  var TAGS = {
    about: ['Full-stack', 'AI / ML', 'BCA · GGSIPU', 'Research'],
    experience: ['IBM × NASSCOM', 'Internship', 'Hackathons', 'Paper award'],
    gallery: ['Certificates', 'Awards', 'Hackathons', 'Workshops'],
    contact: ['Say hello', 'Collaborate', 'Opportunities']
  };
  Object.keys(TAGS).forEach(function (id) {
    var sec = document.getElementById(id);
    var head = sec && sec.querySelector('.section-header');
    if (!head || head.querySelector('.stack-chips')) return;
    var row = document.createElement('div');
    row.className = 'stack-chips';
    row.setAttribute('aria-hidden', 'true');
    TAGS[id].forEach(function (t) { var s = document.createElement('span'); s.textContent = t; row.appendChild(s); });
    head.appendChild(row);
  });

  if (reduce) { window.stackTopOf = function (id) { var e = document.getElementById(id); return e ? e.offsetTop : 0; }; return; }

  var nat = [], hs = [], dims = [], lastDim = [], lastScale = [], vh = window.innerHeight;

  function layout() {
    vh = window.innerHeight;
    var y = main.getBoundingClientRect().top + window.pageYOffset;
    var n = blocks.length;

    // Step 1: Read all heights in one batch (prevents forced layout thrashing)
    var heights = new Array(n);
    for (var i = 0; i < n; i++) {
      heights[i] = blocks[i].offsetHeight;
    }

    // Step 2: Batch all DOM mutations and calculate absolute positions
    for (var i = 0; i < n; i++) {
      var b = blocks[i];
      b.classList.add('stack-on');
      if (!dims[i]) {
        var d = b.querySelector(':scope > .stack-dim');
        if (!d) {
          d = document.createElement('div');
          d.className = 'stack-dim';
          d.setAttribute('aria-hidden', 'true');
          b.appendChild(d);
        }
        dims[i] = d;
      }
      var h = heights[i];
      hs[i] = h;
      b.style.top = Math.min(0, vh - h) + 'px';
      var mt = (i === 0 ? 0 : -35);
      nat[i] = (i === 0 ? y : nat[i - 1] + hs[i - 1] + mt);
    }
    paint();
    if (window.refreshScrollSpy) window.refreshScrollSpy();
  }

  var tick = false;
  function paint() {
    tick = false;
    var sy = window.pageYOffset;
    var n = blocks.length;
    for (var i = 0; i < n; i++) {
      var b = blocks[i], p = 0;
      if (i < n - 1) {
        p = 1 - (nat[i + 1] - sy) / vh;
        p = Math.max(0, Math.min(1, p));
      }

      // 1. Direct GPU opacity on the dim overlay (zero style invalidation on the section)
      var curDim = +(p * 0.55).toFixed(3);
      if (curDim !== lastDim[i]) {
        lastDim[i] = curDim;
        if (dims[i]) dims[i].style.opacity = curDim;
      }

      // 2. Smooth GPU composited scale shrink for screen-fitting cards (exempt #projects)
      if (b.id !== 'projects') {
        if (hs[i] <= vh + 120) {
          var s = (1 - p * 0.045).toFixed(4);
          if (s !== lastScale[i]) {
            lastScale[i] = s;
            b.style.transform = p > 0.002 ? 'scale(' + s + ')' : '';
          }
        } else if (lastScale[i] !== '1') {
          lastScale[i] = '1';
          b.style.transform = '';
        }
      }
    }
  }
  function onScroll() { if (!tick) { tick = true; requestAnimationFrame(paint); } }

  var pend = false;
  function relayout() { if (pend) return; pend = true; requestAnimationFrame(function () { pend = false; layout(); }); }

  window.stackTopOf = function (id) {
    var i = blocks.findIndex(function (b) { return b.id === id; });
    return i < 0 ? 0 : (i === 0 ? 0 : nat[i]);
  };

  /* sticky breaks native #anchor jumps, so scroll to the un-pinned position ourselves */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!id || !blocks.some(function (b) { return b.id === id; })) return;
    e.preventDefault();
    window.scrollTo({ top: window.stackTopOf(id), behavior: 'smooth' });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', relayout);
  window.addEventListener('load', relayout);
  var roTimer = 0;
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function () {
      if (window.PERF && PERF.scrolling && PERF.scrolling()) {
        clearTimeout(roTimer);
        roTimer = setTimeout(relayout, 160);
        return;
      }
      relayout();
    });
    blocks.forEach(function (b) { ro.observe(b); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  layout();
})();
