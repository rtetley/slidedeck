(function () {
  'use strict';

  var W = 1280, H = 720;
  var deck = document.getElementById('deck');
  var slides = Array.prototype.slice.call(deck.querySelectorAll(':scope > .slide'));
  var progress = document.getElementById('progress');
  var overview = document.getElementById('overview');
  var params = new URLSearchParams(location.search);
  var isPresenter = params.has('presenter');
  var state = { slide: 0, frag: 0 };
  var peer = null;          // the other window (audience <-> presenter)
  var goto = '';            // digits typed for "12⏎"

  /* ---------------- setup ---------------- */

  slides.forEach(function (s) {
    if (s.hasAttribute('data-incremental')) {
      s.querySelectorAll('.slide-body > ul > li, .slide-body > ol > li, .col > ul > li, .col > ol > li')
        .forEach(function (li) { li.classList.add('fragment'); });
    }
  });

  function fragments(slide) {
    return Array.prototype.slice.call(slide.querySelectorAll('.fragment'));
  }

  /* ---------------- scaling ---------------- */

  function scaleDeck() {
    var s = Math.min(window.innerWidth / W, window.innerHeight / H);
    deck.style.transform = 'scale(' + s + ')';
  }

  /* -------- auto-fit: shrink text on slides whose content overflows ------- */

  function autofit(slide) {
    if (slide.hasAttribute('data-nofit') || slide.dataset.fitted) return;
    var body = slide.querySelector('.slide-body');
    if (!body) return;
    var wasActive = slide.classList.contains('active');
    slide.style.display = 'block';
    var fit = 1;
    body.style.setProperty('--fit', fit);
    while (body.scrollHeight > body.clientHeight + 1 && fit > 0.55) {
      fit -= 0.04;
      body.style.setProperty('--fit', fit.toFixed(2));
    }
    if (fit < 1 && body.scrollHeight > body.clientHeight + 1) {
      console.warn('[inria-slides] slide ' + (+slide.dataset.index + 1) + ' still overflows at 55% text size');
    }
    if (!wasActive) slide.style.display = '';
    slide.dataset.fitted = '1';
  }

  /* ---------------- navigation ---------------- */

  function show(i, f, fromPeer) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    var frs = fragments(slides[i]);
    if (f === 'end') f = frs.length;
    f = Math.max(0, Math.min(frs.length, f || 0));
    slides.forEach(function (s, k) { s.classList.toggle('active', k === i); });
    frs.forEach(function (el, k) {
      el.classList.toggle('visible', k < f);
      el.classList.toggle('current', k === f - 1);
    });
    state.slide = i;
    state.frag = f;
    autofit(slides[i]);
    progress.style.width = (slides.length > 1 ? (i / (slides.length - 1)) * 100 : 100) + '%';
    if (!isPresenter && history.replaceState) history.replaceState(null, '', '#' + (i + 1));
    if (isPresenter) renderPresenter();
    if (!fromPeer && peer && !peer.closed) peer.postMessage({ inriaSlides: true, slide: i, frag: f }, '*');
  }

  function next() {
    var frs = fragments(slides[state.slide]);
    if (state.frag < frs.length) show(state.slide, state.frag + 1);
    else if (state.slide < slides.length - 1) show(state.slide + 1, 0);
  }
  function prev() {
    if (state.frag > 0) show(state.slide, state.frag - 1);
    else if (state.slide > 0) show(state.slide - 1, 'end');
  }

  /* ---------------- overview ---------------- */

  function buildOverview() {
    overview.innerHTML = '';
    slides.forEach(function (s, i) {
      var t = document.createElement('div');
      t.className = 'thumb' + (i === state.slide ? ' current' : '');
      var clone = s.cloneNode(true);
      clone.classList.remove('active');
      t.appendChild(clone);
      var n = document.createElement('span');
      n.className = 'thumb-num';
      n.textContent = i + 1;
      t.appendChild(n);
      t.addEventListener('click', function () { toggleOverview(false); show(i, 0); });
      overview.appendChild(t);
    });
    requestAnimationFrame(function () {
      overview.querySelectorAll('.thumb').forEach(function (t) {
        t.querySelector('.slide').style.transform = 'scale(' + t.clientWidth / W + ')';
      });
      var cur = overview.querySelector('.thumb.current');
      if (cur) cur.scrollIntoView({ block: 'center' });
    });
  }
  function toggleOverview(force) {
    var on = force === undefined ? !document.body.classList.contains('show-overview') : force;
    document.body.classList.toggle('show-overview', on);
    if (on) buildOverview();
  }

  /* ---------------- black screen ---------------- */

  var blackout = null;
  function toggleBlack() {
    if (blackout) { blackout.remove(); blackout = null; return; }
    blackout = document.createElement('div');
    blackout.style.cssText = 'position:fixed;inset:0;background:#000;z-index:100';
    document.body.appendChild(blackout);
  }

  /* ---------------- presenter view ---------------- */

  var pv = null, start = null;

  function stageInto(box, slide) {
    box.innerHTML = '';
    if (!slide) return;
    var stage = document.createElement('div');
    stage.className = 'pv-stage';
    var clone = slide.cloneNode(true);
    clone.classList.add('active');
    stage.appendChild(clone);
    box.appendChild(stage);
    var s = Math.min(box.clientWidth / W, box.clientHeight / H);
    stage.style.transform = 'translate(' + (box.clientWidth - W * s) / 2 + 'px,' + (box.clientHeight - H * s) / 2 + 'px) scale(' + s + ')';
    return clone;
  }

  function buildPresenter() {
    document.body.classList.add('presenter');
    var root = document.getElementById('presenter');
    root.innerHTML =
      '<div class="bar"><span class="timer">00:00</span><span class="clock"></span>' +
      '<span class="counter"></span><span class="spacer"></span>' +
      '<button data-act="reset">Reset timer</button><button data-act="prev">◀</button><button data-act="next">▶</button></div>' +
      '<div class="left"><div class="pv-label">Current</div><div class="pv-box pv-current"></div></div>' +
      '<div class="side"><div><div class="pv-label">Next</div><div class="pv-box pv-next" style="aspect-ratio:16/9"></div></div>' +
      '<div class="notes"></div></div>';
    pv = {
      timer: root.querySelector('.timer'), clock: root.querySelector('.clock'),
      counter: root.querySelector('.counter'), current: root.querySelector('.pv-current'),
      next: root.querySelector('.pv-next'), notes: root.querySelector('.notes'),
    };
    root.querySelector('[data-act=reset]').onclick = function () { start = Date.now(); };
    root.querySelector('[data-act=prev]').onclick = prev;
    root.querySelector('[data-act=next]').onclick = next;
    start = Date.now();
    setInterval(function () {
      var s = Math.floor((Date.now() - start) / 1000);
      pv.timer.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
      pv.clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, 500);
    document.title = 'Presenter — ' + document.title;
  }

  function renderPresenter() {
    if (!pv) return;
    var cur = stageInto(pv.current, slides[state.slide]);
    if (cur) fragments(cur).forEach(function (el, k) { el.classList.toggle('visible', k < state.frag); });
    // "next" = next fragment step if any, otherwise next slide
    var frs = fragments(slides[state.slide]);
    if (state.frag < frs.length) {
      var n = stageInto(pv.next, slides[state.slide]);
      fragments(n).forEach(function (el, k) { el.classList.toggle('visible', k <= state.frag); });
    } else {
      var n2 = stageInto(pv.next, slides[state.slide + 1]);
      if (n2) fragments(n2).forEach(function (el) { el.classList.remove('visible'); });
    }
    var notes = slides[state.slide].querySelector('aside.notes');
    pv.notes.innerHTML = notes ? notes.innerHTML : '';
    pv.counter.textContent = (state.slide + 1) + ' / ' + slides.length +
      (frs.length ? '  ·  step ' + state.frag + '/' + frs.length : '');
  }

  function openPresenter() {
    var url = location.href.split('#')[0].split('?')[0] + '?presenter#' + (state.slide + 1);
    peer = window.open(url, 'inria-slides-presenter', 'width=1280,height=800');
  }

  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || !d.inriaSlides) return;
    if (!peer || peer.closed) peer = e.source;
    if (d.hello) { peer.postMessage({ inriaSlides: true, slide: state.slide, frag: state.frag }, '*'); return; }
    show(d.slide, d.frag, true);
  });

  /* ---------------- input ---------------- */

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key;
    if (/^[0-9]$/.test(k)) { goto += k; return; }
    if (k === 'Enter' && goto) { show(parseInt(goto, 10) - 1, 0); goto = ''; return; }
    goto = '';
    switch (k) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': case 'n': case 'l': case 'j':
        next(); break;
      case ' ':
        e.shiftKey ? prev() : next(); break;
      case 'Enter':
        next(); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace': case 'h': case 'k':
        prev(); break;
      case 'Home': show(0, 0); break;
      case 'End': show(slides.length - 1, 'end'); break;
      case 'f': case 'F':
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen();
        break;
      case 'o': case 'O': toggleOverview(); break;
      case 'Escape':
        if (document.body.classList.contains('show-help')) document.body.classList.remove('show-help');
        else toggleOverview();
        break;
      case 's': case 'S': if (!isPresenter) openPresenter(); break;
      case 'b': case 'B': case '.': toggleBlack(); break;
      case 'p': case 'P': window.print(); break;
      case '?': document.body.classList.toggle('show-help'); break;
      default: return;
    }
    e.preventDefault();
  });

  document.getElementById('viewport').addEventListener('click', function (e) {
    if (e.target.closest('a, video, button, input')) return;
    if (e.clientX < window.innerWidth / 4) prev(); else next();
  });

  var touchX = null;
  document.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    touchX = null;
  });

  window.addEventListener('resize', function () {
    scaleDeck();
    if (isPresenter) renderPresenter();
  });
  window.addEventListener('hashchange', function () {
    var n = parseInt(location.hash.slice(1), 10);
    if (n && n - 1 !== state.slide) show(n - 1, 0);
  });
  window.addEventListener('beforeprint', function () { slides.forEach(autofit); });

  /* ---------------- live reload (serve mode) ---------------- */

  if (window.DECK_META && window.DECK_META.liveReload && window.EventSource) {
    var es = new EventSource('/__reload');
    var boot = null;
    var reload = function () {
      try { sessionStorage.setItem('inria-slides-frag', String(state.frag)); } catch (e) {}
      location.reload();
    };
    es.onmessage = reload;
    // the dev server restarts when the framework code changes: reload on a new boot id
    es.addEventListener('boot', function (e) {
      if (boot && boot !== e.data) reload();
      boot = e.data;
    });
  }

  /* ---------------- boot ---------------- */

  if (window.mermaid) {
    // must run before DOMContentLoaded, otherwise mermaid renders with its default theme
    window.mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        fontFamily: 'Inria Sans, sans-serif', fontSize: '22px', primaryColor: '#F2F2F2', primaryBorderColor: '#E63312',
        primaryTextColor: '#1D1D1B', lineColor: '#3C3C3B', secondaryColor: '#FCE3DD', tertiaryColor: '#FFFFFF',
      },
    });
  }

  scaleDeck();
  if (isPresenter) {
    buildPresenter();
    if (window.opener) { peer = window.opener; peer.postMessage({ inriaSlides: true, hello: true }, '*'); }
  }
  var startAt = parseInt(location.hash.slice(1), 10);
  var startFrag = 0;
  try { startFrag = parseInt(sessionStorage.getItem('inria-slides-frag'), 10) || 0; sessionStorage.removeItem('inria-slides-frag'); } catch (e) {}
  show(startAt ? startAt - 1 : 0, startFrag);

  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  fontsReady.then(function () {
    slides.forEach(function (s) { delete s.dataset.fitted; autofit(s); });
    document.documentElement.setAttribute('data-ready', '');
    if (window.mermaid) {
      // mermaid needs visible nodes to measure text
      slides.forEach(function (s) { s.style.display = 'block'; });
      window.mermaid.run({ querySelector: '.mermaid' }).finally(function () {
        slides.forEach(function (s) { s.style.display = ''; delete s.dataset.fitted; });
        show(state.slide, state.frag, true);
      });
    }
  });
})();
