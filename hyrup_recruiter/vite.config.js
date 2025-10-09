import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Proxy API requests starting with /api to the backend defined in .env (VITE_API_URL)
    proxy: {
      '/api': {
        // import.meta.env is available in Vite config when exported as a function,
        // but since we're in a static config we provide a sensible default here.
        target: (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
