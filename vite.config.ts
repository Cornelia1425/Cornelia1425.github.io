import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Plain Node middleware. Kept out of the TypeScript project because this config has no Node types.
// @ts-expect-error ./scripts/spatial-dev.mjs has no declaration file.
import spatialDev from './scripts/spatial-dev.mjs'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [spatialDev(), react()],
  // Production React lives at /2d/. Dev keeps base / so the printed URL is the 3D homepage.
  base: command === 'build' ? '/2d/' : '/',
  publicDir: command === 'build' ? false : 'public',
  build: { outDir: 'dist/2d' },
  define: {
    global: {},
    // Polyfill for Node 16's crypto
    'process.env': {},
  }
}))
