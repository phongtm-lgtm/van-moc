import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, Check, Copy, CreditCard, Info, Pencil, QrCode, Truck, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { accountApi, type Address } from '../api/account'
import { getPayment, type Payment, type CheckoutResult, type CheckoutRequest } from '../api/orders'

const SHIPPING_OPTIONS = [
  { value: 'standard', title: 'Giao hàng tiêu chuẩn', time: '3 – 5 ngày', fee: 30000 },
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
  const { items: cartItems, refresh, loading, error: cartError } = useCart()
  const location = useLocation()
  const selectedIds = (location.state as { cartItemIds?: string[] } | null)?.cartItemIds
  const items = selectedIds ? cartItems.filter(item => selectedIds.includes(item.key)) : cartItems
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressId, setAddressId] = useState('')
  const [preview, setPreview] = useState<CheckoutResult | null>(null)
  const [previewFor, setPreviewFor] = useState('')
  const [created, setCreated] = useState<CheckoutResult | null>(null)
  const [bankPayment, setBankPayment] = useState<Payment | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [checking, setChecking] = useState(false)
  const [paymentCheckNotice, setPaymentCheckNotice] = useState('')
  const [note, setNote] = useState('')
  const attempt = useRef<{ hash: string; key: string } | null>(null)
  const [shipping, setShipping] = useState<(typeof SHIPPING_OPTIONS)[number]['value']>('standard')
  const [payment, setPayment] = useState<'cod' | 'bank'>('cod')
  const [orderCode, setOrderCode] = useState('')
  const [showBankTransfer, setShowBankTransfer] = useState(false)
  const [copied, setCopied] = useState('')
  const [waitSeconds, setWaitSeconds] = useState(PAYMENT_WAIT_SECONDS)

  const productTotal = preview?.productSubtotal ?? 0
  const customizationTotal = preview?.engravingTotal ?? 0
  const shippingFee = preview?.shippingFee ?? 0
  const total = bankPayment?.amount ?? created?.grandTotal ?? preview?.grandTotal ?? 0
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
  const selection = JSON.stringify(items.map(item => item.key).sort())
  const previewInput = JSON.stringify([selection, addressId, payment, note, items.map(item => [item.quantity, item.lineTotal, item.customization])])
  const missingSelection = !!selectedIds && selectedIds.some(id => !cartItems.some(item => item.key === id))
  const previewReady = !!preview && previewFor === previewInput && !loading && !missingSelection
  const address = addresses.find(item => item.id === addressId)
  useEffect(() => {
    let active = true
    accountApi<Address[]>('/api/addresses').then(rows => {
      if (active) { setAddresses(rows); setAddressId((rows.find(row => row.isDefault) ?? rows[0])?.id ?? '') }
    }).catch((cause: Error) => { if (active) setError(cause.message) })
    return () => { active = false }
  }, [])
  useEffect(() => {
    let active = true
    // Invalidate remote pricing while fetching a new quote for the current selection.
    // oxlint-disable-next-line react/set-state-in-effect
    setPreview(null)
    if (!addressId || selection === '[]' || loading || created) return
    const request: CheckoutRequest = { cartItemIds: JSON.parse(selection), addressId, paymentMethod: payment === 'cod' ? 'COD' : 'BANK_TRANSFER', note, idempotencyKey: 'preview' }
    accountApi<CheckoutResult>('/api/checkout/preview', 'POST', request)
      .then(result => { if (active) { setPreview(result); setPreviewFor(previewInput); setError('') } })
      .catch((cause: Error) => { if (active) setError(cause.message) })
    return () => { active = false }
  }, [addressId, selection, payment, note, loading, created, previewInput])

  const checkPayment = async (id = created?.orderId) => {
    if (checking) return
    if (!id) { setError('Không tìm thấy đơn để kiểm tra. Vui lòng mở lịch sử đơn hàng.'); return }
    setChecking(true)
    setPaymentCheckNotice(''); setError('')
    try {
      const result = await getPayment(id)
      setBankPayment(result); setError('')
      setPaymentCheckNotice(result.status === 'PENDING'
        ? 'Đã kiểm tra: backend chưa xác nhận thanh toán. Nếu đã chuyển tiền, không chuyển lại; giao dịch có thể cần đối soát.'
        : result.status === 'EXPIRED' ? 'Đơn đã hết hạn thanh toán. Nếu đã chuyển tiền, vui lòng liên hệ để đối soát.'
        : result.status === 'PAID' ? 'Đã xác nhận thanh toán.' : `Trạng thái thanh toán: ${result.status}. Vui lòng liên hệ để kiểm tra.`)
      if (result.status === 'PAID') { setShowBankTransfer(false); setOrderCode(created?.orderCode ?? '') }
    } catch (cause) { setError((cause as Error).name === 'TimeoutError' ? 'Kiểm tra quá thời gian chờ. Bạn có thể thử kiểm tra lại, không chuyển thêm tiền.' : (cause as Error).message) }
    finally { setChecking(false) }
  }
  useEffect(() => {
    if (!showBankTransfer || !created?.orderId) return
    let active = true
    const poll = async () => {
      try {
        const result = await getPayment(created.orderId!)
        if (!active) return
        setBankPayment(result)
        setWaitSeconds(result.expiresAt ? Math.max(0, Math.ceil((Date.parse(result.expiresAt) - Date.now()) / 1000)) : 0)
        if (result.status === 'PAID') { setOrderCode(created.orderCode); setShowBankTransfer(false) }
      } catch (cause) { if (active) setError((cause as Error).message) }
    }
    void poll()
    const timer = window.setInterval(() => void poll(), 5000)
    return () => { active = false; window.clearInterval(timer) }
  }, [showBankTransfer, created])

  useEffect(() => {
    if (!showBankTransfer) return
    const timer = window.setInterval(() => {
      setWaitSeconds(bankPayment?.expiresAt ? Math.max(0, Math.ceil((Date.parse(bankPayment.expiresAt) - Date.now()) / 1000)) : 0)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [showBankTransfer, bankPayment?.expiresAt])

  const placeOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy || !previewReady || created) return
    const payload = { cartItemIds: JSON.parse(selection) as string[], addressId, paymentMethod: payment === 'cod' ? 'COD' as const : 'BANK_TRANSFER' as const, note }
    const hash = JSON.stringify(payload)
    if (attempt.current && attempt.current.hash !== hash) {
      setError('Yêu cầu trước có thể đã tạo đơn. Kiểm tra lịch sử đơn trước khi thay đổi và đặt lại.'); return
    }
    if (!attempt.current) attempt.current = { hash, key: crypto.randomUUID() }
    setBusy(true); setError('')
    try {
      const result = await accountApi<CheckoutResult>('/api/checkout', 'POST', { ...payload, idempotencyKey: attempt.current.key })
      setCreated(result)
      if (payment === 'bank') setShowBankTransfer(true)
      else setOrderCode(result.orderCode)
      void refresh()
    } catch (cause) { setError((cause as Error).message) }
    finally { setBusy(false) }
  }

  const copyValue = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value)
    setCopied(label)
    window.setTimeout(() => setCopied(''), 1600)
  }

  const transferContent = bankPayment?.transferCode ?? created?.orderCode ?? ''
  const qrUrl = bankPayment?.qrUrl

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
          <Link to={`/account/orders/${created?.orderId}`}>Xem chi tiết đơn hàng</Link>
          <small>Bằng việc đặt hàng, bạn đồng ý với <Link to="/quy-dinh">Chính sách mua hàng</Link> của Vân Mộc.</small>
        </section>
      </div>
    )
  }

  if (!created && (loading || cartError)) return <div className="checkout-page"><section className="checkout-empty"><p>{loading ? 'Đang tải giỏ hàng…' : cartError}</p><Link to="/login">Đăng nhập</Link><Link to="/cart">Về giỏ hàng</Link></section></div>
  if (!created && items.length === 0) {
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
            {error && <p role="alert">{error}</p>}
            {missingSelection && !created && <p role="alert">Một dòng giỏ đã chọn không còn tồn tại. <Link to="/cart">Quay lại chọn sản phẩm</Link></p>}
            {created && <p>Đã tạo đơn {created.orderCode}. <Link to={`/account/orders/${created.orderId}`}>Xem đơn / tiếp tục thanh toán</Link></p>}
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
                  <label className="checkout-field checkout-field--wide"><span>Địa chỉ đã lưu *</span>
                    <select value={addressId} required disabled={busy || !!created} onChange={event => setAddressId(event.target.value)}>
                      <option value="">Chọn địa chỉ</option>{addresses.map(row => <option key={row.id} value={row.id}>{row.label} — {row.addressLine}, {row.wardName}</option>)}
                    </select>
                  </label>
                  <Link to="/account/addresses">Thêm / sửa địa chỉ nhận hàng</Link>
                  <label className="checkout-field checkout-field--wide">
                    <span>Họ và tên <b>*</b></span>
                    <input value={address?.recipientName ?? ''} readOnly />
                  </label>
                  <label className="checkout-field checkout-field--wide">
                    <span>Số điện thoại <b>*</b></span>
                    <input value={address?.phone ?? ''} readOnly />
                  </label>
                  <label className="checkout-field">
                    <span>Tỉnh / Thành phố <b>*</b></span>
                    <input value={address?.provinceName ?? ''} readOnly />
                  </label>
                  <label className="checkout-field">
                    <span>Phường / Xã <b>*</b></span>
                    <input value={address?.wardName ?? ''} readOnly />
                  </label>
                  <label className="checkout-field checkout-field--wide">
                    <span>Địa chỉ chi tiết <b>*</b></span>
                    <textarea value={address?.addressLine ?? ''} rows={3} readOnly />
                  </label>
                  <label className="checkout-field checkout-field--wide">
                    <span>Ghi chú đơn hàng</span><textarea value={note} maxLength={2000} disabled={busy || !!created} onChange={event => setNote(event.target.value)} />
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
                      <b>{preview ? formatPrice(shippingFee) : 'Đang tính'}</b>
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
                      <b>{formatPrice(item.lineTotal)}</b>
                    </article>
                  ))}
                </div>

                <div className="checkout-totals">
                  <div><span>Tạm tính</span><strong>{previewReady ? formatPrice(productTotal) : 'Đang tính'}</strong></div>
                  {customizationTotal > 0 && <div><span>Phí khác</span><strong>{formatPrice(customizationTotal)}</strong></div>}
                  <div><span>Phí vận chuyển</span><strong>{previewReady ? formatPrice(shippingFee) : 'Đang tính'}</strong></div>
                  <div className="checkout-totals__grand"><span>Tổng cộng</span><strong>{created || previewReady ? formatPrice(total) : 'Chờ kiểm tra đơn hàng'}</strong></div>
                </div>
              </section>

              <section className="checkout-section">
                <h2>Phương thức thanh toán</h2>
                <div className="checkout-options checkout-options--payment">
                  <label className={`checkout-option ${payment === 'cod' ? 'is-selected' : ''}`}>
                    <input type="radio" name="payment" value="cod" disabled={busy || !!created} checked={payment === 'cod'} onChange={() => setPayment('cod')} />
                    <span className="checkout-option__check" aria-hidden>
                      {payment === 'cod' ? <Check size={12} strokeWidth={2.5} /> : null}
                    </span>
                    <span className="checkout-option__copy"><strong>Thanh toán khi nhận hàng (COD)</strong></span>
                    <Truck className="checkout-option__icon" size={18} strokeWidth={1.5} />
                  </label>
                  <label className={`checkout-option ${payment === 'bank' ? 'is-selected' : ''}`}>
                    <input type="radio" name="payment" value="bank" disabled={busy || !!created} checked={payment === 'bank'} onChange={() => setPayment('bank')} />
                    <span className="checkout-option__check" aria-hidden>
                      {payment === 'bank' ? <Check size={12} strokeWidth={2.5} /> : null}
                    </span>
                    <span className="checkout-option__copy"><strong>Chuyển khoản qua mã QR</strong></span>
                    <QrCode className="checkout-option__icon" size={18} strokeWidth={1.5} />
                  </label>
                </div>
              </section>

              <button type="submit" className="checkout-submit" disabled={!previewReady || busy || !!created}>{busy ? 'Đang tạo đơn…' : 'Đặt hàng'} <ArrowRight size={16} /></button>
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
               <div className="bank-modal__qr">{qrUrl && waitSeconds > 0 ? <img src={qrUrl} alt="Mã QR chuyển khoản đơn hàng" /> : <p>{bankPayment ? 'QR không còn hiệu lực' : 'Đang tải thanh toán…'}</p>}</div>
              <div className="bank-modal__details">
                <dl>
                   <div><dt>Ngân hàng</dt><dd><span>{bankPayment?.bank}</span><button type="button" disabled={!bankPayment?.bank} onClick={() => copyValue(bankPayment?.bank ?? '', 'bank')} aria-label="Sao chép ngân hàng">{copied === 'bank' ? <Check size={14} /> : <Copy size={14} />}</button></dd></div>
                   <div><dt>Số tài khoản</dt><dd><span>{bankPayment?.accountNumber}</span><button type="button" disabled={!bankPayment?.accountNumber} onClick={() => copyValue(bankPayment?.accountNumber ?? '', 'account')} aria-label="Sao chép số tài khoản">{copied === 'account' ? <Check size={14} /> : <Copy size={14} />}</button></dd></div>
                   <div><dt>Nội dung</dt><dd><span>{transferContent}</span><button type="button" onClick={() => copyValue(transferContent, 'code')} aria-label="Sao chép nội dung">{copied === 'code' ? <Check size={14} /> : <Copy size={14} />}</button></dd></div>
                  <div className="bank-modal__amount">
                    <dt>Số tiền</dt>
                    <dd>
                      <span>{formatPrice(total)}</span>
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
               <span role="status" aria-live="polite">{error || paymentCheckNotice || (waitSeconds === 0 && bankPayment ? 'Đã hết thời gian thanh toán. Nếu đã chuyển tiền, vui lòng liên hệ để đối soát.' : 'Chuyển đúng số tiền và nội dung.')}</span>
            </div>
             <button className="bank-modal__confirm" type="button" disabled={checking} onClick={() => void checkPayment()}>
               {checking ? 'Đang kiểm tra…' : 'Kiểm tra thanh toán'} <ArrowRight size={15} />
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
