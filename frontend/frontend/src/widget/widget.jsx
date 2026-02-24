import React from "react";
import { createRoot } from "react-dom/client";
import ChatWidget from "../components/ChatWidget";

(function () {
    try {
        const config = window.ChatbotConfig;

        if (!config?.connectionId || !config?.connectionSecret) {
            console.error("Chatbot: connection config missing");
            return;
        }

        // Create host
        const host = document.createElement("div");
        host.id = "chatbot-shadow-host";
        host.style.position = "fixed";
        host.style.bottom = "0";
        host.style.right = "0";
        host.style.zIndex = "2147483647";

        document.body.appendChild(host);

        // Attach shadow DOM
        const shadowRoot = host.attachShadow({ mode: "open" });

        // Inject isolation styles
        const style = document.createElement("style");
        style.textContent = `
      :host { all: initial; }
      * { box-sizing: border-box; font-family: Arial, sans-serif; }
      button { all: unset; cursor: pointer; }
      input { all: unset; border: 1px solid #ccc; padding: 6px; border-radius: 6px; }
    `;
        shadowRoot.appendChild(style);

        // Mount point
        const mountPoint = document.createElement("div");
        shadowRoot.appendChild(mountPoint);

        // Session ID
        let sessionId = localStorage.getItem("chatbot_session_id");
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            localStorage.setItem("chatbot_session_id", sessionId);
        }

        // ✅ STABLE LEGACY RENDER
        const root = createRoot(mountPoint);
        root.render(
            <ChatWidget externalConfig={config} sessionId={sessionId} />
        );
        console.log("✅ Chatbot widget mounted successfully");
    } catch (err) {
        console.error("❌ Chatbot widget failed to mount", err);
    }
})();
