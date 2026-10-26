import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      // Windows may lock images in this local asset folder; they remain served from public/.
      ignored: ['**/public/image/VanMoc/**'],
    },
  },
})
