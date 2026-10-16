/* ==========================================================================
   Genjutsu intro (Itachi vs Sasuke).  Needs GSAP (self-hosted in js/vendor/, loaded below).
   Story, ~6s, using real anime frames drawn on a <canvas>:
     1. fade up from black on Itachi's two-finger sign, then he turns it to point at YOU (frame sequence, 12 fps)
     2. His body dissolves into crows (frame sequence + our own flying crows and feathers)
     3. a film-style title card: the Mangekyo Sharingan and "You are already under my genjutsu."
     4. the genjutsu shatters like glass and the homepage is revealed underneath
     5. crows scatter, the overlay fades, the nav links land
   Everything moves with transform + opacity only, so it stays smooth.
   Whether it plays is decided by a tiny script in <head> of index.html, which adds
   class "intro-active" to <html>. This file only runs the show. GSAP and all the images load in parallel from
   the very start; if any asset is missing or they are too slow to load, the intro is simply skipped (the site
   is shown immediately).
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------- CONFIG: tweak everything here ---------------- */
  var CONFIG = {
    // Total length in seconds. The natural timeline length (set by the frame counts, fps and the marks
    // below) is scaled to this. Try 5.0 for a snappier intro.
    totalDuration: 5.8,
    fps: 12,               // playback rate of the anime frames (the anime is drawn on 2s = 12 drawings/s)

    // Two sets of the same frames: full size (1920 px wide) and a small set (960 px wide) for phones and small
    // screens (portrait, or longest side x pixel ratio < 1500) to save memory and bandwidth.
    // Big / Retina screens (longest side x pixel ratio >= 2200) get a third, sharper set (2560 px wide); if one of
    // those files is missing, that frame falls back to the full set.
    dirs: { full: 'assets/intro/web/', small: 'assets/intro/web-sm/', hd: 'assets/intro/web-hd/' },

    // Frame sequences (WebP, 16:9). `ids` = frame numbers to use, in order (ghosted blend frames of the
    // source were left out), `holdLast` = how many extra frames to hold the last one.
    // `focus` = which part of the 16:9 frame stays visible when the screen is not 16:9
    // (CSS object-position style, desktop / portrait phone).
    sequences: [
      { name: 'point', file: 'point-', ids: [2, 4, 6, 8, 11, 12, 13, 14, 16, 17, 18, 20, 21], holdLast: 2, focus: '50% 45%', focusMobile: '40% 40%' },
      // the "dissolve" sequence is the second part: it starts after the first one ends
      { name: 'dissolve', file: 'dissolve-', ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15], holdLast: 3, focus: '50% 50%', focusMobile: '50% 35%', part: 2 }
    ],
    fadeIn: 0.6,           // fade up from black at the very start
    pushIn: 1.08,          // slow push-in scale over the first part (1 = none)

    // Beat 3: the title card (eye + text)
    eyeOverlap: 0.12,      // the card fades in this early, under the last (black) dissolve frames
    eyeFade: 0.45,
    eyeScaleFrom: 1.12,    // (drawn Mangekyo only) starts this much larger and settles to 1
    eyeSpinDegrees: 240,   // (drawn Mangekyo only) how far it turns, easing into a slow idle spin
    eyeHold: 1.5,          // seconds from the card appearing until the glass shatters
    wordStagger: 0.08,     // delay between the words of the main line
    // Real footage of the eye, shown as a widescreen band instead of the drawn Mangekyo (leave `ids` empty, or
    // if any frame fails to load, the drawn Mangekyo is used). Frames 1-5 = the Sharingan turning into the
    // Mangekyo (played once at `introFps`); frames 6-20 = it glowing and spinning slowly, played back and
    // forth (ping-pong, so it loops without a jump) at `loopFps` until the glass shatters.
    // `zoom` crops in on the pupil; `pupil` = where the pupil is in the frame (fractions).
    eyeSeq: { file: 'eye-', ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], intro: 5, introFps: 24, loopFps: 20,
              aspect: 2.39, zoom: 1.5, pupilStart: [0.53, 0.52], pupilEnd: [0.46, 0.52], pupil: [0.54, 0.52] },

    // Beat 4: reveal
    shatterDur: 0.9,       // how long each shard flies
    shatterStagger: 0.25,  // extra delay for shards far from the centre (outward ripple)
    // Beat 5: reveal. The shards fly away; the black, grain and vignette fade out, the nav + name fade in.
    revealFade: 0.8,       // seconds for the overlay to fade out as the shards fly
    shatterCrows: 3,       // a few large crows scatter outward (off screen) during the shatter

    // Crows (at most ~45 on screen at once with crowDensity 1)
    crowDensity: 1,        // multiplies every crow count below (0.5 = half as many)
    flapSpeed: 1,          // multiplies wing-flap speed
    dissolveCrows: 7,      // big crows burst out of Itachi's body in beat 2 (about 3 fly at the camera)
    redEyeShare: 0.2,      // fraction of dissolve/reform crows with a tiny red eye (as in the anime)
    featherCount: 13,      // a drift of black feathers right after the dissolve (0 = none)
    featherLinger: 1.0,    // seconds a feather takes to fall (varies -20%..+25%); short, so they are gone before the title text

    // Behaviour
    returningVisitor: 'none', // 'none' = no intro for return visitors; 'flash' = brief 0.5s eye flash
    flashDuration: 0.5,
    skipFadeDur: 0.25,        // seconds, fade-out when the visitor skips
    // Loading budget, counted from the moment this script boots (GSAP and the images load in parallel, so it
    // covers both). If GSAP and every asset are not ready by then, the intro is skipped. A first visit gets the
    // shorter budget (a slow phone should not stare at black for long); an explicit replay (?intro=1) the longer one.
    loadMax: 9000,            // ms, first-visit (automatic) intro (covers connections down to ~2 Mbps)
    loadMaxForced: 20000,     // ms, explicit replay (the visitor asked for it, so be patient)
    spinnerAfter: 400,        // ms after boot before a tiny loading spinner appears
    safetyExtra: 3,           // seconds added to (budget + totalDuration) for the hard "remove overlay" timeout
    storageKey: 'genjutsu-seen',

    text: 'You are already under my genjutsu.',

    // The jitter on the Sharingan card: the eye footage starts in black and white, then flickers into full colour
    // (static grayscale class toggled; slices + RGB split are snapshot copies of the eye). Times in seconds.
    jitter: { at: 0.6,              // seconds after the card appears (about when the Mangekyo forms)
              steps: [0.10, 0.07, 0.14, 0.08, 0.12, 0.09, 0.11],  // how long each flicker state lasts; they alternate b&w / colour, ending on colour
              bands: 4,             // horizontal glitch slices
              bandShift: [10, 24],  // px, sideways offset of the slices
              rgbSplit: 4,          // px, red / cyan offset on the toggles listed in rgbOn
              rgbOn: [1, 3, 5],
              shake: 3 },           // px, tiny shake of the eye (the text stays steady)
    crowSprite: 'assets/intro/crow/crow-side.png',
    crowFrame: { w: 256, h: 380 }, // size of one frame of the sprite strip (8 frames side by side); keep in sync with the PNG

    // GSAP 3.12.5 is self-hosted (one connection, no extra DNS/TLS round trips on slow mobile networks);
    // if that file fails to load, the CDN copy is tried.
    gsapUrl: 'js/vendor/gsap-3.12.5.min.js',
    gsapFallbackUrl: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
    shardCols: 4,   // shards = cols * rows * 2 triangles (4*2*2 = 16)
    shardRows: 2
  };
  /* ---------------- end CONFIG ---------------- */

  var FRAME_W = 1920, FRAME_H = 1080; // shape of the frames (the small set has the same 16:9 shape)

  var root = document.documentElement;
  var overlay = document.getElementById('intro');
  if (!overlay) return;

  // deep links (a #hash in the address) never play the intro and do not set the seen flag
  if (location.hash && location.hash.length > 1) { root.classList.remove('intro-active', 'intro-returning'); return; }
  var playing = root.classList.contains('intro-active');
  var flashing = !playing && root.classList.contains('intro-returning') && CONFIG.returningVisitor === 'flash';
  if (!playing && !flashing) return;

  // Preview/debug mode: ?intro=1&at=2.5 builds the intro and freezes it at 2.5 real seconds.
  // No timers, no skip listeners, no localStorage write, URL left untouched.
  var atMatch = /[?&]at=([0-9.]+)/.exec(location.search);
  var previewAt = (playing && atMatch && isFinite(parseFloat(atMatch[1]))) ? parseFloat(atMatch[1]) : null;
  var preview = previewAt !== null;

  var gsap = null, tl = null, finished = false, safetyTimer = null, loadTimer = null, spinnerTimer = null, skipHintTimer = null;
  var started = false, failed = false, assetsReady = false, frames = [], eyeImgs = [], eyeFailed = false; // loading state, see go()
  var prevFocus = document.activeElement;
  var skipBtn = overlay.querySelector('.intro-skip');
  var navLinks = document.querySelectorAll('.nav-links a');
  var NB = {};   // painted crow poses 1..6 (decoded images), filled by the loader; empty = use the sprite crows

  // ---------- Artwork (inline SVG strings) ----------
  // Itachi's Mangekyo Sharingan. Flat circles instead of gradients so the drawing can be cloned freely.
  var EYE_SVG =
    '<svg viewBox="-100 -100 200 200" aria-hidden="true">' +
    '<circle r="96" fill="#7d0013"/><circle r="84" fill="#a30018"/><circle r="64" fill="#c10f26"/>' +
    // fine iris texture: thin concentric lines
    '<g fill="none" stroke="#000" stroke-opacity=".3" stroke-width=".5">' +
    '<circle r="91"/><circle r="87"/><circle r="81"/><circle r="76"/><circle r="71"/><circle r="66"/>' +
    '<circle r="58"/><circle r="53"/><circle r="48"/><circle r="43"/><circle r="38"/><circle r="33"/><circle r="28"/></g>' +
    '<circle r="96" fill="none" stroke="#1a0206" stroke-width="1"/>' +
    '<g fill="#000"><path d="M-9,-11 C-24,-36 -8,-62 34,-74 C10,-54 24,-32 11,-12 Z"/>' +
    '<path transform="rotate(120)" d="M-9,-11 C-24,-36 -8,-62 34,-74 C10,-54 24,-32 11,-12 Z"/>' +
    '<path transform="rotate(240)" d="M-9,-11 C-24,-36 -8,-62 34,-74 C10,-54 24,-32 11,-12 Z"/>' +
    '<circle r="16"/></g></svg>';

  // Feathers use assets/intro/crow/feather.png (44x128, charcoal, ragged).
  var FEATHER_DEFS = '';
  // painted feathers nb-feather-1..8 (random pick); the sprite-era feather.png is the fallback
  var nbFeathers = true;
  function featherHTML() { return '<img src="assets/intro/crow/' + (nbFeathers ? 'nb-feather-' + (1 + Math.floor(Math.random() * 8)) + '.webp?v=' + ASSET_VERSION : 'feather.png') + '" alt="" draggable="false">'; }

  // ---------- Small helpers ----------
  function div(cls, parent) {
    var d = document.createElement('div');
    d.className = cls;
    if (parent) parent.appendChild(d);
    return d;
  }
  function isPortrait() { return window.innerHeight > window.innerWidth; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function loadScript(src, ok, fail) {
    var s = document.createElement('script');
    s.src = src; s.async = true; s.onload = ok; s.onerror = fail;
    document.head.appendChild(s);
  }

  // Load AND decode an image so the first animation frames do not stutter. Calls cb(imgElement) or cb(null).
  // decode() can stall in some browsers, so after "load" we wait for it for at most 600ms.
  // Bump ASSET_VERSION whenever you replace intro images, so browsers fetch the new files instead of cached ones.
  var ASSET_VERSION = '2026-10-09e';
  function loadImage(src, cb) {
    src += (src.indexOf('?') < 0 ? '?' : '&') + 'v=' + ASSET_VERSION;
    var img = new Image(), called = false;
    function fin(v) { if (!called) { called = true; cb(v); } }
    img.decoding = 'async';
    img.onerror = function () { fin(null); };
    img.onload = function () {
      if (img.decode) {
        img.decode().then(function () { fin(img); }, function () { fin(img); });
        setTimeout(function () { fin(img); }, 600);
      } else fin(img);
    };
    img.src = src;
  }

  // Position of a "cover" crop: given an image of iw x ih shown in a w x h box with a focus string like
  // '50% 45%', returns { s: scale, x: left offset, y: top offset } of the drawn image.
  function coverBox(iw, ih, w, h, focus) {
    var s = Math.max(w / iw, h / ih), pos = focus.split(/\s+/);
    return { s: s, x: (w - iw * s) * parseFloat(pos[0]) / 100, y: (h - ih * s) * parseFloat(pos[1]) / 100 };
  }

  // Fine static film grain: one small noise tile, generated once, used as a repeating background.
  var grainUrl = null;
  function grainURL() {
    if (grainUrl) return grainUrl;
    try {
      var c = document.createElement('canvas'), n = 128, x = c.getContext('2d'), d = x.createImageData(n, n), i;
      for (i = 0; i < d.data.length; i += 4) { var v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
      x.putImageData(d, 0, 0);
      grainUrl = c.toDataURL('image/png');
    } catch (e) { grainUrl = ''; }
    return grainUrl;
  }

  // The title card. Its default (CSS) state is the FINAL pose; GSAP sets the hidden start poses on the live
  // copy only. opts.band = { img } shows real eye footage as a widescreen band (live copy: a canvas;
  // static copy: the last frame as an <img>); otherwise the drawn Mangekyo. opts.static = copy for the shards
  // (final pose, no grain). opts.rot = rotation of the drawn eye in that final pose.
  function makeEyeScene(opts) {
    opts = opts || {};
    var eye = div('intro-layer intro-eye'), visual;
    div('eye-glow', eye);
    var stage = div('eye-stage', eye);
    if (opts.band) {
      visual = div('eye-band', stage);
      var media = opts.static ? new Image() : document.createElement('canvas');
      if (opts.static) media.src = opts.band.url;
      media.className = 'eye-band-media';
      visual.appendChild(media);
    } else {
      visual = div('eye-wrap', stage);
      visual.innerHTML = EYE_SVG;
      if (opts.static) visual.style.transform = 'rotate(' + (opts.rot || 0) + 'deg)';
    }
    var copy = div('eye-copy', stage);
    var p = document.createElement('p');
    p.className = 'eye-text';
    CONFIG.text.split(' ').forEach(function (w, i) {
      if (i) p.appendChild(document.createTextNode(' '));
      var sp = document.createElement('span'); sp.className = 'w'; sp.textContent = w; p.appendChild(sp);
    });
    copy.appendChild(p);
    div('eye-vig', eye);
    if (!opts.static) {
      var g = div('intro-grain', eye), u = grainURL();
      if (u) g.style.backgroundImage = 'url(' + u + ')';
    }
    return eye;
  }

  // ---------- Finish / cleanup ----------
  function cleanup() {
    if (finished && !overlay.parentNode) return;
    finished = true;
    clearTimeout(safetyTimer); clearTimeout(loadTimer); clearTimeout(spinnerTimer); clearTimeout(skipHintTimer);
    try { if (tl) tl.kill(); } catch (e) {}
    removeSkipListeners();
    root.classList.remove('intro-active', 'intro-flash');
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    try { if (gsap) gsap.set(navLinks, { clearProps: 'all' }); } catch (e) {}
    try { var ht = document.querySelector('.hero-title'), hi = document.querySelector('.hero-imgs'); if (gsap && ht) gsap.set(ht, { clearProps: 'all' });  } catch (e) {}
    try {
      if (prevFocus && prevFocus !== document.body && prevFocus.focus) prevFocus.focus({ preventScroll: true });
      else if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    } catch (e) {}
  }

  function skip() {
    if (finished) return;
    finished = true;
    removeSkipListeners();
    clearTimeout(safetyTimer); clearTimeout(loadTimer); clearTimeout(spinnerTimer); clearTimeout(skipHintTimer);
    if (!gsap) { finished = false; cleanup(); return; }
    try {
      if (tl) tl.kill();
      gsap.to(overlay, { opacity: 0, duration: CONFIG.skipFadeDur, onComplete: function () { finished = false; cleanup(); } });
      // make sure cleanup happens even if the tween misbehaves
      setTimeout(function () { finished = false; cleanup(); }, CONFIG.skipFadeDur * 1000 + 300);
    } catch (e) { finished = false; cleanup(); }
  }

  // The intro counts as "seen" only once it really plays (or the visitor skips it). If it is dropped because the
  // frames were slow to load, the next visit (with the frames now cached) plays it.
  function markSeen() { try { localStorage.setItem(CONFIG.storageKey, '1'); } catch (e) {} }
  function onUserSkip() { markSeen(); skip(); } // any click, key press or touch skips
  var skipEvents = ['click', 'keydown', 'touchstart'];
  function addSkipListeners() { skipEvents.forEach(function (n) { document.addEventListener(n, onUserSkip, true); }); }
  function removeSkipListeners() { skipEvents.forEach(function (n) { document.removeEventListener(n, onUserSkip, true); }); }

  // Remove ?intro=1 and ?at= from the address bar (keeps other params and the #hash),
  // so a reload does not replay the intro.
  function stripIntroParams() {
    try {
      var u = new URL(location.href);
      u.searchParams.delete('intro');
      u.searchParams.delete('at');
      history.replaceState(null, '', u.pathname + u.search + u.hash);
    } catch (e) {}
  }

  // ---------- Shards ----------
  // Cut the screen into triangles on a jittered grid (shared corners => no gaps).
  // Each shard holds a clone of the eye scene (already in its final pose, see build()).
  function makeShards(container, eyeTemplate) {
    var cols = CONFIG.shardCols, rows = CONFIG.shardRows, pts = [], shards = [], r, c;
    for (r = 0; r <= rows; r++) {
      pts[r] = [];
      for (c = 0; c <= cols; c++) {
        var x = c / cols * 100, yy = r / rows * 100;
        if (c > 0 && c < cols) x += (Math.random() - 0.5) * 100 / cols * 0.7;
        if (r > 0 && r < rows) yy += (Math.random() - 0.5) * 100 / rows * 0.7;
        pts[r][c] = [x, yy];
      }
    }
    function addTri(a, b, d) {
      var s = div('intro-shard', container);
      s.style.clipPath = s.style.webkitClipPath =
        'polygon(' + [a, b, d].map(function (p) { return p[0].toFixed(2) + '% ' + p[1].toFixed(2) + '%'; }).join(',') + ')';
      var cx = (a[0] + b[0] + d[0]) / 3, cy = (a[1] + b[1] + d[1]) / 3;
      s.style.transformOrigin = cx.toFixed(2) + '% ' + cy.toFixed(2) + '%';
      s.appendChild(eyeTemplate.cloneNode(true));
      s._cx = cx; s._cy = cy;
      shards.push(s);
    }
    for (r = 0; r < rows; r++) for (c = 0; c < cols; c++) {
      var tl_ = pts[r][c], tr = pts[r][c + 1], bl = pts[r + 1][c], br = pts[r + 1][c + 1];
      if ((r + c) % 2) { addTri(tl_, tr, bl); addTri(tr, br, bl); }
      else { addTri(tl_, tr, br); addTri(tl_, br, bl); }
    }
    return shards;
  }

  // ---------- Main show ----------
  // assets = { frames: [{img, focus, focusMobile, part}], throne: Image }
  function build(assets) {
    var vw = window.innerWidth, vh = window.innerHeight, far = Math.max(vw, vh);
    var portrait = isPortrait();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    // On portrait screens the 16:9 pictures are letterboxed (full width, black above and below, a little
    // above the middle) instead of cropped to a giant blurry detail. Landscape keeps the cover crop.
    var contain = portrait;
    var boxH = contain ? Math.round(vw * FRAME_H / FRAME_W) : vh;           // height of the picture area
    var boxTop = contain ? Math.round((vh - boxH) * 0.45) : 0;               // and where it sits
    function area(el) { // make a layer cover just the picture area
      if (contain) { el.style.top = boxTop + 'px'; el.style.height = boxH + 'px'; el.classList.add('intro-contain'); }
      el.style.overflow = 'hidden';
      return el;
    }

    // Layers, bottom to top: frame canvas, eye, shards, crows
    var JT = CONFIG.jitter;
    var seqWrap = area(div('intro-layer intro-seq', overlay)); // frame sequence area (fades / pushes in as one)
    var canvas = document.createElement('canvas');
    canvas.className = 'intro-canvas';
    seqWrap.appendChild(canvas);
    if (contain) div('intro-vignette', seqWrap);
    var END_ROT = 40;
    var eFrames = assets.eyeFrames, hasBand = !!eFrames;
    var eye = makeEyeScene({ band: hasBand ? {} : null });
    overlay.appendChild(eye);
    var eyeVisual = eye.querySelector(hasBand ? '.eye-band' : '.eye-wrap');
    var eyeWords = eye.querySelectorAll('.eye-text .w');

    // Eye footage (optional): drawn on a canvas inside the band, cropped around the pupil and colour-graded
    // so the very bright white of the source becomes a dark rose-grey while the iris still glows.
    var eyeCanvas = hasBand ? eye.querySelector('.eye-band-media') : null, eyeCtx = null, eyeTmp = null, eyeTmpCtx = null;
    var ES = CONFIG.eyeSeq;
    function sizeEye() {
      if (!eyeCanvas) return;
      var bw = Math.min(1200, vw);
      eyeCanvas.width = Math.round(bw * dpr); eyeCanvas.height = Math.round(bw / ES.aspect * dpr);
      eyeTmp = null;
    }
    function drawEye(i) {
      var img = eFrames && eFrames[i];
      if (!eyeCanvas || !img) return;
      var W = eyeCanvas.width, H = eyeCanvas.height, iw = img.naturalWidth, ih = img.naturalHeight;
      var sc = Math.max(W / iw, H / ih) * ES.zoom;
      var u = i < ES.intro ? i / Math.max(1, ES.intro - 1) : 0; // the pupil drifts during the first frames
      var fx = i < ES.intro ? ES.pupilStart[0] + (ES.pupilEnd[0] - ES.pupilStart[0]) * u : ES.pupil[0], fy = ES.pupil[1];
      var dx = clamp(W / 2 - fx * iw * sc, W - iw * sc, 0), dy = clamp(H / 2 - fy * ih * sc, H - ih * sc, 0);
      eyeCtx = eyeCtx || eyeCanvas.getContext('2d');
      var x = eyeCtx, px = dx + fx * iw * sc, py = dy + fy * ih * sc, R = iw * sc * (i < ES.intro ? 0.1 : 0.135); // the iris is smaller during the activation frames
      x.globalCompositeOperation = 'source-over';
      x.clearRect(0, 0, W, H);
      x.drawImage(img, dx, dy, iw * sc, ih * sc);
      // grade 1: multiply with a dark rose, so white turns into a dark desaturated grey-rose
      x.globalCompositeOperation = 'multiply';
      x.fillStyle = '#3d222b';
      x.fillRect(0, 0, W, H);
      // grade 2: bring the iris back at (almost) full brightness through a soft round mask, so it glows
      if (!eyeTmp) { eyeTmp = document.createElement('canvas'); eyeTmp.width = W; eyeTmp.height = H; eyeTmpCtx = eyeTmp.getContext('2d'); }
      var t = eyeTmpCtx;
      t.globalCompositeOperation = 'source-over';
      t.clearRect(0, 0, W, H);
      t.drawImage(img, dx, dy, iw * sc, ih * sc);
      var g = t.createRadialGradient(px, py, 0, px, py, R);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.88, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      t.globalCompositeOperation = 'destination-in';
      t.fillStyle = g; t.fillRect(0, 0, W, H);
      x.globalCompositeOperation = 'source-over';
      x.drawImage(eyeTmp, 0, 0);
      // grade 3: feather the edges into the black with a soft elliptical mask (no box, no border)
      x.globalCompositeOperation = 'destination-in';
      x.save(); x.translate(W / 2, H / 2); x.scale(1, H / W);
      var m = x.createRadialGradient(0, 0, 0, 0, 0, W / 2);
      m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(0.42, 'rgba(0,0,0,1)'); m.addColorStop(0.72, 'rgba(0,0,0,.45)'); m.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = m; x.fillRect(-W / 2, -W / 2, W, W);
      x.restore();
      x.globalCompositeOperation = 'source-over';
    }
    // which frame is showing at `t` seconds after the card appears: the activation once, then a ping-pong loop
    var introN = Math.min(ES.intro, eFrames ? eFrames.length : 0), loopN = eFrames ? eFrames.length - introN : 0;
    function eyeIndexAt(t) {
      if (t < introN / ES.introFps) return Math.floor(t * ES.introFps);
      if (loopN < 2) return introN;
      var k = Math.floor((t - introN / ES.introFps) * ES.loopFps) % (2 * (loopN - 1));
      return introN + (k < loopN ? k : 2 * (loopN - 1) - k);
    }
    sizeEye();
    var eyeBandUrl = '';
    if (hasBand) { // the shards show the card as it looks when the glass breaks (a still of the graded frame)
      drawEye(eyeIndexAt(CONFIG.eyeHold - 0.1));
      try { eyeBandUrl = eyeCanvas.toDataURL('image/png'); } catch (e) {}
      drawEye(0);
    }

    // Jitter copies of the eye (made once, from the frame that is showing when the jitter happens): horizontal slices,
    // and a red-only + a cyan-only copy for the RGB split. All hidden until the jitter.
    var jBands = [], jR = null, jC = null, eyeBase = eyeVisual.className;
    if (hasBand && JT.bands) {
      drawEye(eyeIndexAt(JT.at + 0.1));
      var snap = document.createElement('canvas'); snap.width = eyeCanvas.width; snap.height = eyeCanvas.height;
      snap.getContext('2d').drawImage(eyeCanvas, 0, 0);
      var copyOf = function () { var c = document.createElement('canvas'); c.width = snap.width; c.height = snap.height; c.getContext('2d').drawImage(snap, 0, 0); c.className = 'eye-jit'; eyeVisual.appendChild(c); return c; };
      for (i = 0; i < JT.bands; i++) {
        var jb = copyOf(), jtp = 20 + Math.random() * 55, jh = 3 + Math.random() * 8;
        jb.style.clipPath = 'inset(' + jtp.toFixed(1) + '% 0 ' + Math.max(0, 100 - jtp - jh).toFixed(1) + '% 0)';
        jBands.push(jb);
      }
      try {
        var sw = snap.width, sh = snap.height, sd = snap.getContext('2d').getImageData(0, 0, sw, sh), sdd = sd.data;
        var ir = new ImageData(sw, sh), ic = new ImageData(sw, sh);
        for (var q = 0; q < sdd.length; q += 4) {
          ir.data[q] = sdd[q]; ir.data[q + 3] = sdd[q + 3];
          ic.data[q + 1] = sdd[q + 1]; ic.data[q + 2] = sdd[q + 2]; ic.data[q + 3] = sdd[q + 3];
        }
        [ir, ic].forEach(function (idat, n) {
          var cv = document.createElement('canvas'); cv.width = sw; cv.height = sh; cv.getContext('2d').putImageData(idat, 0, 0);
          cv.className = 'eye-jit eye-jit-split'; eyeVisual.appendChild(cv); if (n) jC = cv; else jR = cv;
        });
      } catch (e) { jR = jC = null; }
      drawEye(0);
    }
    eyeVisual.className = eyeBase + ' bw'; // starts in black and white (a static class: the filter value is never animated)

    // Shards clone the title card in its FINAL pose, because that is what is on screen when the shatter starts.
    var shardBox = div('intro-layer', overlay);
    var shards = makeShards(shardBox, makeEyeScene({ band: hasBand ? { url: eyeBandUrl } : null, static: true, rot: END_ROT }));

    var crowBox = div('intro-layer intro-crows', overlay);
    crowBox.insertAdjacentHTML('beforeend', FEATHER_DEFS);
    if (skipBtn) overlay.appendChild(skipBtn); // keep the skip button on top

    // ----- canvas drawing (cover-fit, focal point, devicePixelRatio aware) -----
    var ctx = canvas.getContext('2d', { alpha: false });
    var current = null;
    function sizeCanvas() {
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round((contain ? boxH : window.innerHeight) * dpr);
    }
    function draw(f) {
      if (!f || !f.img) return;
      current = f;
      var b = coverBox(FRAME_W, FRAME_H, canvas.width, canvas.height, portrait ? f.focusMobile : f.focus);
      ctx.drawImage(f.img, b.x, b.y, FRAME_W * b.s, FRAME_H * b.s);
    }
    sizeCanvas();
    function onResize() { sizeCanvas(); draw(current); }
    window.addEventListener('resize', onResize);

    // Split the frames into the part before and after the cut to the dissolve
    var partA = [], partB = [];
    assets.frames.forEach(function (f) { (f.part === 2 ? partB : partA).push(f); });
    var durA = partA.length / CONFIG.fps, durB = partB.length / CONFIG.fps;
    draw(partA[0]);

    // ----- schedule (seconds of the natural timeline; scaled to totalDuration at the end) -----
    var T_B = durA;                                  // dissolve starts
    var T_E = durA + durB - CONFIG.eyeOverlap;       // eye appears
    var T_S = T_E + CONFIG.eyeHold;                  // glass shatters
    var BASE = T_S + CONFIG.shatterStagger + CONFIG.shatterDur + 0.05;      // natural end (the overlay is removed)
    var k = BASE / CONFIG.totalDuration;

    gsap.set([eye, shardBox], { autoAlpha: 0 });
    // hidden start poses of the title card (its CSS default is the final pose)
    gsap.set(eyeWords, { autoAlpha: 0, y: 8, filter: 'blur(6px)' });
    gsap.set(eyeVisual, { autoAlpha: 0 });
    gsap.set(jBands.concat(jR ? [jR, jC] : []), { opacity: 0 });
    gsap.set(seqWrap, { autoAlpha: 0, scale: 1, force3D: true });

    var heroTitle = document.querySelector('.hero-title');
    var isDark = root.getAttribute('data-theme') === 'dark';

    tl = gsap.timeline({ paused: true, onComplete: preview ? null : cleanup });

    function count(n) { return Math.max(0, Math.round(n * CONFIG.crowDensity)); }

    // ----- crows (sprite sheet: 8 flap frames, facing right) -----
    // width = approximate visible body width in px. Small crows flap faster than big ones.
    function makeCrow(width, redEye, pose) {
      if (pose && NB[pose]) { // painted single pose: no flap cycle, so it flutters a little (calm wingbeat bob) instead
        var cn = div('intro-crow-nb', crowBox), im = NB[pose].cloneNode();
        im.className = 'nb-img'; im.style.animationDelay = (-Math.random() * 0.3).toFixed(2) + 's';
        cn.style.width = width + 'px'; cn.appendChild(im); return cn;
      }
      var c = div('intro-crow', crowBox), w = width * 1.5; // sprite frame is wider than the bird
      c.style.setProperty('--w', w.toFixed(1) + 'px');
      c.style.setProperty('--ratio', (CONFIG.crowFrame.h / CONFIG.crowFrame.w).toFixed(4));
      c.style.setProperty('--flap', ((0.5 + width / 1200) / CONFIG.flapSpeed).toFixed(3) + 's');
      c.style.setProperty('--phase', (-Math.random()).toFixed(2));
      // (the red eye is part of the crow sprite now)
      return c;
    }
    // A crow flying along a curved path through the waypoints `pts` ([[x,y],...]) in screen px.
    // It appears at time t, takes `dur` seconds, grows s0 -> s1, banks toward its direction of travel and
    // fades out at the end. The art faces right; for leftward travel it is mirrored (scaleX < 0).
    function flight(width, t, dur, pts, s0, s1, ease, extraClass, redEye, pose) {
      var c = makeCrow(width, redEye, pose);
      if (extraClass) c.classList.add(extraClass);
      var n = pts.length, sign = pts[n - 1][0] >= pts[0][0] ? 1 : -1;
      var flip = (pose === 3 || pose === 5 || pose === 7) ? -1 : 1; // these painted poses face LEFT
      var xs = [], ys = [], sx = [], sy = [], rs = [], i;
      for (i = 0; i < n; i++) {
        var p0 = pts[Math.max(i - 1, 0)], p1 = pts[Math.min(i + 1, n - 1)];
        var bank = clamp(Math.atan2(p1[1] - p0[1], (p1[0] - p0[0]) * sign) * 180 / Math.PI, -65, 65);
        var sc = s0 + (s1 - s0) * i / (n - 1);
        xs.push(pts[i][0]); ys.push(pts[i][1]); sx.push(sign * flip * sc); sy.push(sc); rs.push(sign > 0 ? bank : -bank);
      }
      gsap.set(c, { xPercent: -50, yPercent: -50, x: xs[0], y: ys[0], scaleX: sx[0], scaleY: sy[0], rotation: rs[0], autoAlpha: 0, force3D: true });
      tl.set(c, { autoAlpha: 0.02 }, t); // near-invisible for a moment, then fades in as it grows
      tl.to(c, { opacity: 1, duration: 0.06, ease: 'none', immediateRender: false }, t + 0.03);
      // keyframe arrays list the waypoints AFTER the start position
      tl.to(c, { keyframes: { x: xs.slice(1), y: ys.slice(1), scaleX: sx.slice(1), scaleY: sy.slice(1), rotation: rs.slice(1), easeEach: 'none' },
                 ease: ease, duration: dur, immediateRender: false }, t);
      tl.to(c, { opacity: 0, duration: dur * 0.2, ease: 'none', immediateRender: false }, t + dur * 0.8);
      return c;
    }
    // Points along a quadratic curve from a to b that bows sideways by `bend` (fraction of the distance).
    function arc(a, b, bend, n) {
      var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
      var cx = mx - dy * bend, cy = my + dx * bend, out = [];
      for (var j = 0; j < n; j++) {
        var u = j / (n - 1), v = 1 - u;
        out.push([v * v * a[0] + 2 * v * u * cx + u * u * b[0], v * v * a[1] + 2 * v * u * cy + u * u * b[1]]);
      }
      return out;
    }
    // Curved flight from a to b with a random bow (either side).
    function swoop(width, t, dur, a, b, s0, s1, ease, extraClass, redEye, pose) {
      return flight(width, t, dur, arc(a, b, rand(0.15, 0.4) * (Math.random() < 0.5 ? -1 : 1), 7), s0, s1, ease, extraClass, redEye, pose);
    }
    // Points on a circle (centre cx,cy, radius r) from screen angle a0 to a1 (degrees, y points down).
    function circle(cx, cy, r, a0, a1, n) {
      var out = [];
      for (var j = 0; j < n; j++) {
        var an = (a0 + (a1 - a0) * j / (n - 1)) * Math.PI / 180;
        out.push([cx + Math.cos(an) * r, cy + Math.sin(an) * r]);
      }
      return out;
    }
    // A point on the screen edge (or just beyond) on the given side, at random position.
    function edge(side, m) {
      if (side === 'l') return [-m, rand(0.05, 0.95) * vh];
      if (side === 'r') return [vw + m, rand(0.05, 0.95) * vh];
      if (side === 't') return [rand(0.05, 0.95) * vw, -m];
      return [rand(0.05, 0.95) * vw, vh + m];
    }
    var SIDES = ['l', 'r', 't', 'b'];
    // A loose black feather at (x0,y0) that starts falling at time t: falls slowly, x sways on a sine wave,
    // rotation swings like a pendulum. It may outlive the beat that spawned it (the overlay fade ends it).
    function feather(t, x0, y0) {
      var dur = Math.min(CONFIG.featherLinger * rand(0.78, 1.25), BASE - t - 0.05);
      if (dur < 0.3) return;
      var f = div('intro-feather', crowBox), h = rand(24, 70) * ms;   // mixed sizes, 24-70px tall
      f.innerHTML = featherHTML();
      f.style.height = h + 'px';
      var amp = rand(25, 70), per = rand(0.6, 1.0), swing = rand(30, 60) * (Math.random() < 0.5 ? -1 : 1);
      var rep = Math.max(0, Math.floor(dur / per) - 1); // finite repeats so the timeline can seek
      gsap.set(f, { xPercent: -50, yPercent: -50, x: x0 - amp, y: y0, rotation: -swing, autoAlpha: 0, force3D: true });
      tl.set(f, { autoAlpha: 1 }, t);
      tl.to(f, { y: y0 + vh * rand(0.35, 0.6), duration: dur, ease: 'none', immediateRender: false }, t);
      tl.to(f, { x: x0 + amp, duration: per, ease: 'sine.inOut', repeat: rep, yoyo: true, immediateRender: false }, t);
      tl.to(f, { rotation: swing, duration: per, ease: 'sine.inOut', repeat: rep, yoyo: true, immediateRender: false }, t);
      tl.to(f, { opacity: 0, duration: dur * 0.25, ease: 'none', immediateRender: false }, t + dur * 0.75);
    }
    // n feathers spawned over a region of the screen (fractions of width/height) between times t and t+spread.
    function featherBurst(t, spread, n, x0, x1, y0, y1) {
      for (var j = 0; j < n; j++) feather(t + Math.random() * spread, vw * rand(x0, x1), vh * rand(y0, y1));
    }
    var i, a, side;
    var ms = clamp(vw / 1280, 0.6, 1); // crow size factor: smaller screens get proportionally smaller crows

    // ---- Beats 1 + 2: the frame sequences, driven by GSAP (so preview/seek works) ----
    var proxyA = { f: 0 }, proxyB = { f: 0 };
    tl.fromTo(seqWrap, { autoAlpha: 0 }, { autoAlpha: 1, duration: CONFIG.fadeIn, ease: 'power2.out', immediateRender: true }, 0);
    tl.fromTo(seqWrap, { scale: 1 }, { scale: CONFIG.pushIn, duration: durA, ease: 'none', force3D: true, immediateRender: false }, 0);
    tl.to(proxyA, { f: partA.length, duration: durA, ease: 'none', immediateRender: false,
                    onUpdate: function () { draw(partA[Math.min(partA.length - 1, Math.floor(proxyA.f))]); } }, 0);
    tl.set(seqWrap, { scale: 1 }, T_B); // no push-in for the dissolve shot
    // soften the hard cut close-up -> wide shot: the footage dips to half brightness just before and recovers just after
    // (the overlay is black underneath, so fading opacity darkens it; tweens, so it also works when seeking)
    tl.to(seqWrap, { opacity: 0.5, duration: 0.08, ease: 'power1.in', immediateRender: false }, T_B - 0.08);
    tl.to(seqWrap, { opacity: 1, duration: 0.15, ease: 'power1.out', immediateRender: false }, T_B);
    // drop the decoded frames of a finished sequence so the browser can reclaim the memory
    function release(list) { list.forEach(function (f) { f.img = null; f.same = null; }); }
    tl.call(function () { release(partA); }, null, T_B + 0.02);
    tl.to(proxyB, { f: partB.length, duration: durB, ease: 'none', immediateRender: false,
                    onUpdate: function () { draw(partB[Math.min(partB.length - 1, Math.floor(proxyB.f))]); } }, T_B);

    // Itachi's body tears apart into crows: a few BIG ones burst out of the face and torso. Two or three fly
    // straight at the camera and grow huge; the rest fly away or sideways at mid / foreground size.
    var db = coverBox(FRAME_W, FRAME_H, vw, vh, portrait ? partB[0].focusMobile : partB[0].focus);
    var nD = count(CONFIG.dissolveCrows), nToward = Math.min(nD, nD > 5 ? 3 : 2);
    function bodySpot() {
      return [clamp(db.x + FRAME_W * db.s * rand(0.4, 0.6), vw * 0.1, vw * 0.9), clamp(db.y + FRAME_H * db.s * rand(0.12, 0.85), vh * 0.1, vh * 0.9)];
    }
    if (NB[1] && NB[2] && NB[3] && NB[4] && NB[5]) {
      // The anime footage already carries the dissolve (its own flat black crows burst out of his body), so NO painted
      // crow is spawned over him. Painted crows are a short FOREGROUND pass instead: as the anime crows fill the frame
      // they rush past the camera, which bridges the footage going dark into the title card. All are gone by T_E + 0.25.
      var W = function (a, b) { return rand(a, b) * ms; }, P, tF = T_B + 0.5, tEnd = T_E + 0.2, nBig = Math.min(2, Math.max(1, count(2)));
      // big crows (wings spread, facing us) start mid-size near the centre and rush past the camera, exiting different sides
      var sd = ['l', 'r']; if (Math.random() < 0.5) sd.reverse();
      for (i = 0; i < nBig; i++) {
        P = [vw * rand(0.4, 0.6), vh * rand(0.4, 0.55)];
        swoop(W(260, 340), tF + i * 0.2, Math.min(0.75, tEnd - tF - i * 0.2), P, edge(sd[i], far * 0.6), 0.45, 4, 'power2.in', 'nb-blur', false, 1);
      }
      // mid-size crows cross from the body area out to the screen edges (one glides, one dives)
      if (count(2) > 0) {
        P = bodySpot(); swoop(W(240, 340), tF, Math.min(0.85, tEnd - tF), P, [vw + 250, P[1] - vh * 0.25], 0.7, 1.2, 'power1.in', null, false, 4);
        P = bodySpot(); swoop(W(260, 360), tF + 0.2, Math.min(0.8, tEnd - tF - 0.2), P, [-250, vh + 150], 0.7, 1.3, 'power1.in', null, false, 2);
      }
    } else for (i = 0; i < nD; i++) {
      var sx0 = db.x + FRAME_W * db.s * rand(0.4, 0.6), sy0 = db.y + FRAME_H * db.s * rand(0.12, 0.85);
      sx0 = clamp(sx0, vw * 0.1, vw * 0.9); sy0 = clamp(sy0, vh * 0.1, vh * 0.9);
      var ang = Math.atan2(sy0 - vh * 0.5, sx0 - vw * 0.5 + rand(-40, 40)) + rand(-1.1, 1.1) + (Math.random() < 0.5 ? 0 : Math.PI * 0.5 * (Math.random() < 0.5 ? -1 : 1));
      var toward = i < nToward, reach = toward ? far * rand(0.9, 1.3) : far * rand(0.4, 0.7);
      var cw = toward ? 160 * ms : rand(160, 400) * ms, ct = T_B + 0.7 + (i / nD) * 0.4, cdur = rand(0.9, 1.2);
      var cend = [sx0 + Math.cos(ang) * reach, sy0 + Math.sin(ang) * reach];
      swoop(cw, ct, cdur, [sx0, sy0], cend, toward ? 0.6 : 0.8, toward ? rand(3.5, 5) : rand(1, 1.3), toward ? 'power1.inOut' : 'power1.out', null);
    }
    // a modest feather drift at the screen edges; gone before the title text appears
    featherBurst(T_B + 0.4, 0.45, Math.round(CONFIG.featherCount * 0.3), 0.03, 0.22, 0.05, 0.6);
    featherBurst(T_B + 0.4, 0.45, Math.round(CONFIG.featherCount * 0.3), 0.78, 0.97, 0.05, 0.6);
    featherBurst(T_B + 0.7, 0.4, Math.round(CONFIG.featherCount * 0.4), 0.38, 0.62, 0.2, 0.6); // around his face and torso, only once the anime crows have appeared

    // ---- Beat 3: the title card comes up out of the black ----
    tl.to(eye, { autoAlpha: 1, duration: CONFIG.eyeFade, ease: 'power2.out' }, T_E);
    tl.set(seqWrap, { autoAlpha: 0 }, T_E + CONFIG.eyeFade);
    tl.call(function () { release(partB); current = null; }, null, T_E + CONFIG.eyeFade + 0.02); // hidden under the card now (saves GPU work)
    tl.to(eyeVisual, { autoAlpha: 1, duration: 0.7, ease: 'power2.out' }, T_E + 0.1);
    if (hasBand) {
      // real footage: slow 1.04 -> 1 scale; frames chosen from the time (activation, then ping-pong loop)
      var proxyE = { t: 0 };
      tl.fromTo(eyeVisual, { scale: 1.04 }, { scale: 1, duration: T_S - T_E, ease: 'power2.out', force3D: true, immediateRender: false }, T_E);
      tl.to(proxyE, { t: T_S - T_E - 0.1, duration: T_S - T_E - 0.1, ease: 'none', immediateRender: false,
                      onUpdate: function () { drawEye(eyeIndexAt(proxyE.t)); } }, T_E + 0.1);
      drawEye(0);
    } else {
      // drawn Mangekyo: a slow, eased turn that settles into a gentle idle spin
      tl.fromTo(eyeVisual, { scale: CONFIG.eyeScaleFrom }, { scale: 1, duration: 1.4, ease: 'power2.out', force3D: true, immediateRender: false }, T_E);
      // Custom ease: decelerates but keeps ~15% of its speed at the end, so it never stops dead.
      var idleEase = function (t) { return 0.85 * (1 - Math.pow(1 - t, 3)) + 0.15 * t; };
      tl.fromTo(eyeVisual, { rotation: END_ROT - CONFIG.eyeSpinDegrees }, { rotation: END_ROT, duration: T_S - T_E, ease: idleEase, force3D: true, immediateRender: false }, T_E);
    }
    // the jitter from black and white to full colour: irregular flicker of the static class, glitch slices, RGB split, tiny shake
    var tj = T_E + JT.at;
    JT.steps.forEach(function (dur, n2) {
      var color = n2 % 2 === 0 || n2 === JT.steps.length - 1, final = n2 === JT.steps.length - 1;
      tl.set(eyeVisual, { className: eyeBase + (color ? '' : ' bw'), immediateRender: false }, tj);
      jBands.forEach(function (bd) {
        if (!final && Math.random() < 0.75) tl.set(bd, { opacity: 1, x: rand(JT.bandShift[0], JT.bandShift[1]) * (Math.random() < 0.5 ? -1 : 1), immediateRender: false }, tj);
        else tl.set(bd, { opacity: 0, x: 0, immediateRender: false }, tj);
      });
      if (jR) {
        var split = !final && JT.rgbOn.indexOf(n2) >= 0;
        tl.set(jR, { opacity: split ? 0.75 : 0, x: -JT.rgbSplit, immediateRender: false }, tj);
        tl.set(jC, { opacity: split ? 0.75 : 0, x: JT.rgbSplit, immediateRender: false }, tj);
      }
      tl.set(eyeVisual, { x: final ? 0 : rand(-JT.shake, JT.shake), immediateRender: false }, tj);
      tj += dur;
    });
    // typography: kicker, hairline rule growing from the centre, the line word by word
    tl.to(eyeWords, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.6, stagger: CONFIG.wordStagger, ease: 'power2.out', immediateRender: false, clearProps: 'filter' }, T_E + 0.65);
    // ---- Beat 4: the genjutsu breaks. Shards fly outward, heavy and slow to start ----
    var S = T_S;
    tl.set(eye, { autoAlpha: 0 }, S);
    tl.set(shardBox, { autoAlpha: 1 }, S);
    tl.set(shards, { willChange: 'transform, opacity' }, S);
    shards.forEach(function (s) {
      var dx = (s._cx - 50) / 50, dy = (s._cy - 50) / 50;
      var dist = Math.sqrt(dx * dx + dy * dy), len = dist || 0.3;
      tl.to(s, {
        x: dx / len * far * rand(0.6, 1) + rand(-40, 40),
        y: dy / len * far * rand(0.6, 1) + rand(-40, 40) + far * 0.2,
        rotation: rand(-50, 50),
        scale: rand(0.6, 0.9),
        autoAlpha: 0,
        duration: CONFIG.shatterDur,
        ease: 'power3.in',
        force3D: true,
        immediateRender: false
      }, S + CONFIG.shatterStagger * Math.min(dist, 1.4) / 1.4);
    });
    // A few large crows scatter outward from the centre, off screen
    for (i = 0; i < count(CONFIG.shatterCrows); i++) {
      a = Math.random() * Math.PI * 2;
      var ex = vw / 2 + Math.cos(a) * far * rand(0.8, 1.1), ey = vh / 2 + Math.sin(a) * far * rand(0.8, 1.1);
      // painted poses when available (glide / wings-spread), like the dissolve crows; the sprite otherwise
      swoop(rand(180, 320) * ms, S + 0.05 + i * 0.08, rand(0.8, 1.0), [vw / 2 + rand(-60, 60), vh / 2 + rand(-40, 40)], [ex, ey], 0.5, rand(1.2, 1.8), 'power2.in', null, false, NB[4] && NB[1] ? [4, 1, 4][i % 3] : undefined);
    }
    // ---- Beat 5: the shards fly away and the homepage (already rendered under the overlay) is revealed: the black
    // fades out, the nav + name fade in, then the overlay is removed. ----
    tl.to(overlay, { backgroundColor: 'rgba(0,0,0,0)', duration: CONFIG.revealFade, ease: 'power2.inOut' }, S);
    if (skipBtn) tl.to(skipBtn, { opacity: 0, duration: 0.4 }, S);
    if (heroTitle) tl.from(heroTitle, { y: 14, autoAlpha: 0, duration: 0.8, ease: 'power2.out' }, S + 0.25);
    if (navLinks.length) tl.from(navLinks, { y: -14, autoAlpha: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }, S + 0.3);
    // pad so the timeline lasts exactly the natural length
    tl.set({}, {}, BASE);
    tl.timeScale(k);

    if (preview) {
      // Preview mode: jump to the requested real-seconds time and hold there.
      tl.time(Math.min(previewAt * k, BASE));
    } else {
      // Start on the next animation frame, after the browser has laid out and painted the new DOM,
      // so the first frames do not carry the build cost.
      requestAnimationFrame(function () { if (!finished && tl) { markSeen(); tl.play(0); } });
    }
  }

  // ---------- Loading everything the intro needs ----------
  // GSAP (a ~70 KB script) and all the images load IN PARALLEL, both started at boot. The show starts (go) once BOTH
  // are ready; the time budget runs from boot, not from when GSAP arrives.

  // Called once GSAP is available.
  function onGsap() {
    try {
      gsap = window.gsap;
      if (!gsap) throw new Error('no gsap');
      if (finished) return; // visitor already skipped (or the budget ran out) while GSAP was loading
      if (!playing) { runFlash(); return; }
      gsap.ticker.lagSmoothing(0); // do not skip ahead after a slow frame
      go();
    } catch (err) {
      console.warn('Intro failed:', err);
      cleanup();
    }
  }

  // Tiny spinning tomoe, only if loading takes a while (started at boot, so it also covers the GSAP download)
  function showSpinner() {
    if (finished || started || overlay.querySelector('.intro-spinner')) return;
    var sp = div('intro-spinner', overlay);
    sp.innerHTML = '<svg viewBox="-12 -12 24 24" aria-hidden="true"><g fill="#b3001b"><circle r="2.2"/>' +
      '<g id="sp-t"><circle cx="0" cy="-7" r="2.2"/><path d="M-2.2,-7C-2.2,-10 1,-11.5 3.6,-9.6C1.5,-10 0.6,-8.6 2.2,-7Z"/></g>' +
      '<use href="#sp-t" transform="rotate(120)"/><use href="#sp-t" transform="rotate(240)"/></g></svg>';
  }

  // Start the show once GSAP and every asset are ready (called by both loaders; whichever finishes last wins).
  // A required asset that failed needs no GSAP: skip at once.
  function go() {
    if (started || finished || !assetsReady) return;
    if (!gsap && !failed) return; // still waiting for GSAP
    started = true;
    clearTimeout(loadTimer); clearTimeout(spinnerTimer);
    var sp = overlay.querySelector('.intro-spinner');
    if (sp && sp.parentNode) sp.parentNode.removeChild(sp);
    if (failed) { console.warn('Intro skipped: some assets could not be loaded.'); cleanup(); return; }
    frames.forEach(function (f) { if (f.same) f.img = f.same.img; });
    try { build({ frames: frames, eyeFrames: (eyeImgs.length && !eyeFailed) ? eyeImgs : null }); } catch (err) { console.warn('Intro failed:', err); cleanup(); }
  }

  // Load all the images (no GSAP needed). Sets assetsReady and calls go() when the last one is in.
  function loadAssets() {
    // Small screens get the small (960 px) frames: less memory and bandwidth
    var dpr0 = Math.min(window.devicePixelRatio || 1, 2);
    var longest = Math.max(window.innerWidth, window.innerHeight) * dpr0;
    var small = isPortrait() || longest < 1500;
    var hd = !small && longest >= 2200 && CONFIG.dirs.hd;
    var base = small ? CONFIG.dirs.small : (hd ? CONFIG.dirs.hd : CONFIG.dirs.full);

    // Build the list of everything to load
    var jobs = [], pending = 0;
    CONFIG.sequences.forEach(function (seq) {
      seq.ids.forEach(function (id, idx) {
        var entry = { img: null, focus: seq.focus, focusMobile: seq.focusMobile, part: seq.part || 1 };
        frames.push(entry);
        jobs.push({ src: base + seq.file + (id < 10 ? '0' + id : id) + '.webp', set: function (img) { entry.img = img; } });
        if (idx === seq.ids.length - 1) {
          for (var h = 0; h < seq.holdLast; h++) frames.push({ img: null, same: entry, focus: seq.focus, focusMobile: seq.focusMobile, part: seq.part || 1 });
        }
      });
    });
    jobs.push({ src: CONFIG.crowSprite, set: function () {} });
    // painted crow poses (nb-crow-1..6) and feathers: if any pose fails, the sprite crows are used instead
    var nbFailed = false;
    for (var np = 1; np <= 6; np++) (function (n) { jobs.push({ src: 'assets/intro/crow/nb-crow-' + n + '.webp', optional: 'nb', set: function (img) { NB[n] = img; } }); })(np);
    for (var nf = 1; nf <= 8; nf++) jobs.push({ src: 'assets/intro/crow/nb-feather-' + nf + '.webp', optional: 'feather', set: function () {} });
    // optional eye footage: a failure here just means "use the drawn Mangekyo"
    CONFIG.eyeSeq.ids.forEach(function (id, idx) {
      jobs.push({ src: base + CONFIG.eyeSeq.file + (id < 10 ? '0' + id : id) + '.webp', optional: true, set: function (img) { eyeImgs[idx] = img; } });
    });
    pending = jobs.length;

    jobs.forEach(function (j) {
      function done(img) {
        if (!img) { if (j.optional === 'nb') { NB = {}; } else if (j.optional === 'feather') { nbFeathers = false; } else if (j.optional) eyeFailed = true; else failed = true; } else j.set(img);
        if (--pending === 0) { assetsReady = true; go(); }
      }
      loadImage(j.src, function (img) {
        // a missing sharp (hd) frame falls back to the normal one
        if (!img && hd && j.src.indexOf(CONFIG.dirs.hd) === 0) loadImage(j.src.replace(CONFIG.dirs.hd, CONFIG.dirs.full), done);
        else done(img);
      });
    });
  }

  function runFlash() {
    try {
      gsap = window.gsap;
      if (!gsap) throw new Error('no gsap');
      root.classList.add('intro-flash');
      if (skipBtn) skipBtn.style.display = 'none';
      var eye = makeEyeScene();
      ['.eye-copy', '.eye-kanji', '.intro-grain'].forEach(function (q) { var n = eye.querySelector(q); if (n) n.style.display = 'none'; });
      overlay.appendChild(eye);
      tl = gsap.timeline({ onComplete: cleanup });
      tl.fromTo(eye, { opacity: 0 }, { opacity: 1, duration: CONFIG.flashDuration * 0.3 })
        .fromTo(eye.querySelector('.eye-wrap'), { rotation: -180 }, { rotation: 0, duration: CONFIG.flashDuration, ease: 'power2.out' }, 0)
        .to(eye, { opacity: 0, duration: CONFIG.flashDuration * 0.5 }, CONFIG.flashDuration * 0.5);
    } catch (err) { cleanup(); }
  }

  // ---------- Boot ----------
  // An explicit replay (?intro=1) gets the long loading budget. Read it BEFORE stripIntroParams() removes it from the URL.
  var forced = /[?&]intro=1(&|$)/.test(location.search);
  var budget = forced ? CONFIG.loadMaxForced : CONFIG.loadMax; // ms, counted from now
  if (!preview) safetyTimer = setTimeout(cleanup, budget + (CONFIG.totalDuration + CONFIG.safetyExtra) * 1000);
  if (playing && !preview) {
    // Tidy the URL, then attach skip handling immediately so the visitor can skip even while GSAP/images load.
    // (The "seen" flag is set by markSeen() once the intro really starts, or when it is skipped.)
    stripIntroParams();
    addSkipListeners();
    if (skipBtn) { try { skipBtn.focus({ preventScroll: true }); } catch (e) {} }
    // a small "Skip intro" hint fades in bottom-right after 1.5 s (also while a slow load shows the spinner); never in preview mode
    skipHintTimer = setTimeout(function () { overlay.classList.add('show-skip'); }, 1500);
  }
  if (playing) {
    spinnerTimer = setTimeout(showSpinner, CONFIG.spinnerAfter);
    // GSAP and the images are not ready in time: skip the intro (the site is already rendered underneath)
    if (!preview) loadTimer = setTimeout(function () {
      if (started) return;
      started = true; failed = true;
      console.warn('Intro skipped: assets took too long to load.');
      cleanup();
    }, budget);
  }
  // GSAP first (self-hosted; if that fails, the CDN copy), then straight away the images, in parallel.
  // Returning visitors (flash) only need GSAP, no frames.
  if (window.gsap) onGsap();
  else loadScript(CONFIG.gsapUrl, onGsap, function () {
    loadScript(CONFIG.gsapFallbackUrl, onGsap, function () { finished = false; cleanup(); });
  });
  if (playing) loadAssets();
})();
