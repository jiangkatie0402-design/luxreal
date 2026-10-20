// ---------- nav scroll state ----------
const nav = document.querySelector('.nav');
function onScroll() {
  if (!nav) return;
  nav.classList.toggle('scrolled', window.scrollY > 20);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- language toggle (visual only) ----------
document.querySelectorAll('.lang-toggle').forEach(group => {
  group.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});

// ---------- mobile menu ----------
const burger = document.querySelector('.nav-burger');
const mobilePanel = document.querySelector('.mobile-panel');
if (burger && mobilePanel) {
  burger.addEventListener('click', () => mobilePanel.classList.toggle('show'));
  mobilePanel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobilePanel.classList.remove('show')));
}

// ---------- reveal on scroll ----------
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

// stagger index assignment
document.querySelectorAll('.stagger').forEach(group => {
  [...group.children].forEach((child, i) => child.style.setProperty('--i', i));
});

// ---------- auth modal ----------
const modalOverlay = document.getElementById('auth-modal');
const openTriggers = document.querySelectorAll('[data-open-auth]');
const closeTriggers = document.querySelectorAll('[data-close-auth]');
const modalTabs = document.querySelectorAll('.modal-tab');
const authForm = document.getElementById('auth-form');
const authToast = document.getElementById('auth-toast');
const registerFields = document.getElementById('register-only');
const modalTitle = document.getElementById('modal-title');
const modalSub = document.getElementById('modal-sub');
const modalSubmitBtn = document.getElementById('modal-submit-btn');

function openAuth(mode) {
  if (!modalOverlay) return;
  modalOverlay.classList.add('show');
  document.body.style.overflow = 'hidden';
  setAuthMode(mode || 'login');
}
function closeAuth() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('show');
  document.body.style.overflow = '';
  if (authToast) authToast.classList.remove('show');
}
function setAuthMode(mode) {
  modalTabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
  if (registerFields) registerFields.style.display = mode === 'register' ? 'block' : 'none';
  if (modalTitle) modalTitle.textContent = mode === 'register' ? '创建账户' : '欢迎回来';
  if (modalSub) modalSub.textContent = mode === 'register' ? '注册 LuxReal，开启电影级影像创作' : '登录以继续你的创作';
  if (modalSubmitBtn) modalSubmitBtn.textContent = mode === 'register' ? '创建账户' : '登录';
  if (authToast) authToast.classList.remove('show');
}

openTriggers.forEach(el => el.addEventListener('click', (e) => {
  e.preventDefault();
  openAuth(el.dataset.openAuth || 'login');
}));
closeTriggers.forEach(el => el.addEventListener('click', closeAuth));
modalTabs.forEach(tab => tab.addEventListener('click', () => setAuthMode(tab.dataset.mode)));
if (modalOverlay) {
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeAuth(); });
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAuth(); });
if (authForm) {
  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (authToast) authToast.classList.add('show');
  });
}

// ---------- hero background video sequence ----------
// the clips play back to back as a hard cut. Starting playback has some latency, so the next
// clip (buffered and parked on its first frame) is started hidden a few frames before the
// current one ends; when it ends the two simply swap, with no frozen frame in between
const heroBgVideos = document.querySelectorAll('.hero-bg-video');
const HERO_CUT_LEAD = 0.2; // seconds
if (heroBgVideos.length > 1) {
  function playHeroBgVideo(index) {
    const next = heroBgVideos[index];
    if (next.paused) next.play().catch(() => {});
    heroBgVideos.forEach(video => video.classList.toggle('active', video === next));
    heroBgVideos.forEach(video => {
      if (video !== next) { video.pause(); video.currentTime = 0; }
    });
    // in the same task as the cut: during the idle clip the hero text gives way to the two
    // choices, and the beast cut-out layer is cleared
    const header = next.closest('.hero-cinematic');
    if (header) header.classList.toggle('hero-choice', next.classList.contains('hero-idle'));
    document.dispatchEvent(new CustomEvent('hero:cut'));
  }
  heroBgVideos.forEach((video, i) => {
    const nextIndex = (i + 1) % heroBgVideos.length;
    const next = heroBgVideos[nextIndex];
    let cutTimer = null;
    const cut = () => {
      clearTimeout(cutTimer); cutTimer = null;
      if (video.classList.contains('active')) playHeroBgVideo(nextIndex);
    };
    if ('requestVideoFrameCallback' in video) {
      const watch = (now, meta) => {
        if (video.classList.contains('active')) {
          const left = video.duration - meta.mediaTime;
          if (left <= HERO_CUT_LEAD && next.paused) next.play().catch(() => {});
          // last frame is on screen: hold it for one frame, then cut (the 'ended' event comes late)
          if (left <= 1.5 / 24 && !cutTimer) cutTimer = setTimeout(cut, 1000 / 24);
        }
        video.requestVideoFrameCallback(watch);
      };
      video.requestVideoFrameCallback(watch);
    }
    video.addEventListener('ended', cut);
  });
}
if (heroBgVideos.length > 0) {
  // explicit play() as a fallback: the autoplay attribute can silently fail
  // to fire when several <video> elements compete for bandwidth on load
  const activeHeroVideo = heroBgVideos[0];
  activeHeroVideo.play().catch(() => {});
  activeHeroVideo.addEventListener('canplay', () => {
    if (activeHeroVideo.paused) activeHeroVideo.play().catch(() => {});
  }, { once: true });

  // reveal the title/subtitle/button once the first video reaches 2s;
  // fall back to a flat timeout if playback stalls so content isn't stuck hidden
  const heroContent = document.querySelector('.hero-cinematic-content');
  if (heroContent) {
    let heroContentRevealed = false;
    function revealHeroContent() {
      if (heroContentRevealed) return;
      heroContentRevealed = true;
      heroContent.classList.add('revealed');
    }
    activeHeroVideo.addEventListener('timeupdate', function onHeroTimeUpdate() {
      if (activeHeroVideo.currentTime >= 2) {
        revealHeroContent();
        activeHeroVideo.removeEventListener('timeupdate', onHeroTimeUpdate);
      }
    });
    setTimeout(revealHeroContent, 4000);
  }
}

// ---------- hero: the beast leaps in front of the title ----------
// Each frame of the beast clip (hero-seq) is 1920x1632: the 1920x1080 picture on top and a
// 960x540 matte of the beast at y=1088 (16px-aligned so compression doesn't bleed picture
// into it). The <video> is sized so only the picture shows; while it plays, a WebGL canvas
// above all the hero text redraws just the matted pixels from the same frame, darkened by the
// same gradient as .hero-cinematic-overlay, so the cut-out lines up and matches exactly.
const heroSeq = document.querySelector('.hero-seq');
const heroFg = document.querySelector('.hero-fg');
if (heroSeq && heroFg) {
  const PIC_W = 1920, PIC_H = 1080, FRAME_H = 1632, MATTE_Y = 1088, MATTE_W = 960, MATTE_H = 540;
  // The leap in hero-beast is lifted 130px over the source, so at its apex (frame 69) the
  // paws reach picture row ~426: about where the centred title's glyphs start, so they graze it.
  // on the way up the beast stays behind the text; it comes in front from the apex frame,
  // where it is entirely above the title and clear of the subtitle and CTA, so the swap
  // itself can't be seen
  const FRONT_FROM = 68.5 / 24;
  const heroBox = heroSeq.parentElement;
  const geo = { left: 0, top: 0, w: 0, h: 0, picW: PIC_W, picH: PIC_H };
  function layoutHeroSeq() {
    const w = heroBox.clientWidth, h = heroBox.clientHeight;
    const scale = Math.max(w / PIC_W, h / PIC_H);
    Object.assign(geo, { w, h, picW: PIC_W * scale, picH: PIC_H * scale, left: (w - PIC_W * scale) / 2, top: (h - PIC_H * scale) / 2 });
    Object.assign(heroSeq.style, { width: `${geo.picW}px`, height: `${FRAME_H * scale}px`, left: `${geo.left}px`, top: `${geo.top}px` });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    heroFg.width = Math.round(w * dpr);
    heroFg.height = Math.round(h * dpr);
  }
  layoutHeroSeq();
  window.addEventListener('resize', layoutHeroSeq);

  const gl = heroFg.getContext('webgl', { premultipliedAlpha: true, antialias: false });
  if (gl) {
    const vsrc = 'attribute vec2 p; varying vec2 v; void main(){ v = vec2(p.x * .5 + .5, .5 - p.y * .5); gl_Position = vec4(p, 0., 1.); }';
    const fsrc = `precision mediump float;
      uniform sampler2D tex; uniform vec4 geo; uniform vec2 size; varying vec2 v;
      float overlayA(float y) { // mirrors .hero-cinematic-overlay
        if (y < .32) return mix(.6, .1, y / .32);
        if (y < .62) return mix(.1, .15, (y - .32) / .30);
        return mix(.15, .8, (y - .62) / .38);
      }
      void main() {
        vec2 uv = (v * size - geo.xy) / geo.zw;
        vec3 c = texture2D(tex, vec2(uv.x, uv.y * ${PIC_H}. / ${FRAME_H}.)).rgb;
        vec2 mpx = clamp(vec2(uv.x * ${MATTE_W}., ${MATTE_Y}. + uv.y * ${MATTE_H}.), vec2(.5, ${MATTE_Y}.5), vec2(${MATTE_W}. - .5, ${MATTE_Y + MATTE_H}. - .5));
        float m = smoothstep(.06, .94, texture2D(tex, mpx / vec2(${PIC_W}., ${FRAME_H}.)).r);
        c = mix(c, vec3(8., 9., 11.) / 255., overlayA(v.y));
        gl_FragColor = vec4(c * m, m);
      }`;
    const compile = (type, src) => { const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh); return sh; };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsrc));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsrc));
    gl.linkProgram(prog);
    if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
      [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.LINEAR));
      const uGeo = gl.getUniformLocation(prog, 'geo'), uSize = gl.getUniformLocation(prog, 'size');
      let cleared = false;
      function clearHeroFg() {
        if (cleared) return;
        gl.viewport(0, 0, heroFg.width, heroFg.height);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        cleared = true;
      }
      function drawHeroFg(mediaTime) {
        const t = mediaTime != null ? mediaTime : heroSeq.currentTime;
        if (!heroSeq.classList.contains('active') || heroSeq.readyState < 2 || t < FRONT_FROM) { clearHeroFg(); return; }
        cleared = false;
        gl.viewport(0, 0, heroFg.width, heroFg.height);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, heroSeq);
        gl.uniform4f(uGeo, geo.left, geo.top, geo.picW, geo.picH);
        gl.uniform2f(uSize, geo.w, geo.h);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      // redraw on every decoded frame so the cut-out stays locked to the picture
      if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
        const onFrame = (now, meta) => { drawHeroFg(meta.mediaTime); heroSeq.requestVideoFrameCallback(onFrame); };
        heroSeq.requestVideoFrameCallback(onFrame);
      } else {
        const tick = () => { if (!heroSeq.paused) drawHeroFg(); requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      }
      // the clip is hidden the moment it is cut away from, so drop the cut-out in the same task
      heroSeq.addEventListener('ended', clearHeroFg);
      document.addEventListener('hero:cut', () => { if (!heroSeq.classList.contains('active')) clearHeroFg(); });
    }
  }
}

// ---------- hero waveform bars ----------
document.querySelectorAll('.fv-wave').forEach(wave => {
  const bars = 24;
  for (let i = 0; i < bars; i++) {
    const bar = document.createElement('span');
    const h = 14 + Math.round(Math.sin(i / 2) * 10 + Math.random() * 14);
    bar.style.height = h + 'px';
    wave.appendChild(bar);
  }
});

// ---------- privacy scroll-spy ----------
const privacyLinks = document.querySelectorAll('.privacy-nav a');
if (privacyLinks.length) {
  const sections = [...privacyLinks].map(a => document.querySelector(a.getAttribute('href')));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        privacyLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  sections.forEach(s => s && spy.observe(s));
}

// ---------- showcase: two panels (AI 短剧 / 互动影游), each with its own playlist ----------
// The active panel is wide and plays its clips; the other is a narrow, darkened still that expands
// when clicked. The section auto-advances so visitors see both offerings without clicking: each
// clip plays once, then the next clip in the panel, then the other panel.
const showcasePanels = [...document.querySelectorAll('.showcase-panel')];
const showcaseVideos = [...document.querySelectorAll('.showcase-video')];
if (showcasePanels.length) {
  const clipsOf = panel => [...panel.querySelectorAll('.showcase-video')];
  const clipIndex = new Map(showcasePanels.map(panel => [panel, 0]));
  let activePanel = showcasePanels.find(panel => panel.classList.contains('active')) || showcasePanels[0];
  // park a panel's current clip on a representative frame (its first frame can be black)
  const park = video => { video.pause(); const t = parseFloat(video.dataset.still || '0'); if (video.duration ? t < video.duration : true) video.currentTime = t; };
  function showClip(panel, index) {
    const clips = clipsOf(panel);
    if (!clips.length) return;
    index = (index + clips.length) % clips.length;
    clipIndex.set(panel, index);
    const target = clips[index];
    if (panel !== activePanel) {
      clipsOf(activePanel).forEach(park);
      activePanel = panel;
    }
    showcasePanels.forEach(p => {
      const on = p === panel;
      p.classList.toggle('active', on);
      p.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    clips.forEach(v => v.classList.toggle('active', v === target));
    clips.forEach(v => { if (v !== target) v.pause(); });
    panel.querySelectorAll('.showcase-info').forEach(info => info.classList.toggle('active', info.dataset.clip === target.dataset.clip));
    const controls = panel.querySelector('.showcase-controls');
    if (controls) controls.hidden = clips.length < 2;
    target.currentTime = 0;
    target.play().catch(() => {});
  }
  showcasePanels.forEach(panel => {
    const first = clipsOf(panel)[0];
    if (first) first.classList.add('active');
    const open = () => { if (panel !== activePanel) showClip(panel, 0); };
    panel.addEventListener('click', e => { if (!e.target.closest('.showcase-next')) open(); });
    panel.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    const next = panel.querySelector('.showcase-next');
    if (next) next.addEventListener('click', () => showClip(panel, clipIndex.get(panel) + 1));
    clipsOf(panel).forEach(video => {
      video.addEventListener('loadedmetadata', () => { if (panel !== activePanel && video.classList.contains('active')) park(video); }, { once: true });
      video.addEventListener('ended', () => {
        if (panel !== activePanel || !video.classList.contains('active')) return;
        const clips = clipsOf(panel), idx = clips.indexOf(video);
        if (idx < clips.length - 1) showClip(panel, idx + 1);
        else showClip(showcasePanels[(showcasePanels.indexOf(panel) + 1) % showcasePanels.length], 0);
      });
    });
  });
  showcasePanels.filter(panel => panel !== activePanel).forEach(panel => clipsOf(panel).forEach(park));
  showClip(activePanel, 0);
}

// ---------- advantages step tabs ----------
const adv3Steps = document.querySelectorAll('.adv3-step');
const adv3TextSlides = document.querySelectorAll('.adv3-text-slide');
const adv3Slides = document.querySelectorAll('.adv3-slide');
if (adv3Steps.length && adv3Slides.length) {
  adv3Steps.forEach(step => {
    step.addEventListener('click', () => {
      const target = step.dataset.step;
      adv3Steps.forEach(s => s.classList.toggle('active', s === step));
      adv3TextSlides.forEach(slide => slide.classList.toggle('active', slide.dataset.textSlide === target));
      adv3Slides.forEach(slide => {
        const active = slide.dataset.advSlide === target;
        slide.classList.toggle('active', active);
        const video = slide.querySelector('video');
        if (video) { if (active) video.play().catch(() => {}); else video.pause(); }
      });
    });
  });
}

// ---------- skills (core skill points) ----------
const skillsItems = document.querySelectorAll('.skills-item');
const skillsSlides = document.querySelectorAll('.skills-slide');
const skillsCaptions = document.querySelectorAll('.skills-caption');
if (skillsItems.length && skillsSlides.length) {
  const skillCount = skillsItems.length;
  let activeSkill = 0;
  function setActiveSkill(index) {
    activeSkill = (index + skillCount) % skillCount;
    const key = String(activeSkill);
    skillsItems.forEach(item => item.classList.toggle('active', item.dataset.skillItem === key));
    skillsCaptions.forEach(c => c.classList.toggle('active', c.dataset.skillCaption === key));
    skillsSlides.forEach(slide => {
      const active = slide.dataset.skillSlide === key;
      const wasActive = slide.classList.contains('active');
      slide.classList.toggle('active', active);
      const video = slide.querySelector('video');
      if (!video) return;
      if (!active) { video.pause(); return; }
      if (!wasActive) video.currentTime = 0; // each demo starts from the top when its skill is picked
      video.play().catch(() => {});
    });
  }
  document.querySelectorAll('.skills-item-head').forEach(head => {
    head.addEventListener('click', () => setActiveSkill(parseInt(head.dataset.skill, 10)));
  });
  document.querySelectorAll('.skills-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => setActiveSkill(activeSkill + parseInt(btn.dataset.skillStep, 10)));
  });
}

// ---------- partners (creator feedback): featured quote that rotates ----------
const partnersFeature = document.querySelector('.partners-feature');
if (partnersFeature) {
  const avatars = [...partnersFeature.querySelectorAll('.partners-avatar')];
  const panes = [...partnersFeature.querySelectorAll('[data-partner-slide]')];
  let current = 0, timer = null, hovering = false;
  function showPartner(i) {
    current = (i + avatars.length) % avatars.length;
    avatars.forEach((a, k) => { a.classList.toggle('active', k === current); a.setAttribute('aria-selected', k === current ? 'true' : 'false'); });
    panes.forEach(p => p.classList.toggle('active', p.dataset.partnerSlide === String(current)));
  }
  // advance every 7s while the section is on screen and not hovered
  const schedule = () => { clearInterval(timer); timer = setInterval(() => { if (!hovering) showPartner(current + 1); }, 7000); };
  avatars.forEach((a, k) => a.addEventListener('click', () => { showPartner(k); schedule(); }));
  partnersFeature.addEventListener('mouseenter', () => { hovering = true; });
  partnersFeature.addEventListener('mouseleave', () => { hovering = false; });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) schedule(); else clearInterval(timer); }), { threshold: 0.3 }).observe(partnersFeature);
  } else schedule();
  showPartner(0);
}
if ('IntersectionObserver' in window) {
  const videoIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (!entry.isIntersecting) video.pause();
      else if (videoShouldPlay(video)) video.play().catch(() => {});
    });
  }, { threshold: 0.05 });
  document.querySelectorAll('video').forEach(video => videoIO.observe(video));
}

// ---------- only decode the videos that are on screen ----------
// looping clips otherwise keep playing after they scroll away, so several videos decode at once
function videoShouldPlay(video) {
  const slide = video.closest('.adv3-slide, .skills-slide');
  if (slide) return slide.classList.contains('active');
  if (video.classList.contains('showcase-video')) return video.classList.contains('active') && video.closest('.showcase-panel').classList.contains('active');
  if (video.classList.contains('hero-bg-video')) return video.classList.contains('active');
  return video.autoplay;
}
if ('IntersectionObserver' in window) {
  const videoIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (!entry.isIntersecting) video.pause();
      else if (videoShouldPlay(video)) video.play().catch(() => {});
    });
  }, { threshold: 0.05 });
  document.querySelectorAll('video').forEach(video => videoIO.observe(video));
}

// ---------- buffer every showcase clip before it is needed ----------
// clips start as preload="metadata"; once the section is close, let all of them download so
// switching with the tab or next button plays from buffer instead of stalling mid-download
const showcaseSection = document.getElementById('scenarios');
if (showcaseSection && showcaseVideos.length) {
  const bufferAll = () => showcaseVideos.forEach(video => { video.preload = 'auto'; });
  if ('IntersectionObserver' in window) {
    const preloadIO = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) { bufferAll(); preloadIO.disconnect(); }
    }, { rootMargin: '800px 0px' });
    preloadIO.observe(showcaseSection);
  } else {
    bufferAll();
  }
}

// ---------- closing CTA wall: only animate while on screen ----------
const ctaWall = document.querySelector('.cta-wall');
if (ctaWall) {
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => entries.forEach(e => ctaWall.classList.toggle('in-view', e.isIntersecting))).observe(ctaWall);
  } else ctaWall.classList.add('in-view');
}

// ---------- FAQ accordion: one answer open at a time ----------
const faqItems = [...document.querySelectorAll('.faq-item')];
faqItems.forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const opening = !item.classList.contains('open');
    faqItems.forEach(other => {
      const on = other === item && opening;
      other.classList.toggle('open', on);
      other.querySelector('.faq-q').setAttribute('aria-expanded', on ? 'true' : 'false');
    });
  });
});
