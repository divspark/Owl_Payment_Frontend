import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type PricePreviewResponse } from '@paddle/paddle-js'
import { usePaddle } from '../hooks/usePaddle'
import { PRICE_IDS } from '../lib/paddle'
import { ProductCard } from '../components/ProductCard'

type LineItem = PricePreviewResponse['data']['details']['lineItems'][number]

export function ProductsPage() {
  const { paddle, loading: paddleLoading, error: paddleError } = usePaddle()
  const [products, setProducts] = useState<LineItem[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [fetching, setFetching] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const navigate = useNavigate()

  // Register global checkout event handler once paddle is ready
  useEffect(() => {
    if (!paddle) return

    // Store the completed transaction ID so we can navigate after the overlay closes
    let completedTxnId: string | undefined

    paddle.Update({
      eventCallback(event) {
        if (event.name === 'checkout.completed') {
          completedTxnId = (event.data as { transaction_id?: string })?.transaction_id
        }
        if (event.name === 'checkout.closed') {
          setCheckoutLoading(false)
          // Only navigate to success if a transaction was completed (not just dismissed)
          if (completedTxnId) {
            navigate(`/success?_ptxn=${completedTxnId}`)
            completedTxnId = undefined
          }
        }
      },
    })
  }, [paddle, navigate])

  useEffect(() => {
    if (!paddle || PRICE_IDS.length === 0) return

    setFetching(true)
    setFetchError(null)

    paddle
      .PricePreview({
        items: PRICE_IDS.map((priceId) => ({ priceId, quantity: 1 })),
      })
      .then((res) => {
        setProducts(res.data.details.lineItems)
      })
      .catch((err) => {
        setFetchError(err.message || 'Failed to fetch products')
      })
      .finally(() => setFetching(false))
  }, [paddle])

  function handleBuy(priceId: string) {
    if (!paddle) return
    setCheckoutLoading(true)

    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      settings: {
        displayMode: 'overlay',
        theme: 'light',
        locale: 'en',
      },
    })
  }

  if (paddleLoading) {
    return (
      <div className="page-center">
        <div className="spinner" />
        <p>Initializing Paddle...</p>
      </div>
    )
  }

  if (paddleError) {
    return (
      <div className="page-center error-box">
        <h2>Paddle Initialization Error</h2>
        <p>{paddleError}</p>
        <p className="hint">Make sure <code>VITE_PADDLE_CLIENT_TOKEN</code> is set in your <code>.env</code> file.</p>
      </div>
    )
  }

  if (PRICE_IDS.length === 0) {
    return (
      <div className="page-center error-box">
        <h2>No Products Configured</h2>
        <p>Add price IDs to <code>VITE_PADDLE_PRICE_IDS</code> in your <code>.env</code> file.</p>
        <p className="hint">Example: <code>VITE_PADDLE_PRICE_IDS=pri_abc123,pri_def456</code></p>
      </div>
    )
  }

  return (
    <div className="products-page">
      <h1>Our Products</h1>
      <p className="subtitle">Powered by Paddle</p>

      {fetching && (
        <div className="page-center">
          <div className="spinner" />
          <p>Loading products...</p>
        </div>
      )}

      {fetchError && (
        <div className="error-box">
          <p>Failed to load products: {fetchError}</p>
        </div>
      )}

      {!fetching && products.length > 0 && (
        <div className="products-grid">
          {products.map((item) => (
            <ProductCard
              key={item.price.id}
              item={item}
              onBuy={handleBuy}
              loading={checkoutLoading}
            />
          ))}
        </div>
      )}
    </div>
  )
}
