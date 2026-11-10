/**
 * PERF GUARD — the reason the page feels smooth.
 *
 * Nothing here changes how the site looks. It only stops work the visitor
 * cannot see: CSS animations in sections that are off screen, canvas loops
 * that keep drawing when nobody is looking, and the arcade iframe that kept
 * playing its game long after you scrolled past it.
 *
 * Loads first, exposes a tiny registry (window.PERF) that the other scripts
 * ask before doing per-frame work.
 */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* Performance Mode — a visitor-facing switch (the gauge button, built in
     app.js). When on, css/perf.css parks the frosted-glass nav, the hero liquid
     ripple and the gallery's per-frame glow / box-shadow pulses, and js/app.js
     stops driving the ripple filter. The choice is remembered across visits.
     Applied here, in the first script to run, so there is no flash before the
     button exists. */
  var perfMode = false;
  try { perfMode = localStorage.getItem('rashmi-perf-mode') === '1'; } catch (e) {}
  if (perfMode) document.documentElement.classList.add('perf-mode');

  /* ── 1. who is on screen? ─────────────────────────────────────────────
     One observer watches every stacking page plus a few individually heavy
     regions. Off screen ones get the `perf-off` class, which parks their CSS
     animations (see css/perf.css) and answers PERF.near() with false.       */
  var near = new WeakMap();   // element -> boolean
  var callbacks = [];         // things that want to know when visibility changes

  function mark(el, isNear) {
    if (near.get(el) === isNear) return;
    near.set(el, isNear);
    el.classList.toggle('perf-off', !isNear);
    for (var i = 0; i < callbacks.length; i++) callbacks[i](el, isNear);
  }

  var io = hasIO ? new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      mark(entries[i].target, entries[i].isIntersecting);
    }
  }, { rootMargin: '20% 0px 20% 0px', threshold: 0 }) : null;

  function watch(el) {
    if (!el) return null;
    if (!io) { near.set(el, true); return el; }
    near.set(el, true);          // optimistic until the observer reports
    io.observe(el);
    return el;
  }

  /* ── 2. public helpers ──────────────────────────────────────────────── */
  var PERF = {
    reduceMotion: reduce,

    /* is this element (or the element with this id) close enough to paint? */
    near: function (el) {
      if (typeof el === 'string') el = document.getElementById(el);
      if (!el || !io) return true;
      return near.get(el) !== false;
    },

    /* register a heavy region so its CSS animations park when it scrolls away */
    watch: watch,

    /* run fn at most once per frame, on the next animation frame */
    rafThrottle: function (fn) {
      var queued = false, lastArgs = null;
      return function () {
        lastArgs = arguments;
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () { queued = false; fn.apply(null, lastArgs); });
      };
    },

    /* subscribe to visibility changes: fn(el, isNear) */
    onChange: function (fn) { callbacks.push(fn); },

    /* true while the visitor is actually moving through the page */
    scrolling: function () { return scrolling; },

    /* Performance Mode state: read PERF.perfMode, toggle PERF.setPerfMode(v) */
    perfMode: perfMode,
    setPerfMode: function (v) {
      perfMode = !!v;
      PERF.perfMode = perfMode;
      document.documentElement.classList.toggle('perf-mode', perfMode);
      try { localStorage.setItem('rashmi-perf-mode', perfMode ? '1' : '0'); } catch (e) {}
      return perfMode;
    },
  };

  window.PERF = PERF;

  /* ── 2b. scroll state tracking ───────────────────────────────────────
     Maintains smooth state tracking without thrashing document classes.   */
  var scrolling = false, scrollTimer = 0;
  function setScrolling(v) {
    if (scrolling === v) return;
    scrolling = v;
  }
  window.addEventListener('scroll', function () {
    setScrolling(true);
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () { setScrolling(false); }, 150);
  }, { passive: true });

  /* (The auto frame-rate monitor that used to live here — section 2c — was
     removed. It ran a third always-on rAF loop during every interaction and
     toggled html.perf-lite on and off; on an already-struggling machine that
     extra loop and the flicker it caused did more harm than the ambient loops
     it parked. The deterministic is-scrolling pauses above and in css/perf.css
     are kept; they add no continuous JS.) */

  /* ── 3. watch the heavy regions ─────────────────────────────────────── */
  function boot() {
    var blocks = document.querySelectorAll('.page-block');
    for (var i = 0; i < blocks.length; i++) watch(blocks[i]);

    /* individually expensive pockets living inside those blocks */
    ['#exp-scene', '#pt-board', '#arcade-feature', '#bk-canvas', '#coverflow-stage', '.coverflow-stage', '#warp']
      .forEach(function (sel) {
        var el = document.querySelector(sel);
        if (el) watch(el);
      });

    /* ── 4. the arcade iframe: a full canvas game that must not run while
          scrolled away — it burns a whole viewport of shadow-blur per frame. ── */
    var feature = document.getElementById('arcade-feature');
    var frame = document.getElementById('arcade-iframe');
    if (frame && feature) {
      function send(msg) {
        try { if (frame.contentWindow) frame.contentWindow.postMessage({ gg: msg }, '*'); } catch (e) {}
      }
      PERF.onChange(function (el, isNear) {
        if (el === feature) send(isNear ? 'resume' : 'pause');
      });
      frame.addEventListener('load', function () { send(PERF.near(feature) ? 'resume' : 'pause'); });
      document.addEventListener('visibilitychange', function () { send(document.hidden ? 'pause' : 'resume'); });
      /* safety net: re-assert the pause every few seconds while it is away */
      setInterval(function () { if (!PERF.near(feature) || document.hidden) send('pause'); }, 4000);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
