(function () {
    const script = document.currentScript;
    const apiBase = script.getAttribute("data-api-base");
    const connectionId = script.getAttribute("data-connection-id");
    const password = script.getAttribute("data-password");

    let started = false; // 🟢 FIXED: replaces broken step logic

    const container = document.createElement("div");
    container.id = "chatbot-widget-root";

    // 🟢 FORCE TOPMOST LAYER
    Object.assign(container.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: "2147483647",
        pointerEvents: "auto"
    });

    document.body.appendChild(container);

    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "http://localhost:3000/widget.css";
    document.head.appendChild(css);

    const logo = "http://localhost:3000/chatbot-logo.png";

    container.innerHTML = `
      <button id="cb-toggle" class="cb-toggle">
        <img src="${logo}" />
      </button>

      <div id="cb-box" class="cb-box" style="display:none;width:280px;">
        <div class="cb-header">Idea Assistant</div>
        <div id="cb-messages" class="cb-messages"></div>
        <div class="cb-input">
          <input id="cb-input" placeholder="Type here..." />
          <button id="cb-send">➤</button>
        </div>
      </div>
    `;

    const box = document.getElementById("cb-box");
    const messages = document.getElementById("cb-messages");
    const input = document.getElementById("cb-input");
    const sendBtn = document.getElementById("cb-send");

    function bot(text) {
        const d = document.createElement("div");
        d.className = "cb-bot";
        d.innerText = text;
        messages.appendChild(d);
        messages.scrollTop = messages.scrollHeight;
    }

    function user(text) {
        const d = document.createElement("div");
        d.className = "cb-user";
        d.innerText = text;
        messages.appendChild(d);
        messages.scrollTop = messages.scrollHeight;
    }

    async function handle(text) {
        try {
            const res = await fetch(`${apiBase}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "connectionid": connectionId,
                    "password": password
                },
                body: JSON.stringify({ message: text })
            });

            if (!res.ok) {
                bot("⚠️ Server error. Please try again.");
                return;
            }

            const data = await res.json();

            if (data.reply) bot(data.reply);
            if (data.hint) setTimeout(() => bot(data.hint), 400);

        } catch (err) {
            console.error(err);
            bot("❌ I can’t reach the server right now.");
        }
    }

    sendBtn.onclick = () => {
        const text = input.value.trim();
        if (!text) return;

        user(text);
        input.value = "";
        handle(text);
    };

    input.addEventListener("keydown", e => {
        if (e.key === "Enter") sendBtn.click();
    });

    document.getElementById("cb-toggle").onclick = () => {
        box.style.display = box.style.display === "none" ? "block" : "none";

        if (!started) {
            bot("Hi 👋 I’m your Idea Assistant.");
            started = true;
        }
    };
})();
