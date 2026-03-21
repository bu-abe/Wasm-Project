import { defineConfig } from 'vite'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/Wasm-Project/video-editor/' : '/',
  plugins: [wasm(), topLevelAwait(), react(), tailwindcss()],
  server: {
    port: 3001,
  },
})
