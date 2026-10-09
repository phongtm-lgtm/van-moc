import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronLeft, ChevronRight, ShoppingCart, SlidersHorizontal, X } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { api, type Category, type Product, type ProductPageResponse } from '../api/catalog'

function formatPrice(price: number) {
  return `${new Intl.NumberFormat('vi-VN').format(price)} đ`
}

function FilterContent({ categories, category, onCategoryChange }: {
  categories: Category[]; category: string; onCategoryChange: (category: string) => void
}) {
  return <div className="shop-filter__content">
    <section className="shop-filter__section">
      <h3>Danh mục</h3>
      <div className="shop-category-list">
        {[{ id: '', name: 'Tất cả sản phẩm' }, ...categories].map(item => <button type="button" key={item.id}
          className={category === item.id ? 'is-active' : ''} onClick={() => onCategoryChange(item.id)}><span>{item.name}</span></button>)}
      </div>
    </section>
  </div>
}

function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate()
  const { addItem, loading } = useCart()
  const [error, setError] = useState('')
  const add = async (buyNow: boolean) => {
    try {
      await addItem({ id: product.id, name: product.name, price: product.price, image: product.imageUrl || '' })
      setError('')
      if (buyNow) navigate('/cart')
    } catch (cause) { setError((cause as Error).message) }
  }
  return <article className="shop-product-card group">
    <Link to={`/shop/${product.slug}`} className="block" tabIndex={-1} aria-hidden>
      <div className="shop-product-card__media">
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span>Chưa có ảnh</span>}
        <div className="shop-product-card__wash" aria-hidden />
      </div>
    </Link>
    <div className="shop-product-card__body">
      <div className="shop-product-card__engraving">{product.engravingEnabled ? <span>Có thể khắc tên</span> : null}</div>
      <Link to={`/shop/${product.slug}`} className="shop-product-card__name-link"><h3>{product.name}</h3></Link>
      <p className="shop-product-card__description">{product.shortDescription}</p>
      <div className="shop-product-card__price-row">
        <p className="shop-product-card__price">{formatPrice(product.price)}</p>
        <p className={`shop-product-card__stock ${product.stock <= 10 ? 'is-low' : ''}`}>
          {product.stock === 0 ? 'Hết hàng' : product.stock <= 10 ? `Chỉ còn ${product.stock}` : `Còn lại ${product.stock}`}
        </p>
      </div>
      <div className="shop-product-card__actions">
        <button type="button" className="shop-product-card__buy-now" disabled={loading || product.stock === 0}
          aria-label={`Mua ngay ${product.name}`} onClick={() => void add(true)}>Mua ngay</button>
        <button type="button" className="shop-product-card__cart" disabled={loading || product.stock === 0}
          aria-label={`Thêm ${product.name} vào giỏ hàng`} onClick={() => void add(false)}><ShoppingCart size={17} /></button>
      </div>
      {error && <p role="alert">{error}</p>}
    </div>
  </article>
}

export function ProductPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)
  const sort = searchParams.get('sort') === 'low' || searchParams.get('sort') === 'high' ? searchParams.get('sort')! : 'popular'
  const category = searchParams.get('category') ?? ''
  const [categories, setCategories] = useState<Category[]>([])
  const pageParam = Number(searchParams.get('page'))
  const page = Number.isSafeInteger(pageParam) && pageParam > 0 ? pageParam - 1 : 0
  const [result, setResult] = useState<ProductPageResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    // oxlint-disable-next-line react/set-state-in-effect -- synchronize the existing catalog view with the API
    setLoading(true); setError(''); setResult(null)
    Promise.all([api<Category[]>('/api/categories', controller.signal),
      api<ProductPageResponse>(`/api/products?page=${page}&size=12${category ? `&categoryId=${category}` : ''}`, controller.signal)])
      .then(([nextCategories, products]) => { setCategories(nextCategories); setResult(products) })
      .catch((cause: Error) => { if (!controller.signal.aborted) setError(cause.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [page, category, retry])
  const products = [...(result?.content ?? [])].sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : 0)
  const updateSearch = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setSearchParams(next)
  }
  const changeCategory = (value: string) => { updateSearch({ category: value, page: null }); setFilterOpen(false) }
  const changePage = (value: number) => updateSearch({ page: value > 0 ? String(value + 1) : null })
  return <div className="shop-page">
    <section className="shop-catalog">
      <div className="shop-catalog__decor" aria-hidden />
      <div className="shop-catalog__inner">
        <aside className="shop-filter" aria-label="Bộ lọc sản phẩm">
          <div className="shop-filter__heading"><span>Bộ lọc</span><SlidersHorizontal size={16} /></div>
          <FilterContent categories={categories} category={category} onCategoryChange={changeCategory} />
        </aside>
        <div className="shop-results">
          <div className="shop-toolbar">
            <p>Hiển thị <strong>{products.length}</strong> sản phẩm</p>
            <div className="shop-toolbar__controls">
              <button type="button" className="shop-mobile-filter" onClick={() => setFilterOpen(true)}><SlidersHorizontal size={15} /> Bộ lọc</button>
              <label className="shop-sort">
                <span className="sr-only">Sắp xếp sản phẩm</span>
                <select value={sort} onChange={event => updateSearch({ sort: event.target.value === 'popular' ? null : event.target.value })}>
                  <option value="popular">Mới nhất</option><option value="low">Giá thấp đến cao (trang này)</option><option value="high">Giá cao đến thấp (trang này)</option>
                </select><ChevronDown size={14} aria-hidden />
              </label>
            </div>
          </div>
          {loading && <p role="status">Đang tải sản phẩm…</p>}
          {error && <p role="alert">{error} <button type="button" onClick={() => setRetry(v => v + 1)}>Thử lại</button></p>}
          {products.length ? <div className="shop-grid">{products.map(product => <ProductCard key={product.id} product={product} />)}</div>
            : !loading && !error && <div className="py-20 text-center text-sm text-[#74604d]">Không có sản phẩm phù hợp với bộ lọc đã chọn.</div>}
          {result && result.totalPages > 0 && <nav className="shop-pagination" aria-label="Phân trang sản phẩm">
             <button type="button" disabled={loading || page === 0} onClick={() => changePage(page - 1)} aria-label="Trang trước"><ChevronLeft size={16} /></button>
            {Array.from({ length: Math.min(result.totalPages, 5) }, (_, index) => Math.max(0, Math.min(page - 2, result.totalPages - 5)) + index).map(value =>
               <button type="button" key={value} className={page === value ? 'is-active' : ''} aria-current={page === value ? 'page' : undefined} onClick={() => changePage(value)}>{value + 1}</button>)}
             <button type="button" disabled={loading || page + 1 >= result.totalPages} onClick={() => changePage(page + 1)} aria-label="Trang sau"><ChevronRight size={16} /></button>
          </nav>}
        </div>
      </div>
    </section>
    {filterOpen && <div className="shop-filter-drawer" role="dialog" aria-modal="true" aria-label="Bộ lọc sản phẩm">
      <button className="shop-filter-drawer__backdrop" type="button" onClick={() => setFilterOpen(false)} aria-label="Đóng bộ lọc" />
      <div className="shop-filter-drawer__panel">
        <div className="shop-filter-drawer__handle" aria-hidden />
        <div className="shop-filter-drawer__header"><div><span>Lựa chọn của bạn</span><h2>Bộ lọc sản phẩm</h2></div>
          <button type="button" onClick={() => setFilterOpen(false)} aria-label="Đóng"><X size={20} /></button></div>
        <FilterContent categories={categories} category={category} onCategoryChange={changeCategory} />
      </div>
    </div>}
  </div>
}
