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

// Dog card photo carousels + full-photo lightbox
// Any element with [data-gallery] that holds 2+ <img> becomes a swipeable
// carousel with prev/next arrows and clickable dots. Clicking any photo (or
// the expand button) opens a full-screen viewer showing the whole, uncropped
// image. To add another angle to a dog, just add one more <img> inside its
// .dog-card__gallery — everything updates automatically.
(function () {
  // ---------- Shared lightbox (built once) ----------
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Photo viewer');
  lb.hidden = true;
  lb.innerHTML =
    '<button class="lightbox__close" type="button" aria-label="Close photo viewer">×</button>' +
    '<button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous photo">‹</button>' +
    '<img class="lightbox__img" alt="" />' +
    '<button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next photo">›</button>' +
    '<p class="lightbox__caption" aria-live="polite"></p>';
  document.body.appendChild(lb);

  const lbImg = lb.querySelector('.lightbox__img');
  const lbCap = lb.querySelector('.lightbox__caption');
  const lbPrev = lb.querySelector('.lightbox__nav--prev');
  const lbNext = lb.querySelector('.lightbox__nav--next');
  const lbClose = lb.querySelector('.lightbox__close');

  let lbPhotos = [];
  let lbIndex = 0;
  let lastFocus = null;

  function lbRender() {
    const p = lbPhotos[lbIndex];
    if (!p) return;
    lbImg.src = p.src;
    lbImg.alt = p.alt || '';
    const multi = lbPhotos.length > 1;
    lbCap.textContent = multi ? (lbIndex + 1) + ' / ' + lbPhotos.length : '';
    lbPrev.style.display = multi ? '' : 'none';
    lbNext.style.display = multi ? '' : 'none';
  }
  function lbGo(n) { lbIndex = (n + lbPhotos.length) % lbPhotos.length; lbRender(); }
  function lbOpen(photos, start) {
    lbPhotos = photos;
    lbIndex = start || 0;
    lastFocus = document.activeElement;
    lbRender();
    lb.hidden = false;
    void lb.offsetWidth; // reflow so the fade-in transition runs
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }
  function lbCloseFn() {
    lb.classList.remove('is-open');
    lb.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  lbPrev.addEventListener('click', () => lbGo(lbIndex - 1));
  lbNext.addEventListener('click', () => lbGo(lbIndex + 1));
  lbClose.addEventListener('click', lbCloseFn);
  lb.addEventListener('click', (e) => { if (e.target === lb) lbCloseFn(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') lbCloseFn();
    else if (e.key === 'ArrowLeft' && lbPhotos.length > 1) lbGo(lbIndex - 1);
    else if (e.key === 'ArrowRight' && lbPhotos.length > 1) lbGo(lbIndex + 1);
  });
  let lbStartX = null;
  lb.addEventListener('touchstart', (e) => { lbStartX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (lbStartX === null || lbPhotos.length < 2) { lbStartX = null; return; }
    const dx = e.changedTouches[0].clientX - lbStartX;
    if (Math.abs(dx) > 40) lbGo(dx < 0 ? lbIndex + 1 : lbIndex - 1);
    lbStartX = null;
  });

  // ---------- Per-card carousels ----------
  document.querySelectorAll('[data-gallery]').forEach(gallery => {
    const imgs = Array.from(gallery.querySelectorAll('img'));
    if (imgs.length < 1) return;

    const card = gallery.closest('.dog-card');
    const nameEl = card && card.querySelector('.dog-card__name');
    const dogName = nameEl ? nameEl.textContent.trim() : 'this dog';
    const photos = imgs.map(img => ({ src: img.src, alt: img.alt }));
    const count = imgs.length;
    let index = 0;
    let swiped = false;

    gallery.classList.add('is-enhanced');

    // Expand button (keyboard-accessible way to open the full-size viewer)
    const zoom = document.createElement('button');
    zoom.type = 'button';
    zoom.className = 'dog-card__zoom';
    zoom.setAttribute('aria-label', 'View full-size photo of ' + dogName);
    zoom.innerHTML = '⤢';
    zoom.addEventListener('click', () => lbOpen(photos, index));

    // Clicking a photo opens it full-size (unless the tap was a swipe)
    imgs.forEach(img => {
      img.addEventListener('click', () => {
        if (swiped) { swiped = false; return; }
        lbOpen(photos, index);
      });
    });

    // Single-photo card: just the expand affordance, no carousel controls
    if (count < 2) {
      gallery.appendChild(zoom);
      return;
    }

    // Sliding track
    const track = document.createElement('div');
    track.className = 'dog-card__track';
    imgs.forEach(img => track.appendChild(img));
    gallery.appendChild(track);
    gallery.setAttribute('role', 'group');
    gallery.setAttribute('aria-roledescription', 'photo carousel');
    gallery.setAttribute('aria-label', 'Photos of ' + dogName);

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
    gallery.appendChild(zoom);
    gallery.appendChild(dotWrap);

    // Swipe on touch screens (and suppress the photo-open click after a swipe)
    let startX = null;
    gallery.addEventListener('touchstart', e => { startX = e.touches[0].clientX; swiped = false; }, { passive: true });
    gallery.addEventListener('touchend', e => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { swiped = true; go(dx < 0 ? index + 1 : index - 1); }
      startX = null;
    });

    go(0);
  });
})();
