import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowDownToLine, ChevronDown, ChevronLeft, ChevronRight, Copy, EyeOff, FolderOpen, Image, MoreHorizontal, Package, PackageCheck, PackageX, Pencil, Plus, Search, Settings2, Star, Trash2, Warehouse, X } from 'lucide-react'
import { accountApi } from '@/api/account'
import { type Product, type Page } from '@/api/products'
import { money } from '@/api/orders'
import ProductActionMenu from '@/components/products/ProductActionMenu'
import StockDialog from '@/components/products/StockDialog'
import './ProductsPage.css'

const defaultQuery = { search: '', active: '', category: '', empty: false, page: 0 }
const thresholdKey = 'vanmoc.admin.lowStockThreshold'
function readThreshold() {
  try { const value = localStorage.getItem(thresholdKey); const number = Number(value); return value !== null && Number.isInteger(number) && number >= 1 && number <= 1000000 ? number : 10 } catch { return 10 }
}
function Thumbnail({ product }: { product: Product }) {
  const [failedUrl, setFailedUrl] = useState('')
  const source = product.images.filter(image => image.mediaType !== 'VIDEO').sort((a, b) => Number(b.primary) - Number(a.primary) || a.displayOrder - b.displayOrder)[0]?.url
  let url = source
  if (source?.startsWith('/') && import.meta.env.VITE_STOREFRONT_URL) url = new URL(source, import.meta.env.VITE_STOREFRONT_URL).href
  return <span className="products-thumbnail">{url && url !== failedUrl ? <img src={url} alt="" loading="lazy" onError={() => setFailedUrl(url)} /> : <Image size={23} strokeWidth={1.5} aria-label="Chưa có ảnh" />}</span>
}

export default function ProductsPage() {
  const [query, setQuery] = useState(defaultQuery)
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [categoryError, setCategoryError] = useState('')
  const [data, setData] = useState<Page<Product> | null>(null)
  const [metrics, setMetrics] = useState<{ total: number; active: number; empty: number } | null>(null)
  const [metricError, setMetricError] = useState('')
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [refresh, setRefresh] = useState(0)
  const [hiding, setHiding] = useState<string | null>(null)
  const hideLock = useRef(false)
  const [featuring, setFeaturing] = useState<string | null>(null)
  const featureLock = useRef(false)
  const [stockProduct, setStockProduct] = useState<Product | null>(null)
  const [threshold, setThreshold] = useState(readThreshold)
  const [thresholdDraft, setThresholdDraft] = useState(String(threshold))
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [preferenceNotice, setPreferenceNotice] = useState('')
  const filtersActive = !!(query.search || query.active || query.category || query.empty)

  useEffect(() => {
    let alive = true
    accountApi<{ id: string; name: string }[]>('/api/categories').then(result => { if (alive) { setCategories(result); setCategoryError('') } }).catch((cause: Error) => { if (alive) setCategoryError(cause.message) })
    return () => { alive = false }
  }, [refresh])
  useEffect(() => {
    let alive = true
    setMetricsLoading(true)
    Promise.all(['', '&active=true', '&empty=true'].map(filter => accountApi<Page<Product>>(`/api/admin/products?page=0${filter}`)))
      .then(([total, active, empty]) => { if (alive) { setMetrics({ total: total.totalElements, active: active.totalElements, empty: empty.totalElements }); setMetricError('') } })
      .catch((cause: Error) => { if (alive) { setMetrics(null); setMetricError(cause.message) } })
      .finally(() => { if (alive) setMetricsLoading(false) })
    return () => { alive = false }
  }, [refresh])
  useEffect(() => {
    let alive = true
    setLoading(true); setError('')
    const params = new URLSearchParams({ search: query.search, page: String(query.page), empty: String(query.empty) })
    if (query.active) params.set('active', query.active)
    if (query.category) params.set('category', query.category)
    accountApi<Page<Product>>(`/api/admin/products?${params}`).then(result => {
      if (!alive) return
      if (query.page > 0 && query.page >= result.totalPages) { setQuery(current => ({ ...current, page: Math.max(0, result.totalPages - 1) })); return }
      setData(result)
    }).catch((cause: Error) => { if (alive) setError(cause.message) }).finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [query, refresh])
  const update = (values: Partial<typeof query>) => { setLoading(true); setQuery(current => ({ ...current, page: 0, ...values })) }
  const clear = () => { setSearch(''); update(defaultQuery) }
  const reload = () => { setLoading(true); setRefresh(value => value + 1) }
  const hide = async (product: Product) => {
    if (hideLock.current || featureLock.current) return
    hideLock.current = true; setHiding(product.id); setActionError(''); setNotice('')
    try {
      await accountApi(`/api/admin/products/${product.id}`, 'PATCH', { ...product.details, active: false })
      setNotice(`Đã ẩn “${product.details.name}” khỏi cửa hàng.`); reload()
    } catch (cause) { setActionError((cause as Error).message) }
    finally { hideLock.current = false; setHiding(null) }
  }
  const toggleFeatured = async (product: Product) => {
    if (featureLock.current || hideLock.current) return
    featureLock.current = true; setFeaturing(product.id); setActionError(''); setNotice('')
    try {
      await accountApi(`/api/admin/products/${product.id}`, 'PATCH', {
        ...product.details, featured: !product.details.featured,
      })
      setNotice(`Đã ${product.details.featured ? 'bỏ' : 'chọn'} “${product.details.name}” ${product.details.featured ? 'khỏi' : 'làm sản phẩm nổi bật trên'} trang chủ.`)
    } catch (cause) { setActionError(`${(cause as Error).message} Danh sách đã được tải lại; vui lòng thử lại nếu cần.`) }
    finally { featureLock.current = false; setFeaturing(null); reload() }
  }
  const remove = async (product: Product) => {
    if (hideLock.current || featureLock.current || !window.confirm(`Xóa vĩnh viễn “${product.details.name}”? Sản phẩm sẽ biến mất khỏi cửa hàng và danh sách quản trị. Không thể hoàn tác.`)) return
    hideLock.current = true; setHiding(product.id); setActionError(''); setNotice('')
    try {
      await accountApi(`/api/admin/products/${product.id}?version=${product.details.version}`, 'DELETE')
      setNotice(`Đã xóa vĩnh viễn “${product.details.name}”.`); reload()
    } catch (cause) { setActionError((cause as Error).message) }
    finally { hideLock.current = false; setHiding(null) }
  }
  const start = data?.totalElements ? query.page * 20 + 1 : 0
  const end = data ? query.page * 20 + data.content.length : 0

  return <section className="products-page">
    <header className="products-page-heading"><div><h1>Sản phẩm</h1><p>Quản lý danh mục, giá bán và tồn kho của cửa hàng.</p></div><div className="products-page-actions">
       <ProductActionMenu label="Thao tác sản phẩm" className="products-button" trigger={<>Thao tác khác <ChevronDown size={17} /></>} items={[{ label: 'Thêm nhiều sản phẩm', icon: <ArrowDownToLine size={18} />, to: '/products/bulk' }, { label: 'Quản lý danh mục', icon: <FolderOpen size={18} />, to: '/products/categories' }, { label: 'Quản lý font khắc', icon: <Pencil size={18} />, to: '/products/engraving-fonts' }]} />
      <Link className="products-button is-primary" to="/products/new"><Plus size={19} />Thêm sản phẩm</Link>
    </div></header>

    <div className="products-metrics" aria-label="Tổng quan toàn bộ sản phẩm" aria-busy={metricsLoading}>{[
      { key: 'total' as const, label: 'Tổng sản phẩm', icon: Package },
      { key: 'active' as const, label: 'Đang bán', icon: PackageCheck },
      { key: 'empty' as const, label: 'Hết hàng', icon: PackageX },
    ].map(({ key, label, icon: Icon }) => <div className="products-metric" key={key}><span className={`products-metric-icon is-${key}`}><Icon size={21} strokeWidth={1.7} /></span><div><span>{label}</span>{metricsLoading ? <span className="products-skeleton products-metric-skeleton" /> : <strong>{metrics ? metrics[key].toLocaleString('vi-VN') : '—'}</strong>}</div></div>)}</div>
    {metricError && <div className="products-inline-error" role="alert">Không tải được tổng quan. {metricError} <button type="button" onClick={reload}>Thử lại</button></div>}
    {notice && <div className="products-feedback is-success" role="status">{notice}<button type="button" aria-label="Đóng thông báo" onClick={() => setNotice('')}><X size={18} /></button></div>}
    {actionError && <div className="products-feedback is-error" role="alert"><AlertCircle size={20} /><span>{actionError}</span><button type="button" onClick={() => { setActionError(''); reload() }}>Tải lại dữ liệu</button></div>}

    <div className="products-table-panel">
      <form className="products-toolbar" role="search" aria-label="Lọc sản phẩm" onSubmit={event => { event.preventDefault(); update({ search: search.trim() }) }}>
        <div className="products-search"><Search size={19} /><input aria-label="Tìm theo tên hoặc SKU" type="search" placeholder="Tìm tên hoặc SKU…" value={search} onChange={event => setSearch(event.target.value)} /><button type="submit" aria-label="Tìm kiếm">Tìm</button></div>
        <select aria-label="Lọc danh mục" value={query.category} onChange={event => update({ category: event.target.value })}><option value="">Tất cả danh mục</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        <select aria-label="Lọc trạng thái" value={query.active} onChange={event => update({ active: event.target.value })}><option value="">Tất cả trạng thái</option><option value="true">Đang bán</option><option value="false">Đã ẩn / chưa bán</option></select>
        <select aria-label="Lọc tồn kho" value={query.empty ? 'empty' : ''} onChange={event => update({ empty: event.target.value === 'empty' })}><option value="">Tất cả tồn kho</option><option value="empty">Hết hàng</option></select>
        <button type="button" className={`products-icon-button${settingsOpen ? ' is-selected' : ''}`} aria-label="Cài đặt cảnh báo tồn kho" title="Cài đặt cảnh báo tồn kho" aria-expanded={settingsOpen} aria-controls="stock-warning-settings" onClick={() => setSettingsOpen(value => !value)}><Settings2 size={19} /></button>
      </form>
      {categoryError && <div className="products-inline-error" role="alert">Không tải được danh mục. <button type="button" onClick={reload}>Thử lại</button></div>}
      {settingsOpen && <form id="stock-warning-settings" className="products-settings" onSubmit={event => { event.preventDefault(); const value = Number(thresholdDraft); if (!Number.isInteger(value) || value < 1 || value > 1000000) return; setThreshold(value); try { localStorage.setItem(thresholdKey, String(value)); setPreferenceNotice('Đã lưu ngưỡng cảnh báo trên trình duyệt này.') } catch { setPreferenceNotice('Đã áp dụng ngưỡng cho phiên hiện tại; trình duyệt không cho lưu tùy chọn.') } }}><label>Cảnh báo khi tồn kho dưới<input aria-label="Ngưỡng cảnh báo tồn kho" type="number" min="1" max="1000000" step="1" required value={thresholdDraft} onChange={event => setThresholdDraft(event.target.value)} />sản phẩm</label><button className="products-button">Áp dụng</button>{preferenceNotice && <span role="status">{preferenceNotice}</span>}</form>}
      {filtersActive && <div className="products-filter-summary"><span>{loading ? 'Đang lọc sản phẩm…' : error ? 'Đang áp dụng bộ lọc' : `${data?.totalElements.toLocaleString('vi-VN') ?? 0} sản phẩm phù hợp`}{query.search && <> · “{query.search}”</>}</span><button type="button" onClick={clear}><X size={15} />Xóa bộ lọc</button></div>}

      {error ? <div className="products-empty" role="alert"><AlertCircle size={32} /><h2>Chưa tải được sản phẩm</h2><p>{error}</p><button className="products-button" onClick={reload}>Thử lại</button></div> : <>
        <div className="products-table-scroll" tabIndex={0} role="region" aria-label="Danh sách sản phẩm, cuộn ngang để xem đầy đủ"><table className="products-table" aria-busy={loading}><caption className="products-sr-only">Danh sách sản phẩm với giá bán, tồn kho, trạng thái và sản phẩm nổi bật</caption><thead><tr><th scope="col">Sản phẩm</th><th scope="col">SKU</th><th scope="col" className="is-number">Giá bán</th><th scope="col">Tồn kho</th><th scope="col">Trạng thái</th><th scope="col">Trang chủ</th><th scope="col"><span className="products-sr-only">Thao tác</span></th></tr></thead><tbody>
          {loading ? Array.from({ length: 6 }, (_, index) => <tr key={index} aria-hidden="true"><td><div className="products-name-cell"><span className="products-skeleton products-thumb-skeleton" /><div className="products-skeleton-lines"><span className="products-skeleton" /><span className="products-skeleton" /></div></div></td>{Array.from({ length: 6 }, (_, cell) => <td key={cell}><span className="products-skeleton products-cell-skeleton" /></td>)}</tr>) : data?.content.map(product => <tr key={product.id}>
            <td><div className="products-name-cell"><Thumbnail product={product} /><div><Link className="products-name" to={`/products/${product.id}`}>{product.details.name}</Link><span className="products-category-name">{categories.find(category => category.id === product.details.categoryId)?.name || product.details.material}</span></div></div></td>
            <td><span className="products-sku">{product.details.code}</span></td><td className="is-number products-price">{money(product.details.price)}</td>
            <td><div className="products-stock-cell"><strong>{product.stock.toLocaleString('vi-VN')}</strong>{product.stock === 0 ? <span className="products-stock-label is-empty">Hết hàng</span> : product.stock < threshold ? <span className="products-stock-label is-low"><AlertCircle size={14} />Sắp hết</span> : <span className="products-stock-label">Còn hàng</span>}</div></td>
             <td><span className={`products-status${product.details.active ? ' is-active' : ''}`}><span />{product.details.active ? 'Đang bán' : 'Đã ẩn'}</span></td>
             <td><button type="button" className={`products-feature-button${product.details.featured ? ' is-featured' : ''}`} aria-label={`${product.details.featured ? 'Bỏ nổi bật' : 'Chọn nổi bật'}: ${product.details.name}`} aria-pressed={product.details.featured} title={!product.details.active ? 'Sản phẩm đang ẩn sẽ không xuất hiện trên trang chủ' : undefined} disabled={!!featuring || !!hiding || loading} onClick={() => void toggleFeatured(product)}><Star size={16} fill={product.details.featured ? 'currentColor' : 'none'} />{featuring === product.id ? 'Đang lưu…' : product.details.featured ? 'Nổi bật' : 'Chọn'}</button></td>
            <td className="products-row-actions">{hiding === product.id ? <span role="status">Đang ẩn…</span> : <ProductActionMenu label={`Thao tác cho ${product.details.name}`} className="products-icon-button products-more-button" trigger={<MoreHorizontal size={21} />} items={[
              { label: 'Chỉnh sửa', icon: <Pencil size={17} />, to: `/products/${product.id}` },
               { label: 'Cập nhật tồn kho', icon: <Warehouse size={17} />, onClick: () => setStockProduct(product) },
              { label: 'Sao chép', icon: <Copy size={17} />, to: `/products/new?copy=${product.id}` },
                { label: product.details.active ? 'Ẩn sản phẩm' : 'Sản phẩm đã ẩn', icon: <EyeOff size={17} />, onClick: () => void hide(product), disabled: !product.details.active || !!hiding || !!featuring, danger: true },
                { label: 'Xóa vĩnh viễn', icon: <Trash2 size={17} />, onClick: () => void remove(product), disabled: !!hiding || !!featuring, danger: true },
            ]} />}</td>
          </tr>)}
        </tbody></table></div>
        {loading && <span className="products-sr-only" role="status">Đang tải sản phẩm…</span>}
        {!loading && !data?.content.length && <div className="products-empty"><Package size={36} strokeWidth={1.4} /><h2>{filtersActive ? 'Không tìm thấy sản phẩm phù hợp' : 'Bắt đầu với sản phẩm đầu tiên'}</h2><p>{filtersActive ? 'Thử tên hoặc SKU khác, hoặc xóa bộ lọc để xem tất cả sản phẩm.' : 'Thêm sản phẩm để quản lý giá bán, hình ảnh và tồn kho tại đây.'}</p>{filtersActive ? <button type="button" className="products-button" onClick={clear}>Xóa bộ lọc</button> : <Link className="products-button is-primary" to="/products/new"><Plus size={18} />Thêm sản phẩm</Link>}</div>}
        <footer className="products-pagination"><span>{loading ? 'Đang tải…' : `${start}–${end} trên ${(data?.totalElements ?? 0).toLocaleString('vi-VN')} sản phẩm`}</span><div><button type="button" className="products-icon-button" aria-label="Trang trước" disabled={loading || !query.page} onClick={() => update({ page: query.page - 1 })}><ChevronLeft size={19} /></button><span>Trang {query.page + 1} / {Math.max(1, data?.totalPages ?? 0)}</span><button type="button" className="products-icon-button" aria-label="Trang sau" disabled={loading || query.page + 1 >= (data?.totalPages ?? 0)} onClick={() => update({ page: query.page + 1 })}><ChevronRight size={19} /></button></div></footer>
      </>}
    </div>
    {stockProduct && <StockDialog product={stockProduct} onClose={() => setStockProduct(null)} onSaved={() => { setNotice(`Đã cập nhật tồn kho cho “${stockProduct.details.name}”.`); reload() }} />}
  </section>
}
