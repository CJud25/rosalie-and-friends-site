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
