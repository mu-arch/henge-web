document.querySelectorAll('[data-dummy-link]').forEach(link =>
  link.addEventListener('click', event => event.preventDefault())
);
