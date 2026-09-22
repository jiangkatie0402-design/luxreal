/* ============================================================
   LuxReal cinematic intro (~5s projector-beam sweep over the hero).
   Self-contained: deleting intro.css + intro.js and their two
   <link>/<script> references in index.html fully restores the page.
   ============================================================ */
(function () {
  'use strict';

  // ---------------------------------------------------------------
  // CONFIG — every tunable named in the spec lives here.
  // ---------------------------------------------------------------
  var CONFIG = {
    BLADES: {
      A: { min: 60.4, max: 76 },
      B: { min: 49.6, max: 56.1 },
      C: { min: 32.5, max: 39.8 },
      D: { min: 10, max: 28 }
    },
    BLADE_A_MAX: 76,
    BLADE_D_MIN: 10,
    ORIGIN_X: -0.02,   // fraction of viewport width
    ORIGIN_Y: 1.03,    // fraction of viewport height
    SWEEP_START: -14,  // deg, added to base blade angles
    SWEEP_END: 16,
    SWEEP_DURATION: 1700,   // ms, 1.3s -> 3.0s
    RETURN_DURATION: 1200,  // ms, 3.0s -> 4.2s
    CONTENT_DELAY: 4500,    // ms from intro start
    BEAM_INTENSITY: 1.2,
    HAZE_LEVEL: 0.035,
    BLUR_BODY: 6,
    BLUR_CORE: 1.4,
    FLICKER_STRENGTH: 0.025,
    GRAIN_LEVEL: 0.05,
    VIGNETTE_LEVEL: 0.35,
    QUALITY: 'high'
  };
  CONFIG.BLADES.A.max = CONFIG.BLADE_A_MAX;
  CONFIG.BLADES.D.min = CONFIG.BLADE_D_MIN;

  var IGNITE_MS = 500;
  var ENTRANCE_MS = 800; // 0.5 -> 1.3
  var LANDING_MS = 500;  // 4.2 -> 4.7
  var TOTAL_FAILSAFE_MS = 8000;

  var html = document.documentElement;

  // ---------------------------------------------------------------
  // Preflight: decide whether the intro should run at all.
  // ---------------------------------------------------------------
  function reveal() {
    html.classList.add('introSkip');
    if (window.__introFailsafe) { clearTimeout(window.__introFailsafe); window.__introFailsafe = null; }
  }

  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var alreadyPlayed = false;
  try { alreadyPlayed = sessionStorage.getItem('luxreal_intro_played') === '1'; } catch (e) { /* private mode etc. */ }
  var forceReplay = /[?&]replay\b/.test(location.search);

  if (reducedMotion || (alreadyPlayed && !forceReplay)) {
    reveal();
    return;
  }

  // mobile / quality tier
  var isMobile = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
  if (isMobile) {
    CONFIG.QUALITY = 'low';
  }

  // Overall failsafe: whatever happens, never leave the page stuck.
  var failsafeTimer = setTimeout(function () { finish(); }, TOTAL_FAILSAFE_MS);

  // ---------------------------------------------------------------
  // Boot once DOM is ready.
  // ---------------------------------------------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  var root, maskEl, svg, grainEl, vignetteEl;
  var navLogoIcon, navLogoText, navLogo, navLinks, navRight, heroContent, heroChip, video;
  var W = 0, H = 0, DIAG = 0;
  var rafId = null;
  var startTime = 0;
  var skipRequested = false;
  var phase = 'ignite'; // ignite | entrance | sweep | return | landing | done
  var currentRotation = CONFIG.SWEEP_START;
  var currentOrigin = { x: 0, y: 0 };
  var currentLength = 0;
  var currentBrightness = 1;
  var svgLoadedOK = false;

  function boot() {
    navLogo = document.querySelector('.nav .nav-logo');
    navLogoIcon = document.querySelector('.nav .nav-logo-icon');
    navLogoText = document.querySelector('.nav .nav-logo-text');
    navLinks = document.querySelector('.nav-links');
    navRight = document.querySelector('.nav-right');
    heroContent = document.querySelector('.hero-cinematic-content');
    heroChip = document.querySelector('.hero-cinematic-chip');
    video = document.querySelector('.hero-cinematic-bg video');

    // If the hero isn't even on this page, there's nothing to intro.
    if (!heroContent) { finish(); return; }

    // The hero video normally autoplays on page load. Hold it at frame 0
    // so it visibly "starts from the beginning" in sync with the sweep
    // phase instead of already being mid-loop by the time it's revealed.
    if (video) {
      try { video.pause(); video.currentTime = 0; } catch (e) { /* not seekable yet */ }
    }

    buildDOM();
    measure();
    window.addEventListener('resize', measure);

    window.addEventListener('pointerdown', onSkip, { passive: true });
    window.addEventListener('keydown', onKeyForSkip);

    startTime = performance.now();
    rafId = requestAnimationFrame(loop);

    loadRayReference();
  }

  function onKeyForSkip(e) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') onSkip();
  }
  function onSkip() {
    if (phase === 'ignite' || phase === 'entrance' || phase === 'sweep') {
      skipRequested = true;
    }
    // return / landing / done: ignored per spec.
  }

  // ---------------------------------------------------------------
  // DOM construction
  // ---------------------------------------------------------------
  function buildDOM() {
    // Hand off from the CSS pre-paint safety net (html:not(.introSkip):not(.introRunning)::before)
    // to this element's own animated mask, right as it's created.
    html.classList.add('introRunning');

    root = document.createElement('div');
    root.id = 'intro-root';

    maskEl = document.createElement('div');
    maskEl.id = 'intro-mask';
    root.appendChild(maskEl);

    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'intro-beam-svg');
    svg.innerHTML =
      '<defs>' +
      '  <filter id="ib-blur-body" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="' + CONFIG.BLUR_BODY + '"/></filter>' +
      '  <filter id="ib-blur-core" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="' + CONFIG.BLUR_CORE + '"/></filter>' +
      '  <radialGradient id="ib-fade" gradientUnits="userSpaceOnUse">' +
      '    <stop offset="0%" stop-color="#FFE9C4" stop-opacity="1"/>' +
      '    <stop offset="14%" stop-color="#FFE9C4" stop-opacity="0.85"/>' +
      '    <stop offset="34%" stop-color="#FFE9C4" stop-opacity="0.55"/>' +
      '    <stop offset="60%" stop-color="#FCE7C4" stop-opacity="0.28"/>' +
      '    <stop offset="100%" stop-color="#FAE8C8" stop-opacity="0.10"/>' +
      '  </radialGradient>' +
      '  <radialGradient id="ib-core-glow" gradientUnits="userSpaceOnUse">' +
      '    <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1"/>' +
      '    <stop offset="40%" stop-color="#FFF3D6" stop-opacity="0.7"/>' +
      '    <stop offset="100%" stop-color="#FFE9C4" stop-opacity="0"/>' +
      '  </radialGradient>' +
      '  <radialGradient id="ib-wide-glow" gradientUnits="userSpaceOnUse">' +
      '    <stop offset="0%" stop-color="#FFF3D6" stop-opacity="0.75"/>' +
      '    <stop offset="60%" stop-color="#FFE9C4" stop-opacity="0.25"/>' +
      '    <stop offset="100%" stop-color="#FFE9C4" stop-opacity="0"/>' +
      '  </radialGradient>' +
      '</defs>' +
      '<g id="ib-source-glow"><circle id="ib-wide-circle" fill="url(#ib-wide-glow)"/><circle id="ib-core-circle" fill="url(#ib-core-glow)"/></g>' +
      '<path id="ib-haze" fill="url(#ib-fade)" opacity="' + CONFIG.HAZE_LEVEL + '"/>' +
      '<g id="ib-body" filter="url(#ib-blur-body)" opacity="0.4">' +
      '  <polygon id="ib-body-a"/><polygon id="ib-body-b"/><polygon id="ib-body-c"/><polygon id="ib-body-d"/>' +
      '</g>' +
      '<g id="ib-core" filter="url(#ib-blur-core)" opacity="0.85">' +
      '  <polygon id="ib-core-a"/><polygon id="ib-core-b"/><polygon id="ib-core-c"/><polygon id="ib-core-d"/>' +
      '</g>';
    root.appendChild(svg);

    if (CONFIG.QUALITY !== 'low') {
      grainEl = document.createElement('div');
      grainEl.id = 'intro-grain';
      root.appendChild(grainEl);
    }

    vignetteEl = document.createElement('div');
    vignetteEl.id = 'intro-vignette';
    root.appendChild(vignetteEl);

    document.body.appendChild(root);
  }

  function measure() {
    W = window.innerWidth;
    H = window.innerHeight;
    DIAG = Math.sqrt(W * W + H * H);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
  }

  // ---------------------------------------------------------------
  // Math helpers
  // ---------------------------------------------------------------
  function angleToVec(deg) {
    var r = deg * Math.PI / 180;
    return { x: Math.cos(r), y: -Math.sin(r) };
  }
  function ORIGIN_PX() {
    return { x: CONFIG.ORIGIN_X * W, y: CONFIG.ORIGIN_Y * H };
  }
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function bladePts(ox, oy, min, max, len) {
    var v1 = angleToVec(min), v2 = angleToVec(max);
    return ox + ',' + oy + ' ' +
      (ox + v1.x * len) + ',' + (oy + v1.y * len) + ' ' +
      (ox + v2.x * len) + ',' + (oy + v2.y * len);
  }
  function fanPath(ox, oy, min, max, len, segs) {
    segs = segs || 10;
    var d = 'M ' + ox + ',' + oy + ' ';
    for (var i = 0; i <= segs; i++) {
      var a = lerp(min, max, i / segs);
      var v = angleToVec(a);
      d += 'L ' + (ox + v.x * len) + ',' + (oy + v.y * len) + ' ';
    }
    return d + 'Z';
  }

  // ---------------------------------------------------------------
  // Per-frame draw: given rotation offset (deg), origin, length, brightness
  // ---------------------------------------------------------------
  function draw(rotation, origin, length, brightness, flicker, opacityMul) {
    var names = ['A', 'B', 'C', 'D'];
    var suffixes = ['a', 'b', 'c', 'd'];
    for (var i = 0; i < 4; i++) {
      var base = CONFIG.BLADES[names[i]];
      var min = base.min + rotation, max = base.max + rotation;
      var center = (min + max) / 2, half = (max - min) / 2;

      // Core is a bright, fairly narrow ray so the 4 blades stay visually
      // distinct with real dark gaps between them (the logo's defining
      // feature); body is slightly narrower than the full wedge (not the
      // full min..max) so its blur doesn't bleed all the way into the
      // neighboring gap and wash the fan into one hazy mass.
      var coreMin = center - half * 0.4, coreMax = center + half * 0.4;
      var bodyMin = center - half * 0.82, bodyMax = center + half * 0.82;

      document.getElementById('ib-body-' + suffixes[i]).setAttribute('points', bladePts(origin.x, origin.y, bodyMin, bodyMax, length));
      document.getElementById('ib-core-' + suffixes[i]).setAttribute('points', bladePts(origin.x, origin.y, coreMin, coreMax, length));
    }

    var fadeGrad = document.getElementById('ib-fade');
    fadeGrad.setAttribute('cx', origin.x); fadeGrad.setAttribute('cy', origin.y); fadeGrad.setAttribute('r', length);

    var hazeMin = CONFIG.BLADES.D.min + rotation - 4;
    var hazeMax = CONFIG.BLADES.A.max + rotation + 4;
    document.getElementById('ib-haze').setAttribute('d', fanPath(origin.x, origin.y, hazeMin, hazeMax, length, 16));

    // Big, hot source glow — the light should read as a projector bulb
    // that just switched on, not a faint point.
    var wideR = length * 0.26, coreR = length * 0.11;
    var wideGlow = document.getElementById('ib-wide-glow');
    wideGlow.setAttribute('cx', origin.x); wideGlow.setAttribute('cy', origin.y); wideGlow.setAttribute('r', wideR);
    var coreGlow = document.getElementById('ib-core-glow');
    coreGlow.setAttribute('cx', origin.x); coreGlow.setAttribute('cy', origin.y); coreGlow.setAttribute('r', coreR);
    document.getElementById('ib-wide-circle').setAttribute('r', wideR);
    document.getElementById('ib-wide-circle').setAttribute('cx', origin.x);
    document.getElementById('ib-wide-circle').setAttribute('cy', origin.y);
    document.getElementById('ib-core-circle').setAttribute('r', coreR);
    document.getElementById('ib-core-circle').setAttribute('cx', origin.x);
    document.getElementById('ib-core-circle').setAttribute('cy', origin.y);

    var b = brightness * flicker * opacityMul * CONFIG.BEAM_INTENSITY;
    document.getElementById('ib-body').setAttribute('opacity', 0.22 * b);
    document.getElementById('ib-core').setAttribute('opacity', Math.min(1, 0.85 * b));
    document.getElementById('ib-haze').setAttribute('opacity', CONFIG.HAZE_LEVEL * b);
    document.getElementById('ib-source-glow').setAttribute('opacity', Math.min(1, b * 1.25));

    if (grainEl) grainEl.style.opacity = CONFIG.GRAIN_LEVEL * Math.min(1, brightness);
    if (vignetteEl) vignetteEl.style.opacity = CONFIG.VIGNETTE_LEVEL * Math.min(1, brightness);
  }

  // ---------------------------------------------------------------
  // Main animation loop — explicit phase machine driven by elapsed ms.
  // ---------------------------------------------------------------
  function loop(now) {
    var elapsed = now - startTime;

    if (skipRequested && (phase === 'ignite' || phase === 'entrance' || phase === 'sweep')) {
      // Catch up rotation to SWEEP_END over ~0.4s, then hand off to return phase.
      skipRequested = false;
      wasSkipped = true;
      phase = 'skip-catchup';
      skipCatchupStart = now;
      skipCatchupFrom = currentRotation;
      if (video) tryPlayVideo();
    }

    switch (phase) {
      case 'ignite': {
        var t = Math.min(1, elapsed / IGNITE_MS);
        maskEl.style.opacity = 1;
        var glowT = easeOutCubic(t);
        currentOrigin = ORIGIN_PX();
        currentLength = DIAG * 0.15 * glowT;
        currentBrightness = glowT;
        draw(CONFIG.SWEEP_START, currentOrigin, Math.max(1, currentLength), currentBrightness, flicker(now), 1);
        if (t >= 1) phase = 'entrance';
        break;
      }
      case 'entrance': {
        var te = Math.min(1, (elapsed - IGNITE_MS) / ENTRANCE_MS);
        var eo = easeOutCubic(te);
        currentOrigin = ORIGIN_PX();
        currentLength = DIAG * 1.3 * eo;
        currentBrightness = eo;
        var maskOp = lerp(1, 1, te); // mask stays opaque through entrance; fades during sweep
        maskEl.style.opacity = maskOp;
        draw(CONFIG.SWEEP_START, currentOrigin, currentLength, currentBrightness, flicker(now), 1);
        if (te >= 1) { phase = 'sweep'; sweepStart = now; if (video) tryPlayVideo(); }
        break;
      }
      case 'sweep': {
        var ts = Math.min(1, (now - sweepStart) / CONFIG.SWEEP_DURATION);
        var es = easeInOutCubic(ts);
        currentRotation = lerp(CONFIG.SWEEP_START, CONFIG.SWEEP_END, es);
        currentOrigin = ORIGIN_PX();
        currentLength = DIAG * 1.3;
        currentBrightness = 1;
        maskEl.style.opacity = 1 - es;
        draw(currentRotation, currentOrigin, currentLength, currentBrightness, flicker(now), 1);
        if (ts >= 1) { phase = 'return'; returnStart = now; returnFromRotation = currentRotation; }
        break;
      }
      case 'skip-catchup': {
        var tc = Math.min(1, (now - skipCatchupStart) / 400);
        var ec = easeInOutCubic(tc);
        currentRotation = lerp(skipCatchupFrom, CONFIG.SWEEP_END, ec);
        currentOrigin = ORIGIN_PX();
        currentLength = DIAG * 1.3;
        currentBrightness = 1;
        maskEl.style.opacity = 1 - ec;
        draw(currentRotation, currentOrigin, currentLength, currentBrightness, flicker(now), 1);
        if (tc >= 1) { phase = 'return'; returnStart = now; returnFromRotation = currentRotation; }
        break;
      }
      case 'return': {
        var landing = getLandingTarget();
        var tr = Math.min(1, (now - returnStart) / CONFIG.RETURN_DURATION);
        var er = easeInOutCubic(tr);
        currentRotation = lerp(returnFromRotation, 0, er);
        currentOrigin = {
          x: lerp(ORIGIN_PX().x, landing.x, er),
          y: lerp(ORIGIN_PX().y, landing.y, er)
        };
        currentLength = lerp(DIAG * 1.3, landing.length, er);
        currentBrightness = lerp(1, 0.4, er);
        maskEl.style.opacity = 0;
        draw(currentRotation, currentOrigin, currentLength, currentBrightness, flicker(now), 1);
        if (tr >= 1) { phase = 'landing'; landingStart = now; showLandingFlash(landing); }
        break;
      }
      case 'landing': {
        var tl = Math.min(1, (now - landingStart) / LANDING_MS);
        var landing2 = getLandingTarget();
        var fadeOut = 1 - easeInOutCubic(tl);
        draw(0, landing2, landing2.length, 0.4 * fadeOut, 1, 1);
        animateLandingFlash(tl);
        if (tl >= 1) { phase = 'reveal'; revealStart = now; startReveal(); }
        break;
      }
      case 'reveal': {
        setOpacity(navLogo, 1);
        var trv = applyContentFade(now);
        if (trv >= 1) { finish(); return; }
        break;
      }
    }

    // Rest of the nav + hero content fades in starting at CONTENT_DELAY,
    // independent of exactly when the landing flash animation finishes
    // (it's allowed to overlap the tail of the flash, per spec timing).
    // Only applies to the natural (non-skipped) playthrough, since
    // revealStart isn't set yet during 'landing' — see applyContentFade().
    if (phase === 'landing' && !wasSkipped) applyContentFade(now);

    rafId = requestAnimationFrame(loop);
  }

  var sweepStart = 0, returnStart = 0, returnFromRotation = 0, landingStart = 0, revealStart = 0;
  var skipCatchupStart = 0, skipCatchupFrom = 0;
  var wasSkipped = false;

  function applyContentFade(now) {
    // Natural playthrough: content fades in starting at CONTENT_DELAY
    // (absolute, from intro start), per spec, overlapping the tail of the
    // landing flash. Skipped playthrough: that absolute delay would still
    // be far in the future right after a fast-forwarded landing, so fade
    // immediately once the flash lands instead.
    var baseline = wasSkipped ? revealStart : (startTime + CONFIG.CONTENT_DELAY);
    var trv = Math.min(1, Math.max(0, (now - baseline) / 500));
    setOpacity(navLinks, trv);
    setOpacity(navRight, trv);
    setOpacity(heroContent, trv);
    setOpacity(heroChip, trv);
    return trv;
  }

  function flicker(now) {
    var breathing = 1 + 0.05 * Math.sin(now * 0.0009);
    var micro = 1 + (Math.sin(now * 0.013) * 0.5 + Math.sin(now * 0.031) * 0.5) * CONFIG.FLICKER_STRENGTH;
    return breathing * micro;
  }

  function setOpacity(el, v) { if (el) el.style.opacity = v; }

  function tryPlayVideo() {
    if (!video) return;
    var p = video.play();
    if (p && p.catch) {
      p.catch(function () {
        setTimeout(function () { video.play().catch(function () {}); }, 150);
      });
    }
  }

  function getLandingTarget() {
    if (navLogoIcon) {
      var r = navLogoIcon.getBoundingClientRect();
      var s = r.height || 26;
      return {
        x: r.left - 0.122 * s,
        y: r.bottom + 0.117 * s,
        length: 1.2 * s
      };
    }
    return { x: 24, y: 24, length: 40 };
  }

  // ---------------------------------------------------------------
  // Landing flash: per-ray sequential light-up when logo-mark.svg is
  // available, else an overall glow fallback on the raster icon.
  // ---------------------------------------------------------------
  var flashHost = null;
  function loadRayReference() {
    fetch('assets/logo-mark.svg').then(function (res) {
      if (!res.ok) throw new Error('missing');
      return res.text();
    }).then(function (text) {
      svgLoadedOK = /id="ray-a"/.test(text) && /id="ray-b"/.test(text) && /id="ray-c"/.test(text) && /id="ray-d"/.test(text);
      if (svgLoadedOK) {
        flashHost = document.createElement('div');
        flashHost.id = 'intro-landing-flash';
        flashHost.innerHTML = text;
        document.body.appendChild(flashHost);
      } else {
        console.info('[luxreal-intro] assets/logo-mark.svg missing ray ids — using overall glow fallback for the landing flash.');
      }
    }).catch(function () {
      console.info('[luxreal-intro] assets/logo-mark.svg not found — using overall glow fallback for the landing flash.');
    });
  }

  var glowEl = null;
  function showLandingFlash(landing) {
    if (navLogoIcon) {
      var r = navLogoIcon.getBoundingClientRect();
      if (flashHost) {
        flashHost.style.left = r.left + 'px';
        flashHost.style.top = r.top + 'px';
        flashHost.style.width = r.width + 'px';
        flashHost.style.height = r.height + 'px';
        flashHost.style.opacity = '1';
      } else {
        glowEl = document.createElement('div');
        glowEl.id = 'intro-logo-glow';
        glowEl.style.left = r.left + 'px';
        glowEl.style.top = r.top + 'px';
        glowEl.style.width = r.width + 'px';
        glowEl.style.height = r.height + 'px';
        document.body.appendChild(glowEl);
      }
    }
  }

  function animateLandingFlash(t) {
    if (flashHost) {
      var order = ['ray-a', 'ray-b', 'ray-c', 'ray-d'];
      for (var i = 0; i < order.length; i++) {
        var start = i * 0.18, end = start + 0.4;
        var lt = (t - start) / (end - start);
        lt = Math.max(0, Math.min(1, lt));
        var op = lt < 0.5 ? lt * 2 : 1 - (lt - 0.5) * 2;
        var pathEl = flashHost.querySelector('#' + order[i]);
        if (pathEl) pathEl.style.opacity = Math.max(0, op);
      }
    } else if (glowEl) {
      var pulse = Math.sin(t * Math.PI);
      glowEl.style.opacity = pulse;
      glowEl.style.transform = 'scale(' + (1 + pulse * 0.4) + ')';
    }
  }

  function startReveal() {
    if (flashHost) { flashHost.style.transition = 'opacity .3s'; flashHost.style.opacity = '0'; }
    if (glowEl) { glowEl.style.transition = 'opacity .3s'; glowEl.style.opacity = '0'; }
  }

  // ---------------------------------------------------------------
  // Cleanup — restore the page exactly.
  // ---------------------------------------------------------------
  var finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(failsafeTimer);
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('resize', measure);
    window.removeEventListener('pointerdown', onSkip);
    window.removeEventListener('keydown', onKeyForSkip);
    if (root && root.parentNode) root.parentNode.removeChild(root);
    if (flashHost && flashHost.parentNode) flashHost.parentNode.removeChild(flashHost);
    if (glowEl && glowEl.parentNode) glowEl.parentNode.removeChild(glowEl);
    setOpacity(navLogo, 1); setOpacity(navLinks, 1); setOpacity(navRight, 1);
    setOpacity(heroContent, 1); setOpacity(heroChip, 1);
    reveal();
    try { sessionStorage.setItem('luxreal_intro_played', '1'); } catch (e) {}
  }
})();
