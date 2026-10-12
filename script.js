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
const heroBgVideos = document.querySelectorAll('.hero-bg-video');
if (heroBgVideos.length > 1) {
  function playHeroBgVideo(index) {
    heroBgVideos.forEach((video, i) => {
      video.classList.toggle('active', i === index);
      if (i === index) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }
  heroBgVideos.forEach((video, i) => {
    video.addEventListener('ended', () => {
      playHeroBgVideo((i + 1) % heroBgVideos.length);
    });
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

// ---------- showcase scroll-linked stage (left-video -> right-video-bigger -> full-bleed) ----------
const showcaseScroll = document.getElementById('showcase-scroll');
const showcaseDots = document.querySelectorAll('.showcase-dot');
const showcaseMedia = document.getElementById('showcase-media');
const showcaseVideos = document.querySelectorAll('.showcase-video');
const showcaseCopy1 = document.getElementById('showcase-copy-1');
const showcaseCopy2 = document.getElementById('showcase-copy-2');
if (showcaseScroll && showcaseMedia && showcaseVideos.length === 2 && showcaseCopy1 && showcaseCopy2) {
  showcaseScroll.style.setProperty('--slides', 2);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = v => Math.min(1, Math.max(0, v));
  const easeInOutCubic = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // keyframes as % of the stage width: [left, width]
  const KF0 = [0, 54];   // stage 1: video left, smaller
  const KF1 = [28, 72];  // stage 2: video right, bigger
  const KF2 = [0, 100];  // stage 3: video fills the stage

  function applyStage(mediaLeft, mediaWidth, video1Opacity, copy1Opacity, copy2Opacity, activeDotIndex) {
    showcaseMedia.style.left = mediaLeft + '%';
    showcaseMedia.style.width = mediaWidth + '%';
    showcaseVideos[0].style.opacity = video1Opacity;
    showcaseVideos[1].style.opacity = 1 - video1Opacity;
    showcaseVideos[0].classList.toggle('active', video1Opacity >= 0.5);
    showcaseVideos[1].classList.toggle('active', video1Opacity < 0.5);
    if (video1Opacity > 0) showcaseVideos[0].play().catch(() => {}); else showcaseVideos[0].pause();
    if (video1Opacity < 1) showcaseVideos[1].play().catch(() => {}); else showcaseVideos[1].pause();
    showcaseCopy1.style.opacity = copy1Opacity;
    showcaseCopy2.style.opacity = copy2Opacity;
    showcaseCopy1.classList.toggle('active', copy1Opacity > 0.05);
    showcaseCopy2.classList.toggle('active', copy2Opacity > 0.05);
    showcaseDots.forEach((dot, i) => dot.classList.toggle('active', i === activeDotIndex));
  }

  let showcaseTicking = false;
  function updateShowcase() {
    showcaseTicking = false;
    const rect = showcaseScroll.getBoundingClientRect();
    const scrollable = showcaseScroll.offsetHeight - window.innerHeight;
    const t = scrollable > 0 ? clamp01(-rect.top / scrollable) : 0;

    if (reduceMotion) {
      // snap straight to whichever of the 3 stages owns this segment
      const stage = Math.min(2, Math.floor(t * 3));
      const [left, width] = stage === 0 ? KF0 : stage === 1 ? KF1 : KF2;
      applyStage(left, width, stage === 0 ? 1 : 0, stage === 0 ? 1 : 0, stage === 1 ? 1 : 0, stage === 0 ? 0 : 1);
      return;
    }

    let left, width;
    if (t <= 0.5) {
      const e = easeInOutCubic(t / 0.5);
      left = lerp(KF0[0], KF1[0], e);
      width = lerp(KF0[1], KF1[1], e);
    } else {
      const e = easeInOutCubic((t - 0.5) / 0.5);
      left = lerp(KF1[0], KF2[0], e);
      width = lerp(KF1[1], KF2[1], e);
    }

    const video1Opacity = 1 - clamp01((t - 0.45) / 0.1);
    const copy1Opacity = 1 - clamp01((t - 0.3) / 0.2);
    let copy2Opacity;
    if (t < 0.5) copy2Opacity = 0;
    else if (t < 0.68) copy2Opacity = clamp01((t - 0.5) / 0.18);
    else if (t < 0.8) copy2Opacity = 1;
    else copy2Opacity = 1 - clamp01((t - 0.8) / 0.2);

    applyStage(left, width, video1Opacity, copy1Opacity, copy2Opacity, t < 0.5 ? 0 : 1);
  }

  function onShowcaseScroll() {
    if (!showcaseTicking) {
      showcaseTicking = true;
      requestAnimationFrame(updateShowcase);
    }
  }
  window.addEventListener('scroll', onShowcaseScroll, { passive: true });
  window.addEventListener('resize', onShowcaseScroll);
  updateShowcase();

  showcaseDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.slideTo, 10);
      const scrollable = showcaseScroll.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const rect = showcaseScroll.getBoundingClientRect();
      const targetProgress = idx === 0 ? 0.001 : 0.5;
      const targetY = window.scrollY + rect.top + targetProgress * scrollable;
      window.scrollTo({ top: targetY, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });
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
const skillsScroll = document.getElementById('skills-scroll');
const skillsItems = document.querySelectorAll('.skills-item');
const skillsSlides = document.querySelectorAll('.skills-slide');
if (skillsItems.length && skillsSlides.length) {
  function setActiveSkill(target) {
    skillsItems.forEach(i => i.classList.toggle('active', i.dataset.skill === target));
    skillsSlides.forEach(slide => {
      const active = slide.dataset.skillSlide === target;
      slide.classList.toggle('active', active);
      const video = slide.querySelector('video');
      if (video) { if (active) video.play().catch(() => {}); else video.pause(); }
    });
  }

  skillsItems.forEach(item => {
    item.addEventListener('click', () => setActiveSkill(item.dataset.skill));
  });

  if (skillsScroll) {
    const skillCount = skillsItems.length;
    skillsScroll.style.setProperty('--skills-slides', skillCount);

    let skillsTicking = false;
    function updateSkillsScroll() {
      skillsTicking = false;
      const rect = skillsScroll.getBoundingClientRect();
      const scrollable = skillsScroll.offsetHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
      const activeIndex = Math.min(skillCount - 1, Math.floor(progress * skillCount));
      setActiveSkill(String(activeIndex));
    }
    function onSkillsScroll() {
      if (!skillsTicking) {
        skillsTicking = true;
        requestAnimationFrame(updateSkillsScroll);
      }
    }
    window.addEventListener('scroll', onSkillsScroll, { passive: true });
    window.addEventListener('resize', onSkillsScroll);
    updateSkillsScroll();
  }
}

// ---------- partners (creator feedback) ----------
const partnersAvatars = document.querySelectorAll('.partners-avatar');
const partnersSlides = document.querySelectorAll('.partners-slide');
if (partnersAvatars.length && partnersSlides.length) {
  partnersAvatars.forEach(avatar => {
    avatar.addEventListener('click', () => {
      const target = avatar.dataset.partner;
      partnersAvatars.forEach(a => a.classList.toggle('active', a === avatar));
      partnersSlides.forEach(slide => slide.classList.toggle('active', slide.dataset.partnerSlide === target));
    });
  });
}
