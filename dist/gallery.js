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

// Winnipeg date helpers shared by the week strip, gatherings and bulletin.
function winnipegNow() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Winnipeg', year: 'numeric', month: 'numeric', day: 'numeric',
    weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
  }).formatToParts(new Date()).map(p => [p.type, p.value]));
  return {
    y: Number(parts.year), m: Number(parts.month), d: Number(parts.day),
    weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday.replace('.', '')),
    minutes: Number(parts.hour) * 60 + Number(parts.minute)
  };
}
function dayOffset(now, days) {
  return new Date(Date.UTC(now.y, now.m - 1, now.d + days));
}
const pad = n => String(n).padStart(2, '0');

// "This week at Faith Life": live week, countdowns, calendar files, and a bulletin that drops past events.
(function thisWeek() {
  const section = document.querySelector('.church-life');
  const strip = document.querySelector('[data-week]');
  if (!section || !strip || !window.Intl) return;
  let now;
  try { now = winnipegNow(); } catch (error) { return; }
  if (now.weekday < 0) return;
  const days = Array.from(strip.querySelectorAll('.week-day'));
  const cards = Array.from(section.querySelectorAll('[data-gathering]'));
  const longDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' });

  // The next seven days, starting today.
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const gatheringDays = cards.map(card => Number(card.dataset.weekday));
  days.forEach((day, i) => {
    const date = dayOffset(now, i);
    const weekday = (now.weekday + i) % 7;
    const hasGathering = gatheringDays.includes(weekday);
    day.style.setProperty('--i', i);
    day.querySelector('.week-name').textContent = i === 0 ? 'Today' : names[weekday];
    day.querySelector('[data-date]').textContent = date.getUTCDate();
    day.classList.toggle('is-today', i === 0);
    day.classList.toggle('has-gathering', hasGathering);
    let dot = day.querySelector('.week-dot');
    if (hasGathering && !dot) day.insertAdjacentHTML('beforeend', '<span class="week-dot" aria-hidden="true"></span>');
    if (!hasGathering && dot) dot.remove();
    day.setAttribute('aria-label', longDate.format(date) + (i === 0 ? ', today' : '') + (hasGathering ? ', gathering' : ''));
  });

  cards.forEach(card => {
    const weekday = Number(card.dataset.weekday);
    const [hour, minute] = card.dataset.start.split(':').map(Number);
    const start = hour * 60 + minute;
    const end = start + Number(card.dataset.minutes);
    let ahead = (weekday - now.weekday + 7) % 7;
    if (ahead === 0 && now.minutes >= end) ahead = 7;
    const soon = card.querySelector('[data-soon]');
    const when = card.querySelector('[data-when]');
    const date = dayOffset(now, ahead);
    card.classList.toggle('is-today', ahead === 0);
    when.textContent = ahead === 0 ? 'Today' : ahead === 1 ? 'Tomorrow' : longDate.format(date).replace(/,.*$/, '') + ', ' + new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC', month: 'long', day: 'numeric' }).format(date);
    soon.textContent = ahead === 0 ? (now.minutes >= start ? 'Happening now' : 'Today') : ahead === 1 ? 'Tomorrow' : 'In ' + ahead + ' days';
    if (soon.textContent === when.textContent) soon.textContent = '';

    // Linked highlight: the card and its day in the strip light up together.
    const day = days[ahead];
    const link = on => day && day.classList.toggle('is-linked', on);
    card.addEventListener('pointerenter', () => link(true));
    card.addEventListener('pointerleave', () => link(false));
    card.addEventListener('focusin', () => link(true));
    card.addEventListener('focusout', () => link(false));

    // Add to calendar: a weekly repeating event, in Winnipeg time.
    card.querySelector('[data-calendar]').addEventListener('click', event => {
      const stamp = d => d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate());
      const endHour = Math.floor(end / 60), endMinute = end % 60;
      const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Faith Life Community Ministries//Website//EN', 'BEGIN:VEVENT',
        'UID:' + card.dataset.title.replace(/\W+/g, '-').toLowerCase() + '@flcmonline.com',
        'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''),
        'DTSTART;TZID=America/Winnipeg:' + stamp(date) + 'T' + pad(hour) + pad(minute) + '00',
        'DTEND;TZID=America/Winnipeg:' + stamp(date) + 'T' + pad(endHour) + pad(endMinute) + '00',
        'RRULE:FREQ=WEEKLY', 'SUMMARY:' + card.dataset.title + ' at Faith Life',
        'LOCATION:427 Matheson Avenue\\, Winnipeg\\, MB R2V 3A7', 'DESCRIPTION:' + card.dataset.desc,
        'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
      const a = Object.assign(document.createElement('a'), { href: url, download: card.dataset.title.replace(/\s+/g, '-') + '-Faith-Life.ics' });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      const label = event.currentTarget.querySelector('span');
      label.textContent = 'Added';
      setTimeout(() => { label.textContent = 'Add to calendar'; }, 2500);
    });
  });

  // Coming up: drop dated notices once their day has passed.
  const todayKey = now.y + '-' + pad(now.m) + '-' + pad(now.d);
  const bulletin = section.querySelector('[data-bulletin]');
  if (bulletin) {
    bulletin.querySelectorAll('[data-until]').forEach(item => { if (item.dataset.until < todayKey) item.remove(); });
    Array.from(bulletin.children).forEach((item, i) => item.style.setProperty('--i', i));
  }

  // Reveal once the section is on screen. Checked on scroll as well as by observer,
  // and forced after a few seconds, so the content can never stay hidden.
  section.classList.add('js-week');
  const reveal = () => {
    section.classList.add('is-in');
    removeEventListener('scroll', check);
  };
  function check() {
    const box = section.getBoundingClientRect();
    if (box.top < innerHeight * 0.85 && box.bottom > 0) reveal();
  }
  addEventListener('scroll', check, { passive: true });
  let observed = false;
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      observed = true;
      if (entries[0].isIntersecting) { reveal(); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(section);
  }
  check();
  // If the browser never reports visibility at all, show everything rather than risk hiding it.
  setTimeout(() => { if (!observed) reveal(); }, 1500);
})();

// "The Word for everyday life": the verse lights up word by word as it scrolls into view.
(function verseReveal() {
  const verse = document.querySelector('[data-verse]');
  if (!verse) return;
  const words = Array.from(verse.querySelectorAll('blockquote span'));
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  verse.closest('section').classList.add('js-verse');
  let busy = false;
  function update() {
    const box = verse.getBoundingClientRect();
    // Starts lighting when the verse is 85% down the screen, finishes by 45%.
    const progress = still.matches ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.85 - box.top) / (innerHeight * 0.4)));
    const lit = Math.round(progress * words.length);
    words.forEach((word, i) => word.classList.toggle('is-lit', i < lit));
  }
  function request() {
    if (busy) return;
    busy = true;
    update();
    requestAnimationFrame(() => { busy = false; });
    setTimeout(() => { if (busy) { busy = false; update(); } }, 100);
  }
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
  still.addEventListener('change', request);
  update();
})();
