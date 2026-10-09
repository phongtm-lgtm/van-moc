import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import { api, type Category, type ProductPageResponse } from '../api/catalog'
import { ProductCard } from '../components/ProductCard'
import './ProductPage.css'

function FilterContent({ categories, category, onCategoryChange }: {
  categories: Category[]; category: string; onCategoryChange: (category: string) => void
}) {
  return <div className="shop-filter__content">
    <section className="shop-filter__section">
      <h3>Danh mục</h3>
      <div className="shop-category-list">
        {[{ id: '', name: 'Tất cả sản phẩm' }, ...categories].map(item => <button type="button" key={item.id}
          className={category === item.id ? 'is-active' : ''} aria-pressed={category === item.id} onClick={() => onCategoryChange(item.id)}><span>{item.name}</span></button>)}
      </div>
    </section>
  </div>
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
    if (!filterOpen) return
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const panel = document.querySelector<HTMLElement>('.shop-filter-drawer__panel')
    const controls = () => [...(panel?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
    controls()[0]?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFilterOpen(false)
      if (event.key !== 'Tab') return
      const buttons = controls(), first = buttons[0], last = buttons.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKeyDown); previousFocus?.focus() }
  }, [filterOpen])
  useEffect(() => {
    const controller = new AbortController()
    // oxlint-disable-next-line react/set-state-in-effect -- synchronize the existing catalog view with the API
    setLoading(true); setError(''); setResult(null)
    Promise.all([api<Category[]>('/api/categories', controller.signal),
      api<ProductPageResponse>(`/api/products?page=${page}&size=12${category ? `&categoryId=${category}` : ''}`, controller.signal)])
       .then(([nextCategories, products]) => { if (!controller.signal.aborted) { setCategories(nextCategories); setResult(products) } })
       .catch(() => { if (!controller.signal.aborted) setError('Không tải được danh sách sản phẩm. Vui lòng thử lại.') })
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
            <p aria-live="polite">{loading ? 'Đang tải sản phẩm…' : error ? 'Chưa tải được sản phẩm' : <>Hiển thị <strong>{products.length}</strong> / {result?.totalElements ?? 0} sản phẩm</>}</p>
            <div className="shop-toolbar__controls">
              <button type="button" className="shop-mobile-filter" aria-haspopup="dialog" aria-expanded={filterOpen} onClick={() => setFilterOpen(true)}><SlidersHorizontal size={15} /> Bộ lọc</button>
              <label className="shop-sort">
                <span className="sr-only">Sắp xếp sản phẩm</span>
                <select value={sort} onChange={event => updateSearch({ sort: event.target.value === 'popular' ? null : event.target.value })}>
                  <option value="popular">Mới nhất</option><option value="low">Giá thấp đến cao (trang này)</option><option value="high">Giá cao đến thấp (trang này)</option>
                </select><ChevronDown size={14} aria-hidden />
              </label>
            </div>
          </div>
          {loading && <p className="shop-state" role="status">Đang tải sản phẩm…</p>}
          {error && <p className="shop-state" role="alert">{error} <button type="button" onClick={() => setRetry(v => v + 1)}>Thử lại</button></p>}
          {products.length ? <div className="shop-grid">{products.map(product => <ProductCard key={product.id} product={product} />)}</div>
            : !loading && !error && <div className="shop-state" role="status">{category ? 'Không có sản phẩm phù hợp với bộ lọc đã chọn.' : 'Chưa có sản phẩm. Vui lòng quay lại sau.'}</div>}
          {result && result.totalPages > 1 && <nav className="shop-pagination" aria-label="Phân trang sản phẩm">
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
