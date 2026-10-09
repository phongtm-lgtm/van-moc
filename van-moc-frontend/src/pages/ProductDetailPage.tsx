import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronDown, ChevronLeft, ChevronRight, Gift, Minus, PackageCheck, Plus, ShieldCheck, ShoppingCart, Truck, Play } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { api, isUuid, type ProductDetail } from '../api/catalog'

const FONT_STYLES = {
  SERIF: { label: 'Thanh lịch', family: '"Playfair Display", Georgia, serif', style: { fontStyle: 'italic' as const } },
  SCRIPT: { label: 'Thư pháp', family: '"Dancing Script", cursive', style: {} },
  HANDWRITING: { label: 'Viết tay', family: '"Dancing Script", cursive', style: {} },
}
type EngravingFontInfo = { code: string; name: string; fileUrl: string | null; cssUrl: string | null; fontFamily: string | null; fontWeight: number | null; italic: boolean; active: boolean }
const POSITION_LABELS: Record<string, string> = { FRONT: 'Mặt trước', BACK: 'Mặt sau', HANDLE: 'Cạnh / cán' }
function formatPrice(n: number) { return `${new Intl.NumberFormat('vi-VN').format(n)} đ` }

function GalleryImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return <span className={`pdp-gallery__fallback ${className || ''}`} role="img" aria-label={`Không tải được ảnh ${alt}`}><PackageCheck size={28} aria-hidden="true" />Không tải được ảnh</span>
  return <img className={className} src={src} alt={alt} onError={() => setFailed(true)} />
}

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem, loading: cartBusy } = useCart()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [retry, setRetry] = useState(0)
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [engravingEnabled, setEngravingEnabled] = useState(false)
  const [engravingText, setEngravingText] = useState('')
  const [engravingFont, setEngravingFont] = useState('')
  const [fontCatalog, setFontCatalog] = useState<EngravingFontInfo[]>([])
  const [fontStatus, setFontStatus] = useState<Record<string, 'ready' | 'error'>>({})
  const [engravingPosition, setEngravingPosition] = useState('')
  useEffect(() => {
    let alive = true
    const links: HTMLLinkElement[] = []
    for (const font of fontCatalog) {
      if (font.fileUrl) {
        const face = new FontFace(`engraving-${font.code}`, `url("${font.fileUrl}")`)
        face.load().then(loaded => {
          if (!alive) return
          document.fonts.add(loaded)
          setFontStatus(current => ({ ...current, [font.code]: 'ready' }))
        }).catch(() => { if (alive) setFontStatus(current => ({ ...current, [font.code]: 'error' })) })
      } else if (font.cssUrl && font.fontFamily && font.fontWeight) {
        const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = font.cssUrl
        link.onload = () => document.fonts.load(`${font.italic ? 'italic ' : ''}${font.fontWeight} 20px "${font.fontFamily}"`, 'An Nhiên').then(faces => {
          if (alive) setFontStatus(current => ({ ...current, [font.code]: faces.length ? 'ready' : 'error' }))
        }).catch(() => { if (alive) setFontStatus(current => ({ ...current, [font.code]: 'error' })) })
        link.onerror = () => { if (alive) setFontStatus(current => ({ ...current, [font.code]: 'error' })) }
        document.head.append(link); links.push(link)
      }
    }
    return () => { alive = false; links.forEach(link => link.remove()) }
  }, [fontCatalog])
  useEffect(() => {
    const controller = new AbortController()
    // oxlint-disable-next-line react/set-state-in-effect -- reset resource-specific state while loading a different product
    setProduct(null); setLoading(true); setError(''); setNotice(''); setQuantity(1); setEngravingEnabled(false); setEngravingText(''); setActiveImage(0)
    if (!id || (!isUuid(id) && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))) { setError('Không tìm thấy sản phẩm.'); setLoading(false); return () => controller.abort() }
    api<EngravingFontInfo[]>('/api/engraving-fonts', controller.signal).then(items => { if (!controller.signal.aborted) setFontCatalog(items) }).catch(() => {})
    api<ProductDetail>(isUuid(id) ? `/api/products/${id}` : `/api/products/by-slug/${encodeURIComponent(id)}`, controller.signal).then(value => {
      if (isUuid(id) && value.slug) { navigate(`/shop/${encodeURIComponent(value.slug)}`, { replace: true }); return }
      setProduct(value); setEngravingFont(value.engraving.fonts[0] || ''); setEngravingPosition(value.engraving.positions[0]?.code || '')
      setActiveImage(Math.max(0, value.images.findIndex(image => image.primary)))
    }).catch((cause: Error) => { if (!controller.signal.aborted) setError(cause.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [id, retry, navigate])
  const imageCount = product?.images.length ?? 0
  useEffect(() => {
    const selected = document.querySelector<HTMLElement>('.pdp-gallery__thumbs .is-active')
    const strip = selected?.parentElement
    if (selected && strip && selected.offsetLeft < strip.scrollLeft) strip.scrollTo({ left: selected.offsetLeft, behavior: 'smooth' })
    if (selected && strip && selected.offsetLeft + selected.offsetWidth > strip.scrollLeft + strip.clientWidth)
      strip.scrollTo({ left: selected.offsetLeft + selected.offsetWidth - strip.clientWidth, behavior: 'smooth' })
  }, [activeImage, product])
  if (loading || !product) return <article className="pdp"><div className="pdp__inner">
    {loading ? <p role="status">Đang tải sản phẩm…</p> : <p role="alert">{error} <button type="button" onClick={() => setRetry(v => v + 1)}>Thử lại</button></p>}
    <button type="button" className="pdp-back" onClick={() => navigate('/shop')}><ChevronLeft size={17} />Quay lại</button>
  </div></article>
  const fonts = product.engraving.fonts.filter(code => fontCatalog.some(font => font.code === code)).map(code => {
    const item = fontCatalog.find(font => font.code === code)!
    const fallback = FONT_STYLES[code as keyof typeof FONT_STYLES]
    return { id: code, label: item.name, family: item.fileUrl ? `"engraving-${code}"` : item.cssUrl && item.fontFamily ? `"${item.fontFamily}"` : fallback?.family ?? 'serif', style: item.cssUrl ? { fontStyle: item.italic ? 'italic' as const : 'normal' as const } : fallback?.style ?? {}, fontWeight: item.fontWeight, fileUrl: item.fileUrl, cssUrl: item.cssUrl }
  })
  const positions = product.engraving.positions.map(position => ({ id: position.code, label: POSITION_LABELS[position.code] || position.code,
    maxChars: Math.min(position.maxChars ?? Infinity, product.engraving.maxChars ?? Infinity) }))
  const positionConfig = positions.find(position => position.id === engravingPosition)
  const maxChars = positionConfig?.maxChars ?? Infinity
  const selectedFont = fonts.find(font => font.id === engravingFont) ?? fonts[0] ?? { id: '', label: '', family: 'serif', style: {} }
  const normalized = engravingText.normalize('NFC').trim()
  const selectedLoading = 'fileUrl' in selectedFont && !!(selectedFont.fileUrl || selectedFont.cssUrl) && fontStatus[selectedFont.id] !== 'ready'
  const valid = !engravingEnabled || (positionConfig && selectedFont.id && !selectedLoading && normalized.length > 0 && Array.from(normalized).length <= maxChars)
  const disabled = cartBusy || product.stock === 0 || quantity > product.stock || !valid
  const engravingFee = engravingEnabled ? product.engraving.unitFee : 0
  const totalPrice = (product.price + engravingFee) * quantity
  const previewLabel = engravingText || 'Vân Mộc'
  const active = product.images[activeImage]
  const changeImage = (dir: -1 | 1) => { if (imageCount) setActiveImage(cur => (cur + dir + imageCount) % imageCount) }
  const addProductToCart = async (buyNow = false) => {
    try {
       await addItem({ id: product.id, name: product.name, price: product.price, stock: product.stock, image: (active?.mediaType !== 'VIDEO' ? active?.url : product.images.find(image => image.mediaType !== 'VIDEO')?.url) || '' }, quantity,
         engravingEnabled ? { text: normalized, font: selectedFont.id, position: engravingPosition, fee: product.engraving.unitFee } : undefined)
      setNotice('Đã thêm vào giỏ hàng.')
        if (buyNow) navigate('/checkout', { state: { productId: product.id } })
    } catch (cause) { setNotice((cause as Error).message) }
  }
  return <article className="pdp">
    <div className="pdp__grain" aria-hidden />
    <svg className="pdp__motif pdp__motif--left" viewBox="0 0 220 340" fill="none" aria-hidden>
      <path d="M16 329C45 242 92 161 185 51M66 231c-36-35-39-78-11-113 35 27 42 64 17 105M112 157c31-30 64-38 98-18-22 38-53 48-93 28" />
      <path d="M45 283c-27-7-41-25-40-52 28 3 45 18 47 45M150 94c-17-29-13-54 12-75 25 25 24 51-3 77" />
    </svg>
    <svg className="pdp__motif pdp__motif--right" viewBox="0 0 220 430" fill="none" aria-hidden>
      <path d="M204 8C147 95 104 195 87 419M158 93c-14-38-5-69 28-92 26 36 18 68-23 98M122 174c38-32 73-36 105-11-27 40-62 46-102 19" />
      <path d="M99 268c-39-29-76-28-108 3 34 34 71 35 109 6M90 350c35-20 67-16 93 13-31 31-63 30-94-4" />
    </svg>
    <div className="pdp__inner">
      <button type="button" className="pdp-back" onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/shop')}><ChevronLeft size={17} aria-hidden />Quay lại</button>
      <div className="pdp-layout">
        <section className="pdp-gallery" aria-label="Ảnh và video sản phẩm">
          <div className="pdp-gallery__main">
            {active ? active.mediaType === 'VIDEO' ? <video key={active.id} src={active.url} controls playsInline preload="metadata" aria-label={`Video ${product.name}`} /> : <GalleryImage key={active.id} src={active.url} alt={active.altText || product.name} /> : <span className="pdp-gallery__fallback">Chưa có ảnh</span>}
            {imageCount > 1 && <><button type="button" className="pdp-gallery__arrow pdp-gallery__arrow--prev" onClick={() => changeImage(-1)} aria-label="Ảnh trước"><ChevronLeft size={20} /></button>
            <button type="button" className="pdp-gallery__arrow pdp-gallery__arrow--next" onClick={() => changeImage(1)} aria-label="Ảnh tiếp"><ChevronRight size={20} /></button></>}
          </div>
          <div className="pdp-gallery__thumbs" role="list">{product.images.map((image, index) => <button role="listitem" type="button" key={image.id}
            className={activeImage === index ? 'is-active' : ''} onClick={() => setActiveImage(index)} aria-label={`Xem ${image.mediaType === 'VIDEO' ? 'video' : 'ảnh'} ${index + 1}`} aria-pressed={activeImage === index}>
             {image.mediaType === 'VIDEO' ? <span className="pdp-video-thumb"><video src={`${image.url}#t=0.1`} preload="metadata" muted playsInline aria-hidden="true" /><Play size={22} fill="currentColor" aria-hidden="true" /></span> : <GalleryImage key={image.url} src={image.url} alt={`${product.name} ${index + 1}`} />}</button>)}</div>
        </section>
        <section className="pdp-info" aria-label="Thông tin sản phẩm">
          <h1 className="pdp-info__title">{product.name}</h1>
          <div className="pdp-info__price-row"><p className="pdp-info__price">{formatPrice(product.price)}</p>
            <p className={`pdp-info__stock ${product.stock <= 10 ? 'is-low' : ''}`}>{product.stock === 0 ? 'Hết hàng' : product.stock <= 10 ? `Chỉ còn ${product.stock}` : `Còn lại ${product.stock}`}</p></div>
          <p className="pdp-info__desc">{product.description}</p>
          <dl className="pdp-specs"><div><dt>Chất liệu</dt><dd>{product.material}</dd></div><div><dt>Xuất xứ</dt><dd>Làng nghề Thụy Ứng, Hà Nội</dd></div><div><dt>Mã SKU</dt><dd>{product.code}</dd></div></dl>
          <p className="pdp-microcopy">Mỗi sản phẩm có sắc độ và đường vân riêng do đặc tính tự nhiên của sừng.</p>
          {product.engraving.enabled && <div className="pdp-engraving">
            <div className="pdp-engraving__header"><div className="pdp-engraving__toggle-row">
              <label className="pdp-engraving__toggle" htmlFor="engraving-switch"><input id="engraving-switch" type="checkbox" role="switch" checked={engravingEnabled} onChange={event => setEngravingEnabled(event.target.checked)} />
                <span className="pdp-engraving__toggle-track" aria-hidden /><span className="pdp-engraving__toggle-label">Khắc tên lên sản phẩm</span></label>
              <span className="pdp-engraving__fee-badge">+ {formatPrice(product.engraving.unitFee)}</span>
            </div></div>
            {engravingEnabled && <div className="pdp-engraving__body">
              <div className="pdp-field"><label className="pdp-field__label" htmlFor="engraving-text">Nội dung cần khắc</label>
                <div className="pdp-field__input-wrap"><input id="engraving-text" type="text" className="pdp-field__input" value={engravingText}
                  onChange={event => setEngravingText(event.target.value)} placeholder="Nhập nội dung..." aria-describedby="engraving-hint" />
                  <span className={`pdp-field__counter ${Array.from(normalized).length >= maxChars ? 'is-max' : ''}`} aria-live="polite">{Array.from(normalized).length}/{Number.isFinite(maxChars) ? maxChars : '∞'}</span></div>
                <p className="pdp-field__hint" id="engraving-hint">{Number.isFinite(maxChars) ? `Tối đa ${maxChars} ký tự. ` : ''}Không để trống; không dùng emoji hoặc ký tự điều khiển.</p>
              </div>
              <div className="pdp-field"><label className="pdp-field__label" htmlFor="engraving-position-select">Vị trí khắc</label>
                <div className="pdp-select-wrap"><select id="engraving-position-select" className="pdp-field__select" value={engravingPosition} onChange={event => setEngravingPosition(event.target.value)}>
                  {positions.map(position => <option key={position.id} value={position.id}>{position.label}</option>)}</select><ChevronDown className="pdp-select-icon" aria-hidden /></div>
              </div>
              <div className="pdp-field"><p className="pdp-field__label" id="font-group-label">Chọn font chữ</p>
                <div className="pdp-font-grid" role="radiogroup" aria-labelledby="font-group-label">{fonts.map(font => <label key={font.id} className={`pdp-font-card ${selectedFont.id === font.id ? 'is-selected' : ''}`}>
                  <input type="radio" name="engraving-font" value={font.id} checked={selectedFont.id === font.id} disabled={!!(font.fileUrl || font.cssUrl) && fontStatus[font.id] !== 'ready'} onChange={() => setEngravingFont(font.id)} className="sr-only" />
                  <span className="pdp-font-card__preview" style={(font.fileUrl || font.cssUrl) && fontStatus[font.id] !== 'ready' ? undefined : { fontFamily: font.family, fontWeight: font.fontWeight ?? undefined, ...font.style }} aria-hidden>{(font.fileUrl || font.cssUrl) && fontStatus[font.id] !== 'ready' ? fontStatus[font.id] === 'error' ? 'Không tải được font' : 'Đang tải font…' : previewLabel}</span><span className="pdp-font-card__name">{font.label}</span></label>)}</div>
              </div>
              <div className="pdp-field"><div className="pdp-field__label-row"><span className="pdp-field__label">Xem trước nét khắc</span><span className="pdp-preview__badge">{positionConfig?.label}</span></div>
                <div className="pdp-preview" aria-label="Xem trước khắc tên"><div className="pdp-preview__surface"><div className="pdp-preview__grain-lines" aria-hidden />
                  <span className="pdp-preview__text" style={selectedLoading ? undefined : { fontFamily: selectedFont.family, fontWeight: 'fontWeight' in selectedFont ? selectedFont.fontWeight ?? undefined : undefined, ...selectedFont.style }}>{selectedLoading ? fontStatus[selectedFont.id] === 'error' ? 'Không tải được font' : 'Đang tải font…' : previewLabel}</span></div></div>
                <p className="pdp-field__hint">Chi tiết khắc được thực hiện thủ công bởi nghệ nhân làng nghề Thụy Ứng.</p>
              </div>
            </div>}
          </div>}
          <div className="pdp-breakdown"><div className="pdp-breakdown__row"><span>Giá sản phẩm</span><span>{formatPrice(product.price)}</span></div>
            {engravingEnabled && <div className="pdp-breakdown__row"><span>Phí khắc tên / chiếc</span><span>+ {formatPrice(product.engraving.unitFee)}</span></div>}
            {quantity > 1 && <div className="pdp-breakdown__row"><span>Số lượng</span><span>× {quantity}</span></div>}
            <div className="pdp-breakdown__row pdp-breakdown__row--total"><span>Tạm tính</span><span>{formatPrice(totalPrice)}</span></div>
          </div>
          <div className="pdp-quantity"><span className="pdp-quantity__label">Số lượng</span><div className="pdp-quantity__control" role="group" aria-label="Chọn số lượng">
            <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Giảm số lượng" disabled={quantity <= 1}><Minus size={15} /></button>
            <output aria-live="polite">{quantity}</output><button type="button" disabled={quantity >= product.stock} onClick={() => setQuantity(q => q + 1)} aria-label="Tăng số lượng"><Plus size={15} /></button>
          </div></div>
          <div className="pdp-actions"><button type="button" className="pdp-cta pdp-cta--cart" disabled={Boolean(disabled)} onClick={() => void addProductToCart()}><ShoppingCart size={20} />Thêm vào giỏ hàng</button>
             <button type="button" className="pdp-cta shop-product-card__buy-now" disabled={Boolean(disabled)} onClick={() => void addProductToCart(true)}>{product.stock === 0 ? 'Hết hàng' : 'Mua ngay'}</button></div>
          {notice && <p role="status">{notice}</p>}
          <div className="pdp-assurances"><div><Truck size={22} aria-hidden /><span><strong>Giao hàng toàn quốc</strong>3–5 ngày làm việc</span></div>
            <div><Gift size={22} aria-hidden /><span><strong>Sản phẩm thủ công</strong>Đóng gói trang nhã</span></div><div><ShieldCheck size={22} aria-hidden /><span><strong>Hỗ trợ đổi trả</strong>Trong 7 ngày</span></div></div>
        </section>
      </div>
    </div>
    <div className="pdp-sticky-bar" aria-label="Thêm vào giỏ hàng nhanh"><div className="pdp-sticky-bar__price"><PackageCheck size={15} aria-hidden />{formatPrice(totalPrice)}
      {engravingEnabled && <span className="pdp-sticky-bar__engraving-note">(bao gồm phí khắc)</span>}</div>
      <button type="button" className="pdp-sticky-bar__btn" disabled={Boolean(disabled)} onClick={() => void addProductToCart()}><ShoppingCart size={17} />Thêm vào giỏ</button>
    </div>
  </article>
}
