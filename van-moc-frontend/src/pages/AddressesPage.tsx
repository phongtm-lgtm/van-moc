import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { api } from '../api/catalog'
import { accountApi, AccountApiError, type Address } from '../api/account'

type Location = { code: number; name: string }
type AddressForm = { label: string; recipientName: string; phone: string; wardCode: number; addressLine: string; isDefault: boolean }
type Field = 'recipientName' | 'phone' | 'province' | 'wardCode' | 'addressLine'
const EMPTY: AddressForm = { label: '', recipientName: '', phone: '', wardCode: 0, addressLine: '', isDefault: false }
const PHONE_HINT = 'Nhập 8–20 ký tự: số, dấu +, khoảng trắng, dấu ngoặc hoặc dấu -.'
const API_FIELD_MESSAGES: Partial<Record<Field, string>> = {
  recipientName: 'Vui lòng nhập tên người nhận (tối đa 255 ký tự).', phone: PHONE_HINT,
  wardCode: 'Vui lòng chọn Phường / Xã hợp lệ.', addressLine: 'Vui lòng nhập địa chỉ chi tiết (tối đa 2000 ký tự).',
}

function validate(form: AddressForm, province: number): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {}
  if (!form.recipientName.trim() || form.recipientName.trim().length > 255) errors.recipientName = API_FIELD_MESSAGES.recipientName
  if (!/^[+0-9 ()-]{8,20}$/.test(form.phone.trim())) errors.phone = PHONE_HINT
  if (!province) errors.province = 'Vui lòng chọn Tỉnh / Thành phố.'
  if (!form.wardCode) errors.wardCode = API_FIELD_MESSAGES.wardCode
  if (!form.addressLine.trim() || form.addressLine.trim().length > 2000) errors.addressLine = API_FIELD_MESSAGES.addressLine
  return errors
}

export function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [provinces, setProvinces] = useState<Location[]>([])
  const [wards, setWards] = useState<Location[]>([])
  const [province, setProvince] = useState(0)
  const [form, setForm] = useState<AddressForm>(EMPTY)
  const [editing, setEditing] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({})
  const [submitError, setSubmitError] = useState('')
  const [listError, setListError] = useState('')
  const [wardError, setWardError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingWards, setLoadingWards] = useState(false)
  const [busy, setBusy] = useState(false)
  const [retry, setRetry] = useState(0)
  const [wardRetry, setWardRetry] = useState(0)
  const nameInput = useRef<HTMLInputElement>(null)
  const busyRef = useRef(false)
  useEffect(() => { busyRef.current = busy }, [busy])

  useEffect(() => {
    let active = true
    // oxlint-disable-next-line react/set-state-in-effect
    setLoading(true)
    Promise.all([accountApi<Address[]>('/api/addresses'), api<Location[]>('/api/provinces')])
      .then(([rows, locations]) => { if (active) { setAddresses(rows); setProvinces(locations); setListError('') } })
      .catch((cause: Error) => { if (active) setListError(cause.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [retry])

  useEffect(() => {
    if (!modalOpen || !province) return
    const controller = new AbortController()
    api<Location[]>(`/api/provinces/${province}/wards`, controller.signal)
      .then(rows => { if (!controller.signal.aborted) { setWards(rows); setLoadingWards(false); setWardError('') } })
      .catch((cause: Error) => { if (!controller.signal.aborted) { setWardError(cause.message); setLoadingWards(false) } })
    return () => controller.abort()
  }, [modalOpen, province, wardRetry])

  useEffect(() => {
    if (!modalOpen) return
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'
    nameInput.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); if (!busyRef.current) setModalOpen(false); return }
      if (event.key !== 'Tab') return
      const buttons = Array.from(document.querySelectorAll<HTMLElement>('.account-addresses__modal :is(button:not(:disabled), input:not(:disabled), select:not(:disabled))')).filter(item => item.getClientRects().length > 0)
      if (!buttons.length) return
      if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons.at(-1)?.focus() }
      else if (!event.shiftKey && document.activeElement === buttons.at(-1)) { event.preventDefault(); buttons[0].focus() }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', handleKeyDown); previousFocus?.focus() }
  }, [modalOpen])

  const openForm = (address?: Address) => {
    setEditing(address?.id ?? null)
    setForm(address ? { label: address.label || '', recipientName: address.recipientName, phone: address.phone,
      wardCode: address.wardCode, addressLine: address.addressLine, isDefault: address.isDefault } : EMPTY)
    setProvince(address?.provinceCode ?? 0)
    setWards([])
    setLoadingWards(Boolean(address?.provinceCode))
    setWardError(''); setFieldErrors({}); setSubmitError(''); setNotice('')
    setModalOpen(true)
  }
  const change = <K extends keyof AddressForm>(field: K, value: AddressForm[K]) => {
    setForm(previous => ({ ...previous, [field]: value }))
    if (field in fieldErrors) setFieldErrors(previous => ({ ...previous, [field]: undefined }))
    setSubmitError('')
  }
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const errors = validate(form, province)
    setFieldErrors(errors); setSubmitError('')
    if (Object.keys(errors).length || wardError || loadingWards) return
    setBusy(true)
    try {
      const saved = await accountApi<Address>(`/api/addresses${editing ? `/${editing}` : ''}`, editing ? 'PATCH' : 'POST', {
        ...form, recipientName: form.recipientName.trim(), phone: form.phone.trim(), addressLine: form.addressLine.trim(), label: form.label.trim(),
      })
      setModalOpen(false); setFieldErrors({}); setSubmitError('')
      setNotice(editing ? 'Địa chỉ đã được cập nhật.' : 'Địa chỉ đã được thêm.')
      setAddresses(rows => editing
        ? rows.map(row => row.id === saved.id ? saved : { ...row, isDefault: saved.isDefault ? false : row.isDefault })
        : [...rows.map(row => ({ ...row, isDefault: saved.isDefault ? false : row.isDefault })), saved])
    } catch (cause) {
      if (cause instanceof AccountApiError && cause.invalidParams.length) {
        const errors: Partial<Record<Field, string>> = {}
        for (const { field } of cause.invalidParams) {
          if (field in API_FIELD_MESSAGES) errors[field as Field] = API_FIELD_MESSAGES[field as Field]
        }
        setFieldErrors(errors)
        if (!Object.keys(errors).length) setSubmitError('Thông tin địa chỉ chưa hợp lệ. Vui lòng kiểm tra và thử lại.')
      } else setSubmitError(cause instanceof AccountApiError && cause.status === 400
        ? 'Không thể lưu địa chỉ. Vui lòng kiểm tra thông tin và thử lại.' : (cause as Error).message)
    } finally { setBusy(false) }
  }

  const remove = async (address: Address) => {
    if (!window.confirm(`Xóa địa chỉ của ${address.recipientName}?`)) return
    setBusy(true); setListError(''); setNotice('')
    try {
      await accountApi(`/api/addresses/${address.id}`, 'DELETE')
      setAddresses(rows => rows.filter(row => row.id !== address.id))
      setNotice('Địa chỉ đã được xóa.')
    }
    catch (cause) { setListError((cause as Error).message) }
    finally { setBusy(false) }
  }
  const setDefault = async (address: Address) => {
    setBusy(true); setListError(''); setNotice('')
    try {
      await accountApi(`/api/addresses/${address.id}`, 'PATCH', { label: address.label || '', recipientName: address.recipientName,
        phone: address.phone, wardCode: address.wardCode, addressLine: address.addressLine, isDefault: true })
      setAddresses(rows => rows.map(row => ({ ...row, isDefault: row.id === address.id })))
      setNotice('Đã đặt địa chỉ mặc định.')
    } catch (cause) { setListError((cause as Error).message) }
    finally { setBusy(false) }
  }

  return <>
    <header className="account-layout__heading account-addresses__heading">
      <div><h1>Địa chỉ nhận hàng</h1><p>Quản lý địa chỉ giao hàng cho các đơn hàng của bạn.</p></div>
      <button type="button" className="customer-account__save" onClick={() => openForm()} disabled={busy || loading}><Plus size={18} /> Thêm địa chỉ</button>
    </header>
    <section className="customer-account account-addresses">
      {loading && <p className="customer-account__feedback" role="status">Đang tải địa chỉ…</p>}
      {listError && <p className="customer-account__feedback" role="alert">{listError} {listError === 'Vui lòng đăng nhập Google.' ? <Link to="/login">Đăng nhập</Link> : !loading && <button type="button" onClick={() => setRetry(value => value + 1)}>Thử lại</button>}</p>}
      {notice && <p className="customer-account__success" role="status">{notice}</p>}
      {!loading && (!listError || addresses.length > 0) && <div className="account-addresses__list">
        {addresses.length === 0 && <p className="account-addresses__empty">Bạn chưa có địa chỉ nhận hàng. Hãy thêm địa chỉ để thuận tiện khi đặt hàng.</p>}
        {addresses.map(address => <article key={address.id} className="account-addresses__card">
          <div className="account-addresses__card-info">
            <div className="account-addresses__identity"><h2>{address.recipientName}</h2>{address.isDefault && <span className="account-addresses__badge">Mặc định</span>}</div>
            <p>{address.phone}</p><p>{address.addressLine}, {address.wardName}, {address.provinceName}</p>
            {address.label && <small>{address.label}</small>}
          </div>
          <div className="account-addresses__card-actions">
            <button type="button" disabled={busy} onClick={() => openForm(address)}>Sửa</button>
            <button type="button" disabled={busy} onClick={() => void remove(address)}>Xóa</button>
            {!address.isDefault && <button type="button" disabled={busy} onClick={() => void setDefault(address)}>Đặt làm mặc định</button>}
          </div>
        </article>)}
      </div>}
    </section>
    {modalOpen && createPortal(<div className="account-addresses__overlay" onMouseDown={event => { if (event.target === event.currentTarget && !busy) setModalOpen(false) }}>
      <section className="account-addresses__modal customer-account" role="dialog" aria-modal="true" aria-labelledby="address-modal-title">
        <header className="account-addresses__modal-heading"><h2 id="address-modal-title">{editing ? 'Sửa địa chỉ' : 'Thêm địa chỉ'}</h2>
          <button type="button" disabled={busy} onClick={() => setModalOpen(false)} aria-label="Đóng"><X size={20} /></button></header>
        <form className="customer-account__form" noValidate onSubmit={save}>
          <fieldset disabled={busy}>
            <div className="customer-account__grid">
              <label>Nhãn địa chỉ<input value={form.label} maxLength={255} placeholder="Ví dụ: Nhà riêng, Công ty" onChange={event => change('label', event.target.value)} /></label>
              <label><span>Người nhận <b>*</b></span><input ref={nameInput} required maxLength={255} autoComplete="name" value={form.recipientName} aria-invalid={!!fieldErrors.recipientName} aria-describedby={fieldErrors.recipientName ? 'address-name-error' : undefined} onChange={event => change('recipientName', event.target.value)} />
                {fieldErrors.recipientName && <small id="address-name-error" className="account-addresses__error" role="alert">{fieldErrors.recipientName}</small>}</label>
              <label><span>Điện thoại <b>*</b></span><input required type="tel" autoComplete="tel" maxLength={20} value={form.phone} aria-invalid={!!fieldErrors.phone} aria-describedby={fieldErrors.phone ? 'address-phone-error' : undefined} onChange={event => change('phone', event.target.value)} />
                {fieldErrors.phone && <small id="address-phone-error" className="account-addresses__error" role="alert">{fieldErrors.phone}</small>}</label>
              <label><span>Tỉnh / Thành phố <b>*</b></span><select required autoComplete="address-level1" value={province || ''} aria-invalid={!!fieldErrors.province} aria-describedby={fieldErrors.province ? 'address-province-error' : undefined} onChange={event => {
                const code = Number(event.target.value); setProvince(code); setWards([]); setWardError(''); setLoadingWards(Boolean(code)); change('wardCode', 0)
                setFieldErrors(previous => ({ ...previous, province: undefined, wardCode: undefined }))
              }}><option value="">Chọn Tỉnh / Thành phố</option>{provinces.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}</select>
                {fieldErrors.province && <small id="address-province-error" className="account-addresses__error" role="alert">{fieldErrors.province}</small>}</label>
              <label><span>Phường / Xã <b>*</b></span><select required autoComplete="address-level2" disabled={!province || loadingWards || !!wardError} value={form.wardCode || ''} aria-invalid={!!fieldErrors.wardCode || !!wardError} aria-describedby={fieldErrors.wardCode || wardError ? 'address-ward-error' : undefined} onChange={event => change('wardCode', Number(event.target.value))}><option value="">{loadingWards ? 'Đang tải Phường / Xã…' : 'Chọn Phường / Xã'}</option>{wards.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}</select>
                {(fieldErrors.wardCode || wardError) && <small id="address-ward-error" className="account-addresses__error" role="alert">{wardError ? <>Không tải được Phường / Xã. <button type="button" onClick={() => { setWardError(''); setLoadingWards(true); setWardRetry(value => value + 1) }}>Thử lại</button></> : fieldErrors.wardCode}</small>}</label>
              <label className="customer-account__wide"><span>Địa chỉ chi tiết <b>*</b></span><input required maxLength={2000} autoComplete="street-address" placeholder="Số nhà, tên đường, thôn / xóm…" value={form.addressLine} aria-invalid={!!fieldErrors.addressLine} aria-describedby={fieldErrors.addressLine ? 'address-line-error' : undefined} onChange={event => change('addressLine', event.target.value)} />
                {fieldErrors.addressLine && <small id="address-line-error" className="account-addresses__error" role="alert">{fieldErrors.addressLine}</small>}</label>
              <label className="customer-account__wide account-addresses__default"><input type="checkbox" checked={form.isDefault} onChange={event => change('isDefault', event.target.checked)} />Địa chỉ mặc định</label>
            </div>
          </fieldset>
          <div className="customer-account__actions account-addresses__form-actions">
            <button className="customer-account__save" disabled={busy || loadingWards || !!wardError} type="submit">{busy ? 'Đang lưu…' : 'Lưu địa chỉ'}</button>
            <button className="account-addresses__cancel" type="button" disabled={busy} onClick={() => setModalOpen(false)}>Hủy</button>
          </div>
          {submitError && <p className="customer-account__feedback account-addresses__submit-error" role="alert">{submitError}</p>}
        </form>
      </section>
    </div>, document.body)}
  </>
}
