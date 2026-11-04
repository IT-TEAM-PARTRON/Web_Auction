import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    host: true, // Cho phép lắng nghe trên tất cả giao diện mạng (Local, LAN IP, WAN IP)
    proxy: {
      '/api/v1': {
        target: process.env.VITE_BACKEND_TARGET || 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})

