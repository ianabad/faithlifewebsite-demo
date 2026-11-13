const menu=document.querySelector('#menu'),nav=document.querySelector('#nav');
function closeMenu(){nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','Open navigation')}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation')});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();document.querySelectorAll('.nav-resources[open]').forEach(d=>d.open=false)}});
document.addEventListener('click',e=>{document.querySelectorAll('.nav-resources[open]').forEach(d=>{if(!d.contains(e.target))d.open=false});if(nav?.classList.contains('open')&&!e.target.closest('header'))closeMenu()});
const year=document.querySelector('#year');if(year)year.textContent=new Date().getFullYear();
const track=document.querySelector('#ministry-cards');
if(track){
const carousel=document.querySelector('.ministry-carousel'),previous=document.querySelector('.carousel-arrow.previous'),next=document.querySelector('.carousel-arrow.next');
function updateCarousel(){const max=track.scrollWidth-track.clientWidth;carousel.classList.toggle('is-scrollable',max>2);previous.disabled=track.scrollLeft<=2;next.disabled=track.scrollLeft>=max-2;track.tabIndex=max>2?0:-1;}
function moveCard(direction){const cards=[...track.children],start=cards[0].offsetLeft,positions=cards.map(card=>card.offsetLeft-start),current=track.scrollLeft;const target=direction>0?positions.find(x=>x>current+3):positions.slice().reverse().find(x=>x<current-3);track.scrollTo({left:target??(direction>0?track.scrollWidth:0),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
previous.addEventListener('click',()=>moveCard(-1));next.addEventListener('click',()=>moveCard(1));track.addEventListener('scroll',updateCarousel,{passive:true});track.addEventListener('keydown',e=>{if(e.target!==track)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();moveCard(e.key==='ArrowRight'?1:-1)}});new ResizeObserver(updateCarousel).observe(track);updateCarousel();
}
const programCards=[...document.querySelectorAll('[data-program-category]')],search=document.querySelector('#program-search'),programButtons=[...document.querySelectorAll('[data-program-filter]')];let programFilter='all';
function filterPrograms(){const query=(search?.value||'').trim().toLowerCase();let count=0;programCards.forEach(card=>{const show=(programFilter==='all'||card.dataset.programCategory===programFilter)&&card.textContent.toLowerCase().includes(query);card.hidden=!show;if(show)count++});const label=document.querySelector('#program-count');if(label)label.textContent=count+' '+(count===1?'ministry':'ministries');const empty=document.querySelector('#program-empty');if(empty)empty.hidden=count>0;}
programButtons.forEach(button=>button.addEventListener('click',()=>{programFilter=button.dataset.programFilter;programButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));filterPrograms()}));search?.addEventListener('input',filterPrograms);
const requestedCategory=new URLSearchParams(location.search).get('category');if(programCards.length&&programButtons.some(b=>b.dataset.programFilter===requestedCategory)){programFilter=requestedCategory;programButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.programFilter===programFilter)));filterPrograms();}
const eventCards=[...document.querySelectorAll('[data-event-category]')],eventButtons=[...document.querySelectorAll('[data-event-filter]')];eventButtons.forEach(button=>button.addEventListener('click',()=>{let count=0;eventButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));eventCards.forEach(card=>{card.hidden=button.dataset.eventFilter!=='all'&&card.dataset.eventCategory!==button.dataset.eventFilter;if(!card.hidden)count++});document.querySelector('#event-count').textContent=count+' '+(count===1?'gathering':'gatherings')}));
const topic=document.querySelector('#contact-topic'),requestedTopic=new URLSearchParams(location.search).get('topic');if(topic&&requestedTopic){topic.textContent='Interested in '+requestedTopic.slice(0,150)+'? Mention it in your message so our team can help you connect.';topic.hidden=false;}
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-arrive');
        observer.unobserve(entry.target);
      }
    }
  });
  document.querySelectorAll('main section > .wrap, footer .footer-layout > *, footer .footer-base').forEach(section => observer.observe(section));
}




// Pause animations: one switch for every moving part on the site, remembered on this device.
(function motionPreference() {
  const root = document.documentElement;
  const button = document.querySelector('[data-motion-toggle]');
  let paused = false;
  try { paused = localStorage.getItem('flcm-motion') === 'paused'; } catch (error) {}
  function apply() {
    root.classList.toggle('motion-paused', paused);
    if (button) {
      button.setAttribute('aria-pressed', String(paused));
      button.querySelector('[data-motion-label]').textContent = paused ? 'Play animations' : 'Pause animations';
      button.querySelector('[data-motion-icon]').setAttribute('d', paused ? 'm8 5 11 7-11 7z' : 'M9 6v12M15 6v12');
    }
    document.dispatchEvent(new CustomEvent('motionpreference', { detail: { paused } }));
  }
  if (button) button.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('flcm-motion', paused ? 'paused' : 'playing'); } catch (error) {}
    apply();
  });
  window.flcmMotionPaused = () => paused;
  apply();
})();


// Shared by the homepage and Plan your visit.
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

// Plan your visit: offer the next Sundays by date, and send the details as one message.
(function visitRsvp() {
  const form = document.querySelector('[data-rsvp]');
  if (!form) return;
  const select = form.querySelector('[data-rsvp-date]');
  try {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Winnipeg', year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short', hour: 'numeric', hourCycle: 'h23'
    }).formatToParts(new Date()).map(p => [p.type, p.value]));
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday.replace('.', ''));
    if (weekday >= 0) {
      let first = (7 - weekday) % 7;
      if (first === 0 && Number(parts.hour) >= 15) first = 7;
      const label = new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' });
      const options = [0, 7, 14, 21].map(extra => label.format(new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) + first + extra))));
      select.innerHTML = '';
      options.concat('Not sure yet').forEach(text => select.add(new Option(text)));
    }
  } catch (error) { /* keep the plain options */ }
  form.addEventListener('submit', () => {
    const data = new FormData(form);
    const note = (data.get('visit-note') || '').trim();
    form.querySelector('[data-rsvp-message]').value =
      'Planning a first visit to Faith Life.\n' +
      'Sunday: ' + data.get('visit-date') + '\n' +
      'Group: ' + data.get('visit-group') + '\n' +
      'Bringing kids: ' + data.get('visit-kids') + (note ? '\nNote: ' + note : '');
  });
})();

// Plan your visit: the next-Sunday ticket and the arrival path.
(function visitPage() {
  document.querySelectorAll('[data-ticket]').forEach(ticket => {
  if (!window.Intl) return;
    try {
      const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Winnipeg', year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
      }).formatToParts(new Date()).map(p => [p.type, p.value]));
      const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday.replace('.', ''));
      const minutes = Number(parts.hour) * 60 + Number(parts.minute);
      if (weekday >= 0) {
        let days = (7 - weekday) % 7;
        if (days === 0 && minutes >= 15 * 60 + 30) days = 7;
        const date = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) + days));
        ticket.querySelector('[data-ticket-day]').textContent = date.getUTCDate();
        ticket.querySelector('[data-ticket-month]').textContent = new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC', month: 'long' }).format(date);
        ticket.querySelector('[data-ticket-soon]').textContent = days === 0 ? (minutes < 13 * 60 + 30 ? 'Today' : 'Happening now') : days === 1 ? 'Tomorrow' : 'In ' + days + ' days';
        ticket.setAttribute('aria-label', 'Next Sunday gathering: ' + new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' }).format(date) + ' at 1:30 PM, 427 Matheson Avenue');
      }
    } catch (error) { /* keep the static text */ }
  });
  const path = document.querySelector('[data-arrive]');
  if (path) {
    Array.from(path.children).forEach((step, i) => step.querySelector('.arrive-icon').style.setProperty('--i', i));
    let observed = false;
    const reveal = () => path.classList.add('is-in');
    const check = () => {
      const box = path.getBoundingClientRect();
      if (box.top < innerHeight * 0.75 && box.bottom > 0) { reveal(); removeEventListener('scroll', check); }
    };
    addEventListener('scroll', check, { passive: true });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        observed = true;
        if (entries[0].isIntersecting) { reveal(); io.disconnect(); }
      }, { threshold: 0.35 });
      io.observe(path);
    }
    check();
    setTimeout(() => { if (!observed) reveal(); }, 1500);
  }
})();

// Bringing kids: the three steps settle in when the section arrives.
(function kidsSteps() {
  const list = document.querySelector('[data-kids]');
  if (!list) return;
  const section = list.closest('section');
  Array.from(list.children).forEach((item, i) => item.style.setProperty('--i', i));
  section.classList.add('js-kids');
  let observed = false;
  const reveal = () => section.classList.add('is-in');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => { observed = true; if (entries[0].isIntersecting) { reveal(); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(list);
  }
  addEventListener('scroll', function check() {
    const box = list.getBoundingClientRect();
    if (box.top < innerHeight * 0.85 && box.bottom > 0) { reveal(); removeEventListener('scroll', check); }
  }, { passive: true });
  setTimeout(() => { if (!observed) reveal(); }, 1500);
})();

// Questions people ask: tap a question, see it sent, then a short typing pause and the answer.
(function faqChat() {
  const root = document.querySelector('[data-chat]');
  if (!root) return;
  const items = Array.from(root.querySelectorAll('.chat-item'));
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches || (window.flcmMotionPaused && window.flcmMotionPaused());
  const arrow = '<svg class="site-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 12h16m-7-7 7 7-7 7"/></svg>';
  const ui = document.createElement('div');
  ui.className = 'chat-ui';
  ui.innerHTML = '<ul class="chat-menu"></ul><div class="chat-window"><div class="chat-head"><span class="chat-avatar"><img src="assets/icon-192.png" alt=""></span><div><strong>Faith Life</strong><span>Answers to common questions</span></div></div><div class="chat-log" aria-live="polite"></div></div>';
  const menu = ui.querySelector('.chat-menu');
  const log = ui.querySelector('.chat-log');
  const buttons = items.map((item, i) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chat-q';
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = '<span>' + item.querySelector('[data-q]').innerHTML + '</span>' + arrow;
    button.addEventListener('click', () => {
      ask(i, false);
      // On phones the reply sits below the list, so bring it into view.
      const box = ui.querySelector('.chat-window').getBoundingClientRect();
      if (box.top > innerHeight - 160 || box.bottom < 120) ui.querySelector('.chat-window').scrollIntoView({ block: 'nearest', behavior: still() ? 'auto' : 'smooth' });
    });
    li.append(button);
    menu.append(li);
    return button;
  });
  let timers = [];
  function ask(i, instant) {
    timers.forEach(clearTimeout);
    timers = [];
    buttons.forEach((button, j) => button.setAttribute('aria-pressed', String(j === i)));
    log.innerHTML = '';
    const q = document.createElement('div');
    q.className = 'bubble bubble-q';
    q.textContent = items[i].querySelector('[data-q]').textContent;
    log.append(q);
    const answer = document.createElement('div');
    answer.className = 'bubble bubble-a';
    answer.innerHTML = items[i].querySelector('[data-a] p').innerHTML;
    if (instant || still()) { log.append(answer); return; }
    const typing = document.createElement('div');
    typing.className = 'bubble bubble-typing';
    typing.setAttribute('aria-hidden', 'true');
    typing.innerHTML = '<i></i><i></i><i></i>';
    timers.push(setTimeout(() => log.append(typing), 250));
    timers.push(setTimeout(() => { typing.remove(); log.append(answer); }, 1100));
  }
  root.append(ui);
  root.classList.add('js-chat');
  ask(0, true);
})();

// About: a line runs from the top edge of the story to the bottom, through every photo, drawing itself as you scroll.
(function storyZig() {
  const section = document.querySelector('[data-story]');
  if (!section) return;
  const rows = Array.from(section.querySelectorAll('.story-row'));
  const svg = section.querySelector('.story-line');
  const base = svg.querySelector('.story-line-base');
  const draw = svg.querySelector('.story-line-draw');
  const tip = svg.querySelector('.story-line-tip');
  const halo = svg.querySelector('.story-line-halo');
  section.classList.add('js-story');
  let length = 0;
  let current = -1;
  function layout() {
    const box = section.getBoundingClientRect();
    const narrow = innerWidth <= 760;
    const wrap = section.querySelector('.wrap').getBoundingClientRect();
    svg.setAttribute('width', box.width);
    svg.setAttribute('height', box.height);
    svg.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
    const points = rows.map(row => {
      const media = row.querySelector('.story-media').getBoundingClientRect();
      return [narrow ? wrap.left - box.left + 4 : media.left - box.left + media.width / 2, media.top - box.top + media.height / 2];
    });
    let d = 'M' + points[0][0] + ' 0 L' + points[0][0] + ' ' + points[0][1];
    for (let i = 1; i < points.length; i++) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      const mid = (y0 + y1) / 2;
      d += ' C' + x0 + ' ' + mid + ' ' + x1 + ' ' + mid + ' ' + x1 + ' ' + y1;
    }
    d += ' L' + points[points.length - 1][0] + ' ' + box.height;
    base.setAttribute('d', d);
    draw.setAttribute('d', d);
    length = draw.getTotalLength();
    draw.style.strokeDasharray = length;
    update();
  }
  function update() {
    const box = section.getBoundingClientRect();
    // Find the point on the line that sits at the middle of the screen, so the tip rests behind a centred picture.
    const targetY = Math.min(box.height, Math.max(0, innerHeight * 0.5 - box.top));
    let lo = 0, hi = length;
    for (let n = 0; n < 22; n++) { const mid = (lo + hi) / 2; if (draw.getPointAtLength(mid).y < targetY) lo = mid; else hi = mid; }
    const drawn = length ? lo : 0;
    const progress = length ? drawn / length : 0;
    draw.style.strokeDashoffset = length - drawn;
    const point = draw.getPointAtLength(drawn);
    [tip, halo].forEach(dot => { dot.setAttribute('cx', point.x); dot.setAttribute('cy', point.y); });
    // The picture the line is passing behind gets a warm glow.
    rows.forEach(row => {
      const m = row.querySelector('.story-media').getBoundingClientRect();
      const x = point.x + box.left, y = point.y + box.top;
      row.classList.toggle('is-lit', (innerWidth <= 760 || (x >= m.left && x <= m.right)) && y >= m.top && y <= m.bottom);
    });
    svg.classList.toggle('is-moving', progress > 0 && progress < 1);
    let active = 0;
    rows.forEach((row, i) => {
      const top = row.getBoundingClientRect().top;
      if (top < innerHeight * 0.5) active = i;
      if (top < innerHeight * 0.85) row.classList.add('is-in');
    });
    if (active === current) return;
    current = active;
    section.style.backgroundColor = rows[active].dataset.bg;
    section.classList.toggle('is-dark', rows[active].hasAttribute('data-dark'));
  }
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', layout);
  addEventListener('load', layout);
  layout();
  setTimeout(() => rows.forEach(row => { if (row.getBoundingClientRect().top < innerHeight) row.classList.add('is-in'); }), 1500);
})();

// About beliefs: icons draw themselves when the list comes into view.
(function beliefs() {
  const list = document.querySelector('[data-beliefs]');
  if (!list) return;
  list.querySelectorAll('.belief').forEach((item, i) => item.style.setProperty('--i', i));
  list.classList.add('js-beliefs');
  let done = false;
  const reveal = () => { if (done) return; done = true; list.classList.add('is-in'); removeEventListener('scroll', check); };
  const check = () => { const box = list.getBoundingClientRect(); if (box.top < innerHeight * 0.85 && box.bottom > 0) reveal(); };
  addEventListener('scroll', check, { passive: true });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { reveal(); io.disconnect(); } }, { threshold: 0.2 });
    io.observe(list);
  }
  check();
})();

// About values: the dot grid brightens around the pointer.
(function valuesGlow() {
  const section = document.querySelector('.about-values');
  if (!section || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  section.addEventListener('pointermove', e => {
    const box = section.getBoundingClientRect();
    section.style.setProperty('--mx', (e.clientX - box.left) + 'px');
    section.style.setProperty('--my', (e.clientY - box.top) + 'px');
  });
  section.addEventListener('pointerleave', () => { section.style.setProperty('--mx', '-999px'); });
})();

// Words that light up as a paragraph scrolls into view (About mission).
(function revealWords() {
  const blocks = Array.from(document.querySelectorAll('[data-reveal-words]'));
  if (!blocks.length) return;
  blocks.forEach(block => block.closest('section').classList.add('js-words'));
  function update() {
    blocks.forEach(block => {
      const words = block.querySelectorAll('span');
      const box = block.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (innerHeight * 0.85 - box.top) / (box.height + innerHeight * 0.3)));
      const lit = Math.round(progress * words.length);
      words.forEach((word, i) => word.classList.toggle('is-lit', i < lit));
    });
  }
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
})();

// About: value tiles open to show what each value means and its verse.
(function valueTiles() {
  document.querySelectorAll('[data-values-grid] .value-btn').forEach(button => {
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      button.closest('.value-tile').classList.toggle('is-open', open);
    });
  });
})();

// Ministries: the sentence picker shows a matching group in the answer card, with its drawing.
(function ministryFinder() {
  const finder = document.querySelector('[data-finder]');
  if (!finder) return;
  const data = JSON.parse(finder.querySelector('[data-finder-data]').textContent);
  const select = finder.querySelector('[data-finder-select]');
  const card = document.querySelector('[data-finder-card]');
  const layers = Array.from(card.querySelectorAll('.finder-layer'));
  const name = card.querySelector('[data-finder-name]');
  const short = card.querySelector('[data-finder-short]');
  const actions = card.querySelector('[data-finder-actions]');
  const defaults = [name.textContent, short.textContent];
  select.addEventListener('change', () => {
    const key = select.value;
    layers.forEach(layer => layer.classList.toggle('is-on', layer.dataset.layer === (key || 'default')));
    document.querySelectorAll('.is-highlight').forEach(el => el.classList.remove('is-highlight'));
    card.classList.remove('is-swapping');
    void card.offsetWidth;
    card.classList.add('is-swapping');
    if (!key) { name.textContent = defaults[0]; short.textContent = defaults[1]; actions.classList.add('is-idle'); return; }
    name.textContent = data[key].name;
    short.textContent = data[key].short;
    const spot = document.getElementById(key);
    const dest = spot && (spot.closest('.story-row') || spot.closest('section'));
    actions.querySelector('[data-finder-see]').setAttribute('href', '#' + (dest && dest.id ? dest.id : key));
    actions.querySelector('[data-finder-ask]').setAttribute('href', 'contact.html?topic=' + encodeURIComponent(data[key].name));
    actions.classList.remove('is-idle');
    const target = document.getElementById(key);
    const glowEl = target && (target.closest('.every-card') || (target.classList.contains('min-serve') ? target.querySelector('.serve-grid') : target.closest('.story-row')));
    document.querySelectorAll('[data-glow-next]').forEach(el => delete el.dataset.glowNext);
    if (glowEl) glowEl.dataset.glowNext = '1';
  });
})();

// Ministries: the season stage holds still while you scroll; each season's drawing redraws in turn.
(function ministryStage() {
  const stage = document.querySelector('[data-stage]');
  const seasons = stage ? Array.from(stage.querySelectorAll('.stage-season')) : [];
  const buttons = stage ? Array.from(stage.querySelectorAll('[data-stage-go]')) : [];
  const desktop = matchMedia('(min-width: 961px)');
  let current = -1;
  function show(i) {
    if (i === current) return;
    current = i;
    seasons.forEach((s, n) => { s.classList.toggle('is-active', n === i); s.classList.toggle('is-in', n === i); });
    buttons.forEach((btn, n) => { btn.classList.toggle('is-done', n < i); if (n === i) btn.setAttribute('aria-current', 'step'); else btn.removeAttribute('aria-current'); });
  }
  function progress() {
    const box = stage.getBoundingClientRect();
    return Math.min(0.999, Math.max(0, -box.top / (box.height - innerHeight)));
  }
  function scrollToSeason(i) {
    if (!desktop.matches) { seasons[i].scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    const top = stage.getBoundingClientRect().top + scrollY;
    const travel = stage.offsetHeight - innerHeight;
    scrollTo({ top: top + travel * (i + 0.5) / seasons.length, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  function update() {
    if (stage) {
      if (desktop.matches) {
        const p = progress();
        stage.style.setProperty('--progress', p);
        show(Math.floor(p * seasons.length));
      } else {
        seasons.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * 0.85) s.classList.add('is-in'); });
      }
    }
    document.querySelectorAll('.every-card').forEach(card => { if (card.getBoundingClientRect().top < innerHeight * 0.85) card.classList.add('is-in'); });
    const connect = document.querySelector('.min-connect');
    if (connect && connect.getBoundingClientRect().top < innerHeight * 0.8) connect.classList.add('is-in');
  }
  const connect = document.querySelector('.min-connect');
  if (connect) connect.classList.add('js-connect');
  if (stage) {
    stage.classList.add('js-stage');
    buttons.forEach(btn => btn.addEventListener('click', () => scrollToSeason(Number(btn.dataset.stageGo))));
    // Links like #youth or #girls jump to the right season instead of a hidden panel.
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const target = document.getElementById(link.getAttribute('href').slice(1));
      const season = target && target.closest('.stage-season');
      if (!season) return;
      e.preventDefault();
      scrollToSeason(seasons.indexOf(season));
    });
    desktop.addEventListener('change', () => { current = -1; seasons.forEach(s => s.classList.remove('is-active')); update(); });
  }
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
})();

// Ministries: point at or tap a star to read that serving team.
(function serveSky() {
  const sky = document.querySelector('[data-sky]');
  if (!sky) return;
  const stars = Array.from(sky.querySelectorAll('[data-star]'));
  const teams = Array.from(document.querySelectorAll('[data-teams] .team'));
  function pick(key) {
    stars.forEach(s => { const on = s.dataset.star === key; s.classList.toggle('is-active', on); s.setAttribute('aria-pressed', String(on)); });
    teams.forEach(t => t.classList.toggle('is-active', t.dataset.team === key));
  }
  stars.forEach(star => {
    star.addEventListener('click', () => pick(star.dataset.star));
    star.addEventListener('pointerenter', () => pick(star.dataset.star));
    star.addEventListener('focus', () => pick(star.dataset.star));
  });
})();

// Ministries: serving icons draw themselves when the grid comes into view.
(function serveGrid() {
  const grid = document.querySelector('[data-serve]');
  if (!grid) return;
  grid.querySelectorAll('.serve-tile').forEach((tile, i) => tile.style.setProperty('--i', i));
  grid.classList.add('js-serve');
  const check = () => { if (grid.getBoundingClientRect().top < innerHeight * 0.85) { grid.classList.add('is-in'); removeEventListener('scroll', check); } };
  addEventListener('scroll', check, { passive: true });
  check();
})();

// Ministries: in seasons with two groups, the switch picks one group and lights its half of the shared drawing.
(function pairSwitch() {
  document.querySelectorAll('.stage-season.is-pair').forEach(season => {
    const buttons = Array.from(season.querySelectorAll('[data-pair]'));
    const groups = Array.from(season.querySelectorAll('.stage-group'));
    const parts = Array.from(season.querySelectorAll('.scene-layer'));
    function pick(i) {
      buttons.forEach((b, n) => b.setAttribute('aria-pressed', String(n === i)));
      groups.forEach((g, n) => g.classList.toggle('is-shown', n === i));
      parts.forEach((p, n) => p.classList.toggle('is-on', n === i));
      season.style.setProperty('--pair', i);
    }
    buttons.forEach((b, i) => b.addEventListener('click', () => pick(i)));
    // A link to the second group (for example #girls) opens that group.
    groups.forEach((g, i) => { if (location.hash === '#' + g.id) pick(i); });
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const i = groups.findIndex(g => '#' + g.id === link.getAttribute('href'));
      if (i >= 0) pick(i);
    });
    pick(groups.findIndex(g => '#' + g.id === location.hash) > 0 ? groups.findIndex(g => '#' + g.id === location.hash) : 0);
  });
})();

// Ministries: on the dark Serve section, a soft light follows the pointer across each team tile.
(function serveLight() {
  const grid = document.querySelector('.min-serve.is-dark [data-serve]');
  if (!grid || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  grid.addEventListener('pointermove', e => {
    const tile = e.target.closest('.serve-tile');
    if (!tile) return;
    const box = tile.getBoundingClientRect();
    tile.style.setProperty('--mx', (e.clientX - box.left) + 'px');
    tile.style.setProperty('--my', (e.clientY - box.top) + 'px');
  });
})();

// Ministries: chapel doors. Opening a door shows that season's groups and redraws its picture.
(function chapelDoors() {
  const list = document.querySelector('[data-doors]');
  if (!list) return;
  const doors = Array.from(list.querySelectorAll('.door'));
  const phone = matchMedia('(max-width: 760px)');
  function redraw(door) { door.classList.remove('is-in'); void door.offsetWidth; door.classList.add('is-in'); }
  function open(door, toggle) {
    const closing = toggle && phone.matches && door.classList.contains('is-open');
    doors.forEach(d => {
      const on = d === door && !closing;
      d.classList.toggle('is-open', on);
      d.querySelector('.door-arch').setAttribute('aria-expanded', String(on));
    });
    if (!closing) redraw(door);
  }
  doors.forEach(door => door.querySelector('.door-arch').addEventListener('click', () => open(door, true)));
  const reveal = () => { if (list.getBoundingClientRect().top < innerHeight * 0.85) { doors.forEach(d => d.classList.add('is-in')); removeEventListener('scroll', reveal); } };
  addEventListener('scroll', reveal, { passive: true });
  reveal();
  setTimeout(() => doors.forEach(d => d.classList.add('is-in')), 2000);
  // Links such as #youth or #girls open the right door.
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.getElementById(link.getAttribute('href').slice(1));
    const door = target && target.closest('.door');
    if (!door) return;
    e.preventDefault();
    open(door, false);
    (phone.matches ? door : list.closest('section')).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });
})();

// Ministries: bento tiles draw when the grid comes into view and redraw when you point at one.
(function bentoTiles() {
  const grid = document.querySelector('[data-bento]');
  if (!grid) return;
  const tiles = Array.from(grid.querySelectorAll('.bento-tile'));
  const reveal = () => { if (grid.getBoundingClientRect().top < innerHeight * 0.85) { tiles.forEach(t => t.classList.add('is-in')); removeEventListener('scroll', reveal); } };
  addEventListener('scroll', reveal, { passive: true });
  reveal();
  setTimeout(() => tiles.forEach(t => t.classList.add('is-in')), 2000);
  tiles.forEach(tile => tile.addEventListener('pointerenter', () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    tile.classList.remove('is-in'); void tile.offsetWidth; tile.classList.add('is-in');
  }));
})();

// Ministries: after "Take me there" lands, the matching group glows softly once.
document.addEventListener('click', e => {
  const link = e.target.closest('[data-finder-see]');
  if (!link) return;
  const dest = document.querySelector(link.getAttribute('href'));
  if (dest && dest.classList.contains('story-row')) {
    e.preventDefault();
    dest.classList.add('is-in');
    dest.querySelector('.story-media').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  }
  const el = document.querySelector('[data-glow-next]');
  if (!el) return;
  delete el.dataset.glowNext;
  setTimeout(() => { el.classList.remove('is-glowing'); void el.offsetWidth; el.classList.add('is-glowing'); }, 650);
});

// Dot grids that brighten around the pointer (About values, Ministries start-here).
(function dotFields() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('.dot-field').forEach(field => {
    field.addEventListener('pointermove', e => {
      const box = field.getBoundingClientRect();
      field.style.setProperty('--mx', (e.clientX - box.left) + 'px');
      field.style.setProperty('--my', (e.clientY - box.top) + 'px');
    });
    field.addEventListener('pointerleave', () => field.style.setProperty('--mx', '-999px'));
  });
})();

// Messages: a living sound wave behind the hero. It breathes like a voice and warms to gold near the pointer.
(function soundWave() {
  const canvas = document.querySelector('[data-wave]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 0, h = 0, dpr = 1, pointer = -9999, visible = true, t = 0, last = 0;
  function size() {
    dpr = Math.min(2, devicePixelRatio || 1);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const layers = [
    { amp: 1, speed: 1, freq: 0.012, alpha: 0.55, width: 2.5 },
    { amp: 0.7, speed: 1.35, freq: 0.017, alpha: 0.3, width: 2 },
    { amp: 0.45, speed: 0.8, freq: 0.009, alpha: 0.18, width: 1.5 }
  ];
  function draw() {
    ctx.clearRect(0, 0, w, h);
    const faint = canvas.classList.contains('is-faint');
    const base = faint ? h * 0.5 : (w < 760 ? h - 48 : h * 0.7);
    const big = Math.min(70, h * 0.09);
    ctx.globalAlpha = faint ? 0.35 : 1;
    layers.forEach((L, li) => {
      const g = ctx.createLinearGradient(0, 0, w, 0);
      const px = Math.max(0, Math.min(1, pointer / w));
      if (pointer > -1000) {
        g.addColorStop(0, `rgba(188,202,242,${L.alpha})`);
        g.addColorStop(Math.max(0, px - 0.12), `rgba(188,202,242,${L.alpha})`);
        g.addColorStop(px, `rgba(246,199,104,${Math.min(1, L.alpha + 0.35)})`);
        g.addColorStop(Math.min(1, px + 0.12), `rgba(188,202,242,${L.alpha})`);
        g.addColorStop(1, `rgba(188,202,242,${L.alpha})`);
      } else { g.addColorStop(0, `rgba(188,202,242,${L.alpha})`); g.addColorStop(1, `rgba(188,202,242,${L.alpha})`); }
      ctx.strokeStyle = g; ctx.lineWidth = L.width; ctx.lineCap = 'round';
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const env = 0.35 + 0.65 * Math.pow(Math.sin((x / w) * Math.PI), 1.2) * (0.6 + 0.4 * Math.sin(t * 0.7 + x * 0.004 + li));
        const near = pointer > -1000 ? Math.exp(-Math.pow((x - pointer) / 140, 2)) * 0.9 : 0;
        const y = base + Math.sin(x * L.freq + t * L.speed * 1.6 + li * 1.7) * big * L.amp * (env + near) * (0.85 + 0.15 * Math.sin(t * 2.1 + x * 0.02));
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    });
  }
  function frame(now) {
    const paused = document.documentElement.classList.contains('motion-paused');
    if (visible && !paused) { t += Math.min(0.05, (now - last) / 1000 || 0.016); draw(); }
    last = now;
    requestAnimationFrame(frame);
  }
  size(); draw();
  addEventListener('resize', () => { size(); draw(); });
  const hero = canvas.parentElement;
  hero.addEventListener('pointermove', e => { pointer = e.clientX - canvas.getBoundingClientRect().left; if (reduce) draw(); });
  hero.addEventListener('pointerleave', () => { pointer = -9999; if (reduce) draw(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(hero);
  if (!reduce) requestAnimationFrame(frame);
})();

// Messages: mark today in the week strip (Winnipeg time).
(function weekStrip() {
  const strip = document.querySelector('[data-week]');
  if (!strip || !window.Intl) return;
  try {
    const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Winnipeg', weekday: 'short' }).format(new Date()).replace('.', '');
    const i = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day);
    const li = strip.querySelector(`[data-dow="${i}"]`);
    if (li) { li.classList.add('is-today'); li.insertAdjacentHTML('beforeend', '<span class="wk-today">Today</span>'); }
  } catch (e) { /* leave the strip as it is */ }
})();

// Growth Track: the tree grows one stage per session as you scroll; the year strip marks this month (Winnipeg time).
(function growthTrack() {
  const grow = document.querySelector('[data-grow]');
  if (grow) {
    const fig = grow.querySelector('.gt-figure');
    const label = grow.querySelector('[data-stage-label]');
    const items = [...grow.querySelectorAll('[data-session]')];
    let current = -1, ticking = false;
    function update() {
      ticking = false;
      const mid = innerHeight * (innerWidth <= 900 ? 0.62 : 0.5);
      let stage = 0;
      items.forEach((li, i) => { if (li.getBoundingClientRect().top + li.offsetHeight * 0.3 < mid) stage = i + 1; });
      const box = grow.getBoundingClientRect();
      if (box.bottom < 0) stage = items.length;
      if (stage === current) return;
      current = stage;
      fig.dataset.stage = stage;
      items.forEach((li, i) => { li.classList.toggle('is-active', i === stage - 1); li.classList.toggle('is-done', i < stage - 1); });
      if (label) label.textContent = 'Class 0' + Math.max(1, stage);
    }
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    update();
  }
  let month = new Date().getMonth() + 1, year = new Date().getFullYear();
  try {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Winnipeg', year: 'numeric', month: 'numeric' }).formatToParts(new Date());
    month = +parts.find(p => p.type === 'month').value; year = +parts.find(p => p.type === 'year').value;
  } catch (e) { /* use the device date */ }
  const strip = document.querySelector('[data-year]');
  if (strip) {
    const li = strip.querySelector(`[data-month="${month}"]`);
    if (li) { li.classList.add('is-today'); li.insertAdjacentHTML('beforeend', '<span class="wk-today">This month</span>'); }
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { strip.classList.add('is-in'); io.disconnect(); } }, { threshold: 0.35 });
      io.observe(strip);
    } else strip.classList.add('is-in');
  }
  const ticket = document.querySelector('[data-gt-ticket]');
  if (ticket) {
    let m, when, soon;
    if (month === 1) { m = 'Jan'; when = 'January ' + year; soon = 'Late this month'; }
    else if (month <= 5) { m = 'May'; when = 'May ' + year; soon = month === 5 ? 'This month' : 'Before summer'; }
    else { m = 'Jan'; when = 'January ' + (year + 1); soon = 'Late January'; }
    ticket.querySelector('[data-gt-month]').textContent = m;
    ticket.querySelector('[data-gt-when]').textContent = when;
    ticket.querySelector('[data-gt-soon]').textContent = soon;
  }
})();

// Growth Track: the hero photos take turns; paused with the motion toggle or reduced motion.
(function gtSlides() {
  const box = document.querySelector('[data-slides]');
  if (!box) return;
  const imgs = [...box.querySelectorAll('.gt-slide')], ticks = [...box.querySelectorAll('.gt-ticks span')];
  if (imgs.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) { box.querySelector('.gt-ticks')?.remove(); return; }
  const dur = 6500; let i = 0, left = dur, last = performance.now(), visible = true;
  box.style.setProperty('--gt-dur', dur + 'ms');
  function show(n) {
    imgs[i].classList.remove('is-on'); ticks[i].classList.remove('is-on'); ticks[i].classList.add('is-done');
    i = n % imgs.length;
    if (i === 0) ticks.forEach(t => t.classList.remove('is-done'));
    imgs[i].classList.add('is-on'); void ticks[i].offsetWidth; ticks[i].classList.add('is-on');
    left = dur;
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(box);
  (function frame(now) {
    const paused = document.documentElement.classList.contains('motion-paused') || document.hidden || !visible;
    if (!paused) { left -= now - last; if (left <= 0) show(i + 1); }
    box.classList.toggle('is-paused', paused);
    last = now; requestAnimationFrame(frame);
  })(last);
})();

// Growth Track: questions as a conversation. Tap a question, it is sent as your message, then Faith Life types and answers.
(function gtChat() {
  const chat = document.querySelector('[data-gt-chat]');
  if (!chat) return;
  const thread = chat.querySelector('.gt-thread'), reset = chat.querySelector('[data-gt-reset]');
  const chips = [...document.querySelectorAll('[data-gt-ask]')];
  const first = thread.innerHTML;
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('motion-paused');
  let busy = false, started = false;
  // Keep your latest question at the top of the window so a long answer reads from its first line.
  const down = () => {
    const you = [...thread.querySelectorAll('.gt-msg.is-you')].pop();
    const max = thread.scrollHeight - thread.clientHeight;
    thread.scrollTo({ top: you ? Math.min(you.offsetTop - 16, max) : max, behavior: calm() ? 'auto' : 'smooth' });
  };
  function add(cls, inner) { const d = document.createElement('div'); d.className = 'gt-msg ' + cls; d.innerHTML = inner; thread.appendChild(d); down(); return d; }
  function ask(i) {
    if (busy) return;
    busy = true; started = true;
    const chip = chips[i];
    chip.classList.add('is-asked');
    chip.querySelector('.gt-chip-ic path').setAttribute('d', 'M5 12.5l4.5 4.5L19 7.5');
    const you = add('is-you', '<p></p>'); you.querySelector('p').textContent = chip.dataset.q;
    reset.hidden = false;
    const tpl = chat.querySelector(`template[data-answer="${i}"]`);
    const answer = () => {
      typing && typing.remove();
      const msg = add('is-us', ''); msg.appendChild(tpl.content.cloneNode(true)); down();
      busy = false;
      if (chips.every(c => c.classList.contains('is-asked')) && !thread.querySelector('.gt-chat-end')) {
        const end = document.createElement('p'); end.className = 'gt-chat-end';
        end.innerHTML = 'Still wondering about something? <a href="contact.html?topic=Growth Track">Ask us directly</a>';
        thread.appendChild(end); down();
      }
    };
    let typing = null;
    if (calm()) return answer();
    setTimeout(() => { typing = add('is-us', '<span class="gt-av" aria-hidden="true"></span><span class="gt-typing" aria-label="Faith Life is typing"><i></i><i></i><i></i></span>'); }, 350);
    setTimeout(answer, 350 + Math.min(1500, 700 + tpl.content.textContent.length * 3));
  }
  chips.forEach((c, i) => c.addEventListener('click', () => {
    ask(i);
    // On phones the conversation sits above the questions, so bring it back into view.
    const r = chat.getBoundingClientRect();
    if (r.top < 0 || r.bottom > innerHeight) chat.scrollIntoView({ block: 'nearest', behavior: calm() ? 'auto' : 'smooth' });
  }));
  reset.addEventListener('click', () => {
    if (busy) return;
    thread.innerHTML = first; reset.hidden = true;
    chips.forEach(c => { c.classList.remove('is-asked'); c.querySelector('.gt-chip-ic path').setAttribute('d', 'M5 12h14m-6-6 6 6-6 6'); });
  });
  // Desktop: the conversation holds its place until you scroll past it, then stays centred in the window,
  // and stops 48px above the end of the section so it never runs into the next one.
  const section = chat.closest('section');
  let shift = 0, queued = false;
  function follow() {
    queued = false;
    if (innerWidth <= 900) { shift = 0; chat.style.transform = ''; return; }
    const r = chat.getBoundingClientRect(), natural = r.top - shift, h = r.height;
    const stop = section.getBoundingClientRect().bottom - 48;
    shift = Math.max(0, Math.min((innerHeight - h) / 2 - natural, stop - natural - h));
    chat.style.transform = shift ? 'translateY(' + shift + 'px)' : '';
  }
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(follow); } }, { passive: true });
  addEventListener('resize', follow);
  follow();
  // The first question asks itself once, when the conversation scrolls into view.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); if (!started) setTimeout(() => { if (!started) ask(0); }, 600); } }, { threshold: 0.6 });
    io.observe(chat);
  }
})();

// Growth Track: registration status. One setting on the section (data-reg="open" or "closed") decides what shows,
// and the hero button follows it. Add ?registration=open or ?registration=closed to the address to preview either state.
(function gtRegistration() {
  const reg = document.querySelector('[data-reg]');
  if (!reg) return;
  const preview = new URLSearchParams(location.search).get('registration');
  if (preview === 'open' || preview === 'closed') reg.dataset.reg = preview;
  const open = reg.dataset.reg === 'open', form = reg.dataset.regForm;
  reg.querySelectorAll('[data-reg-form]').forEach(a => { if (form) a.href = form; });
  if (open && reg.dataset.regCloses) {
    reg.querySelector('[data-reg-closes]').textContent = reg.dataset.regCloses;
    reg.querySelector('[data-reg-closes-line]').hidden = false;
  }
  const cta = document.querySelector('[data-reg-cta]');
  if (cta) {
    const icon = cta.querySelector('span');
    cta.textContent = open ? 'Register now ' : 'Get notified ';
    if (icon) cta.append(icon);
    if (open) { cta.href = form; cta.target = '_blank'; cta.rel = 'noopener'; }
  }
})();

// What's on: sorts the bulletin, drops past events, makes the soonest one the feature ticket,
// counts down to each in Winnipeg time, and hands out calendar files.
(function whatsOn() {
  const list = document.querySelector('[data-events]');
  if (!list) return;
  const pad = n => String(n).padStart(2, '0');
  let y, m, d;
  try {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Winnipeg', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(new Date());
    const get = t => +parts.find(p => p.type === t).value; y = get('year'); m = get('month'); d = get('day');
  } catch (e) { const n = new Date(); y = n.getFullYear(); m = n.getMonth() + 1; d = n.getDate(); }
  const today = Date.UTC(y, m - 1, d), todayKey = y + '-' + pad(m) + '-' + pad(d);
  const wrap = list.querySelector('.wo-list');
  const events = [...list.querySelectorAll('[data-event]')];
  events.forEach(e => { if (e.dataset.date < todayKey) e.remove(); });
  const live = events.filter(e => e.isConnected).sort((a, b) => a.dataset.date.localeCompare(b.dataset.date));
  live.forEach(e => wrap.insertBefore(e, wrap.querySelector('.wo-notice')));
  if (!live.length) list.querySelector('[data-empty]').hidden = false;
  const label = days => days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : 'In ' + days + ' days';
  live.forEach((e, i) => {
    const [ey, em, ed] = e.dataset.date.split('-').map(Number);
    const days = Math.round((Date.UTC(ey, em - 1, ed) - today) / 864e5);
    e.querySelector('[data-soon]').textContent = label(days);
    if (i === 0) {
      e.classList.add('is-next');
      const chip = document.querySelector('[data-next-chip]');
      if (chip) { chip.href = '#' + e.id; chip.querySelector('[data-next-text]').innerHTML = 'Next up: <strong></strong> · ' + label(days); chip.querySelector('strong').textContent = e.dataset.title; chip.hidden = false; }
    }
    // Add to calendar: one event in Winnipeg time; no time given means an all-day entry.
    e.querySelector('[data-cal]').addEventListener('click', ev => {
      const day = e.dataset.date.replace(/-/g, '');
      const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Faith Life Community Ministries//Website//EN', 'BEGIN:VEVENT',
        'UID:' + e.id + '-' + day + '@flcmonline.com', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')];
      if (e.dataset.time) {
        const [h, mi] = e.dataset.time.split(':').map(Number), end = h * 60 + mi + (+e.dataset.minutes || 120);
        lines.push('DTSTART;TZID=America/Winnipeg:' + day + 'T' + pad(h) + pad(mi) + '00', 'DTEND;TZID=America/Winnipeg:' + day + 'T' + pad(Math.floor(end / 60) % 24) + pad(end % 60) + '00');
      } else {
        const next = new Date(Date.UTC(ey, em - 1, ed + 1));
        lines.push('DTSTART;VALUE=DATE:' + day, 'DTEND;VALUE=DATE:' + next.getUTCFullYear() + pad(next.getUTCMonth() + 1) + pad(next.getUTCDate()));
      }
      const esc = t => t.replace(/([,;\\])/g, '\\$1');
      lines.push('SUMMARY:' + esc(e.dataset.title), 'LOCATION:' + esc(e.dataset.where), 'DESCRIPTION:' + esc(e.dataset.desc), 'END:VEVENT', 'END:VCALENDAR');
      const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }));
      const a = Object.assign(document.createElement('a'), { href: url, download: e.id + '-faith-life.ics' });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      const btn = ev.currentTarget, text = btn.querySelector('span');
      btn.classList.add('is-added'); text.textContent = 'Added';
      setTimeout(() => { btn.classList.remove('is-added'); text.textContent = 'Add to calendar'; }, 2500);
    });
  });
  const year = document.querySelector('.wo-year');
  if (year && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { year.classList.add('is-in'); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(year);
  } else if (year) year.classList.add('is-in');
})();

// Next Sunday ticket: line the tear and its notches up with the dashed line above the time.
(function ticketTear() {
  const tickets = [...document.querySelectorAll('.visit-ticket')];
  if (!tickets.length) return;
  const place = () => tickets.forEach(t => { const time = t.querySelector('.visit-ticket-time'); if (time && t.offsetHeight) t.style.setProperty('--tear', time.offsetTop + 'px'); });
  place(); addEventListener('resize', place); if (document.fonts) document.fonts.ready.then(place);
})();

// Home: the three story facts draw their icons once; Coming up tickets count down in Winnipeg time.
(function homeExtras() {
  const facts = document.querySelector('[data-home-facts]');
  if (facts && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    facts.classList.add('js-facts');
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { facts.classList.add('is-in'); io.disconnect(); } }, { threshold: 0.5 });
    io.observe(facts);
  }
  const soon = [...document.querySelectorAll('[data-mt-date]')];
  if (!soon.length) return;
  let y, m, d;
  try {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Winnipeg', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(new Date());
    const get = t => +parts.find(p => p.type === t).value; y = get('year'); m = get('month'); d = get('day');
  } catch (e) { const n = new Date(); y = n.getFullYear(); m = n.getMonth() + 1; d = n.getDate(); }
  const today = Date.UTC(y, m - 1, d);
  soon.forEach(el => {
    const [ey, em, ed] = el.dataset.mtDate.split('-').map(Number);
    const days = Math.round((Date.UTC(ey, em - 1, ed) - today) / 864e5);
    el.textContent = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : days > 1 ? 'In ' + days + ' days' : '';
  });
})();

// Home: the sun rises over the chapel once the This week heading comes into view.
(function clArc() {
  const arc = document.querySelector('[data-cl-arc]');
  if (!arc || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  arc.classList.add('js-arc');
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { arc.classList.add('is-in'); io.disconnect(); } }, { threshold: 0.5 });
  io.observe(arc);
})();

// Resources menu: the photo follows the link you point at or tab to.
(function navResPic() {
  document.querySelectorAll('.nav-res-panel').forEach(panel => {
    const links = [...panel.querySelectorAll('[data-res]')], pics = [...panel.querySelectorAll('[data-res-pic]')];
    const start = Math.max(0, links.findIndex(l => l.hasAttribute('aria-current')));
    const show = i => { links.forEach((l, k) => l.classList.toggle('is-active', k === i)); pics.forEach((p, k) => p.classList.toggle('is-on', k === i)); };
    links.forEach((l, i) => { l.addEventListener('pointerenter', () => show(i)); l.addEventListener('focus', () => show(i)); });
    panel.addEventListener('pointerleave', () => show(start));
    show(start);
  });
})();

// Contact: "I'd like to…" fills in the Subject and shows a short tip. Links from other pages arrive with ?topic= already chosen.
(function contactPicker() {
  const select = document.querySelector('[data-contact-select]');
  if (!select) return;
  const data = JSON.parse(document.querySelector('[data-contact-data]').textContent);
  const subject = document.querySelector('[data-contact-subject]');
  const note = document.querySelector('[data-contact-note]');
  const title = note.querySelector('[data-contact-note-title]'), tip = note.querySelector('[data-contact-note-tip]');
  let auto = '';
  function apply(key, quiet) {
    const t = data[key];
    if (!t) return;
    if (!subject.value || subject.value === auto) {
      subject.value = t.subject; auto = t.subject;
      subject.classList.remove('is-filled'); void subject.offsetWidth; subject.classList.add('is-filled');
    }
    title.textContent = t.subject; tip.textContent = t.tip;
    note.classList.remove('is-changed'); void note.offsetWidth; note.classList.add('is-changed');
    if (!quiet) { const box = note.getBoundingClientRect(); if (box.top > innerHeight || box.bottom < 0) {} }
  }
  select.addEventListener('change', () => apply(select.value));
  const map = { 'growth track': 'growth', 'prayer meeting': 'prayer', 'baptism': 'baptism', 'bible studies': 'group' };
  const asked = (new URLSearchParams(location.search).get('topic') || '').trim().slice(0, 80);
  if (asked) {
    let key = map[asked.toLowerCase()];
    if (!key) {
      key = 'asked';
      data.asked = { subject: asked, tip: 'Tell us what you would like to know about ' + asked + ', and our team will help you connect.' };
      const o = document.createElement('option'); o.value = 'asked'; o.textContent = 'ask about ' + asked; select.insertBefore(o, select.options[1]);
    }
    select.value = key; apply(key, true);
  }
})();
