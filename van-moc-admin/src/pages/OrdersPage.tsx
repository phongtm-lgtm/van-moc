import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import { accountApi } from '@/api/account'
import { money, statuses, paymentStatuses, orderActions, type OrderPage, type OrderStats, type Status, type Summary } from '@/api/orders'
import './OrdersPage.css'

const tabs: { value: Status | ''; label: string }[] = [
  { value: '', label: 'Tất cả' },
  ...(['PENDING_CONFIRMATION', 'CONFIRMED', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPING', 'COMPLETED', 'PENDING_PAYMENT', 'CANCELLED'] as Status[]).map(value => ({ value, label: statuses[value] })),
]
const shortCode = (code: string) => code.length > 12 ? `${code.slice(0, 10)}…` : code
const date = (value: string) => new Date(value).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const csvCell = (value: string | number) => `"${String(value).replace(/^[=+@\-\t\r]/, "'$&").replace(/"/g, '""')}"`

export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ search: '', status: '' as Status | '', method: '', page: 0 })
  const [data, setData] = useState<OrderPage | null>(null)
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [error, setError] = useState('')
  const [statsError, setStatsError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [retry, setRetry] = useState(0)
  const mutation = useRef(false)
  const listRequest = useRef(0)
  const exportingRef = useRef(false)

  useEffect(() => {
    let active = true
    const request = ++listRequest.current
    setLoading(true)
    const query = new URLSearchParams({ search: filters.search, page: String(filters.page) })
    if (filters.status) query.set('status', filters.status)
    if (filters.method) query.set('method', filters.method)
    accountApi<OrderPage>(`/api/admin/orders?${query}`).then(result => {
      if (active && request === listRequest.current) {
        if (!result.content.length && filters.page > 0) {
          setFilters(current => ({ ...current, page: Math.max(0, Math.min(current.page - 1, result.totalPages - 1)) }))
        } else { setData(result); setError(''); setLoading(false) }
      }
    }).catch((cause: Error) => { if (active && request === listRequest.current) { setError(cause.message); setData(null); setLoading(false) } })
    return () => { active = false }
  }, [filters, retry])

  useEffect(() => {
    let active = true
    accountApi<OrderStats>('/api/admin/orders/stats').then(result => {
      if (active) { setStats(result); setStatsError('') }
    }).catch((cause: Error) => { if (active) setStatsError(cause.message) })
    return () => { active = false }
  }, [retry])

  const update = (changes: Partial<typeof filters>) => { setLoading(true); setFilters(current => ({ ...current, ...changes })) }
  const submit = (event: FormEvent) => { event.preventDefault(); update({ search: search.trim(), page: 0 }) }
  const advance = async (order: Summary) => {
    const action = orderActions[order.status]
    if (!action || mutation.current || loading || (order.paymentMethod === 'BANK_TRANSFER' && order.paymentStatus !== 'PAID')) return
    const collectCod = order.paymentMethod === 'COD' && action.status === 'COMPLETED'
    if (collectCod && (order.paymentStatus !== 'PENDING' || !window.confirm(`Đơn ${order.orderCode}: xác nhận đã giao hàng và thu đủ ${money(order.grandTotal)} COD?`))) return
    mutation.current = true
    setBusyId(order.id); setError(''); setNotice('')
    try {
      await accountApi(`/api/admin/orders/${order.id}/status`, 'PATCH', { status: action.status, collectCod })
      // Invalidate any in-flight list read before enabling actions on the refreshed rows.
      listRequest.current += 1
      setLoading(true)
      setNotice(`Đơn ${shortCode(order.orderCode)} → ${statuses[action.status]}.${collectCod ? ' Đã ghi nhận thu đủ tiền COD.' : ''}`)
      setRetry(value => value + 1)
    } catch (cause) { setError((cause as Error).message) }
    finally { setBusyId(null); mutation.current = false }
  }
  const exportCsv = async () => {
    if (exportingRef.current) return
    exportingRef.current = true
    setExporting(true); setError('')
    try {
      const query = new URLSearchParams({ search: filters.search })
      if (filters.status) query.set('status', filters.status)
      if (filters.method) query.set('method', filters.method)
      const orders: Summary[] = []
      for (let page = 0, totalPages = 1; page < totalPages; page++) {
        query.set('page', String(page))
        const result = await accountApi<OrderPage>(`/api/admin/orders?${query}`)
        orders.push(...result.content)
        totalPages = result.totalPages
      }
      const unique = [...new Map(orders.map(order => [order.id, order])).values()]
      const content = [
        ['Mã đơn', 'Người nhận', 'Ngày tạo', 'Trạng thái đơn', 'Phương thức', 'Trạng thái thanh toán', 'Tổng tiền (VNĐ)'],
        ...unique.map(order => [order.orderCode, order.recipientName, date(order.createdAt), statuses[order.status], order.paymentMethod === 'COD' ? 'COD' : 'Chuyển khoản', order.paymentStatus ? paymentStatuses[order.paymentStatus] : 'Chưa có dữ liệu', order.grandTotal]),
      ].map(row => row.map(csvCell).join(',')).join('\r\n')
      const url = URL.createObjectURL(new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8;' }))
      const link = document.createElement('a')
      link.href = url; link.download = `van-moc-don-hang-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link); link.click(); link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNotice(`Đã xuất ${unique.length} đơn hàng theo bộ lọc hiện tại.`)
    } catch (cause) { setError((cause as Error).message) }
    finally { setExporting(false); exportingRef.current = false }
  }

  return <section className="order-manager" aria-labelledby="orders-title">
    <header className="order-manager__header"><div><h1 id="orders-title">Đơn hàng</h1><p>Theo dõi và xử lý đơn hàng của Vân Mộc</p></div><button className="order-button" type="button" disabled={exporting || loading || !data?.totalElements} onClick={() => void exportCsv()}><Download size={18} strokeWidth={1.7} aria-hidden="true" />{exporting ? 'Đang xuất…' : 'Xuất CSV'}</button></header>

    <div className="order-stats" aria-label="Thống kê tất cả đơn hàng">
      <div className="order-stat"><span>Tổng đơn</span><strong>{stats?.total ?? '—'}</strong><small>Tất cả đơn hàng</small></div>
      <button className="order-stat order-stat--pending" type="button" onClick={() => { setSearch(''); update({ status: 'PENDING_CONFIRMATION', method: '', search: '', page: 0 }) }}><span>Chờ xác nhận</span><strong>{stats?.pendingConfirmation ?? '—'}</strong><small>Cần xử lý</small></button>
      <div className="order-stat"><span>Đã hủy</span><strong>{stats?.cancelled ?? '—'}</strong><small>Đơn bị hủy</small></div>
    </div>

    {(error || statsError) && <div className="admin-alert order-feedback" role="alert">{error || `Không thể tải thống kê: ${statsError}`} <button className="order-button" type="button" disabled={loading || !!busyId} onClick={() => setRetry(value => value + 1)}>Thử lại</button></div>}
    {notice && <p className="order-notice order-feedback" role="status">{notice}</p>}

    <div className="order-list-panel">
    <div className="order-manager__heading"><h2>Danh sách đơn hàng</h2><span>{loading ? 'Đang tải…' : `${data?.totalElements ?? 0} đơn`}</span></div>
    <div className="order-tabs" role="group" aria-label="Lọc trạng thái đơn hàng">{tabs.map(tab => <button key={tab.value} type="button" className={`order-tab${filters.status === tab.value ? ' order-tab--active' : ''}`} aria-pressed={filters.status === tab.value} onClick={() => update({ status: tab.value, page: 0 })}>{tab.label}{tab.value === 'PENDING_CONFIRMATION' && !!stats?.pendingConfirmation && <span>{stats.pendingConfirmation}</span>}</button>)}</div>
    <form className="order-filters" onSubmit={submit}>
      <div className="order-search"><input type="search" aria-label="Tìm mã đơn hàng" placeholder="Tìm mã đơn hàng…" value={search} onChange={event => setSearch(event.target.value)} /><button className="order-button" type="submit">Tìm kiếm</button></div>
      <select aria-label="Phương thức thanh toán" value={filters.method} onChange={event => update({ method: event.target.value, page: 0 })}><option value="">Tất cả phương thức thanh toán</option><option value="COD">Thanh toán khi nhận hàng (COD)</option><option value="BANK_TRANSFER">Chuyển khoản (SePay)</option></select>
    </form>
    {!filters.status && <p className="order-priority-note">Ưu tiên hiển thị đơn chờ xác nhận.</p>}

    <div className="order-table-wrap" aria-busy={loading}>
      <table className="order-table"><thead><tr><th scope="col">Đơn hàng</th><th scope="col">Trạng thái</th><th scope="col" className="order-total">Tổng tiền</th><th scope="col" className="order-actions">Thao tác</th></tr></thead><tbody>
        {loading ? <tr><td colSpan={4} className="order-empty">Đang tải đơn hàng…</td></tr> : data?.content.length ? data.content.map(order => {
          const action = orderActions[order.status]
          const blocked = order.paymentMethod === 'BANK_TRANSFER' && order.paymentStatus !== 'PAID'
            ? 'Chờ xác nhận thanh toán'
            : order.paymentMethod === 'COD' && action?.status === 'COMPLETED' && order.paymentStatus !== 'PENDING'
              ? 'Kiểm tra thanh toán trong chi tiết đơn' : ''
          return <tr key={order.id} className={order.status === 'PENDING_CONFIRMATION' ? 'order-row--pending' : undefined}>
          <td><Link className="order-code" title={order.orderCode} to={`/orders/${order.id}`}>{shortCode(order.orderCode)}</Link><span className="order-recipient">{order.recipientName}</span><time className="order-date" dateTime={order.createdAt}>{date(order.createdAt)}</time></td>
          <td><span className={`order-status order-status--${order.status.toLowerCase()}`}>{statuses[order.status]}</span><span className={`order-payment${order.paymentStatus === 'PAID' ? ' order-payment--paid' : ''}`}>{order.paymentStatus ? paymentStatuses[order.paymentStatus] : 'Chưa có dữ liệu thanh toán'}</span></td>
          <td className="order-total"><strong>{money(order.grandTotal)}</strong><span className="order-method">{order.paymentMethod === 'COD' ? 'COD' : 'Chuyển khoản'}</span></td>
          <td className="order-actions"><div><Link className="order-button order-button--small" to={`/orders/${order.id}`} aria-label={`Xem đơn ${order.orderCode}`}>Xem</Link>{action && <button type="button" className="order-button order-button--small order-button--primary" disabled={!!busyId || !!blocked} title={blocked || `Chuyển sang ${statuses[action.status]}`} aria-label={`${action.label} — đơn ${order.orderCode}`} onClick={() => void advance(order)}>{busyId === order.id ? 'Đang lưu…' : action.label}</button>}</div>{action && blocked && <small className="order-action-hint">{blocked}</small>}</td>
        </tr>}) : <tr><td colSpan={4} className="order-empty">{error ? 'Không thể tải danh sách đơn hàng.' : 'Không có đơn hàng phù hợp.'}</td></tr>}
      </tbody></table>
    </div>

    <footer className="order-pagination"><span>{data && data.totalElements > 0 ? `${filters.page * 20 + 1}–${Math.min((filters.page + 1) * 20, data.totalElements)} / ${data.totalElements} đơn` : '0 đơn'}</span><div><button className="order-button" type="button" disabled={loading || filters.page === 0} onClick={() => update({ page: filters.page - 1 })}>Trước</button><span>Trang {filters.page + 1}/{Math.max(1, data?.totalPages ?? 0)}</span><button className="order-button" type="button" disabled={loading || filters.page + 1 >= (data?.totalPages ?? 0)} onClick={() => update({ page: filters.page + 1 })}>Sau</button></div></footer>
    </div>
  </section>
}
