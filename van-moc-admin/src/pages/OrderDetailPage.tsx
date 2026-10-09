import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, CreditCard, History, LoaderCircle, MapPin, Package, PencilLine, Phone, ReceiptText } from 'lucide-react'
import { accountApi } from '@/api/account'
import { money, statuses, paymentStatuses, orderActions, type Detail } from '@/api/orders'
import './OrderDetailPage.css'

const date = (value: string) => new Date(value).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const fonts: Record<string, string> = { SERIF: 'Cổ điển', SCRIPT: 'Uốn lượn', HANDWRITING: 'Viết tay' }
const positions: Record<string, string> = { FRONT: 'Mặt trước', BACK: 'Mặt sau', HANDLE: 'Tay cầm' }
const actors: Record<string, string> = { CUSTOMER: 'Khách hàng', SYSTEM: 'Hệ thống', ADMIN: 'Quản trị viên' }

export default function OrderDetailPage() {
  const { id } = useParams()
  return <OrderWorkspace key={id} id={id!} />
}

function OrderWorkspace({ id }: { id: string }) {
  const [data, setData] = useState<Detail | null>(null)
  const [fontNames, setFontNames] = useState<Record<string, string>>(fonts)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [collect, setCollect] = useState(false)
  const [retry, setRetry] = useState(0)
  const [needsRefresh, setNeedsRefresh] = useState(false)
  const mutation = useRef(false)

  useEffect(() => {
    let active = true
    accountApi<{ code: string; name: string }[]>('/api/admin/engraving-fonts')
      .then(items => { if (active) setFontNames(Object.fromEntries(items.map(item => [item.code, item.name]))) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    accountApi<Detail>(`/api/admin/orders/${id}`).then(result => {
      if (active) { setData(result); setError(''); setNeedsRefresh(false); setCollect(false) }
    }).catch((cause: Error) => { if (active) setError(cause.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, retry])

  const order = data?.order
  const action = order ? orderActions[order.status] : undefined
  const next = action?.status
  const needCod = order?.paymentMethod === 'COD' && next === 'COMPLETED'
  const paymentBlocked = order?.paymentMethod === 'BANK_TRANSFER' && data?.paymentStatus !== 'PAID'
  const disabled = busy || loading || needsRefresh || paymentBlocked || (needCod && !collect)
  const timeline = [...(order?.timeline ?? [])].reverse().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))

  const advance = async () => {
    if (!next || disabled || mutation.current) return
    if (!window.confirm(`Chuyển đơn ${order?.orderCode} sang “${statuses[next]}”${needCod ? ` và ghi nhận đã thu đủ ${money(data!.expectedAmount)} COD` : ''}?`)) return
    mutation.current = true
    setBusy(true); setError(''); setNotice('')
    try {
      await accountApi(`/api/admin/orders/${id}/status`, 'PATCH', { status: next, collectCod: needCod && collect })
      setNeedsRefresh(true)
      setNotice(`Đã chuyển đơn sang “${statuses[next]}”.${needCod ? ' Đã ghi nhận thu đủ tiền COD.' : ''}`)
      setCollect(false)
      try {
        setData(await accountApi<Detail>(`/api/admin/orders/${id}`))
        setNeedsRefresh(false)
      } catch {
        setError('Đã cập nhật trạng thái, nhưng chưa tải được thông tin mới. Bấm tải lại để tiếp tục xử lý đơn.')
      }
    } catch (cause) {
      setError((cause as Error).message)
      setNeedsRefresh(true)
    } finally { mutation.current = false; setBusy(false) }
  }

  return <section className="order-workspace" aria-labelledby="order-detail-title">
    <Link className="od-back" to="/orders"><ArrowLeft size={16} aria-hidden="true" /> Danh sách đơn hàng</Link>
    <header className="od-header">
      <div className="od-heading">
        <p className="od-eyebrow">Chi tiết đơn hàng</p>
        <div className="od-title-row"><h1 id="order-detail-title">{order?.orderCode ?? 'Đơn hàng'}</h1>{order && <span className={`od-badge od-badge--${order.status.toLowerCase()}`}>{statuses[order.status]}</span>}</div>
        {order && <p className="od-created"><Clock3 size={15} aria-hidden="true" /> Tạo lúc <time dateTime={order.createdAt}>{date(order.createdAt)}</time></p>}
      </div>
      {order && <div className="od-header-actions">
        {action ? <>
          {needCod && <label className="od-cod"><input type="checkbox" checked={collect} disabled={busy || loading || needsRefresh} onChange={event => setCollect(event.target.checked)} /> <span>Đã thu đủ <strong>{money(data!.expectedAmount)}</strong> COD</span></label>}
          <button type="button" className="od-button od-button--primary" disabled={disabled} onClick={() => void advance()}>
            {busy ? <LoaderCircle size={18} className="od-spinner" aria-hidden="true" /> : next === 'COMPLETED' ? <CheckCircle2 size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
            {busy ? 'Đang cập nhật…' : action.label}
          </button>
          <p className="od-action-hint">{needsRefresh ? 'Tải lại thông tin trước khi xử lý tiếp.' : paymentBlocked ? 'Chờ xác nhận thanh toán để xử lý đơn.' : `Bước tiếp theo: ${statuses[action.status]}`}</p>
        </> : <p className="od-action-hint">{order.status === 'PENDING_PAYMENT' ? 'Chờ xác nhận thanh toán chuyển khoản.' : order.status === 'COMPLETED' ? 'Đơn hàng đã hoàn thành.' : 'Đơn hàng đã hủy.'}</p>}
      </div>}
    </header>

    {notice && <div className="od-feedback od-feedback--success" role="status"><CheckCircle2 size={18} aria-hidden="true" /><span>{notice}</span></div>}
    {error && <div className="od-feedback od-feedback--error" role="alert"><span>{error}</span><button type="button" className="od-button" disabled={busy || loading} onClick={() => { setLoading(true); setRetry(value => value + 1) }}>{loading ? 'Đang tải…' : 'Tải lại'}</button></div>}
    {loading && <p className="od-loading" role="status"><LoaderCircle size={18} className="od-spinner" aria-hidden="true" /> Đang tải thông tin đơn hàng…</p>}

    {data && order && <div className="od-grid" aria-busy={busy || loading}>
      <div className="od-main-column">
        <section className="od-panel" aria-labelledby="od-products-title">
          <header className="od-panel-heading"><h2 id="od-products-title"><Package size={20} aria-hidden="true" /> Sản phẩm đã đặt</h2><span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm</span></header>
          <ul className="od-products">
            {order.items.map(item => <li className="od-product" key={item.id}>
              <div className="od-thumbnail">{item.imageUrl ? <img src={item.imageUrl} alt={item.productName} loading="lazy" /> : <Package size={28} aria-label="Chưa có ảnh sản phẩm" />}</div>
              <div className="od-product-info"><h3>{item.productName}</h3><p className="od-product-sku">SKU: {item.productCode}</p><p className="od-product-unit">{money(item.unitPrice)} <span>× {item.quantity}</span></p>
                {item.engravingText && <div className="od-engraving"><p><PencilLine size={15} aria-hidden="true" /><strong>Khắc: <span>“{item.engravingText}”</span></strong></p><dl><div><dt>Kiểu chữ</dt><dd>{fontNames[item.engravingFont ?? ''] ?? item.engravingFont ?? '—'}</dd></div><div><dt>Vị trí</dt><dd>{positions[item.engravingPosition ?? ''] ?? item.engravingPosition ?? '—'}</dd></div><div><dt>Phí khắc / SP</dt><dd>{money(item.engravingUnitFee)}</dd></div></dl></div>}
              </div>
              <div className="od-product-total"><span>Thành tiền</span><strong>{money(item.lineTotal)}</strong><small>SL: {item.quantity}</small></div>
            </li>)}
          </ul>
        </section>

        <section className="od-panel" aria-labelledby="od-pricing-title">
          <header className="od-panel-heading"><h2 id="od-pricing-title"><ReceiptText size={20} aria-hidden="true" /> Chi tiết giá trị đơn</h2><span>VNĐ</span></header>
          <dl className="od-pricing od-panel-body"><div><dt>Tiền sản phẩm</dt><dd>{money(order.productSubtotal)}</dd></div><div><dt>Phí khắc tên</dt><dd>{money(order.engravingTotal)}</dd></div><div><dt>Phí giao hàng</dt><dd>{money(order.shippingFee)}</dd></div><div className="od-grand-total"><dt>Tổng cộng</dt><dd>{money(order.grandTotal)}</dd></div></dl>
        </section>

        <section className="od-panel" aria-labelledby="od-timeline-title">
          <header className="od-panel-heading"><h2 id="od-timeline-title"><History size={20} aria-hidden="true" /> Hoạt động đơn hàng</h2><span>Mới nhất trước</span></header>
          <div className="od-panel-body">{timeline.length ? <ol className="od-timeline">{timeline.map((event, index) => <li key={`${event.createdAt}-${index}`}>
            <span className={`od-timeline-dot${index === 0 ? ' od-timeline-dot--latest' : ''}`} aria-hidden="true" />
            <div className="od-event-heading"><h3>{statuses[event.newStatus]}</h3><time dateTime={event.createdAt}>{date(event.createdAt)}</time></div>
            <p className="od-event-actor">{actors[event.actorType] ?? event.actorType}</p>
            <p className="od-event-description">{event.note ? event.note === 'SePay verified bank transfer' ? 'SePay đã xác nhận thanh toán chuyển khoản.' : event.note : event.previousStatus ? `Chuyển từ “${statuses[event.previousStatus]}” sang “${statuses[event.newStatus]}”.` : `Đơn hàng được tạo với trạng thái “${statuses[event.newStatus]}”.`}</p>
          </li>)}</ol> : <p className="od-muted">Chưa có hoạt động được ghi nhận.</p>}</div>
        </section>
      </div>

      <aside className="od-side-column" aria-label="Thông tin khách hàng và thanh toán">
        <section className="od-panel" aria-labelledby="od-shipping-title">
          <header className="od-panel-heading"><h2 id="od-shipping-title"><MapPin size={20} aria-hidden="true" /> Khách hàng & giao hàng</h2></header>
          <div className="od-panel-body"><dl className="od-info"><div><dt>Người nhận</dt><dd className="od-recipient">{order.recipientName}</dd></div><div><dt>Số điện thoại</dt><dd><a className="od-phone" href={`tel:${order.recipientPhone}`}><Phone size={15} aria-hidden="true" />{order.recipientPhone}</a></dd></div><div><dt>Địa chỉ giao hàng</dt><dd><address>{order.addressLine}, {order.wardName}, {order.provinceName}</address></dd></div><div className="od-note"><dt>Ghi chú đơn hàng</dt><dd>{order.note || 'Không có ghi chú.'}</dd></div></dl></div>
        </section>

        <section className="od-panel" aria-labelledby="od-payment-title">
          <header className="od-panel-heading"><h2 id="od-payment-title"><CreditCard size={20} aria-hidden="true" /> Thanh toán</h2></header>
          <div className="od-panel-body"><dl className="od-info">
            <div><dt>Phương thức</dt><dd>{order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}</dd></div>
            <div><dt>Trạng thái thanh toán</dt><dd><span className={`od-badge od-payment--${data.paymentStatus.toLowerCase()}`}>{paymentStatuses[data.paymentStatus] ?? data.paymentStatus}</span></dd></div>
          </dl><dl className="od-payment-amounts"><div><dt>Số tiền cần thanh toán</dt><dd>{money(data.expectedAmount)}</dd></div><div><dt>Đã thanh toán</dt><dd>{money(data.paidAmount ?? 0)}</dd></div></dl><dl className="od-info">
            <div><dt>Thời điểm xác nhận</dt><dd>{data.paidAt ? <time dateTime={data.paidAt}>{date(data.paidAt)}</time> : 'Chưa ghi nhận thanh toán'}</dd></div>
            {data.transferCode && <div><dt>Nội dung chuyển khoản</dt><dd className="od-transfer-code">{data.transferCode}</dd></div>}
          </dl></div>
        </section>
      </aside>
    </div>}
  </section>
}
