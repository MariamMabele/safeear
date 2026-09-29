// Page wiring: header, mobile menu, booking buttons and the release box.
const bookingFlow = new BookingFlow(document.getElementById('booking-root'));

class SiteHeader {
  constructor() {
    this.header = document.getElementById('header');
    this.nav = document.getElementById('nav');
    this.toggle = document.getElementById('menu-toggle');
    this.toggle.addEventListener('click', () => this.setMenu(!this.nav.classList.contains('open')));
    this.nav.addEventListener('click', e => { if (e.target.closest('a, button')) this.setMenu(false); });
    const onScroll = () => this.header.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  setMenu(open) {
    this.nav.classList.toggle('open', open);
    this.toggle.setAttribute('aria-expanded', String(open));
  }
}

// Nothing typed here leaves the page: it is cleared on release.
class ReleaseBox {
  constructor() {
    this.box = document.getElementById('release-box');
    this.text = document.getElementById('release-text');
    this.button = document.getElementById('release-btn');
    this.done = document.getElementById('release-done');
    this.text.addEventListener('input', () => { this.button.disabled = !this.text.value.trim(); });
    this.button.addEventListener('click', () => this.release());
    document.getElementById('release-again').addEventListener('click', () => this.reset());
  }

  release() {
    this.button.disabled = true;
    this.box.classList.add('releasing');
    setTimeout(() => {
      this.text.value = '';
      this.text.hidden = true;
      this.button.parentElement.hidden = true;
      this.done.hidden = false;
    }, 1400);
  }

  reset() {
    this.box.classList.remove('releasing');
    this.done.hidden = true;
    this.text.hidden = false;
    this.button.parentElement.hidden = false;
    this.text.focus();
  }
}

document.addEventListener('click', e => {
  const trigger = e.target.closest('[data-book]');
  if (trigger) bookingFlow.open(trigger.dataset.book);
});

new SiteHeader();
new ReleaseBox();
document.getElementById('year').textContent = new Date().getFullYear();
