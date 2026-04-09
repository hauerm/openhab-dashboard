import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "VITE_");

  const openhabHost = env.VITE_OPENHAB_HOST || "localhost";
  const openhabProtocol = (env.VITE_OPENHAB_PROTOCOL || "http").toLowerCase();
  const openhabInsecure = env.VITE_OPENHAB_INSECURE === "true";

  const openhabPort =
    env.VITE_OPENHAB_PORT || (openhabProtocol === "https" ? "9443" : "8080");
  const httpProtocol = openhabProtocol === "https" ? "https" : "http";
  const wsProtocol = openhabProtocol === "https" ? "wss" : "ws";

  const httpTarget = `${httpProtocol}://${openhabHost}:${openhabPort}`;
  const wsTarget = `${wsProtocol}://${openhabHost}:${openhabPort}`;

  return {
    plugins: [react(), tailwindcss()],
    build: {
      rolldownOptions: {
        output: {
          manualChunks: (moduleId) => {
            if (moduleId.includes("node_modules/recharts")) {
              return "charts";
            }
            if (moduleId.includes("node_modules/react-toastify")) {
              return "notifications";
            }
            if (
              moduleId.includes("node_modules/@mdi/") ||
              moduleId.includes("node_modules/react-icons")
            ) {
              return "icons";
            }
            if (
              moduleId.includes("node_modules/react/") ||
              moduleId.includes("node_modules/react-dom/") ||
              moduleId.includes("node_modules/scheduler/")
            ) {
              return "react";
            }
            return undefined;
          },
        },
      },
    },
    server: {
      proxy: {
        "/api": {
          target: httpTarget,
          changeOrigin: true,
          secure: !openhabInsecure,
          rewrite: (path) => path.replace(/^\/api/, "/rest"),
        },
        "/ws": {
          target: wsTarget,
          changeOrigin: true,
          secure: !openhabInsecure,
          ws: true,
        },
        "/static": {
          target: httpTarget,
          changeOrigin: true,
          secure: !openhabInsecure,
        },
      },
    },
  };
});
