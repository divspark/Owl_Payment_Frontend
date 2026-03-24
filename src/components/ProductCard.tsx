import { type PricePreviewResponse } from '@paddle/paddle-js'

type PriceItem = PricePreviewResponse['data']['details']['lineItems'][number]

interface ProductCardProps {
  item: PriceItem
  onBuy: (priceId: string) => void
  loading: boolean
}

export function ProductCard({ item, onBuy, loading }: ProductCardProps) {
  const { price, formattedTotals, product } = item

  return (
    <div className="product-card">
      {product.imageUrl && (
        <img src={product.imageUrl} alt={product.name} className="product-image" />
      )}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {product.description && (
          <p className="product-description">{product.description}</p>
        )}
        <div className="product-pricing">
          <span className="product-price">{formattedTotals.subtotal}</span>
          {price.billingCycle && (
            <span className="billing-cycle">
              / {price.billingCycle.frequency > 1 ? price.billingCycle.frequency : ''}{' '}
              {price.billingCycle.interval}
            </span>
          )}
        </div>
        {price.trialPeriod && (
          <p className="trial-info">
            {price.trialPeriod.frequency} {price.trialPeriod.interval} free trial
          </p>
        )}
      </div>
      <button
        className="buy-button"
        onClick={() => onBuy(price.id)}
        disabled={loading}
      >
        {loading ? 'Opening...' : 'Buy Now'}
      </button>
    </div>
  )
}
