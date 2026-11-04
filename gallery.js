const gallery = document.querySelector('[data-gallery]');
const slides = Array.from(gallery.querySelectorAll(':scope > img'));
const play = gallery.querySelector('[data-play]');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let playing = !reducedMotion.matches;
let current = 0;
let timer;

function showPhoto(offset) {
  current = (current + offset + slides.length) % slides.length;
  slides.forEach((slide, index) => {
    slide.classList.toggle('gallery-active', index === current);
    slide.classList.toggle('gallery-inactive', index !== current);
    slide.setAttribute('aria-hidden', String(index !== current));
  });
}

function updatePlayback() {
  clearInterval(timer);
  play.textContent = playing ? 'Pause' : 'Play';
  play.setAttribute('aria-label', playing ? 'Pause photo rotation' : 'Start photo rotation');
  if (playing && !document.hidden) timer = setInterval(() => showPhoto(1), 6500);
}

function move(offset) {
  playing = false;
  showPhoto(offset);
  updatePlayback();
}

gallery.querySelector('[data-prev]').onclick = () => move(-1);
gallery.querySelector('[data-next]').onclick = () => move(1);
play.onclick = () => {
  playing = !playing;
  updatePlayback();
};
reducedMotion.addEventListener('change', () => {
  playing = !reducedMotion.matches;
  updatePlayback();
});
document.addEventListener('visibilitychange', updatePlayback);
showPhoto(0);
updatePlayback();
gallery.querySelector('.gallery-controls').hidden = false;
