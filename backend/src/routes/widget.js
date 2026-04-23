import { Router } from 'express'
const router = Router()

router.get('/:botId', (req, res) => {
  const { botId } = req.params
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000'

  res.setHeader('Content-Type', 'application/javascript')
  res.send(`
(function() {
  const botId = '${botId}';
  const backendUrl = '${backendUrl}';
  const sessionId = 'session-' + Date.now();

  // Inject styles
  const style = document.createElement('style');
  style.textContent = \`
    #ai-chat-bubble {
      position: fixed; bottom: 24px; right: 24px;
      width: 56px; height: 56px; border-radius: 50%;
      background: #7F77DD; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(127,119,221,0.5);
      z-index: 99999; font-size: 24px;
      transition: transform 0.2s;
    }
    #ai-chat-bubble:hover { transform: scale(1.1); }
    #ai-chat-window {
      position: fixed; bottom: 92px; right: 24px;
      width: 360px; height: 500px;
      background: #1a1a2e; border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.4);
      display: none; flex-direction: column;
      z-index: 99999; overflow: hidden;
      border: 1px solid #2a2a4a;
      font-family: -apple-system, sans-serif;
    }
    #ai-chat-window.open { display: flex; }
    #ai-chat-header {
      background: #7F77DD; padding: 16px;
      color: white; font-weight: 600; font-size: 15px;
      display: flex; justify-content: space-between; align-items: center;
    }
    #ai-chat-close {
      cursor: pointer; font-size: 20px; opacity: 0.8;
      background: none; border: none; color: white;
    }
    #ai-chat-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .ai-msg {
      padding: 10px 14px; border-radius: 12px;
      max-width: 80%; font-size: 14px; line-height: 1.5;
      word-wrap: break-word;
    }
    .ai-msg.user {
      background: #7F77DD; color: white;
      align-self: flex-end; border-bottom-right-radius: 4px;
    }
    .ai-msg.bot {
      background: #2a2a4a; color: #e0e0ff;
      align-self: flex-start; border-bottom-left-radius: 4px;
    }
    .ai-msg.typing { opacity: 0.6; font-style: italic; }
    #ai-chat-input-row {
      padding: 12px; display: flex; gap: 8px;
      border-top: 1px solid #2a2a4a;
    }
    #ai-chat-input {
      flex: 1; background: #2a2a4a; border: none;
      border-radius: 8px; padding: 10px 14px;
      color: white; font-size: 14px; outline: none;
    }
    #ai-chat-input::placeholder { color: #666; }
    #ai-chat-send {
      background: #7F77DD; border: none; border-radius: 8px;
      padding: 10px 16px; color: white; cursor: pointer;
      font-size: 14px; font-weight: 600;
    }
    #ai-chat-send:hover { background: #6c64cc; }
  \`;
  document.head.appendChild(style);

  // Create bubble
  const bubble = document.createElement('div');
  bubble.id = 'ai-chat-bubble';
  bubble.innerHTML = '💬';
  document.body.appendChild(bubble);

  // Create chat window
  const win = document.createElement('div');
  win.id = 'ai-chat-window';
  win.innerHTML = \`
    <div id="ai-chat-header">
      <span>AI Assistant</span>
      <button id="ai-chat-close">✕</button>
    </div>
    <div id="ai-chat-messages"></div>
    <div id="ai-chat-input-row">
      <input id="ai-chat-input" placeholder="Type a message..." />
      <button id="ai-chat-send">Send</button>
    </div>
  \`;
  document.body.appendChild(win);

  // Toggle open/close
  bubble.onclick = () => win.classList.toggle('open');
  document.getElementById('ai-chat-close').onclick = () => win.classList.remove('open');

  function addMessage(role, text) {
    const msgs = document.getElementById('ai-chat-messages');
    const div = document.createElement('div');
    div.className = 'ai-msg ' + role;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  async function send() {
    const input = document.getElementById('ai-chat-input');
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    addMessage('user', msg);

    const typing = addMessage('bot typing', 'Typing...');

    try {
      const res = await fetch(backendUrl + '/api/chat/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, sessionId, message: msg })
      });
      const data = await res.json();
      typing.remove();
      addMessage('bot', data.reply || 'Sorry, something went wrong.');
    } catch(e) {
      typing.remove();
      addMessage('bot', 'Connection error. Please try again.');
    }
  }

  document.getElementById('ai-chat-send').onclick = send;
  document.getElementById('ai-chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') send();
  });
})();
  `)
})

export default router