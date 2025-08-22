import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    proxy: {
      // '/api/v1': 'http://14.252.196.12:8000',
      '/api/v1': 'http://127.0.0.1:8000',
      // '/api/v1': 'http://192.168.23.197:8000',
    },
  },
})
