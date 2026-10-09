import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, Check, Copy, CreditCard, Info, Pencil, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import type { CartItem } from '../contexts/cart-context'
import { accountApi, AccountApiError, type Address } from '../api/account'
import { getPayment, type Payment, type CheckoutResult, type CheckoutRequest } from '../api/orders'
import { api, ApiError } from '../api/catalog'
import './CheckoutPage.css'
import './BankTransferModal.css'

const PAYMENT_WAIT_SECONDS = 15 * 60
const DRAFT_KEY = 'vanmoc.checkout.draft'
type Delivery = { recipientName: string; phone: string; provinceCode: number; wardCode: number; addressLine: string }
const EMPTY_DELIVERY: Delivery = { recipientName: '', phone: '', provinceCode: 0, wardCode: 0, addressLine: '' }
type DeliveryErrors = Partial<Record<keyof Delivery | 'note', string>>
const DELIVERY_MESSAGES: Record<keyof Delivery | 'note', string> = {
  recipientName: 'Vui lòng nhập họ và tên (tối đa 255 ký tự).',
  phone: 'Số điện thoại không hợp lệ. Nhập 8–20 ký tự gồm số, dấu +, khoảng trắng, dấu ngoặc hoặc dấu -.',
  provinceCode: 'Vui lòng chọn Tỉnh / Thành phố.',
  wardCode: 'Vui lòng chọn Phường / Xã hợp lệ.',
  addressLine: 'Vui lòng nhập địa chỉ chi tiết (tối đa 2000 ký tự).',
  note: 'Ghi chú đơn hàng không được vượt quá 2000 ký tự.',
}
type SelectedProduct = { productId: string; customization: string }
function selectionOf(item: CartItem): SelectedProduct {
  const engraving = item.customization
  return { productId: item.product.id, customization: JSON.stringify(engraving ? [engraving.text, engraving.font, engraving.position] : null) }
}
type Draft = { delivery: Delivery; payment: 'cod' | 'bank'; note: string; selectedProducts: SelectedProduct[] | null }
function readDraft(): Draft | null {
  try {
    const value = sessionStorage.getItem(DRAFT_KEY)
    return value ? JSON.parse(value) as Draft : null
  } catch { return null }
}
function saveDraft(draft: Draft) { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft)) }
type LocationOption = { code: number; name: string }

function formatPrice(price: number) {
  return `${new Intl.NumberFormat('vi-VN').format(price)} đ`
}

function formatCountdown(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function validateDelivery(delivery: Delivery, note: string): DeliveryErrors {
  const errors: DeliveryErrors = {}
  if (!delivery.recipientName.trim() || delivery.recipientName.trim().length > 255) errors.recipientName = DELIVERY_MESSAGES.recipientName
  if (!/^[+0-9 ()-]{8,20}$/.test(delivery.phone.trim())) errors.phone = DELIVERY_MESSAGES.phone
  if (!delivery.provinceCode) errors.provinceCode = DELIVERY_MESSAGES.provinceCode
  if (!delivery.wardCode) errors.wardCode = DELIVERY_MESSAGES.wardCode
  if (!delivery.addressLine.trim() || delivery.addressLine.trim().length > 2000) errors.addressLine = DELIVERY_MESSAGES.addressLine
  if (note.length > 2000) errors.note = DELIVERY_MESSAGES.note
  return errors
}

export function CheckoutPage() {
  const { items: cartItems, refresh, authenticated, loading, error: cartError } = useCart()
  const location = useLocation()
  const navigate = useNavigate()
  const [initialDraft] = useState(readDraft)
  const selectedIds = (location.state as { cartItemIds?: string[] } | null)?.cartItemIds
  const selectedProductId = (location.state as { productId?: string } | null)?.productId
  const selectedProducts = selectedIds
    ? cartItems.filter(item => selectedIds.includes(item.key)).map(selectionOf)
    : selectedProductId ? cartItems.filter(item => item.product.id === selectedProductId).map(selectionOf) : initialDraft?.selectedProducts
  const selectedItems = selectedProducts ? cartItems.filter(item => selectedProducts.some(selected => selected.productId === item.product.id && selected.customization === selectionOf(item).customization)) : cartItems
  const [orderedItems, setOrderedItems] = useState<CartItem[] | null>(null)
  const items = orderedItems ?? selectedItems
  const [addresses, setAddresses] = useState<Address[]>([])
  const [delivery, setDelivery] = useState<Delivery>(initialDraft?.delivery ?? EMPTY_DELIVERY)
  const [provinces, setProvinces] = useState<LocationOption[]>([])
  const [wards, setWards] = useState<LocationOption[]>([])
  const [preview, setPreview] = useState<CheckoutResult | null>(null)
  const [previewFor, setPreviewFor] = useState('')
  const [previewRetry, setPreviewRetry] = useState(0)
  const [shippingQuote, setShippingQuote] = useState<{ provinceCode: number; fee: number } | null>(null)
  const [shippingError, setShippingError] = useState('')
  const [shippingRetry, setShippingRetry] = useState(0)
  const [created, setCreated] = useState<CheckoutResult | null>(null)
  const [bankPayment, setBankPayment] = useState<Payment | null>(null)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<DeliveryErrors>({})
  const [busy, setBusy] = useState(false)
  const [checking, setChecking] = useState(false)
  const [paymentCheckNotice, setPaymentCheckNotice] = useState('')
  const [note, setNote] = useState(initialDraft?.note ?? '')
  const attempt = useRef<{ hash: string; key: string } | null>(null)
  const [savingAddress, setSavingAddress] = useState(false)
  const summaryRef = useRef<HTMLElement>(null)
  const [summaryFits, setSummaryFits] = useState(false)
  const [payment, setPayment] = useState<'cod' | 'bank'>(initialDraft?.payment ?? 'cod')
  const [orderCode, setOrderCode] = useState('')
  const [showBankTransfer, setShowBankTransfer] = useState(false)
  const [copied, setCopied] = useState('')
  const [waitSeconds, setWaitSeconds] = useState(PAYMENT_WAIT_SECONDS)

  const productTotal = created?.productSubtotal ?? preview?.productSubtotal ?? items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const customizationTotal = created?.engravingTotal ?? preview?.engravingTotal ?? items.reduce((sum, item) => sum + (item.customization?.fee ?? 0) * item.quantity, 0)
  const shippingReady = shippingQuote?.provinceCode === delivery.provinceCode
  const shippingFee = created?.shippingFee ?? preview?.shippingFee ?? (shippingReady ? shippingQuote.fee : 0)
  const total = bankPayment?.amount ?? created?.grandTotal ?? preview?.grandTotal ?? 0
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
  const selection = JSON.stringify(items.map(item => item.key).sort())
  const matchingAddress = addresses.find(row => row.recipientName === delivery.recipientName.trim() && row.phone === delivery.phone.trim()
    && row.wardCode === delivery.wardCode && row.addressLine === delivery.addressLine.trim())
  const addressId = matchingAddress?.id ?? ''
  const previewInput = JSON.stringify([selection, addressId, delivery, payment, note, items.map(item => [item.quantity, item.lineTotal, item.customization])])
  const missingSelection = !!selectedProducts && items.length < selectedProducts.length
  const previewReady = !!preview && previewFor === previewInput && !loading && !missingSelection
  const deliveryValid = !!delivery.recipientName.trim() && delivery.recipientName.trim().length <= 255
    && /^[+0-9 ()-]{8,20}$/.test(delivery.phone.trim()) && !!delivery.provinceCode && !!delivery.wardCode
    && wards.some(ward => ward.code === delivery.wardCode) && !!delivery.addressLine.trim()
    && delivery.addressLine.trim().length <= 2000 && note.length <= 2000
  const shippingLabel = created || previewReady ? formatPrice(shippingFee)
    : !deliveryValid ? 'Chưa xác định' : shippingReady ? formatPrice(shippingFee) : shippingError ? 'Chưa xác định' : 'Đang tính…'
  useEffect(() => {
    const summary = summaryRef.current
    if (!summary) return
    const measure = () => setSummaryFits(summary.getBoundingClientRect().height <= window.innerHeight - 128)
    const observer = new ResizeObserver(measure)
    observer.observe(summary)
    window.addEventListener('resize', measure)
    measure()
    return () => { observer.disconnect(); window.removeEventListener('resize', measure) }
  }, [loading, items.length, orderCode])
  useEffect(() => {
    if (!delivery.provinceCode) return
    const controller = new AbortController()
    api<{ provinceCode: number; fee: number }>(`/api/shipping/quote?provinceCode=${delivery.provinceCode}`, controller.signal)
      .then(result => { if (!controller.signal.aborted) { setShippingQuote(result); setShippingError('') } })
       .catch(() => { if (!controller.signal.aborted) setShippingError('Không tải được phí giao hàng. Vui lòng thử lại.') })
    return () => controller.abort()
  }, [delivery.provinceCode, shippingRetry])
  useEffect(() => {
    let active = true
    api<LocationOption[]>('/api/provinces').then(rows => { if (active) setProvinces(rows) })
      .catch(() => { if (active) setError('Không tải được danh sách tỉnh / thành. Vui lòng tải lại trang.') })
    return () => { active = false }
  }, [])
  useEffect(() => {
    if (!delivery.provinceCode) return
    const controller = new AbortController()
    api<LocationOption[]>(`/api/provinces/${delivery.provinceCode}/wards`, controller.signal)
      .then(rows => { if (!controller.signal.aborted) setWards(rows) }).catch(() => { if (!controller.signal.aborted) setError('Không tải được phường / xã. Vui lòng chọn lại tỉnh / thành.') })
    return () => controller.abort()
  }, [delivery.provinceCode])
  useEffect(() => {
    if (authenticated !== true) return
    let active = true
    accountApi<Address[]>('/api/addresses').then(rows => {
      if (active) setAddresses(rows)
    }).catch(() => { if (active) setError('Không tải được địa chỉ đã lưu. Bạn có thể nhập địa chỉ giao hàng bên dưới.') })
    return () => { active = false }
  }, [authenticated])
  useEffect(() => {
    if (created || loading) return
    saveDraft({ delivery, payment, note, selectedProducts: selectedProducts ?? null })
  }, [delivery, payment, note, selectedProducts, created, loading])
  useEffect(() => {
    let active = true
    // Invalidate remote pricing while fetching a new quote for the current selection.
    // oxlint-disable-next-line react/set-state-in-effect
    setPreview(null)
    if (!authenticated || !addressId || selection === '[]' || loading || created || !delivery.wardCode) return
    const request: CheckoutRequest = { cartItemIds: JSON.parse(selection), addressId, paymentMethod: payment === 'cod' ? 'COD' : 'BANK_TRANSFER', note, idempotencyKey: 'preview' }
    accountApi<CheckoutResult>('/api/checkout/preview', 'POST', request)
      .then(result => { if (active) { setPreview(result); setPreviewFor(previewInput); setError('') } })
      .catch(() => { if (active) setError('Chưa xác nhận được giá trị đơn hàng. Vui lòng kiểm tra địa chỉ và giỏ hàng, rồi thử lại.') })
    return () => { active = false }
  }, [authenticated, addressId, selection, payment, note, loading, created, delivery.wardCode, previewInput, previewRetry])

  const checkPayment = async (id = created?.orderId) => {
    if (checking) return
    if (!id) { setError('Không tìm thấy đơn để kiểm tra. Vui lòng mở lịch sử đơn hàng.'); return }
    setChecking(true)
    setPaymentCheckNotice(''); setError('')
    try {
      const result = await getPayment(id)
      setBankPayment(result); setError('')
      setPaymentCheckNotice(result.status === 'PENDING'
        ? 'Chưa ghi nhận thanh toán. Nếu đã chuyển khoản, vui lòng chờ hệ thống xác nhận và không thanh toán lại.'
        : result.status === 'EXPIRED' ? 'Đơn đã hết hạn thanh toán. Nếu đã chuyển tiền, vui lòng liên hệ để đối soát.'
         : result.status === 'PAID' ? 'Đã xác nhận thanh toán.' : 'Thanh toán cần được kiểm tra. Vui lòng liên hệ Vân Mộc để được hỗ trợ.')
      if (result.status === 'PAID') { setShowBankTransfer(false); setOrderCode(created?.orderCode ?? '') }
     } catch { setError('Chưa kiểm tra được thanh toán. Vui lòng thử lại và không chuyển thêm tiền.') }
    finally { setChecking(false) }
  }
  useEffect(() => {
    if (!showBankTransfer || !created?.orderId) return
    let active = true
    const poll = async () => {
      try {
        const result = await getPayment(created.orderId!)
        if (!active) return
        setBankPayment(result)
        setWaitSeconds(result.expiresAt ? Math.max(0, Math.ceil((Date.parse(result.expiresAt) - Date.now()) / 1000)) : 0)
        if (result.status === 'PAID') { setOrderCode(created.orderCode); setShowBankTransfer(false) }
       } catch { if (active) setError('Chưa cập nhật được thanh toán. Vui lòng kiểm tra lại và không chuyển thêm tiền.') }
    }
    void poll()
    const timer = window.setInterval(() => void poll(), 5000)
    return () => { active = false; window.clearInterval(timer) }
  }, [showBankTransfer, created])

  useEffect(() => {
    if (!showBankTransfer) return
    const timer = window.setInterval(() => {
      setWaitSeconds(bankPayment?.expiresAt ? Math.max(0, Math.ceil((Date.parse(bankPayment.expiresAt) - Date.now()) / 1000)) : 0)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [showBankTransfer, bankPayment?.expiresAt])

  const updateDelivery = <K extends keyof Delivery>(field: K, value: Delivery[K]) => {
    if (field === 'provinceCode') { setShippingQuote(null); setShippingError('') }
    setDelivery(current => ({ ...current, [field]: value, ...(field === 'provinceCode' ? { wardCode: 0 } : {}) }))
    setFieldErrors(current => ({ ...current, [field]: undefined, ...(field === 'provinceCode' ? { wardCode: undefined } : {}) }))
  }
  const focusField = (errors: DeliveryErrors) => {
    const field = Object.keys(errors)[0]
    if (field) requestAnimationFrame(() => document.getElementById(`checkout-${field}`)?.focus())
  }
  const handleSubmitError = (cause: unknown) => {
    if (cause instanceof AccountApiError && cause.invalidParams.length) {
      const errors: DeliveryErrors = {}
      for (const { field } of cause.invalidParams) {
        if (Object.hasOwn(DELIVERY_MESSAGES, field)) errors[field as keyof DeliveryErrors] = DELIVERY_MESSAGES[field as keyof DeliveryErrors]
      }
      if (Object.keys(errors).length) { setFieldErrors(errors); focusField(errors); return }
    }
     setError('Không thể hoàn tất yêu cầu. Vui lòng kiểm tra thông tin và thử lại; nếu đã đặt hàng, hãy kiểm tra lịch sử đơn trước khi đặt lại.')
  }
  const fieldError = (field: keyof DeliveryErrors) => fieldErrors[field]
    ? <small id={`checkout-${field}-error`} className="checkout-field__error" role="alert">{fieldErrors[field]}</small> : null
  const fieldProps = (field: keyof DeliveryErrors) => ({ id: `checkout-${field}`, 'aria-invalid': !!fieldErrors[field], 'aria-describedby': fieldErrors[field] ? `checkout-${field}-error` : undefined })

  const confirmAddress = async () => {
    if (!deliveryValid || savingAddress || busy || created) return
    setSavingAddress(true); setError('')
    try {
      const saved = await accountApi<Address>('/api/addresses', 'POST', { label: 'Đơn hàng', recipientName: delivery.recipientName.trim(), phone: delivery.phone.trim(), wardCode: delivery.wardCode, addressLine: delivery.addressLine.trim(), isDefault: addresses.length === 0 })
      setAddresses(rows => [...rows, saved])
    } catch (cause) { handleSubmitError(cause) }
    finally { setSavingAddress(false) }
  }

  const placeOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy || savingAddress || created || loading || missingSelection || !items.length || !deliveryValid || !previewReady) return
    if (authenticated !== true) {
      saveDraft({ delivery, payment, note, selectedProducts: selectedProducts ?? null })
      sessionStorage.setItem('vanmoc.oauth.return', '/checkout')
      navigate('/login', { state: { from: '/checkout' } })
      return
    }
    const errors = validateDelivery(delivery, note)
    setFieldErrors(errors); setError('')
    if (Object.keys(errors).length) { focusField(errors); return }
    setBusy(true); setError('')
    let checkoutAddressId = addressId
    try {
      const match = matchingAddress
      if (!match) {
        const saved = await accountApi<Address>('/api/addresses', 'POST', { label: 'Đơn hàng', recipientName: delivery.recipientName.trim(), phone: delivery.phone.trim(), wardCode: delivery.wardCode, addressLine: delivery.addressLine.trim(), isDefault: addresses.length === 0 })
        checkoutAddressId = saved.id
        setAddresses(rows => [...rows, saved])
      } else checkoutAddressId = match.id
    } catch (cause) { handleSubmitError(cause); setBusy(false); return }
    const payload = { cartItemIds: JSON.parse(selection) as string[], addressId: checkoutAddressId, paymentMethod: payment === 'cod' ? 'COD' as const : 'BANK_TRANSFER' as const, note }
    const hash = JSON.stringify(payload)
    if (attempt.current && attempt.current.hash !== hash) {
      setError('Yêu cầu trước có thể đã tạo đơn. Kiểm tra lịch sử đơn trước khi thay đổi và đặt lại.'); setBusy(false); return
    }
    if (!attempt.current) attempt.current = { hash, key: crypto.randomUUID() }
    try {
      await accountApi<CheckoutResult>('/api/checkout/preview', 'POST', { ...payload, idempotencyKey: 'preview' })
      const result = await accountApi<CheckoutResult>('/api/checkout', 'POST', { ...payload, idempotencyKey: attempt.current.key })
      setOrderedItems(items)
      setCreated(result)
      sessionStorage.removeItem(DRAFT_KEY)
      void refresh()
      if (payment === 'bank') {
        if (!result.orderId) { setError('Đã tạo đơn. Vui lòng xem lịch sử đơn hàng để tiếp tục thanh toán.'); return }
        let paymentInfo: Payment
        try { paymentInfo = await getPayment(result.orderId) }
        catch { navigate(`/account/orders/${result.orderId}`); return }
        setBankPayment(paymentInfo)
        setWaitSeconds(paymentInfo.expiresAt ? Math.max(0, Math.ceil((Date.parse(paymentInfo.expiresAt) - Date.now()) / 1000)) : 0)
        if (paymentInfo.status === 'PAID') navigate(`/account/orders/${result.orderId}`)
        else if (paymentInfo.qrUrl && paymentInfo.bank && paymentInfo.accountNumber && paymentInfo.transferCode) setShowBankTransfer(true)
        else navigate(`/account/orders/${result.orderId}`)
      } else navigate(`/account/orders/${result.orderId}`)
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        saveDraft({ delivery, payment, note, selectedProducts: selectedProducts ?? null })
        sessionStorage.setItem('vanmoc.oauth.return', '/checkout'); navigate('/login', { state: { from: '/checkout' } }); return
      }
      handleSubmitError(cause)
    }
    finally { setBusy(false) }
  }

  const copyValue = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value)
    setCopied(label)
    window.setTimeout(() => setCopied(''), 1600)
  }

  const transferCode = bankPayment?.transferCode ?? created?.orderCode
  const transferContent = transferCode ? `SEVQR ${transferCode}` : ''
  const qrUrl = bankPayment?.qrUrl
  const closeBankTransfer = () => {
    if (created?.orderId) navigate(`/account/orders/${created.orderId}`)
    else setShowBankTransfer(false)
  }

  if (orderCode) {
    return (
      <div className="checkout-page checkout-page--result">
        <div className="checkout-result-backdrop" aria-hidden />
        <section className="checkout-success checkout-modal" role="dialog" aria-modal="true" aria-live="polite" aria-labelledby="success-title">
          <span className="checkout-success__icon" aria-hidden><Check size={28} strokeWidth={2.4} /></span>
          <h1 id="success-title">Đặt hàng thành công</h1>
          <p>Cảm ơn bạn đã tin tưởng Vân Mộc!<br />Chúng tôi sẽ sớm liên hệ và giao hàng đến bạn.</p>
          <div className="checkout-success__code">
            <span>Mã đơn hàng</span>
            <div>
              <strong>{orderCode}</strong>
              <button type="button" onClick={() => copyValue(orderCode, 'order')} aria-label="Sao chép mã đơn hàng">
                {copied === 'order' ? <Check size={15} /> : <Copy size={15} />}
              </button>
            </div>
          </div>
          <Link to={`/account/orders/${created?.orderId}`}>Xem chi tiết đơn hàng</Link>
          <small>Bằng việc đặt hàng, bạn đồng ý với <Link to="/quy-dinh">Chính sách mua hàng</Link> của Vân Mộc.</small>
        </section>
      </div>
    )
  }

  if (!created && (loading || cartError)) return <div className="checkout-page"><section className="checkout-empty"><p>{loading ? 'Đang tải giỏ hàng…' : 'Không tải được giỏ hàng. Vui lòng thử lại.'}</p><Link to="/cart">Về giỏ hàng</Link></section></div>
  if (!created && items.length === 0) {
    return (
      <div className="checkout-page">
        <section className="checkout-empty">
          <span><CreditCard size={32} strokeWidth={1.35} /></span>
          <h1>Chưa có sản phẩm để thanh toán</h1>
          <p>Hãy chọn một món thủ công bạn yêu thích trước khi tiếp tục.</p>
          <Link to="/shop">Khám phá sản phẩm</Link>
        </section>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="checkout-page__wash" aria-hidden />
      <main className="checkout-shell">
        <div className="checkout-panel">
          <header className="checkout-heading">
            <h1>Thanh toán</h1>
            <p>Hoàn tất đơn hàng để mang giá trị thủ công về với bạn.</p>
            {error && <p role="alert">{error}</p>}
            {missingSelection && !created && <p role="alert">Một dòng giỏ đã chọn không còn tồn tại. <Link to="/cart">Quay lại chọn sản phẩm</Link></p>}
            {created && <p>Đã tạo đơn {created.orderCode}. <Link to={`/account/orders/${created.orderId}`}>Xem đơn / tiếp tục thanh toán</Link></p>}
          </header>

          <form id="checkout-form" className="checkout-layout" noValidate onSubmit={placeOrder} onBlur={event => {
            const field = event.target.id.replace('checkout-', '') as keyof DeliveryErrors
            if (Object.hasOwn(DELIVERY_MESSAGES, field)) setFieldErrors(current => ({ ...current, [field]: validateDelivery(delivery, note)[field] }))
          }}>
            <div className="checkout-main">
              <section className="checkout-section">
                <h2>Thông tin giao hàng</h2>
                <div className="checkout-fields">
                   {authenticated && addresses.length > 0 && <label className="checkout-field checkout-field--wide"><span>Dùng địa chỉ đã lưu (không bắt buộc)</span>
                      <select value={addressId} disabled={busy || savingAddress || !!created} onChange={event => {
                       const saved = addresses.find(row => row.id === event.target.value)
                       if (saved) { setFieldErrors({}); setShippingError(''); setDelivery({ recipientName: saved.recipientName, phone: saved.phone, provinceCode: saved.provinceCode, wardCode: saved.wardCode, addressLine: saved.addressLine }) }
                       else { setDelivery(EMPTY_DELIVERY); setFieldErrors({}); setShippingQuote(null) }
                     }}>
                       <option value="">Nhập địa chỉ mới</option>{addresses.map(row => <option key={row.id} value={row.id}>{row.label} — {row.addressLine}, {row.wardName}</option>)}
                     </select>
                   </label>}
                    <label className="checkout-field">
                     <span>Họ và tên <b>*</b></span>
                     <input {...fieldProps('recipientName')} required maxLength={255} autoComplete="name" value={delivery.recipientName} disabled={busy || !!created} onChange={event => updateDelivery('recipientName', event.target.value)} />
                     {fieldError('recipientName')}
                   </label>
                    <label className="checkout-field">
                     <span>Số điện thoại <b>*</b></span>
                     <input {...fieldProps('phone')} required type="tel" autoComplete="tel" maxLength={20} value={delivery.phone} disabled={busy || !!created} onChange={event => updateDelivery('phone', event.target.value)} />
                     {fieldError('phone')}
                   </label>
                   <label className="checkout-field">
                     <span>Tỉnh / Thành phố <b>*</b></span>
                     <select {...fieldProps('provinceCode')} required value={delivery.provinceCode || ''} disabled={busy || !!created} onChange={event => { setWards([]); updateDelivery('provinceCode', Number(event.target.value)) }}>
                       <option value="">Chọn tỉnh / thành</option>{provinces.map(row => <option key={row.code} value={row.code}>{row.name}</option>)}
                     </select>
                     {fieldError('provinceCode')}
                   </label>
                   <label className="checkout-field">
                     <span>Phường / Xã <b>*</b></span>
                     <select {...fieldProps('wardCode')} required value={delivery.wardCode || ''} disabled={busy || !!created || !delivery.provinceCode} onChange={event => updateDelivery('wardCode', Number(event.target.value))}>
                       <option value="">Chọn phường / xã</option>{wards.map(row => <option key={row.code} value={row.code}>{row.name}</option>)}
                     </select>
                     {fieldError('wardCode')}
                   </label>
                   <label className="checkout-field checkout-field--wide">
                     <span>Địa chỉ chi tiết <b>*</b></span>
                     <textarea {...fieldProps('addressLine')} required maxLength={2000} autoComplete="street-address" value={delivery.addressLine} rows={3} disabled={busy || !!created} onChange={event => updateDelivery('addressLine', event.target.value)} />
                     {fieldError('addressLine')}
                  </label>
                  <label className="checkout-field checkout-field--wide">
                     <span>Ghi chú đơn hàng <em>(không bắt buộc)</em></span><textarea {...fieldProps('note')} rows={2} placeholder="Lời nhắn cho Vân Mộc…" value={note} maxLength={2000} disabled={busy || !!created} onChange={event => { setNote(event.target.value); setFieldErrors(current => ({ ...current, note: undefined })) }} />
                    {fieldError('note')}
                  </label>
                </div>
                {!addressId && !created && authenticated && <div className="checkout-address-confirm">
                  <p>Xác nhận địa chỉ mới để lưu và kiểm tra tổng tiền đơn hàng.</p>
                  <button type="button" disabled={!deliveryValid || savingAddress || busy} onClick={() => void confirmAddress()}>{savingAddress ? 'Đang xác nhận…' : 'Xác nhận địa chỉ'}</button>
                </div>}
              </section>

              <section className="checkout-section">
                <div className="checkout-shipping"><strong>Giao hàng tiêu chuẩn</strong><span>Phí giao hàng được tính theo địa chỉ nhận hàng.</span></div>
                {shippingError && !shippingReady && !previewReady && <p className="checkout-field__error" role="alert">Không tải được phí giao hàng. <button type="button" onClick={() => { setShippingError(''); setShippingRetry(value => value + 1) }}>Thử lại</button></p>}
              </section>
            </div>

            <aside ref={summaryRef} className={`checkout-aside${summaryFits ? ' checkout-aside--sticky' : ''}`}>
              <section className="checkout-section">
                <div className="checkout-order__head">
                  <h2>Đơn hàng của bạn <span>({itemCount} sản phẩm)</span></h2>
                  <Link to="/cart"><Pencil size={13} strokeWidth={1.8} /> Chỉnh sửa</Link>
                </div>

                <div className="checkout-products">
                  {items.map((item) => (
                    <article className="checkout-product" key={item.key}>
                      <div className="checkout-product__image">
                        <img src={item.product.image} alt="" />
                      </div>
                      <div className="checkout-product__copy">
                        <strong>{item.product.name}</strong>
                        {item.customization && (
                          <small>
                            Khắc: {item.customization.text || 'Vân Mộc'} – {item.customization.font} – {item.customization.position}
                          </small>
                        )}
                         <small>SL: {item.quantity}</small>
                         {item.customization && item.customization.fee > 0 && <small>Phí khắc: {formatPrice(item.customization.fee * item.quantity)} (đã gồm trong giá dòng)</small>}
                      </div>
                      <b>{formatPrice(item.lineTotal)}</b>
                    </article>
                  ))}
                </div>

                <div className="checkout-totals">
                   <div><span>Tạm tính</span><strong>{formatPrice(productTotal)}{!created && !previewReady && ' (tạm tính)'}</strong></div>
                   {customizationTotal > 0 && <div><span>Phí khắc</span><strong>{formatPrice(customizationTotal)}</strong></div>}
                  <div><span>Phí vận chuyển</span><strong>{shippingLabel}</strong></div>
                   <div className={`checkout-totals__grand${!created && !previewReady ? ' is-pending' : ''}`} aria-live="polite"><span>Tổng cộng</span><strong>{created || previewReady ? formatPrice(total) : !deliveryValid || !addressId ? 'Vui lòng chọn địa chỉ giao hàng' : 'Đang xác nhận tổng tiền'}</strong></div>
                </div>
              </section>

              <section className="checkout-section">
                <h2>Phương thức thanh toán</h2>
                <div className="checkout-options checkout-options--payment">
                  <label className={`checkout-option ${payment === 'cod' ? 'is-selected' : ''}`}>
                    <input type="radio" name="payment" value="cod" disabled={busy || !!created} checked={payment === 'cod'} onChange={() => setPayment('cod')} />
                    <span className="checkout-option__check" aria-hidden>
                      {payment === 'cod' ? <Check size={12} strokeWidth={2.5} /> : null}
                    </span>
                    <span className="checkout-option__copy"><strong>Thanh toán khi nhận hàng (COD)</strong></span>
                  </label>
                  <label className={`checkout-option ${payment === 'bank' ? 'is-selected' : ''}`}>
                    <input type="radio" name="payment" value="bank" disabled={busy || !!created} checked={payment === 'bank'} onChange={() => setPayment('bank')} />
                    <span className="checkout-option__check" aria-hidden>
                      {payment === 'bank' ? <Check size={12} strokeWidth={2.5} /> : null}
                    </span>
                    <span className="checkout-option__copy"><strong>Chuyển khoản qua mã QR (SePay)</strong></span>
                  </label>
                </div>
              </section>

              <button type="submit" className="checkout-submit" aria-busy={busy} disabled={busy || savingAddress || loading || missingSelection || !!created || !deliveryValid || !previewReady}>{busy ? 'Đang tạo đơn…' : 'Đặt hàng'}</button>
              {addressId && deliveryValid && !previewReady && error && !created && <button className="checkout-preview-retry" type="button" onClick={() => { setError(''); setPreviewRetry(value => value + 1) }}>Kiểm tra lại tổng tiền</button>}
              {authenticated === false && <Link className="checkout-login" to="/login" state={{ from: '/checkout' }}>Đăng nhập để tiếp tục đặt hàng</Link>}
              <small className="checkout-order__terms">
                Bằng việc đặt hàng, bạn đồng ý với <Link to="/quy-dinh">Chính sách mua hàng</Link> của Vân Mộc.
              </small>
            </aside>
          </form>
        </div>
      </main>

      {showBankTransfer && (
        <div className="checkout-modal-layer" role="presentation">
          <button className="checkout-modal-layer__backdrop" type="button" onClick={closeBankTransfer} aria-label="Đóng thông tin chuyển khoản và xem đơn hàng" />
          <section className="bank-modal checkout-modal" role="dialog" aria-modal="true" aria-labelledby="bank-modal-title">
            <button className="checkout-modal__close" type="button" onClick={closeBankTransfer} aria-label="Đóng và xem đơn hàng"><X size={18} /></button>
            <h2 id="bank-modal-title">Thanh toán qua mã QR</h2>
            <div className="bank-modal__content">
               <div className="bank-modal__qr">{qrUrl && waitSeconds > 0 ? <><img src={qrUrl} alt="Mã QR chuyển khoản đơn hàng" /><p className="bank-modal__qr-guide">Quét mã bằng ứng dụng ngân hàng để thanh toán</p></> : <p>{bankPayment ? 'QR không còn hiệu lực' : 'Đang tải thanh toán…'}</p>}</div>
              <div className="bank-modal__details">
                <dl>
                   <div><dt>Ngân hàng</dt><dd><span>{bankPayment?.bank}</span><button type="button" disabled={!bankPayment?.bank} onClick={() => copyValue(bankPayment?.bank ?? '', 'bank')} aria-label="Sao chép ngân hàng">{copied === 'bank' ? <Check size={14} /> : <Copy size={14} />}</button></dd></div>
                   <div><dt>Số tài khoản</dt><dd><span>{bankPayment?.accountNumber}</span><button type="button" disabled={!bankPayment?.accountNumber} onClick={() => copyValue(bankPayment?.accountNumber ?? '', 'account')} aria-label="Sao chép số tài khoản">{copied === 'account' ? <Check size={14} /> : <Copy size={14} />}</button></dd></div>
                   <div><dt>Nội dung</dt><dd><span>{transferContent}</span><button type="button" onClick={() => copyValue(transferContent, 'code')} aria-label="Sao chép nội dung">{copied === 'code' ? <Check size={14} /> : <Copy size={14} />}</button></dd></div>
                  <div className="bank-modal__amount">
                    <dt>Số tiền</dt>
                    <dd>
                      <span>{formatPrice(total)}</span>
                      <button type="button" onClick={() => copyValue(String(total), 'amount')} aria-label="Sao chép số tiền">
                        {copied === 'amount' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </dd>
                  </div>
                </dl>
                <p className="bank-modal__timer">{bankPayment && waitSeconds === 0 ? 'Mã QR đã hết hạn' : <>Mã QR còn hiệu lực: <strong>{formatCountdown(waitSeconds)}</strong></>}</p>
              </div>
            </div>
            <div className="bank-modal__notice">
              <Info size={18} strokeWidth={1.8} />
               <span role="status" aria-live="polite">{error || (waitSeconds === 0 && bankPayment?.status === 'PENDING' ? 'Mã QR đã hết hạn. Nếu đã chuyển khoản, không thanh toán lại; vui lòng liên hệ để đối soát.' : paymentCheckNotice || 'Hệ thống tự động xác nhận thanh toán. Chuyển đúng số tiền và nội dung.')}</span>
            </div>
             <button className="bank-modal__confirm" type="button" disabled={checking} onClick={() => void checkPayment()}>
               {checking ? 'Đang kiểm tra…' : 'Kiểm tra lại trạng thái'} <ArrowRight size={15} />
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
