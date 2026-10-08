const siteNav = document.querySelector('.top-links');
const navToggle = siteNav?.querySelector('.nav-toggle');

if (siteNav && navToggle) {
  const navSurface = siteNav.parentElement;
  const closeMenu = () => {
    siteNav.classList.remove('is-open');
    navSurface.classList.remove('mobile-menu-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  };

  navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') !== 'true';
    siteNav.classList.toggle('is-open', open);
    navSurface.classList.toggle('mobile-menu-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  siteNav.querySelectorAll('.top-links-items a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', event => {
    if (!siteNav.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  window.matchMedia('(max-width: 700px)').addEventListener('change', closeMenu);
}
