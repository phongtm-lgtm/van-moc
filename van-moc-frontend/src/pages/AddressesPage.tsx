import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/catalog'
import { accountApi, type Address } from '../api/account'

type Location = { code: number; name: string }
const EMPTY = { label: '', recipientName: '', phone: '', wardCode: 0, addressLine: '', isDefault: false }
export function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [provinces, setProvinces] = useState<Location[]>([])
  const [wards, setWards] = useState<Location[]>([])
  const [province, setProvince] = useState(0)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    let active = true
    Promise.all([accountApi<Address[]>('/api/addresses'), api<Location[]>('/api/provinces')])
      .then(([rows, locations]) => { if (active) { setAddresses(rows); setProvinces(locations) } })
      .catch((cause: Error) => { if (active) setError(cause.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    if (province) api<Location[]>(`/api/provinces/${province}/wards`, controller.signal).then(setWards)
      .catch((cause: Error) => { if (!controller.signal.aborted) setError(cause.message) })
    return () => controller.abort()
  }, [province])
  const save = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('')
    try {
      await accountApi(`/api/addresses${editing ? `/${editing}` : ''}`, editing ? 'PATCH' : 'POST', form)
      setAddresses(await accountApi<Address[]>('/api/addresses')); setEditing(null); setForm(EMPTY); setProvince(0); setWards([])
    } catch (cause) { setError((cause as Error).message) } finally { setBusy(false) }
  }
  return <section className="container mx-auto px-6 py-24"><h1>Địa chỉ nhận hàng</h1><Link to="/account">Hồ sơ</Link>
    {loading && <p role="status">Đang tải địa chỉ…</p>}{error && <p role="alert">{error} <Link to="/login">Đăng nhập</Link></p>}
    {addresses.map(address => <article key={address.id} className="order-card"><h2>{address.recipientName} {address.isDefault && '(Mặc định)'}</h2>
      <p>{address.phone} · {address.addressLine}, {address.wardName}, {address.provinceName}</p>
      <button type="button" disabled={busy} onClick={() => { setEditing(address.id); setProvince(address.provinceCode); setForm({ label: address.label || '', recipientName: address.recipientName, phone: address.phone, wardCode: address.wardCode, addressLine: address.addressLine, isDefault: address.isDefault }) }}>Sửa</button>
      <button type="button" disabled={busy} onClick={async () => { setBusy(true); try { await accountApi(`/api/addresses/${address.id}`, 'DELETE'); setAddresses(await accountApi<Address[]>('/api/addresses')) } catch (cause) { setError((cause as Error).message) } finally { setBusy(false) } }}>Xóa</button>
    </article>)}
    <form onSubmit={save}><h2>{editing ? 'Sửa địa chỉ' : 'Thêm địa chỉ'}</h2>
      <label>Nhãn<input value={form.label} maxLength={255} onChange={e => setForm({ ...form, label: e.target.value })} /></label>
      <label>Người nhận<input required maxLength={255} value={form.recipientName} onChange={e => setForm({ ...form, recipientName: e.target.value })} /></label>
      <label>Điện thoại<input required value={form.phone} maxLength={20} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
      <label>Tỉnh/thành<select required value={province || ''} onChange={e => { setProvince(Number(e.target.value)); setWards([]); setForm({ ...form, wardCode: 0 }) }}><option value="">Chọn tỉnh</option>{provinces.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label>
      <label>Phường/xã<select required value={form.wardCode || ''} onChange={e => setForm({ ...form, wardCode: Number(e.target.value) })}><option value="">Chọn phường/xã</option>{wards.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label>
      <label>Số nhà, đường<input required maxLength={2000} value={form.addressLine} onChange={e => setForm({ ...form, addressLine: e.target.value })} /></label>
      <label><input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} />Địa chỉ mặc định</label>
      <button disabled={busy || loading || !form.wardCode} type="submit">Lưu địa chỉ</button>
      {editing && <button type="button" onClick={() => { setEditing(null); setForm(EMPTY); setProvince(0); setWards([]) }}>Hủy sửa</button>}
    </form>
  </section>
}
