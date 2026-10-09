import { useEffect, useRef, useState, type FormEvent } from 'react'
import { accountApi } from '../api/account'
import { money } from '../api/orders'
import { Copy, Pencil, ChevronDown } from 'lucide-react'
import './ShippingAdminPage.css'

type Province = { provinceCode: number; provinceName: string; overrideFee: number | null; effectiveFee: number }
type Rates = { defaultFee: number; provinces: Province[] }
type FeeFilter = 'all' | 'default' | 'custom'
const normalize = (value: string) => value.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')

function CopyIcon() {
  return <Copy size={18} strokeWidth={1.7} aria-hidden="true" />
}

function ProvinceEditor({ province, busy, save, reset, close }: {
  province: Province; busy: boolean; save: (fee: number) => Promise<void>; reset: () => Promise<void>; close: () => void;
}) {
  const [value, setValue] = useState(String(province.effectiveFee))
  const submit = (event: FormEvent) => { event.preventDefault(); void save(Number(value)) }
  return <form className="shipping-editor" onSubmit={submit}>
    <label htmlFor={`fee-${province.provinceCode}`}>Phí giao hàng — {province.provinceName}</label>
    <div className="shipping-editor__actions">
      <input autoFocus className="shipping-input" id={`fee-${province.provinceCode}`} type="number" min="0" max="9999999999999" step="1" required value={value} disabled={busy} onChange={event => setValue(event.target.value)} />
      <span className="shipping-muted">VNĐ</span>
      <button className="shipping-button shipping-button--primary" disabled={busy} type="submit">{busy ? 'Đang lưu…' : 'Lưu phí'}</button>
      {province.overrideFee !== null && <button className="shipping-button" type="button" disabled={busy} onClick={() => void reset()}>Dùng mặc định</button>}
      <button className="shipping-button" type="button" disabled={busy} onClick={close}>Hủy</button>
    </div>
  </form>
}

export function ShippingAdminPage() {
  const [rates, setRates] = useState<Rates | null>(null)
  const [defaultFee, setDefaultFee] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FeeFilter>('all')
  const [selected, setSelected] = useState<number[]>([])
  const [editing, setEditing] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reload, setReload] = useState(0)
  const selectAll = useRef<HTMLInputElement>(null)
  const editButtons = useRef(new Map<number, HTMLButtonElement>())
  const mutating = useRef(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    accountApi<Rates>('/api/admin/shipping').then(result => {
      if (active) { setRates(result); setDefaultFee(String(result.defaultFee)); setError('') }
    }).catch((cause: Error) => { if (active) setError(cause.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [reload])

  const rows = rates?.provinces.filter(row => normalize(row.provinceName).includes(normalize(query.trim()))
    && (filter === 'all' || (filter === 'default' ? row.overrideFee === null : row.overrideFee !== null))) ?? []
  const allSelected = rows.length > 0 && rows.every(row => selected.includes(row.provinceCode))
  const someSelected = rows.some(row => selected.includes(row.provinceCode))
  useEffect(() => { if (selectAll.current) selectAll.current.indeterminate = someSelected && !allSelected }, [someSelected, allSelected])

  const closeEditor = (code: number) => {
    setEditing(null)
    editButtons.current.get(code)?.focus()
  }
  const mutate = async (code: number, fee?: number) => {
    if (mutating.current) return
    mutating.current = true
    setBusy(true); setNotice(''); setError('')
    try {
      await accountApi(`/api/admin/shipping/${code}`, fee === undefined ? 'DELETE' : 'PATCH', fee === undefined ? undefined : { fee })
      const result = await accountApi<Rates>('/api/admin/shipping')
      setRates(result)
      if (code === 0) setDefaultFee(String(result.defaultFee))
      else closeEditor(code)
      setNotice('Đã cập nhật phí giao hàng. Đơn đã tạo giữ nguyên phí cũ.')
    } catch (cause) { setError((cause as Error).message) }
    finally { setBusy(false); mutating.current = false }
  }
  const copy = async (text: string, message: string) => {
    setNotice('')
    try { await navigator.clipboard.writeText(text); setNotice(message) }
    catch { setError('Không thể sao chép. Vui lòng kiểm tra quyền truy cập bộ nhớ tạm của trình duyệt.') }
  }
  const toggleAll = () => setSelected(current => allSelected
    ? current.filter(code => !rows.some(row => row.provinceCode === code))
    : [...new Set([...current, ...rows.map(row => row.provinceCode)])])

  return <section className="shipping-page" aria-labelledby="shipping-title">
    <header className="shipping-header">
      <div><h1 id="shipping-title">Quản lý phí giao hàng</h1><p className="shipping-muted">Thiết lập phí theo tỉnh/thành phố</p></div>
      <span className="shipping-admin-badge">Admin</span>
    </header>

    {error && <div className="admin-alert shipping-feedback" role="alert">{error} <button className="shipping-button" type="button" disabled={busy || loading} onClick={() => setReload(value => value + 1)}>Thử tải lại</button></div>}
    {notice && <p className="shipping-notice shipping-feedback" role="status">{notice}</p>}
    {loading && <p className="shipping-empty" role="status">Đang tải cấu hình phí giao hàng…</p>}

    {rates && <>
      <form className="shipping-default" onSubmit={event => { event.preventDefault(); void mutate(0, Number(defaultFee)) }}>
        <label htmlFor="fee-0">Phí vận chuyển mặc định</label>
        <div className="shipping-default__actions">
          <input className="shipping-input" id="fee-0" type="number" min="0" max="9999999999999" step="1" required value={defaultFee} disabled={busy || loading} onChange={event => setDefaultFee(event.target.value)} aria-describedby="shipping-default-help" />
          {defaultFee !== String(rates.defaultFee) && <button className="shipping-button shipping-button--primary" type="submit" disabled={busy || loading}>{busy ? 'Đang lưu…' : 'Lưu phí'}</button>}
          <button className="shipping-button shipping-button--primary" type="button" disabled={!defaultFee || busy || loading} onClick={() => void copy(defaultFee, 'Đã sao chép phí vận chuyển mặc định.')}><CopyIcon />Sao chép</button>
        </div>
        <p id="shipping-default-help" className="shipping-muted">Áp dụng cho các tỉnh/thành chưa thiết lập phí riêng.</p>
      </form>

      <div className="shipping-list-panel">
      <div className="shipping-list-heading"><h2>Danh sách tỉnh/thành</h2><span className="shipping-muted">{rows.length === rates.provinces.length ? rows.length : `${rows.length}/${rates.provinces.length}`} khu vực</span></div>
      <div className="shipping-filters">
        <input className="shipping-input" type="search" aria-label="Tìm tỉnh/thành" placeholder="Tìm tỉnh/thành…" value={query} onChange={event => setQuery(event.target.value)} />
        <div className="shipping-select"><select className="shipping-input" aria-label="Lọc theo loại phí" value={filter} onChange={event => setFilter(event.target.value as FeeFilter)}><option value="all">Tất cả</option><option value="default">Phí mặc định</option><option value="custom">Phí riêng</option></select><ChevronDown size={18} strokeWidth={1.7} aria-hidden="true" /></div>
      </div>

      {selected.length > 0 && <div className="shipping-selection"><span>Đã chọn {selected.length} khu vực</span><div><button className="shipping-button" type="button" onClick={() => void copy(rates.provinces.filter(row => selected.includes(row.provinceCode)).map(row => `${row.provinceName}\t${money(row.effectiveFee)}`).join('\n'), 'Đã sao chép danh sách phí các khu vực đã chọn.')}><CopyIcon />Sao chép danh sách</button><button className="shipping-button" type="button" onClick={() => setSelected([])}>Bỏ chọn</button></div></div>}

      <div className="shipping-table-wrap">
        <table className="shipping-table">
          <thead><tr><th className="shipping-check-cell"><input ref={selectAll} className="shipping-checkbox" type="checkbox" aria-label="Chọn tất cả khu vực đang hiển thị" checked={allSelected} disabled={!rows.length} onChange={toggleAll} /></th><th scope="col">Tỉnh/thành</th><th scope="col">Phí (VNĐ)</th><th scope="col" className="shipping-action-cell">Thao tác</th></tr></thead>
          {rows.map(row => <tbody key={row.provinceCode}>
            <tr className={selected.includes(row.provinceCode) ? 'shipping-row--selected' : undefined}>
              <td className="shipping-check-cell"><input className="shipping-checkbox" type="checkbox" aria-label={`Chọn ${row.provinceName}`} checked={selected.includes(row.provinceCode)} onChange={() => setSelected(current => current.includes(row.provinceCode) ? current.filter(code => code !== row.provinceCode) : [...current, row.provinceCode])} /></td>
              <th scope="row"><span className="shipping-province-name">{row.provinceName}</span><span className="shipping-fee-type">{row.overrideFee === null ? 'Mặc định' : 'Phí riêng'}</span></th>
              <td className="shipping-fee">{money(row.effectiveFee)}</td>
              <td className="shipping-action-cell"><button ref={element => { if (element) editButtons.current.set(row.provinceCode, element); else editButtons.current.delete(row.provinceCode) }} className="shipping-edit" type="button" aria-label={`Sửa phí ${row.provinceName}`} aria-expanded={editing === row.provinceCode} aria-controls={editing === row.provinceCode ? `editor-${row.provinceCode}` : undefined} disabled={busy || loading} onClick={() => setEditing(current => current === row.provinceCode ? null : row.provinceCode)}><Pencil size={18} strokeWidth={1.7} aria-hidden="true" /></button></td>
            </tr>
            {editing === row.provinceCode && <tr><td colSpan={4} id={`editor-${row.provinceCode}`}><ProvinceEditor province={row} busy={busy || loading} save={fee => mutate(row.provinceCode, fee)} reset={() => mutate(row.provinceCode)} close={() => closeEditor(row.provinceCode)} /></td></tr>}
          </tbody>)}
          {!rows.length && <tbody><tr><td colSpan={4} className="shipping-empty">Không tìm thấy tỉnh/thành phù hợp.</td></tr></tbody>}
        </table>
      </div>
      <p className="shipping-footer shipping-muted">Phí được áp dụng theo tỉnh/thành của địa chỉ nhận hàng.</p>
      </div>
    </>}
  </section>
}
