/**
 * Rashmi's Portfolio Interactive Logic
 * Features:
 * 1. Floating Page Scroll Animations (Single-Page Scroll Site)
 * 2. Gallery Coverflow: Category Filters, Search, Drag/Swipe, Keyboard, Nav
 * 3. Live Certificate Description Panel (replaces the old counter)
 * 4. Full-View Certificate Modal with complete description (image / PDF)
 * 5. Hero Four-Character Animation with cursor-tracking eyes
 * 6. Navigation ScrollSpy & Mobile Menu
 * 7. Contact Form Simulation
 */

// ─────────────────────────────────────────────────────────
// SFX — tiny WebAudio synth that gives every animation a subtle
// sound. No audio files: all blips are short oscillator envelopes.
// Off by default; the speaker button (bottom-right) toggles + remembers.
// ─────────────────────────────────────────────────────────
window.SFX = (function () {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null, on = false, last = {};
  try { on = localStorage.getItem('sfx-on') === '1'; } catch (e) {}
  function ready() {
    if (!AC) return false;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume();
    return on;
  }
  function tone(f0, f1, dur, type, vol, delay) {
    if (!ready()) return;
    const t = ctx.currentTime + (delay || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function throttled(k, ms, fn) { const n = performance.now(); if (last[k] && n - last[k] < ms) return; last[k] = n; fn(); }
  // short filtered noise burst — the backbone of mechanical sounds (switches, latches)
  function noiseBurst(dur, freq, q, vol, delay) {
    if (!ready()) return;
    const t = ctx.currentTime + (delay || 0);
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.8);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp); bp.connect(g); g.connect(ctx.destination);
    src.start(t);
  }
  const api = {
    get enabled() { return on; },
    toggle() { on = !on; try { localStorage.setItem('sfx-on', on ? '1' : '0'); } catch (e) {} if (on) { ready(); api.chime(); } return on; },
    tick()   { throttled('tick', 70, () => tone(1900, 1400, .045, 'triangle', .025)); },
    blip()   { tone(520, 700, .08, 'sine', .05); },
    pop()    { tone(300, 540, .1, 'sine', .07); },
    click()  { tone(1200, 600, .06, 'square', .028); },
    whoosh() { tone(160, 620, .3, 'sawtooth', .028); },
    boom()   { tone(150, 44, .5, 'sine', .1); tone(240, 60, .38, 'triangle', .04); },
    thud()   { tone(230, 65, .26, 'sine', .07); },
    pluck()  { tone(440, 200, .16, 'triangle', .05); },
    brick(row) { throttled('brick', 30, () => tone(480 + row * 55, 480 + row * 55, .055, 'square', .028)); },
    // a real lamp switch: sharp high snap + a moment later, a small woody knock
    lampClack(up) { noiseBurst(.028, up ? 3400 : 2500, 1.5, .16); noiseBurst(.055, 620, 1.1, .12, .045); tone(up ? 900 : 620, up ? 520 : 320, .05, 'sine', .04, .045); },
    chime()  { [784, 988, 1319].forEach((f, i) => tone(f, f, .28, 'sine', .04, i * .09)); }
  };
  return api;
})();

// sound toggle button — fixed bottom-right, above everything
(function sfxButton() {
  function build() {
    if (document.getElementById('sfx-toggle')) return;
    const b = document.createElement('button');
    b.id = 'sfx-toggle'; b.type = 'button';
    b.setAttribute('aria-label', 'Toggle interface sounds');
    b.title = 'Sound on / off';
    const paint = () => { b.innerHTML = window.SFX.enabled ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>'; b.classList.toggle('on', window.SFX.enabled); };
    b.addEventListener('click', () => { window.SFX.toggle(); paint(); });
    document.body.appendChild(b); paint();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();

// ─────────────────────────────────────────────────────────
// Performance Mode toggle — sits just above the sound button, same look.
// Flips the html.perf-mode class (state lives in window.PERF, remembered in
// localStorage) which parks the frosted-glass nav, the hero ripple and the
// gallery glow / box-shadow pulses.
// ─────────────────────────────────────────────────────────
(function perfButton() {
  function build() {
    if (document.getElementById('perf-toggle') || !window.PERF) return;
    const b = document.createElement('button');
    b.id = 'perf-toggle'; b.type = 'button';
    b.setAttribute('aria-pressed', PERF.perfMode ? 'true' : 'false');
    b.setAttribute('aria-label', 'Toggle performance mode');
    b.title = 'Performance mode (lighter effects)';
    const paint = () => {
      b.innerHTML = PERF.perfMode ? '<i class="fa-solid fa-gauge-high"></i>' : '<i class="fa-solid fa-wand-magic-sparkles"></i>';
      b.classList.toggle('on', PERF.perfMode);
      b.setAttribute('aria-pressed', PERF.perfMode ? 'true' : 'false');
    };
    b.addEventListener('click', () => { PERF.setPerfMode(!PERF.perfMode); paint(); if (window.SFX) SFX.tick(); });
    document.body.appendChild(b); paint();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();

// ─────────────────────────────────────────────────────────
// 0. Intro: % count + pencil-drawn ring → cursive "hello" → pixel
//    circle-wipe reveal. Ends by adding body.loaded (triggers hero entrance).
//    Also wires the cursive wordmark replay + the trailing cursor dot.
// ─────────────────────────────────────────────────────────
(function () {
  // Always open on the home screen after the loader: disable the browser's
  // scroll restoration, drop any deep-link hash, and pin the viewport to the top.
  if ('scrollRestoration' in history) { try { history.scrollRestoration = 'manual'; } catch (e) {} }
  if (location.hash && history.replaceState) { history.replaceState(null, '', location.pathname + location.search); }
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  window.addEventListener('load', () => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); });

  const intro  = document.getElementById('intro');
  const canvas = document.getElementById('intro-cover');
  const count  = document.getElementById('intro-count');
  const pen    = document.getElementById('intro-pen');
  const hr     = document.getElementById('hr');
  const hpen   = document.getElementById('hello-pen');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ctx = (canvas && canvas.getContext) ? canvas.getContext('2d') : null;

  const clamp = t => Math.min(1, Math.max(0, t));
  const ease  = t => 1 - Math.pow(1 - clamp(t), 3);
  const io    = t => { t = clamp(t); return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; };

  let vw = 0, vh = 0, dpr = 1, coverOn = false, lastR = 0;
  function sizeCanvas() {
    if (!canvas || !ctx) return;
    vw = window.innerWidth; vh = window.innerHeight; dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = vw * dpr; canvas.height = vh * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (coverOn) drawCover(lastR);
  }

  // black cover with a growing, pixel-stepped circular hole
  function drawCover(R) {
    if (!ctx) return;
    lastR = R;
    ctx.clearRect(0, 0, vw, vh);
    ctx.fillStyle = '#04182b';
    ctx.fillRect(0, 0, vw, vh);
    if (R <= 0) return;
    const cw = Math.max(44, 0.12 * Math.min(vw, vh * 1.9)), cy = vh * 0.47, mid = vw / 2;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000';
    ctx.fillRect(mid - R * 1.5, cy - 1, R * 3, 2.5);
    const n = Math.ceil(mid / cw) + 2;
    for (let k = -n; k < n; k++) {
      const x0 = mid + k * cw, dx = Math.abs(x0 + cw / 2 - mid), h = 2 * Math.sqrt(Math.max(0, R*R - dx*dx));
      if (h > 0) ctx.fillRect(Math.floor(x0) - 0.5, cy - h / 2, cw + 1, h);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  // pencil tip drawing the progress ring
  const R0 = 44, P = a => [R0 * Math.cos(a), R0 * Math.sin(a)];
  let penPath1 = null, penPath2 = null, penPath3 = null, penPoly1 = null, penPoly2 = null;
  function initPen() {
    if (!pen || penPath1) return;
    pen.innerHTML =
      '<path fill="none" stroke="#0277bd" stroke-width="14"/>' +
      '<path fill="none" stroke="#8bb2cc" stroke-width="7" opacity=".85"/>' +
      '<path fill="none" stroke="#decbb3" stroke-width="14"/>' +
      '<polygon fill="#decbb3"/>' +
      '<polygon fill="#002d5b"/>';
    const paths = pen.querySelectorAll('path');
    const polys = pen.querySelectorAll('polygon');
    penPath1 = paths[0]; penPath2 = paths[1]; penPath3 = paths[2];
    penPoly1 = polys[0]; penPoly2 = polys[1];
  }
  function drawPen(p) {
    if (!pen) return;
    initPen();
    const sweep = Math.max(0.02, p * 1.7 * Math.PI), a0 = Math.PI, a1 = a0 - sweep;
    const sx = P(a0)[0], sy = P(a0)[1], ex = P(a1)[0], ey = P(a1)[1], big = sweep > Math.PI ? 1 : 0, er = P(a0 - 0.34);
    const dx = Math.sin(a1), dy = -Math.cos(a1), nx = -dy, ny = dx;
    const bx = ex + dx * 3, by = ey + dy * 3;
    const dMain = `M${sx} ${sy}A${R0} ${R0} 0 ${big} 0 ${ex} ${ey}`;
    penPath1.setAttribute('d', dMain);
    penPath2.setAttribute('d', dMain);
    penPath3.setAttribute('d', `M${sx} ${sy}A${R0} ${R0} 0 0 0 ${er[0]} ${er[1]}`);
    penPoly1.setAttribute('points', `${bx+nx*7},${by+ny*7} ${bx-nx*7},${by-ny*7} ${ex+dx*13},${ey+dy*13}`);
    penPoly2.setAttribute('points', `${ex+dx*8+nx*2.5},${ey+dy*8+ny*2.5} ${ex+dx*8-nx*2.5},${ey+dy*8-ny*2.5} ${ex+dx*13},${ey+dy*13}`);
  }

  function reveal() {
    if (!document.body.classList.contains('loaded')) document.body.classList.add('loaded');
    const b = document.getElementById('brand-script');
    if (b) { b.classList.remove('write'); void b.offsetWidth; b.classList.add('write'); }
  }
  function unlock() { document.body.classList.remove('intro-lock'); }
  function finish() { reveal(); unlock(); if (intro) intro.style.display = 'none'; }

  let raf = 0;
  function play() {
    if (!intro || !ctx) { reveal(); unlock(); return; }
    if (reduce) { intro.style.display = 'none'; reveal(); unlock(); return; }
    cancelAnimationFrame(raf);
    document.body.classList.add('intro-lock');
    window.scrollTo(0, 0);
    intro.classList.remove('gone', 'out');
    intro.style.display = '';
    coverOn = true; sizeCanvas(); drawCover(0);
    if (hr) hr.setAttribute('width', 0);
    const t0 = performance.now();
    function step(now) {
      const t = now - t0;
      if (t < 4250) {
        let p;
        if (t < 1800) p = 0.86 * ease(t / 1800);
        else if (t < 2300) p = 0.86 + 0.01 * (t - 1800) / 500;
        else p = 0.87 + 0.13 * ease((t - 2300) / 1700);
        p = Math.min(1, p);
        if (count) count.textContent = (t >= 4000 ? 100 : Math.min(99, Math.floor(p * 100))) + '%';
        drawPen(p);
        if (t > 4000) intro.classList.add('gone');
      } else intro.classList.add('gone');
      if (t >= 4250 && t < 6600 && hr) {
        const w = 360 * ease((t - 4250) / 1750);
        hr.setAttribute('width', w);
        if (hpen) { hpen.setAttribute('opacity', 1); hpen.setAttribute('transform', `translate(${w.toFixed(1)},120)`); }
      } else if (hpen && t >= 6600) { hpen.setAttribute('opacity', 0); }
      if (t >= 6500) { if (!intro.classList.contains('out')) { intro.classList.add('out'); reveal(); } const q = io((t - 6500) / 900); drawCover(q * Math.hypot(vw, vh) * 0.68); }
      if (t >= 7500) { coverOn = false; finish(); return; }
      raf = requestAnimationFrame(step);
    }
    step(t0);
    setTimeout(finish, 9000); // failsafe: never trap the user on the intro
  }

  window.addEventListener('resize', () => { if (coverOn) sizeCanvas(); });
  sizeCanvas();
  play();

  // Replay via the cursive wordmark
  const brand = document.getElementById('brand-script');
  if (brand) brand.addEventListener('click', (e) => { e.preventDefault(); play(); });

  // ── Trailing cursor dot: warm gold companion, size follows the text under it ──
  // Perf: the dot used to run a permanent rAF loop that hit-tested the whole
  // page (elementFromPoint) and re-resolved a computed style every single frame,
  // and resized itself through width/margin — i.e. a forced layout 60x/second,
  // forever, even while the mouse was perfectly still. Now: the loop sleeps when
  // the pointer sleeps, the glyph probe is throttled, the size rides on a
  // compositor-only scale(), and the follow constant is 0.55 rather than 0.24 —
  // at 0.24 the dot needed ~15 frames (a quarter second) to catch up, which is
  // exactly the distance the eye reads as "the cursor is lagging".
  const dot = document.getElementById('cursor-dot');
  if (dot && !reduce && window.matchMedia('(hover: hover)').matches) {
    const BASE = 12, FOLLOW = 0.55, GROW = 0.3;
    let mx = innerWidth / 2, my = innerHeight / 2, dtx = mx, dty = my;
    let cur = BASE, target = BASE, lastEl = null, shown = false;
    let raf = 0, probeAt = 0;

    function probe(x, y, now) {
      if (window.PERF && PERF.scrolling && PERF.scrolling()) return;
      if (now - probeAt < 120) return;              // at most ~8 style lookups/second
      probeAt = now;
      const el = document.elementFromPoint(x, y);
      if (el === lastEl) return;
      lastEl = el;
      if (el) { const fs = parseFloat(getComputedStyle(el).fontSize) || 16; target = Math.max(16, Math.min(fs * 1.2, 140)); }
      else target = BASE;
    }

    function follow(now) {
      raf = 0;
      const dx = mx - dtx, dy = my - dty, ds = target - cur;
      if (Math.abs(dx) < 0.15 && Math.abs(dy) < 0.15 && Math.abs(ds) < 0.15) {
        dtx = mx; dty = my; cur = target; paint();
        return;                                      // at rest: no more frames until the pointer moves
      }
      dtx += dx * FOLLOW; dty += dy * FOLLOW; cur += ds * GROW;
      paint();
      raf = requestAnimationFrame(follow);
    }
    function paint() {
      dot.style.transform = `translate3d(${dtx.toFixed(1)}px,${dty.toFixed(1)}px,0) scale(${(cur / BASE).toFixed(3)})`;
    }

    window.addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (!shown) { shown = true; dot.classList.add('on'); }
      probe(mx, my, e.timeStamp || performance.now());
      if (!raf) raf = requestAnimationFrame(follow);  // wake the trail up
    }, { passive: true });
    window.addEventListener('pointerdown', (e) => { probeAt = 0; probe(e.clientX, e.clientY, performance.now()); if (!raf) raf = requestAnimationFrame(follow); }, { passive: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden && !raf) raf = requestAnimationFrame(follow); });
    paint();
  } else if (dot) { dot.style.display = 'none'; }
})();

document.addEventListener('DOMContentLoaded', () => {

  // 1. Dynamic Footer Year
  const yearSpan = document.getElementById('year-span');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // 1b. Arcade — Gun Game full-screen toggle
  const arcadeBtn = document.getElementById('arcade-fullscreen');
  const arcadeFrame = document.querySelector('.arcade-frame');
  if (arcadeBtn && arcadeFrame) {
    const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
    const setLabel = (on) => {
      arcadeBtn.innerHTML = on
        ? '<i class="fa-solid fa-compress"></i> Exit full screen'
        : '<i class="fa-solid fa-expand"></i> Full screen';
    };
    arcadeBtn.addEventListener('click', () => {
      if (fsEl()) {
        const ex = document.exitFullscreen || document.webkitExitFullscreen;
        if (ex) ex.call(document);
      } else {
        const req = arcadeFrame.requestFullscreen || arcadeFrame.webkitRequestFullscreen;
        if (req) { const p = req.call(arcadeFrame); if (p && p.catch) p.catch(() => {}); }
      }
    });
    ['fullscreenchange', 'webkitfullscreenchange'].forEach((ev) =>
      document.addEventListener(ev, () => setLabel(!!fsEl())));
  }

  // ─────────────────────────────────────────────────────────
  // 2. Floating "hill" navigation — spring-driven bottom-edge highlight
  // ─────────────────────────────────────────────────────────
  let setNavActive = () => {};

  const hillNav = document.getElementById('hill-nav');
  if (hillNav) {
    const hTabs    = Array.from(hillNav.querySelectorAll('.hn-tab'));
    const hHill    = document.getElementById('hn-hill');
    const hHp      = document.getElementById('hn-hp');
    const hBead    = document.getElementById('hn-bead');
    const hCaption = document.getElementById('hn-caption-text');
    const reduce   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const BASE_W = 42, BASE_H = 12;
    let active = 0, target = 0, clickLockId = null;
    const S = { x: 0, vx: 0, h: BASE_H, vh: 0, p: 0, vp: 0, dir: 1, arrived: true, running: false, last: 0 };
    let tabCenters = [];

    function calcTabCenters() {
      const n = hillNav.getBoundingClientRect();
      tabCenters = hTabs.map(t => {
        const r = t.getBoundingClientRect();
        return r.left - n.left + r.width / 2 - 1;
      });
    }

    function centre(i) {
      if (tabCenters[i] != null) return tabCenters[i];
      const r = hTabs[i].getBoundingClientRect(), n = hillNav.getBoundingClientRect();
      return r.left - n.left + r.width / 2 - 1;
    }

    function draw() {
      const stretch = Math.min(Math.abs(S.vx) / 1100, 1);
      const w = BASE_W + 36 * stretch, h = Math.max(S.h - 5.5 * stretch, 2.5), p = Math.min(Math.max(S.p, 0), 1);
      const hw = w / 2;
      const ax = hw * 0.6 * (1 - p) + hw * 0.34 * p, ay = h * (1 - p) + h * 0.66 * p;
      const by = h * 0.33 * p;
      const L = `M0 ${h} C${ax} ${ay} ${hw - hw * 0.24 * (1 - p) - hw * 0.33 * p} ${by} ${hw} 0`;
      const R = ` C${hw + hw * 0.24 * (1 - p) + hw * 0.33 * p} ${by} ${w - ax} ${ay} ${w} ${h} Z`;
      hHp.setAttribute('d', L + R);
      hHill.setAttribute('width', w);
      hHill.setAttribute('height', h);
      const skew = -S.dir * stretch * 26;
      hHill.style.transform = `translateX(${S.x - w / 2}px) skewX(${skew}deg)`;
      hHill.style.transformOrigin = '50% 100%';
    }

    function step(t) {
      const dt = Math.min((t - S.last) / 1000 || 0.016, 0.034); S.last = t;
      const k = 210, d = 15.5;
      S.vx += (-k * (S.x - target) - d * S.vx) * dt; S.x += S.vx * dt;
      S.vh += (-260 * (S.h - BASE_H) - 17 * S.vh) * dt; S.h += S.vh * dt;
      S.vp += (-190 * S.p - 18 * S.vp) * dt; S.p += S.vp * dt;
      if (!S.arrived && Math.abs(S.x - target) < 2.2) { S.arrived = true; arrive(); }
      draw();
      const rest = Math.abs(S.x - target) < 0.05 && Math.abs(S.vx) < 0.5 && Math.abs(S.h - BASE_H) < 0.05 && Math.abs(S.vh) < 0.5 && Math.abs(S.p) < 0.01;
      if (rest) { S.x = target; S.vx = 0; S.h = BASE_H; S.p = 0; draw(); S.running = false; }
      else requestAnimationFrame(step);
    }
    function run() { if (!S.running) { S.running = true; S.last = performance.now(); requestAnimationFrame(step); } }

    function arrive() {
      S.vh += 170; S.p = Math.max(S.p, 0.9);
      const tab = hTabs[active];
      tab.classList.add('filled', 'pop');
      setTimeout(() => tab.classList.remove('pop'), 520);
      if (!reduce && hBead) {
        hBead.style.left = target + 'px';
        hBead.animate(
          [{ opacity: 1, transform: 'translateY(-14px) scale(1)' }, { opacity: 1, transform: 'translateY(-27px) scale(1)', offset: 0.55 }, { opacity: 0, transform: 'translateY(-34px) scale(0.3)' }],
          { duration: 420, easing: 'ease-out' }
        );
      }
    }

    function swapCaption(i) { if (hCaption) hCaption.textContent = hTabs[i].dataset.subtitle || ''; }

    function select(i) {
      if (i === active) return;
      const old = hTabs[active];
      old.classList.remove('filled', 'active'); old.classList.add('drop');
      setTimeout(() => old.classList.remove('drop'), 320);
      old.setAttribute('aria-selected', 'false');
      S.dir = i > active ? 1 : -1; active = i; target = centre(i);
      hTabs[i].classList.add('active'); hTabs[i].setAttribute('aria-selected', 'true');
      swapCaption(i);
      if (reduce) { S.x = target; hTabs[i].classList.add('filled'); draw(); return; }
      S.arrived = false; S.vx += S.dir * 260; run();
    }

    hTabs.forEach((b, i) => {
      b.addEventListener('click', () => {
        if (window.SFX) SFX.tick();
        select(i);
        const id = (b.getAttribute('href') || '').replace('#', '');
        clickLockId = id || null;
        setTimeout(() => { if (clickLockId === id) clickLockId = null; }, 900);
      });
      b.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + hTabs.length) % hTabs.length;
          hTabs[n].focus(); select(n);
        }
      });
    });

    function layout() {
      calcTabCenters();
      target = centre(active);
      if (!S.running) { S.x = target; draw(); }
    }

    hTabs[0].classList.add('filled', 'active'); hTabs[0].setAttribute('aria-selected', 'true');
    window.addEventListener('resize', layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    requestAnimationFrame(layout);

    // bridge for the scroll-spy below
    setNavActive = function (id) {
      if (clickLockId && id !== clickLockId) return;   // ignore intermediate sections during a click-scroll
      const idx = hTabs.findIndex(t => t.getAttribute('href') === `#${id}`);
      if (idx < 0 || idx === active) return;
      select(idx);
    };
  }

  // ─────────────────────────────────────────────────────────
  // 3. ScrollSpy — drive the hill navigation from the visible section
  // ─────────────────────────────────────────────────────────
  const sections = Array.from(document.querySelectorAll('.page-block[id]'));
  const spy = { tops: [], bottom: 0, queued: false };

  function spyMeasure() {
    spy.tops = sections.map(s => window.stackTopOf ? window.stackTopOf(s.id) : s.offsetTop);
    spy.bottom = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  }
  window.refreshScrollSpy = spyMeasure;

  function updateActiveNav() {
    spy.queued = false;
    if (!sections.length) return;
    const sy = window.pageYOffset;
    let idx = 0;
    for (let i = 0; i < spy.tops.length; i++) if (sy + 150 >= spy.tops[i]) idx = i;
    if (spy.bottom > 0 && window.innerHeight + sy >= spy.bottom - 4) idx = spy.tops.length - 1;
    setNavActive(sections[idx].id);
  }

  spyMeasure();
  window.addEventListener('scroll', () => {
    if (!spy.queued) { spy.queued = true; requestAnimationFrame(updateActiveNav); }
  }, { passive: true });
  window.addEventListener('resize', spyMeasure);
  window.addEventListener('load', spyMeasure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(spyMeasure);

  // ─────────────────────────────────────────────────────────
  // 4. Floating Page Scroll-In Animations
  // ─────────────────────────────────────────────────────────
  const pageBlocks = document.querySelectorAll('.page-block');
  const pageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('page-floating-in');
    });
  }, { rootMargin: '0px', threshold: 0.05 });

  pageBlocks.forEach((page, i) => { if (i > 0) pageObserver.observe(page); });

  // ─────────────────────────────────────────────────────────
  // 5. THE CREW — floating bedside lamp + five cursor-tracking characters
  //    (the scene lives at the bottom of the certificates page, not the hero)
  // ─────────────────────────────────────────────────────────
  const hcStage = document.getElementById('hc-stage');
  const hcLamp  = document.getElementById('hc-lamp');

  if (hcStage && hcLamp) {
    const eyes   = Array.from(hcStage.querySelectorAll('.hc-eye'));
    const pupils = Array.from(hcStage.querySelectorAll('.hc-pupil'));
    const sways  = Array.from(hcStage.querySelectorAll('.hc-sway'));
    let lit = false, hcRaf = null, hx = 0, hy = 0;
    let eyeCenters = [], lampCenter = null;

    function measureEyes() {
      eyeCenters = eyes.map(e => {
        const r = e.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
      const lr = hcLamp.getBoundingClientRect();
      lampCenter = { x: lr.left + lr.width / 2, y: lr.top + lr.height / 2 };
    }

    function hcRender() {
      hcRaf = null;
      if (!lit || !heroOn()) return;
      const sr = hcStage.getBoundingClientRect();
      const ox = (hx - (sr.left + sr.width / 2)) / (sr.width / 2);   // -1 .. 1
      const oy = (hy - (sr.top + sr.height / 2)) / (sr.height / 2);
      // whole-body parallax sway (each layer owns one transform, no conflicts)
      for (let i = 0; i < sways.length; i++) {
        const d = 7 + (i % 2) * 5;
        sways[i].style.transform = `translate(${ox * d}px, ${oy * d * 0.6}px) rotate(${ox * 1.6}deg)`;
      }
      // pupils look toward the cursor inside their cartoon eyes (skipped while annoyed)
      if (!hcStage.classList.contains('angry') && !hcStage.classList.contains('warn')) {
        for (let i = 0; i < pupils.length; i++) {
          const c = eyeCenters[i] || { x: sr.left + sr.width / 2, y: sr.top + sr.height / 2 };
          const dx = hx - c.x, dy = hy - c.y;
          const a = Math.atan2(dy, dx);
          const dist = Math.min(Math.hypot(dx, dy), 380) / 380 * 5;
          pupils[i].style.transform = `translate(calc(-50% + ${Math.cos(a) * dist}px), calc(-50% + ${Math.sin(a) * dist}px))`;
        }
      }
    }
    function queueHc() { if (lit && !hcRaf && heroOn()) hcRaf = requestAnimationFrame(hcRender); }

    /* Perf: the crew only reacts while the page it stands on can actually be
       seen. Once you have scrolled to another page the pointer, tilt and scroll
       listeners stop doing any geometry work at all. The host is looked up from
       the markup, so the scene can move pages without touching this file. */
    const hcHost = hcStage.closest('.page-block') || document.getElementById('hero');
    function heroOn() { return window.PERF ? PERF.near(hcHost) : true; }
    const reMeasureEyes = window.PERF ? PERF.rafThrottle(() => { if (lit && heroOn()) measureEyes(); })
                                      : () => { if (lit && heroOn()) measureEyes(); };

    // desktop: cursor tracking + "annoyed" warning as the pointer nears the lamp
    window.addEventListener('mousemove', (e) => {
      hx = e.clientX; hy = e.clientY;
      if (!lit || !heroOn()) return;
      if (lampCenter && !hcStage.classList.contains('angry')) {
        const near = Math.hypot(hx - lampCenter.x, hy - lampCenter.y) < 150;
        hcStage.classList.toggle('warn', near);
      }
      queueHc();
    }, { passive: true });

    // touch: finger drags the gaze around
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) { hx = e.touches[0].clientX; hy = e.touches[0].clientY; queueHc(); }
    }, { passive: true });

    // mobile: no cursor, so use the device tilt (gyroscope) to move the eyes
    window.addEventListener('deviceorientation', (e) => {
      if (!lit || (e.gamma == null && e.beta == null) || !heroOn()) return;
      const sr = hcStage.getBoundingClientRect();
      const g = Math.max(-45, Math.min(45, e.gamma || 0)) / 45;                 // left/right tilt
      const b = Math.max(-30, Math.min(30, (e.beta || 45) - 45)) / 30;          // front/back tilt
      hx = sr.left + sr.width / 2 + g * (sr.width / 2);
      hy = sr.top + sr.height / 2 + b * (sr.height / 2);
      queueHc();
    });

    window.addEventListener('resize', () => { if (lit && heroOn()) { measureEyes(); hcRender(); } });
    window.addEventListener('scroll', reMeasureEyes, { passive: true });

    // wake the characters up again when their own page comes back into view
    if (window.PERF) PERF.onChange((el, isNear) => {
      if (el !== hcHost) return;
      if (isNear && lit) { measureEyes(); queueHc(); origLit(); }
      else if (!isNear) {
        if (hcRaf) { cancelAnimationFrame(hcRaf); hcRaf = null; }
        if (idleRaf) { cancelAnimationFrame(idleRaf); idleRaf = null; }
      }
    });

    // mobile idle: gentle autonomous eye movement when no touch is active
    let idleRaf = null, idleT = 0, touching = false;
    window.addEventListener('touchstart', () => { touching = true; if (idleRaf) { cancelAnimationFrame(idleRaf); idleRaf = null; } }, { passive: true });
    window.addEventListener('touchend', () => { touching = false; setTimeout(() => { if (!touching && lit) startIdle(); }, 2000); }, { passive: true });
    function startIdle() {
      if (idleRaf || !lit || !('ontouchstart' in window) || !heroOn()) return;
      const loop = (ts) => {
        if (!lit || touching || !heroOn()) { idleRaf = null; return; }   // parked: no frames at all
        idleT = ts * 0.001;
        const sr = hcStage.getBoundingClientRect();
        hx = sr.left + sr.width / 2 + Math.sin(idleT * 0.7) * sr.width * 0.35;
        hy = sr.top + sr.height / 2 + Math.cos(idleT * 0.5) * sr.height * 0.2;
        hcRender();
        idleRaf = requestAnimationFrame(loop);
      };
      idleRaf = requestAnimationFrame(loop);
    }
    // start idle when lamp is first lit on touch device
    const origLit = () => { if ('ontouchstart' in window) startIdle(); };

    // (speech synthesis was removed from the site; no voice pick needed)

    function turnOn() {
      if (window.SFX) { SFX.lampClack(true); setTimeout(() => SFX.whoosh(), 150); }
      lit = true;
      hcStage.classList.remove('angry', 'warn', 'dozing');
      hcStage.classList.add('lit');
      hcLamp.setAttribute('aria-pressed', 'true');
      setTimeout(measureEyes, 200);
      setTimeout(() => { measureEyes(); hcRender(); origLit(); }, 1950); // re-measure once the staggered flip settles
    }
    function turnOff() {
      if (window.SFX) SFX.lampClack(false);
      hcStage.classList.remove('warn');
      hcStage.classList.add('angry'); // protest with annoyed faces before dozing off
      setTimeout(() => {
        lit = false;
        hcStage.classList.remove('lit', 'angry');
        hcStage.classList.add('dozing'); // sink back down with the reverse flip, one by one
        hcLamp.setAttribute('aria-pressed', 'false');
        setTimeout(() => hcStage.classList.remove('dozing'), 1500);
      }, 1500);
    }
    function toggleHc() {
      if (lit) { if (!hcStage.classList.contains('angry')) turnOff(); }
      else turnOn();
    }

    hcLamp.addEventListener('click', toggleHc);
    hcLamp.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleHc(); } });

    // prime the lamp center so the proximity warning works from the very first hover
    measureEyes();
  }

  // ─────────────────────────────────────────────────────────
  // 5a. HERO ARCH — the portrait frame's drop-in photo slot
  // ─────────────────────────────────────────────────────────
  /* Put a portrait in assets/photo/ and it takes over the arch; the first
     candidate that loads wins. Two kinds of file are supported and told apart
     automatically by sampling the image's border alpha (not the name):
       • a background-cutout PNG (transparent around the person) is drawn
         "contain", so the blue arch shows behind her — the intended look;
       • an ordinary rectangular photo is drawn "cover" to fill the frame.
     Drop a cutout named rashmi-cutout.png (or portrait-cutout.png) and it is
     picked first; otherwise photo_3 / rashmi are used as-is. */
  const HERO_PHOTO_CANDIDATES = [
    'assets/photo/rashmi-popout.png',
    'assets/photo/rashmi-color-chestup.png',
    'assets/photo/rashmi-duotone.png',
    'assets/photo/rashmi-removebg-preview.png',
    'assets/photo/photo_3-removebg-preview.png',
    'assets/photo/rashmi-cutout.png',
    'assets/photo/portrait-cutout.png',
    'assets/photo/photo_3-cutout.png',
    'assets/photo/photo_3_cutout.png',
    'assets/photo/photo_3.png',
    'assets/photo/photo_3.jpg',
    'assets/photo/photo_3.jpeg',
    'assets/photo/rashmi.png',
    'assets/photo/rashmi.jpeg',
    'assets/photo/rashmi.jpg',
    'assets/photo/photo_1.png',
    'assets/photo/photo_1.jpeg',
    'assets/photo/photo_1.jpg'
  ];
  const heroArch = document.getElementById('hero-arch');

  /* sample the border of a loaded image; if enough edge points are transparent
     it is a cutout — trust the pixels, not the filename. Same-origin, so the
     canvas read is allowed. */
  function isCutout(img) {
    try {
      const w = Math.min(img.naturalWidth || 0, 80) || 1;
      const h = Math.min(img.naturalHeight || 0, 80) || 1;
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(img, 0, 0, w, h);
      const d = x.getImageData(0, 0, w, h).data;
      const a = (px, py) => d[(py * w + px) * 4 + 3];
      const mx = w >> 1, my = h >> 1;
      const edge = [a(1, 1), a(w - 2, 1), a(1, h - 2), a(w - 2, h - 2), a(mx, 1), a(1, my), a(w - 2, my)];
      let clear = 0;
      for (const v of edge) if (v < 32) clear++;
      return clear >= 4;
    } catch (e) { return false; }
  }

  if (heroArch) {
    (function tryNext(i) {
      if (i >= HERO_PHOTO_CANDIDATES.length) return;   // no portrait found: keep placeholder
      const src = HERO_PHOTO_CANDIDATES[i];
      const probe = new Image();
      probe.onload = () => {
        const shot = document.createElement('img');
        shot.className = 'arch-photo' + (isCutout(probe) ? ' arch-cutout' : '');
        shot.src = src;
        shot.alt = 'Portrait of Rashmi';
        heroArch.appendChild(shot);
        heroArch.classList.add('has-photo');
      };
      probe.onerror = () => tryNext(i + 1);
      probe.src = src;
    })(0);
  }

  // ─────────────────────────────────────────────────────────
  // 5a.2 HERO ROLE — the serif line cycles through the disciplines
  // ─────────────────────────────────────────────────────────
  /* Only a class swap every ~3s, and it does not even do that while the hero is
     off screen or the tab is in the background (same park rule the characters
     already follow). With JS off, the first role is baked into the markup. */
  const roleRot = document.getElementById('role-rot');

  if (roleRot && !(window.PERF && PERF.reduceMotion)) {
    const roles = Array.from(roleRot.children);
    let rIndex = 0, roleTimer = null;

    function nextRole() {
      const leaving = roles[rIndex];
      rIndex = (rIndex + 1) % roles.length;
      leaving.classList.remove('cur');
      leaving.classList.add('out');
      setTimeout(() => leaving.classList.remove('out'), 850);
      roles[rIndex].classList.add('cur');
    }
    function rolePlay() {
      if (roleTimer || roles.length < 2) return;
      if (window.PERF && !PERF.near('hero')) return;
      roleTimer = setInterval(nextRole, 2900);
    }
    function rolePause() { clearInterval(roleTimer); roleTimer = null; }

    if (window.PERF) PERF.onChange((el, isNear) => {
      if (el.id !== 'hero') return;
      if (isNear) rolePlay(); else rolePause();
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) rolePause(); else rolePlay(); });
    rolePlay();
  }

  // ─────────────────────────────────────────────────────────
  // 5b. HERO TITLE — liquid ripple (waves when the cursor disturbs the name)
  // ─────────────────────────────────────────────────────────
  const heroTitle  = document.querySelector('.hero-title');
  const liquidDisp = document.getElementById('liquidDisp');
  const liquidTurb = document.getElementById('liquidTurb');

  if (heroTitle && liquidDisp && liquidTurb && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let target = 0, current = 0, raf = null, lastX = 0, lastY = 0, phase = 0;
    let wfAt = 0, lastBf = '', lastScale = '';

    function rippleLoop(now) {
      raf = null;
      if (window.PERF && !PERF.near('hero')) { current = 0; target = 0; return; } // nobody can see the name
      /* Performance Mode: the feTurbulence/feDisplacement pair is the single
         most expensive pixel operation on the page, so park it flat and stop. */
      if (window.PERF && PERF.perfMode) {
        current = 0; target = 0;
        if (lastScale !== '0') { lastScale = '0'; liquidDisp.setAttribute('scale', '0'); }
        heroTitle.classList.remove('rippling');
        return;
      }
      current += (target - current) * 0.18;   // ease the surface toward the disturbance
      target  *= 0.90;                          // the wake slowly dies down
      if (current < 0.06 && target < 0.06) {    // fully calm
        current = 0; target = 0;
        if (lastScale !== '0') { lastScale = '0'; liquidDisp.setAttribute('scale', '0'); }
        heroTitle.classList.remove('rippling');
        return;
      }
      phase += 0.05;                            // travelling wave frequency
      const bfY = 0.012 + Math.sin(phase) * 0.006;
      /* A live feTurbulence + feDisplacementMap pair over a big headline is the
         most expensive pixel work on the whole page: every attribute change
         re-rasterises the noise field. Steps of 0.001 / 0.4px are invisible, so
         the filter is refreshed ~22 times a second instead of 60. */
      if (now - wfAt >= 45) {
        wfAt = now;
        const bf = `0 ${bfY.toFixed(3)}`, sc = current.toFixed(1);
        if (bf !== lastBf) { lastBf = bf; liquidTurb.setAttribute('baseFrequency', bf); }
        if (sc !== lastScale) { lastScale = sc; liquidDisp.setAttribute('scale', sc); }
      }
      raf = requestAnimationFrame(rippleLoop);
    }
    function startRipple() { if (window.PERF && PERF.perfMode) return; if (!raf) raf = requestAnimationFrame(rippleLoop); }

    heroTitle.addEventListener('mousemove', (e) => {
      const speed = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      lastX = e.clientX; lastY = e.clientY;
      target = Math.min(26, target + speed * 0.55 + 3);  // faster cursor = bigger waves
      heroTitle.classList.add('rippling');
      startRipple();
    });
    heroTitle.addEventListener('mouseleave', () => { target = 0; startRipple(); });
  }

  // ─────────────────────────────────────────────────────────
  // 6. COVERFLOW GALLERY SYSTEM
  // ─────────────────────────────────────────────────────────
  const allCoverflowCards = Array.from(document.querySelectorAll('.coverflow-card'));
  let visibleCards  = [...allCoverflowCards]; // current filtered set
  let activeIndex   = 0;                      // index within visibleCards

  const cfDashBar        = document.getElementById('cf-dash-indicators');
  const cfPrevBtn        = document.getElementById('cf-prev-btn');
  const cfNextBtn        = document.getElementById('cf-next-btn');
  const track            = document.getElementById('coverflow-track');

  // ── Sync each card's plate text with its (verified) data attributes ──
  allCoverflowCards.forEach(card => {
    const t = card.getAttribute('data-title');
    const s = card.getAttribute('data-sub');
    const p = card.getAttribute('data-pill');
    const plateTitle = card.querySelector('.plate-title');
    const plateSub   = card.querySelector('.plate-sub');
    const firstPill  = card.querySelector('.plate-pill');
    if (plateTitle && t) plateTitle.textContent = t;
    if (plateSub   && s) plateSub.textContent   = s;
    if (firstPill  && p) firstPill.textContent  = p;
  });

  // ── Coverflow transform configs by relative position ──
  // Each entry: [translateX(px), translateZ(px), rotateY(deg), scale, opacity, brightness, zIndex]
  const CF_POSITIONS = {
    '-4': [-740, -280, -65,  0.52, 0, 0.3, 1],
    '-3': [-555, -220, -58,  0.62, 0.22, 0.38, 3],
    '-2': [-380, -160, -50,  0.74, 0.44, 0.55, 6],
    '-1': [-215,  -80, -38,  0.87, 0.70, 0.75, 10],
     '0': [   0,    0,   0,  1.12, 1.0, 1.0, 20],
     '1': [ 215,  -80,  38,  0.87, 0.70, 0.75, 10],
     '2': [ 380, -160,  50,  0.74, 0.44, 0.55, 6],
     '3': [ 555, -220,  58,  0.62, 0.22, 0.38, 3],
     '4': [ 740, -280,  65,  0.52, 0, 0.3, 1],
  };

  // ── Render the coverflow positional transforms ──
  // 33 absolutely-positioned 3D cards, each carrying a photo and a brightness
  // filter. Used to be re-styled from scratch on every navigation (and every
  // dash click), so a single step rewrote 6 properties on 33 layers at once.
  // Now: each card remembers the slot it was last given and is skipped when it
  // has not moved, and cards that are outside the visible ±4 band are taken out
  // of the paint tree entirely with .cf-dead instead of being kept as invisible
  // live surfaces.
  function renderCoverflow() {
    if (!track) return;

    const posOf = new Map();
    visibleCards.forEach((card, i) => posOf.set(card, i - activeIndex));

    allCoverflowCards.forEach(card => {
      const has = posOf.has(card);
      const pos = has ? posOf.get(card) : 99;
      const dead = !has || Math.abs(pos) > 4;
      const key = dead ? 'd' : String(pos);
      if (card._cfKey === key) return;
      card._cfKey = key;

      if (dead) {
        card.classList.add('cf-dead');
        card.classList.remove('active-card');
        card.style.transform     = 'translateX(0px) translateZ(-700px) rotateY(0deg) scale(0.4)';
        card.style.opacity       = '0';
        card.style.filter        = 'brightness(0.2)';
        card.style.zIndex        = '0';
        card.style.pointerEvents = 'none';
        card.style.boxShadow     = '0 20px 50px rgba(0,0,0,0.6)';
        return;
      }
      card.classList.remove('cf-dead');

      const cfg = CF_POSITIONS[String(Math.max(-4, Math.min(4, pos)))];
      if (!cfg) return;
      const [tx, tz, ry, sc, op, br, zi] = cfg;
      card.style.transform     = `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) scale(${sc})`;
      card.style.opacity       = String(op);
      card.style.filter        = br >= 1 ? 'none' : `brightness(${br})`;
      card.style.zIndex        = String(zi);
      card.style.pointerEvents = op > 0 ? 'auto' : 'none';

      const active = pos === 0;
      card.classList.toggle('active-card', active);
      card.style.boxShadow = active
        ? '0 40px 80px rgba(0,0,0,0.85), 0 0 60px rgba(0,93,158,0.55)'
        : '0 20px 50px rgba(0,0,0,0.6)';
    });

    // Update the live description panel (replaces the old 01/33 counter)
    updateCertDetailPanel();

    // Update dashes
    renderDashes();
  }

  // ── Render the full description of the currently centered certificate ──
  function updateCertDetailPanel() {
    const card = visibleCards[activeIndex];
    const panel = document.getElementById('cert-detail-panel');
    if (!card || !panel) return;

    const get = attr => card.getAttribute(attr) || '—';
    document.getElementById('cdp-title').textContent      = get('data-title');
    document.getElementById('cdp-type').textContent       = get('data-type');
    document.getElementById('cdp-org').textContent        = get('data-org');
    document.getElementById('cdp-date').textContent       = get('data-date');
    document.getElementById('cdp-position').textContent   = get('data-position');
    document.getElementById('cdp-event-type').textContent = get('data-type');
    document.getElementById('cdp-description').textContent = get('data-detail');

    const tagsWrap = document.getElementById('cdp-tags');
    tagsWrap.innerHTML = '';
    (card.getAttribute('data-pill') || '').split(/\s+/).filter(Boolean).forEach(p => {
      const el = document.createElement('span');
      el.className = 'plate-pill';
      el.textContent = p;
      tagsWrap.appendChild(el);
    });

    // Re-trigger entrance animation
    panel.classList.remove('cdp-animate');
    requestAnimationFrame(() => { panel.classList.add('cdp-animate'); });
  }

  // ── Render dash indicators (max 15 shown, then collapses) ──
  // The bar used to be destroyed and rebuilt on every navigation, which threw
  // away 15 nodes and their listeners each time. The dashes are kept and only
  // their width/active class are touched when they actually change.
  let dashPool = null, dashState = '';
  function renderDashes() {
    if (!cfDashBar) return;

    const total = visibleCards.length;
    const maxDashes = Math.min(total, 15);
    const step = total > 15 ? total / 15 : 1;
    const state = total + ':' + activeIndex;
    if (dashPool && dashState === state) return;
    dashState = state;

    if (!dashPool || dashPool.length !== maxDashes) {
      cfDashBar.innerHTML = '';
      dashPool = [];
      for (let d = 0; d < maxDashes; d++) {
        const dash = document.createElement('div');
        dash.className = 'cf-dash';
        const slot = d;
        dash.addEventListener('click', () => {
          const t = visibleCards.length;
          if (!t) return;
          activeIndex = Math.max(0, Math.min(t - 1, Math.round(slot * (t > 15 ? t / 15 : 1))));
          renderCoverflow();
        });
        cfDashBar.appendChild(dash);
        dashPool.push(dash);
      }
    }

    dashPool.forEach((dash, d) => {
      const mappedIndex = Math.round(d * step);
      const dist = Math.abs(mappedIndex - activeIndex);
      const w = dist === 0 ? '24px' : dist === 1 ? '14px' : '8px';
      if (dash.style.width !== w) dash.style.width = w;
      dash.classList.toggle('active', mappedIndex === activeIndex);
    });
  }

  // ── Navigate ──
  function goTo(newIndex) {
    if (visibleCards.length === 0) return;
    activeIndex = Math.max(0, Math.min(newIndex, visibleCards.length - 1));
    renderCoverflow();
  }

  function goNext() { goTo(activeIndex + 1); }
  function goPrev() { goTo(activeIndex - 1); }

  if (cfNextBtn) cfNextBtn.addEventListener('click', goNext);
  if (cfPrevBtn) cfPrevBtn.addEventListener('click', goPrev);

  // ── Keyboard navigation ──
  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('cert-modal');
    if (modal && modal.classList.contains('active')) return; // modal is open
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft')  goPrev();
  });

  // ── Open a card's full preview (shared by real click and stage tap) ──
  function openCardFromStage(card) {
    const visIdx = visibleCards.indexOf(card);
    if (visIdx === -1) return; // hidden card (filtered out)
    activeIndex = visIdx;
    renderCoverflow();
    openCertModalFromCard(card);
  }

  // ── Click on card → open the full-view modal (image/PDF + description) ──
  // NOTE: setPointerCapture on the stage retargets real clicks to the stage, so
  // this card click may not fire in normal use — the stage pointerup below also
  // opens the tapped card. Both paths call openCardFromStage (idempotent).
  allCoverflowCards.forEach(card => {
    card.addEventListener('click', () => {
      if (suppressNextClick) { suppressNextClick = false; return; } // ignore a real swipe
      openCardFromStage(card);
    });
  });

  // ── Touch / Mouse Drag on the stage ──
  let dragStartX    = 0;
  let dragThreshold = 55;
  let isDragging    = false;
  let suppressNextClick = false;

  const stage = document.querySelector('.coverflow-stage');
  if (stage) {
    stage.addEventListener('pointerdown', (e) => {
      dragStartX = e.clientX;
      isDragging = true;
      suppressNextClick = false;
      stage.setPointerCapture(e.pointerId);
    });

    stage.addEventListener('pointerup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const delta = e.clientX - dragStartX;
      if (Math.abs(delta) > dragThreshold) {
        // Real horizontal swipe → navigate and cancel the synthesized click
        suppressNextClick = true;
        if (delta < 0) goNext();
        else           goPrev();
      } else {
        // Tap (no meaningful movement) → open the card under the pointer.
        // setPointerCapture retargets the click to the stage, so we handle it here.
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const card = el && el.closest ? el.closest('.coverflow-card') : null;
        if (card) openCardFromStage(card);
      }
    });

    stage.addEventListener('pointercancel', () => { isDragging = false; });
    stage.addEventListener('dragstart', e => e.preventDefault());
  }

  // ── Mouse Wheel on coverflow container ──
  const coverflowContainer = document.querySelector('.coverflow-container');
  if (coverflowContainer) {
    let wheelCooldown = 0;
    coverflowContainer.addEventListener('wheel', (e) => {
      // Allow native page vertical scrolling to proceed untouched without trapping the user!
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) + 5 || e.shiftKey;
      if (!isHorizontal) return;
      e.preventDefault();
      const now = performance.now();
      if (now - wheelCooldown < 200) return;
      wheelCooldown = now;
      if (e.deltaX > 0 || (e.shiftKey && e.deltaY > 0)) goNext();
      else goPrev();
    }, { passive: false });
  }

  // ── Category Filter Buttons ──
  const filterBtns = document.querySelectorAll('.cert-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });

  // ── Search Input ──
  const searchInput = document.getElementById('gallery-search');
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  // ── Combined Filter + Search ──
  function applyFilters() {
    const activeFilterBtn = document.querySelector('.cert-filter-btn.active');
    const filterVal = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
    const query     = searchInput ? searchInput.value.toLowerCase().trim() : '';

    visibleCards = allCoverflowCards.filter(card => {
      const category = card.getAttribute('data-category') || '';
      const tags     = (card.getAttribute('data-tags') || '').toLowerCase();
      const title    = (card.getAttribute('data-title') || '').toLowerCase();
      const sub      = (card.getAttribute('data-sub') || '').toLowerCase();

      const matchesCategory = filterVal === 'all' || category === filterVal;
      const matchesSearch   = query === '' ||
        tags.includes(query) || title.includes(query) || sub.includes(query);

      return matchesCategory && matchesSearch;
    });

    activeIndex = 0;
    renderCoverflow();
  }

  // ── Initial render ──
  renderCoverflow();

  // ─────────────────────────────────────────────────────────
  // 7. Contact Form Simulation
  // ─────────────────────────────────────────────────────────
  const contactForm = document.getElementById('portfolio-contact-form');
  const formFeedback = document.getElementById('form-feedback');

  if (contactForm && formFeedback) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;
        formFeedback.className = 'form-feedback success';
        formFeedback.textContent = 'Thank you! Your message has been sent. Rashmi will respond soon.';
        if (window.SFX) SFX.chime();
        contactForm.reset();
        setTimeout(() => { formFeedback.style.display = 'none'; }, 5500);
      }, 900);
    });
  }

  // ─────────────────────────────────────────────────────────
  // 8. (Navbar liquid slider is handled in section 2 above)
  // ─────────────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────
  // 9. Radial Share Button (Contact)
  // ─────────────────────────────────────────────────────────
  const shareMenu = document.getElementById('share-menu');
  const shareToggle = document.getElementById('share-toggle');
  if (shareMenu && shareToggle) {
    shareToggle.addEventListener('click', () => {
      const open = shareMenu.classList.toggle('open');
      shareToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (window.SFX) open ? SFX.blip() : SFX.pluck();
    });
    shareMenu.addEventListener('click', (e) => {
      if (window.SFX && e.target.closest('.share-item')) SFX.tick();
    });

    const copyBtn = document.getElementById('share-copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          if (window.SFX) SFX.chime();
          copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
          const hint = document.querySelector('.share-hint');
          if (hint) hint.textContent = 'Link copied!';
          setTimeout(() => { copyBtn.innerHTML = '<i class="fa-solid fa-link"></i>'; if (hint) hint.textContent = 'Pick a channel to share'; }, 1600);
        } catch (err) {
          /* clipboard unavailable — no-op */
        }
      });
    }
  }

  // ─────────────────────────────────────────────────────────
  // 10. Contact Dock — magnifying keyboard dock (flip letter→icon)
  //     Runs for every .cd-stage on the page (hero + contact).
  // ─────────────────────────────────────────────────────────
  function initContactDock(cdStage) {
    const cdDock = cdStage.querySelector('.cd-dock');
    const cdRow  = cdStage.querySelector('.cd-row');
    if (!cdDock || !cdRow) return;
    const CONTACTS = [
      { label: 'GitHub',   letter: 'G', href: 'https://github.com/JRashmi-97',                blank: true,  svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>' },
      { label: 'LinkedIn', letter: 'L', href: 'https://linkedin.com/in/rashmi-jaiswal218853',   blank: true,  svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>' },
      { label: 'Email',    letter: '@', href: 'mailto:jaiswal.rashmi218853@gmail.com',          blank: false, svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 5.6A1.6 1.6 0 0 1 3.6 4h16.8A1.6 1.6 0 0 1 22 5.6v.2l-10 6.5L2 5.8zM2 8.3v10.1A1.6 1.6 0 0 0 3.6 20h16.8a1.6 1.6 0 0 0 1.6-1.6V8.3l-9.4 6.1a1.1 1.1 0 0 1-1.2 0z"/></svg>' },
      { label: 'WhatsApp', letter: 'W', href: 'https://wa.me/918766398812',                     blank: true,  svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.5-5.264c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' },
      { label: 'Call',     letter: '\u260E', href: 'tel:+918766398812',                          blank: false, svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.18z"/></svg>' }
    ];
    const reduceCD = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const BASE = 56, KH = 58, GAP = 8, DH = 80;
    const n = CONTACTS.length;
    const DW = n * (BASE + GAP) - GAP + 56;
    let U = 1, kb = -1, running = false, last = 0;
    const px = { v: DW / 2, t: DW / 2 }, amp = { v: 0, t: 0 };
    const SC = CONTACTS.map(() => 1), FC = CONTACTS.map(() => false);
    const restC = i => (DW / 2 + (i - (n - 1) / 2) * (BASE + GAP)) * U;

    const keys = CONTACTS.map((c) => {
      const a = document.createElement('a');
      a.className = 'cd-key';
      a.href = c.href;
      if (c.blank) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      a.setAttribute('aria-label', c.label);
      a.innerHTML = '<span class="cd-inner"><span class="cd-face cd-letter">' + c.letter + '</span><span class="cd-face cd-icon">' + c.svg + '</span></span><span class="cd-tip">' + c.label + '</span>';
      a.addEventListener('focus', () => { kb = CONTACTS.indexOf(c); amp.t = 1; px.t = restC(kb); start(); });
      a.addEventListener('blur', () => { kb = -1; amp.t = 0; start(); });
      a.addEventListener('pointerenter', () => { if (window.SFX) SFX.tick(); });
      a.addEventListener('click', () => { if (window.SFX) SFX.pop(); });
      cdRow.appendChild(a);
      return a;
    });

    function cdFit() {
      U = Math.min(1, (cdStage.clientWidth * 0.94) / DW);
      cdDock.style.width = DW * U + 'px';
      cdDock.style.height = DH * U + 'px';
      cdRow.style.gap = GAP * U + 'px';
      cdRow.style.paddingBottom = 13 * U + 'px';
      px.v = px.t = DW * U / 2;
      cdApply();
    }
    function cdApply() {
      let best = -1, bs = 1.4;
      keys.forEach((k, i) => {
        const d = (px.v - restC(i)) / ((BASE + GAP) * U);
        const s = SC[i] = 1 + 0.6 * amp.v * Math.exp(-Math.pow(d / 1.15, 2));
        k.style.width = BASE * s * U + 'px';
        k.style.height = KH * s * U + 'px';
        k.style.zIndex = Math.round(s * 10);
        k.style.setProperty('--fs', 22 * s * U + 'px');
        if (!FC[i] && s > 1.22) FC[i] = true; else if (FC[i] && s < 1.12) FC[i] = false;
        k.classList.toggle('flip', FC[i]);
        k.querySelector('.cd-icon').style.setProperty('--glow', Math.min(1, Math.max(0, (s - 1.1) / 0.45)));
        if (s > bs) { bs = s; best = i; }
      });
      keys.forEach((k, i) => k.classList.toggle('show', i === best && amp.v > 0.45));
      cdDock.style.setProperty('--gx', px.v + 'px');
      cdDock.style.setProperty('--gy', (amp.v * DH * U) + 'px');
    }
    function cdStep(t) {
      const dt = Math.min((t - last) / 1000 || 0.016, 0.04); last = t;
      const a = 1 - Math.pow(0.0005, dt), b = 1 - Math.pow(0.00002, dt);
      px.v += (px.t - px.v) * b; amp.v += (amp.t - amp.v) * a;
      cdApply();
      if (Math.abs(px.t - px.v) < 0.05 && Math.abs(amp.t - amp.v) < 0.003) {
        amp.v = amp.t; px.v = px.t; cdApply();
        if (amp.t === 0) { cdDock.style.setProperty('--gy', '0px'); cdDock.style.setProperty('--gx', DW * U / 2 + 'px'); }
        running = false; return;
      }
      requestAnimationFrame(cdStep);
    }
    function start() { if (reduceCD) { px.v = px.t; amp.v = amp.t; cdApply(); return; } if (!running) { running = true; last = performance.now(); requestAnimationFrame(cdStep); } }
    function move(e) { const r = cdDock.getBoundingClientRect(); px.t = e.clientX - r.left; if (amp.t === 0) px.v = px.t; amp.t = 1; start(); }
    cdDock.addEventListener('pointerenter', move);
    cdDock.addEventListener('pointermove', move);
    cdDock.addEventListener('pointerleave', () => { if (kb < 0) { amp.t = 0; start(); } });
    window.addEventListener('resize', cdFit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(cdFit);
    cdFit();
    cdDock.style.setProperty('--gx', DW * U / 2 + 'px');
  }
  document.querySelectorAll('.cd-stage').forEach(initContactDock);

  // ─────────────────────────────────────────────────────────
  // 11. Download Résumé — morphing disc button. Decides success vs
  //     fail at click time by fetching the resume file.
  // ─────────────────────────────────────────────────────────
  const drBtn  = document.getElementById('dr-btn');
  const drItem = document.getElementById('dr-item');
  if (drBtn && drItem) {
    const RESUME_URL = 'assets/resume/Rashmi_Resume.pdf';
    const N = 29, R = 44, CIRC = 2 * Math.PI * R;
    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const smooth = t => { t = clamp(t); return t * t * (3 - 2 * t); };
    const ARROW = [], CHECK = [];
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      ARROW.push(u < .5 ? [lerp(-15, 0, u * 2), lerp(6, 21.7, u * 2)] : [lerp(0, 15, (u - .5) * 2), lerp(21.7, 6, (u - .5) * 2)]);
      CHECK.push(u < .45 ? [lerp(-16, -1, u / .45), lerp(0, 13, u / .45)] : [lerp(-1, 21, (u - .45) / .55), lerp(13, -9, (u - .45) / .55)]);
    }
    drBtn.innerHTML = `<svg viewBox="-53 -53 106 106" aria-hidden="true">
      <circle class="dr-disc" r="53"/><circle class="dr-track" r="${R}"/>
      <circle class="dr-arc" r="${R}" stroke-dasharray="0 ${CIRC}"/>
      <line class="dr-ink dr-shaft" x1="0" x2="0" y1="-21.700" y2="21.700"/>
      <polyline class="dr-ink dr-poly"/><text class="dr-pct" y="21" opacity="0"></text></svg>`;
    const $ = s => drBtn.querySelector(s);
    const arc = $('.dr-arc'), shaft = $('.dr-shaft'), poly = $('.dr-poly'), pct = $('.dr-pct');
    let state = 'idle', raf = 0, t0 = 0, mode = 'ok';
    const IDLE = { m1: 0, m2: 0, w: 46, y0: 2, amp: 0, ph: 0, y1: -21.7, y2: 21.7, shaft: 1, p: 0, pop: 0 };
    function draw(o) {
      const pts = ARROW.map((a, i) => {
        const u = i / (N - 1);
        const fx = -o.w / 2 + u * o.w, fy = o.y0 + o.amp * Math.sin(u * Math.PI * 2 + o.ph);
        let x = lerp(a[0], fx, o.m1), y = lerp(a[1], fy, o.m1);
        x = lerp(x, CHECK[i][0], o.m2); y = lerp(y, CHECK[i][1], o.m2);
        return x.toFixed(2) + ',' + y.toFixed(2);
      });
      poly.setAttribute('points', pts.join(' '));
      shaft.setAttribute('y1', o.y1); shaft.setAttribute('y2', o.y2);
      shaft.style.strokeWidth = lerp(2.2, 5, clamp((o.m1 - .5) * 2));
      shaft.style.opacity = o.shaft;
      arc.setAttribute('stroke-dasharray', `${CIRC * o.p} ${CIRC}`);
      pct.setAttribute('opacity', o.pop); pct.textContent = Math.round(o.p * 100) + '%';
    }
    draw(IDLE);
    const T1 = 220, T2 = 520;
    function frame(now) {
      const t = now - t0, o = { ...IDLE }, d = mode === 'ok' ? 2600 : 2300;
      o.ph = t * .004;
      if (t < T1) { const u = ease(t / T1); o.m1 = u; o.y2 = lerp(21.7, -18, u); o.w = lerp(30, 34, u); }
      else { const u = easeOut(clamp((t - T1) / (T2 - T1))); o.m1 = 1; o.y1 = lerp(-21.7, -44, u); o.y2 = lerp(-18, -44, u); o.w = lerp(34, 46, u); }
      const x = clamp((t - T2) / d);
      o.shaft = t < T2 ? 1 : 0;
      o.p = mode === 'ok' ? 1 - Math.pow(1 - x, 2) : .68 * (1 - Math.pow(1 - x, 3));
      const ramp = smooth((t - T1 - 100) / (T2 - T1 + 50));
      const env = mode === 'ok' ? 1 - smooth((o.p - .8) / .2) : 1 - smooth((x - .72) / .28);
      o.amp = 5 * ramp * env;
      o.pop = t > T2 + 60 && x < 1 ? .85 : 0;
      o.y0 = lerp(2, -1, ramp);
      if (t > T2) drBtn.classList.add('dr-go');
      const tEnd = T2 + d;
      if (mode === 'ok') {
        if (t > tEnd + 150) o.m2 = ease(clamp((t - tEnd - 150) / 180));
        if (t > tEnd + 150 && !drItem.classList.contains('dr-okd')) { drItem.classList.add('dr-okd'); drBtn.classList.add('dr-done'); }
        if (t > tEnd + 150 + 180 + 1900) return finish();
      } else {
        if (x >= .9 && !drBtn.classList.contains('dr-fail')) { drBtn.classList.add('dr-fail', 'dr-done'); drItem.classList.add('dr-faild'); }
        if (t > tEnd + 2200) return finish();
      }
      draw(o); raf = requestAnimationFrame(frame);
    }
    function finish() {
      drBtn.classList.add('dr-reset');
      setTimeout(() => {
        drBtn.classList.remove('dr-go', 'dr-done', 'dr-fail'); drItem.classList.remove('dr-okd', 'dr-faild');
        draw(IDLE); drBtn.classList.remove('dr-reset'); state = 'idle';
      }, 260);
    }
    function ripple(e) {
      const r = drBtn.getBoundingClientRect(), d = document.createElement('span'); d.className = 'dr-ripple';
      const kb = (e.detail === 0 || typeof e.clientX !== 'number');
      d.style.left = (kb ? r.width * .3 : e.clientX - r.left) + 'px';
      d.style.top = (kb ? r.height * .7 : e.clientY - r.top) + 'px';
      drBtn.appendChild(d); setTimeout(() => d.remove(), 600);
    }
    function startAnim() {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        drBtn.classList.add('dr-go');
        if (mode === 'ok') { draw({ ...IDLE, m1: 1, m2: 1, p: 1, y1: -44, y2: -44, shaft: 0 }); drBtn.classList.add('dr-done'); drItem.classList.add('dr-okd'); }
        else { draw({ ...IDLE, m1: 1, p: .68, y1: -44, y2: -44, shaft: 0 }); drBtn.classList.add('dr-fail', 'dr-done'); drItem.classList.add('dr-faild'); }
        setTimeout(finish, 2200); return;
      }
      t0 = performance.now(); raf = requestAnimationFrame(frame);
    }
    drBtn.addEventListener('click', async (e) => {
      if (state !== 'idle') return; state = 'run'; ripple(e);
      try {
        const res = await fetch(RESUME_URL, { cache: 'no-store' });
        if (res.ok) {
          mode = 'ok';
          if (window.SFX) SFX.pop();
          try {
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'Rashmi-Resume.pdf';
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
          } catch (_) { /* download blocked, still show success */ }
        } else { mode = 'fail'; }
      } catch (_) { mode = 'fail'; }
      startAnim();
    });
  }

});

// ─────────────────────────────────────────────────────────
// Certificate Full-View Modal Handlers (global)
// ─────────────────────────────────────────────────────────
function openCertModalFromCard(card) {
  const file  = card.getAttribute('data-file') || '';
  const isPdf = card.getAttribute('data-is-pdf') === 'true';
  if (!file) return;

  const modal    = document.getElementById('cert-modal');
  const modalImg = document.getElementById('cert-modal-img');
  const modalPdf = document.getElementById('cert-modal-pdf');
  if (!modal) return;

  // Fill the description side-panel with the certificate's verified details
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '—'; };
  set('cm-title',      card.getAttribute('data-title'));
  set('cm-type',       card.getAttribute('data-type'));
  set('cm-org',        card.getAttribute('data-org'));
  set('cm-date',       card.getAttribute('data-date'));
  set('cm-position',   card.getAttribute('data-position'));
  set('cm-event-type', card.getAttribute('data-type'));
  set('cm-desc',       card.getAttribute('data-detail'));

  if (isPdf) {
    // PDFs render inside an iframe for in-page full view
    if (modalPdf) { modalPdf.src = file; modalPdf.style.display = 'block'; }
    if (modalImg) modalImg.style.display = 'none';
  } else {
    if (modalImg) { modalImg.src = file; modalImg.style.display = 'block'; modalImg.alt = card.getAttribute('data-title') || 'Certificate Preview'; }
    if (modalPdf) { modalPdf.style.display = 'none'; modalPdf.src = ''; }
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCertModal(event, force) {
  const modal = document.getElementById('cert-modal');
  if (!modal) return;
  if (force || event.target.id === 'cert-modal' || event.target.classList.contains('cert-modal-close')) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    const modalPdf = document.getElementById('cert-modal-pdf');
    if (modalPdf) { modalPdf.src = ''; }
  }
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('cert-modal');
    if (modal && modal.classList.contains('active')) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      const modalPdf = document.getElementById('cert-modal-pdf');
      if (modalPdf) { modalPdf.src = ''; }
    }
  }
});
