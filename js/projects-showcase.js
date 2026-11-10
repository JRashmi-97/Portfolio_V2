/* Projects spotlight — list on the left, case-study panel on the right.
   Exposes window.CPShowcase.html(projects) and .init(root) for interactive.js.
   To use a REAL screenshot instead of the drawn preview, put an image in
   assets/projects/ and set  shot: 'assets/projects/name.png'  below. */
(function () {
  'use strict';

  /* ---------- per-project case-study content ---------- */
  var D = {
    'TechnoBid': {
      cats: ['web'], lead: 'A real-time auction platform where every bid shows up instantly for every bidder.',
      build: 'MERN stack, with Socket.io pushing each bid to every connected client.',
      hl: ['500+ concurrent bidders', 'Socket.io live updates', 'Full-stack MERN'], mock: 'bid'
    },
    'PrepIQ': {
      cats: ['web', 'ai'], lead: 'An AI interview coach that scores your answers and tells you how to improve them.',
      build: 'Angular front end, .NET API and MS SQL storage, with the Gemini API writing the feedback.',
      hl: ['Gemini-powered feedback', 'Angular + .NET + MS SQL'], mock: 'coach'
    },
    'Emotion Recognition System': {
      cats: ['ai'], lead: 'Reads a piece of text and tells you which emotion is behind it.',
      build: 'DistilBERT fine-tuned in TensorFlow and served through a Flask API.',
      hl: ['92–95% accuracy', 'DistilBERT', 'Flask API'], mock: 'emotion'
    },
    'SarvaVaidya': {
      cats: ['ai'], lead: 'A hackathon build that suggests Ayurvedic, Homeopathic and Unani remedies from a described problem.',
      build: 'LSTM + spaCy language engine, EasyOCR for text in images, Gemini for answers and gTTS for voice.',
      hl: ['Hack Horizon hackathon', '3 medicine systems', 'Voice output'], mock: 'remedy'
    },
    'AI Document Translator': {
      cats: ['ai', 'web'], lead: 'Turns legal and government documents into regional languages people can actually read.',
      build: 'Hugging Face NLP models behind a React interface.',
      hl: ['Top 5 · WWT Hackathon', 'Hugging Face', 'React'], mock: 'translate'
    },
    'Real-Time Quiz Platform': {
      cats: ['web'], lead: 'Live quizzes with instant scoring, run with around 100 students playing at once.',
      build: 'ReactJS and NodeJS on top of Firebase real-time data.',
      hl: ['~100 simultaneous players', 'Instant scoring', 'Firebase'], mock: 'quiz'
    },
    'Multimodal Disaster Detection': {
      cats: ['ai'], lead: 'A multi-hazard detector that reads satellite imagery together with text reports.',
      build: 'CNN + LSTM + NLP ensemble in TensorFlow.',
      hl: ['Research build', 'In progress'], mock: 'map'
    }
  };

  /* ---------- drawn UI previews (illustrative) ---------- */
  var s = function (a) { return a.join(''); };
  var M = {
    bid: function () {
      return s(['<div class="m-top"><b>Vintage Camera</b><span class="m-live"><i></i>LIVE</span></div>',
        '<div class="m-big">$ 1,240<small>current bid</small></div><div class="m-timer"><i style="width:62%"></i></div>',
        '<div class="m-feed"><p><b>Bidder 218</b><span>+ $50</span></p><p><b>Bidder 047</b><span>+ $30</span></p></div>',
        '<div class="m-btn">Place bid</div>']);
    },
    coach: function () {
      return s(['<div class="m-q">“Tell me about a project you are proud of.”</div>',
        '<div class="m-lines"><i style="width:96%"></i><i style="width:88%"></i><i style="width:70%"></i></div>',
        '<div class="m-score"><span>Clarity<b style="--w:82%"></b></span><span>Structure<b style="--w:68%"></b></span><span>Impact<b style="--w:74%"></b></span></div>',
        '<div class="m-note"><em>AI feedback</em> Lead with the result, then explain how you built it.</div>']);
    },
    emotion: function () {
      return s(['<div class="m-q">“I can’t believe we actually won!”</div>',
        '<div class="m-bars"><p><span>Joy</span><b style="--w:94%"></b><em>94%</em></p><p><span>Surprise</span><b style="--w:5%"></b><em>5%</em></p><p><span>Neutral</span><b style="--w:1%"></b><em>1%</em></p></div>',
        '<div class="m-chips"><i>DistilBERT</i><i>Flask API</i></div>']);
    },
    remedy: function () {
      return s(['<div class="m-q">Describe the problem…</div>',
        '<div class="m-tabs"><i class="on">Ayurvedic</i><i>Homeopathic</i><i>Unani</i></div>',
        '<div class="m-card2"><b>Suggested remedy</b><div class="m-lines"><i style="width:92%"></i><i style="width:78%"></i></div></div>',
        '<div class="m-card2"><b>How to use</b><div class="m-lines"><i style="width:84%"></i><i style="width:60%"></i></div></div>',
        '<div class="m-chips"><i>🔊 Listen</i><i>📷 Scan text</i></div>']);
    },
    translate: function () {
      return s(['<div class="m-split"><div><em>English</em><div class="m-lines"><i style="width:94%"></i><i style="width:82%"></i><i style="width:90%"></i><i style="width:58%"></i></div></div>',
        '<span class="m-arrow">→</span><div class="on"><em>Regional language</em><div class="m-lines"><i style="width:90%"></i><i style="width:76%"></i><i style="width:92%"></i><i style="width:64%"></i></div></div></div>',
        '<div class="m-chips"><i>Legal</i><i>Government</i><i>Hugging Face</i></div>']);
    },
    quiz: function () {
      return s(['<div class="m-top"><b>Question 4 / 10</b><span class="m-live"><i></i>LIVE</span></div>',
        '<div class="m-q">Which hook runs after every render?</div>',
        '<div class="m-opts"><i>useMemo</i><i class="ok">useEffect</i><i>useRef</i><i>useId</i></div>',
        '<div class="m-feed"><p><b>1 · Aarav</b><span>940 pts</span></p></div>']);
    },
    map: function () {
      return s(['<div class="m-map"><u style="left:18%;top:30%"></u><u style="left:56%;top:52%;--r:46px"></u><u style="left:70%;top:22%;--r:30px"></u></div>',
        '<div class="m-chips"><i>Flood 91%</i><i>Fire 4%</i><i>Quake 2%</i></div>']);
    }
  };

  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var pad = function (n) { return ('0' + n).slice(-2); };
  function status(p) { return p.l ? ['live', 'Live'] : p.r ? ['repo', 'Code'] : ['wip', 'In progress']; }

  function panelHTML(p) {
    var d = D[p.t] || { lead: p.d, build: p.g, hl: [], mock: 'bid' };
    var st = status(p);
    var screen = p.shot ? '<img src="' + esc(p.shot) + '" alt="' + esc(p.t) + ' screenshot" loading="lazy">' : '<div class="cp-mock">' + (M[d.mock] || M.bid)() + '</div>';
    var links = '';
    if (p.l) links += '<a class="cp-btn solid" href="' + esc(p.l) + '" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Live demo</a>';
    if (p.r) links += '<a class="cp-btn" href="' + esc(p.r) + '" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> Source code</a>';
    if (!links) links = '<span class="cp-btn ghost">Code coming soon</span>';
    var chips = p.g.split('·').map(function (t) { return '<span>' + esc(t.trim()) + '</span>'; }).join('');
    var hl = d.hl.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
    return '<div class="cp-media"><div class="cp-win"><div class="cp-bar"><i></i><i></i><i></i><span>' + esc((p.l || '').replace(/^https?:\/\//, '').replace(/\/$/, '') || p.t.toLowerCase().replace(/\s+/g, '-')) + '</span></div>' +
      '<div class="cp-screen">' + screen + '</div></div>' + (p.shot ? '' : '<span class="cp-cap">illustrative preview</span>') + '</div>' +
      '<div class="cp-info"><div class="cp-meta"><span class="cp-kind">' + esc(p.k) + '</span><span class="cp-st ' + st[0] + '"><i></i>' + st[1] + '</span></div>' +
      '<h3>' + esc(p.t) + '</h3><p class="cp-lead">' + esc(d.lead) + '</p>' +
      '<dl class="cp-facts"><div><dt>How it’s built</dt><dd>' + esc(d.build) + '</dd></div></dl>' +
      (hl ? '<ul class="cp-hl">' + hl + '</ul>' : '') +
      '<div class="cp-tags">' + chips + '</div><div class="cp-links">' + links + '</div></div>';
  }

  var ORDER = Object.keys(D);
  function majors(P) { return P.filter(function (p) { return p.maj; }).sort(function (a, b) { return ORDER.indexOf(a.t) - ORDER.indexOf(b.t); }); }

  function html(P) {
    var maj = majors(P), min = P.filter(function (p) { return !p.maj; });
    var nAI = maj.filter(function (p) { return (D[p.t] || {}).cats && D[p.t].cats.indexOf('ai') > -1; }).length;
    var nWeb = maj.filter(function (p) { return (D[p.t] || {}).cats && D[p.t].cats.indexOf('web') > -1; }).length;
    var rows = maj.map(function (p, i) {
      var st = status(p);
      return '<button type="button" class="cp-row' + (i === 0 ? ' on' : '') + '" role="tab" data-i="' + i + '" data-cats="' + ((D[p.t] || {}).cats || []).join(' ') + '" aria-selected="' + (i === 0) + '">' +
        '<b>' + pad(i + 1) + '</b><span class="cp-rt">' + esc(p.t) + '<small>' + esc(p.k) + '</small></span><i class="cp-dot ' + st[0] + '" title="' + st[1] + '"></i></button>';
    }).join('');
    var minor = min.map(function (p) {
      var chips = p.g.split('·').map(function (t) { return '<span>' + esc(t.trim()) + '</span>'; }).join('');
      var l = (p.l ? '<a href="' + esc(p.l) + '" target="_blank" rel="noopener">Live ↗</a>' : '') + (p.r ? '<a href="' + esc(p.r) + '" target="_blank" rel="noopener">Code ↗</a>' : '');
      return '<article class="cp-mini"><span class="cp-kind">' + esc(p.k) + '</span><h4>' + esc(p.t) + '</h4><p>' + esc(p.d) + '</p><div class="cp-tags">' + chips + '</div><div class="cp-mlinks">' + l + '</div></article>';
    }).join('');
    return '<div class="cb-pin"><div class="cb-eyebrow">SELECTED WORK</div><h2 class="cb-h2">The <em>build</em> log</h2>' +
      '<p class="cb-sub">Seven flagship builds, each with what it does and how it was made. Pick one.</p>' +
      '<div class="cp-filters" role="group" aria-label="Filter projects"><button type="button" class="on" data-f="all">All <em>' + maj.length + '</em></button><button type="button" data-f="web">Web &amp; full-stack <em>' + nWeb + '</em></button><button type="button" data-f="ai">AI / ML <em>' + nAI + '</em></button></div>' +
      '<div class="cp-stage"><div class="cp-list" role="tablist" aria-label="Projects">' + rows + '</div>' +
      '<div class="cp-panel" role="tabpanel" aria-live="polite">' + panelHTML(maj[0]) + '</div></div>' +
      '<div class="cp-ghead"><span>Also built</span><em>' + min.length + ' smaller experiments</em></div><div class="cp-minis">' + minor + '</div></div>';
  }

  function init(root, P) {
    var stage = root.querySelector('.cp-stage'); if (!stage) return;
    var maj = majors(P);
    var rows = Array.prototype.slice.call(stage.querySelectorAll('.cp-row'));
    var panel = stage.querySelector('.cp-panel');
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cur = 0, touched = false, onScreen = false, swapT = 0, lastScroll = 0;
    window.addEventListener('scroll', function () { lastScroll = Date.now(); }, { passive: true });

    function show(i, user) {
      if (user) touched = true;
      if (i === cur && panel.dataset.ready) return;
      cur = i; panel.dataset.ready = '1';
      rows.forEach(function (r, k) { var on = k === i; r.classList.toggle('on', on); r.setAttribute('aria-selected', on); r.tabIndex = on ? 0 : -1; });
      panel.classList.add('swap');
      clearTimeout(swapT);
      swapT = setTimeout(function () { panel.innerHTML = panelHTML(maj[i]); panel.classList.remove('swap'); }, reduce ? 0 : 170);
      var r = rows[i], list = r.parentNode;
      if (list.scrollWidth > list.clientWidth + 4) list.scrollTo({ left: r.offsetLeft - 16, behavior: 'smooth' });
    }
    rows.forEach(function (r, k) {
      r.tabIndex = k === 0 ? 0 : -1;
      r.addEventListener('click', function () { show(k, true); if (window.SFX) SFX.tick(); });
      r.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse' && Date.now() - lastScroll > 250) show(k, true); });  /* ignore rows sliding under a still mouse while scrolling */
      r.addEventListener('keydown', function (e) {
        var vis = rows.filter(function (x) { return !x.hidden; }), at = vis.indexOf(r), n = -1;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = (at + 1) % vis.length;
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = (at - 1 + vis.length) % vis.length;
        if (n > -1) { e.preventDefault(); vis[n].focus(); show(rows.indexOf(vis[n]), true); }
      });
    });
    var fb = Array.prototype.slice.call(root.querySelectorAll('.cp-filters button'));
    fb.forEach(function (b) {
      b.addEventListener('click', function () {
        fb.forEach(function (x) { x.classList.toggle('on', x === b); });
        var f = b.getAttribute('data-f'), first = -1;
        rows.forEach(function (r, k) { var ok = f === 'all' || (r.getAttribute('data-cats') || '').split(' ').indexOf(f) > -1; r.hidden = !ok; if (ok && first < 0) first = k; });
        if (first > -1) show(first, true);
      });
    });
    /* gentle auto-tour while on screen, until the visitor touches anything */
    if (!reduce && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { onScreen = e.isIntersecting; }); }, { threshold: .4 }).observe(stage);
      setInterval(function () {
        if (touched || !onScreen || document.hidden) return;
        var vis = rows.filter(function (x) { return !x.hidden; });
        show(rows.indexOf(vis[(vis.indexOf(rows[cur]) + 1) % vis.length]), false);
      }, 6500);
    }
  }

  window.CPShowcase = { html: html, init: init };
})();
