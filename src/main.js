import Lenis from 'lenis';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function ss(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}
const easeOutExpo  = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

/*  scroll map:
    0–1  opener
    1–2  p1 (services)
    2–3  p2 (security)
    3–5  final: tilt rise + settle
*/
const PAGES = 4;
let vh = window.innerHeight;

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

const panels = ['p1','p2'].map(id => {
  const el = document.getElementById(id);
  return { el, words: [...el.querySelectorAll('.word')], eye: el.querySelector('.t-eye'), sub: el.querySelector('.t-sub') };
});

// p1=light(245), p2=dark(8), final=white(255)
const panelBrightness = [0, 245, 8, 255];

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

/* Panel hover — JS-driven to bypass pointer-events/perspective interference */
const fpanels = [...document.querySelectorAll('.fpanel')];
fpanels.forEach(panel => {
  panel.addEventListener('mouseenter', () => {
    fpanels.forEach(p => p.classList.remove('hovered'));
    panel.classList.add('hovered');
  });
  panel.addEventListener('mouseleave', () => {
    panel.classList.remove('hovered');
  });
});

function wmColorForSlot(slot) {
  if (slot >= 3) return 0;
  const i = Math.floor(clamp(slot, 0, 2));
  const frac = slot - i;
  const a = panelBrightness[i];
  const b = panelBrightness[Math.min(i + 1, 3)];
  const bg = a + (b - a) * easeOutQuart(clamp(frac, 0, 1));
  return bg < 128 ? 255 : 0;
}

let wmTarget = 255;
let wmCurrent = 255;

function render(scroll) {
  const slot = clamp(scroll, 0, PAGES * vh) / vh;

  pbar.style.width = (clamp(slot / (PAGES - 1), 0, 1) * 100) + '%';
  slot > 0.08 ? cue.classList.add('gone') : cue.classList.remove('gone');

  /* Opener — exits quickly so user sees content fast */
  const p0t = ss(0.05, 0.6, slot);
  p0.style.opacity   = String(1 - p0t);
  p0.style.transform = `scale(${1 - p0t * 0.04}) translateY(${-p0t * 60}px)`;
  p0.style.zIndex    = slot < 0.65 ? '10' : '0';

  /* Text panels */
  panels.forEach(({ el, words, eye, sub }, i) => {
    const localT = slot - (i + 1);
    el.style.clipPath = `inset(${((1 - ss(-1.0, 0.0, localT)) * 100).toFixed(2)}% 0 0 0)`;
    // p2 fades to white as final rises over it
    if (i === 1) {
      const fadeT = easeOutQuart(clamp((slot - 2.0) / 0.5, 0, 1));
      const bg = Math.round(fadeT * 255);
      el.style.background = `rgb(${bg},${bg},${bg})`;
      const textOpacity = 1 - fadeT;
      if (el.querySelector('.t-eye')) el.querySelector('.t-eye').style.opacity = String(textOpacity);
      if (el.querySelector('.t-sub')) el.querySelector('.t-sub').style.opacity = String(textOpacity);
      el.querySelectorAll('.word').forEach(w => w.style.opacity = String(Math.min(parseFloat(w.style.opacity || 1), textOpacity)));
    }
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

  /* Final section — videos rise over p2 text, bg only fills near the end */
  finalEl.style.pointerEvents = slot >= 2.7 ? 'all' : 'none';
  finalEl.style.zIndex        = slot >= 2.0 ? '200' : '0';

  const enterT     = easeOutQuart(clamp((slot - 2) / 0.7, 0, 1));
  const translateY = (1 - enterT) * 100;
  const rotX       = 55 * (1 - enterT);
  const scl        = 1.2 - 0.2 * enterT;

  finalEl.style.background = 'transparent';

  grid.style.transform = `translateY(${translateY.toFixed(2)}vh) rotateX(${rotX.toFixed(2)}deg) scale(${scl.toFixed(3)})`;

  /* Watermark — fades out as final rises */
  wmTarget = wmColorForSlot(slot);
  wmCurrent += (wmTarget - wmCurrent) * 0.08;
  const wmOpacity = (1 - easeOutQuart(clamp((slot - 2.0) / 0.4, 0, 1))) * 0.35;
  wm.style.color = `rgba(${Math.round(wmCurrent)},${Math.round(wmCurrent)},${Math.round(wmCurrent)},${wmOpacity.toFixed(3)})`;
}

lenis.on('scroll', ({ scroll }) => render(scroll));
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
render(0);
