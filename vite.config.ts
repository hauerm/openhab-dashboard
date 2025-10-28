import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy REST API calls to OpenHAB, bypassing SSL certificate validation
      "/api": {
        target: "https://192.168.1.15:9443",
        changeOrigin: true,
        secure: false, // Disable SSL certificate validation
        rewrite: (path) => path.replace(/^\/api/, "/rest"),
      },
      // Proxy WebSocket connections to OpenHAB, bypassing SSL certificate validation
      "/ws": {
        target: "wss://192.168.1.15:9443",
        changeOrigin: true,
        secure: false, // Disable SSL certificate validation
        ws: true, // Enable WebSocket proxying
      },
    },
  },
});
