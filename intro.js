/* ============================================================
   LuxReal hero intro v3 — "logo-ray fan / converge / reveal".
   Self-contained: deleting intro.css + intro.js and their two
   <link>/<script> references in index.html fully restores the page.

   Sequence:
   1. Two black masks (split by a line through ORIGIN at CONVERGE_ANGLE)
      fully cover the hero.
   2. 5 tapered, curved "logo ray" shapes shoot from ORIGIN (bottom-left
      of the hero) and fan out to their individual angles (elastic ease).
   3. The 5 rays converge back into one, aligned with CONVERGE_ANGLE —
      the same angle the masks are split along (decelerate ease).
   4. The masks slide apart along that angle, revealing the video; the
      rays fade out at the same time.
   5. Title, subtitle, then the CTA button fade + rise in, staggered.

   Angle convention throughout: degrees, 0 = pointing right, 90 =
   pointing straight up, measured counter-clockwise — i.e. screen
   direction vector (cos(deg), -sin(deg)).
   ============================================================ */
(function () {
  'use strict';

  // ---------------------------------------------------------------
  // CONFIG
  // ---------------------------------------------------------------
  var CONFIG = {
    ORIGIN_X_PCT: 6.5,   // % of viewport width — ray/mask-split origin
    ORIGIN_Y_PCT: 93.5,  // % of viewport height

    // The 5 logo rays: uneven angles and widths, not a symmetric fan.
    // angle: ray center direction (deg). halfWidth: angular half-width
    // at the flared/widest point (deg) — bigger = a thicker ray.
    RAYS: [
      { angle: 7,  halfWidth: 2.2 },
      { angle: 24, halfWidth: 3.6 },
      { angle: 41, halfWidth: 2.6 },
      { angle: 60, halfWidth: 4.4 },
      { angle: 82, halfWidth: 2.4 }
    ],
    CONVERGE_ANGLE: 41,     // deg — where the rays merge to, and the
                            // angle the mask split/slide is aligned to
    RAY_LENGTH_FACTOR: 1.3, // multiple of the viewport diagonal
    BOW_RADIUS_FRAC: 0.62,  // where along the ray the edge-curve control point sits
    BOW_OVERSHOOT: 1.35,    // how far past the wedge's own edge the curve bulges

    INITIAL_HOLD_MS: 150,   // masks-only pause before the rays appear
    EXPAND_DURATION: 600,   // ms, fan-out
    CONVERGE_DURATION: 600, // ms, fan-in
    REVEAL_DURATION: 1100,  // ms, masks slide apart
    RAY_FADE_DURATION: 600, // ms, ray opacity fade during reveal
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

  var root, leftMask, rightMask, svg, rayPaths = [];
  var heroTitle, heroSub, heroBtn, video;
  var W = 0, H = 0, DIAG = 0, originX = 0, originY = 0;
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
    measure();
    window.addEventListener('resize', measure);
    timers.push(setTimeout(startExpand, CONFIG.INITIAL_HOLD_MS));
  }

  // ---------------------------------------------------------------
  // Math helpers (shared angle convention — see header comment)
  // ---------------------------------------------------------------
  function dirVec(deg) {
    var r = deg * Math.PI / 180;
    return { x: Math.cos(r), y: -Math.sin(r) };
  }
  function pt(ox, oy, deg, radius) {
    var d = dirVec(deg);
    return { x: (ox + d.x * radius).toFixed(1), y: (oy + d.y * radius).toFixed(1) };
  }
  // CSS/SVG rotate() is clockwise-positive; our angle convention above is
  // counter-clockwise-positive, so converting between them always flips sign.
  function cssRotateFor(deg) { return -deg; }

  // ---------------------------------------------------------------
  // A tapered "logo ray": a sharp point at the origin, widening as it
  // extends, spreading into its full width at the far end — like the
  // real logo's rays. Each side is a quadratic-bezier curve that bows
  // outward past the wedge's own straight edge, rather than a flat
  // polygon side.
  // ---------------------------------------------------------------
  function rayPathD(ox, oy, angleDeg, halfWidthDeg, length) {
    var farLeft = pt(ox, oy, angleDeg - halfWidthDeg, length);
    var farRight = pt(ox, oy, angleDeg + halfWidthDeg, length);
    var bowR = length * CONFIG.BOW_RADIUS_FRAC;
    var cLeft = pt(ox, oy, angleDeg - halfWidthDeg * CONFIG.BOW_OVERSHOOT, bowR);
    var cRight = pt(ox, oy, angleDeg + halfWidthDeg * CONFIG.BOW_OVERSHOOT, bowR);
    var o = ox.toFixed(1) + ',' + oy.toFixed(1);
    return 'M ' + o +
      ' Q ' + cLeft.x + ',' + cLeft.y + ' ' + farLeft.x + ',' + farLeft.y +
      ' L ' + farRight.x + ',' + farRight.y +
      ' Q ' + cRight.x + ',' + cRight.y + ' ' + o + ' Z';
  }

  // ---------------------------------------------------------------
  // DOM construction
  // ---------------------------------------------------------------
  function buildDOM() {
    // Hand off from the CSS pre-paint safety net (html:not(.introSkip):not(.introRunning)::before)
    // to this element's own masks, right as they're created.
    html.classList.add('introRunning');

    root = document.createElement('div');
    root.id = 'intro-root';

    // Two large rectangles, each rotated to CONVERGE_ANGLE, anchored at
    // ORIGIN from opposite corners (top-left vs. bottom-left) so together
    // they tile the whole plane split exactly along the line through
    // ORIGIN at that angle — a pure-CSS diagonal split with no per-frame
    // JS math, and (since CSS rotate() operates in true, isotropic
    // pixels) correct at any aspect ratio.
    var svgRotateDeg = cssRotateFor(CONFIG.CONVERGE_ANGLE);

    leftMask = document.createElement('div');
    leftMask.className = 'intro-mask';
    leftMask.style.left = CONFIG.ORIGIN_X_PCT + '%';
    leftMask.style.top = CONFIG.ORIGIN_Y_PCT + '%';
    leftMask.style.transformOrigin = '0 0';
    leftMask.style.transform = 'rotate(' + svgRotateDeg + 'deg)';

    rightMask = document.createElement('div');
    rightMask.className = 'intro-mask';
    rightMask.style.left = CONFIG.ORIGIN_X_PCT + '%';
    rightMask.style.top = 'calc(' + CONFIG.ORIGIN_Y_PCT + '% - 400vmax)';
    rightMask.style.transformOrigin = '0 100%';
    rightMask.style.transform = 'rotate(' + svgRotateDeg + 'deg)';

    root.appendChild(leftMask);
    root.appendChild(rightMask);

    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'intro-ray-svg');
    svg.innerHTML =
      '<defs>' +
      '  <filter id="ray-soft" x="-50%" y="-50%" width="200%" height="200%">' +
      '    <feGaussianBlur stdDeviation="1.1"/>' +
      '  </filter>' +
      '</defs>' +
      '<g id="ray-group" filter="url(#ray-soft)"></g>';
    root.appendChild(svg);

    var rayGroup = svg.querySelector('#ray-group');
    CONFIG.RAYS.forEach(function (ray, i) {
      var grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      grad.setAttribute('id', 'ray-grad-' + i);
      grad.setAttribute('gradientUnits', 'userSpaceOnUse');
      grad.innerHTML =
        '<stop offset="0%" stop-color="#d8c8d8" stop-opacity="0.65"/>' +
        '<stop offset="14%" stop-color="#f0f0f2" stop-opacity="0.6"/>' +
        '<stop offset="100%" stop-color="#f0f0f2" stop-opacity="0"/>';
      svg.querySelector('defs').appendChild(grad);

      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('fill', 'url(#ray-grad-' + i + ')');
      path.style.opacity = '0';
      rayGroup.appendChild(path);
      rayPaths.push({ el: path, grad: grad, cfg: ray });
    });

    document.body.appendChild(root);
  }

  function measure() {
    W = window.innerWidth;
    H = window.innerHeight;
    DIAG = Math.sqrt(W * W + H * H);
    originX = CONFIG.ORIGIN_X_PCT / 100 * W;
    originY = CONFIG.ORIGIN_Y_PCT / 100 * H;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    drawRays(currentAngles());
  }

  // Angles currently in effect per ray, so a resize mid-animation redraws
  // at the same visual phase instead of snapping back to rest.
  var phaseAngle = null; // null = not yet started (use each ray's own fan angle at rest)
  function currentAngles() {
    if (phaseAngle === 'converged') return CONFIG.RAYS.map(function () { return CONFIG.CONVERGE_ANGLE; });
    if (phaseAngle === 'expanded') return CONFIG.RAYS.map(function (r) { return r.angle; });
    return CONFIG.RAYS.map(function () { return CONFIG.CONVERGE_ANGLE; });
  }

  function drawRays(angles) {
    var length = DIAG * CONFIG.RAY_LENGTH_FACTOR;
    rayPaths.forEach(function (r, i) {
      var d = rayPathD(originX, originY, angles[i], r.cfg.halfWidth, length);
      r.el.style.d = "path('" + d + "')";
      r.el.setAttribute('d', d); // fallback for browsers that don't animate CSS `d`
      var tip = pt(originX, originY, angles[i], length);
      r.grad.setAttribute('x1', originX);
      r.grad.setAttribute('y1', originY);
      r.grad.setAttribute('x2', tip.x);
      r.grad.setAttribute('y2', tip.y);
    });
  }

  // ---------------------------------------------------------------
  // Phase 2: fan out to each ray's own angle (elastic ease)
  // ---------------------------------------------------------------
  function startExpand() {
    drawRays(currentAngles()); // ensure the merged starting shape is committed
    rayPaths.forEach(function (r) {
      void r.el.getBoundingClientRect(); // force layout before changing transition
      r.el.style.transition = 'd ' + CONFIG.EXPAND_DURATION + 'ms ' + CONFIG.EXPAND_EASE +
        ', opacity 200ms linear';
      r.el.style.opacity = '1';
    });
    phaseAngle = 'expanded';
    drawRays(currentAngles());
    timers.push(setTimeout(startConverge, CONFIG.EXPAND_DURATION));
  }

  // ---------------------------------------------------------------
  // Phase 3: converge back to one, aligned with CONVERGE_ANGLE
  // (decelerate ease)
  // ---------------------------------------------------------------
  function startConverge() {
    rayPaths.forEach(function (r) {
      r.el.style.transition = 'd ' + CONFIG.CONVERGE_DURATION + 'ms ' + CONFIG.CONVERGE_EASE;
    });
    phaseAngle = 'converged';
    drawRays(currentAngles());
    timers.push(setTimeout(startRevealPhase, CONFIG.CONVERGE_DURATION));
  }

  // ---------------------------------------------------------------
  // Phase 4: masks slide apart along CONVERGE_ANGLE; rays fade out;
  // video starts playing.
  // ---------------------------------------------------------------
  function startRevealPhase() {
    var v = dirVec(CONFIG.CONVERGE_ANGLE);
    var d = CONFIG.SLIDE_DISTANCE;
    var svgRotateDeg = cssRotateFor(CONFIG.CONVERGE_ANGLE);

    // translate() here is the outermost transform function, so it moves
    // the (already-rotated) mask in real screen-space vw/vh directions —
    // left mask one way along the beam axis, right mask the other, like
    // double doors parting along the diagonal.
    leftMask.style.transition = 'transform ' + CONFIG.REVEAL_DURATION + 'ms ' + CONFIG.CONVERGE_EASE;
    rightMask.style.transition = 'transform ' + CONFIG.REVEAL_DURATION + 'ms ' + CONFIG.CONVERGE_EASE;
    leftMask.style.transform = 'translate(' + (v.x * d) + 'vw, ' + (v.y * d) + 'vh) rotate(' + svgRotateDeg + 'deg)';
    rightMask.style.transform = 'translate(' + (-v.x * d) + 'vw, ' + (-v.y * d) + 'vh) rotate(' + svgRotateDeg + 'deg)';

    rayPaths.forEach(function (r) {
      r.el.style.transition = 'opacity ' + CONFIG.RAY_FADE_DURATION + 'ms linear';
      r.el.style.opacity = '0';
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
    window.removeEventListener('resize', measure);
    if (root && root.parentNode) root.parentNode.removeChild(root);
    [heroTitle, heroSub, heroBtn].forEach(function (el) {
      if (el) { el.style.opacity = ''; el.style.transform = ''; el.style.transition = ''; }
    });
    reveal();
  }
})();
