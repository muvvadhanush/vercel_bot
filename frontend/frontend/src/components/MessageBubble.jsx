export default function MessageBubble({ role, text, theme, time }) {
    const isUser = role === "user";

    return (
        <div
            style={{
                textAlign: isUser ? "right" : "left",
                margin: "8px 0"
            }}
        >
            <div
                style={{
                    display: "inline-block",
                    padding: "10px 16px",
                    borderRadius: "18px",
                    background: isUser ? theme.bubbleUser : theme.neumorphic.surface,
                    color: isUser ? "#fff" : theme.text,
                    maxWidth: "85%",
                    fontSize: "14px",
                    boxShadow: isUser ? "4px 4px 10px rgba(0,0,0,0.15)" : theme.neumorphic.button,
                    border: isUser ? "none" : "1px solid rgba(255,255,255,0.1)",
                    lineHeight: "1.4"
                }}
            >
                {text}
            </div>

            {time && (
                <div style={{ fontSize: "10px", opacity: 0.5, marginTop: "2px" }}>
                    {new Date(time).toLocaleTimeString()}
                </div>
            )}
        </div>
    );
}
