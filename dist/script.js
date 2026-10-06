const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  siteNav.classList.toggle('open', open);
});
siteNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  siteNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
}));

const notes = {
  village: {
    kicker: 'FIELD NOTE / THE VILLAGE',
    title: 'Where the river bends',
    body: ['A village can tell you everything about a world before anyone speaks. The angle of a roof, the worn stones of a bridge, the way the road meets the market square: each detail hints at lives already in motion.', 'This is the feeling at the heart of StudioHenge. We want places that invite you to pause, look closer, and wonder what happened there before you arrived.']
  },
  roads: {
    kicker: 'FIELD NOTE / THE JOURNEY',
    title: 'The roads between',
    body: ['The best journeys make room for an unexpected turn. A path over a hill might lead to a view you remember longer than the destination itself.', 'Our world begins with that promise of discovery: roads that feel travelled, horizons that feel open, and the sense that there is always something just out of sight.']
  },
  details: {
    kicker: 'FIELD NOTE / THE DETAILS',
    title: 'A world in the details',
    body: ['The little things give a place its character. A garden behind a cottage, striped cloth over a market stall, a mill turning in the distance.', 'Together, those details turn scenery into somewhere you can imagine living. They are where our ideas start, and where we hope the wonder lingers.']
  }
};
const dialog = document.querySelector('#note-dialog');
const closeButton = dialog.querySelector('.dialog-close');
const backButton = dialog.querySelector('.dialog-back');
let priorFocus;
document.querySelectorAll('[data-note]').forEach(button => button.addEventListener('click', () => {
  const note = notes[button.dataset.note];
  priorFocus = button;
  dialog.querySelector('#dialog-kicker').textContent = note.kicker;
  dialog.querySelector('#dialog-title').textContent = note.title;
  dialog.querySelector('#dialog-body').replaceChildren(...note.body.map(text => {
    const p = document.createElement('p');
    p.textContent = text;
    return p;
  }));
  dialog.showModal();
  closeButton.focus();
}));
function closeDialog() { dialog.close(); }
closeButton.addEventListener('click', closeDialog);
backButton.addEventListener('click', closeDialog);
dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });
dialog.addEventListener('close', () => priorFocus?.focus());
