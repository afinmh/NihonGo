import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/', // untuk hosting di root (misal Vercel)
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        chat: resolve(__dirname, 'chat.html')
      }
    }
  },
  esbuild: {
    target: 'esnext'
  }
})
