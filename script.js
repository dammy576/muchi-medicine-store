(function () {
  var navToggle = document.getElementById('navToggle');
  var siteNav = document.getElementById('siteNav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = siteNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  var loyaltyForm = document.getElementById('loyaltyForm');
  var loyaltyNote = document.getElementById('loyaltyNote');

  if (loyaltyForm && loyaltyNote) {
    var loyaltyNoteDefault = loyaltyNote.textContent;

    loyaltyForm.addEventListener('submit', function (event) {
      event.preventDefault();
      loyaltyNote.classList.remove('is-error');
      loyaltyNote.textContent = 'Sending...';

      fetch(loyaltyForm.action, {
        method: 'POST',
        body: new FormData(loyaltyForm),
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) {
          loyaltyForm.reset();
          loyaltyNote.textContent = "You're in! Show this at checkout for 10% off your next visit.";
        } else {
          loyaltyNote.classList.add('is-error');
          loyaltyNote.textContent = 'Something went wrong — please try again in a moment.';
        }
      }).catch(function () {
        loyaltyNote.classList.add('is-error');
        loyaltyNote.textContent = 'Something went wrong — please try again in a moment.';
      });
    });
  }
})();
