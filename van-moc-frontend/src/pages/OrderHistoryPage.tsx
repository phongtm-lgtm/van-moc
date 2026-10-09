import { useEffect, useState } from 'react'
import { ChevronRight, Clock3, PackageCheck, ShoppingBag, Truck, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { accountApi } from '../api/account'
import { getOrder, money, ORDER_LABELS, type OrderDetail, type OrderPage } from '../api/orders'

type Filter = 'all' | 'processing' | 'shipping' | 'delivered' | 'cancelled'
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Tất cả đơn hàng' }, { value: 'processing', label: 'Đang xử lý' },
  { value: 'shipping', label: 'Đang giao' }, { value: 'delivered', label: 'Đã giao' }, { value: 'cancelled', label: 'Đã hủy' },
]
const group = (order: OrderDetail): Filter => order.status === 'CANCELLED' ? 'cancelled' : order.status === 'COMPLETED' ? 'delivered' : order.status === 'SHIPPING' ? 'shipping' : 'processing'
const ICONS = { all: ShoppingBag, processing: Clock3, shipping: Truck, delivered: PackageCheck, cancelled: XCircle }

export function OrderHistoryPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [orders, setOrders] = useState<OrderDetail[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  useEffect(() => {
    let active = true
    // Loading belongs to the page/retry request lifecycle, not a derived value.
    // oxlint-disable-next-line react/set-state-in-effect
    setLoading(true); setError('')
    accountApi<OrderPage>(`/api/orders?page=${page}`)
      .then(async result => {
        const rows = await Promise.all(result.content.map(row => getOrder(row.orderId!)))
        if (active) { setOrders(rows); setTotalPages(result.totalPages) }
      }).catch((cause: Error) => { if (active) { setError(cause.message); setOrders([]) } })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [page, reload])
  const visibleOrders = filter === 'all' ? orders : orders.filter(order => group(order) === filter)
  const countFor = (value: Filter) => value === 'all' ? orders.length : orders.filter(order => group(order) === value).length
  return (
    <>
      <header className="account-layout__heading"><h1>Lịch sử đơn hàng</h1><p>Theo dõi những đơn hàng bạn đã đặt tại Vân Mộc.</p></header>
        <section className="orders-content">
          <div className="orders-filters" role="tablist" aria-label="Lọc đơn hàng trên trang hiện tại">
            {FILTERS.map(item => <button className={filter === item.value ? 'is-active' : ''} type="button" role="tab" aria-selected={filter === item.value} key={item.value} onClick={() => setFilter(item.value)}>
              {item.label} <span>({countFor(item.value)})</span>
            </button>)}
          </div>
          {totalPages > 1 && <p>Bộ lọc và số lượng áp dụng cho trang hiện tại.</p>}
          {error && <p role="alert">{error} <button type="button" onClick={() => setReload(value => value + 1)}>Thử lại</button> <Link to="/login">Đăng nhập</Link></p>}
          <div className="orders-list">
            {loading ? <p role="status">Đang tải đơn hàng…</p> : !error && visibleOrders.length === 0 ? (
              <div className="orders-empty"><ShoppingBag size={32} strokeWidth={1.3} /><strong>Chưa có đơn hàng</strong><span>Các đơn hàng thuộc trạng thái này sẽ xuất hiện tại đây.</span></div>
            ) : !error && visibleOrders.map(order => {
              const status = group(order)
              const StatusIcon = ICONS[status]
              return <article className="order-card" key={order.id}>
                <header className="order-card__head">
                  <div className="order-card__meta"><h2>#{order.orderCode}</h2><p>Đặt ngày {new Date(order.createdAt).toLocaleString('vi-VN')}</p></div>
                  <span className={`order-status order-status--${status}`}><StatusIcon size={14} strokeWidth={1.8} />{ORDER_LABELS[order.status]}</span>
                 </header>
                 <div className="order-card__body"><div className="order-products">
                  {order.items.map(product => <div className="order-product" key={product.id}>
                    <img src={product.imageUrl ?? ''} alt="" />
                    <div className="order-product__info"><strong>{product.productName}</strong><small>Mã: {product.productCode}</small>
                      {product.engravingText && <small>Khắc tên: {product.engravingText}</small>}
                      {product.engravingFont && <small>Font: {product.engravingFont} | Vị trí: {product.engravingPosition}</small>}
                     </div><span className="order-product__qty">x{product.quantity}</span><div className="order-product__amount"><small>Đơn giá: {money(product.unitPrice)}</small><strong className="order-product__price">{money(product.lineTotal)}</strong></div>
                   </div>)}
                 </div></div><footer className="order-card__foot"><div className="order-card__sum"><span>Tổng thanh toán · {order.paymentMethod === 'COD' ? 'Nhận hàng' : 'Chuyển khoản'}</span><strong>{money(order.grandTotal)}</strong></div><div className="order-card__actions"><Link to={`/account/orders/${order.id}`}>Xem chi tiết <ChevronRight size={15} /></Link>
                   {order.status === 'COMPLETED' && <Link className="is-secondary" to="/shop">Mua lại</Link>}
                 </div></footer>
              </article>
            })}
          </div>
           <div className="orders-pagination">
            <button type="button" disabled={loading || page === 0} onClick={() => setPage(value => value - 1)}>Trang trước</button>
            <span>Trang {page + 1} / {Math.max(1, totalPages)}</span>
            <button type="button" disabled={loading || page + 1 >= totalPages} onClick={() => setPage(value => value + 1)}>Trang sau</button>
          </div>
        </section>
    </>
  )
}
