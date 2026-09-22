/* ============================================================
   LuxReal hero intro v2 — "beam fan / converge / reveal".
   Self-contained: deleting intro.css + intro.js and their two
   <link>/<script> references in index.html fully restores the page.

   Sequence:
   1. Two black masks (split by a diagonal line) fully cover the hero.
   2. 4 beams shoot from the top of that diagonal and fan out
      (elastic ease).
   3. The 4 beams converge back into 1, aligned with the diagonal's own
      angle (decelerate ease).
   4. The masks slide apart along that beam angle, revealing the video;
      the beam fades out at the same time.
   5. Title, subtitle, then the CTA button fade + rise in, staggered.
   ============================================================ */
(function () {
  'use strict';

  // ---------------------------------------------------------------
  // CONFIG — geometry/timing tunables. Angles are degrees, measured
  // clockwise from the positive x-axis (0deg = right, 90deg = straight
  // down, 180deg = left) — the same convention as a CSS rotate().
  // ---------------------------------------------------------------
  var CONFIG = {
    SPLIT_TOP_PCT: 75,     // % of width: top of the diagonal split (y=0)
    SPLIT_BOTTOM_PCT: 50,  // % of width: bottom of the diagonal split (y=100%)
    BEAM_COUNT: 4,
    FAN_MIN_ANGLE: 106,    // deg, fan spread lower bound
    FAN_MAX_ANGLE: 146,    // deg, fan spread upper bound
    CONVERGE_ANGLE: 126,   // deg, final single-beam angle (matches the split line)
    BEAM_LENGTH_VMAX: 150, // beam length, vmax so it always clears the screen

    INITIAL_HOLD_MS: 150,   // masks-only pause before the beams appear
    EXPAND_DURATION: 600,   // ms, fan-out
    CONVERGE_DURATION: 600, // ms, fan-in
    REVEAL_DURATION: 1100,  // ms, masks slide apart
    BEAM_FADE_DURATION: 600,// ms, beam opacity fade during reveal
    TITLE_FADE_DURATION: 1000, // ms, each text element's own fade/rise
    SUBTITLE_DELAY: 200,    // ms, after masks finish sliding
    BUTTON_DELAY: 400,      // ms, after masks finish sliding

    SLIDE_DISTANCE: 160,    // vw/vh magnitude the masks slide away by

    EXPAND_EASE: 'cubic-bezier(0.34,1.56,0.64,1)',   // elastic/overshoot
    CONVERGE_EASE: 'cubic-bezier(0.65,0,0.35,1)'     // decelerate
  };

  var TOTAL_FAILSAFE_MS = 8000;
  var html = document.documentElement;

  function reveal() {
    html.classList.add('introSkip');
    if (window.__introFailsafe) { clearTimeout(window.__introFailsafe); window.__introFailsafe = null; }
  }

  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) { reveal(); return; }

  var failsafeTimer = setTimeout(function () { finish(); }, TOTAL_FAILSAFE_MS);

  var root, leftMask, rightMask, beams = [];
  var heroTitle, heroSub, heroBtn, video;
  var timers = [];
  var finished = false;

  // intro.js loads with `defer`, so by the time it runs, document.readyState
  // is already past 'loading' — boot() can fire synchronously here, which
  // is why all the state it touches must be initialized above, not below.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  function boot() {
    heroTitle = document.querySelector('.hero-cinematic-title');
    heroSub = document.querySelector('.hero-cinematic-sub');
    heroBtn = document.querySelector('.hero-cinematic-content .pill-cta');
    video = document.querySelector('.hero-cinematic-bg video');

    // If the hero isn't even on this page, there's nothing to intro.
    if (!heroTitle) { finish(); return; }

    // The hero video normally autoplays on page load. Hold it at frame 0
    // so it visibly "starts from the beginning" in sync with the reveal
    // instead of already being mid-loop by the time the masks part.
    if (video) {
      try { video.pause(); video.currentTime = 0; } catch (e) { /* not seekable yet */ }
    }

    buildDOM();
    timers.push(setTimeout(startExpand, CONFIG.INITIAL_HOLD_MS));
  }

  // ---------------------------------------------------------------
  // DOM construction — pure CSS %/vw/vh geometry, so it's responsive
  // with no JS resize recomputation needed.
  // ---------------------------------------------------------------
  function buildDOM() {
    // Hand off from the CSS pre-paint safety net (html:not(.introSkip):not(.introRunning)::before)
    // to this element's own masks, right as they're created.
    html.classList.add('introRunning');

    root = document.createElement('div');
    root.id = 'intro-root';

    leftMask = document.createElement('div');
    // A small overlap on the shared diagonal edge avoids a hairline seam
    // between the two masks (clip-path anti-aliasing otherwise lets a
    // sub-pixel sliver of the video show through along that line).
    var OVERLAP = 0.6; // % of width

    leftMask.className = 'intro-mask intro-mask-left';
    leftMask.style.clipPath = polygon(
      '0% 0%',
      (CONFIG.SPLIT_TOP_PCT + OVERLAP) + '% 0%',
      (CONFIG.SPLIT_BOTTOM_PCT + OVERLAP) + '% 100%',
      '0% 100%'
    );

    rightMask = document.createElement('div');
    rightMask.className = 'intro-mask intro-mask-right';
    rightMask.style.clipPath = polygon(
      (CONFIG.SPLIT_TOP_PCT - OVERLAP) + '% 0%',
      '100% 0%',
      '100% 100%',
      (CONFIG.SPLIT_BOTTOM_PCT - OVERLAP) + '% 100%'
    );

    root.appendChild(leftMask);
    root.appendChild(rightMask);

    var originX = CONFIG.SPLIT_TOP_PCT + '%';
    for (var i = 0; i < CONFIG.BEAM_COUNT; i++) {
      var beam = document.createElement('div');
      beam.className = 'intro-beam';
      beam.style.setProperty('--origin-x', originX);
      beam.style.setProperty('--origin-y', '0%');
      beam.style.setProperty('--beam-length', CONFIG.BEAM_LENGTH_VMAX + 'vmax');
      beam.style.transition = 'none';
      beam.style.transform = 'rotate(' + CONFIG.CONVERGE_ANGLE + 'deg)';
      root.appendChild(beam);
      beams.push(beam);
    }

    document.body.appendChild(root);
  }

  function polygon() {
    return 'polygon(' + Array.prototype.join.call(arguments, ', ') + ')';
  }

  function fanAngle(i, count) {
    if (count <= 1) return (CONFIG.FAN_MIN_ANGLE + CONFIG.FAN_MAX_ANGLE) / 2;
    return CONFIG.FAN_MIN_ANGLE + (CONFIG.FAN_MAX_ANGLE - CONFIG.FAN_MIN_ANGLE) * (i / (count - 1));
  }

  // ---------------------------------------------------------------
  // Phase 2: fan out (elastic ease)
  // ---------------------------------------------------------------
  function startExpand() {
    beams.forEach(function (b, i) {
      void b.offsetWidth; // force layout so the 'none' transition above registers first
      b.style.transition = 'transform ' + CONFIG.EXPAND_DURATION + 'ms ' + CONFIG.EXPAND_EASE +
        ', opacity 200ms linear';
      b.style.opacity = '1';
      b.style.transform = 'rotate(' + fanAngle(i, beams.length) + 'deg)';
    });
    timers.push(setTimeout(startConverge, CONFIG.EXPAND_DURATION));
  }

  // ---------------------------------------------------------------
  // Phase 3: converge back to one beam, aligned with the split line
  // (decelerate ease)
  // ---------------------------------------------------------------
  function startConverge() {
    beams.forEach(function (b) {
      b.style.transition = 'transform ' + CONFIG.CONVERGE_DURATION + 'ms ' + CONFIG.CONVERGE_EASE;
      b.style.transform = 'rotate(' + CONFIG.CONVERGE_ANGLE + 'deg)';
    });
    timers.push(setTimeout(startRevealPhase, CONFIG.CONVERGE_DURATION));
  }

  // ---------------------------------------------------------------
  // Phase 4: masks slide apart along the beam angle; beam fades out;
  // video starts playing.
  // ---------------------------------------------------------------
  function startRevealPhase() {
    var rad = CONFIG.CONVERGE_ANGLE * Math.PI / 180;
    var cos = Math.cos(rad), sin = Math.sin(rad);
    var d = CONFIG.SLIDE_DISTANCE;

    // Left mask slides away along the beam's own direction; right mask
    // slides away along the opposite direction — they part like double
    // doors hinged on the diagonal.
    leftMask.style.transition = 'transform ' + CONFIG.REVEAL_DURATION + 'ms ' + CONFIG.CONVERGE_EASE;
    rightMask.style.transition = 'transform ' + CONFIG.REVEAL_DURATION + 'ms ' + CONFIG.CONVERGE_EASE;
    leftMask.style.transform = 'translate(' + (cos * d) + 'vw, ' + (sin * d) + 'vh)';
    rightMask.style.transform = 'translate(' + (-cos * d) + 'vw, ' + (-sin * d) + 'vh)';

    beams.forEach(function (b) {
      b.style.transition = 'opacity ' + CONFIG.BEAM_FADE_DURATION + 'ms linear';
      b.style.opacity = '0';
    });

    if (video) tryPlayVideo();

    timers.push(setTimeout(startTextReveal, CONFIG.REVEAL_DURATION));
  }

  // ---------------------------------------------------------------
  // Phase 5: title -> subtitle -> button, staggered fade + rise.
  // ---------------------------------------------------------------
  function startTextReveal() {
    fadeInEl(heroTitle, 0);
    fadeInEl(heroSub, CONFIG.SUBTITLE_DELAY);
    fadeInEl(heroBtn, CONFIG.BUTTON_DELAY);

    var totalWait = Math.max(CONFIG.SUBTITLE_DELAY, CONFIG.BUTTON_DELAY) + CONFIG.TITLE_FADE_DURATION;
    timers.push(setTimeout(finish, totalWait));
  }

  function fadeInEl(el, delay) {
    if (!el) return;
    timers.push(setTimeout(function () {
      el.style.transition = 'opacity ' + CONFIG.TITLE_FADE_DURATION + 'ms ease-out, transform ' +
        CONFIG.TITLE_FADE_DURATION + 'ms ease-out';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, delay));
  }

  function tryPlayVideo() {
    if (!video) return;
    var p = video.play();
    if (p && p.catch) {
      p.catch(function () {
        setTimeout(function () { video.play().catch(function () {}); }, 150);
      });
    }
  }

  // ---------------------------------------------------------------
  // Cleanup — restore the page exactly.
  // ---------------------------------------------------------------
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(failsafeTimer);
    timers.forEach(clearTimeout);
    if (root && root.parentNode) root.parentNode.removeChild(root);
    [heroTitle, heroSub, heroBtn].forEach(function (el) {
      if (el) { el.style.opacity = ''; el.style.transform = ''; el.style.transition = ''; }
    });
    reveal();
  }
})();
