/**
 * vite.config.js — Vite build configuration
 *
 * proxy: during development, any request to /api
 * gets forwarded to localhost:5000 automatically.
 * This means in dev we can call /api/users instead
 * of http://localhost:5000/api/users — cleaner code.
 *
 * In production (Vercel), requests go to the real
 * Render backend URL set in VITE_API_URL env variable.
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,  // keep same port as CRA for consistency

    // 🧠 LEARN: proxy forwards /api requests to backend
    // So instead of fetch('http://localhost:5000/api/...')
    // you can just write fetch('/api/...') in development
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})