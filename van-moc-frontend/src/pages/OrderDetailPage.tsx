import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { accountApi } from '../api/account'
import { getOrder, getPayment, money, ORDER_LABELS, type OrderDetail, type Payment } from '../api/orders'
import { isUuid } from '../api/catalog'
import { ArrowLeft, Check, Copy } from 'lucide-react'
import './OrderDetailPage.css'

export function OrderDetailPage() {
  const { id = '' } = useParams()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [reload, setReload] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const [copied, setCopied] = useState('')
  const copy = async (value: string, label: string) => {
    try { await navigator.clipboard.writeText(value); setCopied(label) }
    catch { setError('Không thể sao chép. Bạn có thể chọn và sao chép thông tin trực tiếp.') }
  }
  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(''), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])
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
  useEffect(() => {
    if (!payment?.expiresAt || payment.status !== 'PENDING') return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [payment?.expiresAt, payment?.status])
  const cancel = async () => {
    if (busy || !window.confirm('Hủy đơn hàng này?')) return
    setBusy(true)
    try { await accountApi(`/api/orders/${id}/cancel`, 'POST'); setReload(value => value + 1) }
    catch (cause) { setError((cause as Error).message) }
    finally { setBusy(false) }
  }
  const remaining = payment?.expiresAt ? Math.max(0, Math.ceil((Date.parse(payment.expiresAt) - now) / 1000)) : 0
  const canCancel = payment?.status === 'PENDING' && (order?.status === 'PENDING_PAYMENT' || order?.paymentMethod === 'COD' && order.status === 'PENDING_CONFIRMATION')
  const pendingTransfer = order?.paymentMethod === 'BANK_TRANSFER' && order.status === 'PENDING_PAYMENT' && payment?.status === 'PENDING'
  const transferContent = payment?.transferCode ? `SEVQR ${payment.transferCode}` : ''
  const copyButton = (value: string, label: string) => <button type="button" className="order-view__copy" disabled={!value} onClick={() => void copy(value, label)} aria-label={`Sao chép ${label}`}>{copied === label ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}</button>
  return <div className="order-view"><div className="order-view__shell">
    <Link className="order-view__back" to="/account/orders"><ArrowLeft size={16} aria-hidden />Lịch sử đơn hàng</Link>
    {error && <p className="order-view__error" role="alert">{error} <button type="button" onClick={() => setReload(value => value + 1)}>Thử lại</button></p>}
    <span className="order-view__sr" role="status">{copied && `Đã sao chép ${copied}`}</span>
    {loading ? <p role="status">Đang tải đơn hàng…</p> : order && <>
      <header className="order-view__header"><div><h1>Chi tiết đơn hàng</h1><p><strong>#{order.orderCode}</strong><span>Đặt ngày {new Date(order.createdAt).toLocaleString('vi-VN')}</span></p></div><span className={`order-view__badge order-view__badge--${order.status.toLowerCase()}`}>{ORDER_LABELS[order.status]}</span></header>
      <div className="order-view__layout">
        <div className="order-view__main">
          <section className="order-view__section"><h2>Sản phẩm đã đặt</h2><div className="order-view__products">{order.items.map(item => <article className="order-view__product" key={item.id}>
            {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} loading="lazy" /> : <div className="order-view__no-image">Chưa có ảnh</div>}
            <div className="order-view__product-info"><h3>{item.productName}</h3><small>{item.productCode}</small>{item.engravingText && <p className="order-view__engraving">Khắc: {item.engravingText} · {item.engravingFont} · {item.engravingPosition}</p>}<p>Số lượng: {item.quantity} <span>· {money(item.unitPrice)} / sản phẩm</span></p></div><strong className="order-view__line-total">{money(item.lineTotal)}</strong>
          </article>)}</div></section>
          <section className="order-view__section"><h2>Thông tin nhận hàng</h2><dl className="order-view__delivery"><div><dt>Người nhận</dt><dd>{order.recipientName}</dd></div><div><dt>Điện thoại</dt><dd>{order.recipientPhone}</dd></div><div><dt>Địa chỉ</dt><dd>{order.addressLine}, {order.wardName}, {order.provinceName}</dd></div>{order.note && <div><dt>Ghi chú</dt><dd>{order.note}</dd></div>}</dl></section>
          <section className="order-view__section"><h2>Tiến trình đơn hàng</h2>{order.timeline.length ? <ol className="order-view__timeline">{order.timeline.map((event, index) => <li key={`${event.createdAt}-${index}`}><strong>{ORDER_LABELS[event.newStatus]}</strong><time dateTime={event.createdAt}>{new Date(event.createdAt).toLocaleString('vi-VN')}</time>{event.note && <p>{event.note === 'SePay verified bank transfer' ? 'SePay đã xác nhận thanh toán chuyển khoản' : event.note}</p>}</li>)}</ol> : <p>Chưa có sự kiện cập nhật.</p>}</section>
        </div>
        <aside className="order-view__sidebar" aria-label="Thông tin thanh toán"><section className="order-view__section order-view__payment"><div className="order-view__payment-head"><h2>{order.paymentMethod === 'BANK_TRANSFER' ? 'Thanh toán chuyển khoản' : 'Thanh toán khi nhận hàng'}</h2><p role="status">{payment?.status === 'PAID' ? 'Đã thanh toán' : payment?.status === 'PENDING' ? 'Chưa thanh toán' : payment?.status === 'EXPIRED' ? 'Đã hết hạn' : payment?.status === 'REFUNDED' ? 'Đã hoàn tiền' : 'Đã đóng thanh toán'}</p></div>
          {pendingTransfer && <><div className="order-view__qr">{payment.qrUrl && remaining > 0 ? <><img src={payment.qrUrl} alt={`Mã QR SePay thanh toán đơn ${order.orderCode}`} /><p>Quét mã bằng ứng dụng ngân hàng</p></> : <p>{remaining > 0 ? 'Chưa tải được mã QR. Vui lòng thử lại.' : 'Đã hết hạn QR. Nếu đã chuyển tiền, vui lòng liên hệ để đối soát.'}</p>}</div><dl className="order-view__transfer"><div><dt>Ngân hàng</dt><dd><span>{payment.bank || 'Chưa có thông tin'}</span></dd></div><div><dt>Số tài khoản</dt><dd><span>{payment.accountNumber || 'Chưa có thông tin'}</span>{copyButton(payment.accountNumber ?? '', 'số tài khoản')}</dd></div><div><dt>Nội dung</dt><dd><strong>{transferContent || 'Chưa có thông tin'}</strong>{copyButton(transferContent, 'nội dung chuyển khoản')}</dd></div><div><dt>Số tiền chuyển</dt><dd><strong>{money(payment.amount)}</strong>{copyButton(String(payment.amount), 'số tiền')}</dd></div></dl><p className="order-view__countdown">Thời gian thanh toán còn lại <strong>{String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}</strong></p><p className="order-view__notice">Chuyển đúng số tiền và nội dung. Trạng thái được cập nhật mỗi 5 giây. Nếu đã chuyển tiền, không chuyển lại.</p></>}
          <dl className="order-view__totals"><div><dt>Sản phẩm</dt><dd>{money(order.productSubtotal)}</dd></div><div><dt>Phí khắc</dt><dd>{money(order.engravingTotal)}</dd></div><div><dt>Vận chuyển</dt><dd>{money(order.shippingFee)}</dd></div><div className="order-view__grand-total"><dt>Tổng thanh toán</dt><dd>{money(order.grandTotal)}</dd></div></dl>
          {canCancel && <div className="order-view__actions"><button className="order-view__cancel" type="button" disabled={busy} onClick={() => void cancel()}>{busy ? 'Đang hủy…' : 'Hủy đơn hàng'}</button></div>}
        </section></aside>
      </div>
    </>}
  </div></div>
}
