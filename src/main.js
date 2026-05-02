import Lenis from 'lenis';

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

const testimonials = [
  { name: 'Klaus Bauer',    handle: '@klausbauer', body: 'Suhaili Services transformed our facility management — reliable, professional, and always on time.', img: 'https://randomuser.me/api/portraits/men/34.jpg',   flag: '🇩🇪', country: 'Germany'     },
  { name: 'Amira Hassan',   handle: '@amiraH',     body: 'Outstanding security team. We feel protected around the clock thanks to Suhaili Security.',          img: 'https://randomuser.me/api/portraits/women/44.jpg', flag: '🇪🇬', country: 'Egypt'       },
  { name: 'Pierre Dubois',  handle: '@pierre_d',   body: 'Exceptional cleaning and maintenance service. Our office has never looked better.',                   img: 'https://randomuser.me/api/portraits/men/22.jpg',   flag: '🇫🇷', country: 'France'      },
  { name: 'Sofia Muller',   handle: '@sofiam',     body: 'Their security guards are well-trained and courteous — perfect for corporate events.',                img: 'https://randomuser.me/api/portraits/women/55.jpg', flag: '🇦🇹', country: 'Austria'     },
  { name: 'Omar Al-Rashid', handle: '@omar_ar',    body: 'Suhaili Services handles our entire building operations seamlessly.',                                 img: 'https://randomuser.me/api/portraits/men/61.jpg',   flag: '🇦🇪', country: 'UAE'         },
  { name: 'Laura Schmidt',  handle: '@lauras',     body: 'Fast response, friendly staff, and true professionalism every single visit.',                        img: 'https://randomuser.me/api/portraits/women/32.jpg', flag: '🇨🇭', country: 'Switzerland' },
  { name: 'Yusuf Kaya',     handle: '@yusufk',     body: 'Night security patrols gave us complete peace of mind for our warehouse.',                           img: 'https://randomuser.me/api/portraits/men/47.jpg',   flag: '🇹🇷', country: 'Turkey'      },
  { name: 'Elena Petrova',  handle: '@elenapv',    body: 'The facility team is discreet, efficient, and always goes the extra mile.',                          img: 'https://randomuser.me/api/portraits/women/68.jpg', flag: '🇷🇺', country: 'Russia'      },
  { name: 'Jan de Vries',   handle: '@jandv',      body: 'Contracted Suhaili Security for our retail chain — best decision we made.',                          img: 'https://randomuser.me/api/portraits/men/85.jpg',   flag: '🇳🇱', country: 'Netherlands' },
  { name: 'Fatima Zahra',   handle: '@fatimaz',    body: 'Top-tier service quality that matches our brand standards perfectly.',                               img: 'https://randomuser.me/api/portraits/women/12.jpg', flag: '🇲🇦', country: 'Morocco'     },
];

// Build card — portrait photo as avatar, flag emoji next to name
function buildCard(t) {
  const card = document.createElement('div');
  card.className = 't-card';

  const header = document.createElement('div');
  header.className = 't-card-header';

  // Portrait photo
  const avatar = document.createElement('img');
  avatar.className = 't-avatar';
  avatar.src = t.img;
  avatar.alt = t.name;
  avatar.loading = 'lazy';
  avatar.addEventListener('error', function () { this.style.visibility = 'hidden'; });

  const meta = document.createElement('div');
  meta.className = 't-card-meta';

  // Name row: "Klaus Bauer 🇩🇪"
  const nameEl = document.createElement('span');
  nameEl.className = 't-card-name';
  nameEl.appendChild(document.createTextNode(t.name + ' '));

  const flagEl = document.createElement('span');
  flagEl.className = 't-card-flag';
  flagEl.textContent = t.flag;
  flagEl.setAttribute('role', 'img');
  flagEl.setAttribute('aria-label', t.country);
  nameEl.appendChild(flagEl);

  const handleEl = document.createElement('span');
  handleEl.className = 't-card-handle';
  handleEl.textContent = t.handle;

  meta.appendChild(nameEl);
  meta.appendChild(handleEl);

  header.appendChild(avatar);
  header.appendChild(meta);

  const bodyEl = document.createElement('p');
  bodyEl.className = 't-card-body';
  bodyEl.textContent = '"' + t.body + '"';

  card.appendChild(header);
  card.appendChild(bodyEl);
  return card;
}

// 10 testimonials split across 4 columns with enough variety per column
const COL_A = testimonials.slice(0, 5);                                    // 0-4
const COL_B = testimonials.slice(5, 10);                                   // 5-9
const COL_C = [...testimonials.slice(2, 7)];                               // 2-6
const COL_D = [...testimonials.slice(7, 10), ...testimonials.slice(0, 3)]; // 7-9 + 0-2
const COLS  = [COL_A, COL_B, COL_C, COL_D];

// Populate columns — cards tripled so the -33.333% loop never shows a seam
function initTestimonials() {
  const cols = document.querySelectorAll('.tcol');
  if (!cols.length) return;
  cols.forEach(function (col, i) {
    const track = col.querySelector('.ttrack');
    const items = COLS[i] || COLS[0];
    for (let pass = 0; pass < 3; pass++) {
      items.forEach(function (t) { track.appendChild(buildCard(t)); });
    }
  });
}

initTestimonials();

// Scroll cue: fade out once user starts scrolling
const scrollCue = document.getElementById('scroll-cue');
if (scrollCue) {
  lenis.on('scroll', ({ scroll }) => {
    scrollCue.classList.toggle('hidden', scroll > 40);
  });
}

// Testimonials fade-in — make visible immediately if already in viewport on load
const testiSection = document.getElementById('testimonials');
if (testiSection) {
  const showTesti = function () {
    testiSection.classList.add('visible');
  };
  const rect = testiSection.getBoundingClientRect();
  if (rect.top < window.innerHeight) {
    // Already visible on load (e.g. browser restored scroll position)
    showTesti();
  } else {
    const observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        showTesti();
        observer.disconnect();
      }
    }, { threshold: 0 });
    observer.observe(testiSection);
  }
}

// Force all background videos to play — iOS Safari requires these attributes set via JS
document.querySelectorAll('#bg-split video').forEach(function (vid) {
  vid.muted = true;
  vid.setAttribute('playsinline', '');
  vid.setAttribute('webkit-playsinline', '');
  vid.load();
  var tryPlay = function () {
    var p = vid.play();
    if (p !== undefined) {
      p.catch(function () {});
    }
  };
  tryPlay();
  document.addEventListener('touchstart', tryPlay, { once: true, passive: true });
  document.addEventListener('click', tryPlay, { once: true });
});

// Hero background split interactions
const bgSplit = document.getElementById('bg-split');
const cardSvc = document.getElementById('card-svc');
const cardSec = document.getElementById('card-sec');

cardSvc.addEventListener('mouseenter', () => { bgSplit.classList.add('hover-left');  bgSplit.classList.remove('hover-right'); });
cardSvc.addEventListener('mouseleave', () => { bgSplit.classList.remove('hover-left'); });
cardSec.addEventListener('mouseenter', () => { bgSplit.classList.add('hover-right'); bgSplit.classList.remove('hover-left'); });
cardSec.addEventListener('mouseleave', () => { bgSplit.classList.remove('hover-right'); });

// Ripple effect on liquid metal buttons
document.querySelectorAll('.lm-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const r = document.createElement('span');
    r.className = 'lm-ripple';
    const rect = btn.getBoundingClientRect();
    r.style.left = (e.clientX - rect.left) + 'px';
    r.style.top  = (e.clientY - rect.top)  + 'px';
    btn.appendChild(r);
    setTimeout(() => r.remove(), 600);
  });
});
