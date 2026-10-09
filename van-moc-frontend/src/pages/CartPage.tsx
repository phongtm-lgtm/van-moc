import { useState } from 'react'
import { Minus, Plus, ShieldCheck, ShoppingCart, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'

function formatPrice(price: number) {
  return `${new Intl.NumberFormat('vi-VN').format(price)} đ`
}

export function CartPage() {
  const { items, loading, error, refresh, updateQuantity, removeItem, clearCart } = useCart()
  const [selection, setSelectedKeys] = useState<string[] | null>(null)
  const [failedImages, setFailedImages] = useState<Record<string, string>>({})
  const selectedKeys = selection ?? items.map(item => item.key)
  const selectedItems = items.filter((item) => selectedKeys.includes(item.key))
  const subtotal = selectedItems.reduce((total, item) => {
    return total + item.lineTotal
  }, 0)
  const allSelected = items.length > 0 && items.every((item) => selectedKeys.includes(item.key))

  const toggleItem = (key: string) => {
    setSelectedKeys(selectedKeys.includes(key)
      ? selectedKeys.filter((selectedKey) => selectedKey !== key)
      : [...selectedKeys, key])
  }

  const toggleAll = () => {
    setSelectedKeys(allSelected ? [] : items.map((item) => item.key))
  }

  const removeSelected = () => {
    void (async () => { for (const item of selectedItems) await removeItem(item.key) })().catch(() => {})
    setSelectedKeys([])
  }

  return (
    <div className="cart-page">
      <div className="cart-page__grain" aria-hidden />
      <main className="cart-page__inner">
        <header className="cart-heading">
          <div>
            <h1>Giỏ hàng <span>({items.length})</span></h1>
            <p>Kiểm tra sản phẩm trước khi thanh toán</p>
          </div>
        </header>
        {loading && <p role="status">Đang đồng bộ giỏ…</p>}
        {error && <p role="alert">{error} <button type="button" onClick={() => void refresh()}>Thử lại</button></p>}

        {items.length === 0 ? (
          <section className="cart-empty">
            <span><ShoppingCart size={34} strokeWidth={1.3} /></span>
            <h2>Giỏ hàng đang trống</h2>
            <p>Khám phá những sản phẩm sừng thủ công mang đường vân riêng biệt.</p>
            <Link to="/shop">Tiếp tục mua sắm</Link>
          </section>
        ) : (
          <div className="cart-layout">
            <section className="cart-list" aria-label="Sản phẩm trong giỏ">
              <div className="cart-list__header">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Chọn tất cả sản phẩm" />
                <span>Sản phẩm</span>
                <span>Đơn giá</span>
                <span>Số lượng</span>
                <span>Thành tiền</span>
                <span aria-hidden />
              </div>
              {items.map((item) => (
                <article className="cart-item" key={item.key}>
                  <input
                    type="checkbox"
                    checked={selectedKeys.includes(item.key)}
                    onChange={() => toggleItem(item.key)}
                    aria-label={`Chọn ${item.product.name}`}
                  />
                  <div className="cart-item__product">
                     <Link to={`/shop/${encodeURIComponent(item.product.slug || item.product.id)}`} className="cart-item__image">
                      {item.product.image && failedImages[item.key] !== item.product.image
                        ? <img src={item.product.image} alt={item.product.name} onError={() => setFailedImages(images => ({ ...images, [item.key]: item.product.image }))} />
                        : <span className="cart-item__placeholder">Ảnh đang cập nhật</span>}
                    </Link>
                    <div className="cart-item__info">
                       <Link to={`/shop/${encodeURIComponent(item.product.slug || item.product.id)}`}>{item.product.name}</Link>
                      {(!item.available || item.stock === 0 || item.quantity > item.stock) && <p role="alert">Sản phẩm hoặc cấu hình không còn khả dụng / không đủ tồn.</p>}
                      {item.product.category && <p>{item.product.category}</p>}
                      {item.customization && (
                        <span>Khắc: “{item.customization.text}” · {item.customization.position}<br />Phí khắc: {formatPrice(item.customization.fee)} / sản phẩm (đã gồm trong thành tiền)</span>
                      )}
                    </div>
                  </div>
                  <strong className="cart-item__price">{formatPrice(item.product.price)}</strong>
                  <div className="cart-item__quantity" aria-label={`Số lượng ${item.product.name}`}>
                    <button type="button" onClick={() => void updateQuantity(item.key, item.quantity - 1).catch(() => {})} disabled={loading || item.quantity <= 1} aria-label="Giảm số lượng">
                      <Minus size={14} />
                    </button>
                    <output>{item.quantity}</output>
                    <button type="button" disabled={loading || item.quantity >= item.stock} onClick={() => void updateQuantity(item.key, item.quantity + 1).catch(() => {})} aria-label="Tăng số lượng">
                      <Plus size={14} />
                    </button>
                  </div>
                  <strong className="cart-item__total">
                    {formatPrice(item.lineTotal)}
                  </strong>
                  <button type="button" disabled={loading} className="cart-item__remove" onClick={() => void removeItem(item.key).catch(() => {})} aria-label={`Xóa ${item.product.name}`}>
                    <Trash2 size={17} />
                  </button>
                </article>
              ))}
              <div className="cart-list__actions">
                <label>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                  Chọn tất cả
                </label>
                <button type="button" onClick={removeSelected} disabled={selectedItems.length === 0}>
                  <Trash2 size={14} /> Xóa đã chọn ({selectedItems.length})
                </button>
                <button type="button" disabled={loading} onClick={() => void clearCart().catch(() => {})} aria-label={`Xóa toàn bộ giỏ hàng (${items.length} sản phẩm)`}>Xóa toàn bộ giỏ ({items.length})</button>
              </div>
            </section>

            <aside className="cart-summary">
              <h2>Đơn hàng</h2>
              <div><span>Tạm tính ({selectedItems.length} sản phẩm)</span><strong>{formatPrice(subtotal)}</strong></div>
                {selectedItems.some(item => item.customization) && <div><span>Phí khắc (đã gồm trong tạm tính)</span><strong>{formatPrice(selectedItems.reduce((total, item) => total + (item.customization?.fee ?? 0) * item.quantity, 0))}</strong></div>}
              <div className="cart-summary__total"><span>Tổng tiền</span><strong>{formatPrice(subtotal)}</strong></div>
               <Link to="/checkout" state={{ cartItemIds: selectedItems.map(item => item.key) }} className={loading || !selectedItems.length || selectedItems.some(item => !item.available) ? 'is-disabled' : ''}
                 aria-disabled={loading || !selectedItems.length || selectedItems.some(item => !item.available)}
                 onClick={event => { if (loading || !selectedItems.length || selectedItems.some(item => !item.available)) event.preventDefault() }}>
                 Tiến hành thanh toán
               </Link>
              <p><ShieldCheck size={15} /> Thanh toán an toàn và bảo mật</p>
                <small>Phí giao hàng được tính ở bước thanh toán.</small>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
