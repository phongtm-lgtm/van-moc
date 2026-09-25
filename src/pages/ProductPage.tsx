import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { useCart } from '../hooks/useCart'

const CATEGORIES = [
  'Tất cả sản phẩm',
  'Lược sừng',
  'Trâm cài',
  'Trang sức',
  'Quà tặng',
]

const PRODUCTS = [
  {
    id: 1,
    name: 'Lược sừng khắc hoa sen',
    category: 'Lược sừng',
    price: 320000,
    stock: 12,
    engravable: true,
    badge: 'Bán chạy',
    image: '/image/products/luoc-rang-thua.jpg',
    position: '48% center',
  },
  {
    id: 2,
    name: 'Trâm cài hoa mai',
    category: 'Trâm cài',
    price: 185000,
    stock: 8,
    engravable: false,
    badge: 'Mới',
    image: '/image/products/tram-hoa-sen.jpg',
    position: 'center',
  },
  {
    id: 3,
    name: 'Lược sừng cán dài',
    category: 'Lược sừng',
    price: 450000,
    stock: 4,
    engravable: true,
    badge: 'Độc bản',
    image: '/image/products/luoc-rang-thua.jpg',
    position: '76% center',
  },
  {
    id: 4,
    name: 'Vòng tay sừng tự nhiên',
    category: 'Trang sức',
    price: 650000,
    stock: 6,
    engravable: false,
    image: '/image/products/bo-qua-tang.jpg',
    position: '75% center',
  },
  {
    id: 5,
    name: 'Lược sừng bỏ túi',
    category: 'Lược sừng',
    price: 280000,
    stock: 15,
    engravable: true,
    image: '/image/products/luoc-bo-tui.jpg',
    position: 'center',
  },
  {
    id: 6,
    name: 'Trâm cài lá sen',
    category: 'Trâm cài',
    price: 220000,
    stock: 3,
    engravable: true,
    badge: 'Mới',
    image: '/image/products/tram-hoa-sen.jpg',
    position: '68% center',
  },
  {
    id: 7,
    name: 'Bộ quà tặng Vân Mộc',
    category: 'Quà tặng',
    price: 1200000,
    stock: 5,
    engravable: true,
    badge: 'Bán chạy',
    image: '/image/products/bo-qua-tang.jpg',
    position: 'center',
  },
  {
    id: 8,
    name: 'Kẹp tóc khắc mẫu đơn',
    category: 'Trang sức',
    price: 380000,
    stock: 7,
    engravable: false,
    badge: 'Độc bản',
    image: '/image/products/tram-hoa-sen.jpg',
    position: '28% center',
  },
]

type Product = (typeof PRODUCTS)[number]

function formatPrice(price: number) {
  return `${new Intl.NumberFormat('vi-VN').format(price)} đ`
}

function FilterContent({
  category,
  onCategoryChange,
}: {
  category: string
  onCategoryChange: (category: string) => void
}) {
  return (
    <div className="shop-filter__content">
      <section className="shop-filter__section">
        <h3>Danh mục</h3>
        <div className="shop-category-list">
          {CATEGORIES.map((item) => (
            <button
              type="button"
              key={item}
              className={category === item ? 'is-active' : ''}
              onClick={() => onCategoryChange(item)}
            >
              <span>{item}</span>
            </button>
          ))}
        </div>
      </section>

    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate()
  const { addItem } = useCart()

  const cartProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    category: product.category,
  }

  return (
    <article className="shop-product-card group">
      <Link to={`/shop/${product.id}`} className="block" tabIndex={-1} aria-hidden>
        <div className="shop-product-card__media">
          <img src={product.image} alt={product.name} style={{ objectPosition: product.position }} />
          <div className="shop-product-card__wash" aria-hidden />
          {product.badge ? <span className="shop-product-card__badge">{product.badge}</span> : null}
        </div>
      </Link>
      <div className="shop-product-card__body">
        <div className="shop-product-card__engraving">
          {product.engravable ? <span>Có thể khắc tên</span> : null}
        </div>
        <Link to={`/shop/${product.id}`} className="shop-product-card__name-link">
          <h3>{product.name}</h3>
        </Link>
        <p className="shop-product-card__description">
          Chế tác thủ công từ sừng tự nhiên, giữ trọn sắc độ và đường vân riêng biệt.
        </p>
        <div className="shop-product-card__price-row">
          <p className="shop-product-card__price">{formatPrice(product.price)}</p>
          <p className={`shop-product-card__stock ${product.stock <= 10 ? 'is-low' : ''}`}>
            {product.stock <= 10 ? `Chỉ còn ${product.stock}` : `Còn lại ${product.stock}`}
          </p>
        </div>
        <div className="shop-product-card__actions">
          <button
            type="button"
            className="shop-product-card__buy-now"
            aria-label={`Mua ngay ${product.name}`}
            onClick={() => {
              addItem(cartProduct)
              navigate('/cart')
            }}
          >
            Mua ngay
          </button>
          <button
            type="button"
            className="shop-product-card__cart"
            aria-label={`Thêm ${product.name} vào giỏ hàng`}
            onClick={() => addItem(cartProduct)}
          >
            <ShoppingCart size={17} />
          </button>
        </div>
      </div>
    </article>
  )
}

export function ProductPage() {
  const [filterOpen, setFilterOpen] = useState(false)
  const [sort, setSort] = useState('popular')
  const [category, setCategory] = useState('Tất cả sản phẩm')

  const products = PRODUCTS.filter((product) => {
    return category === 'Tất cả sản phẩm' || product.category === category
  }).sort((a, b) => {
    if (sort === 'low') return a.price - b.price
    if (sort === 'high') return b.price - a.price
    return a.id - b.id
  })

  return (
    <div className="shop-page">
      <section className="shop-catalog">
        <div className="shop-catalog__decor" aria-hidden />
        <div className="shop-catalog__inner">
          <aside className="shop-filter" aria-label="Bộ lọc sản phẩm">
            <div className="shop-filter__heading">
              <span>Bộ lọc</span>
              <SlidersHorizontal size={16} />
            </div>
            <FilterContent
              category={category}
              onCategoryChange={setCategory}
            />
          </aside>

          <div className="shop-results">
            <div className="shop-toolbar">
              <p>
                Hiển thị <strong>{products.length}</strong> sản phẩm
              </p>
              <div className="shop-toolbar__controls">
                <button type="button" className="shop-mobile-filter" onClick={() => setFilterOpen(true)}>
                  <SlidersHorizontal size={15} /> Bộ lọc
                </button>
                <label className="shop-sort">
                  <span className="sr-only">Sắp xếp sản phẩm</span>
                  <select value={sort} onChange={(event) => setSort(event.target.value)}>
                    <option value="popular">Phổ biến nhất</option>
                    <option value="low">Giá thấp đến cao</option>
                    <option value="high">Giá cao đến thấp</option>
                  </select>
                  <ChevronDown size={14} aria-hidden />
                </label>
              </div>
            </div>

            {products.length ? (
              <div className="shop-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-sm text-[#74604d]">
                Không có sản phẩm phù hợp với bộ lọc đã chọn.
              </div>
            )}

            {products.length ? <nav className="shop-pagination" aria-label="Phân trang sản phẩm">
              <button type="button" aria-label="Trang trước"><ChevronLeft size={16} /></button>
              <button type="button" className="is-active" aria-current="page">1</button>
              <button type="button">2</button>
              <button type="button">3</button>
              <button type="button">4</button>
              <span>…</span>
              <button type="button">6</button>
              <button type="button" aria-label="Trang sau"><ChevronRight size={16} /></button>
            </nav> : null}
          </div>
        </div>
      </section>

      {filterOpen ? (
        <div className="shop-filter-drawer" role="dialog" aria-modal="true" aria-label="Bộ lọc sản phẩm">
          <button className="shop-filter-drawer__backdrop" type="button" onClick={() => setFilterOpen(false)} aria-label="Đóng bộ lọc" />
          <div className="shop-filter-drawer__panel">
            <div className="shop-filter-drawer__handle" aria-hidden />
            <div className="shop-filter-drawer__header">
              <div><span>Lựa chọn của bạn</span><h2>Bộ lọc sản phẩm</h2></div>
              <button type="button" onClick={() => setFilterOpen(false)} aria-label="Đóng"><X size={20} /></button>
            </div>
            <FilterContent
              category={category}
              onCategoryChange={setCategory}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
