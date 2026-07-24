import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "QR Collector",
        short_name: "QR Collector",
        description: "Colleziona QR nei punti di interesse e sblocca curiosità, sconti e foto esclusive.",
        theme_color: "#006b5c",
        background_color: "#f4fbf7",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }
        ]
      }
    })
  ],
  server: {
    proxy: {
      "/api": "http://localhost:4000"
    }
  }
});
