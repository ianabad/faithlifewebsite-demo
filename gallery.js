const gallery = document.querySelector('[data-gallery]');
const slides = Array.from(gallery.querySelectorAll(':scope > img'));
const play = gallery.querySelector('[data-play]');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let playing = !reducedMotion.matches;
let current = 0;
let timer;
let motion;
let zoomIn = true;

function showPhoto(offset) {
  current = (current + offset + slides.length) % slides.length;
  if (motion) motion.pause();
  if (playing && !reducedMotion.matches && slides[current].animate) {
    const scales = zoomIn ? [1, 1.035] : [1.035, 1];
    slides[current].getAnimations().filter(a => a.id === "hero-zoom").forEach(a => a.cancel());
    motion = slides[current].animate(scales.map(scale => ({ transform: "scale(" + scale + ")" })), { duration: 6500, fill: "both", easing: "ease-in-out", id: "hero-zoom" });
    motion.id = "hero-zoom";
    zoomIn = !zoomIn;
  }
  slides.forEach((slide, index) => {
    slide.classList.toggle('gallery-active', index === current);
    slide.classList.toggle('gallery-inactive', index !== current);
    slide.setAttribute('aria-hidden', String(index !== current));
  });
}

function updatePlayback() {
  clearInterval(timer);
  play.querySelector('path').setAttribute('d', playing ? 'M5 3v10M11 3v10' : 'm5 3 8 5-8 5z');
  if (motion && (!playing || document.hidden)) motion.pause();
  else if (motion && motion.playState === 'paused') motion.play();
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
  slides.forEach(slide => slide.getAnimations().filter(a => a.id === "hero-zoom").forEach(a => a.cancel()));
  motion = null;
  playing = !reducedMotion.matches;
  updatePlayback();
});
document.addEventListener('visibilitychange', updatePlayback);
showPhoto(0);
updatePlayback();
gallery.querySelector('.gallery-controls').hidden = false;
