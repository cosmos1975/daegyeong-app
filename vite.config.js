import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Capacitor는 dist 폴더를 WebView로 로드
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
  },
})
