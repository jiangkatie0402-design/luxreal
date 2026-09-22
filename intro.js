/* ============================================================
   LuxReal hero intro v4 — real logo-ray asset, "sharp fan / blur into
   fog / reveal".
   Self-contained: deleting intro.css + intro.js and their two
   <link>/<script> references in index.html fully restores the page.

   The "light" shape is never redrawn in code — it's the actual brand
   icon's ray artwork (assets/logo-ray-mask.png, cropped straight from
   the source design file, alpha = the 4 rays), used as a CSS mask over
   a radial-gradient fill. Only transform (scale/rotate) and filter
   (blur) are animated; the shape data itself is untouched.

   Sequence:
   1. Two black masks (split by a line through ORIGIN at CONVERGE_ANGLE)
      fully cover the hero.
   2. The ray graphic (3 stacked copies, for the fog layering in step 3)
      scales in from 0 and fades in at EXPAND_ROTATION, sharp and
      crisp — elastic ease.
   3. It rotates to CONVERGE_ROTATION (aligned with the mask split)
      while each layer's blur ramps up from 0 to its own target,
      turning the crisp fan into a diffuse glowing fog rather than
      collapsing it into a beam — decelerate ease.
   4. The masks slide apart along CONVERGE_ANGLE, revealing the video;
      the fog fades out at the same time.
   5. Title, subtitle, then the CTA button fade + rise in, staggered.

   Angle convention for CONVERGE_ANGLE/mask geometry: degrees, 0 =
   pointing right, 90 = pointing straight up, counter-clockwise — i.e.
   screen direction vector (cos(deg), -sin(deg)). EXPAND_ROTATION /
   CONVERGE_ROTATION on the ray graphic itself are plain CSS
   rotate()-style values (clockwise-positive); CONVERGE_ROTATION is
   kept equal to the CSS-equivalent of CONVERGE_ANGLE so the ray
   actually aligns with the mask split at the end of phase 3.
   ============================================================ */
(function () {
  'use strict';

  // ---------------------------------------------------------------
  // CONFIG
  // ---------------------------------------------------------------
  var CONFIG = {
    ORIGIN_X_PCT: 75,  // % of viewport width — ray/mask-split origin
    ORIGIN_Y_PCT: 0,   // % of viewport height (top of the hero)

    RAY_ASSET: 'assets/logo-ray-mask.png', // native 658x658, alpha = the rays
    RAY_SIZE_VMAX: 140,     // rendered size (at scale=1) of the ray graphic
    EXPAND_ROTATION: 150,   // deg, CSS rotate() at rest after the fan appears
    CONVERGE_ANGLE: 126,    // deg (screen-angle convention, see header) —
                            // the mask split/slide direction
    // CONVERGE_ROTATION is derived from CONVERGE_ANGLE below so the ray
    // graphic actually lines up with the mask split at the end of phase 3.

    LAYERS: [ // sharp core -> soft -> hazy, stacked to build up the fog
      { opacity: 0.4,  blurEnd: 0 },
      { opacity: 0.55, blurEnd: 10 },
      { opacity: 0.4,  blurEnd: 25 }
    ],

    INITIAL_HOLD_MS: 150,   // masks-only pause before the ray appears
    EXPAND_DURATION: 600,   // ms, scale/opacity in, sharp
    CONVERGE_DURATION: 550, // ms, rotate + blur into fog
    REVEAL_DURATION: 1100,  // ms, masks slide apart
    RAY_FADE_DURATION: 600, // ms, fog opacity fade during reveal
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

  // CSS rotate() is clockwise-positive; CONVERGE_ANGLE above is
  // counter-clockwise-positive, so converting always flips sign.
  function cssRotateFor(deg) { return -deg; }
  var CONVERGE_ROTATION = cssRotateFor(CONFIG.CONVERGE_ANGLE);

  var root, leftMask, rightMask, rayWrap, rayLayers = [];
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
  // DOM construction
  // ---------------------------------------------------------------
  function buildDOM() {
    // Hand off from the CSS pre-paint safety net (html:not(.introSkip):not(.introRunning)::before)
    // to this element's own masks, right as they're created.
    html.classList.add('introRunning');

    root = document.createElement('div');
    root.id = 'intro-root';

    // Two large squares, both CENTERED on ORIGIN (via negative margins),
    // both rotated to CONVERGE_ANGLE, then each pushed off-center along
    // its own local Y axis (still inside the same transform, so the push
    // happens *before* the rotation and ends up perpendicular to the
    // split line regardless of the angle's sign/quadrant) — robust for
    // any origin position or angle, unlike anchoring at a box corner.
    leftMask = document.createElement('div');
    leftMask.className = 'intro-mask';
    leftMask.style.left = CONFIG.ORIGIN_X_PCT + '%';
    leftMask.style.top = CONFIG.ORIGIN_Y_PCT + '%';
    leftMask.style.transform = 'rotate(' + CONVERGE_ROTATION + 'deg) translateY(-200vmax)';

    rightMask = document.createElement('div');
    rightMask.className = 'intro-mask';
    rightMask.style.left = CONFIG.ORIGIN_X_PCT + '%';
    rightMask.style.top = CONFIG.ORIGIN_Y_PCT + '%';
    rightMask.style.transform = 'rotate(' + CONVERGE_ROTATION + 'deg) translateY(200vmax)';

    root.appendChild(leftMask);
    root.appendChild(rightMask);

    // The ray graphic: a wrapper positioned at ORIGIN, holding 3 stacked
    // copies of the same masked-gradient shape (see header). All 3 share
    // the wrapper's scale/rotate; only their own opacity/blur differ.
    rayWrap = document.createElement('div');
    rayWrap.id = 'intro-ray-wrap';
    rayWrap.style.left = CONFIG.ORIGIN_X_PCT + '%';
    rayWrap.style.top = CONFIG.ORIGIN_Y_PCT + '%';
    rayWrap.style.opacity = '0';
    rayWrap.style.transform = 'scale(0) rotate(' + CONFIG.EXPAND_ROTATION + 'deg)';

    CONFIG.LAYERS.forEach(function (layerCfg) {
      var layer = document.createElement('div');
      layer.className = 'intro-ray-layer';
      layer.style.width = CONFIG.RAY_SIZE_VMAX + 'vmax';
      layer.style.height = CONFIG.RAY_SIZE_VMAX + 'vmax';
      layer.style.top = 'calc(-1 * ' + CONFIG.RAY_SIZE_VMAX + 'vmax)';
      layer.style.maskImage = 'url(' + CONFIG.RAY_ASSET + ')';
      layer.style.webkitMaskImage = 'url(' + CONFIG.RAY_ASSET + ')';
      layer.style.opacity = String(layerCfg.opacity);
      layer.style.filter = 'blur(0px)';
      rayWrap.appendChild(layer);
      rayLayers.push({ el: layer, cfg: layerCfg });
    });

    root.appendChild(rayWrap);
    document.body.appendChild(root);
  }

  // ---------------------------------------------------------------
  // Phase 2: scale + fade the (still sharp) ray graphic in — elastic ease
  // ---------------------------------------------------------------
  function startExpand() {
    void rayWrap.getBoundingClientRect(); // force layout before transitioning
    rayWrap.style.transition = 'transform ' + CONFIG.EXPAND_DURATION + 'ms ' + CONFIG.EXPAND_EASE +
      ', opacity ' + CONFIG.EXPAND_DURATION + 'ms linear';
    rayWrap.style.opacity = '1';
    rayWrap.style.transform = 'scale(1) rotate(' + CONFIG.EXPAND_ROTATION + 'deg)';
    timers.push(setTimeout(startConverge, CONFIG.EXPAND_DURATION));
  }

  // ---------------------------------------------------------------
  // Phase 3: rotate to align with the mask split, while each layer
  // blurs up from sharp to its own target — turning the crisp fan into
  // a diffuse fog instead of collapsing it into a beam.
  // ---------------------------------------------------------------
  function startConverge() {
    rayWrap.style.transition = 'transform ' + CONFIG.CONVERGE_DURATION + 'ms ' + CONFIG.CONVERGE_EASE;
    rayWrap.style.transform = 'scale(1) rotate(' + CONVERGE_ROTATION + 'deg)';
    rayLayers.forEach(function (layer) {
      layer.el.style.transition = 'filter ' + CONFIG.CONVERGE_DURATION + 'ms ' + CONFIG.CONVERGE_EASE;
      layer.el.style.filter = 'blur(' + layer.cfg.blurEnd + 'px)';
    });
    timers.push(setTimeout(startRevealPhase, CONFIG.CONVERGE_DURATION));
  }

  // ---------------------------------------------------------------
  // Phase 4: masks slide apart along CONVERGE_ANGLE; the fog fades out;
  // video starts playing.
  // ---------------------------------------------------------------
  function startRevealPhase() {
    var rad = CONFIG.CONVERGE_ANGLE * Math.PI / 180;
    var vx = Math.cos(rad), vy = -Math.sin(rad);
    var d = CONFIG.SLIDE_DISTANCE;

    // translate() here is the outermost transform function, so it moves
    // the (already-rotated) mask in real screen-space vw/vh directions —
    // left mask one way along the beam axis, right mask the other, like
    // double doors parting along the diagonal.
    leftMask.style.transition = 'transform ' + CONFIG.REVEAL_DURATION + 'ms ' + CONFIG.CONVERGE_EASE;
    rightMask.style.transition = 'transform ' + CONFIG.REVEAL_DURATION + 'ms ' + CONFIG.CONVERGE_EASE;
    leftMask.style.transform = 'translate(' + (vx * d) + 'vw, ' + (vy * d) + 'vh) rotate(' + CONVERGE_ROTATION + 'deg) translateY(-200vmax)';
    rightMask.style.transform = 'translate(' + (-vx * d) + 'vw, ' + (-vy * d) + 'vh) rotate(' + CONVERGE_ROTATION + 'deg) translateY(200vmax)';

    rayWrap.style.transition = 'opacity ' + CONFIG.RAY_FADE_DURATION + 'ms linear';
    rayWrap.style.opacity = '0';

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
