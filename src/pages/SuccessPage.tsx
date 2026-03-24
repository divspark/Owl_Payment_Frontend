import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'

interface TransactionDetails {
  id: string
  status: string
  customer_id: string | null
  invoice_number: string | null
  currency_code: string
  created_at: string
  updated_at: string
  items: Array<{
    quantity: number
    price: {
      id: string
      description: string
      unit_price: { amount: string; currency_code: string }
      billing_cycle: { interval: string; frequency: number } | null
    }
    product: { id: string; name: string; description: string | null }
  }>
  details: {
    totals: {
      subtotal: string
      tax: string
      total: string
      currency_code: string
    }
  }
}

type FetchState = 'idle' | 'loading' | 'success' | 'error'

export function SuccessPage() {
  const [searchParams] = useSearchParams()
  // Paddle appends _ptxn=<transaction_id> to the success URL
  const transactionId = searchParams.get('_ptxn')

  const [transaction, setTransaction] = useState<TransactionDetails | null>(null)
  const [fetchState, setFetchState] = useState<FetchState>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!transactionId) return

    setFetchState('loading')

    // The Vite dev server proxies /api/paddle/* → https://api.paddle.com/*
    // and injects Authorization: Bearer <PADDLE_SECRET_KEY>
    fetch(`/api/paddle/transactions/${transactionId}`, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.error?.detail || `HTTP ${res.status}`)
        }
        return res.json()
      })
      .then((body) => {
        setTransaction(body.data)
        setFetchState('success')
      })
      .catch((err) => {
        setErrorMsg(err.message)
        setFetchState('error')
      })
  }, [transactionId])

  if (!transactionId) {
    return (
      <div className="page-center error-box">
        <h2>No Transaction Found</h2>
        <p>This page should be reached after a successful Paddle checkout.</p>
        <Link to="/" className="back-link">← Back to Products</Link>
      </div>
    )
  }

  return (
    <div className="success-page">
      <div className="success-header">
        <div className="checkmark">✓</div>
        <h1>Payment Successful!</h1>
        <p className="transaction-id">Transaction ID: <code>{transactionId}</code></p>
      </div>

      <div className="verify-section">
        <h2>Transaction Verification</h2>

        {fetchState === 'loading' && (
          <div className="page-center">
            <div className="spinner" />
            <p>Verifying transaction with Paddle API...</p>
          </div>
        )}

        {fetchState === 'error' && (
          <div className="error-box">
            <p><strong>Verification failed:</strong> {errorMsg}</p>
            <p className="hint">
              Make sure <code>PADDLE_SECRET_KEY</code> is set in your <code>.env</code> file
              so the Vite proxy can authenticate with the Paddle API.
            </p>
          </div>
        )}

        {fetchState === 'success' && transaction && (
          <div className="transaction-details">
            <div className="status-badge" data-status={transaction.status}>
              {transaction.status.toUpperCase()}
            </div>

            <table className="details-table">
              <tbody>
                <tr>
                  <td>Transaction ID</td>
                  <td><code>{transaction.id}</code></td>
                </tr>
                <tr>
                  <td>Status</td>
                  <td>{transaction.status}</td>
                </tr>
                {transaction.invoice_number && (
                  <tr>
                    <td>Invoice</td>
                    <td>{transaction.invoice_number}</td>
                  </tr>
                )}
                <tr>
                  <td>Created</td>
                  <td>{new Date(transaction.created_at).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <h3>Items Purchased</h3>
            {transaction.items.map((item, i) => (
              <div key={i} className="transaction-item">
                <p className="item-name">{item.product.name}</p>
                {item.product.description && (
                  <p className="item-desc">{item.product.description}</p>
                )}
                <p className="item-price">
                  {item.price.unit_price.currency_code}{' '}
                  {(parseInt(item.price.unit_price.amount) / 100).toFixed(2)}
                  {item.price.billing_cycle && (
                    <span className="billing-cycle">
                      {' '}/ {item.price.billing_cycle.interval}
                    </span>
                  )}
                  {' '}× {item.quantity}
                </p>
              </div>
            ))}

            <div className="totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>
                  {transaction.details.totals.currency_code}{' '}
                  {(parseInt(transaction.details.totals.subtotal) / 100).toFixed(2)}
                </span>
              </div>
              <div className="total-row">
                <span>Tax</span>
                <span>
                  {transaction.details.totals.currency_code}{' '}
                  {(parseInt(transaction.details.totals.tax) / 100).toFixed(2)}
                </span>
              </div>
              <div className="total-row total-final">
                <span>Total</span>
                <span>
                  {transaction.details.totals.currency_code}{' '}
                  {(parseInt(transaction.details.totals.total) / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <Link to="/" className="back-link">← Back to Products</Link>
    </div>
  )
}
