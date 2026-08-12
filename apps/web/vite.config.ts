import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiTarget = process.env.VITE_API_TARGET ?? "http://127.0.0.1:3001";
const webPort = Number(process.env.VITE_PORT ?? 5173);

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: webPort,
    strictPort: true,
    proxy: {
      "/account": apiTarget,
      "/transactions": apiTarget,
      "/analytics": apiTarget,
      "/savings-goal": apiTarget,
      "/recommendations": apiTarget,
      "/health": apiTarget,
      "/meta": apiTarget,
    },
  },
});
