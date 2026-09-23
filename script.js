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

// ---------- showcase scroll-linked slider ----------
const showcaseScroll = document.getElementById('showcase-scroll');
const showcaseDots = document.querySelectorAll('.showcase-dot');
const showcaseSlides = document.querySelectorAll('.showcase-slide');
if (showcaseScroll && showcaseDots.length && showcaseSlides.length) {
  const slideCount = showcaseSlides.length;
  showcaseScroll.style.setProperty('--slides', slideCount);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const easeInOutCubic = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  let showcaseTicking = false;
  function updateShowcase() {
    showcaseTicking = false;
    const rect = showcaseScroll.getBoundingClientRect();
    const scrollable = showcaseScroll.offsetHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;

    if (reduceMotion) {
      // No scrubbed crossfade: jump straight to whichever slide owns this
      // segment of the scroll range (segment k = [k/N, (k+1)/N)).
      const activeIndex = Math.min(slideCount - 1, Math.floor(progress * slideCount));
      showcaseSlides.forEach((slide, i) => {
        const opacity = i === activeIndex ? 1 : 0;
        slide.style.opacity = opacity;
        slide.style.transform = 'none';
        slide.classList.toggle('active', i === activeIndex);
        const video = slide.querySelector('video');
        if (video) { if (opacity > 0) video.play().catch(() => {}); else video.pause(); }
      });
      showcaseDots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
      return;
    }

    const scaled = progress * slideCount;
    const currentIndex = Math.min(slideCount - 1, Math.floor(scaled));
    const nextIndex = Math.min(slideCount - 1, currentIndex + 1);
    const localT = Math.min(1, Math.max(0, scaled - currentIndex));
    const eased = easeInOutCubic(localT);

    showcaseSlides.forEach((slide, i) => {
      let opacity = 0;
      let scale = 0.94;
      if (currentIndex === nextIndex) {
        opacity = i === currentIndex ? 1 : 0;
        scale = i === currentIndex ? 1 : 0.94;
      } else if (i === currentIndex) {
        opacity = 1 - eased;
        scale = 1 - 0.06 * eased;
      } else if (i === nextIndex) {
        opacity = eased;
        scale = 0.94 + 0.06 * eased;
      }
      slide.style.opacity = opacity;
      slide.style.transform = `scale(${scale})`;
      slide.classList.toggle('active', opacity > 0.5 || currentIndex === nextIndex && i === currentIndex);
      const video = slide.querySelector('video');
      if (video) { if (opacity > 0) video.play().catch(() => {}); else video.pause(); }
    });

    const activeDotIndex = eased < 0.5 ? currentIndex : nextIndex;
    showcaseDots.forEach((dot, i) => dot.classList.toggle('active', i === activeDotIndex));
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
      const targetProgress = (idx + 0.001) / slideCount;
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
