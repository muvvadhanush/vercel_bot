export async function sendMessage(message, connection, sessionId) {
    try {
        const res = await fetch("http://localhost:5001/api/chat/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message,
                connectionId: connection.connectionId,
                connectionSecret: connection.connectionSecret,
                sessionId
            })
        });

        if (!res.ok) {
            throw new Error("API error: " + res.status);
        }

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("sendMessage failed:", err);
        return { messages: [] };
    }
}
