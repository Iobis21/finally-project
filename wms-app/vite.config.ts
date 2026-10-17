import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // db.json-ს json-server ცვლის — Vite-მა მასზე გვერდი თავიდან არ უნდა ჩატვირთოს
    watch: { ignored: ['**/db.json'] },
  },
})
