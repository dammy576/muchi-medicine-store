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
          loyaltyForm.classList.add('is-submitted');
          loyaltyNote.classList.add('is-success');
          loyaltyNote.textContent = 'Thanks for joining — watch your email for a special welcome discount!';
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

  // Chat widget config. Set apiEndpoint to the deployed Cloudflare Worker's
  // URL (see worker/chat-worker.js) to go live, e.g.
  // 'https://muchi-chat.YOUR-SUBDOMAIN.workers.dev'. Leave it null to keep
  // the "Chat coming soon!" placeholder behavior.
  var CHAT_CONFIG = {
    apiEndpoint: null
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

    function getChatHistory() {
      return Array.prototype.slice.call(chatMessages.querySelectorAll('.chat-message'))
        .map(function (el) {
          return {
            role: el.classList.contains('chat-message-user') ? 'user' : 'assistant',
            content: el.textContent
          };
        });
    }

    function sendChatMessage(text) {
      if (!CHAT_CONFIG.apiEndpoint) {
        addChatMessage('Chat coming soon!', 'bot');
        return;
      }

      // Captured before the typing bubble is appended below, so the last
      // entry here is the message just added by the caller — drop it since
      // the worker receives that one separately as `message`.
      var history = getChatHistory().slice(0, -1);

      var chatSend = chatForm.querySelector('.chat-send');
      chatInput.disabled = true;
      chatSend.disabled = true;

      var typingEl = document.createElement('div');
      typingEl.className = 'chat-message chat-message-bot';
      typingEl.textContent = '...';
      chatMessages.appendChild(typingEl);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      fetch(CHAT_CONFIG.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history })
      }).then(function (response) {
        if (!response.ok) {
          throw new Error('Chat request failed');
        }
        return response.json();
      }).then(function (data) {
        typingEl.remove();
        addChatMessage(data.reply || 'Chat coming soon!', 'bot');
      }).catch(function () {
        typingEl.remove();
        addChatMessage('Chat coming soon!', 'bot');
      }).then(function () {
        chatInput.disabled = false;
        chatSend.disabled = false;
        chatInput.focus();
      });
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
