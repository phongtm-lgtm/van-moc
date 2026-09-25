import { useEffect, useState, type FormEvent } from 'react'
import { ArrowRight, Check, Copy, CreditCard, Info, Pencil, QrCode, Truck, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'

const SHIPPING_OPTIONS = [
  { value: 'standard', title: 'Giao hàng tiêu chuẩn', time: '3 – 5 ngày', fee: 0 },
  { value: 'express', title: 'Giao hàng nhanh', time: '1 – 2 ngày', fee: 30000 },
] as const

const PAYMENT_WAIT_SECONDS = 15 * 60

function formatPrice(price: number) {
  return `${new Intl.NumberFormat('vi-VN').format(price)} đ`
}

function formatCountdown(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function CheckoutPage() {
  const { items, clearCart } = useCart()
  const [shipping, setShipping] = useState<(typeof SHIPPING_OPTIONS)[number]['value']>('standard')
  const [payment, setPayment] = useState<'cod' | 'bank'>('cod')
  const [orderCode, setOrderCode] = useState('')
  const [pendingOrderCode, setPendingOrderCode] = useState('')
  const [showBankTransfer, setShowBankTransfer] = useState(false)
  const [copied, setCopied] = useState('')
  const [waitSeconds, setWaitSeconds] = useState(PAYMENT_WAIT_SECONDS)

  const productTotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0)
  const customizationTotal = items.reduce((total, item) => total + (item.customization?.fee ?? 0), 0)
  const shippingFee = SHIPPING_OPTIONS.find((option) => option.value === shipping)?.fee ?? 0
  const total = productTotal + customizationTotal + shippingFee
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)

  useEffect(() => {
    if (!showBankTransfer) return
    const timer = window.setInterval(() => {
      setWaitSeconds((current) => (current > 0 ? current - 1 : 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [showBankTransfer])

  const placeOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const code = `VM${new Date().toISOString().slice(2, 10).replaceAll('-', '')}${String(Math.trunc(event.timeStamp) % 10000).padStart(4, '0')}`
    if (payment === 'bank') {
      setPendingOrderCode(code)
      setWaitSeconds(PAYMENT_WAIT_SECONDS)
      setShowBankTransfer(true)
      return
    }
    completeOrder(code)
  }

  const completeOrder = (code = pendingOrderCode) => {
    const createdOrder = {
      id: code,
      date: new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date()).replace(',', ' ·'),
      status: 'processing',
      delivery: 'Đang chuẩn bị sản phẩm',
      payment: payment === 'bank' ? 'Thanh toán qua chuyển khoản' : 'Thanh toán khi nhận hàng',
      total,
      products: items.map((item) => ({
        name: item.product.name,
        sku: `VM-${String(item.product.id).padStart(3, '0')}`,
        image: item.product.image,
        quantity: item.quantity,
        price: item.product.price * item.quantity + (item.customization?.fee ?? 0),
        engraving: item.customization ? (item.customization.text || 'Vân Mộc') : undefined,
        font: item.customization ? `${item.customization.font} | Vị trí: ${item.customization.position}` : undefined,
      })),
    }
    try {
      const savedOrders = JSON.parse(localStorage.getItem('van-moc-orders') ?? '[]') as unknown[]
      localStorage.setItem('van-moc-orders', JSON.stringify([createdOrder, ...savedOrders]))
    } catch {
      localStorage.setItem('van-moc-orders', JSON.stringify([createdOrder]))
    }
    setShowBankTransfer(false)
    setOrderCode(code)
    clearCart()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const copyValue = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value)
    setCopied(label)
    window.setTimeout(() => setCopied(''), 1600)
  }

  const transferContent = pendingOrderCode || 'VANMOC'
  const qrUrl = `https://img.vietqr.io/image/VCB-123456789012-compact2.png?amount=${total}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent('NGUYEN THI AN')}`

  if (orderCode) {
    return (
      <div className="checkout-page checkout-page--result">
        <div className="checkout-result-backdrop" aria-hidden />
        <section className="checkout-success checkout-modal" role="dialog" aria-modal="true" aria-live="polite" aria-labelledby="success-title">
          <span className="checkout-success__icon" aria-hidden><Check size={28} strokeWidth={2.4} /></span>
          <h1 id="success-title">Đặt hàng thành công</h1>
          <p>Cảm ơn bạn đã tin tưởng Vân Mộc!<br />Chúng tôi sẽ sớm liên hệ và giao hàng đến bạn.</p>
          <div className="checkout-success__code">
            <span>Mã đơn hàng</span>
            <div>
              <strong>{orderCode}</strong>
              <button type="button" onClick={() => copyValue(orderCode, 'order')} aria-label="Sao chép mã đơn hàng">
                {copied === 'order' ? <Check size={15} /> : <Copy size={15} />}
              </button>
            </div>
          </div>
          <Link to="/account/orders">Xem chi tiết đơn hàng</Link>
          <small>Bằng việc đặt hàng, bạn đồng ý với <Link to="/quy-dinh">Chính sách mua hàng</Link> của Vân Mộc.</small>
        </section>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <section className="checkout-empty">
          <span><CreditCard size={32} strokeWidth={1.35} /></span>
          <h1>Chưa có sản phẩm để thanh toán</h1>
          <p>Hãy chọn một món thủ công bạn yêu thích trước khi tiếp tục.</p>
          <Link to="/shop">Khám phá sản phẩm</Link>
        </section>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="checkout-page__wash" aria-hidden />
      <main className="checkout-shell">
        <div className="checkout-panel">
          <header className="checkout-heading">
            <h1>Thanh toán</h1>
            <p>Hoàn tất đơn hàng để mang giá trị thủ công về với bạn.</p>
          </header>

          <ol className="checkout-steps" aria-label="Các bước thanh toán">
            <li className="is-active"><span>1</span><strong>Thông tin giao hàng</strong></li>
            <li><span>2</span><strong>Phương thức thanh toán</strong></li>
            <li><span>3</span><strong>Xác nhận đơn hàng</strong></li>
          </ol>

          <form id="checkout-form" className="checkout-layout" onSubmit={placeOrder}>
            <div className="checkout-main">
              <section className="checkout-section">
                <h2>Thông tin giao hàng</h2>
                <div className="checkout-fields">
                  <label className="checkout-field checkout-field--wide">
                    <span>Họ và tên <b>*</b></span>
                    <input name="name" autoComplete="name" placeholder="Nguyễn Thị An" required />
                  </label>
                  <label className="checkout-field checkout-field--wide">
                    <span>Số điện thoại <b>*</b></span>
                    <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0901 234 567" pattern="[0-9 +]{9,15}" required />
                  </label>
                  <label className="checkout-field">
                    <span>Tỉnh / Thành phố <b>*</b></span>
                    <select name="province" autoComplete="address-level1" required defaultValue="">
                      <option value="" disabled>Chọn tỉnh / thành</option>
                      <option>Hà Nội</option>
                      <option>TP. Hồ Chí Minh</option>
                      <option>Đà Nẵng</option>
                      <option>Hải Phòng</option>
                      <option>Cần Thơ</option>
                      <option>Tỉnh / thành khác</option>
                    </select>
                  </label>
                  <label className="checkout-field">
                    <span>Quận / Huyện <b>*</b></span>
                    <input name="district" autoComplete="address-level2" placeholder="Đông Anh" required />
                  </label>
                  <label className="checkout-field checkout-field--wide">
                    <span>Địa chỉ chi tiết <b>*</b></span>
                    <textarea name="address" autoComplete="street-address" placeholder="Số nhà, tên đường, phường / xã" rows={3} required />
                  </label>
                  <label className="checkout-save">
                    <input type="checkbox" name="saveAddress" />
                    <span>Lưu thông tin này cho lần sau</span>
                  </label>
                </div>
              </section>

              <section className="checkout-section">
                <h2>Phương thức giao hàng</h2>
                <div className="checkout-options">
                  {SHIPPING_OPTIONS.map((option) => (
                    <label className={`checkout-option ${shipping === option.value ? 'is-selected' : ''}`} key={option.value}>
                      <input type="radio" name="shipping" value={option.value} checked={shipping === option.value} onChange={() => setShipping(option.value)} />
                      <span className="checkout-option__check" aria-hidden>
                        {shipping === option.value ? <Check size={12} strokeWidth={2.5} /> : null}
                      </span>
                      <span className="checkout-option__copy">
                        <strong>{option.title} ({option.time})</strong>
                      </span>
                      <b>{option.fee === 0 ? 'Miễn phí' : `+ ${formatPrice(option.fee)}`}</b>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            <aside className="checkout-aside">
              <section className="checkout-section">
                <div className="checkout-order__head">
                  <h2>Đơn hàng của bạn <span>({itemCount} sản phẩm)</span></h2>
                  <Link to="/cart"><Pencil size={13} strokeWidth={1.8} /> Chỉnh sửa</Link>
                </div>

                <div className="checkout-products">
                  {items.map((item) => (
                    <article className="checkout-product" key={item.key}>
                      <div className="checkout-product__image">
                        <img src={item.product.image} alt="" />
                      </div>
                      <div className="checkout-product__copy">
                        <strong>{item.product.name}</strong>
                        {item.customization && (
                          <small>
                            {item.customization.text || 'Vân Mộc'} – {item.customization.font} – {item.customization.position}
                          </small>
                        )}
                        <small>SL: {item.quantity}</small>
                      </div>
                      <b>{formatPrice(item.product.price * item.quantity + (item.customization?.fee ?? 0))}</b>
                    </article>
                  ))}
                </div>

                <div className="checkout-totals">
                  <div><span>Tạm tính</span><strong>{formatPrice(productTotal)}</strong></div>
                  {customizationTotal > 0 && <div><span>Phí khác</span><strong>{formatPrice(customizationTotal)}</strong></div>}
                  <div><span>Phí vận chuyển</span><strong>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</strong></div>
                  <div className="checkout-totals__grand"><span>Tổng cộng</span><strong>{formatPrice(total)}</strong></div>
                </div>
              </section>

              <section className="checkout-section">
                <h2>Phương thức thanh toán</h2>
                <div className="checkout-options checkout-options--payment">
                  <label className={`checkout-option ${payment === 'cod' ? 'is-selected' : ''}`}>
                    <input type="radio" name="payment" value="cod" checked={payment === 'cod'} onChange={() => setPayment('cod')} />
                    <span className="checkout-option__check" aria-hidden>
                      {payment === 'cod' ? <Check size={12} strokeWidth={2.5} /> : null}
                    </span>
                    <span className="checkout-option__copy"><strong>Thanh toán khi nhận hàng (COD)</strong></span>
                    <Truck className="checkout-option__icon" size={18} strokeWidth={1.5} />
                  </label>
                  <label className={`checkout-option ${payment === 'bank' ? 'is-selected' : ''}`}>
                    <input type="radio" name="payment" value="bank" checked={payment === 'bank'} onChange={() => setPayment('bank')} />
                    <span className="checkout-option__check" aria-hidden>
                      {payment === 'bank' ? <Check size={12} strokeWidth={2.5} /> : null}
                    </span>
                    <span className="checkout-option__copy"><strong>Chuyển khoản qua mã QR</strong></span>
                    <QrCode className="checkout-option__icon" size={18} strokeWidth={1.5} />
                  </label>
                </div>
              </section>

              <button type="submit" className="checkout-submit">Đặt hàng <ArrowRight size={16} /></button>
              <small className="checkout-order__terms">
                Bằng việc đặt hàng, bạn đồng ý với <Link to="/quy-dinh">Chính sách mua hàng</Link> của Vân Mộc.
              </small>
            </aside>
          </form>
        </div>
      </main>

      {showBankTransfer && (
        <div className="checkout-modal-layer" role="presentation">
          <button className="checkout-modal-layer__backdrop" type="button" onClick={() => setShowBankTransfer(false)} aria-label="Đóng thông tin chuyển khoản" />
          <section className="bank-modal checkout-modal" role="dialog" aria-modal="true" aria-labelledby="bank-modal-title">
            <button className="checkout-modal__close" type="button" onClick={() => setShowBankTransfer(false)} aria-label="Đóng"><X size={18} /></button>
            <h2 id="bank-modal-title">Thanh toán qua mã QR</h2>
            <div className="bank-modal__content">
              <div className="bank-modal__qr"><img src={qrUrl} alt="Mã QR chuyển khoản đơn hàng" /></div>
              <div className="bank-modal__details">
                <dl>
                  <div><dt>Ngân hàng</dt><dd>Vietcombank</dd></div>
                  <div><dt>Số tài khoản</dt><dd>1234 5678 9012</dd></div>
                  <div><dt>Chủ tài khoản</dt><dd>NGUYEN THI AN</dd></div>
                  <div className="bank-modal__amount">
                    <dt>Số tiền</dt>
                    <dd>
                      {formatPrice(total)}
                      <button type="button" onClick={() => copyValue(String(total), 'amount')} aria-label="Sao chép số tiền">
                        {copied === 'amount' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </dd>
                  </div>
                </dl>
                <p className="bank-modal__timer">Thời gian chờ thanh toán: <strong>{formatCountdown(waitSeconds)}</strong></p>
              </div>
            </div>
            <div className="bank-modal__notice">
              <Info size={18} strokeWidth={1.8} />
              <span>Sau khi thanh toán, đơn hàng sẽ được xử lý trong vòng 5–10 phút. Chúng tôi sẽ gửi thông báo qua SMS/Email.</span>
            </div>
            <button className="bank-modal__confirm" type="button" onClick={() => completeOrder()}>
              Tôi đã chuyển khoản <ArrowRight size={15} />
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
