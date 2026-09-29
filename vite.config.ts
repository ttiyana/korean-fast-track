import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In production, /api/state is served by netlify/functions/api.mjs (Netlify Blobs).
    // Locally, scripts/dev-api.mjs stands in for it so syncing can be tested offline.
    proxy: {
      '/api': { target: 'http://localhost:8787', changeOrigin: true },
    },
  },
})
