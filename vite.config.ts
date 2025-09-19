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
        chapter1: resolve(__dirname, 'chapter1.html'),
        chapter2: resolve(__dirname, 'chapter2.html'),
        chapter3: resolve(__dirname, 'chapter3.html'),
        chapter4: resolve(__dirname, 'chapter4.html'),
        chapter5: resolve(__dirname, 'chapter5.html'),
      }
    }
  },
  esbuild: {
    target: 'esnext'
  }
})
