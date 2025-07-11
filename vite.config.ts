import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    global: {},
    // Polyfill for Node 16's crypto
    'process.env': {},
  }
})