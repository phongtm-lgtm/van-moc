import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { FolderOpen, Plus, Trash2 } from 'lucide-react'
import { accountApi } from '@/api/account'
import { productSlug } from '@/utils/bulkProducts'
import './CategoriesPage.css'

type Category = { id: string; name: string; slug: string; displayOrder: number }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [autoSlug, setAutoSlug] = useState(true)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let alive = true
    accountApi<Category[]>('/api/admin/categories').then(items => { if (alive) { setCategories(items); setError('') } })
      .catch((cause: Error) => { if (alive) setError(cause.message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [reload])

  const create = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    setBusy(true); setError(''); setNotice('')
    try {
      const created = await accountApi<Category>('/api/admin/categories', 'POST', { name: name.trim(), slug })
      setCategories(items => [...items, created].sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name)))
      setName(''); setSlug(''); setAutoSlug(true); setNotice(`Đã thêm danh mục “${created.name}”.`)
    } catch (cause) { setError((cause as Error).message) }
    finally { setBusy(false) }
  }

  const remove = async (category: Category) => {
    if (busy || !window.confirm(`Xóa danh mục “${category.name}”? Danh mục đang có sản phẩm sẽ không thể xóa.`)) return
    setBusy(true); setError(''); setNotice('')
    try {
      await accountApi(`/api/admin/categories/${category.id}`, 'DELETE')
      setCategories(items => items.filter(item => item.id !== category.id))
      setNotice(`Đã xóa danh mục “${category.name}”.`)
    } catch (cause) { setError((cause as Error).message) }
    finally { setBusy(false) }
  }

  return <section className="categories-page">
    <header className="categories-heading"><div><h1>Danh mục sản phẩm</h1><p>Thêm danh mục mới và quản lý danh mục đang sử dụng.</p></div><Link to="/products">← Quay lại sản phẩm</Link></header>
    {error && <div className="categories-feedback is-error" role="alert">{error}<button type="button" onClick={() => { setLoading(true); setReload(value => value + 1) }}>Tải lại</button></div>}
    {notice && <p className="categories-feedback is-success" role="status">{notice}</p>}
    <div className="categories-grid">
      <div className="categories-card"><h2>Thêm danh mục</h2><p>Tạo tên và đường dẫn để sản phẩm xuất hiện ở cửa hàng.</p><form onSubmit={event => void create(event)}>
        <label>Tên danh mục *<input required maxLength={255} value={name} placeholder="VD: Lược sừng" onChange={event => { setName(event.target.value); if (autoSlug) setSlug(productSlug(event.target.value)) }} /></label>
        <label>Đường dẫn (slug) *<input required maxLength={255} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={slug} placeholder="luoc-sung" onChange={event => { setSlug(event.target.value); setAutoSlug(false) }} /></label>
        {!autoSlug && <button type="button" className="categories-text-button" onClick={() => { setAutoSlug(true); setSlug(productSlug(name)) }}>Tạo lại slug từ tên</button>}
        <button type="submit" className="categories-primary" disabled={busy || !name.trim() || !slug}><Plus size={18} />{busy ? 'Đang xử lý…' : 'Thêm danh mục'}</button>
      </form></div>
      <div className="categories-card"><h2>Danh mục hiện có</h2><p>Chỉ có thể xóa danh mục chưa có sản phẩm.</p>{loading ? <p role="status">Đang tải danh mục…</p> : !categories.length ? <div className="categories-empty"><FolderOpen size={32} /><span>Chưa có danh mục nào.</span></div> : <ul className="categories-list">{categories.map(category => <li key={category.id}><div><strong>{category.name}</strong><span>/{category.slug}</span></div><button type="button" aria-label={`Xóa danh mục ${category.name}`} title="Xóa danh mục" disabled={busy} onClick={() => void remove(category)}><Trash2 size={19} /></button></li>)}</ul>}</div>
    </div>
  </section>
}
