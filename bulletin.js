const strip = document.querySelector('#bulletin-strip');
const nav = document.querySelector('.bulletin-nav');
const items = Array.from(strip.children);
const back = nav.querySelector('[data-back]');
const forward = nav.querySelector('[data-forward]');
const count = nav.querySelector('span');

function currentIndex() {
  const step = items[1].offsetLeft - items[0].offsetLeft;
  return Math.min(items.length - 1, Math.max(0, Math.round(strip.scrollLeft / step)));
}

function update() {
  const index = currentIndex();
  count.textContent = (index + 1) + ' of ' + items.length;
  back.disabled = index === 0;
  forward.disabled = index === items.length - 1;
}

function move(direction) {
  const index = Math.max(0, Math.min(items.length - 1, currentIndex() + direction));
  strip.scrollTo({left: items[index].offsetLeft - items[0].offsetLeft});
}

if (items.length > 1) {
  nav.hidden = false;
  back.onclick = () => move(-1);
  forward.onclick = () => move(1);
  strip.addEventListener('scroll', update, {passive:true});
  strip.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
    if (event.target !== strip) items[currentIndex()].focus({preventScroll:true});
  });
  window.addEventListener('resize', update);
  update();
}
