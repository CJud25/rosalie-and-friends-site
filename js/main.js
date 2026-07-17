// Mobile nav toggle
const hamburger = document.querySelector('.navbar__hamburger');
const navOverlay = document.querySelector('.nav-overlay');

if (hamburger && navOverlay) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    navOverlay.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  navOverlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      navOverlay.classList.remove('open');
      document.body.style.overflow = '';
    });
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
