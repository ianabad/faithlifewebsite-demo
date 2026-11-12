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
  const ticket = document.querySelector('[data-ticket]');
  if (ticket && window.Intl) {
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
  }
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
