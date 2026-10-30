import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// /api მოთხოვნები ლოკალურად გადადის json-server-ზე (:3000), ონლაინ კი — Vercel-ის ფუნქციაზე (api/index.js)
const apiProxy = {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api/, ''),
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // db.json-ს json-server ცვლის — Vite-მა მასზე გვერდი თავიდან არ უნდა ჩატვირთოს
    watch: { ignored: ['**/db.json'] },
    proxy: apiProxy,
  },
  preview: { proxy: apiProxy },
})
