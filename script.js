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

// ---------- showcase tabs, each with its own playlist of clips ----------
const showcaseVideos = [...document.querySelectorAll('.showcase-video')];
const showcaseTabs = [...document.querySelectorAll('.showcase-tab')];
const showcaseInfos = document.querySelectorAll('.showcase-info');
const showcaseControls = document.querySelector('.showcase-controls');
const showcaseNext = document.querySelector('.showcase-next');
if (showcaseVideos.length && showcaseTabs.length) {
  const clipsOf = tab => showcaseVideos.filter(v => v.dataset.tab === tab);
  const clipPosition = {}; // last clip shown per tab, so switching tabs back resumes there
  let activeTab = (showcaseTabs.find(t => t.classList.contains('active')) || showcaseTabs[0]).dataset.videoTo;
  let pauseTimer;
  function showClip(tab, index) {
    const clips = clipsOf(tab);
    if (!clips.length) return;
    index = (index + clips.length) % clips.length;
    clipPosition[tab] = index;
    activeTab = tab;
    const target = clips[index];
    showcaseTabs.forEach(t => {
      const on = t.dataset.videoTo === tab;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (!target.classList.contains('active')) target.currentTime = 0;
    target.play().catch(() => {});
    showcaseVideos.forEach(v => v.classList.toggle('active', v === target));
    showcaseInfos.forEach(info => info.classList.toggle('active', info.dataset.clip === target.dataset.clip));
    if (showcaseControls) showcaseControls.hidden = clips.length < 2;
    clearTimeout(pauseTimer);
    pauseTimer = setTimeout(() => {
      showcaseVideos.forEach(v => { if (v !== target) v.pause(); });
    }, 700);
  }
  showcaseTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.dataset.videoTo === activeTab) return;
      showClip(tab.dataset.videoTo, clipPosition[tab.dataset.videoTo] || 0);
    });
  });
  if (showcaseNext) showcaseNext.addEventListener('click', () => showClip(activeTab, (clipPosition[activeTab] || 0) + 1));
  showClip(activeTab, 0);
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
      slide.classList.toggle('active', active);
      const video = slide.querySelector('video');
      if (video) { if (active) video.play().catch(() => {}); else video.pause(); }
    });
  }
  document.querySelectorAll('.skills-item-head').forEach(head => {
    head.addEventListener('click', () => setActiveSkill(parseInt(head.dataset.skill, 10)));
  });
  document.querySelectorAll('.skills-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => setActiveSkill(activeSkill + parseInt(btn.dataset.skillStep, 10)));
  });
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

// ---------- only decode the videos that are on screen ----------
// looping clips otherwise keep playing after they scroll away, so several videos decode at once
function videoShouldPlay(video) {
  const slide = video.closest('.adv3-slide');
  if (slide) return slide.classList.contains('active');
  if (video.classList.contains('showcase-video') || video.classList.contains('hero-bg-video')) return video.classList.contains('active');
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
