import Lenis from 'lenis';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function ss(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}
const easeOutExpo  = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

const PAGES = 6;
let vh = window.innerHeight;

/* ── Scrollable height ── */
document.documentElement.style.height = 'auto';

const spacer = document.createElement('div');
spacer.style.cssText = 'position:relative;width:1px;pointer-events:none;z-index:-1;flex-shrink:0;';
function resize() {
  vh = window.innerHeight;
  spacer.style.height = (PAGES * vh) + 'px';
}
resize();
document.body.appendChild(spacer);
window.addEventListener('resize', resize);

const lenis = new Lenis({
  duration: 1.8,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 0.85,
  touchMultiplier: 2,
});

const p0      = document.getElementById('p0');
const pbar    = document.getElementById('pbar');
const cue     = document.getElementById('cue');
const finalEl = document.getElementById('final');
const grid    = document.getElementById('final-grid');
const wm      = document.getElementById('wm');

const panels = ['p1','p2','p3','p4'].map(id => {
  const el = document.getElementById(id);
  return { el, words: [...el.querySelectorAll('.word')], eye: el.querySelector('.t-eye'), sub: el.querySelector('.t-sub') };
});

p0.style.zIndex = '10';
panels.forEach(({ el, words, eye, sub }, i) => {
  el.style.zIndex   = String(i + 1);
  el.style.clipPath = 'inset(100% 0 0 0)';
  words.forEach(w => { w.style.transform = 'translateY(100%)'; w.style.opacity = '0'; });
  if (eye) { eye.style.opacity = '0'; eye.style.transform = 'translateY(16px)'; }
  if (sub) { sub.style.opacity = '0'; sub.style.transform = 'translateY(12px)'; }
});
finalEl.style.zIndex = '0';

setTimeout(() => p0.classList.add('go'), 80);

/*
  Panel backgrounds (0=opener dark, 1=light, 2=dark, 3=light, 4=dark, 5=final white)
  0 → bg brightness 0 (black)  → logo should be white (high value)
  1 → bg brightness 245        → logo should be black (low value)
  2 → bg brightness 8          → logo white
  3 → bg brightness 245        → logo black
  4 → bg brightness 8          → logo white
  5 → bg brightness 255 (white)→ logo black
*/
const panelBrightness = [0, 245, 8, 245, 8, 255];

function wmColorForSlot(slot) {
  if (slot >= 5) return 0; // final white bg → black logo
  const i = Math.floor(clamp(slot, 0, 4));
  const frac = slot - i;
  const a = panelBrightness[i];
  const b = panelBrightness[Math.min(i + 1, 5)];
  const bg = a + (b - a) * easeOutQuart(clamp(frac, 0, 1));
  // invert: dark bg → white logo, light bg → dark logo
  return bg < 128 ? 255 : 0;
}

let wmTarget = 255;
let wmCurrent = 255;

function render(scroll) {
  const slot = clamp(scroll, 0, PAGES * vh) / vh;

  pbar.style.width = (clamp(slot / (PAGES - 1), 0, 1) * 100) + '%';
  slot > 0.08 ? cue.classList.add('gone') : cue.classList.remove('gone');

  /* Opener */
  const p0t = ss(0.1, 0.9, slot);
  p0.style.opacity   = String(1 - p0t);
  p0.style.transform = `scale(${1 - p0t * 0.04}) translateY(${-p0t * 60}px)`;
  p0.style.zIndex    = slot < 0.95 ? '10' : '0';

  /* Text panels */
  panels.forEach(({ el, words, eye, sub }, i) => {
    const localT = slot - (i + 1);
    el.style.clipPath = `inset(${((1 - ss(-1.0, 0.0, localT)) * 100).toFixed(2)}% 0 0 0)`;
    el.style.zIndex   = String(i + 1);
    const revT = ss(-0.9, 0.0, localT);
    words.forEach((w, wi) => {
      const stagger = wi * 0.07;
      const wt = clamp((revT - stagger) / (1 - Math.min(stagger, 0.75)), 0, 1);
      const ez = easeOutExpo(wt);
      w.style.transform = `translateY(${((1 - ez) * 100).toFixed(2)}%)`;
      w.style.opacity   = String(clamp(wt * 4, 0, 1));
    });
    if (eye) {
      const et = clamp(ss(-0.92, -0.12, localT), 0, 1);
      eye.style.opacity   = String(et);
      eye.style.transform = `translateY(${((1 - easeOutQuart(et)) * 16).toFixed(2)}px)`;
    }
    if (sub) {
      const st = clamp(ss(-0.65, 0.05, localT), 0, 1);
      sub.style.opacity   = String(st);
      sub.style.transform = `translateY(${((1 - easeOutQuart(st)) * 12).toFixed(2)}px)`;
    }
  });

  /* Final section */
  finalEl.style.pointerEvents = slot >= 4.95 ? 'all' : 'none';
  finalEl.style.zIndex        = slot >= 4.0 ? '200' : '0';

  const enterT     = easeOutQuart(clamp((slot - 4) / 1, 0, 1));
  const translateY = (1 - enterT) * 100;
  const rotX       = 55 * (1 - enterT);
  const scl        = 1.2 - 0.2 * enterT;

  // bg: black at slot 4.0, white by slot 4.4
  if (slot < 4.0) {
    finalEl.style.background = 'transparent';
  } else {
    const bgT = easeOutQuart(clamp((slot - 4.0) / 0.4, 0, 1));
    const bg = Math.round(bgT * 255);
    finalEl.style.background = `rgb(${bg},${bg},${bg})`;
  }

  grid.style.transform = `translateY(${translateY.toFixed(2)}vh) rotateX(${rotX.toFixed(2)}deg) scale(${scl.toFixed(3)})`;

  /* Watermark chameleon color — smooth lerp toward target, fade out on p5 */
  wmTarget = wmColorForSlot(slot);
  wmCurrent += (wmTarget - wmCurrent) * 0.08;
  const wmOpacity = (1 - easeOutQuart(clamp((slot - 4.0) / 0.4, 0, 1))) * 0.35;
  wm.style.color = `rgba(${Math.round(wmCurrent)},${Math.round(wmCurrent)},${Math.round(wmCurrent)},${wmOpacity.toFixed(3)})`;
}

lenis.on('scroll', ({ scroll }) => render(scroll));
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
render(0);
