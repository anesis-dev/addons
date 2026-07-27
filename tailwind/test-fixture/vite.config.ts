import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// anesis:top-imports

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // anesis:build-plugins
  ],
})
