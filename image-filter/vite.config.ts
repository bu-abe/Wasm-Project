import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import wasm from "vite-plugin-wasm";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/Wasm-Project/image-filter/" : "/",
  plugins: [wasm(), react(), tailwindcss()],
  server: {
    port: Number(process.env.PORT) || 3000,
    fs: {
      allow: [
        __dirname,
        path.resolve(__dirname, "../packages/wasm-image-filter"),
      ],
    },
  },
});
