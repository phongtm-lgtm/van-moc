import { useState } from 'react'
import { ChevronRight, CircleUserRound, Clock3, LogOut, MapPin, PackageCheck, ShoppingBag, Truck, UserRound, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

type OrderStatus = 'processing' | 'shipping' | 'delivered' | 'cancelled'

type Order = {
  id: string
  date: string
  status: OrderStatus
  delivery: string
  payment: string
  total: number
  products: Array<{
    name: string
    sku: string
    image: string
    quantity: number
    price: number
    engraving?: string
    font?: string
  }>
}

const SAMPLE_ORDERS: Order[] = [
  {
    id: 'VM20250925001',
    date: '25/09/2025 · 14:52',
    status: 'shipping',
    delivery: 'Dự kiến giao 28/09/2025 - 30/09/2025',
    payment: 'Thanh toán khi nhận hàng',
    total: 370000,
    products: [{
      name: 'Lược sừng khắc hoa sen',
      sku: 'VM-LS-001',
      image: '/image/products/luoc-rang-thua.jpg',
      quantity: 1,
      price: 370000,
      engraving: 'An Nhiên',
      font: 'Thư pháp | Vị trí: Mặt trước',
    }],
  },
  {
    id: 'VM20250918003',
    date: '18/09/2025 · 10:30',
    status: 'delivered',
    delivery: 'Giao thành công 20/09/2025',
    payment: 'Thanh toán khi nhận hàng',
    total: 180000,
    products: [{
      name: 'Trâm cài sừng hoa mai',
      sku: 'VM-TC-002',
      image: '/image/products/tram-hoa-sen.jpg',
      quantity: 1,
      price: 180000,
      engraving: 'Không khắc tên',
    }],
  },
  {
    id: 'VM20250912002',
    date: '12/09/2025 · 16:20',
    status: 'delivered',
    delivery: 'Giao thành công 15/09/2025',
    payment: 'Thanh toán qua chuyển khoản',
    total: 600000,
    products: [
      {
        name: 'Lược sừng vân mộc',
        sku: 'VM-LS-003',
        image: '/image/products/luoc-bo-tui.jpg',
        quantity: 1,
        price: 280000,
        engraving: 'Minh',
        font: 'Hiện đại | Vị trí: Mặt sau',
      },
      {
        name: 'Trâm cài bướm',
        sku: 'VM-TC-003',
        image: '/image/products/tram-hoa-sen.jpg',
        quantity: 1,
        price: 220000,
        engraving: 'Không khắc tên',
      },
    ],
  },
  {
    id: 'VM20250828004',
    date: '28/08/2025 · 09:15',
    status: 'processing',
    delivery: 'Đang chuẩn bị sản phẩm',
    payment: 'Thanh toán qua chuyển khoản',
    total: 1250000,
    products: [{
      name: 'Bộ quà tặng Vân Mộc',
      sku: 'VM-QT-007',
      image: '/image/products/bo-qua-tang.jpg',
      quantity: 1,
      price: 1250000,
      engraving: 'Bình An',
      font: 'Thư pháp | Vị trí: Hộp quà',
    }],
  },
  {
    id: 'VM20250811001',
    date: '11/08/2025 · 17:40',
    status: 'delivered',
    delivery: 'Giao thành công 14/08/2025',
    payment: 'Thanh toán khi nhận hàng',
    total: 250000,
    products: [{
      name: 'Lược sừng bỏ túi',
      sku: 'VM-LS-005',
      image: '/image/products/luoc-bo-tui.jpg',
      quantity: 1,
      price: 250000,
      engraving: 'Không khắc tên',
    }],
  },
]

const STATUS_META = {
  processing: { label: 'Đang xử lý', icon: Clock3 },
  shipping: { label: 'Đang giao', icon: Truck },
  delivered: { label: 'Đã giao', icon: PackageCheck },
  cancelled: { label: 'Đã hủy', icon: XCircle },
} as const

const FILTERS: Array<{ value: 'all' | OrderStatus; label: string }> = [
  { value: 'all', label: 'Tất cả đơn hàng' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã hủy' },
]

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)} đ`
}

function loadOrders() {
  try {
    const savedOrders = JSON.parse(localStorage.getItem('van-moc-orders') ?? '[]') as Order[]
    return [...savedOrders, ...SAMPLE_ORDERS]
  } catch {
    return SAMPLE_ORDERS
  }
}

export function OrderHistoryPage() {
  const [filter, setFilter] = useState<'all' | OrderStatus>('all')
  const [orders] = useState<Order[]>(loadOrders)
  const visibleOrders = filter === 'all' ? orders : orders.filter((order) => order.status === filter)
  const countFor = (value: 'all' | OrderStatus) => (
    value === 'all' ? orders.length : orders.filter((order) => order.status === value).length
  )

  return (
    <div className="orders-page">
      <div className="orders-page__wash" aria-hidden />
      <main className="orders-shell">
        <aside className="account-menu">
          <div className="account-menu__profile">
            <span><CircleUserRound size={34} strokeWidth={1.2} /></span>
            <div>
              <strong>Nguyễn Thị An</strong>
              <small>an.nguyen@gmail.com</small>
            </div>
          </div>
          <nav>
            <Link to="/login"><UserRound size={18} strokeWidth={1.6} />Thông tin tài khoản</Link>
            <Link to="/account/addresses"><MapPin size={18} strokeWidth={1.6} />Địa chỉ nhận hàng</Link>
            <Link className="is-active" to="/account/orders"><ShoppingBag size={18} strokeWidth={1.6} />Lịch sử đơn hàng</Link>
            <Link to="/login"><LogOut size={18} strokeWidth={1.6} />Đăng xuất</Link>
          </nav>
        </aside>

        <section className="orders-content">
          <div className="orders-filters" role="tablist" aria-label="Lọc đơn hàng">
            {FILTERS.map((item) => (
              <button
                className={filter === item.value ? 'is-active' : ''}
                type="button"
                role="tab"
                aria-selected={filter === item.value}
                key={item.value}
                onClick={() => setFilter(item.value)}
              >
                {item.label} <span>({countFor(item.value)})</span>
              </button>
            ))}
          </div>

          <div className="orders-list">
            {visibleOrders.length === 0 ? (
              <div className="orders-empty">
                <ShoppingBag size={32} strokeWidth={1.3} />
                <strong>Chưa có đơn hàng</strong>
                <span>Các đơn hàng thuộc trạng thái này sẽ xuất hiện tại đây.</span>
              </div>
            ) : visibleOrders.map((order) => {
              const status = STATUS_META[order.status]
              const StatusIcon = status.icon
              return (
                <article className="order-card" key={order.id}>
                  <header className="order-card__head">
                    <div className="order-card__meta">
                      <h2>#{order.id}</h2>
                      <p>Đặt ngày {order.date}</p>
                    </div>
                    <span className={`order-status order-status--${order.status}`}>
                      <StatusIcon size={14} strokeWidth={1.8} />
                      {status.label}
                    </span>
                    <p className="order-card__delivery">{order.delivery}</p>
                    <div className="order-card__sum">
                      <strong>{formatPrice(order.total)}</strong>
                      <span>{order.payment}</span>
                    </div>
                  </header>

                  <div className="order-card__body">
                    <div className="order-products">
                      {order.products.map((product) => (
                        <div className="order-product" key={`${order.id}-${product.sku}`}>
                          <img src={product.image} alt="" />
                          <div className="order-product__info">
                            <strong>{product.name}</strong>
                            <small>Mã: {product.sku}</small>
                            {product.engraving && <small>Khắc tên: {product.engraving}</small>}
                            {product.font && <small>Font: {product.font}</small>}
                          </div>
                          <span className="order-product__qty">x{product.quantity}</span>
                          <strong className="order-product__price">{formatPrice(product.price)}</strong>
                        </div>
                      ))}
                    </div>

                    <div className="order-card__actions">
                      <Link to={`/account/orders/${order.id}`}>
                        Xem chi tiết <ChevronRight size={15} />
                      </Link>
                      {order.status === 'delivered' && (
                        <Link className="is-secondary" to="/shop">Mua lại</Link>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
