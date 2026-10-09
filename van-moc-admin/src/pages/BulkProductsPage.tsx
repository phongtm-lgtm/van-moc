import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { accountApi, ApiError } from '@/api/account'
import { type Page, type Product } from '@/api/products'
import { bulkRowError, newBulkRow, productSlug, type BulkRow } from '@/utils/bulkProducts'
import Button from '@/components/ui/button/Button'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'

const inputClass = 'h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-700 dark:text-white/90 dark:disabled:bg-gray-800'

export default function BulkProductsPage() {
  const [rows, setRows] = useState<BulkRow[]>(() => [newBulkRow(), newBulkRow(), newBulkRow()])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [defaultCategory, setDefaultCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reload, setReload] = useState(0)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const saving = useRef(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    accountApi<{ id: string; name: string }[]>('/api/categories').then(data => {
      if (!alive) return
      setCategories(data)
      setDefaultCategory(data[0]?.id ?? '')
      setRows(current => current.map(row => ({ ...row, form: { ...row.form, categoryId: row.form.categoryId || data[0]?.id || '' } })))
      setLoadError('')
    }).catch((error: Error) => { if (alive) setLoadError(error.message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [reload])

  const patchRow = (key: string, patch: Partial<BulkRow>) => setRows(current => current.map(row => row.key === key ? { ...row, ...patch } : row))
  const edit = (row: BulkRow, key: keyof BulkRow['form'], value: string | boolean) => {
    patchRow(row.key, {
      form: { ...row.form, [key]: value, ...(key === 'name' && row.autoSlug ? { slug: productSlug(String(value)) } : {}) },
      ...(key === 'slug' ? { autoSlug: false } : {}), status: 'draft', error: '',
    })
    setNotice('')
  }
  const pending = rows.filter(row => row.status === 'draft' || row.status === 'error')
  const savedCount = rows.filter(row => row.status === 'saved').length

  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (saving.current || loading || loadError || !categories.length || !pending.length) return
    const errors = new Map(pending.map(row => [row.key, bulkRowError(row, rows)]))
    if ([...errors.values()].some(Boolean)) {
      setRows(current => current.map(row => errors.has(row.key) ? { ...row, status: errors.get(row.key) ? 'error' : 'draft', error: errors.get(row.key) ?? '' } : row))
      setNotice('Kiểm tra các dòng báo lỗi trước khi lưu. Chưa gửi sản phẩm nào trong lần này.')
      return
    }
    saving.current = true
    setBusy(true)
    setNotice('Đang lưu từng sản phẩm…')
    let success = 0
    try {
      for (const row of pending) {
        patchRow(row.key, { status: 'saving', error: '' })
        try {
          const product = await accountApi<Product>('/api/admin/products', 'POST', {
            ...row.form, name: row.form.name.trim(), code: row.form.code.trim(), material: row.form.material.trim(), price: Number(row.price),
          })
          patchRow(row.key, { status: 'saved', productId: product.id })
          success++
        } catch (error) {
          const uncertain = !(error instanceof ApiError) || error.status >= 500
          patchRow(row.key, { status: uncertain ? 'uncertain' : 'error', error: uncertain
            ? 'Chưa xác định được kết quả lưu. Bấm “Kiểm tra kết quả” trước khi thử lại.'
            : (error as Error).message })
          if (uncertain || (error instanceof ApiError && [401, 403].includes(error.status))) break
        }
      }
      setNotice(`Đã lưu ${success}/${pending.length} sản phẩm trong lần này. Các dòng đã lưu sẽ không được gửi lại.`)
    } finally {
      saving.current = false
      setBusy(false)
    }
  }

  const verify = async (row: BulkRow) => {
    if (saving.current) return
    saving.current = true
    setBusy(true)
    try {
      let match: Product | undefined
      let page = 0
      let totalPages = 1
      while (!match && page < totalPages) {
        const result = await accountApi<Page<Product>>(`/api/admin/products?search=${encodeURIComponent(row.form.code.trim())}&page=${page}`)
        match = result.content.find(product => product.details.code === row.form.code.trim() && product.details.slug === row.form.slug)
        totalPages = result.totalPages
        page++
      }
      patchRow(row.key, match
        ? { status: 'saved', productId: match.id, error: '' }
        : { status: 'error', error: 'Chưa tìm thấy sản phẩm với mã và slug này. Bạn có thể lưu lại dòng này.' })
    } catch (error) {
      patchRow(row.key, { error: `Chưa kiểm tra được kết quả. ${(error as Error).message}` })
    } finally {
      saving.current = false
      setBusy(false)
    }
  }

  return <section className="min-w-0 space-y-6 text-gray-700 dark:text-gray-300">
    <PageBreadcrumb pageTitle="Thêm nhiều sản phẩm" />
    <Link className="text-sm text-brand-500" to="/products">← Danh sách sản phẩm</Link>
    <ComponentCard title="Nhập sản phẩm theo bảng" desc="Mỗi dòng là một sản phẩm. Nhập tên để tự tạo slug, dùng Nhân bản để giữ danh mục, chất liệu và giá cho dòng tiếp theo.">
      {loading ? <p role="status">Đang tải danh mục…</p> : loadError ? <p className="admin-alert" role="alert">{loadError} <Button type="button" onClick={() => setReload(value => value + 1)}>Thử lại</Button></p> : !categories.length ? <p role="alert">Chưa có danh mục để thêm sản phẩm.</p> : <form onSubmit={event => void save(event)} noValidate className="space-y-5">
        <div className="flex flex-wrap items-end gap-3">
          <label className="space-y-2 text-sm font-medium">Danh mục cho dòng mới
            <select className={`${inputClass} block sm:w-60`} value={defaultCategory} disabled={busy} onChange={event => setDefaultCategory(event.target.value)}>
              {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <Button type="button" variant="outline" disabled={busy} onClick={() => setRows(current => [...current, newBulkRow(defaultCategory)])}>+ Thêm dòng</Button>
          <Button type="button" variant="outline" disabled={busy} onClick={() => setRows(current => [...current, ...Array.from({ length: 5 }, () => newBulkRow(defaultCategory))])}>+ 5 dòng</Button>
        </div>
        <p className="text-sm text-gray-500">Các trường có * là bắt buộc. Sản phẩm mới có tồn kho 0; sau khi lưu, bấm “Ảnh / tồn / chi tiết” để thêm ảnh, nhập kho hoặc cấu hình khắc.</p>
        <div className="max-w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-400"><tr>
              {['#', 'Tên sản phẩm * / Slug', 'Mã sản phẩm *', 'Danh mục *', 'Chất liệu *', 'Giá (VND) *', 'Đang bán', 'Thao tác / Kết quả'].map(title => <th key={title} scope="col" className="px-3 py-4 font-medium">{title}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">{rows.map((row, index) => {
              const locked = busy || row.status === 'saved' || row.status === 'uncertain'
              const label = (name: string) => `${name} dòng ${index + 1}`
              return <tr key={row.key} className={`align-top ${row.status === 'error' || row.status === 'uncertain' ? 'bg-error-50/50 dark:bg-error-500/5' : ''}`}>
                <td className="px-3 py-4 text-gray-500">{index + 1}</td>
                <td className="min-w-60 space-y-2 px-3 py-3">
                  <input className={inputClass} aria-label={label('Tên sản phẩm')} value={row.form.name} maxLength={255} disabled={locked} placeholder="Ví dụ: Lược sừng nhỏ" onChange={event => edit(row, 'name', event.target.value)} />
                  <label className="block text-xs text-gray-500">Slug {row.autoSlug && '(tự động)'}<input className={`${inputClass} mt-1`} aria-label={label('Slug')} value={row.form.slug} maxLength={255} disabled={locked} onChange={event => edit(row, 'slug', event.target.value)} /></label>
                </td>
                <td className="min-w-40 px-3 py-3"><input className={inputClass} aria-label={label('Mã sản phẩm')} value={row.form.code} maxLength={255} disabled={locked} placeholder="LUOC-001" onChange={event => edit(row, 'code', event.target.value)} /></td>
                <td className="min-w-44 px-3 py-3"><select className={inputClass} aria-label={label('Danh mục')} value={row.form.categoryId} disabled={locked} onChange={event => edit(row, 'categoryId', event.target.value)}>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></td>
                <td className="min-w-36 px-3 py-3"><input className={inputClass} aria-label={label('Chất liệu')} value={row.form.material} maxLength={255} disabled={locked} placeholder="Sừng tự nhiên" onChange={event => edit(row, 'material', event.target.value)} /></td>
                <td className="min-w-40 px-3 py-3"><input className={inputClass} aria-label={label('Giá')} type="number" min="0" max="9999999999999" step="1" value={row.price} disabled={locked} placeholder="150000" onChange={event => { patchRow(row.key, { price: event.target.value, status: 'draft', error: '' }); setNotice('') }} /></td>
                <td className="px-3 py-6"><input className="size-5 accent-brand-500" aria-label={label('Đang bán')} type="checkbox" checked={row.form.active} disabled={locked} onChange={event => edit(row, 'active', event.target.checked)} /></td>
                <td className="min-w-56 space-y-3 px-3 py-3">
                  <div className="flex gap-3">
                    <button type="button" className="text-brand-500 disabled:opacity-50" disabled={busy || row.status === 'uncertain'} aria-label={label('Nhân bản')} onClick={() => setRows(current => { const next = [...current]; next.splice(index + 1, 0, newBulkRow(row.form.categoryId, row)); return next })}>Nhân bản</button>
                    {row.status !== 'saved' && <button type="button" className="text-error-500 disabled:opacity-50" disabled={locked || rows.length === 1} aria-label={label('Xóa')} onClick={() => setRows(current => current.filter(item => item.key !== row.key))}>Xóa</button>}
                  </div>
                  {row.status === 'saved' && <div className="space-y-2"><p className="font-medium text-success-600">✓ Đã lưu</p><Link className="text-brand-500 underline" to={`/products/${row.productId}`}>Ảnh / tồn / chi tiết</Link></div>}
                  {row.status === 'saving' && <p role="status">Đang lưu…</p>}
                  {row.error && <p role="alert" className="text-sm text-error-600 dark:text-error-400">{row.error}</p>}
                  {row.status === 'uncertain' && <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void verify(row)}>Kiểm tra kết quả</Button>}
                </td>
              </tr>
            })}</tbody>
          </table>
        </div>
        <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-700 dark:bg-gray-900">
          <div><p className="font-medium">{rows.length} dòng · {savedCount} đã lưu · {pending.length} chờ lưu</p>{notice && <p role="status" className="mt-1 text-sm text-gray-500 dark:text-gray-400">{notice}</p>}</div>
          <Button disabled={busy || !pending.length}>{busy ? 'Đang xử lý…' : `Lưu tất cả (${pending.length})`}</Button>
        </div>
      </form>}
    </ComponentCard>
  </section>
}
