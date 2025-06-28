const chatBtn = document.getElementById('chatbot-toggle');
const chatBox = document.getElementById('chatbot-box');
const chatForm = document.getElementById('chatbot-form');
const chatInput = document.getElementById('chatbot-input');
const chatMessages = document.getElementById('chatbot-messages');
const chatClose = document.getElementById('chatbot-close');

if (chatBtn && chatBox && chatInput && chatForm && chatMessages && chatClose) {
  chatBtn.onclick = () => {
    chatBox.classList.toggle('open');
    if (chatBox.classList.contains('open')) chatInput.focus();
  };

  chatClose.onclick = () => {
    chatBox.classList.remove('open');
  };

  chatForm.onsubmit = async (e) => {
    e.preventDefault();
    const userMsg = chatInput.value.trim();
    if (!userMsg) return;
    appendMessage('You', userMsg, 'user');
    chatInput.value = '';
    appendMessage('Bot', '...', 'bot', true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      removeTyping();
      appendMessage('Bot', data.reply || 'Sorry, I could not answer that.', 'bot');
    } catch {
      removeTyping();
      appendMessage('Bot', 'Sorry, something went wrong.', 'bot');
    }
  };
}

function appendMessage(sender, text, type, typing = false) {
  const msg = document.createElement('div');
  msg.className = `chatbot-message ${type}` + (typing ? ' typing' : '');
  msg.innerHTML = `<span class="sender">${sender}:</span> <span class="text">${text}</span>`;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTyping() {
  const typingMsg = chatMessages.querySelector('.chatbot-message.typing');
  if (typingMsg) typingMsg.remove();
}
