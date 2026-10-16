import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // The React portfolio lives at /2d/. Shared images keep their /images/ URLs.
  base: command === 'build' ? '/2d/' : '/',
  publicDir: command === 'build' ? false : 'public',
  build: { outDir: 'dist/2d' },
  define: {
    global: {},
    // Polyfill for Node 16's crypto
    'process.env': {},
  }
}))
