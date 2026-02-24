import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    define: {
        "process.env": {}
    },
    build: {
        minify: false, // 🔴 VERY IMPORTANT
        lib: {
            entry: "src/widget/widget.jsx",
            name: "ChatbotWidget",
            formats: ["iife"],
            fileName: () => "chatbot.iife.js"
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: true
            }
        }
    },
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:5001",
                changeOrigin: true,
                secure: false,
            },
        },
    }
});
