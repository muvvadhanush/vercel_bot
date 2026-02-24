(function () {
  const config = window.ChatbotConfig;
  if (!config || !config.connectionId) {
    console.error("❌ ChatbotConfig missing");
    return;
  }

  // Determine Base URL
  let baseUrl = config.apiUrl;
  if (!baseUrl) {
    baseUrl = window.location.origin.includes('http') ? window.location.origin : 'http://localhost:5001';
    if (baseUrl === 'null' || baseUrl === 'file://') baseUrl = 'http://localhost:5001';
  }
  baseUrl = baseUrl.replace(/\/$/, "");

  const sessionId = "widget-" + Math.random().toString(36).slice(2);

  // Create container
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.bottom = "20px";
  container.style.right = "20px";
  container.style.zIndex = "999999";
  document.body.appendChild(container);

  // Shadow DOM
  const shadow = container.attachShadow({ mode: "open" });

  shadow.innerHTML = `
    <style>
      * {
        box-sizing: border-box;
      }
      #btn {
        width: 68px;
        height: 68px;
        border-radius: 22px;
        background: var(--primary-color, #6d5dfc);
        color: #fff;
        font-size: 28px;
        border: none;
        cursor: pointer;
        box-shadow: 0 12px 32px rgba(109, 93, 252, 0.3);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        padding: 0;
      }
      #btn-logo {
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.9;
      }
      #btn:hover {
        transform: translateY(-5px) rotate(5deg);
        box-shadow: 0 16px 40px rgba(109, 93, 252, 0.4);
      }
      
      /* Welcome Bubble */
      #welcome-bubble {
        position: absolute;
        bottom: 85px;
        right: 0;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        padding: 16px 20px;
        border-radius: 18px;
        box-shadow: 0 12px 32px rgba(0,0,0,0.1);
        max-width: 260px;
        font-family: inherit;
        font-size: 14px;
        font-weight: 500;
        color: #374151;
        animation: slideIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        cursor: pointer;
        border: 1px solid rgba(255, 255, 255, 0.5);
      }
      #welcome-bubble::after {
        content: '';
        position: absolute;
        bottom: -8px;
        right: 28px;
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid rgba(255, 255, 255, 0.8);
      }
      #welcome-bubble .close-bubble {
        position: absolute;
        top: 4px;
        right: 8px;
        background: none;
        border: none;
        font-size: 14px;
        cursor: pointer;
        color: #999;
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .bubble-hidden {
        display: none !important;
      }
      #panel {
        position: fixed;
        bottom: 100px;
        right: 20px;
        width: 360px;
        height: 540px;
        background: rgba(255, 255, 255, 0.72);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-radius: 24px;
        display: none;
        flex-direction: column;
        box-shadow: 0 20px 60px rgba(0,0,0, 0.15);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.4);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      #header {
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #1a1a1a;
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }
      #header-logo {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: rgba(255,255,255,0.4);
        object-fit: contain;
        padding: 6px;
        border: 1px solid rgba(255,255,255,0.6);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }
      #header-info {
        flex: 1;
      }
      #header-name {
        font-weight: 700;
        font-size: 16px;
        letter-spacing: -0.3px;
        margin-bottom: 2px;
        color: #1f2937;
      }
      #header-status {
        font-size: 11px;
        opacity: 0.7;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        gap: 5px;
        color: #4b5563;
      }
      #status-dot {
        width: 7px;
        height: 7px;
        background: #10b981;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.8); }
      }
      #close-btn {
        background: rgba(0, 0, 0, 0.05);
        border: none;
        color: #4b5563;
        width: 32px;
        height: 32px;
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        transition: all 0.2s;
      }
      #close-btn:hover {
        background: rgba(0, 0, 0, 0.1);
        transform: rotate(90deg);
      }
      #messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        font-size: 14px;
        background: transparent;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .msg {
        max-width: 85%;
        animation: fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(12px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .msg.user {
        margin-left: auto;
        text-align: right;
      }
      .msg-bubble {
        display: inline-block;
        padding: 12px 16px;
        border-radius: 18px;
        line-height: 1.5;
        font-weight: 500;
      }
      .msg.user .msg-bubble {
        background: var(--primary-color, #6d5dfc);
        color: white;
        border-bottom-right-radius: 4px;
        box-shadow: 0 8px 16px rgba(109, 93, 252, 0.2);
      }
      .msg.bot .msg-bubble {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(4px);
        color: #374151;
        border-bottom-left-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        border: 1px solid rgba(255, 255, 255, 0.5);
      }
      
      /* Suggestions & Buttons */
      #suggestions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 12px;
        background: transparent;
        overflow-x: auto;
      }
      .suggestion-btn {
        background: rgba(255, 255, 255, 0.4);
        border: 1px solid rgba(109, 93, 252, 0.3);
        color: #6d5dfc;
        padding: 8px 16px;
        border-radius: 14px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }
      .suggestion-btn:hover {
        background: #6d5dfc;
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(109, 93, 252, 0.2);
      }
      /* Structured Buttons */
      .action-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 14px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        white-space: nowrap;
        border: 1px solid;
        animation: fadeIn 0.3s ease;
      }
      .action-btn .btn-icon {
        font-size: 14px;
        flex-shrink: 0;
      }
      .action-btn.type-SEND_MESSAGE {
        background: rgba(109, 93, 252, 0.08);
        border-color: rgba(109, 93, 252, 0.3);
        color: #6d5dfc;
      }
      .action-btn.type-SEND_MESSAGE:hover {
        background: #6d5dfc; color: white;
        box-shadow: 0 4px 12px rgba(109, 93, 252, 0.3);
      }
      .action-btn.type-OPEN_URL {
        background: rgba(16, 185, 129, 0.08);
        border-color: rgba(16, 185, 129, 0.3);
        color: #059669;
      }
      .action-btn.type-OPEN_URL:hover {
        background: #10b981; color: white;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      }
      .action-btn.type-PHONE_CALL {
        background: rgba(59, 130, 246, 0.08);
        border-color: rgba(59, 130, 246, 0.3);
        color: #2563eb;
      }
      .action-btn.type-PHONE_CALL:hover {
        background: #3b82f6; color: white;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      }
      .action-btn.type-GO_TO_BLOCK {
        background: rgba(245, 158, 11, 0.08);
        border-color: rgba(245, 158, 11, 0.3);
        color: #d97706;
      }
      .action-btn.type-GO_TO_BLOCK:hover {
        background: #f59e0b; color: white;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
      }
      .action-btn.type-POSTBACK {
        background: rgba(139, 92, 246, 0.08);
        border-color: rgba(139, 92, 246, 0.3);
        color: #7c3aed;
      }
      .action-btn.type-POSTBACK:hover {
        background: #8b5cf6; color: white;
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
      }
      .action-btn:hover { transform: translateY(-2px); }
      .quick-reply-exit {
        animation: slideOut 0.3s ease forwards;
      }
      @keyframes slideOut {
        to { opacity: 0; transform: translateY(8px) scale(0.9); }
      }
      
      #input-area {
        display: flex;
        padding: 16px;
        border-top: 1px solid rgba(0, 0, 0, 0.05);
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
      }
      #text {
        flex: 1;
        background: rgba(255, 255, 255, 0.5);
        border: 1px solid rgba(0, 0, 0, 0.05);
        padding: 12px 18px;
        border-radius: 14px;
        outline: none;
        font-size: 14px;
        transition: all 0.2s;
        color: #1f2937;
      }
      #text:focus {
        background: white;
        border-color: #6d5dfc;
        box-shadow: 0 0 0 4px rgba(109, 93, 252, 0.1);
      }
      .send {
        border: none;
        padding: 10px 20px;
        cursor: pointer;
        background: #6d5dfc;
        color: white;
        border-radius: 12px;
        margin-left: 10px;
        font-weight: 700;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(109, 93, 252, 0.3);
      }
      .send:hover {
        background: #5b4cfc;
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(109, 93, 252, 0.4);
      }
      
      .typing {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 10px 14px;
        background: white;
        border-radius: 16px;
        width: fit-content;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }
      .typing span {
        width: 8px;
        height: 8px;
        background: #667eea;
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out;
      }
      .typing span:nth-child(1) { animation-delay: -0.32s; }
      .typing span:nth-child(2) { animation-delay: -0.16s; }
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
    </style>

    <div id="welcome-bubble" class="bubble-hidden">
      <button class="close-bubble">×</button>
      <span id="bubble-text">👋 Hi! Need any help? Click to chat!</span>
    </div>
    
    <button id="btn">
      <img id="btn-logo" src="" alt="💬" style="display:none" />
      <span id="btn-icon">💬</span>
    </button>

    <div id="panel">
      <div id="header">
        <img id="header-logo" src="" alt="" style="display:none" />
        <div id="header-info">
          <div id="header-name">AI Assistant</div>
          <div id="header-status"><span id="status-dot"></span> Online • Ready to help</div>
        </div>
        <button id="close-btn">✕</button>
      </div>
      <div id="messages"></div>
      <div id="suggestions"></div>
      <div id="input-area">
        <input id="text" name="chatbot-message" autocomplete="off" placeholder="Type a message…" />
        <button class="send">Send</button>
      </div>
    </div>
  `;

  const btn = shadow.querySelector("#btn");
  const btnLogo = shadow.querySelector("#btn-logo");
  const btnIcon = shadow.querySelector("#btn-icon");
  const panel = shadow.querySelector("#panel");
  const closeBtn = shadow.querySelector("#close-btn");
  const messages = shadow.querySelector("#messages");
  const suggestionsContainer = shadow.querySelector("#suggestions");
  const input = shadow.querySelector("#text");
  const sendBtn = shadow.querySelector(".send");
  const welcomeBubble = shadow.querySelector("#welcome-bubble");
  const closeBubble = shadow.querySelector(".close-bubble");
  const bubbleText = shadow.querySelector("#bubble-text");

  // Show welcome bubble after 2 seconds
  setTimeout(() => {
    welcomeBubble.classList.remove("bubble-hidden");
  }, 2000);

  // Auto-hide bubble after 8 seconds
  setTimeout(() => {
    welcomeBubble.classList.add("bubble-hidden");
  }, 10000);

  // Close bubble on X click
  closeBubble.onclick = (e) => {
    e.stopPropagation();
    welcomeBubble.classList.add("bubble-hidden");
  };

  // Click bubble to open chat
  welcomeBubble.onclick = () => {
    welcomeBubble.classList.add("bubble-hidden");
    panel.style.display = "flex";
  };

  btn.onclick = () => {
    welcomeBubble.classList.add("bubble-hidden");
    panel.style.display = panel.style.display === "flex" ? "none" : "flex";
  };

  closeBtn.onclick = () => {
    panel.style.display = "none";
  };

  // Initialize functionality
  async function initWidget() {
    try {
      const res = await fetch(`${baseUrl}/api/widget/hello`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: config.connectionId })
      });
      const data = await res.json();

      if (data.config) {
        applyConfig(data.config);
      }

      // If extraction allowed, maybe we still do the auto-extract call?
      // Leaving existing logic for now, but `applyConfig` is key.

    } catch (e) {
      console.error("Widget Init Error:", e);
    }
  }

  function applyConfig(cfg) {
    if (cfg.primaryColor) {
      container.style.setProperty('--primary-color', cfg.primaryColor);
      // Update header background too
      const header = shadow.querySelector('#header');
      if (header) header.style.background = cfg.primaryColor;

      // Update user bubble color (using css var or direct style)
      // Since styles are in shadowDOM string, we can't easily change CSS vars defined in <style> block unless we injected them into :host or body.
      // Better: Update specific elements.

      // We didn't use vars in CSS string fully. Let's fix.
      // Actually, standard CSS vars don't penetrate Shadow DOM easily unless inherited.
      // We'll set it on the shadow root host or specific elements.

      // style tag replacement is hard. 
      // Let's set styles on elements directly for now.
      const btn = shadow.querySelector('#btn');
      if (btn) btn.style.background = cfg.primaryColor;
      const send = shadow.querySelector('.send');
      if (send) send.style.background = cfg.primaryColor;
    }

    if (cfg.title) {
      shadow.querySelector('#header-name').textContent = cfg.title;
    }

    if (cfg.welcomeMessage) {
      shadow.querySelector('#bubble-text').textContent = cfg.welcomeMessage;
    }

    if (cfg.botAvatar && cfg.botAvatar !== 'DEFAULT') {
      const btnLogo = shadow.querySelector('#btn-logo');
      const headerLogo = shadow.querySelector('#header-logo');
      if (btnLogo) { btnLogo.src = cfg.botAvatar; btnLogo.style.display = 'block'; shadow.querySelector('#btn-icon').style.display = 'none'; }
      if (headerLogo) { headerLogo.src = cfg.botAvatar; headerLogo.style.display = 'block'; }
    }

    // Timer Trigger
    if (cfg.timeOnPage > 0) {
      setTimeout(() => {
        const panel = shadow.querySelector('#panel');
        if (panel.style.display !== 'flex') {
          shadow.querySelector('#welcome-bubble').classList.add('bubble-hidden');
          panel.style.display = 'flex';
        }
      }, cfg.timeOnPage * 1000);
    }
  }

  // Call Init
  initWidget();

  // Auto-extract knowledge base from host website
  async function autoExtractKnowledgeBase() {
    const storageKey = `chatbot_kb_extracted_${config.connectionId}`;

    // Check if already extracted
    if (localStorage.getItem(storageKey)) {
      console.log("✅ Knowledge base already extracted for this connection");
      return;
    }

    try {
      const hostUrl = window.location.origin;
      console.log(`🔍 Auto-extracting knowledge base from: ${hostUrl}`);

      const response = await fetch(`${baseUrl}/api/connections/auto-extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionId: config.connectionId,
          hostUrl: hostUrl
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log("✅ Knowledge base extracted:", data.message);
        // Mark as extracted
        localStorage.setItem(storageKey, "true");

        // Update welcome message if provided
        if (data.welcomeMessage) {
          bubbleText.textContent = data.welcomeMessage;
        }
      } else {
        console.warn("⚠️ Auto-extract failed:", data.error);
      }
    } catch (error) {
      console.error("❌ Auto-extract error:", error);
      // Don't block widget functionality if extraction fails
    }
  }

  // Trigger auto-extract on load (non-blocking)
  setTimeout(() => autoExtractKnowledgeBase(), 1000);

  function addMessage(text, who = "bot") {
    const div = document.createElement("div");
    div.className = `msg ${who}`;
    div.innerHTML = `<div class="msg-bubble">${text}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement("div");
    div.className = "msg bot";
    div.id = "typing-indicator";
    div.innerHTML = `<div class="typing"><span></span><span></span><span></span></div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function hideTyping() {
    const typing = shadow.querySelector("#typing-indicator");
    if (typing) typing.remove();
  }

  function showSuggestions(suggestions) {
    suggestionsContainer.innerHTML = "";
    if (!suggestions || suggestions.length === 0) {
      suggestionsContainer.style.display = "none";
      return;
    }
    suggestionsContainer.style.display = "flex";
    suggestions.forEach(text => {
      const btn = document.createElement("button");
      btn.className = "suggestion-btn";
      btn.textContent = text;
      btn.onclick = () => {
        input.value = text;
        sendMessage();
      };
      suggestionsContainer.appendChild(btn);
    });
  }

  // ===== BUTTON SYSTEM: Structured Buttons =====
  const TYPE_ICONS = {
    SEND_MESSAGE: '💬',
    GO_TO_BLOCK: '📦',
    OPEN_URL: '🌐',
    PHONE_CALL: '📞',
    POSTBACK: '⚡'
  };

  let currentQuickReply = false;

  function showButtons(buttons, isQuickReply) {
    suggestionsContainer.innerHTML = "";
    if (!buttons || buttons.length === 0) {
      suggestionsContainer.style.display = "none";
      currentQuickReply = false;
      return;
    }
    currentQuickReply = !!isQuickReply;
    suggestionsContainer.style.display = "flex";

    buttons.forEach(btnData => {
      const btn = document.createElement("button");
      btn.className = `action-btn type-${btnData.type}`;
      btn.innerHTML = `<span class="btn-icon">${btnData.icon || TYPE_ICONS[btnData.type] || '🔘'}</span>${btnData.label}`;
      btn.onclick = () => handleButtonAction(btnData);
      suggestionsContainer.appendChild(btn);
    });
  }

  function handleButtonAction(btnData) {
    // Quick reply: animate out all buttons
    if (currentQuickReply) {
      const allBtns = suggestionsContainer.querySelectorAll('.action-btn');
      allBtns.forEach(b => b.classList.add('quick-reply-exit'));
      setTimeout(() => {
        suggestionsContainer.innerHTML = "";
        suggestionsContainer.style.display = "none";
      }, 300);
    }

    switch (btnData.type) {
      case 'SEND_MESSAGE':
        sendMessage(btnData.payload || btnData.label);
        break;

      case 'OPEN_URL':
        if (btnData.payload) {
          try {
            const url = new URL(btnData.payload);
            if (['http:', 'https:'].includes(url.protocol)) {
              window.open(btnData.payload, '_blank', 'noopener,noreferrer');
            } else {
              addMessage('⚠️ Unsafe link blocked.', 'bot');
            }
          } catch {
            addMessage('⚠️ Invalid link.', 'bot');
          }
        }
        break;

      case 'PHONE_CALL':
        if (btnData.payload) {
          const clean = btnData.payload.replace(/[\s\-\(\)]/g, '');
          window.open(`tel:${clean}`);
        }
        break;

      case 'GO_TO_BLOCK':
        sendMessage(`[GO_TO_BLOCK:${btnData.payload}]`);
        break;

      case 'POSTBACK':
        sendMessage(btnData.payload || btnData.label);
        break;

      default:
        sendMessage(btnData.label);
    }
  }

  async function sendMessage(textOverride) {
    const text = textOverride || input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";
    showSuggestions([]); // Hide suggestions while loading
    showTyping();

    try {
      const res = await fetch(`${baseUrl}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          connectionId: config.connectionId,
          sessionId
        })
      });

      hideTyping();

      if (!res.ok) {
        addMessage("Server error: " + res.status, "bot");
        return;
      }

      const data = await res.json();

      if (data.messages && data.messages.length) {
        addMessage(data.messages[data.messages.length - 1].text, "bot");
      } else {
        addMessage("No response from AI", "bot");
      }

      // Show structured buttons (priority) or plain suggestions
      if (data.buttons && data.buttons.length) {
        showButtons(data.buttons, data.buttonsQuickReply);
      } else if (data.suggestions && data.suggestions.length) {
        showSuggestions(data.suggestions);
      }

    } catch (e) {
      hideTyping();
      console.error(e);
      addMessage("Network error - please try again", "bot");
      showSuggestions(["Try again", "Contact support"]);
    }
  }

  sendBtn.onclick = () => sendMessage();
  input.addEventListener("keydown", e => e.key === "Enter" && sendMessage());

  // Get host website favicon
  function getFavicon() {
    // Try to find favicon from link tags
    const links = document.querySelectorAll('link[rel*="icon"]');
    for (const link of links) {
      if (link.href) return link.href;
    }

    // Fallback logic
    if (window.location.protocol === 'file:') {
      // Return a transparent 1x1 base64 to avoid ERR_FILE_NOT_FOUND
      return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }

    return window.location.origin + '/favicon.ico';
  }

  // Set up header with favicon and name
  const headerLogo = shadow.querySelector("#header-logo");
  const headerName = shadow.querySelector("#header-name");

  // Load favicon for header and button
  const faviconUrl = getFavicon();

  // Set header logo
  headerLogo.src = faviconUrl;
  headerLogo.onload = () => { headerLogo.style.display = 'block'; };
  headerLogo.onerror = () => { headerLogo.style.display = 'none'; };

  // Set button logo
  btnLogo.src = faviconUrl;
  btnLogo.onload = () => {
    btnLogo.style.display = 'block';
    btnIcon.style.display = 'none';
  };
  btnLogo.onerror = () => {
    btnLogo.style.display = 'none';
    btnIcon.style.display = 'block';
  };

  // Fetch welcome info from server
  fetch(`${baseUrl}/api/chat/welcome/${config.connectionId}`)
    .then(r => r.json())
    .then(data => {
      if (data.assistantName) {
        headerName.textContent = data.assistantName;
      }
      if (data.welcomeMessage) {
        bubbleText.textContent = data.welcomeMessage;
      }
    })
    .catch(() => { });
})();
