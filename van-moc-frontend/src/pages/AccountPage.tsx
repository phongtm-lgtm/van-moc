import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { X } from 'lucide-react'
import { api, API_BASE, ApiError } from '../api/catalog'
import { accountApi, type Address, type Me } from '../api/account'
import { AccountLayout } from '../components/AccountLayout'

export function LoginPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const closeButton = useRef<HTMLButtonElement>(null)
  const from = (location.state as { from?: string } | null)?.from
  const close = () => {
    if (from === '/checkout') sessionStorage.removeItem('vanmoc.oauth.return')
    navigate(from && from !== '/login' ? from : '/')
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeButton.current?.click()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return <div className="login-overlay" onMouseDown={event => { if (event.target === event.currentTarget) close() }}>
    <section className="login-dialog" role="dialog" aria-modal="true" aria-labelledby="login-heading">
      <button ref={closeButton} className="login-dialog__close" type="button" onClick={close} aria-label="Đóng cửa sổ đăng nhập"><X size={25} strokeWidth={1.3} /></button>
      <div className="login-dialog__leaves login-dialog__leaves--top" aria-hidden="true" />
      <div className="login-dialog__leaves login-dialog__leaves--bottom" aria-hidden="true" />
      <img className="login-dialog__logo" src="/assets/van-moc-logo-dark.png" alt="Vân Mộc" />
      <div className="login-dialog__rule" aria-hidden="true" />
      <h1 id="login-heading">Đăng nhập</h1>
      {params.get('error') && <p className="login-dialog__error" role="alert">Đăng nhập chưa thành công. Vui lòng thử lại.</p>}
      <a className="login-dialog__google" href={`${API_BASE}/oauth2/authorization/google`}>
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.23c0-.67-.06-1.31-.17-1.92H12v3.64h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.7 2.91-4.2 2.91-7.1Z"/><path fill="#34A853" d="M12 21.5c2.62 0 4.82-.87 6.44-2.17l-3.14-2.44c-.87.58-1.98.93-3.3.93-2.54 0-4.68-1.71-5.45-4.01H3.31v2.51A9.72 9.72 0 0 0 12 21.5Z"/><path fill="#FBBC05" d="M6.55 13.81a5.85 5.85 0 0 1 0-3.62V7.68H3.31a9.72 9.72 0 0 0 0 8.64l3.24-2.51Z"/><path fill="#EA4335" d="M12 6.18c1.43 0 2.7.49 3.71 1.45l2.78-2.78A9.3 9.3 0 0 0 12 2.5a9.72 9.72 0 0 0-8.69 5.18l3.24 2.51C7.32 7.89 9.46 6.18 12 6.18Z"/></svg>
        Tiếp tục với Google
      </a>
      <p className="login-dialog__terms">Bằng việc tiếp tục, bạn đồng ý với<br /><Link to="/quy-dinh">Điều khoản sử dụng</Link> và <Link to="/chinh-sach-bao-mat">Chính sách bảo mật</Link>.</p>
      <div className="login-dialog__landscape" aria-hidden="true" />
    </section>
  </div>
}

type Location = { code: number; name: string }
const EMPTY = { fullName: '', phone: '', email: '', provinceCode: 0, wardCode: 0, addressLine: '' }

export function AccountPage() {
  const [me, setMe] = useState<Me | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [savedForm, setSavedForm] = useState(EMPTY)
  const [address, setAddress] = useState<Address | null>(null)
  const [provinces, setProvinces] = useState<Location[]>([])
  const [wards, setWards] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingWards, setLoadingWards] = useState(false)
  const [busy, setBusy] = useState(false)
  const [unauthorized, setUnauthorized] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [ready, setReady] = useState(false)
  const [retry, setRetry] = useState(0)
  const [wardError, setWardError] = useState('')
  const [wardRetry, setWardRetry] = useState(0)

  useEffect(() => {
    let active = true
    Promise.all([accountApi<Me>('/api/me'), accountApi<Address[]>('/api/addresses'), api<Location[]>('/api/provinces')])
      .then(([me, addresses, locations]) => {
        if (!active) return
        setMe(me)
        const primary = addresses.find(item => item.isDefault) ?? addresses[0] ?? null
        setAddress(primary)
        setProvinces(locations)
        setLoadingWards(Boolean(primary?.provinceCode))
        const initial = { fullName: me.fullName ?? '', email: me.email, phone: primary?.phone ?? '',
          provinceCode: primary?.provinceCode ?? 0, wardCode: primary?.wardCode ?? 0, addressLine: primary?.addressLine ?? '' }
        setForm(initial)
        setSavedForm(initial)
        setReady(true)
      })
      .catch((cause: Error) => {
        if (active) { setError(cause.message); setUnauthorized(cause instanceof ApiError && cause.status === 401) }
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [retry])

  useEffect(() => {
    if (!form.provinceCode) return
    const controller = new AbortController()
    api<Location[]>(`/api/provinces/${form.provinceCode}/wards`, controller.signal)
      .then(rows => { if (!controller.signal.aborted) { setWards(rows); setWardError('') } })
      .catch((cause: Error) => { if (!controller.signal.aborted) setWardError(cause.message) })
      .finally(() => { if (!controller.signal.aborted) setLoadingWards(false) })
    return () => controller.abort()
  }, [form.provinceCode, wardRetry])

  const change = <K extends keyof typeof EMPTY>(key: K, value: typeof EMPTY[K]) => {
    setForm(previous => ({ ...previous, [key]: value }))
    setSuccess('')
  }
  const nameChanged = form.fullName.trim() !== savedForm.fullName.trim()
  const addressChanged = form.phone.trim() !== savedForm.phone.trim() || form.provinceCode !== savedForm.provinceCode ||
    form.wardCode !== savedForm.wardCode || form.addressLine.trim() !== savedForm.addressLine.trim()
  const changed = nameChanged || addressChanged
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy || !changed) return
    setBusy(true)
    setError('')
    setSuccess('')
    let nameSaved = false
    try {
      if (nameChanged) {
        const updated = await accountApi<Me>('/api/me', 'PATCH', { fullName: form.fullName.trim() })
        setMe(updated)
        setSavedForm(previous => ({ ...previous, fullName: updated.fullName }))
        nameSaved = true
      }
      if (addressChanged || (nameChanged && address)) {
        const saved = await accountApi<Address>(`/api/addresses${address ? `/${address.id}` : ''}`, address ? 'PATCH' : 'POST', {
          label: address?.label ?? '', recipientName: form.fullName.trim(), phone: form.phone.trim(),
          wardCode: form.wardCode, addressLine: form.addressLine.trim(), isDefault: true,
        })
        setAddress(saved)
      }
      setSavedForm({ ...form, fullName: form.fullName.trim(), phone: form.phone.trim(), addressLine: form.addressLine.trim() })
      setSuccess('Thông tin tài khoản đã được lưu.')
    } catch (cause) {
      setError(`${nameSaved ? 'Họ tên đã được lưu, nhưng chưa lưu được thông tin nhận hàng. ' : ''}${(cause as Error).message}`)
    } finally { setBusy(false) }
  }

  return <AccountLayout me={me} title="Thông tin tài khoản" description="Quản lý thông tin cá nhân và địa chỉ nhận hàng của bạn.">
    <section className="customer-account">
    {me?.role === 'ADMIN' && import.meta.env.VITE_ADMIN_URL && <a href={import.meta.env.VITE_ADMIN_URL}>Trang quản trị</a>}
    {loading ? <p className="customer-account__feedback" role="status">Đang tải thông tin tài khoản…</p> : !ready ?
      <div className="customer-account__feedback" role="alert"><p>{error}</p>{unauthorized ? <Link to="/login">Đăng nhập để tiếp tục</Link> : <button type="button" onClick={() => { setLoading(true); setError(''); setUnauthorized(false); setRetry(value => value + 1) }}>Thử lại</button>}</div> :
      <form onSubmit={save} className="customer-account__form">
        <fieldset disabled={busy}>
           <legend>Thông tin cá nhân</legend>
          <div className="customer-account__grid">
             <label htmlFor="account-name">Họ và tên
              <input id="account-name" name="fullName" autoComplete="name" required maxLength={255} pattern=".*\S.*" value={form.fullName} onChange={event => change('fullName', event.target.value)} />
            </label>
            <label htmlFor="account-phone">Số điện thoại
              <input id="account-phone" name="phone" type="tel" autoComplete="tel" required maxLength={20} pattern="[+0-9 \(\)\-]{8,20}" placeholder="Nhập số điện thoại" value={form.phone} onChange={event => change('phone', event.target.value)} />
            </label>
            <label htmlFor="account-email">Email
              <input id="account-email" name="email" type="email" autoComplete="email" readOnly value={form.email} aria-describedby="account-email-note" />
              <small id="account-email-note">Email được liên kết với tài khoản Google của bạn.</small>
            </label>
          </div>
        </fieldset>
         <fieldset disabled={busy}>
           <legend>Địa chỉ nhận hàng <Link to="/account/addresses">Quản lý địa chỉ</Link></legend>
          <div className="customer-account__grid">
            <label htmlFor="account-province">Tỉnh / Thành phố
              <select id="account-province" name="province" autoComplete="address-level1" required value={form.provinceCode || ''} onChange={event => {
                const provinceCode = Number(event.target.value)
                setWards([])
                setWardError('')
                setLoadingWards(Boolean(provinceCode))
                setForm(previous => ({ ...previous, provinceCode, wardCode: 0 }))
                setSuccess('')
              }}><option value="">Chọn Tỉnh / Thành phố</option>{provinces.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}</select>
            </label>
            <label htmlFor="account-ward">Phường / Xã
              <select id="account-ward" name="ward" autoComplete="address-level2" required disabled={!form.provinceCode || loadingWards || Boolean(wardError)} value={form.wardCode || ''} onChange={event => change('wardCode', Number(event.target.value))}>
                <option value="">{loadingWards ? 'Đang tải Phường / Xã…' : 'Chọn Phường / Xã'}</option>{wards.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}
              </select>
            </label>
            {wardError && <p className="customer-account__wide customer-account__feedback" role="alert">{wardError} <button type="button" onClick={() => { setLoadingWards(true); setWardError(''); setWardRetry(value => value + 1) }}>Thử lại</button></p>}
            <label className="customer-account__wide" htmlFor="account-address">Địa chỉ chi tiết
              <input id="account-address" name="address" autoComplete="street-address" required maxLength={2000} pattern=".*\S.*" placeholder="Số nhà, tên đường, thôn / xóm…" value={form.addressLine} onChange={event => change('addressLine', event.target.value)} />
            </label>
          </div>
        </fieldset>
        <div className="customer-account__actions">
           <button className="customer-account__save" type="submit" disabled={busy || !changed || ((addressChanged || (nameChanged && Boolean(address))) && (loadingWards || !form.wardCode || Boolean(wardError)))}>{busy ? 'Đang lưu…' : 'Lưu thay đổi'}</button>
          <div aria-live="polite">{success && <p className="customer-account__success" role="status">{success}</p>}{error && <p className="customer-account__feedback" role="alert">{error}</p>}</div>
        </div>
      </form>}
    </section>
  </AccountLayout>
}
