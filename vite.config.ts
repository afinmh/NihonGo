import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/', // untuk hosting di root (misal Vercel)
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        chat: resolve(__dirname, 'chat.html'),
        tes: resolve(__dirname, 'tes.html'),
        chapter1: resolve(__dirname, 'chapter1.html'),
      }
    }
  },
  esbuild: {
    target: 'esnext'
  }
})
