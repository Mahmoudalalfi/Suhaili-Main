import Lenis from 'lenis';

const translations = {
  en: {
    heroServices: 'Facility services.',
    heroSecurity: 'Professional security.',
    heroIntro: 'Two specialist companies. One accountable group.',
    serviceCardDesc: 'Facility management and building operations.',
    securityCardDesc: 'Professional protection for people and property.',
    visitWebsite: 'Visit website',
    aboutGroup: 'About the group',
    overviewTitle: 'Two disciplines.<br />One standard of work.',
    serviceOverview: 'Suhaili Service provides cleaning, staffing, transport, logistics, construction support and facility services.',
    securityOverview: 'Suhaili Security protects properties, people and events through trained personnel, CCTV monitoring, mobile patrols and specialist security services.',
    factCleaningTitle: 'Cleaning & facility',
    factCleaningText: 'Building cleaning, caretaker services and facility management',
    factLogisticsTitle: 'Logistics & staffing',
    factLogisticsText: 'Transport, warehousing and personnel support',
    factPropertyTitle: 'Property & events',
    factPropertyText: 'Property protection and event security',
    factCctvTitle: 'CCTV & patrols',
    factCctvText: 'Video monitoring and mobile patrol services',
    servicesName: 'Services',
    servicesDetail: 'Cleaning · Logistics & warehousing · Staffing · Facility management',
    securityName: 'Security',
    securityDetail: 'Property protection · Event security · CCTV · Mobile patrols',
    footerConnect: 'Connect with Suhaili',
    description: 'Suhaili Group brings together professional facility management and security solutions through Suhaili Services and Suhaili Security.',
  },
  de: {
    heroServices: 'Gebäudeservice.',
    heroSecurity: 'Professionelle Sicherheit.',
    heroIntro: 'Zwei spezialisierte Unternehmen. Eine verantwortliche Gruppe.',
    serviceCardDesc: 'Facility Management und Gebäudebetrieb.',
    securityCardDesc: 'Professioneller Schutz für Menschen und Objekte.',
    visitWebsite: 'Website besuchen',
    aboutGroup: 'Über die Gruppe',
    overviewTitle: 'Zwei Fachbereiche.<br />Ein gemeinsamer Anspruch.',
    serviceOverview: 'Suhaili Service bietet Reinigung, Personaldienstleistungen, Transport, Logistik, Bausupport und Facility Management.',
    securityOverview: 'Suhaili Security schützt Objekte, Personen und Veranstaltungen durch geschultes Personal, Videoüberwachung, Streifendienst und spezialisierte Sicherheitsleistungen.',
    factCleaningTitle: 'Reinigung & Facility',
    factCleaningText: 'Gebäudereinigung, Hausmeisterdienste und Facility Management',
    factLogisticsTitle: 'Logistik & Personal',
    factLogisticsText: 'Transport, Lager und Personalunterstützung',
    factPropertyTitle: 'Objekte & Veranstaltungen',
    factPropertyText: 'Objektschutz und Veranstaltungsschutz',
    factCctvTitle: 'Video & Streifendienst',
    factCctvText: 'Videoüberwachung und mobile Kontrolldienste',
    servicesName: 'Dienstleistungen',
    servicesDetail: 'Reinigung · Logistik & Lager · Personal · Facility Management',
    securityName: 'Sicherheit',
    securityDetail: 'Objektschutz · Veranstaltungsschutz · Videoüberwachung · Streifendienst',
    footerConnect: 'Kontakt zu Suhaili',
    description: 'Die Suhaili Group vereint professionelles Facility Management und Sicherheitslösungen von Suhaili Service und Suhaili Security.',
  },
};

const languageToggle = document.getElementById('language-toggle');

function applyLanguage(language) {
  const copy = translations[language];
  document.documentElement.lang = language;

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = copy[element.dataset.i18n];
    if (value) element.textContent = value;
  });

  document.querySelectorAll('[data-i18n-html]').forEach((element) => {
    const value = copy[element.dataset.i18nHtml];
    if (value) element.innerHTML = value;
  });

  document.querySelector('meta[name="description"]')?.setAttribute('content', copy.description);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', copy.description);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', copy.description);

  if (languageToggle) {
    const switchingToGerman = language === 'en';
    languageToggle.querySelector('.flag-de').hidden = language !== 'de';
    languageToggle.querySelector('.flag-us').hidden = language !== 'en';
    languageToggle.querySelector('.language-code').textContent = switchingToGerman ? 'DE' : 'EN';
    languageToggle.setAttribute('aria-label', switchingToGerman ? 'Switch to German' : 'Switch to English');
    languageToggle.dataset.language = language;
  }
}

let savedLanguage = 'en';
try {
  savedLanguage = localStorage.getItem('suhaili-language') === 'de' ? 'de' : 'en';
} catch {}

applyLanguage(savedLanguage);

languageToggle?.addEventListener('click', () => {
  const nextLanguage = languageToggle.dataset.language === 'en' ? 'de' : 'en';
  applyLanguage(nextLanguage);
  try {
    localStorage.setItem('suhaili-language', nextLanguage);
  } catch {}
});

const lenis = new Lenis({
  duration: 1.05,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

const scrollCue = document.getElementById('scroll-cue');
if (scrollCue) {
  lenis.on('scroll', ({ scroll }) => {
    scrollCue.classList.toggle('hidden', scroll > 40);
  });
}

document.querySelectorAll('#bg-split video').forEach((video) => {
  video.muted = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');

  const tryPlay = () => {
    const playback = video.play();
    if (playback) playback.catch(() => {});
  };

  tryPlay();
  document.addEventListener('touchstart', tryPlay, { once: true, passive: true });
  document.addEventListener('click', tryPlay, { once: true });
});

const bgSplit = document.getElementById('bg-split');
const cardsContainer = document.getElementById('cards');
const cards = [
  { element: document.getElementById('card-svc'), className: 'hover-left' },
  { element: document.getElementById('card-sec'), className: 'hover-right' },
];

let activeSide = '';

function setActiveSide(className = '') {
  if (className === activeSide) return;
  activeSide = className;

  [bgSplit, cardsContainer].forEach((element) => {
    if (!element) return;
    element.classList.remove('hover-left', 'hover-right');
    if (className) element.classList.add(className);
  });
}

if (cardsContainer && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  cardsContainer.addEventListener('pointermove', (event) => {
    if (window.innerWidth <= 700) return;
    const bounds = cardsContainer.getBoundingClientRect();
    setActiveSide(event.clientX < bounds.left + bounds.width / 2 ? 'hover-left' : 'hover-right');
  });

  cardsContainer.addEventListener('pointerleave', () => setActiveSide());
}

cards.forEach(({ element, className }) => {
  if (!element) return;
  element.addEventListener('focus', () => setActiveSide(className));
  element.addEventListener('blur', () => setActiveSide());
});
