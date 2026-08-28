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

  // Chat widget config. Point this at a real endpoint to go live.
  var CHAT_CONFIG = {
    apiEndpoint: null // e.g. 'https://api.example.com/chat' — once set, replace the
                       // placeholder branch in sendChatMessage() below with a real
                       // fetch(CHAT_CONFIG.apiEndpoint, { method: 'POST', ... }) call.
  };

  var chatWidget = document.getElementById('chatWidget');
  var chatBubble = document.getElementById('chatBubble');
  var chatClose = document.getElementById('chatClose');
  var chatWindow = document.getElementById('chatWindow');
  var chatForm = document.getElementById('chatForm');
  var chatInput = document.getElementById('chatInput');
  var chatMessages = document.getElementById('chatMessages');

  if (chatWidget && chatBubble && chatClose && chatWindow && chatForm && chatInput && chatMessages) {
    function openChat() {
      chatWidget.classList.add('open');
      chatBubble.setAttribute('aria-expanded', 'true');
      chatWindow.setAttribute('aria-hidden', 'false');
      chatInput.focus();
    }

    function closeChat() {
      chatWidget.classList.remove('open');
      chatBubble.setAttribute('aria-expanded', 'false');
      chatWindow.setAttribute('aria-hidden', 'true');
    }

    function addChatMessage(text, sender) {
      var message = document.createElement('div');
      message.className = 'chat-message chat-message-' + sender;
      message.textContent = text;
      chatMessages.appendChild(message);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function sendChatMessage(text) {
      if (CHAT_CONFIG.apiEndpoint) {
        // TODO: once CHAT_CONFIG.apiEndpoint is set, call the real AI backend here, e.g.:
        // fetch(CHAT_CONFIG.apiEndpoint, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ message: text })
        // }).then(function (res) { return res.json(); })
        //   .then(function (data) { addChatMessage(data.reply, 'bot'); });
      } else {
        addChatMessage('Chat coming soon!', 'bot');
      }
    }

    chatBubble.addEventListener('click', function () {
      if (chatWidget.classList.contains('open')) {
        closeChat();
      } else {
        openChat();
      }
    });

    chatClose.addEventListener('click', closeChat);

    chatForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var text = chatInput.value.trim();
      if (!text) {
        return;
      }
      addChatMessage(text, 'user');
      chatInput.value = '';
      sendChatMessage(text);
    });
  }
})();
