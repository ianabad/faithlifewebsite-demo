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



// Footer tagline: the four lines rise in when the footer arrives, then a soft light moves through them.
(function footerTagline() {
  const list = document.querySelector('[data-tagline]');
  if (!list) return;
  const footer = list.closest('footer');
  Array.from(list.children).forEach((item, i) => item.style.setProperty('--i', i));
  footer.classList.add('js-tagline');
  let done = false, observed = false;
  const reveal = () => {
    if (done) return;
    done = true;
    footer.classList.add('is-in');
    setTimeout(() => footer.classList.add('is-glowing'), 1100);
  };
  const check = () => {
    const box = list.getBoundingClientRect();
    if (box.top < innerHeight * 0.92 && box.bottom > 0) reveal();
  };
  addEventListener('scroll', check, { passive: true });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      observed = true;
      if (entries[0].isIntersecting) { reveal(); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(list);
  }
  check();
  setTimeout(() => { if (!observed) reveal(); }, 1500);
})();
