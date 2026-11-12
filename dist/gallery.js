// Homepage hero: photo gallery with a headline word that changes with each photo.
const gallery = document.querySelector('[data-gallery]');
const slides = Array.from(gallery.querySelectorAll(':scope > img'));
const steps = Array.from(gallery.querySelectorAll('[data-step]'));
const words = Array.from(document.querySelectorAll('.hero-word'));
const play = gallery.querySelector('[data-play]');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const DURATION = 6500;
let playing = !reducedMotion.matches;
let visible = true;
let current = 0;
let timer;
let motion;
let zoomIn = true;

gallery.style.setProperty('--slide-duration', DURATION + 'ms');

function zoom(slide) {
  if (motion) motion.cancel();
  motion = null;
  if (reducedMotion.matches || !slide.animate) return;
  const scales = zoomIn ? [1, 1.04] : [1.04, 1];
  motion = slide.animate(scales.map(scale => ({ transform: 'scale(' + scale + ')' })), { duration: DURATION + 900, fill: 'both', easing: 'ease-in-out' });
  if (!playing || !visible) motion.pause();
  zoomIn = !zoomIn;
}

function setWord(index) {
  words.forEach((word, i) => {
    const wasActive = word.classList.contains('is-active');
    word.classList.toggle('is-active', i === index);
    word.classList.toggle('is-leaving', wasActive && i !== index);
  });
}

function show(index) {
  current = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => {
    slide.classList.toggle('gallery-active', i === current);
    slide.classList.toggle('gallery-inactive', i !== current);
    slide.setAttribute('aria-hidden', String(i !== current));
    if (i === current) slide.loading = 'eager';
  });
  steps.forEach((step, i) => {
    step.classList.toggle('is-done', i < current);
    step.classList.toggle('is-current', i === current);
    step.setAttribute('aria-current', i === current ? 'true' : 'false');
    // Restart the progress fill on the current step.
    const bar = step.firstElementChild;
    bar.style.animation = 'none';
    void bar.offsetWidth;
    bar.style.animation = '';
  });
  setWord(current);
  zoom(slides[current]);
  schedule();
}

function schedule() {
  clearTimeout(timer);
  const running = playing && visible && !document.hidden;
  gallery.classList.toggle('is-paused', !running);
  if (motion) running ? motion.play() : motion.pause();
  if (running) timer = setTimeout(() => show(current + 1), DURATION);
}

function setIcon() {
  play.querySelector('path').setAttribute('d', playing ? 'M5 3v10M11 3v10' : 'm5 3 8 5-8 5z');
  play.setAttribute('aria-label', playing ? 'Pause photo rotation' : 'Play photo rotation');
}

function setPlaying(value) {
  playing = value;
  setIcon();
  if (playing) show(current); else schedule();
}

steps.forEach(step => step.addEventListener('click', () => show(Number(step.dataset.step))));
play.addEventListener('click', () => setPlaying(!playing));

// Swipe between photos on touch screens.
let startX = null;
gallery.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse' && !event.target.closest('button')) startX = event.clientX;
});
gallery.addEventListener('pointerup', event => {
  if (startX === null) return;
  const distance = event.clientX - startX;
  startX = null;
  if (Math.abs(distance) > 40) show(current + (distance < 0 ? 1 : -1));
});
gallery.addEventListener('pointercancel', () => { startX = null; });

// Arrow keys move between photos when a control has focus.
gallery.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    show(current + (event.key === 'ArrowRight' ? 1 : -1));
    steps[current].focus();
  }
});

// Pause while the hero is off screen or the tab is hidden.
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    schedule();
  }, { threshold: 0.25 }).observe(gallery);
}
document.addEventListener('visibilitychange', schedule);
reducedMotion.addEventListener('change', () => setPlaying(!reducedMotion.matches));

gallery.querySelector('.gallery-controls').hidden = false;
setIcon();
show(0);

// Show the date of the next Sunday gathering, in Winnipeg time.
(function nextGathering() {
  const target = document.querySelector('[data-next-gathering]');
  if (!target || !window.Intl) return;
  try {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Winnipeg', year: 'numeric', month: 'numeric', day: 'numeric',
      weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
    }).formatToParts(new Date()).map(p => [p.type, p.value]));
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday.replace('.', ''));
    if (weekday < 0) return;
    const minutes = Number(parts.hour) * 60 + Number(parts.minute);
    let days = (7 - weekday) % 7;
    if (days === 0 && minutes >= 15 * 60 + 30) days = 7;
    if (days === 0) {
      target.textContent = minutes < 13 * 60 + 30 ? 'Today at 1:30 PM' : 'Gathering now, until about 3:30 PM';
      return;
    }
    const date = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) + days));
    const label = new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC', month: 'long', day: 'numeric' }).format(date);
    target.textContent = (days <= 6 ? 'This Sunday, ' : 'Sunday, ') + label + ' at 1:30 PM';
  } catch (error) {
    // Keep the default "Sundays at 1:30 PM".
  }
})();

// "Your first Sunday": the line fills and each step lights up as you scroll through it.
(function visitTimeline() {
  const list = document.querySelector('[data-timeline]');
  if (!list) return;
  const steps = Array.from(list.querySelectorAll('.visit-step'));
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  list.closest('section').classList.add('js-timeline');
  let ticking = false;
  function update() {
    const marker = innerHeight * 0.62;
    if (still.matches) {
      list.style.setProperty('--progress', 1);
      steps.forEach(step => step.classList.add('is-reached'));
      return;
    }
    const box = list.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (marker - box.top) / box.height));
    list.style.setProperty('--progress', progress.toFixed(3));
    steps.forEach(step => {
      const dot = step.querySelector('.visit-dot').getBoundingClientRect();
      step.classList.toggle('is-reached', dot.top + dot.height / 2 <= marker);
    });
  }
  function request() {
    if (ticking) return;
    ticking = true;
    update();
    requestAnimationFrame(() => { ticking = false; });
    setTimeout(() => { if (ticking) { ticking = false; update(); } }, 100);
  }
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
  still.addEventListener('change', request);
  update();
})();
