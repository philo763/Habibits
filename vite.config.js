import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Pour GitHub Pages, on définira VITE_BASE=/nom-du-depot/ au moment du build.
const base = process.env.VITE_BASE || "/";
// Dans l'APK, on n'utilise pas le service worker.
const natif = process.env.VITE_NATIF === "1";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      disable: natif,
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon-180x180.png"],
      manifest: {
        name: "Habibits",
        short_name: "Habibits",
        description: "Des petits défis pour ancrer des habitudes.",
        lang: "fr",
        theme_color: "#0a1631",
        background_color: "#0a1631",
        display: "standalone",
        orientation: "portrait",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
});