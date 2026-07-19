// Mobile nav toggle
const hamburger = document.querySelector('.navbar__hamburger');
const navOverlay = document.querySelector('.nav-overlay');

if (hamburger && navOverlay) {
  const closeNav = () => {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    navOverlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    navOverlay.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navOverlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  // Escape closes the menu; Tab stays inside it while open
  document.addEventListener('keydown', (e) => {
    if (!navOverlay.classList.contains('open')) return;
    if (e.key === 'Escape') {
      closeNav();
      hamburger.focus();
      return;
    }
    if (e.key === 'Tab') {
      const links = navOverlay.querySelectorAll('a');
      const first = links[0];
      const last = links[links.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !navOverlay.contains(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

// Mark active nav link (paths are extensionless; "/" is home)
const currentPath = (window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '')) || '/';
document.querySelectorAll('.navbar__links a, .nav-overlay a').forEach(link => {
  const href = (link.getAttribute('href') || '').split('#')[0];
  if (href === currentPath || (currentPath === '/' && href === '/')) {
    link.classList.add('active');
  }
});

// Dog card photo carousels
// Any element with [data-gallery] that holds 2+ <img> becomes a swipeable
// carousel with prev/next arrows and clickable dots. To add another angle to
// a dog, just add one more <img> inside its .dog-card__gallery — the arrows
// and dots update automatically.
document.querySelectorAll('[data-gallery]').forEach(gallery => {
  const imgs = Array.from(gallery.querySelectorAll('img'));
  if (imgs.length < 2) return;

  const card = gallery.closest('.dog-card');
  const nameEl = card && card.querySelector('.dog-card__name');
  const dogName = nameEl ? nameEl.textContent.trim() : 'this dog';
  const count = imgs.length;
  let index = 0;

  // Move the images into a sliding track
  const track = document.createElement('div');
  track.className = 'dog-card__track';
  imgs.forEach(img => track.appendChild(img));
  gallery.appendChild(track);
  gallery.classList.add('is-enhanced');
  gallery.setAttribute('role', 'group');
  gallery.setAttribute('aria-roledescription', 'photo carousel');
  gallery.setAttribute('aria-label', 'Photos of ' + dogName);

  // Prev / next arrows
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'dog-card__nav dog-card__nav--prev';
  prev.setAttribute('aria-label', 'Previous photo of ' + dogName);
  prev.innerHTML = '‹';

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'dog-card__nav dog-card__nav--next';
  next.setAttribute('aria-label', 'Next photo of ' + dogName);
  next.innerHTML = '›';

  // Dots
  const dotWrap = document.createElement('div');
  dotWrap.className = 'dog-card__dots';
  const dots = imgs.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dog-card__dot';
    dot.setAttribute('aria-label', 'Show photo ' + (i + 1) + ' of ' + count + ' of ' + dogName);
    dot.addEventListener('click', () => go(i));
    dotWrap.appendChild(dot);
    return dot;
  });

  function go(n) {
    index = (n + count) % count;
    track.style.transform = 'translateX(-' + (index * 100) + '%)';
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
  }

  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));

  gallery.appendChild(prev);
  gallery.appendChild(next);
  gallery.appendChild(dotWrap);

  // Swipe on touch screens
  let startX = null;
  gallery.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  gallery.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) go(dx < 0 ? index + 1 : index - 1);
    startX = null;
  });

  go(0);
});
