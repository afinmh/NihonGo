import { defineConfig } from 'vite'
import { resolve } from 'path'
// Jika Anda menggunakan plugin lain (seperti react, vue), biarkan saja
// import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        chat: resolve(__dirname, 'chat.html')
      }
    }
  }
  ,
  esbuild: {
    target: 'esnext'
  }
  // plugins: [react()], // contoh jika ada plugin
})