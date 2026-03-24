import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isSandbox = env.VITE_PADDLE_ENVIRONMENT !== 'production'
  const paddleApiBase = isSandbox ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com'

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Proxy Paddle API calls so the secret key stays server-side
        '/api/paddle': {
          target: paddleApiBase,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/paddle/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${env.PADDLE_SECRET_KEY}`)
            })
          },
        },
      },
    },
  }
})
