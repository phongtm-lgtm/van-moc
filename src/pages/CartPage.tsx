import { useState } from 'react'
import { Minus, Plus, ShieldCheck, ShoppingCart, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'

function formatPrice(price: number) {
  return `${new Intl.NumberFormat('vi-VN').format(price)} đ`
}

export function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCart()
  const [selectedKeys, setSelectedKeys] = useState<string[]>(() => items.map((item) => item.key))
  const selectedItems = items.filter((item) => selectedKeys.includes(item.key))
  const subtotal = selectedItems.reduce((total, item) => {
    return total + item.product.price * item.quantity + (item.customization?.fee ?? 0)
  }, 0)
  const allSelected = items.length > 0 && items.every((item) => selectedKeys.includes(item.key))

  const toggleItem = (key: string) => {
    setSelectedKeys((current) => current.includes(key)
      ? current.filter((selectedKey) => selectedKey !== key)
      : [...current, key])
  }

  const toggleAll = () => {
    setSelectedKeys(allSelected ? [] : items.map((item) => item.key))
  }

  const removeSelected = () => {
    selectedItems.forEach((item) => removeItem(item.key))
    setSelectedKeys([])
  }

  return (
    <div className="cart-page">
      <div className="cart-page__grain" aria-hidden />
      <main className="cart-page__inner">
        <header className="cart-heading">
          <div>
            <h1>Giỏ hàng <span>({items.length})</span></h1>
            <p>Những sản phẩm thủ công tinh tuyển từ làng nghề Thụy Ứng</p>
          </div>
        </header>

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
                    <Link to={`/shop/${item.product.id}`} className="cart-item__image">
                      <img src={item.product.image} alt={item.product.name} />
                    </Link>
                    <div className="cart-item__info">
                      <Link to={`/shop/${item.product.id}`}>{item.product.name}</Link>
                      {item.product.category && <p>{item.product.category}</p>}
                      {item.customization && (
                        <span>Khắc: “{item.customization.text || 'Vân Mộc'}” · {item.customization.position}</span>
                      )}
                    </div>
                  </div>
                  <strong className="cart-item__price">{formatPrice(item.product.price)}</strong>
                  <div className="cart-item__quantity" aria-label={`Số lượng ${item.product.name}`}>
                    <button type="button" onClick={() => updateQuantity(item.key, item.quantity - 1)} disabled={item.quantity <= 1} aria-label="Giảm số lượng">
                      <Minus size={14} />
                    </button>
                    <output>{item.quantity}</output>
                    <button type="button" onClick={() => updateQuantity(item.key, item.quantity + 1)} aria-label="Tăng số lượng">
                      <Plus size={14} />
                    </button>
                  </div>
                  <strong className="cart-item__total">
                    {formatPrice(item.product.price * item.quantity + (item.customization?.fee ?? 0))}
                  </strong>
                  <button type="button" className="cart-item__remove" onClick={() => removeItem(item.key)} aria-label={`Xóa ${item.product.name}`}>
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
                  <Trash2 size={14} /> Xóa sản phẩm đã chọn
                </button>
                <button type="button" onClick={clearCart}>Xóa toàn bộ</button>
              </div>
            </section>

            <aside className="cart-summary">
              <h2>Tổng cộng</h2>
              <div><span>Tạm tính ({selectedItems.length} sản phẩm)</span><strong>{formatPrice(subtotal)}</strong></div>
              <div><span>Phí khắc</span><strong>{formatPrice(selectedItems.reduce((total, item) => total + (item.customization?.fee ?? 0), 0))}</strong></div>
              <div className="cart-summary__total"><span>Tổng tiền</span><strong>{formatPrice(subtotal)}</strong></div>
              <Link
                to={selectedItems.length > 0 ? '/checkout' : '#'}
                className={selectedItems.length === 0 ? 'is-disabled' : ''}
                aria-disabled={selectedItems.length === 0}
              >
                Tiến hành thanh toán
              </Link>
              <p><ShieldCheck size={15} /> Thanh toán an toàn và bảo mật</p>
              <small>Miễn phí vận chuyển cho đơn hàng đủ điều kiện.</small>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
