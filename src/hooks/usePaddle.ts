import { useEffect, useState } from 'react'
import { type Paddle } from '@paddle/paddle-js'
import { getPaddle } from '../lib/paddle'

export function usePaddle() {
  const [paddle, setPaddle] = useState<Paddle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPaddle()
      .then(setPaddle)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { paddle, loading, error }
}
