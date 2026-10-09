import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { accountApi } from '../api/account'
import { getOrder, getPayment, money, ORDER_LABELS, type OrderDetail, type Payment } from '../api/orders'
import { isUuid } from '../api/catalog'

export function OrderDetailPage() {
  const { id = '' } = useParams()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [reload, setReload] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    let active = true
    // This effect synchronizes the route's remote order and its loading/error state.
    // oxlint-disable-next-line react/set-state-in-effect
    if (!isUuid(id)) { setError('Mã đơn không hợp lệ.'); setLoading(false); return }
    // oxlint-disable-next-line react/set-state-in-effect
    setLoading(true)
    Promise.all([getOrder(id), getPayment(id)]).then(([detail, status]) => {
      if (active) { setOrder(detail); setPayment(status); setError('') }
    }).catch((cause: Error) => { if (active) setError(cause.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, reload])
  useEffect(() => {
    if (order?.status !== 'PENDING_PAYMENT' || !isUuid(id)) return
    let active = true
    const timer = window.setInterval(() => {
      setNow(Date.now())
      Promise.all([getOrder(id), getPayment(id)]).then(([detail, status]) => {
        if (active) { setOrder(detail); setPayment(status); setError('') }
      }).catch((cause: Error) => { if (active) setError(cause.message) })
    }, 5000)
    return () => { active = false; window.clearInterval(timer) }
  }, [id, order?.status])
  const cancel = async () => {
    if (!window.confirm('Hủy đơn hàng này?')) return
    setBusy(true)
    try { await accountApi(`/api/orders/${id}/cancel`, 'POST'); setReload(value => value + 1) }
    catch (cause) { setError((cause as Error).message) }
    finally { setBusy(false) }
  }
  const remaining = payment?.expiresAt ? Math.max(0, Math.ceil((Date.parse(payment.expiresAt) - now) / 1000)) : 0
  const canCancel = payment?.status === 'PENDING' && (order?.status === 'PENDING_PAYMENT' || order?.paymentMethod === 'COD' && order.status === 'PENDING_CONFIRMATION')
  return <div className="orders-page order-detail-page"><div className="orders-page__wash" aria-hidden /><main className="orders-shell"><section className="orders-content">
    <Link to="/account/orders">← Lịch sử đơn hàng</Link>
    {error && <p role="alert">{error} <button type="button" onClick={() => setReload(value => value + 1)}>Thử lại</button></p>}
    {loading ? <p role="status">Đang tải đơn hàng…</p> : order && <article className="order-card">
      <header className="order-card__head"><div className="order-card__meta"><h2>#{order.orderCode}</h2><p>{new Date(order.createdAt).toLocaleString('vi-VN')}</p></div>
        <span>{ORDER_LABELS[order.status]}</span><div className="order-card__sum"><strong>{money(order.grandTotal)}</strong><span>{order.paymentMethod === 'COD' ? 'COD' : 'Chuyển khoản'}</span></div>
      </header>
      <div className="order-card__body">
        <h3>Thông tin nhận hàng</h3><p>{order.recipientName} · {order.recipientPhone}</p><p>{order.addressLine}, {order.wardName}, {order.provinceName}</p>
        {order.note && <p>Ghi chú: {order.note}</p>}
        <div className="order-products">{order.items.map(item => <div className="order-product" key={item.id}>
          <img src={item.imageUrl ?? ''} alt="" /><div className="order-product__info"><strong>{item.productName}</strong><small>{item.productCode}</small>
            {item.engravingText && <small>Khắc: {item.engravingText} · {item.engravingFont} · {item.engravingPosition}</small>}
          </div><span className="order-product__qty">x{item.quantity}</span><strong className="order-product__price">{money(item.lineTotal)}</strong>
        </div>)}</div>
        <div className="checkout-totals"><div><span>Sản phẩm</span><strong>{money(order.productSubtotal)}</strong></div><div><span>Phí khắc</span><strong>{money(order.engravingTotal)}</strong></div><div><span>Vận chuyển</span><strong>{money(order.shippingFee)}</strong></div><div className="checkout-totals__grand"><span>Tổng cộng</span><strong>{money(order.grandTotal)}</strong></div></div>
        <h3>Thanh toán</h3><p>{payment?.status === 'PAID' ? 'Đã thanh toán' : payment?.status === 'PENDING' ? 'Chưa thanh toán' : payment?.status === 'EXPIRED' ? 'Đã hết hạn' : payment?.status === 'REFUNDED' ? 'Đã hoàn tiền' : 'Đã đóng thanh toán'}</p>
        {order.status === 'PENDING_PAYMENT' && payment?.status === 'PENDING' && <div className="bank-modal__content">
          <div className="bank-modal__qr">{payment.qrUrl && remaining > 0 ? <img src={payment.qrUrl} alt="QR thanh toán đơn hàng" /> : <p>Đã hết hạn QR. Nếu đã chuyển tiền, vui lòng liên hệ để đối soát.</p>}</div>
          <div className="bank-modal__details"><p>Ngân hàng: {payment.bank}</p><p>Tài khoản: {payment.accountNumber}</p><p>Nội dung: {payment.transferCode}</p><p>Số tiền: {money(payment.amount)}</p><p>Còn {Math.floor(remaining / 60)} phút {remaining % 60} giây</p><p>Trạng thái cập nhật từ backend mỗi 5 giây.</p></div>
        </div>}
        <h3>Tiến trình đơn hàng</h3><ol>{order.timeline.map((event, index) => <li key={index}>{new Date(event.createdAt).toLocaleString('vi-VN')} — {ORDER_LABELS[event.newStatus]}{event.note ? ` · ${event.note === 'SePay verified bank transfer' ? 'SePay đã xác nhận thanh toán chuyển khoản' : event.note}` : ''}</li>)}</ol>
        {canCancel && <div className="order-card__actions"><button type="button" disabled={busy} onClick={() => void cancel()}>{busy ? 'Đang hủy…' : 'Hủy đơn hàng'}</button></div>}
      </div>
    </article>}
  </section></main></div>
}
