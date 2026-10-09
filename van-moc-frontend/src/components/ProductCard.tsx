import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { money, type Product } from '../api/catalog'
import './ProductCard.css'

/** Shared presentation and unchanged buy-now/cart flow for both storefront lists. */
export function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const navigate = useNavigate()
  const { addItem, loading } = useCart()
  const [error, setError] = useState('')
  const [failedImage, setFailedImage] = useState<string | null>(null)
  const href = `/shop/${product.slug}`
  const add = async (buyNow: boolean) => {
    if (buyNow && product.engravingEnabled) { navigate(href); return }
    try {
      await addItem({ id: product.id, name: product.name, price: product.price, stock: product.stock, image: product.imageUrl || '' })
      setError('')
      if (buyNow) navigate('/checkout', { state: { productId: product.id } })
    } catch { setError('Không thể thêm sản phẩm. Vui lòng kiểm tra giỏ hàng và thử lại.') }
  }
  return <article className={`vm-product-card shop-product-card${featured ? ' featured-product-card' : ''}`}>
    <Link to={href} className="block" tabIndex={-1} aria-hidden>
      <div className="shop-product-card__media">
        {product.imageUrl && failedImage !== product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} loading="lazy" decoding="async" onError={() => setFailedImage(product.imageUrl)} />
          : <span className="shop-product-card__placeholder">{product.imageUrl ? 'Ảnh đang được cập nhật' : 'Chưa có ảnh'}</span>}
      </div>
    </Link>
    <div className="shop-product-card__body">
      <div className="shop-product-card__engraving">{product.engravingEnabled ? <span>Có thể khắc tên</span> : null}</div>
      <Link to={href} className="shop-product-card__name-link" title={product.name}><h3>{product.name}</h3></Link>
      {!featured && <p className="shop-product-card__description">{product.shortDescription}</p>}
      <div className="shop-product-card__price-row">
        <p className="shop-product-card__price">{money(product.price)}</p>
        <p className="shop-product-card__stock">{product.stock === 0 ? 'Hết hàng' : product.stock <= 10 ? `Chỉ còn ${product.stock}` : `Còn lại ${product.stock}`}</p>
      </div>
      <div className="shop-product-card__actions">
        <button type="button" className="shop-product-card__buy-now" disabled={loading || product.stock === 0} aria-label={`${product.stock === 0 ? 'Hết hàng' : 'Mua ngay'} ${product.name}`} onClick={() => void add(true)}>{product.stock === 0 ? 'Hết hàng' : 'Mua ngay'}</button>
        <button type="button" className="shop-product-card__cart" disabled={loading || product.stock === 0} aria-label={`Thêm ${product.name} vào giỏ hàng`} onClick={() => void add(false)}><ShoppingCart size={17} /></button>
      </div>
      {error && <p role="alert">{error}</p>}
    </div>
  </article>
}
