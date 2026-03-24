import { initializePaddle, type Paddle } from '@paddle/paddle-js'

let paddleInstance: Paddle | null = null

export async function getPaddle(): Promise<Paddle> {
  if (paddleInstance) return paddleInstance

  const token = import.meta.env.VITE_PADDLE_CLIENT_TOKEN
  const environment = import.meta.env.VITE_PADDLE_ENVIRONMENT === 'production'
    ? 'production'
    : 'sandbox'

  if (!token) {
    throw new Error('VITE_PADDLE_CLIENT_TOKEN is not set in .env')
  }

  const instance = await initializePaddle({ environment, token })

  if (!instance) {
    throw new Error('Failed to initialize Paddle')
  }

  paddleInstance = instance
  return paddleInstance
}

export const PRICE_IDS: string[] = (import.meta.env.VITE_PADDLE_PRICE_IDS || '')
  .split(',')
  .map((id: string) => id.trim())
  .filter(Boolean)
