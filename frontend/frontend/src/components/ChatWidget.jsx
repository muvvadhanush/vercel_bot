import { useState } from "react";
import ChatWindow from "./ChatWindow";
import { generateTheme } from "../theme/theme";

export default function ChatWidget({ externalConfig, sessionId }) {
    const [open, setOpen] = useState(false);
    const theme = generateTheme();

    return (
        <>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: theme.neumorphic.surface,
                    color: theme.bubbleUser,
                    border: "none",
                    fontSize: "26px",
                    cursor: "pointer",
                    zIndex: 999999,
                    boxShadow: theme.neumorphic.button,
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
                onMouseDown={(e) => e.currentTarget.style.boxShadow = theme.neumorphic.buttonActive}
                onMouseUp={(e) => e.currentTarget.style.boxShadow = theme.neumorphic.button}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = theme.neumorphic.button}
            >
                💬
            </button>

            {open && (
                <ChatWindow
                    theme={theme}
                    connection={externalConfig}
                    sessionId={sessionId}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}
