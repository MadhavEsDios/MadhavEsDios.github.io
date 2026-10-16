/* Site behaviour: theme toggle, footer year, smooth scroll, active nav link, mobile menu, replay intro. */
(function () {
  'use strict';
  var root = document.documentElement;

  // paper grain tile for the body background (a small noise image generated once)
  try {
    var gc = document.createElement('canvas'), gx; gc.width = gc.height = 128; gx = gc.getContext('2d');
    var gd = gx.createImageData(128, 128);
    for (var gi = 0; gi < gd.data.length; gi += 4) { var gv = Math.random() * 255; gd.data[gi] = gd.data[gi + 1] = gd.data[gi + 2] = gv; gd.data[gi + 3] = 255; }
    gx.putImageData(gd, 0, 0);
    root.style.setProperty('--grain', 'url(' + gc.toDataURL('image/png') + ')');
  } catch (e) {}

  // ---- Theme toggle ("Tsukuyomi" = dark) ----
  var btn = document.getElementById('theme-toggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  function syncBtn() {
    var dark = root.getAttribute('data-theme') === 'dark';
    if (btn) btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    if (themeMeta) themeMeta.setAttribute('content', dark ? '#0d0a0b' : '#f6f1e7'); // mobile browser chrome follows the theme
  }
  syncBtn();
  if (btn) btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncBtn();
  });

  // ---- Footer year ----
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // ---- Mobile menu ----
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  function closeMenu() { if (links) links.classList.remove('open'); if (toggle) toggle.setAttribute('aria-expanded', 'false'); }
  if (toggle && links) toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // Escape closes the open menu (focus returns to its button); so does a tap outside it
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && links && links.classList.contains('open')) { closeMenu(); if (toggle) toggle.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (links && links.classList.contains('open') && !links.contains(e.target) && !(toggle && toggle.contains(e.target))) closeMenu();
  });

  // ---- Smooth scroll for in-page anchors ----
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (id === '#top') window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); // #top is the sticky nav: scrollIntoView would not move
      else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      try { history.replaceState(null, '', id); } catch (err) {}
      pinActive(id.slice(1)); // the clicked section stays highlighted even if the page can't scroll it to the top
      closeMenu();
    });
  });

  // ---- Highlight the nav link of the section being read ----
  // Active = the last section whose top is above ~35% of the viewport height.
  // At the very top About is active; at the very bottom the last section is (unless a clicked section is pinned).
  var navLinks = document.querySelectorAll('.nav-links a');
  var sections = document.querySelectorAll('#about, main section[id]'); // About sits above <main>, in the first screen
  var ticking = false;
  // A section reached by clicking a nav link (or opened via a #link) stays highlighted until the visitor scrolls
  // by hand: the page is short, so jumping to e.g. News already reaches the bottom, where the last section would win.
  var pinned = null;
  function setActive(id) { navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + id); }); }
  function pinActive(id) { // only for nav sections (e.g. not the footer's #top, which just scrolls and tracks normally)
    if (!document.querySelector('.nav-links a[href="#' + id + '"]')) { pinned = null; return; }
    pinned = id; setActive(id);
  }
  function unpin() { if (pinned) { pinned = null; onScroll(); } }
  ['wheel', 'touchmove'].forEach(function (n) { window.addEventListener(n, unpin, { passive: true }); });
  window.addEventListener('keydown', function (e) { if (/^(Arrow(Up|Down)|Page(Up|Down)|Home|End| )$/.test(e.key)) unpin(); });
  function updateActive() {
    ticking = false;
    if (!sections.length || pinned) return;
    var current = sections[0];
    if (window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 2 && window.pageYOffset > 0) {
      current = sections[sections.length - 1];
    } else {
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top <= window.innerHeight * 0.35) current = sections[i];
      }
    }
    setActive(current.id);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(updateActive); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  if (location.hash.length > 1 && document.querySelector('.nav-links a[href="' + location.hash + '"]')) pinActive(location.hash.slice(1));
  else updateActive();
  window.addEventListener('hashchange', function () { if (location.hash.length > 1) pinActive(location.hash.slice(1)); });

  // ---- Replay intro ----
  ['replay-intro', 'replay-nav'].forEach(function (id) { // footer link + Sharingan button in the nav
    var replay = document.getElementById(id);
    if (replay) replay.addEventListener('click', function (e) {
      e.preventDefault();
      if (/[?&]intro=1(&|$)/.test(location.search)) location.reload();
      else location.href = location.pathname + '?intro=1';
    });
  });

  // ---- Optional Sharingan glow over the hero picture's eyes (data-glow="on" on .hero-banner) ----
  // The picture is object-fit: cover, so the eye positions (fractions of the image) are converted to screen
  // positions with the same crop maths, and recomputed on resize.
  var banner = document.querySelector('.hero-banner');
  if (banner) { // object-position of each picture comes from the data attributes
    if (banner.getAttribute('data-pos-sun')) banner.style.setProperty('--pos-sun', banner.getAttribute('data-pos-sun'));
    if (banner.getAttribute('data-pos-night')) banner.style.setProperty('--pos-night', banner.getAttribute('data-pos-night'));
  }
  // gentle loop between the light-theme pictures (crossfade is CSS; reduced motion keeps showing the first one)
  if (banner && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    banner.style.setProperty('--sun-fade', (banner.getAttribute('data-fade') || '2') + 's');
    var cur = 0, hold = (parseFloat(banner.getAttribute('data-hold')) || 6) * 1000;
    setInterval(function () {
      var imgs = banner.querySelectorAll('.hero-img-sun');
      if (imgs.length < 2 || document.documentElement.getAttribute('data-theme') === 'dark' || document.hidden) return;
      cur = (cur + 1) % imgs.length;
      imgs.forEach(function (im, i) { im.classList.toggle('is-on', i === cur); });
    }, hold + (parseFloat(banner.getAttribute('data-fade')) || 2) * 1000);
  }
  if (banner && banner.getAttribute('data-glow') === 'on') {
    var media = banner.querySelector('.hero-imgs'), pic = banner.querySelector('.hero-img-sun');
    if (!pic) return;
    var glows = ['data-eye-left', 'data-eye-right'].map(function (attr) {
      var pos = (banner.getAttribute(attr) || '').split(',').map(parseFloat);
      if (pos.length < 2 || isNaN(pos[0]) || isNaN(pos[1])) return null;
      var g = document.createElement('div'); g.className = 'hero-glow'; media.appendChild(g);
      return { el: g, fx: pos[0], fy: pos[1] };
    }).filter(Boolean);
    var placeGlows = function () {
      var w = banner.clientWidth, h = banner.clientHeight, iw = pic.naturalWidth || +pic.getAttribute('width'), ih = pic.naturalHeight || +pic.getAttribute('height');
      var op = (banner.getAttribute('data-pos-sun') || '50% 40%').split(/\s+/).map(function (v) { return parseFloat(v) / 100; });
      var s = Math.max(w / iw, h / ih), ox = (w - iw * s) * op[0], oy = (h - ih * s) * op[1]; // same as the picture's object-position
      var d = Math.max(6, 16 * s * (iw / 2560) * 1.4); // ~16px at the 2560px original (core + soft halo), scaled with the picture
      glows.forEach(function (g) {
        g.el.style.left = (ox + g.fx * iw * s) + 'px'; g.el.style.top = (oy + g.fy * ih * s) + 'px';
        g.el.style.width = g.el.style.height = d + 'px';
      });
    };
    placeGlows();
    pic.addEventListener('load', placeGlows);
    window.addEventListener('resize', placeGlows);
  }

  // ---- Drifting feathers: a few fall slowly through the hero banner; a puff comes out of the theme button ----
  // (Web Animations API, so the homepage does not need GSAP. Everything is off with reduced motion.)
  var FV = '?v=2026-10-09d';
  function fxFeather(parent, x, y, h, opacity, dur, fall, sway) {
    var f = document.createElement('img');
    f.src = 'assets/intro/crow/nb-feather-' + (1 + Math.floor(Math.random() * 8)) + '.webp' + FV;
    f.alt = ''; f.setAttribute('aria-hidden', 'true'); f.draggable = false; f.className = 'fx-feather';
    f.style.height = h + 'px'; f.style.width = 'auto'; f.style.opacity = '0';
    parent.appendChild(f);
    var r0 = (Math.random() - 0.5) * 80, swing = 30 + Math.random() * 40, frames = [], n = 6;
    for (var i = 0; i <= n; i++) {
      var u = i / n;
      frames.push({
        transform: 'translate(' + (x + Math.sin(u * Math.PI * 3) * sway) + 'px,' + (y + fall * u) + 'px) rotate(' + (r0 + Math.sin(u * Math.PI * 3 + 1) * swing) + 'deg)',
        opacity: (u < 0.1 ? u * 10 : u > 0.8 ? (1 - u) * 5 : 1) * opacity
      });
    }
    var a = f.animate(frames, { duration: dur, easing: 'ease-in-out', fill: 'forwards' });
    a.onfinish = function () { if (f.parentNode) f.parentNode.removeChild(f); };
    return f;
  }
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (banner && !calm && banner.animate) {
    var fbox = document.createElement('div'); fbox.className = 'hero-feathers'; fbox.setAttribute('aria-hidden', 'true');
    banner.insertBefore(fbox, banner.querySelector('.hero-shade'));
    var visible = true, alive = 0;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(banner);
    var drip = function () {
      if (visible && !document.hidden && alive < 5) {
        var w = banner.clientWidth, light = root.getAttribute('data-theme') !== 'dark';
        alive++;
        var f = fxFeather(fbox, Math.random() * w, -60, 22 + Math.random() * 26, light ? 0.45 : 0.5 + Math.random() * 0.3, 8000 + Math.random() * 6000, banner.clientHeight + 120, 20 + Math.random() * 40);
        setTimeout(function () { alive--; }, 8000);
      }
      setTimeout(drip, 3000 + Math.random() * 2000);
    };
    setTimeout(drip, 1200);
    // start with a couple already on their way
    setTimeout(function () { if (visible) fxFeather(fbox, banner.clientWidth * (0.2 + Math.random() * 0.6), 20, 30, 0.5, 9000, banner.clientHeight, 30); }, 200);
  }
  // a small puff of feathers from the theme toggle
  function puff(btn) {
    if (calm || !btn.animate) return;
    var r = btn.getBoundingClientRect(), light = root.getAttribute('data-theme') !== 'dark';
    for (var i = 0; i < 7; i++) {
      var holder = document.createElement('div'); holder.className = 'fx-puff'; holder.style.cssText = 'left:' + (r.left + r.width / 2) + 'px;top:' + (r.top + r.height / 2) + 'px;width:0;height:0';
      document.body.appendChild(holder);
      var f = fxFeather(holder, 0, 0, 16 + Math.random() * 14, light ? 0.55 : 0.8, 1800 + Math.random() * 600, 60 + Math.random() * 90, 18);
      f.style.left = (Math.random() * 20 - 10) + 'px';
      (function (h) { setTimeout(function () { if (h.parentNode) h.parentNode.removeChild(h); }, 2600); })(holder);
    }
  }
  // one feather slips off the portrait ring on hover (hover devices only, at most one per 1.5 s)
  var about = document.getElementById('about'), lastShed = 0;
  if (about && !calm && window.matchMedia('(hover: hover)').matches) {
    about.addEventListener('mouseover', function (e) {
      var ph = e.target.closest && e.target.closest('.photo');
      if (!ph || (e.relatedTarget && ph.contains(e.relatedTarget))) return;
      var now = Date.now(); if (now - lastShed < 1500 || !ph.animate) return;
      lastShed = now;
      var r = ph.getBoundingClientRect(), rad = r.width / 2, rady = r.height / 2, th = Math.random() * Math.PI * 1.1 - 0.05, light = root.getAttribute('data-theme') !== 'dark';
      var holder = document.createElement('div'); holder.className = 'fx-puff';
      holder.style.cssText = 'left:' + (r.left + rad + Math.cos(th) * rad) + 'px;top:' + (r.top + rady + Math.sin(th) * rady) + 'px;width:0;height:0';
      document.body.appendChild(holder);
      fxFeather(holder, 0, 0, 18 + Math.random() * 10, light ? 0.6 : 0.85, 2500, 70 + Math.random() * 40, 16 + Math.random() * 14);
      setTimeout(function () { if (holder.parentNode) holder.parentNode.removeChild(holder); }, 2700);
    });
  }
  var tbtn = document.getElementById('theme-toggle');
  if (tbtn) tbtn.addEventListener('click', function () { puff(tbtn); });

  // ================= Easter eggs (see README) =================
  // 1) crow ornaments: real little elements at the end of each section title (click one: it flies off and returns later)
  document.querySelectorAll('main h2').forEach(function (h) {
    var o = document.createElement('span'); o.className = 'crow-orn'; o.setAttribute('aria-hidden', 'true'); o.tabIndex = -1;
    h.appendChild(o);
    o.addEventListener('click', function () {
      if (calm || !o.animate || o._away) return;
      o._away = true;
      var r = o.getBoundingClientRect(), dx = window.innerWidth - r.left + 80, dy = -(r.top + 120);
      var a = o.animate([
        { transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1 },
        { transform: 'translate(' + dx * 0.4 + 'px,' + dy * 0.1 + 'px) scale(2.2) rotate(-12deg)', opacity: 1, offset: 0.4 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(3) rotate(-25deg)', opacity: 0 }
      ], { duration: 1100, easing: 'ease-in', fill: 'forwards' });
      var holder = document.createElement('div'); holder.className = 'fx-puff'; holder.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:0;height:0';
      document.body.appendChild(holder); fxFeather(holder, 0, 0, 26, 0.8, 2600, 140, 20);
      setTimeout(function () { if (holder.parentNode) holder.parentNode.removeChild(holder); }, 3000);
      setTimeout(function () { a.cancel(); o.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 800 }); o._away = false; }, 10000);
    });
  });

  // 2) typed secrets: "sharingan" (a spinning Mangekyo follows the mouse for 6 s) and the Konami code (replays the intro)
  var typed = '', konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'], kpos = 0;
  document.addEventListener('keydown', function (e) {
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable)) return;
    var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    kpos = (key === konami[kpos]) ? kpos + 1 : (key === konami[0] ? 1 : 0);
    if (kpos === konami.length) { kpos = 0; location.href = location.pathname + '?intro=1'; return; }
    if (e.key.length === 1) {
      typed = (typed + key).slice(-9);
      if (typed === 'sharingan') { typed = ''; sharingan(); }
    }
  });
  function sharingan() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || document.querySelector('.sharingan-cursor')) return;
    var el = document.createElement('div'); el.className = 'sharingan-cursor';
    el.innerHTML = '<svg viewBox="-100 -100 200 200"><circle r="96" fill="#8f0014"/><circle r="82" fill="#b3001b"/><circle r="62" fill="#d0102a"/><circle r="96" fill="none" stroke="#000" stroke-width="4"/><g fill="#000"><path d="M-9,-11 C-24,-36 -8,-62 34,-74 C10,-54 24,-32 11,-12 Z"/><path transform="rotate(120)" d="M-9,-11 C-24,-36 -8,-62 34,-74 C10,-54 24,-32 11,-12 Z"/><path transform="rotate(240)" d="M-9,-11 C-24,-36 -8,-62 34,-74 C10,-54 24,-32 11,-12 Z"/><circle r="16"/></g></svg>';
    if (calm) el.style.animation = 'none';
    el.style.transform = 'translate(-100px,-100px)';
    document.body.appendChild(el); root.classList.add('sharingan-mode');
    function mv(ev) { el.style.transform = 'translate(' + ev.clientX + 'px,' + ev.clientY + 'px)'; }
    document.addEventListener('mousemove', mv);
    setTimeout(function () { document.removeEventListener('mousemove', mv); root.classList.remove('sharingan-mode'); if (el.parentNode) el.parentNode.removeChild(el); }, 6000);
  }

  // 3) console greeting (once)
  try {
    if (!window.__genjutsuHello) {
      window.__genjutsuHello = true;
      console.log('%c幻術', 'font-size:44px;font-weight:700;color:#b3001b;font-family:serif;text-shadow:0 0 8px rgba(179,0,27,.5)');
      console.log('%cYou are already under my genjutsu.', 'font-size:14px;font-style:italic;color:#8c0c1c');
      console.log('%cTry the Konami code. 🐦‍⬛', 'font-size:11px;color:#777');
    }
  } catch (e) {}
})();
