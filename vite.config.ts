import { loadEnv, defineConfig } from 'vite'
import type { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'
import { resolve } from 'path'

export default defineConfig(({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: '/',
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
    },
    plugins: [
      {
        name: 'dev-api-proxy',
        configureServer(server) {
          const apiBase = '/api'
          server.middlewares.use(async (req, res, next) => {
            if (!req.url) return next()
            // Mistral chat endpoint (dev only)
            if (req.method === 'POST' && req.url.startsWith(`${apiBase}/mistral/chat`)) {
              try {
                const chunks: any[] = []
                req.on('data', (c) => chunks.push(c))
                await new Promise((resolve) => req.on('end', resolve))
                const body = JSON.parse(Buffer.concat(chunks).toString() || '{}')
                const prompt = body.prompt || ''
                const apiKey = env.MISTRAL_API_KEY || ''
                if (!apiKey) {
                  res.writeHead(500, { 'Content-Type': 'application/json' })
                  res.end(JSON.stringify({ error: 'Missing MISTRAL_API_KEY' }))
                  return
                }
                const reply = await fetch('https://api.mistral.ai/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                  },
                  body: JSON.stringify({
                    model: 'mistral-small-latest',
                    messages: [
                      { role: 'system', content: 'You are a friendly Japanese learning assistant.' },
                      { role: 'user', content: prompt }
                    ]
                  })
                })
                if (!reply.ok) {
                  const txt = await reply.text()
                  res.writeHead(reply.status, { 'Content-Type': 'application/json' })
                  res.end(JSON.stringify({ error: 'Upstream error', details: txt }))
                  return
                }
                const data = await reply.json() as any
                const content = data?.choices?.[0]?.message?.content || ''
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ reply: content }))
                return
              } catch (e: any) {
                res.writeHead(500, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'Server error', details: String(e) }))
                return
              }
            }

            // List backgrounds endpoint
            if (req.method === 'GET' && req.url.startsWith(`${apiBase}/bg/list`)) {
              try {
                const bgDir = path.join(process.cwd(), 'public', 'assets', 'bg')
                const files = fs.readdirSync(bgDir).filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f))
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ files }))
                return
              } catch (e: any) {
                res.writeHead(500, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'Cannot list backgrounds', details: String(e) }))
                return
              }
            }

            next()
          })
        }
      } as Plugin
    ]
  }
})
