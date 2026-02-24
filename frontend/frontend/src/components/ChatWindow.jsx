import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { sendMessage } from "../services/chatApi";

export default function ChatWindow({ theme, connection, sessionId, onClose }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    const handleSend = async () => {
        console.log("SEND CLICKED");
        console.log("INPUT:", input);
        console.log("CONNECTION:", connection);
        console.log("SESSION:", sessionId);

        if (!input.trim()) return;

        setTyping(true);

        const res = await sendMessage(input, connection, sessionId);
        console.log("API RESPONSE:", res);

        setMessages(res?.messages || []);
        setTyping(false);
        setInput("");
    };

    return (
        <div
            style={{
                position: "fixed",
                bottom: "90px",
                right: "20px",
                width: "360px",
                height: "480px",
                background: theme.neumorphic.surface,
                color: theme.text,
                borderRadius: "20px",
                display: "flex",
                flexDirection: "column",
                boxShadow: theme.neumorphic.outer,
                border: "none"
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: "16px",
                    fontWeight: "bold",
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: `1px solid ${theme.border}`,
                    color: theme.text
                }}
            >
                {connection.assistantName || "AI Assistant"}
                <button
                    onClick={onClose}
                    style={{
                        background: "none",
                        border: "none",
                        color: theme.text,
                        cursor: "pointer",
                        fontSize: "18px"
                    }}
                >
                    ✖
                </button>
            </div>

            {/* Messages */}
            <div
                style={{
                    flex: 1,
                    padding: "15px",
                    overflowY: "auto"
                }}
            >
                {Array.isArray(messages) && messages.length === 0 ? (
                    <div style={{ opacity: 0.6, textAlign: "center", marginTop: "20px" }}>
                        Start the conversation…
                    </div>
                ) : (
                    Array.isArray(messages) &&
                    messages.map((msg, i) => (
                        <MessageBubble
                            key={i}
                            message={msg}
                            theme={theme}
                        />
                    ))
                )}

                {typing && <TypingIndicator />}
                <div ref={endRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "15px", display: "flex", gap: "12px", background: "transparent" }}>
                <input
                    id="chatbot-input"
                    name="chatbotMessage"
                    value={input ?? ""}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSend();
                    }}
                    placeholder="Type a message…"
                    autoComplete="off"
                    style={{
                        flex: 1,
                        padding: "12px 16px",
                        borderRadius: "12px",
                        border: "none",
                        background: theme.neumorphic.surface,
                        boxShadow: theme.neumorphic.inner,
                        color: theme.text,
                        outline: "none"
                    }}
                />


                <button
                    onClick={handleSend}
                    style={{
                        padding: "10px 20px",
                        borderRadius: "12px",
                        border: "none",
                        background: theme.neumorphic.surface,
                        boxShadow: theme.neumorphic.button,
                        color: theme.bubbleUser,
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s"
                    }}
                    onMouseDown={(e) => e.currentTarget.style.boxShadow = theme.neumorphic.buttonActive}
                    onMouseUp={(e) => e.currentTarget.style.boxShadow = theme.neumorphic.button}
                >
                    Send
                </button>
            </div>
        </div >
    );
}
