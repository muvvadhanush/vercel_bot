export function generateTheme() {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const bodyStyles = getComputedStyle(document.body);

    const primaryColor =
        bodyStyles.getPropertyValue("--primary-color") ||
        "#4f46e5";

    if (prefersDark) {
        return {
            mode: "dark",
            background: "#1e1e1e",
            text: "#e0e0e0",
            bubbleUser: primaryColor,
            bubbleBot: "#2a2a2a",
            border: "#333333",
            neumorphic: {
                surface: "#1e1e1e",
                outer: "8px 8px 16px #131313, -8px -8px 16px #292929",
                inner: "inset 4px 4px 8px #131313, inset -4px -4px 8px #292929",
                button: "4px 4px 8px #131313, -4px -4px 8px #292929",
                buttonActive: "inset 4px 4px 8px #131313, inset -4px -4px 8px #292929"
            }
        };
    }

    return {
        mode: "light",
        background: "#e0e0e0",
        text: "#444444",
        bubbleUser: primaryColor,
        bubbleBot: "#e0e0e0",
        border: "#d1d1d1",
        neumorphic: {
            surface: "#e0e0e0",
            outer: "10px 10px 20px #bebebe, -10px -10px 20px #ffffff",
            inner: "inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff",
            button: "6px 6px 12px #bebebe, -6px -6px 12px #ffffff",
            buttonActive: "inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff"
        }
    };
}
