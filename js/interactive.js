/* ==========================================================================
   INTERACTIVE SECTIONS — Skills periodic table, Projects "Enter the Cube",
   Pixel-Breakout mini-game. Self-contained; only touches #skills / #projects /
   #bk. Runs after app.js.
   ========================================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { a = a || 0; b = (b === undefined ? 1 : b); return Math.min(b, Math.max(a, v)); };

  /* ======================================================================
     1. SKILLS — the periodic table
     ====================================================================== */
  (function skills() {
    var board = document.getElementById('pt-board');
    if (!board) return;
    var grid = document.getElementById('pt-grid'),
        panel = document.getElementById('pt-panel'),
        filtersEl = document.getElementById('pt-filters'),
        ind = document.getElementById('pt-ind'),
        scan = document.getElementById('pt-scan'),
        cnt = document.getElementById('pt-count');

    var CATS = { all: 'All', lang: 'Languages', front: 'Frontend', back: 'Backend & APIs', ai: 'AI / ML', data: 'Data & Cloud', tool: 'Tools' };
    var TECH = [
      ['Py', 'Python', 'lang', 'Scripting, ML and backends'], ['Jv', 'Java', 'lang', 'Object-oriented programming'], ['C', 'C', 'lang', 'Low-level fundamentals'],
      ['Js', 'JavaScript', 'lang', 'The language of the web'], ['Sq', 'SQL', 'lang', 'Querying relational data'],
      ['Re', 'ReactJS', 'front', 'Component-based user interfaces', ['TechnoBid']], ['Ag', 'Angular', 'front', 'Structured front-end framework', ['PrepIQ', 'Disaster Resource Coordination']],
      ['No', 'NodeJS', 'back', 'JavaScript on the server', ['TechnoBid']], ['Ex', 'ExpressJS', 'back', 'Minimal web framework for Node', ['TechnoBid']],
      ['Mn', 'MERN stack', 'back', 'MongoDB · Express · React · Node', ['TechnoBid']], ['Fl', 'Flask', 'back', 'Lightweight Python web framework'],
      ['Fa', 'FastAPI', 'back', 'Fast, typed Python APIs'], ['.N', '.NET', 'back', 'C# application platform', ['PrepIQ', 'Disaster Resource Coordination']],
      ['Tf', 'TensorFlow', 'ai', 'Deep-learning framework', ['Emotion Recognition System']], ['Ke', 'Keras', 'ai', 'High-level neural-network API'],
      ['Db', 'DistilBERT', 'ai', 'Compact transformer for language', ['Emotion Recognition System']], ['Ls', 'LSTM', 'ai', 'Neural networks with memory'],
      ['Cn', 'CNN', 'ai', 'Convolutional neural networks'], ['Nl', 'NLP', 'ai', 'Teaching machines language'], ['Sp', 'spaCy', 'ai', 'Industrial-strength NLP library'],
      ['Gm', 'Gemini', 'ai', 'Google generative-AI model, via API', ['PrepIQ']], ['OA', 'OpenAI', 'ai', 'GPT-class language models I build on'], ['Hf', 'Hugging Face', 'ai', 'Hub of ready-made transformers & datasets', ['AI Document Translator']],
      ['Sk', 'scikit-learn', 'ai', 'Classical machine learning'], ['Mo', 'MongoDB', 'data', 'Document database', ['TechnoBid']],
      ['Ms', 'MS SQL', 'data', 'Microsoft relational database', ['PrepIQ', 'Disaster Resource Coordination']], ['My', 'MySQL', 'data', 'Most-used open-source relational database'], ['Fb', 'Firebase', 'data', 'Google backend-as-a-service'], ['Su', 'Supabase', 'data', 'Open-source Postgres backend'],
      ['Gt', 'Git', 'tool', 'Version control from day one'], ['Gh', 'GitHub', 'tool', 'Code hosting & collaboration', ['Every repo I push']],
      ['Vs', 'VS Code', 'tool', 'My everyday code editor'], ['Fg', 'Figma', 'tool', 'UI design & prototyping'],
      ['Pm', 'Postman', 'tool', 'Testing REST APIs before wiring the frontend'],
      ['Vc', 'Vercel', 'tool', 'Frontend deploys', ['TechnoBid', 'AI Document Translator']],
      ['Nf', 'Netlify', 'tool', 'Static site hosting', ['Tic-Tac-Toe']],
      ['Rd', 'Render', 'tool', 'Hosting ML & backend services', ['Diabetes Prediction System']],
      ['Cv', 'Canva', 'tool', 'Posters, PPTs & social creatives'], ['Xl', 'Excel', 'tool', 'Sheets, formulas & data cleanup']
    ];

    Object.keys(CATS).forEach(function (k, i) {
      var b = document.createElement('button'); b.dataset.f = k; b.textContent = CATS[k]; b.setAttribute('role', 'tab'); if (!i) b.className = 'on'; filtersEl.appendChild(b);
    });
    TECH.forEach(function (row, i) {
      var sym = row[0], name = row[1], cat = row[2];
      var t = document.createElement('button'); t.className = 'pt-tile pt-c-' + cat; t.dataset.cat = cat; t.dataset.i = i;
      t.setAttribute('aria-label', name + ' — ' + CATS[cat]);
      t.innerHTML = '<span class="pt-face"><small>' + String(i + 1).padStart(2, '0') + '</small><span style="display:block"><b>' + sym + '</b><span>' + name + '</span></span></span>';
      grid.appendChild(t);
    });
    var tiles = Array.prototype.slice.call(grid.children);

    function moveInd(btn) { if (!btn) return; ind.style.width = btn.offsetWidth + 'px'; ind.style.height = btn.offsetHeight + 'px'; ind.style.transform = 'translate(' + btn.offsetLeft + 'px,' + btn.offsetTop + 'px)'; }

    function show(i) {
      var r = TECH[i], sym = r[0], name = r[1], cat = r[2], desc = r[3], used = r[4];
      panel.innerHTML = '<div class="pt-swap"><div class="pt-big pt-c-' + cat + '">' + sym + '</div>' +
        '<h3>' + name + '</h3><span class="pt-tag">' + CATS[cat] + '</span><p>' + desc + '.</p>' +
        '<h5>USED IN</h5><ul>' + (used ? used.map(function (u) { return '<li>' + u + '</li>'; }).join('') : '<li>Part of my everyday toolkit</li>') + '</ul></div>';
    }
    function idle() { panel.innerHTML = '<div class="pt-swap"><div class="pt-big" style="background:#e6eefb">\u2316</div><h3>Pick a tile</h3><p>Hover or tap any element to see what it is and which of my projects use it.</p></div>'; }
    idle();

    grid.addEventListener('pointerover', function (e) { var t = e.target.closest('.pt-tile'); if (t) { if (window.SFX) SFX.tick(); show(+t.dataset.i); } });
    grid.addEventListener('focusin', function (e) { var t = e.target.closest('.pt-tile'); if (t) show(+t.dataset.i); });
    /* Pointer tilt. A mouse move fires dozens of events per animation frame and
       each one used to ask for a live getBoundingClientRect() — a forced layout
       per event. The hovered tile's rect is now read once per hover (refreshed
       twice a second so scrolling while hovering still tracks) and the writes
       are collapsed into one batch per frame. */
    var tileEl = null, tileR = null, tileAt = 0, tiltRaf = 0, tiltEv = null;
    grid.addEventListener('pointermove', function (e) {
      var t = e.target.closest('.pt-tile'); if (!t) return;
      tiltEv = e;
      var now = performance.now();
      if (t !== tileEl) { tileEl = t; tileR = t.getBoundingClientRect(); tileAt = now; }
      else if (now - tileAt > 400) { tileR = tileEl.getBoundingClientRect(); tileAt = now; }
      if (tiltRaf) return;
      tiltRaf = requestAnimationFrame(function () {
        tiltRaf = 0;
        var f = tileEl && tileEl.querySelector('.pt-face'); if (!f || !tileR) return;
        var x = clamp((tiltEv.clientX - tileR.left) / tileR.width), y = clamp((tiltEv.clientY - tileR.top) / tileR.height);
        f.style.setProperty('--ry', ((x - .5) * 16).toFixed(1) + 'deg');
        f.style.setProperty('--rx', ((.5 - y) * 16).toFixed(1) + 'deg');
        f.style.setProperty('--sx', Math.round(x * 100) + '%');
        f.style.setProperty('--sy', Math.round(y * 100) + '%');
      });
    }, { passive: true });
    grid.addEventListener('pointerout', function (e) { var t = e.target.closest('.pt-tile'); if (t) { var f = t.querySelector('.pt-face'); f.style.setProperty('--rx', '0deg'); f.style.setProperty('--ry', '0deg'); } });
    /* spotlight follow on the board: same treatment — one rect, one write per frame */
    var boardR = null, boardAt = 0, spotRaf = 0, spotEv = null;
    board.addEventListener('pointermove', function (e) {
      spotEv = e;
      if (spotRaf) return;
      spotRaf = requestAnimationFrame(function () {
        spotRaf = 0;
        var now = performance.now();
        if (!boardR || now - boardAt > 400) { boardR = board.getBoundingClientRect(); boardAt = now; }
        board.style.setProperty('--mx', Math.round(spotEv.clientX - boardR.left) + 'px');
        board.style.setProperty('--my', Math.round(spotEv.clientY - boardR.top) + 'px');
      });
    }, { passive: true });

    function reveal() {
      var bw = board.getBoundingClientRect().width || 900;
      board.classList.add('pre'); board.classList.remove('in'); scan.classList.remove('go');
      tiles.forEach(function (t) { t.hidden = false; t.style.removeProperty('--d'); });
      void board.offsetWidth;
      var br = board.getBoundingClientRect();
      tiles.forEach(function (t) { var r = t.getBoundingClientRect(), x = clamp((r.left + r.width / 2 - br.left) / Math.max(1, br.width)), y = clamp((r.top - br.top) / Math.max(1, br.height));
        t.style.setProperty('--d', reduce ? '0s' : (x * 1.05 + y * .12).toFixed(2) + 's'); });
      scan.style.setProperty('--bw', bw + 'px');
      requestAnimationFrame(function () { board.classList.remove('pre'); board.classList.add('in'); if (!reduce) { void scan.offsetWidth; scan.classList.add('go'); if (window.SFX) SFX.whoosh(); } });
      countTo(tiles.filter(function (t) { return !t.hidden; }).length);
    }

    var shown = 0;
    function countTo(n) {
      var from = shown, t0 = performance.now(), dur = reduce ? 1 : 600; shown = n;
      (function f(now) { var p = Math.min(1, (now - t0) / dur); cnt.textContent = Math.round(from + (n - from) * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
    }

    var busy = false;
    function applyFilter(f) {
      if (busy) return; busy = true;
      var match = function (t) { return f === 'all' || t.dataset.cat === f; };
      var first = new Map(tiles.filter(function (t) { return !t.hidden; }).map(function (t) { return [t, t.getBoundingClientRect()]; }));
      var leaving = tiles.filter(function (t) { return !t.hidden && !match(t); }), entering = tiles.filter(function (t) { return t.hidden && match(t); });
      var D = reduce ? 0 : 200;
      leaving.forEach(function (t) { t.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.6)' }], { duration: D || 1, fill: 'forwards' }); });
      setTimeout(function () {
        leaving.forEach(function (t) { t.getAnimations().forEach(function (a) { a.cancel(); }); t.hidden = true; });
        entering.forEach(function (t) { t.hidden = false; });
        tiles.forEach(function (t, i) {
          if (t.hidden) return;
          t.style.setProperty('--d', '0s');
          if (reduce) return;
          if (entering.indexOf(t) > -1) { t.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: i * 10, easing: 'cubic-bezier(.2,.9,.3,1.3)', fill: 'backwards' }); return; }
          var a = first.get(t), b = t.getBoundingClientRect(); if (!a) return;
          var dx = a.left - b.left, dy = a.top - b.top;
          if (dx || dy) t.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 620, easing: 'cubic-bezier(.2,.9,.25,1)' });
        });
        countTo(tiles.filter(function (t) { return !t.hidden; }).length); busy = false;
      }, D);
    }
    filtersEl.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || b.classList.contains('on') || busy) return;
      if (window.SFX) SFX.blip();
      filtersEl.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); moveInd(b); applyFilter(b.dataset.f); idle();
    });
    document.getElementById('pt-replay').addEventListener('click', function () {
      var all = filtersEl.querySelector('[data-f="all"]'); filtersEl.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === all); }); moveInd(all); reveal(); idle();
    });
    window.addEventListener('resize', function () { moveInd(filtersEl.querySelector('.on')); });

    moveInd(filtersEl.querySelector('.on'));
    if (document.fonts) document.fonts.ready.then(function () { moveInd(filtersEl.querySelector('.on')); });
    var started = false;
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !started) { started = true; reveal(); } }); }, { threshold: .25 }).observe(board);
  })();

  /* ======================================================================
     2 + 3. PROJECTS — cube tunnel, projects grid and the breakout game
     ====================================================================== */
  (function projects() {
    var wrap = document.getElementById('projects');
    if (!wrap) return;
    wrap.classList.add('proj-wrap');

    var track = document.getElementById('cb-track'), cube = document.getElementById('cb-cube'),
        flash = document.getElementById('cb-flash'), clone = document.getElementById('cb-clone'),
        pgrid = document.getElementById('cb-pgrid'), label = document.getElementById('cb-label');

    /* --- project data (r = repo, l = live, maj = major build) --- */
    var PROJECTS = [
      { t: 'TechnoBid', k: 'Full-Stack MERN', maj: 1, d: 'Real-time MERN auction platform — 500+ concurrent bidders on Socket.io.', g: 'React · Node · MongoDB · Socket.io', r: 'https://github.com/muskan-kushwaha01/Techno_Bid', l: 'https://techno-bid.vercel.app/' },
      { t: 'PrepIQ', k: 'Angular & .NET', maj: 1, d: 'AI interview coach on Angular + .NET with Gemini-powered feedback.', g: 'Angular · .NET · MS SQL · Gemini API', r: 'https://github.com/JRashmi-97/Final_PrepIQ' },
      { t: 'Emotion Recognition System', k: 'AI / Deep Learning', maj: 1, d: 'DistilBERT emotion classifier — 92–95% accuracy, served via Flask API.', g: 'DistilBERT · TensorFlow · Flask · NLP', r: 'https://github.com/JRashmi-97/Emotions_recognition_AI' },
      { t: 'SarvaVaidya', k: 'Hackathon · Hack Horizon', maj: 1, d: 'LSTM + spaCy engine recommending Ayurvedic, Homeopathic and Unani remedies.', g: 'LSTM · spaCy · EasyOCR · Gemini · gTTS', r: 'https://github.com/muskan-kushwaha01/SarvaVaidya' },
      { t: 'Multimodal Disaster Detection', k: 'Deep Learning Research', maj: 1, d: 'CNN + LSTM + NLP ensemble reading satellite imagery for multi-hazards.', g: 'TensorFlow · CNN · LSTM · Satellite CV' },
      { t: 'Real-Time Quiz Platform', k: 'Web & Firebase', maj: 1, d: 'Live quizzes with instant scoring, played by around 100 students at once.', g: 'ReactJS · NodeJS · Firebase · Real-time', l: 'https://aiec-iitm.in/login' },
      { t: 'AI Document Translator', k: 'Top 5 · WWT', maj: 1, d: 'Hugging Face NLP converting legal & government docs into regional languages.', g: 'Hugging Face · NLP · React · WWT Top 5', l: 'https://voksha-jxoz3x9wf-muskan-kushwahas-projects.vercel.app/' },
      { t: 'Diabetes Prediction System', k: 'ML', maj: 0, d: 'Diabetes-risk classifier on patient data — Logistic Regression + Random Forest.', g: 'Python · LR · Random Forest', r: 'https://github.com/JRashmi-97/diabetes_prediction_system', l: 'https://diabetes-prediction-ml-fkpr.onrender.com/' },
      { t: 'Watch Party', k: 'Real-time', maj: 0, d: 'Watch videos in sync with friends, in real time.', g: 'React · Socket.io', r: 'https://github.com/JRashmi-97/Watch-Party', l: 'https://watch-party-lovat.vercel.app/' },
      { t: 'Netflix Clone', k: 'Frontend', maj: 0, d: 'Pixel-close Netflix UI clone.', g: 'React · Tailwind', r: 'https://github.com/JRashmi-97/Netflix_clone' },
      { t: 'Tic-Tac-Toe', k: 'Game', maj: 0, d: 'Classic two-player game — pure JS logic.', g: 'HTML · CSS · JavaScript', r: 'https://github.com/JRashmi-97/tic-tac-toe', l: 'https://firstgame-tic.netlify.app/' }
    ];
    var C = { navy: '#003e7a', blue: '#005d9e', sky: '#8bb2cc', beige: '#decbb3', cream: '#f7f3ec', ink: '#002d5b' };
    var bar = function (x, y, w, h, f, r) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (r || 2) + '" fill="' + f + '"/>'; };
    var THUMB = [
      function () { return bar(0, 10, 32, 90, C.navy, 0) + [0, 1, 2].map(function (i) { return bar(40 + i * 38, 18, 32, 24, C.cream) + bar(40 + i * 38, 18, 32, 5, C.sky); }).join('') + bar(40, 52, 110, 8, '#fff', 4) + bar(40, 52, 74, 8, C.blue, 4) + bar(40, 68, 110, 22, C.cream, 4) + bar(46, 74, 60, 4, C.beige) + bar(46, 82, 40, 4, C.sky); },
      function () { return bar(10, 18, 64, 50, C.cream, 5) + bar(86, 18, 64, 50, C.cream, 5) + bar(10, 18, 64, 32, C.sky, 5) + bar(86, 18, 64, 32, C.beige, 5) + bar(16, 56, 34, 5, C.navy) + bar(92, 56, 34, 5, C.navy) + bar(10, 76, 64, 14, C.blue, 7) + bar(86, 76, 64, 14, C.navy, 7); },
      function () { return Array.from({ length: 24 }, function (_, i) { var h = 8 + Math.abs(Math.sin(i * .9) * 34) + (i % 5) * 2; return bar(12 + i * 6, 56 - h / 2, 4, h, i > 14 ? C.blue : C.navy, 2); }).join('') + bar(14, 80, 34, 9, C.cream, 5) + bar(54, 80, 34, 9, C.sky, 5) + bar(94, 80, 34, 9, C.beige, 5); },
      function () { return [44, 32, 20, 9].map(function (r) { return '<circle cx="80" cy="56" r="' + r + '" fill="none" stroke="' + C.blue + '" stroke-opacity="' + (.25 + r / 80) + '" stroke-width="1.5"/>'; }).join('') + '<path d="M80 56L122 28" stroke="' + C.navy + '" stroke-width="1.6"/>' + [[52, 40], [104, 74], [112, 44], [62, 76]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.4" fill="' + C.navy + '"/>'; }).join('') + bar(10, 12, 40, 6, C.navy, 3); },
      function () { return bar(14, 14, 132, 34, C.cream, 6) + bar(22, 24, 84, 5, C.navy) + bar(22, 34, 50, 4, C.sky) + [0, 1, 2, 3].map(function (i) { return bar(14 + (i % 2) * 68, 56 + Math.floor(i / 2) * 20, 64, 15, i === 1 ? C.blue : C.cream, 7); }).join('') + bar(24, 62, 34, 4, C.navy); },
      function () { return bar(8, 10, 100, 80, C.cream, 6) + [[30, 34], [62, 52], [84, 28], [48, 70], [92, 66]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" fill="' + C.blue + '"/>'; }).join('') + '<path d="M30 34L62 52L84 28M62 52L92 66M48 70L62 52" stroke="' + C.navy + '" stroke-opacity=".5" stroke-width="1.2" fill="none"/>' + [0, 1, 2, 3].map(function (i) { return bar(116, 14 + i * 20, 36, 14, i === 1 ? C.blue : C.cream, 5); }).join(''); },
      function () { return bar(12, 16, 60, 68, C.cream, 6) + bar(20, 26, 44, 6, C.sky) + bar(20, 38, 44, 4, C.beige) + bar(20, 48, 30, 4, C.navy) + bar(84, 16, 60, 68, C.blue, 6) + bar(92, 26, 44, 6, C.cream) + bar(92, 38, 44, 4, C.cream) + bar(92, 48, 30, 4, C.sky); }
    ];

    function cardHTML(p, i, grp, j) {
      var links = '';
      if (p.r) links += '<a href="' + p.r + '" target="_blank" rel="noopener"><i class="fa-solid fa-code"></i> Code</a>';
      if (p.l) links += '<a href="' + p.l + '" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Live</a>';
      var chips = p.g.split('·').map(function (t) { return '<span>' + t.trim() + '</span>'; }).join('');
      var badge = p.l ? '<span class="cb-live"><i></i>LIVE</span>' : (p.r ? '<span class="cb-stat">REPO</span>' : '<span class="cb-stat">IN BUILD</span>');
      var v = grp === 'maj' && (j === 1 || j === 3 || j === 5) ? ' cbv-blue' : '';
      if (grp === 'maj' && j === 0) v = ' cbv-navy cb-feature';
      var thumb = '<div class="cb-thumb"><svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice"><rect width="160" height="100" fill="#dfe9fb"/><rect width="160" height="9" fill="' + C.cream + '"/><circle cx="6" cy="4.5" r="1.5" fill="' + C.blue + '"/><circle cx="11" cy="4.5" r="1.5" fill="' + C.sky + '"/><circle cx="16" cy="4.5" r="1.5" fill="' + C.beige + '"/>' + THUMB[i % THUMB.length]() + '</svg><span class="cb-num">' + (i < 9 ? '0' : '') + (i + 1) + '</span>' + badge + '</div>';
      return '<div class="cb-card' + v + '" style="--i:' + (j % 6) + '">' + thumb + '<span class="cb-pill">' + p.k + '</span><h4>' + p.t + '</h4><p>' + p.d + '</p><div class="cb-tags">' + chips + '</div>' + (links ? '<div class="cb-links">' + links + '</div>' : '') + '</div>';
    }
    function sectionHTML() {
      if (window.CPShowcase) return window.CPShowcase.html(PROJECTS);
      var g = 0;
      var gridFor = function (list, grp, cls) { return '<div class="cb-grid ' + cls + '">' + list.map(function (p, j) { return cardHTML(p, g++, grp, j); }).join('') + '</div>'; };
      var maj = PROJECTS.filter(function (p) { return p.maj; });
      var min = PROJECTS.filter(function (p) { return !p.maj; });
      return '<div class="cb-pin"><div class="cb-eyebrow">SELECTED WORK</div><h2 class="cb-h2">The <em>build</em> log</h2>' +
        '<p class="cb-sub">Major platforms. Minor experiments. Everything shipped.</p>' +
        '<div class="cb-ghead"><span>01</span> Major Projects <em class="cb-gcount">' + maj.length + ' flagship builds</em></div>' + gridFor(maj, 'maj', 'cb-bento') +
        '<div class="cb-ghead"><span>02</span> Minor Projects <em class="cb-gcount">' + min.length + ' experiments</em></div>' + gridFor(min, 'min', 'cb-minor') + '</div>';
    }
    var bodyEl = document.getElementById('cb-projects');
    var htmlStr = sectionHTML();
    if (bodyEl) bodyEl.innerHTML = htmlStr;
    if (bodyEl && window.CPShowcase) window.CPShowcase.init(bodyEl, PROJECTS);
    /* staggered rise — armed only once the tunnel has fully opened, so row 1
       can't play its reveal while still hidden behind the cube */
    var cbArmed = false;
    var cbCards = bodyEl ? Array.prototype.slice.call(bodyEl.querySelectorAll('.cb-card')) : [];
    var armReveal = function () {
      if (cbArmed || !bodyEl) return; cbArmed = true;
      bodyEl.classList.add('cb-armed');
      if ('IntersectionObserver' in window) {
        var cio = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('reveal-in'); cio.unobserve(e.target); } });
        }, { threshold: .16 });
        cbCards.forEach(function (c) { cio.observe(c); });
      } else { cbCards.forEach(function (c) { c.classList.add('reveal-in'); }); }
    };
    /* ── Minor projects: stacked case-card deck (inspo 4) ── */
    function initMinorStack() {
      var st = bodyEl && bodyEl.querySelector('.cb-minor');
      if (!st) return;
      var cards = Array.prototype.slice.call(st.querySelectorAll('.cb-card')), n = cards.length, idx = 0;
      var hovered = false, onScreen = false;
      var ctl = document.createElement('div');
      ctl.className = 'cb-stack-ctl';
      ctl.innerHTML = '<span class="cb-stack-count"></span>';
      var dots = document.createElement('div'); dots.className = 'cb-stack-dots';
      cards.forEach(function (_, k) {
        var d = document.createElement('button');
        d.type = 'button'; d.setAttribute('aria-label', 'Show project ' + (k + 1));
        d.addEventListener('click', function () { idx = k; layout(); if (window.SFX) SFX.tick(); });
        dots.appendChild(d);
      });
      ctl.appendChild(dots);
      var prev = document.createElement('button'); prev.type = 'button'; prev.className = 'cb-stack-prev'; prev.setAttribute('aria-label', 'Previous project'); prev.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
      var next = document.createElement('button'); next.type = 'button'; next.className = 'cb-stack-next'; next.setAttribute('aria-label', 'Next project'); next.innerHTML = '<i class="fa-solid fa-arrow-right"></i>';
      ctl.appendChild(prev); ctl.appendChild(next);
      st.appendChild(ctl);
      var cnt = ctl.querySelector('.cb-stack-count');
      function layout() {
        cards.forEach(function (c, k) {
          var o = (k - idx + n) % n;
          c.classList.toggle('front', o === 0);
          c.style.zIndex = String(n - o);
          c.style.transform = 'translateX(-50%) translateY(' + (-o * 26) + 'px) scale(' + (1 - Math.min(o, 3) * .05) + ')';
          c.style.opacity = o <= 2 ? String(1 - o * .1) : '0';
          c.style.pointerEvents = o === 0 ? 'auto' : 'none';
        });
        Array.prototype.forEach.call(dots.children, function (d, k) { d.classList.toggle('on', k === idx); });
        cnt.textContent = ('0' + (idx + 1)).slice(-2) + ' / ' + ('0' + n).slice(-2);
      }
      function go(d) { idx = (idx + d + n) % n; layout(); if (window.SFX) SFX.tick(); }
      next.addEventListener('click', function () { go(1); });
      prev.addEventListener('click', function () { go(-1); });
      /* click anywhere on the front card (except its own links/buttons) to advance */
      st.addEventListener('click', function (e) { if (!e.target.closest('a, button')) go(1); });
      st.addEventListener('pointerenter', function () { hovered = true; });
      st.addEventListener('pointerleave', function () { hovered = false; });
      if ('ontouchstart' in window) {
        st.addEventListener('touchstart', function () { hovered = true; }, { passive: true });
        st.addEventListener('touchend', function () { setTimeout(function () { hovered = false; }, 4000); }, { passive: true });
      }
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { onScreen = e.isIntersecting; }); }, { threshold: .25 }).observe(st);
      else onScreen = true;
      layout();
      /* one honest interval: rotates only when the deck is on screen, untouched and the tab is visible */
      setInterval(function () { if (onScreen && !hovered && !document.hidden) go(1); }, 5500);
    }
    if (bodyEl) {
      /* pointer tilt — bento cards only (the minor deck owns its own transform).
         rAF-throttled: one layout read + four writes per frame, max */
      bodyEl.querySelectorAll('.cb-bento .cb-card').forEach(function (card) {
        var raf = 0, ev = null;
        card.addEventListener('pointermove', function (e) {
          ev = e;
          if (raf) return;
          raf = requestAnimationFrame(function () {
            raf = 0;
            var r = card.getBoundingClientRect();
            var x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
            card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
            card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
            card.style.setProperty('--ry', ((x - .5) * 8).toFixed(2) + 'deg');
            card.style.setProperty('--rx', ((.5 - y) * 6).toFixed(2) + 'deg');
          });
        }, { passive: true });
        card.addEventListener('pointerleave', function () {
          card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
        });
      });
      initMinorStack();
    }
    var cloneBody = document.getElementById('cb-clone-body');
    if (cloneBody) cloneBody.innerHTML = '<div class="cb-projects" aria-hidden="true">' + htmlStr + '</div>';

    /* --- warp canvas --- */
    var cv = document.getElementById('warp'), cx = cv && cv.getContext('2d');
    var W = 0, H = 0, dpr = 1, Lpx = 240;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2); W = window.innerWidth; H = window.innerHeight;
      if (cv) { cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
      Lpx = Math.round(Math.min(W, H) * .3); if (cube) cube.style.setProperty('--L', Lpx + 'px');
    }
    var sd = 3; var R = function () { sd = (sd + 0x6D2B79F5) | 0; var t = Math.imul(sd ^ sd >>> 15, 1 | sd); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    var PAL = ['#f6efe0', '#e9d9b8', '#bcd3ff', '#5b8def', '#ffffff', '#005d9e'];
    var warpBlank = true;
    var S = Array.from({ length: 260 }, function () { return { a: R() * 6.283, r: .04 + Math.sqrt(R()) * 1.1, z: R(), c: Math.floor(R() * PAL.length), w: .5 + R() * 1.2 }; });
    var FRAME_COLORS = ['#e9d9b8', '#5b8def', '#f6efe0', '#005d9e'];
    if (!CanvasRenderingContext2D.prototype.roundRect) { CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h) { this.rect(x, y, w, h); }; }
    function warp(p, t, alpha, sPage) {
      if (!cx) return;
      /* once the streaks have faded there is nothing left to draw — clear once
         and leave the canvas alone instead of wiping a full viewport every frame */
      if (alpha <= .01) { if (!warpBlank) { cx.clearRect(0, 0, W, H); warpBlank = true; } return; }
      warpBlank = false;
      cx.clearRect(0, 0, W, H);
      var mx = W / 2, my = H / 2, k = Math.min(W, H) * .09, travel = (p - .33) * 16 + t * .02;
      cx.globalAlpha = alpha; cx.lineCap = 'round';
      for (var i = 0; i < S.length; i++) {
        var s = S[i]; var z = ((s.z - travel) % 1 + 1) % 1; z = z * .98 + .02;
        var len = .07, x = Math.cos(s.a) * s.r, y = Math.sin(s.a) * s.r;
        var x1 = mx + x * k / (z + len), y1 = my + y * k / (z + len), x2 = mx + x * k / z, y2 = my + y * k / z;
        if (Math.abs(x2 - mx) > W * 1.4 && Math.abs(x1 - mx) > W * 1.4) continue;
        cx.globalAlpha = alpha * Math.pow(1 - z, 1.1) * .95; cx.strokeStyle = PAL[s.c]; cx.lineWidth = .5 + s.w * (1 - z) * 2;
        cx.beginPath(); cx.moveTo(x1, y1); cx.lineTo(x2, y2); cx.stroke();
      }
      cx.shadowBlur = 14;
      for (var j = 1; j <= 9; j++) {
        var sc = sPage * Math.pow(1.42, j); if (sc > 3.6) continue;
        var col = FRAME_COLORS[j % 4], w = W * sc * .92, h = H * sc * .92;
        cx.globalAlpha = alpha * clamp(1 - (sc - 1.4) / 2.2) * .9; cx.strokeStyle = col; cx.shadowColor = col; cx.lineWidth = 1.2 + Math.min(3, sc * 1.4);
        cx.strokeRect(mx - w / 2, my - h / 2, w, h);
      }
      cx.shadowBlur = 0; cx.globalAlpha = 1;
    }

    function smooth(t) { t = clamp(t); return t * t * (3 - 2 * t); }
    function inout(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

    /* --- layout-free progress ------------------------------------------------
       The tunnel used to ask the browser for a live getBoundingClientRect() of a
       560vh track on every single frame, which forces a full layout before the
       frame can be painted. The track's geometry does not change while you
       scroll, so it is measured once, re-checked twice a second and on resize;
       the scroll offset comes from a passive listener that never touches layout. */
    var scrollY = window.pageYOffset || 0;
    window.addEventListener('scroll', function () {
      scrollY = window.pageYOffset || 0;
      if (projNear && !reduce && !tRun) {
        tRun = true;
        tRaf = requestAnimationFrame(tloop);
      }
    }, { passive: true });
    var geo = { top: 0, span: 1, at: -1e9 };
    function measure() {
      var r = track.getBoundingClientRect();
      geo.top = r.top + (window.pageYOffset || 0);
      geo.span = Math.max(1, r.height - window.innerHeight);
      geo.at = performance.now();
    }
    function progress() { return clamp((scrollY - geo.top) / geo.span); }

    /* --- write only what actually changed -----------------------------------
       Re-assigning an unchanged style string still invalidates the element, and
       the page copy's box-shadow / border-radius repaint its entire 3D surface
       whenever they move. Every value is rounded to a step the eye cannot
       follow and compared with the last frame before being written. */
    var wr = {};
    function put(slot, key, val, target, prop) {
      if (slot[key] === val) return;
      slot[key] = val;
      target.style[prop] = val;
    }

    var lastP = 0;
    var stageEl = document.getElementById('cb-stage');
    var lastWarp = -100;
    function render(t, now) {
      var p = progress(), L = Lpx;
      if (p > .345 && lastP <= .345 && window.SFX) SFX.boom(); // passing through the cube face
      lastP = p;
      if (!cbArmed && p > .88) armReveal(); // the page screen has finished unrolling
      var u = clamp(p / .34), tz = -L * .35 + (1060 + L * .35) * Math.pow(u, 2.3);
      if (cube) {
        put(wr, 'cube', 'translateZ(' + Math.round(tz) + 'px) rotateX(' + (-22 + 26 * u).toFixed(1) + 'deg) rotateY(' +
          (28 + t * 7 * (1 - u) + 210 * u).toFixed(1) + 'deg)', cube, 'transform');
        put(wr, 'cubeOp', (1 - smooth((p - .325) / .04)).toFixed(2), cube, 'opacity');
      }
      if (label) {
        put(wr, 'labOp', (1 - smooth(p / .1)).toFixed(2), label, 'opacity');
        put(wr, 'labT', 'translateY(' + Math.round(-p * 80) + 'px)', label, 'transform');
      }
      if (flash) put(wr, 'flash', Math.exp(-Math.pow((p - .345) / .03, 2)).toFixed(2), flash, 'opacity');
      var q = clamp((p - .36) / .52), sPage = .05 * Math.pow(20, inout(q));
      var done = q >= .999;
      if (clone) {
        if (done) {
          if (clone.style.display !== 'none') clone.style.display = 'none';
        } else {
          if (clone.style.display !== '') clone.style.display = '';
          put(wr, 'clOp', smooth(q / .2).toFixed(2), clone, 'opacity');
          put(wr, 'clT', 'perspective(1400px) rotateX(' + ((1 - q) * 16).toFixed(1) + 'deg) rotateY(' +
            ((1 - q) * -10).toFixed(1) + 'deg) scale(' + sPage.toFixed(4) + ')', clone, 'transform');
          put(wr, 'rad', Math.round(26 * (1 - q) / 2) * 2 + 'px', clone, 'borderRadius');
          put(wr, 'glow', '0 0 ' + Math.round(50 * (1 - q) / 8) * 8 + 'px rgba(143,184,255,' + (Math.round(.7 * (1 - q) * 10) / 10) + ')', clone, 'boxShadow');
        }
      }
      if (pgrid) put(wr, 'pg', (1 - smooth((q - .45) / .4)).toFixed(2), pgrid, 'opacity');
      /* once the tunnel's page copy lines up with the real page (p = 1) hide it, so the real (interactive) content underneath is what you see and use */
      if (stageEl) put(wr, 'vis', p >= .9995 ? 'hidden' : '', stageEl, 'visibility');
      /* the streak field is decoration: half rate is indistinguishable and frees
         every other frame for the scroll itself */
      if (p < .93 && now - lastWarp >= 32) { lastWarp = now; var a = smooth((p - .33) / .05) * (1 - smooth((p - .8) / .12)); warp(p, t, a, Math.max(sPage, .05)); }
    }
    var t0 = performance.now();
    var rzf = 0;
    window.addEventListener('resize', function () { if (!rzf) rzf = requestAnimationFrame(function () { rzf = 0; size(); measure(); }); });
    size(); measure();
    /* perf: the tunnel renderer only runs while the section is on (or nearly on) screen;
       a safety observer still arms the card reveal if the renderer was paused */
    var projNear = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { projNear = e.isIntersecting; if (projNear) wake(); else park(); }); }, { rootMargin: '30% 0px' }).observe(wrap);
      if (bodyEl) new IntersectionObserver(function (es, ob) { es.forEach(function (e) { if (e.isIntersecting) { armReveal(); ob.disconnect(); } }); }, { threshold: 0 }).observe(bodyEl);
    }
    /* The frame clock itself is now switched off, not just skipped: the old loop
       kept calling requestAnimationFrame forever, so the browser still woke the
       page 60 times a second on sections nobody was looking at. */
    var tRun = false, tRaf = 0;
    function wake() { if (reduce || tRun || !projNear || document.hidden) return; measure(); tRun = true; tRaf = requestAnimationFrame(tloop); }
    function park() { tRun = false; if (tRaf) { cancelAnimationFrame(tRaf); tRaf = 0; } }
    function tloop(now) {
      tRaf = 0;
      if (!tRun) return;
      if (!projNear || document.hidden) { tRun = false; return; }
      render((now - t0) / 1000, now);
      var p = progress();
      // When cube is passed and idle, pause loop until the next scroll
      if (p >= 0.35) {
        tRun = false;
        return;
      }
      tRaf = requestAnimationFrame(tloop);
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) park(); else wake(); });
    window.addEventListener('load', measure);   // late-loading images above can move the track
    if (window.PERF) PERF.onChange(function (el, isNear) { if (el === wrap && isNear) wake(); });
    if (!reduce) { wake(); if (!projNear) render(0, performance.now()); } else { render(0, performance.now()); armReveal(); }

    /* --- exempt the whole projects region from the snap deck --- */
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { document.documentElement.classList.toggle('proj-open', e.isIntersecting); });
    }, { threshold: 0 }).observe(wrap);

    /* ================= PIXEL BREAKOUT ================= */
    var gcv = document.getElementById('bk-canvas');
    if (!gcv) return;
    var gx = gcv.getContext('2d');
    var FONT = {
      H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'], E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
      L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'], O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
      W: ['10001', '10001', '10001', '10001', '10101', '11011', '10001'], R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
      D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'], S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
      A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'], P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
      B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'], I: ['11111', '01010', '01010', '01010', '01010', '01010', '11111'],
      C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'], K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
      G: ['01110', '10001', '10000', '10111', '10001', '10001', '01110'], M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
      T: ['11111', '01010', '01010', '01010', '01010', '01010', '01010'], U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
      N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'], F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000']
    };
    var COLS = 36;
    var WORDS = ['RASHMI', 'BUILDS'];
    var gW = 0, gH = 0, gdpr = 1, P = 8, Ssz = 6.7, OX = 0, OY = 0, dots = [], grid = new Map();
    var ball = { x: 0, y: 0, vx: 0, vy: 0, r: 4, stuck: true, since: 0 }, pad = { x: 0, w: 90, h: 7, y: 0, tx: 0 };
    var lastInput = 0, visible = true, rebuildAt = 0, gRect = null, gRectAt = 0, gRaf2 = 0, gEv = null;
    function build(t) {
      dots = []; grid.clear();
      WORDS.forEach(function (w, li) { [...w].forEach(function (ch, i) { (FONT[ch] || FONT.H).forEach(function (row, r) { [...row].forEach(function (v, c) {
        if (v === '1') { var d = { c: i * 6 + c, r: li * 10 + r, dead: 0, born: t + (li * 10 + r) * 18 + (i * 6 + c) * 5 }; dots.push(d); grid.set(d.r * COLS + d.c, d); }
      }); }); }); });
    }
    function gsize() {
      var b = gcv.getBoundingClientRect(); gdpr = Math.min(window.devicePixelRatio || 1, 2); gW = b.width; gH = b.height;
      gcv.width = gW * gdpr; gcv.height = gH * gdpr; gx.setTransform(gdpr, 0, 0, gdpr, 0, 0);
      P = Math.max(4.5, Math.min(gW * .44 / COLS, (gH * .52) / 17, 24)); Ssz = P * .84;
      OX = (gW - COLS * P) / 2; OY = Math.max(gH * .2, 120);
      gRect = null; // the canvas just moved or resized; its cached rect is stale
      ball.r = Math.max(3.5, P * .5); pad.w = Math.max(70, gW * .18); pad.h = Math.max(6, P * .9); pad.y = gH * .74;
      if (!pad.x) pad.x = pad.tx = gW / 2;
      if (ball.stuck) stick();
    }
    function stick() { ball.x = pad.x; ball.y = pad.y - pad.h / 2 - ball.r - 1; }
    function launch() { var a = (Math.random() * 50 - 25) * Math.PI / 180, sp = P * 42; ball.vx = Math.sin(a) * sp; ball.vy = -Math.cos(a) * sp; ball.stuck = false; }
    function hitDots() {
      var r = ball.r, c0 = Math.floor((ball.x - r - OX) / P), c1 = Math.floor((ball.x + r - OX) / P), r0 = Math.floor((ball.y - r - OY) / P), r1 = Math.floor((ball.y + r - OY) / P);
      for (var rr = r0; rr <= r1; rr++) for (var cc = c0; cc <= c1; cc++) {
        var d = grid.get(rr * COLS + cc); if (!d || d.dead) continue;
        var rx = OX + cc * P + (P - Ssz) / 2, ry = OY + rr * P + (P - Ssz) / 2, nx = Math.max(rx, Math.min(ball.x, rx + Ssz)), ny = Math.max(ry, Math.min(ball.y, ry + Ssz));
        var dx = ball.x - nx, dy = ball.y - ny;
        if (dx * dx + dy * dy <= r * r) {
          var ox = Math.abs(ball.x - (rx + Ssz / 2)), oy = Math.abs(ball.y - (ry + Ssz / 2));
          if (ox / (Ssz / 2 + r) > oy / (Ssz / 2 + r)) { ball.vx = Math.abs(ball.vx) * (ball.x < rx + Ssz / 2 ? -1 : 1); } else { ball.vy = Math.abs(ball.vy) * (ball.y < ry + Ssz / 2 ? -1 : 1); }
          d.dead = performance.now(); if (window.SFX) SFX.brick(rr % 7); return;
        }
      }
    }
    function step(dt, now) {
      if (now - lastInput > 2200) pad.tx = ball.stuck ? gW / 2 : ball.x + Math.sin(now / 650) * pad.w * .28;
      pad.x += (pad.tx - pad.x) * Math.min(1, dt * 14); pad.x = Math.max(pad.w / 2, Math.min(gW - pad.w / 2, pad.x));
      if (ball.stuck) { stick(); if (now - ball.since > 700) launch(); return; }
      var dist = Math.hypot(ball.vx, ball.vy) * dt, n = Math.max(1, Math.ceil(dist / (ball.r * .7))), h = dt / n;
      for (var i = 0; i < n; i++) {
        ball.x += ball.vx * h; ball.y += ball.vy * h;
        if (ball.x < ball.r) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); }
        if (ball.x > gW - ball.r) { ball.x = gW - ball.r; ball.vx = -Math.abs(ball.vx); }
        if (ball.y < ball.r + 8) { ball.y = ball.r + 8; ball.vy = Math.abs(ball.vy); }
        if (ball.vy > 0 && ball.y + ball.r >= pad.y - pad.h / 2 && ball.y - ball.r <= pad.y + pad.h / 2 && Math.abs(ball.x - pad.x) <= pad.w / 2 + ball.r) {
          var rel = Math.max(-1, Math.min(1, (ball.x - pad.x) / (pad.w / 2))), a = rel * 58 * Math.PI / 180, sp = Math.hypot(ball.vx, ball.vy);
          ball.vx = Math.sin(a) * sp; ball.vy = -Math.cos(a) * sp; ball.y = pad.y - pad.h / 2 - ball.r;
          if (window.SFX) SFX.pop();
        }
        hitDots();
        if (ball.y > gH + ball.r * 3) { ball.stuck = true; ball.since = now; if (window.SFX) SFX.thud(); break; }
      }
    }
    function gdraw(now) {
      gx.clearRect(0, 0, gW, gH);
      var alive = 0;
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i], a = Math.min(1, Math.max(0, (now - d.born) / 220)), col = '236,231,220';
        if (d.dead) { var tt = (now - d.dead) / 380; if (tt >= 1) continue; a *= 1 - tt; col = (236 - tt * 190 | 0) + ',' + (231 - tt * 185 | 0) + ',' + (220 - tt * 178 | 0); } else alive++;
        if (a <= 0) continue;
        var x = OX + d.c * P + (P - Ssz) / 2, y = OY + d.r * P + (P - Ssz) / 2, sc = .6 + .4 * Math.min(1, Math.max(0, (now - d.born) / 220));
        gx.fillStyle = 'rgba(' + col + ',' + a + ')'; gx.beginPath(); gx.roundRect(x + (Ssz - Ssz * sc) / 2, y + (Ssz - Ssz * sc) / 2, Ssz * sc, Ssz * sc, Math.max(1, Ssz * .14)); gx.fill();
      }
      gx.fillStyle = '#ece7dc'; gx.beginPath(); gx.roundRect(pad.x - pad.w / 2, pad.y - pad.h / 2, pad.w, pad.h, pad.h / 2); gx.fill();
      gx.fillStyle = '#f2f2f4'; gx.shadowColor = 'rgba(255,255,255,.35)'; gx.shadowBlur = 10; gx.beginPath(); gx.arc(ball.x, ball.y, ball.r, 0, 7); gx.fill(); gx.shadowBlur = 0;
      if (alive === 0 && !rebuildAt) rebuildAt = now + 1100;
      if (rebuildAt && now > rebuildAt) { rebuildAt = 0; build(now); if (window.SFX) SFX.chime(); }
    }
    var last = performance.now();
    /* The breakout game used to keep requestAnimationFrame alive for the whole
       visit, drawing nothing while off screen but still waking the page 60
       times a second. The loop now switches itself off when the board leaves
       view (or the tab is hidden) and picks up where it left off. */
    var gRun = false, gRaf = 0;
    function gloop(now) {
      gRaf = 0;
      if (!gRun) return;
      if (!visible || document.hidden) { gRun = false; return; }
      var dt = Math.min((now - last) / 1000, .04); last = now;
      step(dt, now); gdraw(now);
      gRaf = requestAnimationFrame(gloop);
    }
    function gwake() { if (gRun || !visible || document.hidden) return; gRun = true; last = performance.now(); gRaf = requestAnimationFrame(gloop); }
    function gpark() { gRun = false; if (gRaf) { cancelAnimationFrame(gRaf); gRaf = 0; } }
    function move(e) {
      gEv = e;
      if (gRaf2) return;
      gRaf2 = requestAnimationFrame(function () {
        gRaf2 = 0;
        var now = performance.now();
        if (!gRect || now - gRectAt > 400) { gRect = gcv.getBoundingClientRect(); gRectAt = now; }
        pad.tx = gEv.clientX - gRect.left; lastInput = now;
      });
    }
    gcv.addEventListener('pointermove', move, { passive: true }); gcv.addEventListener('pointerdown', move);
    window.addEventListener('keydown', function (e) { if (!visible) return; var k = e.key; if (k === 'ArrowLeft' || k === 'ArrowRight') { pad.tx += (k === 'ArrowLeft' ? -1 : 1) * pad.w * .5; lastInput = performance.now(); e.preventDefault(); } });
    var rb = document.getElementById('bk-reset'); if (rb) rb.addEventListener('click', function () { build(performance.now()); rebuildAt = 0; });
    new IntersectionObserver(function (es) { es.forEach(function (e) { visible = e.isIntersecting; if (visible) gwake(); else gpark(); }); }, { threshold: 0 }).observe(gcv);
    document.addEventListener('visibilitychange', function () { if (document.hidden) gpark(); else gwake(); });
    if (window.ResizeObserver) new ResizeObserver(gsize).observe(gcv); else window.addEventListener('resize', gsize);
    build(performance.now()); gsize();
  })();

  /* ======================================================================
     4. ABOUT — interactive Sleepy Lamp
     ====================================================================== */
  (function lamp() {
    var lampEl = document.getElementById('sleepy-lamp');
    if (!lampEl) return;
    var head = document.getElementById('sl-head'), cord = document.getElementById('sl-cord');
    var about = document.getElementById('about');
    /* starts DARK — the visitor gets the wow of switching Rashmi on */
    var on = false;
    lampEl.classList.add('off'); lampEl.setAttribute('aria-pressed', 'false');
    function retrigger(el, cls, others) { if (!el) return; (others || []).forEach(function (c) { el.classList.remove(c); }); el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls); }
    function toggle() {
      on = !on; lampEl.classList.toggle('off', !on); lampEl.setAttribute('aria-pressed', String(on)); if (about) about.classList.toggle('lamp-lit', on);
      retrigger(head, on ? 'sl-pop' : 'sl-tilt', ['sl-pop', 'sl-tilt']);
      retrigger(cord, 'sl-tug');
      if (window.SFX) SFX.lampClack(on);
    }
    lampEl.addEventListener('click', toggle);
    lampEl.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  })();

  /* ======================================================================
     5. EXPERIENCE — growing timeline
     ====================================================================== */
  (function experience() {
    var scene = document.getElementById('exp-scene');
    var section = document.getElementById('experience');
    if (!scene || !section) return;

    /* ---- "Growing Flower" scene, ported verbatim from the provided file ---- */
    const f = n => +n.toFixed(1), B = [219, 384], CX = 219;
    let seed = 5; const R = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const rr = (a, b) => a + R() * (b - a);
    const defs = `<defs>
 <linearGradient id="gG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#0b3d0b" stop-opacity="0"/><stop offset=".32" stop-color="#0d7a0d"/><stop offset="1" stop-color="#27d027"/></linearGradient>
 <linearGradient id="gLf" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e24ca8"/><stop offset=".55" stop-color="#b5408f" stop-opacity=".93"/><stop offset="1" stop-color="#2f6676" stop-opacity=".85"/></linearGradient>
 <linearGradient id="gBu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d03f97"/><stop offset=".55" stop-color="#802060"/><stop offset="1" stop-color="#3d0e2e"/></linearGradient>
 <linearGradient id="gFr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#561646"/><stop offset=".5" stop-color="#b6388a"/><stop offset="1" stop-color="#f062b0"/></linearGradient>
 <linearGradient id="gSw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a2058"/><stop offset="1" stop-color="#ea5aae"/></linearGradient>
 <linearGradient id="pD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eaaccb"/><stop offset="1" stop-color="#cd73a3"/></linearGradient>
 <linearGradient id="pU" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0b8d3"/><stop offset="1" stop-color="#d27eaa"/></linearGradient>
 <linearGradient id="pL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8b6d0"/><stop offset="1" stop-color="#d07aa6"/></linearGradient>
 <linearGradient id="pR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#e8b6d0"/><stop offset="1" stop-color="#d07aa6"/></linearGradient>
 <linearGradient id="pC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6c2db"/><stop offset=".5" stop-color="#ec88b3"/><stop offset="1" stop-color="#d9549a"/></linearGradient>
 <radialGradient id="pT" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fce6f0"/><stop offset="1" stop-color="#f1b0d0"/></radialGradient>
 <linearGradient id="pY" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ece61e"/><stop offset="1" stop-color="#f2a82a"/></linearGradient>
 <radialGradient id="glow" cx=".5" cy=".42" r=".5"><stop offset="0" stop-color="#7a2a5c" stop-opacity=".42"/><stop offset="1" stop-color="#7a2a5c" stop-opacity="0"/></radialGradient>
 <radialGradient id="hl"><stop offset="0" stop-color="#f4e83a" stop-opacity=".55"/><stop offset="1" stop-color="#f4e83a" stop-opacity="0"/></radialGradient>
</defs>`;
    const almond = (L, W) => `M0 0C${f(L * .12)} ${f(-W * 1.3)} ${f(L * .72)} ${f(-W * 1.15)} ${f(L)} 0C${f(L * .72)} ${f(W * 1.15)} ${f(L * .12)} ${f(W * 1.3)} 0 0Z`;
    const leaf = (x, y, a, L, W, fill, d) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"><path class="leaf" style="--d:${f(d)}s" fill="url(#${fill})" stroke="rgba(255,175,225,.2)" stroke-width=".7" d="${almond(L, W)}"/></g>`;
    const round = (x, y, rx, ry, rot, d, flip) => { const w = rx * 2, h = ry * 2; return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${flip ? -1 : 1} 1) translate(${-rx} ${-ry})"><path class="round" style="--d:${f(d)}s" fill="url(#gBu)" stroke="rgba(255,150,205,.28)" stroke-width=".8" d="M${w} 0C${f(w * .62)} 0 0 ${f(h * .12)} 0 ${f(h * .52)}C0 ${f(h * .84)} ${f(w * .28)} ${h} ${f(w * .55)} ${h}C${f(w * .86)} ${h} ${w} ${f(h * .62)} ${w} 0Z"/></g>`; };
    const sweep = (x1, y1, cx, cy, x2, y2, w, d) => `<path class="leaf" style="--d:${f(d)}s;transform-origin:${x1}px ${y1}px;transform-box:view-box" fill="url(#gSw)" stroke="rgba(255,175,225,.32)" stroke-width=".6" d="M${x1} ${y1}Q${cx} ${f(cy - w)} ${x2} ${y2}Q${f(cx + w * .4)} ${f(cy + w * .7)} ${x1} ${y1}Z"/>`;
    const blade = (bx, by, tx, ty, w, bend, d, sdur) => { w *= .8; const h = Math.hypot(tx - bx, by - ty), a = Math.atan2(tx - bx, by - ty) * 180 / Math.PI; return `<g transform="translate(${f(bx)} ${f(by)}) rotate(${f(a)})"><g class="sw" style="--sd:${f(sdur)}s;--sl:${f(-rr(0, 4))}s"><path class="gb" style="--d:${f(d)}s" fill="url(#gG)" d="M${f(-w / 2)} 0Q${f(bend * .6 - w * .8)} ${f(-h * .5)} ${f(bend)} ${f(-h)}Q${f(bend * .6 + w * .8)} ${f(-h * .5)} ${f(w / 2)} 0Z"/></g></g>`; };
    const tuft = (bx, by, H, angles, d0) => { let s = ''; const n = angles.length; angles.forEach((a, i) => { const k = 1 - Math.abs(i - (n - 1) / 2) * .15, h = H * k * (.92 + ((i * 37) % 7) / 45), r = a * Math.PI / 180, x0 = bx + (i - (n - 1) / 2) * 3.6; s += blade(x0, by, x0 + Math.sin(r) * h, by - Math.cos(r) * h, 5.8, a * .32, d0 + i * .09, 3 + i * .35); }); return s; };
    const SPLIT_DOME = false;
    const dome = SPLIT_DOME
      ? `<g class="pul"><ellipse cx="-8" cy="-22" rx="12.5" ry="16.5" transform="rotate(-11 -8 -22)" fill="url(#pU)"/></g><g class="pur"><ellipse cx="8" cy="-22" rx="12.5" ry="16.5" transform="rotate(11 8 -22)" fill="url(#pD)"/></g>`
      : `<path d="M-17 -3C-17.5 -24 -9.5 -34.5 0 -34.5S17.5 -24 17 -3Z" fill="url(#pD)"/>`;
    const flower = (F, rot, sc, d, dur) => `<g class="fl" style="--bx:${B[0]}px;--by:${B[1]}px;--tx:${F[0]}px;--ty:${F[1]}px;--d:${d}s;--dur:${dur}s"><g transform="rotate(${rot}) scale(${sc})"><g class="bloom">
 <g class="pl"><ellipse cx="-31" cy="-13.5" rx="19.5" ry="9.6" transform="rotate(32 -31 -13.5)" fill="url(#pL)"/></g>
 <g class="pr"><ellipse cx="31" cy="-13.5" rx="19.5" ry="9.6" transform="rotate(-32 31 -13.5)" fill="url(#pR)"/></g>
 ${dome}
 <circle cx="6" cy="-30" r="2" fill="#ea5aa2" opacity=".7"/><circle cx="-7" cy="-28" r="1.6" fill="#ea5aa2" opacity=".5"/><circle cx="-16.5" cy="-12.5" r="1.6" fill="#f4b21e"/><circle cx="16.5" cy="-12" r="1.6" fill="#f4b21e"/>
 <ellipse cx="0" cy="0" rx="19.7" ry="8.2" fill="url(#pC)"/><ellipse cx="0" cy="-2.6" rx="17.8" ry="5.4" fill="url(#pT)"/><ellipse cx="0" cy="-3.2" rx="11.8" ry="2.6" fill="url(#pY)"/></g></g></g>`;
    let o = defs + `<ellipse cx="225" cy="180" rx="235" ry="260" fill="url(#glow)"/>`;
    for (let i = 0; i < 60; i++)o += `<circle cx="${f(rr(-60, 520))}" cy="${f(rr(4, 230))}" r="${f(rr(.4, .9))}" fill="#b9a6b2" opacity="${f(rr(.18, .45))}"/>`;
    o += sweep(211, 262, 155, 185, 134, 148, 2.6, 2.0) + sweep(142, 292, 108, 250, 92, 222, 2.2, 2.1);
    o += tuft(34, 430, 205, [-24, -14, -4, 6, 15, 25], 1.7) + tuft(112, 446, 135, [-20, -8, 5, 16], 2.3)
      + tuft(426, 430, 190, [-26, -15, -5, 5, 15, 24], 1.9) + tuft(342, 446, 125, [-16, -5, 8, 20], 2.4)
      + tuft(-45, 440, 150, [-18, -6, 6, 18], 2.6) + tuft(505, 440, 150, [-18, -6, 6, 18], 2.7);
    const FL = [[218, 118], [145, 197], [290, 170]], ST = [[0, 2.0], [.6, 1.9], [.2, 2.0]];
    FL.forEach((F, i) => { const [d, dur] = ST[i]; o += `<defs><linearGradient id="sg${i}" gradientUnits="userSpaceOnUse" x1="${B[0]}" y1="${B[1]}" x2="${F[0]}" y2="${F[1]}"><stop offset="0" stop-color="#8b2a5b"/><stop offset="1" stop-color="#e2409a"/></linearGradient></defs>` + `<path class="stem" pathLength="1" style="--d:${d}s;--dur:${dur}s" d="M${B[0]} ${B[1]}L${F[0]} ${F[1]}" stroke="url(#sg${i})" stroke-width="7" stroke-linecap="round" fill="none"/>`; });
    FL.forEach((F, i) => { const [d, dur] = ST[i], n = i ? 5 : 6, ang = Math.atan2(F[1] - B[1], F[0] - B[0]) * 180 / Math.PI; for (let k = 0; k < n; k++) { const fr = .32 + .52 * k / (n - 1), px = B[0] + (F[0] - B[0]) * fr, py = B[1] + (F[1] - B[1]) * fr, s = k % 2 ? 1 : -1, t = k / (n - 1), L = 54 - 18 * t; o += leaf(px, py, ang + s * 50, L, L * .3, 'gLf', d + dur * fr * .9 + .12); } });
    o += leaf(218, 142, -148, 24, 7, 'gLf', 1.5) + leaf(218, 142, -32, 24, 7, 'gLf', 1.56);
    FL.forEach((F, i) => { const [d, dur] = ST[i]; o += flower(F, [0, -26, 10][i], [1, .95, .97][i], d, dur); });
    const M = [[[190, 392, 22, 20], [160, 398, 24, 21], [130, 396, 24, 21], [100, 388, 21, 19]],
    [[180, 366, 19, 20], [152, 369, 21, 22], [124, 366, 21, 22], [98, 356, 18, 20]],
    [[168, 342, 16, 18], [142, 340, 17, 19], [116, 336, 16, 18]],
    [[152, 318, 12, 15], [130, 316, 12, 15]]];
    M.forEach((tier, ti) => tier.forEach(([x, y, rx, ry], j) => o += round(x, y, rx, ry, (CX - x) * .1 - 6, 1.3 + ti * .28 + j * .07)));
    const Rm = [[[248, 398, 18, 16], [274, 400, 19, 16], [300, 396, 17, 15]], [[262, 378, 15, 15], [286, 376, 15, 15], [308, 372, 13, 14]], [[276, 356, 11, 12], [298, 352, 10, 11]]];
    Rm.forEach((tier, ti) => tier.forEach(([x, y, rx, ry], j) => o += round(x, y, rx, ry, (CX - x) * .1 + 6, 1.6 + ti * .28 + j * .07, true)));
    const rx0 = 172, ry0 = 348, rx1 = 234, ry1 = 436;
    o += `<path class="leaf" style="--d:1.8s;transform-origin:${rx0}px ${ry0}px;transform-box:view-box" d="M${rx0} ${ry0}L${rx1} ${ry1}" stroke="#c0388f" stroke-width="1.6" fill="none"/>`;
    for (let i = 0; i < 6; i++) { const t = .1 + i * .158, x = rx0 + (rx1 - rx0) * t, y = ry0 + (ry1 - ry0) * t, d = 1.6 + i * .18; o += leaf(x, y, -(176 - i * 3), 40, 8.2, 'gFr', d) + leaf(x, y, -(62 + i * 3), 46, 9, 'gFr', d + .08); }
    o += sweep(224, 402, 300, 322, 396, 292, 7, 2.4) + sweep(232, 410, 326, 338, 372, 304, 5.5, 2.6) + sweep(250, 368, 296, 334, 342, 332, 4.5, 2.8);
    for (let x = -60, i = 0; x <= 520; x += 26, i++) { const h = [22, 34, 26, 40][i % 4], a = (i % 2 ? 7 : -7); o += blade(x, 468, x + Math.sin(a * Math.PI / 180) * h, 468 - h, 4.2, a * .2, 2.8 + (i % 6) * .15, 2.8 + (i % 3) * .4); }
    o += tuft(246, 468, 105, [-14, 0, 14], 3.1);
    const FF = [[187, 80, 'y'], [273, 125, 'y'], [103, 170, 'y'], [240, 60, 'y'], [330, 150, 'y'], [193, 39, 'p'], [193, 50, 'p'], [289, 88, 'p'], [286, 98, 'p'], [95, 130, 'p'], [99, 140, 'p']];
    FF.forEach(([x, y, k], i) => { const c = k === 'y' ? '#e9e415' : '#e0409a', r = k === 'y' ? 2 : 2.3; o += `<g class="ff" style="--d:${f(2 + i * .14)}s;--fd:${f(3.4 + (i % 4) * .8)}s;--fx:${f(i % 2 ? 5 : -5)}px">${k === 'y' ? `<circle cx="${x}" cy="${y}" r="6" fill="url(#hl)"/>` : ''}<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${k === 'y' ? 1 : .7}"/></g>`; });
    scene.innerHTML = o;

    /* ---- reveal milestones as the flower grows ---- */
    const items = Array.prototype.slice.call(section.querySelectorAll('.timeline-item'));
    if (reduce) { scene.classList.add('grow'); items.forEach(i => i.classList.add('in')); return; }
    const io = new IntersectionObserver((es) => { es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); if (window.SFX) SFX.tick(); io.unobserve(e.target); } }); }, { threshold: .25, rootMargin: '0px 0px -10% 0px' });
    items.forEach(i => io.observe(i));
    const grow = () => { scene.classList.remove('grow'); void scene.getBoundingClientRect(); requestAnimationFrame(() => { scene.classList.add('grow'); if (window.SFX) SFX.whoosh(); }); };
    let played = false;
    const sio = new IntersectionObserver((es) => { es.forEach(e => { if (e.isIntersecting && !played) { played = true; grow(); } }); }, { threshold: .2 });
    sio.observe(section);
    scene.addEventListener('click', grow);
  })();
})();
